<template>
  <n-button 
    type="error" 
    secondary
    class="rounded-xl font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300"
    @click="openModal"
  >
    <template #icon>
      <n-icon>
        <Trash />
      </n-icon>
    </template>
    Eliminar Proyecto
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="⚠️ ¿Eliminar este proyecto?"
    style="width: 500px" 
    class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >   
    <div class="py-2 flex flex-col gap-2">
      <p class="text-base text-slate-100">
        ¿Estás completamente seguro de que querés eliminar el proyecto <span class="font-bold text-white">"{{ name }}"</span>?
      </p>
      <p class="text-sm text-slate-400">
        Esta acción es irreversible. Se borrarán todas las tareas asociadas y los tiempos acumulados.
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
          Eliminar Proyecto
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Trash } from '@vicons/tabler'
import pb from '@/lib/pocketbase'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

const router = useRouter()
const showModal = ref(false)
const isProcessing = ref(false)

const openModal = () => {
  showModal.value = !showModal.value
}

const submit = async () => {
  isProcessing.value = true

  try {
    await pb.collection('projects').delete(props.id)
    showModal.value = false 
    router.push({ name: 'proyectos' })
  } catch (error) {
    console.error("Error en PocketBase al eliminar proyecto:", error)
  } finally {
    isProcessing.value = false
  }
}
</script>