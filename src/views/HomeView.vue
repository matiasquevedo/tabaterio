<template>
  <AppLayout>
    
    <div class="flex flex-col gap-12 mt-2">
      
      <section class="flex justify-center items-center min-h-[45vh] md:min-h-[50vh]">
        <div class="w-full transition-all duration-500 transform hover:scale-[1.01]">
          <NewTimeEntry />
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <div>
              <h2 class="text-xl font-black tracking-tight text-white">Entradas de Tiempo</h2>
              <span class="text-xs font-bold text-[#9db4a9] tracking-widest uppercase">Tu historial de enfoque</span>
            </div>
          </div>
          
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52b788] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-[#52b788]"></span>
          </span>
        </div>

        <div class="bg-[#1e2824] border border-white/[0.03] rounded-3xl p-6 md:p-8 shadow-xl shadow-black/10">
          <TimeEntriesIndexTable />
        </div>
      </section>

    </div>

  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layout/AppLayout.vue'
import NewTimeEntry from '@/components/time_entries/NewTimeEntry.vue'
import TimeEntriesIndexTable from '@/components/time_entries/TimeEntriesIndexTable.vue'
</script>