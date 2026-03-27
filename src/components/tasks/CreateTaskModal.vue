<template>
  <n-button 
    type="primary" 
    class="rounded-2xl font-bold tracking-wide shadow-lg shadow-[#52b788]/20 hover:shadow-[#52b788]/30 transition-all duration-300 h-11 px-5 !bg-[#52b788] hover:!bg-[#74c69d] border-none"
    @click="openModal"
  >
    <template #icon>
      <span class="text-xl font-bold">+</span>
    </template>
    Nueva Tarea
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="🌱 Nueva Tarea"
    style="width: 550px" 
    class="rounded-3xl bg-[#1e2824] border border-white/[0.04] shadow-2xl"
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
          placeholder="Ej: Maquetar vista de perfil o Leer capítulo 3"
          class="rounded-xl h-11 flex items-center bg-[#2a3832]"
          clearable
        /> 
      </n-form-item>

      <n-form-item 
        :label="`Tarifa Adicional ${dolars ? '(USD)' : ''}`" 
        :feedback="errors.task_rate"
        :validation-status="errors.task_rate ? 'error' : undefined"
      >
        <n-input-number 
          v-model:value="createForm.task_rate"
          :min="0"
          placeholder="0.00"
          class="w-full rounded-xl h-11 flex items-center bg-[#2a3832]"
          clearable 
        />
      </n-form-item>

    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-4 pt-2">
        <n-button 
          secondary 
          class="rounded-xl h-11 px-5 border border-white/[0.04] bg-[#2a3832] text-[#f4f9f4] hover:bg-[#364941]" 
          @click="showModal = false"
          :disabled="createForm.processing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="primary" 
          class="rounded-xl h-11 px-6 font-bold tracking-wide !bg-[#52b788] hover:!bg-[#74c69d] border-none text-[#151d1a] shadow-lg shadow-[#52b788]/10"
          :loading="createForm.processing" 
          :disabled="createForm.processing" 
          @click="submit" 
          attr-type="submit"
        >
          Guardar Tarea
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