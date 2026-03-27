<template>
  <n-config-provider 
    :theme="darkTheme" 
    :theme-overrides="themeOverrides"
    class="min-h-screen flex flex-col bg-[#151d1a] font-sans tracking-tight text-[#f4f9f4] selection:bg-[#52b788]/30 selection:text-[#b7e4c7]"
  >
    <n-message-provider>
      
      <Nav />

      <main class="flex-1 flex flex-col">
        <RouterView />
      </main>

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
 * Rediseño con la paleta de Naturaleza (Menta, Salvia, Arcilla y Musgo)
 */
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#52b788', // Verde Salvia (Enfoque)
    primaryColorHover: '#74c69d',
    primaryColorPressed: '#2d6a4f',
    primaryColorSuppl: '#52b788',
    
    popoverColor: '#1e2824', // bg-secondary (Verde bosque suave)
    cardColor: '#1e2824', 
    modalColor: '#1e2824',
    
    borderColor: 'rgba(255, 255, 255, 0.04)',
    
    borderRadius: '20px', // Bordes aún más juguetones y suaves
    borderRadiusSmall: '10px'
  },
  Card: {
    color: '#1e2824',
    titleTextColor: '#f4f9f4',
    textColor: '#9db4a9',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '24px'
  },
  Modal: {
    color: '#1e2824',
    borderRadius: '28px'
  },
  Input: {
    color: '#2a3832', // bg-tertiary
    colorFocus: '#2a3832',
    textColor: '#f4f9f4',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '14px'
  },
  Dropdown: {
    color: '#1e2824',
    optionTextColor: '#f4f9f4',
    borderRadius: '14px'
  }
}

const updateTitle = () => {
  const appName = 'Tabaterio'
  const routeTitle = route.meta.title ? `${route.meta.title} | ` : ''
  
  const phaseNames: Record<string, string> = {
    prepare: '✨ Prepárate |',
    work: '🌱 Enfocado |', // Emoji orgánico
    pause: '🍂 Descanso |',  // Emoji orgánico
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