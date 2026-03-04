<script setup lang="ts">
import { RouterView } from 'vue-router'
import Nav from './layout/Nav.vue'

</script>

<template>
  <div>
    <Nav />

    <div>
      <n-message-provider>
        <RouterView />
      </n-message-provider>
    </div>
  </div>
</template>

