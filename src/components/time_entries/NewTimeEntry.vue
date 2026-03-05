<template>
  <div class="timer-container p-4 bg-zinc-900 rounded-lg border border-zinc-800">

    <div v-if="isTabataMode" class="flex justify-center gap-8 mb-4">
      <div :class="['text-center p-2 rounded-md transition-all w-32', currentPhase === 'work' ? 'bg-green-900/40 ring-1 ring-green-500' : 'opacity-40']">
        <div class="text-xs uppercase text-green-400 font-bold">Trabajando</div>
        <div class="text-2xl font-mono text-white">{{ formatCountdown(remainingTime) }}</div>
      </div>
      
      <div :class="['text-center p-2 rounded-md transition-all w-32', currentPhase === 'pause' ? 'bg-blue-900/40 ring-1 ring-blue-500' : 'opacity-40']">
        <div class="text-xs uppercase text-blue-400 font-bold">Descanso</div>
        <div class="text-2xl font-mono text-white">{{ formatCountdown(remainingTime) }}</div>
      </div>
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
        <n-input v-model:value="formValue.description" placeholder="¿Qué estás haciendo?" />
      </n-form-item>

      <n-form-item>
        <AddProjectButton 
          @select-project="(n) => formValue.project = n"
          @select-task="(t) => formValue.task = t" 
        />
      </n-form-item>

      <div class="flex gap-2 items-center">
        <n-form-item label="Trabajo" label-placement="left">
          <n-input-number v-model:value="formValue.work" :min="0" :disabled="run" style="width: 85px" placeholder="Min" />
        </n-form-item>
        <n-form-item label="Pausa" label-placement="left">
          <n-input-number v-model:value="formValue.pause" :min="0" :disabled="run" style="width: 85px" placeholder="Min" />
        </n-form-item>
      </div>

      <n-form-item>
        <n-switch v-model:value="formValue.non_billable">
          <template #icon>💲</template>
        </n-switch>
      </n-form-item>

      <div class="flex flex-col items-end px-4 min-w-[100px]">
        <span class="text-[10px] text-zinc-500 uppercase">Tiempo Total</span>
        <span :class="['text-xl font-mono font-bold transition-colors', run ? 'text-green-500' : 'text-zinc-600']">
          {{ formattedTotalTime }}
        </span>
      </div>

      <n-form-item>
        <n-button 
          @click="handleToggle" 
          :type="run ? 'error' : 'primary'"
          class="w-24"
          strong
          secondary
        >
          {{ run ? 'Stop' : 'Start' }}
        </n-button>
      </n-form-item>
    </n-form>

    <div class="flex justify-between items-center mt-4 px-2 text-[10px] text-zinc-600">
      <span>Modo: {{ isTabataMode ? 'Tabata (Ciclos)' : 'Infinito' }}</span>
      <span v-if="run">Fase: {{ currentPhase }} | Segundos restantes: {{ remainingTime }}s</span>
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
import pb from '@/lib/pocketbase'

// IMPORTANTE: Asegúrate de que las rutas a los sonidos sean correctas
import StartSound from '@/assets/sounds/start.mp3'
import EndSound from '@/assets/sounds/end.mp3'

// --- SONIDOS ---
const { play: playStart } = useSound(EndSound)
const { play: playEnd } = useSound(StartSound)

// --- ESTADO ---
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const run = ref(false)
const currentPhase = ref<'work' | 'pause'>('work')
const remainingTime = ref(0) 

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
  processing: false,
})

const rules = {
  description: { required: false }
}

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
  // MODO INFINITO
  if (!isTabataMode.value) {
    formValue.value.duration++
    return
  }

  // MODO TABATA
  if (remainingTime.value > 0) {
    remainingTime.value--

    // --- LÓGICA DE SONIDO ANTES DE ACABAR ---
    // Si quedan 3 segundos, disparamos el sonido
    if (remainingTime.value === 3) {
       if (currentPhase.value === 'work') {
         playStart() // Sonido de aviso que se acaba el trabajo
       } else {
         playEnd()   // Sonido de aviso que se acaba el descanso
       }
    }

    if (currentPhase.value === 'work') {
      formValue.value.duration++
    }
  } else {
    // Cambio de fase automático cuando llega a 0
    if (currentPhase.value === 'work') {
      currentPhase.value = 'pause'
      remainingTime.value = formValue.value.pause * 60
      message.warning('¡Descanso iniciado!')
    } else {
      currentPhase.value = 'work'
      remainingTime.value = formValue.value.work * 60
      message.success('¡A trabajar!')
    }
  }
}

const { resume, pause } = useTimeoutPoll(tick, 1000, { immediate: false })

// --- ACCIONES ---

const handleToggle = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    if (!run.value) {
      run.value = true
      formValue.value.start = formatISO(new Date())
      
      if (isTabataMode.value) {
        currentPhase.value = 'work'
        remainingTime.value = formValue.value.work * 60
      }
      
      resume()
      message.info(isTabataMode.value ? 'Ciclo iniciado' : 'Cronómetro iniciado')
    } else {
      run.value = false
      pause()
      formValue.value.end = formatISO(new Date())
      await saveEntry()
    }
  })
}

const saveEntry = async () => {
  formValue.value.processing = true
  try {
    const dataToSend = { ...formValue.value }
    await pb.collection('time_entries').create(dataToSend)
    message.success('Entrada guardada')
    resetForm()
  } catch (e) {
    console.error(e)
    message.error('Error al guardar')
  } finally {
    formValue.value.processing = false
  }
}

const resetForm = () => {
  formValue.value.duration = 0
  formValue.value.description = ''
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