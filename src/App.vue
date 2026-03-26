<template>
  <div class="min-h-screen flex flex-col bg-slate-950 font-sans tracking-tight selection:bg-cyan-500/30 selection:text-cyan-200">
    
    <Nav />

    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <n-message-provider>
        <RouterView />
      </n-message-provider>
    </main>
    
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

const updateTitle = () => {
  const appName = 'Tabaterio'
  const routeTitle = route.meta.title ? `${route.meta.title} | ` : ''
  
  // Mapeo amigable, cercano y consistente con el diseño
  const phaseNames = {
    prepare: '✨ Preparando |',
    work: '🔥 Enfocado |',
    pause: '🌊 Descanso |',
    stop: ''
  }

  const currentPhaseName = phaseNames[store.phase] || ''
  
  document.title = `${currentPhaseName} ${routeTitle}${appName}`
}

watch(
  [() => store.phase, () => route.path], 
  () => {
    updateTitle()
  },
  { immediate: true }
)
</script>