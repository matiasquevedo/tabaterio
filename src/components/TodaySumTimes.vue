<template>
  <div class="p-6 flex gap-2 items-center">
    <div class="font-mono text-zinc-500 text-base">
      {{ formatDate(new Date()) }}: 
    </div>

    <div v-if="loading" class="text-zinc-500 animate-pulse">
      Cargando tiempo de hoy...
    </div>
    <div v-else class="text-xl font-bold tracking-tight">
      <div v-if="entries.length" class="flex items-center gap-2">
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
 * CONSTRUCCIÓN DEL FILTRO SEGÚN DOCUMENTACIÓN
 * PocketBase compara fechas como strings: 'YYYY-MM-DD HH:mm:ss.SSSZ'
 * Usamos format() para forzar ese formato exacto independientemente de la zona horaria.
 */
const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss.SSS'Z'");
const todayEnd = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss.SSS'Z'");

// Aplicamos el filtro sobre el campo 'created' como indica la documentación
const dateFilter = `non_billable = false && created >= "${todayStart}" && created <= "${todayEnd}"`;

// const dateFilter = `non_billable = false && created >= @todayStart && created <= @todayEnd`;


const loadData = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    const records = await pb.collection('time_entries').getFullList({
      fields: 'id,duration,created, non_billable', 
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
    // Validación de string simple para el tiempo real
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