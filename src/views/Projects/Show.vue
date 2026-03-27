<template>
  <AppLayout>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mt-10 mx-12">
      
      <div class="flex items-center gap-4">
        
        <Color :color="project.color" size="lg" />
        <div>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            {{ project.name }}
            <span class="text-xs font-bold tracking-normal text-[#9db4a9] bg-[#2a3832] px-3 py-1.5 rounded-xl border border-white/[0.03]">
              {{ tasks.length }} {{ tasks.length === 1 ? 'tarea' : 'tareas' }}
            </span>
          </h1>
        </div>
      </div>

      <div class="bg-[#1e2824] border border-white/[0.04] rounded-2xl px-6 py-4 shadow-lg flex items-center gap-4">
        <div class="p-2 bg-[#52b788]/10 rounded-xl">
          <span class="text-xl">⏱️</span>
        </div>
        <div>
          <span class="text-xs font-bold tracking-wider text-[#9db4a9] uppercase block mb-0.5">Tiempo Total</span>
          <span class="font-mono text-2xl font-black text-[#52b788] tracking-tight">
            {{ formattedTime(sumTime) }}
          </span>
        </div>
      </div>

    </div>


    <div class="space-y-10 mt-6">

      <section class="bg-[#1e2824] border border-white/[0.03] rounded-3xl p-6 md:p-8 shadow-md">
        
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-white tracking-tight">Tareas del Proyecto</h2>
            <span class="h-2 w-2 rounded-full bg-[#52b788] animate-pulse"></span>
          </div>
          
          <div v-if="!loading && project.id">
            <CreateTaskModal :project="project.id" :dolars="project.in_dolars" />
          </div>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4 text-[#9db4a9]">
          <span class="h-8 w-8 rounded-full border-3 border-t-[#52b788] border-[#2a3832] animate-spin"></span>
          <span class="text-sm font-medium">Buscando tus tareas...</span>
        </div>

        <div v-else>
          <div v-if="tasks.length" class="overflow-x-auto">
            <table class="min-w-full text-white text-left whitespace-nowrap">
              <thead>
                <tr class="text-xs font-bold tracking-wider text-[#9db4a9] uppercase">
                  <th class="pb-4 px-4">Tarea</th>
                  <th class="pb-4 px-4">Tarifa Adicional</th>
                  <th class="pb-4 px-4">Rate Total {{ project.in_dolars ? '(USD)' : '' }}</th>
                  <th class="pb-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr class="h-2"></tr>
                
                <tr 
                  v-for="task in tasks" 
                  :key="task.id" 
                  class="group bg-[#151d1a]/50 hover:bg-[#2a3832] transition-all duration-300"
                >
                  <td class="py-5 px-4 font-bold text-white group-hover:text-[#74c69d] transition-colors duration-200 rounded-l-2xl">
                    {{ task.name }}
                  </td>
                  <td class="py-5 px-4 text-[#9db4a9] font-mono font-medium">
                    ${{ task.task_rate }}
                  </td>
                  <td class="py-5 px-4 text-[#f4f9f4] font-mono font-bold">
                    ${{ (task.task_rate || 0) + (project.rate || 0) }}
                  </td>
                  <td class="py-5 px-4 text-right rounded-r-2xl">
                    <div class="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <UpdateTaskModal :task="task" :project="project.id" :dolars="project.in_dolars" />
                      <DeleteTaskModal :id="task.id" :name="task.name" :project="project.id" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="py-16 flex flex-col items-center justify-center text-[#9db4a9] gap-4 bg-[#151d1a]/40 rounded-2xl border border-white/[0.02]">
            <span class="text-4xl">🍃</span>
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-sm font-bold text-white">No hay tareas plantadas aún.</span>
              <span class="text-xs">¡Crea tu primera tarea para empezar a medir tu tiempo!</span>
            </div>
          </div>
        </div>
      </section>

      <section class="border border-[#e07a5f]/20 bg-[#e07a5f]/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mx-12">
        <div class="flex items-start gap-4">
          <span class="text-2xl mt-1">🍂</span>
          <div>
            <h3 class="text-lg font-bold text-[#e07a5f]">Zona de resguardo</h3>
            <p class="text-sm text-[#9db4a9] mt-1 max-w-md">
              Si borras este proyecto se perderá su historial de tareas y métricas de tiempo de forma permanente.
            </p>
          </div>
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