<template>
    <AppLayout>
      
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="font-semibold text-2xl leading-tight">
              Proyectos
          </h1>

          <CreateModal/>


          <CreateProjectModal />

        </div>
      </template>

      <div class="p-6">



        <div v-if="loading">
          cargando
        </div>
        <div v-else>
          
          <div v-if="projects.length">
            <div>
              <div v-for="item in projects" class="m-3">
                <router-link :to="{ name: 'proyectos.show', params: { id: item.id } }">
                  <div class="border rounded-xl p-6 flex gap-2 items-center"
                  >
                      <ColorCircle :color="item.color" /> {{item.name}}

                  </div>
                </router-link>
              </div>
            </div>

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


    </AppLayout>


</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router'
import pb from '@/lib/pocketbase';

import AppLayout from '@/layout/AppLayout.vue'
import ColorCircle from '@/components/ColorCircle.vue'

import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'


// Definimos la interfaz para TypeScript
interface ProjectRecord {
  id: string;
  name: string;
  color: string;
}

const projects = ref<any[]>([]);
const loading = ref(false);

const loadData = async () => {
  // Evitamos llamadas duplicadas si ya está cargando
  if (loading.value) return;

  loading.value = true;
  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('projects').getFullList<ProjectRecord>();
    projects.value = records;
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
    loading.value = false; // El finally asegura que siempre se apague el loading
  }
}



const suscribeRealTimeProject = async () => {

  console.log('conectando')
  await pb.collection('projects').subscribe('*', (e) => {
    console.log('Realtime:', e.action, e.record);
    console.log('conectadito')

    if (e.action === 'create') {
      projects.value.push(e.record);
    } else if (e.action === 'update') {
      projects.value = projects.value.map(item => item.id === e.record.id ? e.record : item);
    } else if (e.action === 'delete') {
      projects.value = projects.value.filter(item => item.id !== e.record.id);
    }
  });

};





onMounted(async () => {
  await loadData();
  suscribeRealTimeProject()
});
</script>