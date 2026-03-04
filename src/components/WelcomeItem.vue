<template>

  <div v-if="isLink">
    <RouterLink :to="{ name: routeName }">
      <div class="item flex gap-3">
        <div>
          <n-icon size="48">
            <slot name="icon" />
          </n-icon>
        </div>
        <div class="details">
          <h3>
            <slot name="heading"></slot>
          </h3>
          <slot></slot>
        </div>
      </div>
    </RouterLink>
  </div>
  <div v-else>
    <div class="item flex gap-3">
      <div>
        <n-icon size="48">
          <slot name="icon" />
        </n-icon>
      </div>
      <div class="details">
        <h3>
          <slot name="heading"></slot>
        </h3>
        <slot></slot>
      </div>
    </div>
  </div>



</template>

<script setup>
import { RouterLink } from 'vue-router'
  

const props = defineProps({
  isLink: {
    type: Boolean,
    default: false
  },
  routeName: {
    type: String,
    default: 'home'
  }, 
})
</script>
