<template>
  <div class="flex-1 w-full min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
    
    <header v-if="title || $slots.header" class="pt-8 pb-4 md:pt-12 md:pb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <h1 v-if="title" class="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {{ title }}
          </h1>

          <slot name="header" />
        </div>

      </div>
    </header>

    <main class="pb-12 md:pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>