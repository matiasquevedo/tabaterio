<template>
  <div :style="circleStyle"></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    required: true,
  },
});

const circleStyle = computed(() => ({
  width: '15px',
  height: '15px',
  borderRadius: '50%',
  backgroundColor: props.color,
}));
</script>

<style scoped>
div {
  display: inline-block;
}
</style>
