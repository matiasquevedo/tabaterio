<template>
  <div 
    class="inline-block flex-shrink-0 rounded-full border border-white/10 shadow-sm"
    :style="{ backgroundColor: color }"
    :class="sizeClasses"
  />
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
    default: 'md' // 'sm', 'md', 'lg'
  }
})

const sizeClasses = computed(() => {
  return {
    'sm': 'w-3 h-3',
    'md': 'w-4 h-4',
    'lg': 'w-5 h-5'
  }[props.size] || 'w-4 h-4'
})
</script>