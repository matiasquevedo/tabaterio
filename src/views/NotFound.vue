<template>
  <AppLayout>
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      
      <div class="relative mb-6">
        <span class="text-8xl md:text-9xl font-extrabold tracking-tighter text-slate-800 select-none">
          404
        </span>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-5xl transform hover:rotate-12 transition-transform duration-300 cursor-default">
            🛸
          </span>
        </div>
      </div>

      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
        ¡Página no encontrada!
      </h1>
      
      <p class="text-base md:text-lg text-slate-400 max-w-md mb-8 tracking-wide">
        Parece que este enlace se tomó un descanso más largo de lo normal. No pasa nada, volvamos al trabajo juntos.
      </p>

      <router-link :to="{ name: 'proyectos' }">
        <n-button 
          type="primary" 
          class="rounded-xl px-8 py-5 font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-300"
        >
          <template #icon>
            <n-icon size="18">
              <SmartHome />
            </n-icon>
          </template>
          Volver a Proyectos
        </n-button>
      </router-link>

    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layout/AppLayout.vue'
import { SmartHome } from '@vicons/tabler'
</script>