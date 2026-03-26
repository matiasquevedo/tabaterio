<template>
  <main class="p-12">

<!--     <div class="m-12">
      <TodaySumTimes />
    </div> -->
    <div class="text-slate-200 ">
      <NewTimeEntry />
    </div>

    <div class="p-6">
      <TimeEntriesIndexTable />
    </div>
    
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import TodaySumTimes from '@/components/TodaySumTimes.vue'


import NewTimeEntry from '@/components/time_entries/NewTimeEntry.vue'
import TimeEntriesIndexTable from '@/components/time_entries/TimeEntriesIndexTable.vue'
</script>