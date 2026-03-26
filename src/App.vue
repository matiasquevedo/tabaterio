<template>
  <n-config-provider 
    :theme="darkTheme" 
    :theme-overrides="themeOverrides"
    class="min-h-screen flex flex-col bg-slate-950 font-sans tracking-tight text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
  >
    <n-message-provider>
      
      <Nav />

      <RouterView />

    </n-message-provider>
  </n-config-provider>

  <LoFiRadio />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Nav from './layout/Nav.vue'
import LoFiRadio from '@/components/LoFiRadio.vue'
import { useTimerStore } from '@/stores/timer'
import { NConfigProvider, NMessageProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui'

const route = useRoute()
const store = useTimerStore()

/**
 * 🎨 SOBREESCRITURA DE TEMAS GLOBAL (Naive UI)
 * Pisamos Card y Modal para que encajen con Slate-900 / Slate-950 de Tailwind
 */
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2dd4bf', // Teal-400 (Cian/Esmeralda suave del sistema)
    primaryColorHover: '#14b8a6',
    primaryColorPressed: '#0f766e',
    primaryColorSuppl: '#2dd4bf',
    
    // Colores de fondo de selects, dropdowns, etc.
    popoverColor: '#0f172a', // slate-900
    cardColor: '#0f172a', // slate-900
    modalColor: '#0f172a', // slate-900
    
    // Bordes sutiles
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  Card: {
    // Al usar preset="card" en n-modal, Naive UI lee ESTOS valores para el fondo del modal
    color: '#0f172a', // slate-900
    titleTextColor: '#ffffff',
    textColor: '#cbd5e1', // slate-300
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  Modal: {
    color: '#0f172a' // slate-900 (Fondo base del modal)
  },
  Input: {
    color: '#1e293b', // slate-800 para los inputs
    colorFocus: '#1e293b',
    textColor: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  Dropdown: {
    color: '#0f172a',
    optionTextColor: '#e2e8f0'
  }
}

const updateTitle = () => {
  const appName = 'Tabaterio'
  const routeTitle = route.meta.title ? `${route.meta.title} | ` : ''
  
  const phaseNames: Record<string, string> = {
    prepare: '✨ Prepárate |',
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