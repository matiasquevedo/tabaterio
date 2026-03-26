<template>
  <n-button 
    type="error" 
    text 
    @click="openModal"
    class="opacity-70 hover:opacity-100 transition-opacity duration-200"
  >
    <template #icon>
      <n-icon size="18">
        <Trash />
      </n-icon>
    </template>
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="⚠️ Eliminar Tarea"
    style="width: 500px" 
    class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >   
    <div class="py-2 flex flex-col gap-2">
      <p class="text-base text-slate-100">
        ¿Estás seguro de que querés eliminar la tarea <span class="font-bold text-white">"{{ name }}"</span>?
      </p>
      <p class="text-sm text-slate-400">
        Esta acción no se puede deshacer y se perderá el registro de la tarea.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 pt-2">
        <n-button 
          secondary 
          class="rounded-lg" 
          @click="showModal = false"
          :disabled="isProcessing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="error" 
          class="rounded-lg px-6 font-semibold"
          :loading="isProcessing" 
          :disabled="isProcessing" 
          @click="submit" 
          attr-type="submit"
        >
          Eliminar Tarea
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