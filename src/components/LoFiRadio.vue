<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    
    <div 
      v-show="isVisible" 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl transition-all duration-300 transform origin-bottom-right"
      :class="isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="text-xs font-bold tracking-wider text-white uppercase">LoFi Focus Radio</span>
        </div>
        
        <n-button text @click="toggleVisibility" class="text-slate-400 hover:text-white">
          <template #icon>✕</template>
        </n-button>
      </div>

      <div class="rounded-xl overflow-hidden border border-slate-800 h-[157px] w-[280px]">
        <iframe 
          width="280" 
          height="157" 
          src="https://www.youtube.com/embed/jfKfPfyJRdk?si=Yz-bSiVsLv9YH0mv" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    </div>

    <button 
      @click="toggleVisibility" 
      class="flex items-center justify-center h-12 w-12 rounded-full bg-slate-900 border border-slate-800 text-white shadow-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 group"
      :class="{ 'border-cyan-500 ring-2 ring-cyan-500/20': isVisible }"
    >
      <span class="text-xl group-hover:scale-110 transition-transform duration-300">
        {{ isVisible ? '🎧' : '🎵' }}
      </span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isVisible = ref(false)

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}
</script>