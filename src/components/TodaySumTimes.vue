<template>
  <div class="flex items-center gap-3 py-2">
    
    <div class="text-xs font-medium tracking-wide text-slate-400 capitalize">
      {{ formatDate(new Date()) }}:
    </div>

    <div v-if="loading" class="flex items-center gap-1.5 text-slate-500 animate-pulse text-sm">
      <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
      <span>Calculando...</span>
    </div>

    <div v-else class="flex items-center">
      <div v-if="entries.length" class="flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="font-mono text-base font-semibold text-emerald-400 tracking-tight">
          {{ formattedTime(sumTime) }}
        </span>
      </div>

      <div v-else class="flex items-center gap-1.5 text-slate-500">
        <span class="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
        <span class="font-mono text-sm tracking-tight">
          {{ formattedTime(0) }}
        </span>
        <span class="text-xs tracking-wide">¡A empezar! ✨</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { startOfDay, endOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import _ from 'lodash';
import pb from '@/lib/pocketbase';

const entries = ref<any[]>([]);
const loading = ref(false);

const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss.SSS'Z'");
const todayEnd = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss.SSS'Z'");

const dateFilter = `non_billable = false && created >= "${todayStart}" && created <= "${todayEnd}"`;

const loadData = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    const records = await pb.collection('time_entries').getFullList({
      fields: 'id,duration,created,non_billable', 
      filter: dateFilter,
      sort: '-created'
    });
    entries.value = records;
  } catch (error) {
    console.error("Error en filtro PocketBase:", error);
  } finally {
    loading.value = false;
  }
};

const sumTime = computed(() => {
  return _.sumBy(entries.value, (o) => o.duration || 0);
});

const subscribeRealTime = async () => {
  await pb.collection('time_entries').subscribe('*', (e) => {
    const isToday = e.record.created >= todayStart && e.record.created <= todayEnd;

    if (!isToday && e.action !== 'delete') return;

    if (e.action === 'create') {
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
  }, { fields: 'id,duration,created', filter: dateFilter });
};

const formattedTime = (s: number) => {
  const hours = Math.floor(s / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const seconds = (s % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatDate = (date: Date) => {
  return format(date, "eee, d 'de' MMM", { locale: es });
};

onMounted(async () => {
  await loadData();
  subscribeRealTime();
});

onUnmounted(() => {
  pb.collection('time_entries').unsubscribe('*');
});
</script>