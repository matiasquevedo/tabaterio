<template>
  <nav class="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        
        <div class="flex items-center gap-8">
          
          <RouterLink to="/" class="flex items-center transform transition-transform duration-200 hover:scale-105">
            <img src="../assets/logo.svg" width="42" height="42" alt="Tabaterio Logo" class="drop-shadow-sm" />
          </RouterLink>

          <div class="hidden sm:flex items-center gap-6">
            <RouterLink 
              to="/" 
              class="text-sm font-medium tracking-wide transition-colors duration-200 text-slate-400 hover:text-white"
              active-class="text-white font-semibold"
            >
              Home
            </RouterLink>
            
            <RouterLink 
              :to="{ name: 'proyectos' }" 
              class="text-sm font-medium tracking-wide transition-colors duration-200 text-slate-400 hover:text-white"
              active-class="text-white font-semibold"
            >
              Proyectos
            </RouterLink>
          </div>
        </div>

        <div class="flex items-center gap-4">
          
          <div class="hidden sm:flex items-center gap-4">
            <TodaySumTimes />

            <div 
              class="flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 shadow-sm"
              :class="statusClasses"
            >
              {{ updateTitle() }}
            </div>
          </div>

          <div class="sm:hidden ms-2">
            </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import TodaySumTimes from '@/components/TodaySumTimes.vue'
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timer'

const store = useTimerStore()
const { run, phase } = storeToRefs(store)

const updateTitle = () => {  
  const phaseNames = {
    prepare: '✨ PREPARANDO',
    work: '🔥 ENFOCADO',
    pause: '🌊 DESCANSO',
    stop: 'LISTO'
  }

  return phaseNames[store.phase] || 'LISTO'
}

// Clases dinámicas basadas en el estado para pintar la píldora superior derecha
const statusClasses = computed(() => {
  switch (store.phase) {
    case 'work':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    case 'prepare':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
    case 'pause':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-700'
  }
})
</script>