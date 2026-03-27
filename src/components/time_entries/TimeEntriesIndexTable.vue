<template>
  <div class="py-2">
    
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4 text-[#9db4a9]">
      <span class="h-8 w-8 rounded-full border-3 border-t-[#52b788] border-[#2a3832] animate-spin"></span>
      <span class="text-sm font-medium tracking-wide">Obteniendo tus registros...</span>
    </div>

    <div v-else>
      <div class="flex justify-between mb-8 items-center px-2">
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-black text-white tracking-tight">Entradas de Tiempo</h2>
          <span class="h-2 w-2 rounded-full bg-[#52b788] animate-pulse"></span>
        </div>
        
        <NewTimeEntryManualModal />
      </div>

      <div v-if="groupedEntries.length" class="overflow-x-auto">
        <table class="min-w-full text-white text-left whitespace-nowrap border-separate border-spacing-y-2">
          <thead>
            <tr class="text-xs font-bold tracking-wider text-[#9db4a9] uppercase">
              <th class="pb-2 px-5">Hora / Fecha</th>
              <th class="pb-2 px-5">Descripción</th>
              <th class="pb-2 px-5">Duración Total</th>
              <th class="pb-2 px-5">Cobrable</th>
              <th class="pb-2 px-5">Proyecto</th>
              <th class="pb-2 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr 
              v-for="(group, index) in groupedEntries" 
              :key="index" 
              class="group bg-[#1e2824]/50 hover:bg-[#2a3832] transition-all duration-300"
            >
              <td class="py-5 px-5 rounded-l-2xl">
                <div class="flex flex-col gap-1 font-mono">
                  <span class="text-xs font-bold text-[#9db4a9] capitalize">{{ formatDate(group.latestStart) }}</span>
                  <span class="text-sm font-bold text-white">{{ formatRange(group.earliestStart, group.latestEnd) }}</span>
                </div>
              </td>

              <td class="py-5 px-5">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-white group-hover:text-[#74c69d] transition-colors duration-200">
                      {{ group.description || '(Sin descripción)' }}
                    </span>
                    
                    <span v-if="group.count > 1" class="px-2.5 py-1 text-xs font-black rounded-lg bg-[#52b788]/20 text-[#74c69d] border border-[#52b788]/20">
                      ×{{ group.count }}
                    </span>
                  </div>

                  <div v-if="group.tag">
                    <n-tag round :bordered="false" size="small" class="!bg-[#2a3832] !text-[#9db4a9] border border-white/[0.02]">
                      <template #icon>
                        <n-icon :component="Tag" />
                      </template>
                      {{ group.tag.name }}
                    </n-tag>
                  </div>
                </div>
              </td>

              <td class="py-5 px-5 font-mono font-black text-base text-[#52b788]">
                {{ formattedTime(group.totalDuration) }}
              </td>

              <td class="py-5 px-5">
                <div class="opacity-70 group-hover:opacity-100 transition-opacity">
                  <NonBillableSetButton :id="group.latestId" :nonBillable="group.non_billable" />
                </div>
              </td>

              <td class="py-5 px-5">
                <div v-if="group.project" class="flex items-center gap-3">
                  <ColorCircle :color="group.project.color" size="sm" />
                  
                  <div class="flex flex-col">
                    <router-link 
                      :to="{ name: 'proyectos.show', params: { id: group.project.id } }" 
                      class="text-sm font-bold text-white hover:text-[#52b788] transition-colors"
                    >
                      {{ group.project.name }}:{{group.task?group.task.name:''}}
                    </router-link>

                  </div>
                </div>
                <span v-else class="text-xs font-medium italic text-[#9db4a9]">Sin proyecto</span>
              </td>

              <td class="py-5 px-5 text-right rounded-r-2xl">
                <div class="flex items-center justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all duration-200">
                  <CloneEntryTime :id="group.latestId" />
                  <DeleteTimeEntryModal :id="group.latestId" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-16 flex flex-col items-center justify-center text-[#9db4a9] bg-[#151d1a]/50 rounded-3xl border border-white/[0.02]">
        <span class="text-4xl mb-3">⏱️</span>
        <h3 class="text-base font-bold text-white mb-1">Sin entradas de tiempo hoy</h3>
        <p class="text-xs font-medium text-[#9db4a9] mb-6 max-w-sm text-center leading-relaxed">Arranca el cronómetro desde arriba para comenzar a medir tu tiempo.</p>
        
        <n-button 
          secondary 
          class="rounded-xl font-bold tracking-wide h-10 px-5 !bg-[#2a3832] border border-white/[0.03] text-[#f4f9f4] hover:!bg-[#364941]" 
          @click="loadData"
        >
          Actualizar Historial
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