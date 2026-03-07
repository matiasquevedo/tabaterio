<template>
  <div>
    <Nav />

    <div>
      <n-message-provider>
        <RouterView />
      </n-message-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Nav from './layout/Nav.vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTimerStore } from '@/stores/timer'

const route = useRoute()
const store = useTimerStore()

// Esta función centraliza la lógica del título
const updateTitle = () => {
  const appName = 'Tabaterio'
  const routeTitle = route.meta.title ? `${route.meta.title} | ` : ''
  
  // Mapeo amigable para el usuario
  const phaseNames = {
    prepare: '🟡 PREPARANDO |',
    work: '🔴 TRABAJANDO |',
    pause: '💚 DESCANSO |',
    stop: ''
  }

  // Corregido: Usar el mapeo para obtener el nombre bonito
  const currentPhaseName = phaseNames[store.phase] || ''
  
  document.title = `${currentPhaseName} ${routeTitle}${appName}`
}

// SOLUCIÓN: Añadimos () => store.phase a la lista de vigilancia
watch(
  [() => store.phase, () => route.path], 
  () => {
    updateTitle()
  },
  { immediate: true }
)
</script>