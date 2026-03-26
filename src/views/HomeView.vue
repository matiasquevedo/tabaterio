<template>
  <AppLayout title="Área de Enfoque">
    
    <div class="space-y-12 mt-4">
      
      <section class="text-slate-200">
        <NewTimeEntry />
      </section>

      <section class="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-sm">
        <TimeEntriesIndexTable />
      </section>

    </div>

  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layout/AppLayout.vue'
import NewTimeEntry from '@/components/time_entries/NewTimeEntry.vue'
import TimeEntriesIndexTable from '@/components/time_entries/TimeEntriesIndexTable.vue'
</script>