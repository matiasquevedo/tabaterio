<template>
  <div class="w-full mx-auto py-8 transition-all duration-500 flex flex-col items-center">

    <div class="flex flex-col sm:flex-row justify-between items-center w-full gap-4 mb-12 px-2">
      
      <div v-if="isTabataMode" class="flex items-center gap-3">
        <div 
          class="px-4 py-2 rounded-2xl transition-all duration-500 border"
          :class="[
            currentPhase === 'prepare' ? 'bg-[#74c69d]/10 border-[#74c69d]/20 text-[#74c69d]' : 
            currentPhase === 'work' ? 'bg-[#e07a5f]/10 border-[#e07a5f]/20 text-[#e07a5f]' : 
            'bg-[#52b788]/10 border-[#52b788]/20 text-[#52b788]'
          ]"
        >
          <span class="text-xs font-black tracking-widest uppercase flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
            {{ currentPhase === 'prepare' ? 'Prepárate' : currentPhase === 'work' ? 'Trabajo' : 'Descanso' }}
          </span>
        </div>
      </div>

      <div v-else class="flex items-center gap-2 bg-[#1e2824] px-4 py-2 rounded-full border border-white/[0.03]">
        <span class="h-1.5 w-1.5 rounded-full bg-[#9db4a9]"></span>
        <span class="text-xs font-bold text-[#9db4a9] tracking-wider uppercase">Cronómetro</span>
      </div>

      <div class="flex items-center gap-5 text-xs font-bold text-[#9db4a9] tracking-wider uppercase">
        <span class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full" :class="isActive ? 'bg-[#52b788]' : 'bg-[#2a3832]'"></span>
          Mantener encendido
        </span>
        <span v-if="currentEntryId" class="flex items-center gap-2 text-[#52b788]">
          <span class="h-1.5 w-1.5 rounded-full bg-[#52b788]"></span>
          Sincronizado
        </span>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center mb-16 py-4 relative w-full">
      
      <div 
        class="absolute inset-0 blur-[120px] opacity-25 transition-all duration-1000 rounded-full"
        :class="[
          !run ? 'bg-transparent' :
          currentPhase === 'prepare' ? 'bg-[#74c69d]' :
          currentPhase === 'work' ? 'bg-[#e07a5f]' : 'bg-[#52b788]'
        ]"
      ></div>

      <div class="relative z-10 flex flex-col items-center">
        <span 
          class="font-mono text-9xl md:text-[11rem] font-black tracking-tightest transition-all duration-500 drop-shadow-2xl"
          :class="[
            !run ? 'text-[#2a3832]' :
            currentPhase === 'prepare' ? 'text-[#74c69d]' :
            currentPhase === 'work' ? 'text-[#e07a5f]' : 'text-[#52b788]'
          ]"
        >
          {{ isTabataMode ? formatCountdown(remainingTime) : formattedTotalTime }}
        </span>
        
        <span v-if="isTabataMode && run" class="font-mono text-sm font-bold text-[#9db4a9] mt-4 tracking-widest bg-[#1e2824]/60 px-4 py-1.5 rounded-full border border-white/[0.02]">
          Total acumulado: {{ formattedTotalTime }}
        </span>
      </div>
    </div>

    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      size="large"
      class="w-full bg-[#1e2824]/80 p-4 rounded-3xl shadow-lg backdrop-blur-md"
    >
      <div class="flex flex-nowrap items-center justify-between gap-4">
        
        <div class="flex-grow max-w-[350px]">
          <n-form-item path="description" :show-label="false" class="!mb-0">
            <n-input 
              v-model:value="formValue.description" 
              :disabled="run" 
              placeholder="¿En qué vas a trabajar?" 
              class="rounded-xl h-12 flex items-center !bg-[#151d1a] border-none font-medium"
              clearable
            /> 
          </n-form-item>
        </div>

        <div class="flex-shrink-0">
          <n-form-item :show-label="false" class="!mb-0">
            <AddProjectButton 
              :disabled="run"
              @select-project="(n) => formValue.project = n"
              @select-task="(t) => formValue.task = t" 
            />
          </n-form-item>
        </div>

        <div class="flex-grow max-w-[140px]">
          <n-form-item :show-label="false" class="!mb-0">
            <AddTagSelect 
              :disabled="run"
              @select-tag="(n) => formValue.tag = n"
            />
          </n-form-item>
        </div>

        <div class="flex flex-shrink-0 items-center gap-2">
          <n-form-item :show-label="false" class="!mb-0">
            <n-input-number v-model:value="formValue.work" :min="0" :disabled="run" class="w-14 rounded-lg !bg-transparent border-none text-center" :show-button="false" placeholder="Min" />
          </n-form-item>
          <n-form-item :show-label="false" class="!mb-0">
            <n-input-number v-model:value="formValue.pause" :min="0" :disabled="run" class="w-14 rounded-lg !bg-transparent border-none text-center" :show-button="false" placeholder="Min" />
          </n-form-item>
        </div>

        <div class="flex-shrink-0 ">
          <n-form-item :show-label="false">
            <n-switch v-model:value="formValue.non_billable" :disabled="run">
              <template #icon>💲</template>
            </n-switch>
          </n-form-item>
        </div>

        <div class="flex-shrink-0">
          <n-form-item :show-label="false" >
            <n-button 
              @click="handleToggle" 
              :loading="formValue.processing"
              class="rounded-xl h-12 px-8 font-black text-sm tracking-widest uppercase transition-all duration-300 border-none"
              :class="[
                run 
                ? 'bg-[#52b788] hover:bg-[#74c69d] text-[#151d1a] shadow-[#52b788]/20' 
                : 'bg-[#e07a5f] hover:bg-[#f28b70] text-white shadow-[#e07a5f]/20'
              ]"
            >
              {{ run ? 'Parar' : 'Empezar' }}
            </n-button>
          </n-form-item>
        </div>

      </div>
    </n-form>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useTimeoutPoll, useWakeLock, onKeyStroke, useFavicon } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import AddProjectButton from '@/components/time_entries/AddProjectButton.vue'
import AddTagSelect from '@/components/time_entries/AddTagSelect.vue'
import pb from '@/lib/pocketbase'
import { useTimerStore } from '@/stores/timer'

// Assets
import StartSound from '@/assets/sounds/start.mp3'
import EndSound from '@/assets/sounds/end.mp3'
import IcoPause from '@/assets/icopause.png'
import IcoWork from '@/assets/icowork.png'

const store = useTimerStore()
const { execute, setPhase } = store

onKeyStroke('s', async (e) => {
  const target = e.target as HTMLElement;
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

  if (run.value && !isInput) {
    e.preventDefault()
    await stopSession()
    execute()
  }
})

const { isSupported, isActive, request, release } = useWakeLock()

const { play: playPrepSound } = useSound(StartSound)
const { play: playWorkEnding } = useSound(EndSound)

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const run = ref(false)
const currentPhase = ref<'prepare' | 'work' | 'pause'>('work')
const remainingTime = ref(0) 
const currentEntryId = ref<string | null>(null)
const autoSaveCounter = ref(0)

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

const isTabataMode = computed(() => {
  return (formValue.value.work ?? 0) > 0 && (formValue.value.pause ?? 0) > 0
})

const favicon = computed(() => {
  if (!run.value) return '/favicon.ico' 
  if (currentPhase.value === 'pause') return IcoPause
  return IcoWork 
})
useFavicon(favicon)

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

async function tick() {
  if (!isTabataMode.value || currentPhase.value === 'work') {
    formValue.value.duration++
    autoSaveCounter.value++
    if (autoSaveCounter.value >= 30) {
      updateEntryInDB()
      autoSaveCounter.value = 0
    }
  }

  if (!isTabataMode.value) return

  if (currentPhase.value === 'prepare') {
    if (remainingTime.value === 3) playPrepSound()
    remainingTime.value--
    if (remainingTime.value <= 0) {
      currentPhase.value = 'work'
      setPhase('work')
      remainingTime.value = formValue.value.work * 60
      message.success('¡A trabajar!')
    }
  } else if (remainingTime.value > 0) {
    remainingTime.value--
    if (remainingTime.value === 3) {
      currentPhase.value === 'work' ? playWorkEnding() : playPrepSound()
    }
  } else {
    if (currentPhase.value === 'work') {
      currentPhase.value = 'pause'
      setPhase('pause')
      remainingTime.value = formValue.value.pause * 60
      message.warning('Descanso...')
    } else {
      currentPhase.value = 'work'
      setPhase('work')
      remainingTime.value = formValue.value.work * 60
      message.success('¡A trabajar!')
    }
  }
}

const { resume, pause } = useTimeoutPoll(tick, 1000, { immediate: false })

const handleToggle = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    if (!run.value) {
      await startSession()
    } else {
      await stopSession()
    }
    execute() 
  })
}

const startSession = async () => {
  formValue.value.processing = true
  try {
    if (isSupported.value) await request('screen')

    formValue.value.start = new Date().toISOString()
    
    const record = await pb.collection('time_entries').create({
      ...formValue.value,
      end: null,
      duration: 0
    })
    
    currentEntryId.value = record.id
    run.value = true
    
    if (isTabataMode.value) {
      currentPhase.value = 'prepare'
      setPhase('prepare')
      remainingTime.value = 3
    } else {
      currentPhase.value = 'work'
      setPhase('work')
    }
    
    resume()
    message.info('Sesión iniciada')
  } catch (e) {
    message.error('Error al iniciar sesión')
  } finally {
    formValue.value.processing = false
  }
}

const stopSession = async () => {
  formValue.value.processing = true
  pause()
  try {
    if (isSupported.value && isActive.value) await release()

    formValue.value.end = new Date().toISOString()
    if (currentEntryId.value) {
      await updateEntryInDB()
    }
    resetForm()
    setPhase('stop')
  } catch (e) {
    message.error('Error al guardar sesión')
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
    console.error("Error auto-save", e)
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

onUnmounted(() => {
  pause()
  if (isActive.value) release()
})
</script>