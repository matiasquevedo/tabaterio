<template>

  <div class="p-6">

    <div v-if="loading">
      cargando
    </div>
    <div v-else>
      
      <div v-if="entries.length">
        <table class="min-w-full divide-y text-white dark:bg-zinc-900">
          <thead class="bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Duración</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Proyecto</th>
              <th class="px-4 py-3 text-left text-sm font-semibold"></th>

            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="entry in entries" :key="entry.id" class="hover:bg-zinc-800 transition-colors">
              <td class="px-4 py-3 text-sm">
                  {{ entry.description }}

                  <span v-if="entry.expand && entry.expand.tag">
                    <n-tag round :bordered="false" type="success">
                      {{entry.expand.tag?entry.expand.tag.name:''}}
                      <template #icon>
                        <n-icon :component="Tag" />
                      </template>
                    </n-tag>
                  </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ formattedTime(entry.duration) }}</td>
              <td class="px-4 py-3 text-sm">

                <p v-if="entry.expand && entry.expand.project" :style="{color:entry.expand.project.color}">
                  <router-link :to="{ name: 'proyectos.show', params: { id: entry.expand.project.id } }">
                  {{entry.expand.project?entry.expand.project.name:''}}{{entry.expand.task?`:${entry.expand.task.name}`:''}} 
                  </router-link>
                </p>

              </td>
              <td class="px-4 py-3 text-sm">
                <DeleteTimeEntryModal :id="entry.id" />
              </td>


              
            </tr>
          </tbody>
        </table>

      </div>
      <div v-else>
        <n-empty description="You can't find anything">
          <template #extra>
            <n-button size="small">
              Find Something New
            </n-button>
          </template>
        </n-empty>
      </div>



    </div>



  </div>


</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router'
import DeleteTimeEntryModal from '@/components/time_entries/DeleteTimeEntryModal.vue'
import pb from '@/lib/pocketbase';
import { Tag } from '@vicons/tabler'

const entries = ref<any[]>([]);
const loading = ref(false);

const loadData = async () => {
  // Evitamos llamadas duplicadas si ya está cargando
  if (loading.value) return;

  loading.value = true;
  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('time_entries').getFullList<ProjectRecord>(
      {sort: '-created', expand: "project, task, tag"}
    );
    entries.value = records;
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
    loading.value = false; // El finally asegura que siempre se apague el loading
  }
}



const suscribeRealTimeProject = async () => {

  console.log('conectando')
  await pb.collection('time_entries').subscribe('*', (e) => {
    console.log('Realtime:', e.action, e.record);
    console.log('conectadito')

    if (e.action === 'create') {
      entries.value.unshift(e.record);
    } else if (e.action === 'update') {
      entries.value = entries.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      entries.value = entries.value.filter(item => item.id !== e.record.id);
    }
  }, {sort: '-created', expand: "project, task, tag"  });

};


const formattedTime = (s) => {
  const hours = Math.floor(s / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const seconds = (s % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}




onMounted(async () => {
  await loadData();
  suscribeRealTimeProject()
});
</script>