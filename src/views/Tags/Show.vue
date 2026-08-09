Aquí tienes el código completo de la vista de detalle de Etiqueta (`TagShowView.vue` / `TagsShow.vue`) rediseñado.

Conserva la estética de **cápsulas oscuras con efecto glassmorphism**, la tipografía de alto contraste con detalles en verde esmeralda, badges integrados para fechas/duración y la misma estructura visual limpia de la tabla.

```vue
<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Loader Inicial de la Vista Completa -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-4 text-[#9db4a9]">
        <div class="relative flex items-center justify-center">
          <div class="absolute h-12 w-12 rounded-full border-2 border-[#52b788]/20 animate-ping"></div>
          <div class="h-10 w-10 rounded-full border-4 border-t-[#52b788] border-[#2a3832] animate-spin"></div>
        </div>
        <span class="text-[10px] font-black tracking-[0.2em] uppercase opacity-60">Cargando detalles de la etiqueta...</span>
      </div>

      <div v-else class="space-y-8">
        <!-- Header Principal y Card de Estadísticas -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[#1e2824]/30 p-6 md:p-8 rounded-[2.5rem] border border-white/[0.03] backdrop-blur-md">
          
          <!-- Info de Etiqueta -->
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 rounded-2xl bg-[#52b788]/10 border border-[#52b788]/20 flex items-center justify-center text-[#52b788] shadow-inner">
              <span class="text-2xl font-black">#</span>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#52b788]">Etiqueta</span>
                <span class="h-1.5 w-1.5 rounded-full bg-[#52b788] animate-pulse"></span>
              </div>
              <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white capitalize">
                {{ tag.name || 'Sin nombre' }}
              </h1>
            </div>
          </div>

          <!-- Total de Tiempo acumulado -->
          <div class="bg-[#1e2824]/80 border border-white/[0.05] rounded-3xl p-5 shadow-xl flex items-center gap-5 self-start md:self-auto min-w-[240px]">
            <div class="h-12 w-12 bg-[#52b788]/10 rounded-2xl border border-[#52b788]/20 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-black tracking-[0.15em] text-[#9db4a9]/70 uppercase">Tiempo Acumulado</span>
              <span class="font-mono text-2xl font-black text-[#52b788] tracking-tight">
                {{ formattedTime(sumTime) }}
              </span>
              <span class="text-xs">
              	( {{sumTime}} )
              </span>
            </div>
          </div>
        </div>

        <!-- Sección Tabla de Entradas -->
        <div class="space-y-4">
          <div class="flex items-center justify-between px-2">
            <div>
              <h2 class="text-xl font-black text-white tracking-tight">Entradas de Tiempo</h2>
              <p class="text-[11px] font-bold text-[#9db4a9]/60 uppercase tracking-wider mt-0.5">
                Registros asociados a esta etiqueta ({{ entries.length }})
              </p>
            </div>
          </div>

          <!-- Tabla de Entradas -->
          <div v-if="entries.length" class="overflow-x-auto pb-6">
            <table class="min-w-full text-white text-left whitespace-nowrap border-separate border-spacing-y-3">
              <thead>
                <tr class="text-[10px] font-black tracking-[0.15em] text-[#9db4a9]/50 uppercase">
                  <th class="pb-2 px-6">Descripción</th>
                  <th class="pb-2 px-6">Fecha / Horario</th>
                  <th class="pb-2 px-6 text-center">Duración</th>
                  <th class="pb-2 px-6 text-center">Cobro</th>
                  <th class="pb-2 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr 
                  v-for="entry in entries" 
                  :key="entry.id" 
                  class="group bg-[#1e2824]/40 hover:bg-[#1e2824]/80 border border-white/[0.02] transition-all duration-300 backdrop-blur-sm"
                >
                  <!-- Tarea / Descripción -->
                  <td class="py-4 px-6 rounded-l-3xl border-y border-l border-white/[0.03]">
                    <div class="flex flex-col gap-0.5">
                      <span class="font-bold text-white group-hover:text-[#52b788] transition-colors duration-300">
                        {{ entry.description || 'Sin descripción' }}
                      </span>
                      <span v-if="entry.expand?.project" class="text-[10px] font-bold text-[#9db4a9]/60 uppercase tracking-wider">
                        {{ entry.expand.project.name }}{{entry.expand.task?`:${entry.expand.task.name}`:''}}
                      </span>
                    </div>
                  </td>

                  <!-- Fecha / Rango Horario -->
                  <td class="py-4 px-6 border-y border-white/[0.03]">
                    <div class="flex flex-col gap-0.5 font-mono">
                      <span class="text-[10px] font-black text-[#52b788] uppercase tracking-tighter">
                        {{ formatDate(entry.start) }}
                      </span>
                      <span class="text-xs font-bold text-white/80">
                        {{ formatRange(entry.start, entry.end) }}
                      </span>
                    </div>
                  </td>

                  <!-- Duración -->
                  <td class="py-4 px-6 text-center border-y border-white/[0.03]">
                    <span class="font-mono font-black text-base text-[#52b788] bg-[#52b788]/10 px-3 py-1 rounded-xl border border-[#52b788]/20">
                      {{ formattedTime(entry.duration) }}
                    </span>
                  </td>

                  <!-- Estado Facturable / Cobrable -->
                  <td class="py-4 px-6 text-center border-y border-white/[0.03]">
                    <span 
                      class="inline-block px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border"
                      :class="entry.non_billable ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-[#52b788]/10 text-[#52b788] border-[#52b788]/20'"
                    >
                      {{ entry.non_billable ? 'No Cobrable' : 'Cobrable' }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td class="py-4 px-6 text-right rounded-r-3xl border-y border-r border-white/[0.03]">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <CloneEntryTime :id="entry.id" />
                      <DeleteTimeEntryModal :id="entry.id" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="py-24 flex flex-col items-center justify-center text-[#9db4a9] bg-[#1e2824]/20 rounded-[3rem] border-2 border-dashed border-white/[0.03]">
            <div class="h-20 w-20 bg-[#2a3832]/50 rounded-full flex items-center justify-center mb-6 text-3xl">🍃</div>
            <h3 class="text-xl font-black text-white mb-2 tracking-tight">No hay tareas asociadas</h3>
            <p class="text-xs font-bold text-[#9db4a9] mb-8 max-w-xs text-center leading-relaxed uppercase tracking-widest opacity-60">
              Usa la etiqueta #{{ tag.name }} en el cronómetro para empezar a ver datos aquí.
            </p>
          </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import AppLayout from '@/layout/AppLayout.vue';
import DeleteTimeEntryModal from '@/components/time_entries/DeleteTimeEntryModal.vue';
import CloneEntryTime from '@/components/time_entries/CloneEntryTime.vue';
import pb from '@/lib/pocketbase';
import _ from 'lodash';
import formattedTime from '@/lib/time';

const props = defineProps({ 
  id: { type: String, required: true } 
});

const tag = ref<any>({}); 
const entries = ref<any[]>([]);
const loading = ref(false);

const sumTime = computed(() => {
  return _.sumBy(entries.value, (o) => o.duration || 0);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, "eee, d 'de' MMM", { locale: es }) : '---';
};

const formatRange = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;
  if (!isValid(start)) return '--:--';
  const sFormatted = format(start, 'HH:mm');
  const eFormatted = (end && isValid(end)) ? format(end, 'HH:mm') : '...';
  return `${sFormatted} — ${eFormatted}`;
};

const loadData = async () => {
  loading.value = true;
  try {
    const record = await pb.collection('tags').getOne(props.id, { 
      expand: "time_entries_via_tag.project",
    });
    tag.value = record;
    entries.value = record.expand?.time_entries_via_tag || [];
  } catch (error) {
    console.error("Error cargando etiqueta:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadData();
});

onUnmounted(() => {
  pb.collection('tags').unsubscribe('*');
});
</script>

```