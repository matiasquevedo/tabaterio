<template>
  <div class="timer-container">
    <div>
      

      <n-form
        ref="formRef"
        inline
        :label-width="80"
        :model="formValue"
        :rules="rules"
        size="large"
      >
        <n-form-item path="description" class="flex-grow">
          <n-input v-model:value="formValue.description" placeholder="¿En qué estás trabajando?" />
        </n-form-item>

        <n-form-item>
          <AddProjectButton @select-project="(n) => formValue.project = n" />
        </n-form-item>

        <n-form-item>
          <n-switch v-model:value="formValue.non_billable" size="medium">
            <template #icon>💲</template>
          </n-switch>
        </n-form-item>

        <n-form-item>
        	{{ formattedTime }}
        </n-form-item>

        <n-form-item>
          <n-button 
            @click="handleValidateClick" 
            class="w-24"
            type="primary"
          >

            {{ run ? 'Stop' : 'Start' }}
          </n-button>
        </n-form-item>
      </n-form>
      
      <pre class="text-xs text-zinc-500 mt-2">{{ JSON.stringify(formValue, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useTimeoutPoll } from '@vueuse/core'
import { formatISO } from 'date-fns'
import pb from '@/lib/pocketbase'
import AddProjectButton from '@/components/time_entries/AddProjectButton.vue'

// --- ESTADO ---
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const run = ref(false)

const formValue = ref({
  description: '',
  duration: 0, // Segundos totales
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

const rules = {
  description: {
    required: true,
    message: 'Escribe una descripción',
    trigger: ['input', 'blur']
  }
}

// --- LÓGICA DEL CRONÓMETRO ---

// Formateador de segundos a 00:00:00
const formattedTime = computed(() => {
  const s = formValue.value.duration
  const hours = Math.floor(s / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const seconds = (s % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

// Función que se ejecuta cada segundo
async function tick() {
  formValue.value.duration++
}

// Configuración de VueUse (empezamos pausados)
const { isActive, pause, resume } = useTimeoutPoll(tick, 1000, { immediate: false })

// --- ACCIONES ---

const storeTimeEntry = async () => {
  formValue.value.processing = true
  try {
    await pb.collection('time_entries').create(formValue.value)
    message.success('Entrada de tiempo guardada')
    
    // Resetear formulario tras guardar
    resetForm()
  } catch (error: any) {
    console.error("Error en PocketBase:", error)
    message.error('Error al guardar: ' + error.message)
  } finally {
    formValue.value.processing = false
  }
}

const resetForm = () => {
  formValue.value.description = ''
  formValue.value.duration = 0
  formValue.value.start = null
  formValue.value.end = null
  formValue.value.project = null
}

function handleValidateClick(e: MouseEvent) {
  e.preventDefault()
  
  // Validamos antes de empezar o terminar
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (!run.value) {
        // START
        run.value = true
        formValue.value.start = formatISO(new Date())
        resume()
        message.info('Cronómetro iniciado')
      } else {
        // STOP
        run.value = false
        pause()
        formValue.value.end = formatISO(new Date())
        storeTimeEntry()
      }
    } else {
      message.error('Faltan datos obligatorios')
    }
  })
}

onMounted(() => {
  pause() // Asegurar que inicie detenido
})
</script>

<style scoped>
.text-primary {
  color: #18a058; /* Color verde de Naive UI por defecto */
}
</style>