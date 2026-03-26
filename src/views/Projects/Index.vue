<template>
  <AppLayout title="Proyectos">
    
    <template #header>
      <CreateProjectModal />
    </template>

    <div class="mt-4">
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <span class="h-6 w-6 rounded-full border-2 border-t-cyan-400 border-slate-700 animate-spin"></span>
        <span class="text-sm font-medium tracking-wide">Cargando tus proyectos...</span>
      </div>

      <div v-else>
        
        <div v-if="projects.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div v-for="item in projects" :key="item.id">
            <router-link :to="{ name: 'proyectos.show', params: { id: item.id } }">
              <div class="group h-full p-6 bg-slate-900 hover:bg-slate-800/80 border border-slate-800/60 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
                
                <div class="flex items-center gap-3">
                  <ColorCircle :color="item.color" size="md" /> 
                  <span class="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
                    {{ item.name }}
                  </span>
                </div>

                <span class="text-slate-500 group-hover:text-white transition-colors duration-200 transform group-hover:translate-x-1">
                  →
                </span>

              </div>
            </router-link>
          </div>

        </div>

        <div v-else class="py-16 bg-slate-900/50 rounded-2xl border border-slate-800/50">
          <n-empty description="Parece que no hay proyectos aún">
            <template #extra>
              <div class="flex flex-col items-center gap-4 mt-2">
                <span class="text-sm text-slate-400">¡Creá tu primer proyecto para empezar a trackear!</span>
                <n-button 
                  type="primary" 
                  ghost 
                  class="rounded-lg font-medium"
                >
                  Nuevo Proyecto
                </n-button>
              </div>
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

interface ProjectRecord {
  id: string;
  name: string;
  color: string;
}

const projects = ref<ProjectRecord[]>([]);
const loading = ref(false);

const loadData = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const records = await pb.collection('projects').getFullList<ProjectRecord>();
    projects.value = records;
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
    loading.value = false;
  }
}

const suscribeRealTimeProject = async () => {
  await pb.collection('projects').subscribe('*', (e) => {
    if (e.action === 'create') {
      projects.value.push(e.record as ProjectRecord);
    } else if (e.action === 'update') {
      projects.value = projects.value.map(item => item.id === e.record.id ? (e.record as ProjectRecord) : item);
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