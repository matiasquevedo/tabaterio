<template>
  <AppLayout>
    
    <template #header>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
        
        <div class="flex items-center gap-3">
          <Color :color="project.color" size="lg" />
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            {{ project.name }}
            <span class="text-sm font-medium tracking-normal text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md">
              {{ tasks.length }} {{ tasks.length === 1 ? 'tarea' : 'tareas' }}
            </span>
          </h1>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
          <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Tiempo Total:</span>
          <span class="font-mono text-xl font-bold text-cyan-400 tracking-tight">
            {{ formattedTime(sumTime) }}
          </span>
        </div>

      </div>
    </template>

    <div class="space-y-12 mt-4">

      <section class="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-sm">
        
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-white tracking-tight">Tareas</h2>
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          </div>
          
          <div v-if="!loading && project.id">
            <CreateTaskModal :project="project.id" :dolars="project.in_dolars" />
          </div>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
          <span class="h-6 w-6 rounded-full border-2 border-t-cyan-400 border-slate-700 animate-spin"></span>
          <span>Cargando tareas...</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table v-if="tasks.length" class="min-w-full text-white text-left whitespace-nowrap">
            <thead>
              <tr class="text-sm font-semibold text-slate-400">
                <th class="pb-4 px-4">Tarea</th>
                <th class="pb-4 px-4">Tarifa Adicional</th>
                <th class="pb-4 px-4">Total {{ project.in_dolars ? '(USD)' : '' }}</th>
                <th class="pb-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-slate-800/50">
              <tr 
                v-for="task in tasks" 
                :key="task.id" 
                class="group hover:bg-slate-800/40 transition-colors duration-200"
              >
                <td class="py-4 px-4 font-medium text-white group-hover:text-cyan-400 transition-colors duration-200">
                  {{ task.name }}
                </td>
                <td class="py-4 px-4 text-slate-300 font-mono">
                  ${{ task.task_rate }}
                </td>
                <td class="py-4 px-4 text-slate-300 font-mono">
                  ${{ (task.task_rate || 0) + (project.rate || 0) }}
                </td>
                <td class="py-4 px-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                    <UpdateTaskModal :task="task" :project="project.id" :dolars="project.in_dolars" />
                    <DeleteTaskModal :id="task.id" :name="task.name" :project="project.id" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <span class="text-sm">No hay tareas registradas en este proyecto.</span>
            <span class="text-xs text-slate-500">¡Añadí la primera para empezar!</span>
          </div>
        </div>
      </section>

      <section class="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 class="text-lg font-bold text-red-400">Zona de peligro</h3>
          <p class="text-sm text-slate-400 mt-1">Si borrás este proyecto, perderás las tareas asociadas y los tiempos guardados.</p>
        </div>
        <DeleteProjectModal :id="project.id" :name="project.name" />
      </section>

    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import AppLayout from '@/layout/AppLayout.vue'
import Color from '@/components/ColorCircle.vue'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import DeleteTaskModal from '@/components/tasks/DeleteTaskModal.vue'
import UpdateTaskModal from '@/components/tasks/UpdateTaskModal.vue'
import DeleteProjectModal from '@/components/projects/DeleteProjectModal.vue'

import pb from '@/lib/pocketbase';
import formattedTime from '@/lib/time';
import _ from 'lodash'

const props = defineProps({ id: { type: String, required: true } });

const project = ref<any>({}); 
const tasks = ref<any[]>([]);
const entries = ref<any[]>([]);

const loading = ref(false);

const suscribeRealTimeTask = async () => {
  const filterString = `project = "${props.id}"`;

  await pb.collection('tasks').subscribe('*', (e) => {
    if (e.action === 'create') {
      tasks.value.push(e.record);
    } else if (e.action === 'update') {
      tasks.value = tasks.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      tasks.value = tasks.value.filter(item => item.id !== e.record.id);
    }
  }, { filter: filterString });
};

const sumTime = computed(() => {
  return _.sumBy(entries.value, function(o) { return o.duration; });
})

const loadData = async () => {
  loading.value = true;
  try {
    const record = await pb.collection('projects').getOne(props.id, { 
      expand: "tasks_via_project, time_entries_via_project" 
    });
    project.value = record;
    tasks.value = record.expand?.tasks_via_project || [];
    entries.value = record.expand?.time_entries_via_project || [];
  } catch (error) {
    console.error("Error cargando proyecto:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
  suscribeRealTimeTask();
});

onUnmounted(() => {
  pb.collection('tasks').unsubscribe('*');
});
</script>