<template>
  <n-button 
    text 
    @click="openModal"
    class="opacity-60 hover:opacity-100 hover:!text-[#e07a5f] transition-all duration-200"
  >
    <template #icon>
      <n-icon size="19">
        <Trash />
      </n-icon>
    </template>
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="🍂 Descartar Tarea"
    style="width: 500px" 
    class="rounded-3xl bg-[#1e2824] border border-white/[0.04] shadow-2xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >   
    <div class="py-2 flex flex-col gap-3">
      <p class="text-base text-[#f4f9f4]">
        ¿Estás seguro de que quieres quitar la tarea <span class="font-bold text-white">"{{ name }}"</span>?
      </p>
      <p class="text-sm text-[#9db4a9] leading-relaxed">
        Esta acción es permanente y se perderá el registro de la tarea en este proyecto.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-4 pt-2">
        <n-button 
          secondary 
          class="rounded-xl h-11 px-5 border border-white/[0.04] bg-[#2a3832] text-[#f4f9f4] hover:bg-[#364941]" 
          @click="showModal = false"
          :disabled="isProcessing"
        >
          Conservar
        </n-button>

        <n-button 
          type="error" 
          class="rounded-xl h-11 px-6 font-bold tracking-wide !bg-[#e07a5f] hover:!bg-[#f28b70] border-none text-white shadow-lg shadow-[#e07a5f]/10"
          :loading="isProcessing" 
          :disabled="isProcessing" 
          @click="submit" 
          attr-type="submit"
        >
          Quitar Tarea
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import pb from '@/lib/pocketbase'
import { Trash } from '@vicons/tabler'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  }
})

const showModal = ref(false)
const isProcessing = ref(false)

const openModal = () => {
  showModal.value = !showModal.value
}

const submit = async () => {
  isProcessing.value = true

  try {
    await pb.collection('tasks').delete(props.id)
    showModal.value = false 
  } catch (error) {
    console.error("Error en PocketBase al eliminar tarea:", error)
  } finally {
    isProcessing.value = false
  }
}
</script>