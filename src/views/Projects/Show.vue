<template>
  <AppLayout>

    <template #header>
      <div class="flex justify-between items-start">
        <h1 class="font-semibold text-2xl leading-tight">
            <Color :color="project.color"/> {{project.name}} ({{project.expand?.tasks_via_project.length>0?project.expand?.tasks_via_project.length:0}} tareas)
        </h1>

        Total de Horas: {{formattedTime(sumTime)}}

      </div>
    </template>

    <div class="p-6">
      <div class="overflow-x-auto rounded-lg shadow">
        <div class="flex justify-between mb-3">
          <h2 class="text-xl">Tareas</h2>
          <div v-if="!loading && project.id">
            <CreateTaskModal :project="project.id" :dolars="project.in_dolars" />
          </div>
        </div>

        <table class="min-w-full divide-y text-white dark:bg-zinc-900">
          <thead class="bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">Tareas</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Rate Adicional</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Total {{ project.in_dolars ? '(USD)' : '' }}</th>
              <th class="px-4 py-3 text-left text-sm font-semibold"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="task in tasks" :key="task.id" class="hover:bg-zinc-800 transition-colors">
              <td class="px-4 py-3 text-sm">{{ task.name }}</td>
              <td class="px-4 py-3 text-sm">${{ task.task_rate }}</td>
              <td class="px-4 py-3 text-sm">${{ (task.task_rate || 0) + (project.rate || 0) }}</td>
              <td class="px-4 py-3 text-sm">
                <UpdateTaskModal :task="task" :project="project.id" :dolars="project.in_dolars" />
                <DeleteTaskModal :id="task.id" :name="task.name" :project="project.id" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

      <DeleteProjectModal :id="project.id" :name="project.name" />

        <pre><code>
         {{project}} 
        </code></pre>
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

// Inicializamos como objeto, no como array
const project = ref<any>({}); 
const tasks = ref<any[]>([]);
const entries = ref<any[]>([]);

const loading = ref(false);

const suscribeRealTimeTask = async () => {
  // Filtro con comillas para el ID
  const filterString = `project = "${props.id}"`;

  await pb.collection('tasks').subscribe('*', (e) => {
    console.log('Realtime:', e.action, e.record);

    if (e.action === 'create') {
      tasks.value.push(e.record);
    } else if (e.action === 'update') {
      tasks.value = tasks.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      tasks.value = tasks.value.filter(item => item.id !== e.record.id);
    }
  }, { filter: filterString });
};


const sumTime = computed(()=>{
  return _.sumBy(entries.value, function(o) { return o.duration; });
})

const loadData = async () => {
  loading.value = true;
  try {
    const record = await pb.collection('projects').getOne(props.id, { 
      expand: "tasks_via_project, time_entries_via_project" 
    });
    project.value = record;
    // Sincronizamos tasks con lo que viene del expand inicial
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