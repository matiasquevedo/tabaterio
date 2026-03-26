<template>
  <div class="py-2">
    
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
      <span class="h-6 w-6 rounded-full border-2 border-t-cyan-400 border-slate-700 animate-spin"></span>
      <span class="text-sm tracking-wide">Obteniendo tus registros...</span>
    </div>

    <div v-else>
      <div class="flex justify-between mb-6 items-center">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold text-white tracking-tight">Entradas de Tiempo</h2>
        </div>
        
        <NewTimeEntryManualModal />
      </div>

      <div v-if="groupedEntries.length" class="overflow-x-auto">
        <table class="min-w-full text-white text-left whitespace-nowrap">
          <thead>
            <tr class="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <th class="pb-4 px-4">Hora / Fecha</th>
              <th class="pb-4 px-4">Descripción</th>
              <th class="pb-4 px-4">Duración Total</th>
              <th class="pb-4 px-4">Facturable</th>
              <th class="pb-4 px-4">Proyecto / Tarea</th>
              <th class="pb-4 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-800/50">
            <tr 
              v-for="(group, index) in groupedEntries" 
              :key="index" 
              class="group hover:bg-slate-800/30 transition-colors duration-200"
            >
              <td class="py-4 px-4">
                <div class="flex flex-col gap-0.5 font-mono">
                  <span class="text-xs text-slate-400 capitalize">{{ formatDate(group.latestStart) }}</span>
                  <span class="text-sm font-semibold text-white">{{ formatRange(group.earliestStart, group.latestEnd) }}</span>
                </div>
              </td>

              <td class="py-4 px-4">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-white group-hover:text-cyan-400 transition-colors duration-200">
                      {{ group.description || '(Sin descripción)' }}
                    </span>
                    
                    <span v-if="group.count > 1" class="px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300">
                      {{ group.count }}
                    </span>
                  </div>

                  <div v-if="group.tag">
                    <n-tag round :bordered="false" type="success" size="small" class="bg-emerald-500/10 text-emerald-400">
                      <template #icon>
                        <n-icon :component="Tag" />
                      </template>
                      {{ group.tag.name }}
                    </n-tag>
                  </div>
                </div>
              </td>

              <td class="py-4 px-4 font-mono font-bold text-base text-emerald-400">
                {{ formattedTime(group.totalDuration) }}
              </td>

              <td class="py-4 px-4">
                <div class="opacity-80 group-hover:opacity-100 transition-opacity">
                  <NonBillableSetButton :id="group.latestId" :nonBillable="group.non_billable" />
                </div>
              </td>

              <td class="py-4 px-4">
                <div v-if="group.project" class="flex items-center gap-2">
                  <ColorCircle :color="group.project.color" size="sm" />
                  
                  <div class="flex flex-col">
                    <router-link 
                      :to="{ name: 'proyectos.show', params: { id: group.project.id } }" 
                      class="text-sm font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {{ group.project.name }}<span v-if="group.task">:{{ group.task.name }}
                    </span>
                    </router-link>
                    
                  </div>
                </div>
                <span v-else class="text-xs italic text-slate-500">Sin proyecto</span>
              </td>

              <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-200">
                  <CloneEntryTime :id="group.latestId" />
                  <DeleteTimeEntryModal :id="group.latestId" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/50">
        <span class="text-5xl mb-4">⏱️</span>
        <h3 class="text-base font-bold text-white mb-1">No hay entradas de tiempo registradas</h3>
        <p class="text-sm text-slate-500 mb-6 max-w-sm text-center">Iniciá el temporizador para empezar a trackear tu actividad de trabajo o estudio.</p>
        
        <n-button 
          secondary 
          class="rounded-lg tracking-wide" 
          @click="loadData"
        >
          Actualizar Tabla
        </n-button>
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
import ColorCircle from '@/components/ColorCircle.vue';

import pb from '@/lib/pocketbase';
import { Tag } from '@vicons/tabler';

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

const groupedEntries = computed(() => {
  const groups: any[] = [];
  if (entries.value.length === 0) return groups;

  entries.value.forEach((entry) => {
    const lastGroup = groups[groups.length - 1];
    
    const canGroup = lastGroup && 
                     lastGroup.description === entry.description &&
                     lastGroup.project?.id === entry.expand?.project?.id;

    if (canGroup) {
      lastGroup.count += 1;
      lastGroup.totalDuration += (entry.duration || 0);
      
      if (entry.start && new Date(entry.start) < new Date(lastGroup.earliestStart)) {
        lastGroup.earliestStart = entry.start;
      }
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
        latestEnd: entry.end || null,
        project: entry.expand?.project,
        task: entry.expand?.task,
        tag: entry.expand?.tag
      });
    }
  });

  return groups;
});

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
  const eFormated = (end && isValid(end)) ? format(end, 'HH:mm') : '...';
  
  return `${sFormated} — ${eFormated}`;
};

const subscribe = async () => {
  await pb.collection('time_entries').subscribe('*', (e) => {
    if (e.action === 'create') {
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
  }, { sort: '-start', expand: "project, task, tag" });
};

onMounted(async () => {
  await loadData();
  subscribe();
});

onUnmounted(() => {
  pb.collection('time_entries').unsubscribe('*');
});
</script>