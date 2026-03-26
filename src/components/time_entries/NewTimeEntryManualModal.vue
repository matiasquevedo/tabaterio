<template>
  <n-button type="primary" secondary strong @click="openModal">
    ➕ Entrada Manual
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    preset="card"
    title="Nueva Entrada Manual"
    style="width: 550px"
    size="huge"
    class="bg-zinc-900"
  >
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      label-placement="top"
    >
      <n-form-item label="Descripción" path="description">
        <n-input v-model:value="formValue.description" placeholder="¿Qué hiciste?" />
      </n-form-item>

      <div class="grid grid-cols-2 gap-4">
        <n-form-item label="Hora Inicio (HHmm)">
          <n-input 
            v-model:value="startTimeRaw" 
            placeholder="Ej: 0830 o 2030"
            @blur="formatAndProcessTime('start')"
            @keyup.enter="formatAndProcessTime('start')"
          >
            <template #prefix>🕒</template>
          </n-input>
        </n-form-item>

        <n-form-item label="Hora Fin (HHmm)">
          <n-input 
            v-model:value="endTimeRaw" 
            placeholder="Ej: 0900 o 2100"
            @blur="formatAndProcessTime('end')"
            @keyup.enter="formatAndProcessTime('end')"
          >
            <template #prefix>🏁</template>
          </n-input>
        </n-form-item>
      </div>

      <div class="flex items-center justify-between bg-zinc-800 p-4 rounded-lg mb-6 border border-zinc-700 shadow-inner">
        <div class="flex flex-col">
          <span class="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">Duración Total</span>
          <span class="text-zinc-500 text-[9px]">Calculado automáticamente</span>
        </div>
        <div :class="['text-3xl font-mono font-bold', formValue.duration > 0 ? 'text-green-500' : 'text-zinc-600']">
          {{ formattedTotalTime }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <n-form-item label="Proyecto / Tarea">
          <AddProjectButton 
            @select-project="(n) => formValue.project = n"
            @select-task="(t) => formValue.task = t" 
          />
        </n-form-item>

        <n-form-item label="Etiqueta">
          <AddTagSelect @select-tag="(n) => formValue.tag = n" />
        </n-form-item>
      </div>

      <n-form-item label="No facturable">
        <n-switch v-model:value="formValue.non_billable">
          <template #icon>💲</template>
        </n-switch>
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="showModal = false">Cancelar</n-button>
        <n-button 
          type="primary" 
          :loading="formValue.processing" 
          :disabled="formValue.duration <= 0"
          @click="submit"
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
import { startOfMinute, setHours, setMinutes } from 'date-fns' // Quitamos formatISO
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

  // IMPORTANTE: Esto crea una fecha en tu hora local (Argentina)
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
      // CONVERSIÓN CORRECTA A ISO UTC
      const dataToSave = {
        ...formValue.value,
        // .toISOString() convierte el timestamp local a UTC 'Z' automáticamente
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