<template>
  <div class="p-6">
    <div v-if="loading" class="text-zinc-500 animate-pulse">
      Cargando historial...
    </div>
    <div v-else>
      <div class="flex justify-between mb-4 items-center">
        <h2 class="text-xl font-bold">Entradas</h2>
        <NewTimeEntryManualModal />
      </div>
      
      <div v-if="groupedEntries.length" class="overflow-x-auto">
        <table class="min-w-full divide-y text-white bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <thead class="bg-zinc-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Hora / Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Descripción</th>
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Duración Total</th>
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                
              </th>
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Proyecto</th>
              <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            <tr v-for="(group, index) in groupedEntries" :key="index" class="hover:bg-zinc-800/50 transition-colors">
              <td class="px-4 py-3 text-sm font-mono text-zinc-500">
                <div class="text-xs">{{ formatDate(group.latestStart) }}</div>
                <div class="text-zinc-300">{{ formatRange(group.earliestStart, group.latestEnd) }}</div>
              </td>

              <td class="px-4 py-3 text-sm">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ group.description || '(Sin descripción)' }}</span>
                  <n-badge v-if="group.count > 1" :value="group.count" type="info" :max="99" />
                </div>

                <div v-if="group.tag" class="mt-1">
                  <n-tag round :bordered="false" type="success" size="small">
                    {{ group.tag.name }}
                    <template #icon><n-icon :component="Tag" /></template>
                  </n-tag>
                </div>
              </td>

              <td class="px-4 py-3 text-sm font-mono font-bold text-green-500">
                {{ formattedTime(group.totalDuration) }}
              </td>

              <td>
                <NonBillableSetButton :id="group.latestId" :nonBillable="group.non_billable" />
              </td>


              <td class="px-4 py-3 text-sm">
                <p v-if="group.project" :style="{ color: group.project.color }">
                  <router-link :to="{ name: 'proyectos.show', params: { id: group.project.id } }" class="hover:underline">
                    {{ group.project.name }}{{ group.task ? `:${group.task.name}` : '' }}
                  </router-link>
                </p>
                <span v-else class="text-zinc-600 italic text-xs">Sin proyecto</span>
              </td>

              <td class="px-4 py-3 text-right">
                <DeleteTimeEntryModal :id="group.latestId" />

                <CloneEntryTime :id="group.latestId" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <n-empty description="No hay entradas registradas">
          <template #extra>
            <n-button size="small" @click="loadData">Actualizar</n-button>
          </template>
        </n-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import DeleteTimeEntryModal from '@/components/time_entries/DeleteTimeEntryModal.vue';
import NewTimeEntryManualModal from '@/components/time_entries/NewTimeEntryManualModal.vue';
import CloneEntryTime from '@/components/time_entries/CloneEntryTime.vue';
import NonBillableSetButton from '@/components/time_entries/NonBillableSetButton.vue';

import pb from '@/lib/pocketbase';
import { Tag, CurrencyDollar } from '@vicons/tabler';

const entries = ref<any[]>([]);
const loading = ref(false);

const loadData = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const records = await pb.collection('time_entries').getFullList({
      sort: '-start',
      expand: "project, task, tag"
    });
    entries.value = records;
  } catch (error) {
    console.error("Error PB:", error);
  } finally {
    loading.value = false;
  }
};

// --- LÓGICA DE AGRUPACIÓN CONSECUTIVA ---
const groupedEntries = computed(() => {
  const groups: any[] = [];
  if (entries.value.length === 0) return groups;

  entries.value.forEach((entry) => {
    const lastGroup = groups[groups.length - 1];
    
    // Criterio: Misma descripción Y mismo proyecto
    const canGroup = lastGroup && 
                     lastGroup.description === entry.description &&
                     lastGroup.project?.id === entry.expand?.project?.id;

    if (canGroup) {
      lastGroup.count += 1;
      lastGroup.totalDuration += (entry.duration || 0);
      
      // Solo actualizamos si las fechas son válidas
      if (entry.start && new Date(entry.start) < new Date(lastGroup.earliestStart)) {
        lastGroup.earliestStart = entry.start;
      }
      // El fin puede ser nulo si la tarea está activa
      if (entry.end && (!lastGroup.latestEnd || new Date(entry.end) > new Date(lastGroup.latestEnd))) {
        lastGroup.latestEnd = entry.end;
      }
    } else {
      groups.push({
        latestId: entry.id,
        description: entry.description,
        totalDuration: entry.duration || 0,
        count: 1,
        earliestStart: entry.start,
        latestStart: entry.start,
        non_billable: entry.non_billable,
        latestEnd: entry.end || null, // Manejamos nulo para tareas activas
        project: entry.expand?.project,
        task: entry.expand?.task,
        tag: entry.expand?.tag
      });
    }
  });

  return groups;
});

// --- FORMATEADORES CON "GUARDIAS" ---
const formattedTime = (s: number) => {
  if (!s || s < 0) return '00:00:00';
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

const formatRange = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  if (!isValid(start)) return '--:--';
  
  const sFormated = format(start, 'HH:mm');
  // Si no hay fecha de fin (tarea activa), mostramos "Ahora"
  const eFormated = (end && isValid(end)) ? format(end, 'HH:mm') : '...';
  
  return `${sFormated} — ${eFormated}`;
};

// --- REALTIME ---
const subscribe = async () => {
  await pb.collection('time_entries').subscribe('*', (e) => {
    // Recargamos datos para asegurar consistencia en el agrupamiento
    if (e.action === 'create') {
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
    
  },{sort: '-start', expand: "project, task, tag"  });
};

onMounted(async () => {
  await loadData();
  subscribe();
});

onUnmounted(() => {
  pb.collection('time_entries').unsubscribe('*');
});
</script>