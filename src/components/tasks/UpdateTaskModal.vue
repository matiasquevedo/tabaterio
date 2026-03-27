<template>
  <n-button 
    text 
    @click="openModal"
    class="opacity-60 hover:opacity-100 hover:!text-[#52b788] transition-all duration-200"
  >
    <template #icon>
      <n-icon size="19">
        <Pencil />
      </n-icon>
    </template>
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="🌱 Editar Tarea"
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
          v-model:value="updateForm.name"
          placeholder="Ej: Maquetar vista de perfil"
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
          v-model:value="updateForm.task_rate"
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
          :disabled="isProcessing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="primary" 
          class="rounded-xl h-11 px-6 font-bold tracking-wide !bg-[#52b788] hover:!bg-[#74c69d] border-none text-[#151d1a] shadow-lg shadow-[#52b788]/10"
          :loading="isProcessing" 
          :disabled="isProcessing" 
          @click="submit" 
          attr-type="submit"
        >
          Guardar Cambios
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import pb from '@/lib/pocketbase'
import { Pencil } from '@vicons/tabler'

interface Task {
  id: string;
  name: string;
  task_rate: number;
}

const props = defineProps({
  project: {
    type: String,
    required: true
  },
  dolars: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object as () => Task,
    required: true
  }
})

const showModal = ref(false)
const isProcessing = ref(false)
const errors = ref<Record<string, string>>({})

const updateForm = ref({
  name: props.task.name,
  task_rate: props.task.task_rate,
  project: props.project
})

// Sincronizar el formulario si las props del padre cambian
watch(() => props.task, (newTask) => {
  updateForm.value.name = newTask.name
  updateForm.value.task_rate = newTask.task_rate
}, { deep: true })

const openModal = () => {
  showModal.value = !showModal.value
}

const submit = async () => {
  isProcessing.value = true
  errors.value = {}

  try {
    await pb.collection('tasks').update(props.task.id, updateForm.value)
    showModal.value = false 
  } catch (error: any) {
    console.error("Error en PocketBase:", error)
    errors.value = error.data?.data || {} 
  } finally {
    isProcessing.value = false
  }
}
</script>