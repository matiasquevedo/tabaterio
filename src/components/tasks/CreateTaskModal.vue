<template>
  <n-button 
    type="primary" 
    class="rounded-xl font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300"
    @click="openModal"
  >
    <template #icon>
      <span class="text-lg">+</span>
    </template>
    Nueva Tarea
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="📌 Crear Nueva Tarea"
    style="width: 600px" 
    class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >
    <form @submit.prevent="submit" class="space-y-4">

      <n-form-item 
        label="Nombre de la tarea" 
        :feedback="errors.name"
        :validation-status="errors.name ? 'error' : undefined"
      >
        <n-input
          v-model:value="createForm.name"
          placeholder="Ej: Maquetar vista de perfil"
          class="rounded-lg"
          clearable
        /> 
      </n-form-item>

      <n-form-item 
        :label="`Rate Adicional ${dolars ? '(USD)' : ''}`" 
        :feedback="errors.task_rate"
        :validation-status="errors.task_rate ? 'error' : undefined"
      >
        <n-input-number 
          v-model:value="createForm.task_rate"
          :min="0"
          placeholder="0.00"
          class="w-full rounded-lg"
          clearable 
        />
      </n-form-item>

    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3 pt-2">
        <n-button 
          secondary 
          class="rounded-lg" 
          @click="showModal = false"
          :disabled="createForm.processing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="primary" 
          class="rounded-lg px-6 font-semibold"
          :loading="createForm.processing" 
          :disabled="createForm.processing" 
          @click="submit" 
          attr-type="submit"
        >
          Crear Tarea
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import pb from '@/lib/pocketbase'

const props = defineProps({
  project: {
    type: String,
    required: true
  },
  dolars: {
    type: Boolean,
    default: false
  }
})

interface TaskForm {
  name: string;
  project: string;
  task_rate: number;
  processing: boolean;
}

const showModal = ref(false)
const errors = ref<Record<string, string>>({})

const createForm = ref<TaskForm>({
  name: '',
  project: props.project,
  task_rate: 0,
  processing: false
})

const openModal = () => {
  showModal.value = !showModal.value
}

const submit = async () => {
  createForm.value.processing = true
  errors.value = {}

  try {
    const { processing, ...payload } = createForm.value
    
    await pb.collection('tasks').create(payload)
    
    // Limpiamos formulario
    createForm.value.name = ''
    createForm.value.task_rate = 0
    
    showModal.value = false 
  } catch (error: any) {
    console.error("Error en PocketBase:", error)
    errors.value = error.data?.data || {} 
  } finally {
    createForm.value.processing = false
  }
}
</script>