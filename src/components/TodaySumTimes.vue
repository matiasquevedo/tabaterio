<template>
  <div class="p-6 flex gap-2 items-center">
    <div class="font-mono text-zinc-500 text-base">
      {{formatDate(todayStart)}}: 
    </div>
    <div v-if="loading" class="text-zinc-500 animate-pulse">
      Cargando tiempo de hoy...
    </div>
    <div v-else class="text-xl font-bold tracking-tight">
      <div v-if="entries.length" class="flex items-center gap-2">
        <span class="text-zinc-400 font-normal">{{entries.length}} -> </span>
        <span class="font-mono text-green-500">{{ formattedTime(sumTime) }}</span>
      </div>
      <div v-else class="text-zinc-500 flex items-center gap-2">
        <span class="font-mono">{{ formattedTime(0) }} 🖕</span> 
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { startOfDay, endOfDay, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

import _ from 'lodash';
import pb from '@/lib/pocketbase';

const entries = ref<any[]>([]);
const loading = ref(false);

/**
 * LÓGICA DE FECHAS UTC (Ajuste para Argentina UTC-3)
 * .toISOString() convierte tu hora local a la hora Z (Londres) que PocketBase espera.
 */
const todayStart = startOfDay(new Date()).toISOString();
const todayEnd = endOfDay(new Date()).toISOString();

// Filtramos por 'start' para capturar las tareas que pertenecen al día de hoy
const dateFilter = `start >= '${todayStart}' && start <= '${todayEnd}'`;

const loadData = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    const records = await pb.collection('time_entries').getFullList({
      fields: 'id,duration,start', 
      filter: dateFilter,
      sort: '-start'
    });
    entries.value = records;
  } catch (error) {
    console.error("Error cargando horas de hoy:", error);
  } finally {
    loading.value = false;
  }
};

const sumTime = computed(() => {
  return _.sumBy(entries.value, (o) => o.duration || 0);
});

const subscribeRealTime = async () => {
  // Guardamos la suscripción para poder cancelarla si fuera necesario
  await pb.collection('time_entries').subscribe('*', (e) => {
    // Solo procesamos si la entrada pertenece al rango de hoy
    // (PocketBase enviará cualquier cambio en la colección, hay que validar)
    const entryDate = e.record.start;
    const isToday = entryDate >= todayStart && entryDate <= todayEnd;

    if (!isToday && e.action !== 'delete') return;

    if (e.action === 'create') {
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
  }, { fields: 'id,duration,start', filter: dateFilter });
};

const formattedTime = (s: number) => {
  const hours = Math.floor(s / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const seconds = (s % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Fecha desconocida';
  const d = new Date(dateStr);
  if (!isValid(d)) return 'Fecha inválida';
  return format(d, "eee, d 'de' MMM", { locale: es });
};

onMounted(async () => {
  await loadData();
  subscribeRealTime();
});

// Limpiamos la suscripción al destruir el componente para evitar fugas de memoria
onUnmounted(() => {
  pb.collection('time_entries').unsubscribe('*');
});
</script>