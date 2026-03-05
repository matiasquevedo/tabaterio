<template>
  <main class="p-12">
    <div class="bg-slate-700 text-slate-200 p-6">
      <NewTimeEntry />
    </div>

    <div class="p-6">
      <TimeEntriesIndexTable />
    </div>

    <div class="p-6">
      <TheWelcome />
    </div>

    
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'

import NewTimeEntry from '@/components/time_entries/NewTimeEntry.vue'
import TimeEntriesIndexTable from '@/components/time_entries/TimeEntriesIndexTable.vue'
</script>