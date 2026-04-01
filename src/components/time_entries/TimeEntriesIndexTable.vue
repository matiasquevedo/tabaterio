<template>
  <div class="py-2">
    <div v-if="loading && entries.length === 0" class="flex flex-col items-center justify-center py-16 gap-4 text-[#9db4a9]">
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
              <td class="py-5 px-5 text-[#9db4a9]">
                 <NonBillableSetButton :id="group.latestId" :nonBillable="group.non_billable" />
              </td>
              <td class="py-5 px-5">
                <div v-if="group.project" class="flex items-center gap-3">
                  <ColorCircle :color="group.project.color" size="sm" />

                  <router-link 
                    :to="{ name: 'proyectos.show', params: { id: group.project.id } }" 
                    class="text-sm font-bold text-white hover:text-[#52b788] transition-colors"
                  >
                    {{ group.project.name }}:{{group.task?group.task.name:''}}
                  </router-link>
                </div>
              </td>
              <td class="py-5 px-5 text-right rounded-r-2xl">
                <div class="flex items-center justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all">
                  <CloneEntryTime :id="group.latestId" />
                  <DeleteTimeEntryModal :id="group.latestId" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="currentPage < totalPages" class="mt-8 flex justify-center pb-10">
          <n-button 
            @click="loadMore" 
            :loading="loading"
            class="!bg-[#1e2824] !text-[#74c69d] border border-[#52b788]/30 hover:border-[#52b788] px-8 font-bold h-11 rounded-xl transition-all"
          >
            {{ loading ? 'Cargando registros...' : 'Ver más...' }}
          </n-button>
        </div>
      </div>

      <div v-else class="py-16 flex flex-col items-center justify-center text-[#9db4a9] bg-[#151d1a]/50 rounded-3xl border border-white/[0.02]">
        <span class="text-4xl mb-3">⏱️</span>
        <h3 class="text-base font-bold text-white mb-1">Sin entradas de tiempo aún</h3>
        <p class="text-xs mb-6">Parece que no hay registros para mostrar.</p>
        <n-button secondary @click="currentPage = 1; loadData()">Actualizar Historial</n-button>
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

// ... (tus otros imports de componentes)

const entries = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);

/**
 * Carga los datos de una página específica
 */
const loadData = async (page: number) => {
  loading.value = true;
  try {
    const result = await pb.collection('time_entries').getList(page, 10, {
      sort: '-start',
      expand: "project, task, tag"
    });

    // Si es la página 1, reemplazamos. Si no, concatenamos.
    if (page === 1) {
      entries.value = result.items;
    } else {
      entries.value = [...entries.value, ...result.items];
    }

    totalPages.value = result.totalPages;
    currentPage.value = result.page;
  } catch (error) {
    console.error("Error PB:", error);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (currentPage.value < totalPages.value) {
    loadData(currentPage.value + 1);
  }
};

/**
 * Agrupación de entradas (Lógica intacta pero ahora trabaja sobre la lista extendida)
 */
const groupedEntries = computed(() => {
  const groups: any[] = [];
  if (entries.value.length === 0) return groups;

  entries.value.forEach((entry) => {
    const lastGroup = groups[groups.length - 1];
    
    // Solo agrupamos si son consecutivos en la lista
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

// --- FORMATTERS --- (Iguales a los tuyos)
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

// --- REALTIME ---
const subscribe = async () => {
  await pb.collection('time_entries').subscribe('*', (e) => {
    if (e.action === 'create') {
      // Si estamos en la página 1, lo agregamos al principio
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
  }, { expand: "project, task, tag" });
};

onMounted(async () => {
  await loadData(1);
  subscribe();
});

onUnmounted(() => {
  pb.collection('time_entries').unsubscribe('*');
});
</script>