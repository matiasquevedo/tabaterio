<template>
  <div 
    class="inline-block flex-shrink-0 rounded-full border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-110"
    :style="{ backgroundColor: color }"
    :class="sizeClasses"
  >
    <div class="w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md'
  }
})

const sizeClasses = computed(() => {
  return {
    'sm': 'w-3.5 h-3.5',
    'md': 'w-5 h-5', // Ligeramente más grandes (Regla de legibilidad)
    'lg': 'w-7 h-7'
  }[props.size] || 'w-5 h-5'
})
</script>