<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    
    <div 
      v-show="isVisible" 
      class="bg-[#1e2824] border border-white/[0.04] rounded-3xl p-5 shadow-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) transform origin-bottom-right"
      :class="isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4 pointer-events-none'"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div class="flex items-end gap-[3px] h-3.5 w-4">
            <span class="w-1 bg-[#52b788] rounded-full animate-pulse h-2"></span>
            <span class="w-1 bg-[#74c69d] rounded-full animate-pulse h-3.5 [animation-delay:0.2s]"></span>
            <span class="w-1 bg-[#52b788] rounded-full animate-pulse h-2.5 [animation-delay:0.4s]"></span>
          </div>
          <span class="text-xs font-black tracking-widest text-white uppercase">LoFi Radio</span>
        </div>
        
        <n-button 
          text 
          @click="toggleVisibility" 
          class="text-[#9db4a9] hover:text-white transition-colors duration-200"
        >
          <template #icon>✕</template>
        </n-button>
      </div>

      <div class="rounded-2xl overflow-hidden border border-white/[0.03] h-[157px] w-[280px] shadow-inner bg-[#151d1a]">
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
      class="flex items-center justify-center h-14 w-14 rounded-full bg-[#1e2824] border border-white/[0.05] text-white shadow-xl hover:bg-[#2a3832] transition-all duration-300 group relative"
      :class="{ 'border-[#52b788] ring-4 ring-[#52b788]/20 bg-[#2a3832]': isVisible }"
    >
      <span v-if="isVisible" class="absolute inset-0 rounded-full bg-[#52b788]/20 animate-ping"></span>

      <span class="text-2xl group-hover:scale-110 transition-transform duration-300 z-10">
        {{ isVisible ? '🍃' : '🎧' }}
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