<template>
  <n-button 
    secondary 
    class="rounded-xl font-bold tracking-wide h-10 px-5 !bg-[#2a3832] border border-white/[0.03] text-[#f4f9f4] hover:!bg-[#364941] shadow-sm hover:shadow-md transition-all duration-300" 
    @click="openModal"
  >
    <template #icon>
      <span class="text-xl font-bold">+</span>
    </template>
    Entrada Manual
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    preset="card"
    title="📝 Nueva Entrada de Tiempo"
    style="width: 750px"
    size="huge"
    class="rounded-3xl bg-[#1e2824] border border-white/[0.04] shadow-2xl"
  >
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      label-placement="top"
      class="space-y-4"
    >
      <n-form-item label="¿Qué estuviste haciendo?" path="description">
        <n-input 
          v-model:value="formValue.description" 
          placeholder="Ej: Reunión de diseño de interfaz o Planificación" 
          class="rounded-xl h-11 flex items-center bg-[#2a3832] border-none font-medium"
          clearable
        />
      </n-form-item>

      <div class="grid grid-cols-2 gap-4">
        <n-form-item label="Hora de Inicio">
          <n-input 
            v-model:value="startTimeRaw" 
            placeholder="08:30"
            class="rounded-xl h-11 flex items-center bg-[#2a3832] border-none font-medium"
            @blur="formatAndProcessTime('start')"
            @keyup.enter="formatAndProcessTime('start')"
          >
            <template #prefix>
              <span class="text-[#9db4a9] text-xs font-mono mr-1">HH:MM</span>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="Hora de Finalización">
          <n-input 
            v-model:value="endTimeRaw" 
            placeholder="12:00"
            class="rounded-xl h-11 flex items-center bg-[#2a3832] border-none font-medium"
            @blur="formatAndProcessTime('end')"
            @keyup.enter="formatAndProcessTime('end')"
          >
            <template #prefix>
              <span class="text-[#9db4a9] text-xs font-mono mr-1">HH:MM</span>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <div class="flex items-center justify-between bg-[#151d1a]/50 p-5 rounded-2xl border border-white/[0.02] shadow-inner">
        <div class="flex flex-col gap-1">
          <span class="text-[#f4f9f4] text-xs font-bold tracking-wider uppercase">Duración Calculada</span>
          <span class="text-[#9db4a9] text-xs">Ajuste automático de rango</span>
        </div>
        <div 
          class="text-3xl font-mono font-black transition-colors duration-300"
          :class="formValue.duration > 0 ? 'text-[#52b788]' : 'text-[#2a3832]'"
        >
          {{ formattedTotalTime }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <n-form-item label="Asignar Proyecto">
          <div class="w-full">
            <AddProjectButton 
              @select-project="(n) => formValue.project = n"
              @select-task="(t) => formValue.task = t" 
            />
          </div>
        </n-form-item>

        <n-form-item label="Etiqueta">
          <div class="w-full">
            <AddTagSelect @select-tag="(n) => formValue.tag = n" />
          </div>
        </n-form-item>
      </div>

      <n-form-item label="¿Es una tarea no facturable?">
        <n-switch v-model:value="formValue.non_billable">
          <template #icon>💲</template>
        </n-switch>
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="flex justify-end items-center gap-4 pt-2">
        <n-button 
          secondary 
          class="rounded-xl h-11 px-5 border border-white/[0.04] bg-[#2a3832] text-[#f4f9f4] hover:bg-[#364941]" 
          @click="showModal = false"
          :disabled="formValue.processing"
        >
          Cancelar
        </n-button>
        
        <n-button 
          type="primary" 
          class="rounded-xl h-11 px-6 font-bold tracking-wide !bg-[#52b788] hover:!bg-[#74c69d] border-none text-[#151d1a] shadow-lg shadow-[#52b788]/10"
          :loading="formValue.processing" 
          :disabled="formValue.duration <= 0"
          @click="submit"
          attr-type="submit"
        >
          Guardar Entrada
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage, type FormInst } from 'naive-ui'
import { startOfMinute, setHours, setMinutes } from 'date-fns'
import AddProjectButton from '@/components/time_entries/AddProjectButton.vue'
import AddTagSelect from '@/components/time_entries/AddTagSelect.vue'
import pb from '@/lib/pocketbase'

const message = useMessage()
const showModal = ref(false)
const formRef = ref<FormInst | null>(null)

const startTimeRaw = ref('')
const endTimeRaw = ref('')
const startTimeTs = ref<number | null>(null)
const endTimeTs = ref<number | null>(null)

const formValue = ref({
  description: '',
  duration: 0,
  start: null as string | null,
  end: null as string | null,
  non_billable: false,
  project: null,
  task: null,
  tag: null,
  processing: false,
})

const rules = {
  description: { required: false }
}

const openModal = () => {
  showModal.value = true
  startTimeRaw.value = ''
  endTimeRaw.value = ''
}

const formatAndProcessTime = (type: 'start' | 'end') => {
  let val = type === 'start' ? startTimeRaw.value : endTimeRaw.value
  val = val.replace(/\D/g, '')
  if (!val) return

  let hours = 0
  let minutes = 0

  if (val.length <= 2) {
    hours = parseInt(val)
  } else if (val.length === 3) {
    hours = parseInt(val.substring(0, 1))
    minutes = parseInt(val.substring(1))
  } else if (val.length === 4) {
    hours = parseInt(val.substring(0, 2))
    minutes = parseInt(val.substring(2))
  }

  if (hours > 23) hours = 23
  if (minutes > 59) minutes = 59

  let date = startOfMinute(new Date())
  date = setHours(date, hours)
  date = setMinutes(date, minutes)

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  
  if (type === 'start') {
    startTimeRaw.value = formatted
    startTimeTs.value = date.getTime()
  } else {
    endTimeRaw.value = formatted
    endTimeTs.value = date.getTime()
  }
}

watch([startTimeTs, endTimeTs], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    if (newEnd > newStart) {
      formValue.value.duration = Math.floor((newEnd - newStart) / 1000)
    } else {
      formValue.value.duration = 0
    }
  }
})

const formattedTotalTime = computed(() => {
  const s = formValue.value.duration
  if (s <= 0) return '00:00:00'
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
})

const submit = async () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    formValue.value.processing = true
    try {
      const dataToSave = {
        ...formValue.value,
        start: startTimeTs.value ? new Date(startTimeTs.value).toISOString() : null,
        end: endTimeTs.value ? new Date(endTimeTs.value).toISOString() : null,
      }

      await pb.collection('time_entries').create(dataToSave)
      
      message.success('Entrada guardada correctamente')
      resetForm()
      showModal.value = false
    } catch (error) {
      message.error('Error al guardar')
    } finally {
      formValue.value.processing = false
    }
  })
}

const resetForm = () => {
  formValue.value = {
    description: '',
    duration: 0,
    start: null,
    end: null,
    non_billable: false,
    project: null,
    task: null,
    tag: null,
    processing: false,
  }
  startTimeRaw.value = ''
  endTimeRaw.value = ''
  startTimeTs.value = null
  endTimeTs.value = null
}
</script>