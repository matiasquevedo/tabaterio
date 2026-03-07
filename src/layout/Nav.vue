<template>
	
	<nav class="sticky bg-slate-950 top-0 z-50 dark:bg-state-800 border-b border-slate-400/50 w-full">	
	  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	    <div class="flex justify-between h-16 items-center">
	      <!-- Left hamburger + Logo -->
	      <div class="flex items-center">


	      	<div class="flex gap-3 items-center">
	      		<div>
	      			<img src="../assets/logo.svg" width="48" alt="">
	      		</div>
	      	  
	      		<div>
	      			<RouterLink to="/">Home</RouterLink>
	      		</div>
	      		<div>
	      			<RouterLink :to="{ name: 'proyectos'}">Proyectos</RouterLink>	      			
	      		</div>


	      		
	      	</div>

	      </div>

	      <!-- Right side desktop -->
	      <div class="flex items-center">
	        <div class="hidden sm:flex sm:items-center sm:space-x-4">
	        	<TodaySumTimes />

	        	<div>
	        		{{updateTitle()}}
	        	</div>
	        </div>

	        <!-- Navbar Hamburger mobile -->
	        <div class="sm:hidden ms-2">

	        </div>
	      </div>
	    </div>
	  </div>


	</nav>



</template>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import TodaySumTimes from '@/components/TodaySumTimes.vue'
import { storeToRefs } from 'pinia'
import { useTimerStore } from '@/stores/timer'


const store = useTimerStore()
// `name` y `doubleCount` son refs reactivas
// Esto también extraerá refs para las propiedades añadidas por plugins
// pero se saltará cualquier acción o propiedad no reactiva (sin ref/reactive)
const { run, phase } = storeToRefs(store)



const updateTitle = () => {  
  // Mapeo amigable para el usuario
  const phaseNames = {
    prepare: '🟡 PREPARANDO',
    work: '🔴 TRABAJANDO',
    pause: '💚 DESCANSO',
    stop: '🫵'
  }

  // Corregido: Usar el mapeo para obtener el nombre bonito
  const currentPhaseName = phaseNames[store.phase] || ''
  
  return `${currentPhaseName}`
}

watch(
  [() => store.phase], 
  () => {
    updateTitle()
  },
  { immediate: true }
)
</script>



