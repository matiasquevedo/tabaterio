<template>
  <div class="timer-container p-4 bg-zinc-900 rounded-lg border border-zinc-800">

    <div v-if="isTabataMode" class="flex justify-center gap-8 mb-4">
      <div v-if="currentPhase === 'prepare'" class="text-center p-2 rounded-md bg-yellow-900/40 ring-1 ring-yellow-500 w-64 transition-all">
        <div class="text-xs uppercase text-yellow-400 font-bold tracking-widest">¡Prepárate!</div>
        <div class="text-3xl font-mono text-white">{{ remainingTime }}</div>
      </div>

      <template v-else>
        <div :class="['text-center p-2 rounded-md transition-all w-32', currentPhase === 'work' ? 'bg-green-900/40 ring-1 ring-green-500' : 'opacity-40']">
          <div class="text-xs uppercase text-green-400 font-bold">Trabajando</div>
          <div class="text-2xl font-mono text-white">{{ formatCountdown(remainingTime) }}</div>
        </div>
        
        <div :class="['text-center p-2 rounded-md transition-all w-32', currentPhase === 'pause' ? 'bg-blue-900/40 ring-1 ring-blue-500' : 'opacity-40']">
          <div class="text-xs uppercase text-blue-400 font-bold">Descanso</div>
          <div class="text-2xl font-mono text-white">{{ formatCountdown(remainingTime) }}</div>
        </div>
      </template>
    </div>

    <div v-else class="flex justify-center mb-4">
      <div class="bg-zinc-800 text-zinc-400 px-4 py-1 rounded-full text-xs uppercase tracking-widest border border-zinc-700">
        Modo Cronómetro Continuo
      </div>
    </div>

    <n-form
      ref="formRef"
      inline
      :model="formValue"
      :rules="rules"
      size="large"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <n-form-item path="description" class="flex-grow">
        <n-input v-model:value="formValue.description" :disabled="run" placeholder="¿Qué estás haciendo?" />
      </n-form-item>

      <n-form-item>
        <AddProjectButton 
          :disabled="run"
          @select-project="(n) => formValue.project = n"
          @select-task="(t) => formValue.task = t" 
        />
      </n-form-item>

      <n-form-item>
        <AddTagSelect 
          :disabled="run"
          @select-tag="(n) => formValue.tag = n"
        />
      </n-form-item>

      <n-form-item label="Trabajo">
        <n-input-number v-model:value="formValue.work" :min="0" :disabled="run" style="width: 85px" placeholder="Min" />
      </n-form-item>

      <n-form-item label="Pausa">
        <n-input-number v-model:value="formValue.pause" :min="0" :disabled="run" style="width: 85px" placeholder="Min" />
      </n-form-item>

      <n-form-item>
        <n-switch v-model:value="formValue.non_billable" :disabled="run">
          <template #icon>💲</template>
        </n-switch>
      </n-form-item>

      <n-form-item>
        <span :class="['text-xl font-mono font-bold transition-colors', run ? 'text-green-500' : 'text-zinc-600']">
          {{ formattedTotalTime }}
        </span>
      </n-form-item>

      <n-form-item>
        <n-button 
          @click="handleToggle" 
          :type="run ? 'error' : 'primary'"
          :loading="formValue.processing"
          class="w-24"
          strong
          secondary
        >
          {{ run ? 'Stop' : 'Start' }}
        </n-button>
      </n-form-item>
    </n-form>

    <div class="flex justify-between items-center mt-4 px-2 text-[10px] text-zinc-600">
      <div class="flex gap-4">
        <span>Modo: {{ isTabataMode ? 'Tabata' : 'Infinito' }}</span>
        <span v-if="currentEntryId" class="text-blue-500">Sincronizado: {{ currentEntryId }}</span>
      </div>
      <span v-if="run">Estado: {{ currentPhase }} | Restante: {{ remainingTime }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useTimeoutPoll } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import { formatISO } from 'date-fns'
import AddProjectButton from '@/components/time_entries/AddProjectButton.vue'
import AddTagSelect from '@/components/time_entries/AddTagSelect.vue'
import pb from '@/lib/pocketbase'

import StartSound from '@/assets/sounds/start.mp3'
import EndSound from '@/assets/sounds/end.mp3'

// --- SONIDOS ---
const { play: playPrepSound } = useSound(StartSound)
const { play: playWorkEnding } = useSound(EndSound)

// --- ESTADO ---
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const run = ref(false)
const currentPhase = ref<'prepare' | 'work' | 'pause'>('work')
const remainingTime = ref(0) 
const currentEntryId = ref<string | null>(null) // ID del registro en PocketBase
const autoSaveCounter = ref(0) // Para guardar cada 30 segundos

const formValue = ref({
  description: '',
  duration: 0, 
  start: null as string | null,
  end: null as string | null,
  work: 20,    
  pause: 5,    
  non_billable: false,
  project: null,
  task: null,
  tag: null,
  processing: false,
})

const rules = { description: { required: false } }

// --- LÓGICA COMPUTADA ---

const isTabataMode = computed(() => {
  return (formValue.value.work ?? 0) > 0 && (formValue.value.pause ?? 0) > 0
})

const formattedTotalTime = computed(() => {
  const s = formValue.value.duration
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
})

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// --- EL CORAZÓN DEL TIMER ---

async function tick() {
  // 1. Incrementar tiempo y auto-guardado
  if (!isTabataMode.value || currentPhase.value === 'work') {
    formValue.value.duration++
    autoSaveCounter.value++
    
    // Auto-guardado cada 30 segundos para evitar pérdida de datos
    if (autoSaveCounter.value >= 30) {
      updateEntryInDB()
      autoSaveCounter.value = 0
    }
  }

  // 2. Lógica de Modos
  if (!isTabataMode.value) return

  if (currentPhase.value === 'prepare') {
    if (remainingTime.value === 3) playPrepSound()
    remainingTime.value--
    if (remainingTime.value <= 0) {
      currentPhase.value = 'work'
      remainingTime.value = formValue.value.work * 60
      message.success('¡A trabajar!')
    }
  } else if (remainingTime.value > 0) {
    remainingTime.value--
    if (remainingTime.value === 3) {
       currentPhase.value === 'work' ? playWorkEnding() : playPrepSound()
    }
  } else {
    // Cambio de fase
    if (currentPhase.value === 'work') {
      currentPhase.value = 'pause'
      remainingTime.value = formValue.value.pause * 60
      message.warning('Descanso...')
    } else {
      currentPhase.value = 'work'
      remainingTime.value = formValue.value.work * 60
      message.success('¡A trabajar!')
    }
  }
}

const { resume, pause } = useTimeoutPoll(tick, 1000, { immediate: false })

// --- ACCIONES DE POCKETBASE ---

const handleToggle = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    if (!run.value) {
      await startSession()
    } else {
      await stopSession()
    }
  })
}

const startSession = async () => {
  formValue.value.processing = true
  try {
    formValue.value.start = formatISO(new Date())
    
    // Crear registro INICIAL en PocketBase
    const record = await pb.collection('time_entries').create({
      ...formValue.value,
      end: null, // Sigue en curso
      duration: 0
    })
    
    currentEntryId.value = record.id
    run.value = true
    
    if (isTabataMode.value) {
      currentPhase.value = 'prepare'
      remainingTime.value = 3
    }
    
    resume()
    message.info('Sesión iniciada y registrada')
  } catch (e) {
    message.error('Error al iniciar sesión en el servidor')
  } finally {
    formValue.value.processing = false
  }
}

const stopSession = async () => {
  formValue.value.processing = true
  pause()
  try {
    formValue.value.end = formatISO(new Date())
    
    // Actualizar registro FINAL
    if (currentEntryId.value) {
      await updateEntryInDB()
      message.success('Sesión finalizada correctamente')
    }
    resetForm()
  } catch (e) {
    message.error('Error al cerrar sesión')
    // Si falla, permitimos que el usuario intente 'Stop' de nuevo
    resume() 
  } finally {
    run.value = false
    formValue.value.processing = false
  }
}

const updateEntryInDB = async () => {
  if (!currentEntryId.value) return
  try {
    await pb.collection('time_entries').update(currentEntryId.value, {
      duration: formValue.value.duration,
      end: formValue.value.end,
      description: formValue.value.description
    })
  } catch (e) {
    console.error("Error en auto-guardado", e)
  }
}

const resetForm = () => {
  formValue.value.duration = 0
  formValue.value.description = ''
  currentEntryId.value = null
  autoSaveCounter.value = 0
  remainingTime.value = 0
  currentPhase.value = 'work'
}

onUnmounted(() => pause())
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
</style>