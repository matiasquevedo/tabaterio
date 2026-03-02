<template>
	<div class="flex-1 sm:ml-64 overflow-y-auto min-h-screen">
	  <header class="border-b border-slate-500">
	    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	      <slot name="header" /> {{title}}
	    </div>
	  </header>

	  <main class="p-2">
	    <slot />
	  </main>
	</div>
</template>

<script setup>
defineProps({
  title: String,
});	
</script>