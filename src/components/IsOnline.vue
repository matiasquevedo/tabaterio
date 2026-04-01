<template>
	<div class="p-4 bg-red-200">
		{{network}}
	</div>
</template>


<script setup lang="ts">
import { useNetwork } from '@vueuse/core'
import { reactive } from 'vue'


const network = reactive(useNetwork())

console.log(network.isOnline)
</script>	
