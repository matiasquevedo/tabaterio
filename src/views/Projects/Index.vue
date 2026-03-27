<template>
  <AppLayout title="Proyectos">
    
    <template #header>
      <CreateProjectModal />
    </template>

    <div class="mt-4">
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4 text-[#9db4a9]">
        <span class="h-8 w-8 rounded-full border-3 border-t-[#52b788] border-[#2a3832] animate-spin"></span>
        <span class="text-sm font-medium tracking-wide">Cultivando tus proyectos...</span>
      </div>

      <div v-else>
        
        <div v-if="projects.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div v-for="item in projects" :key="item.id">
            <router-link :to="{ name: 'proyectos.show', params: { id: item.id } }" class="block h-full">
              <div class="group h-full p-6 bg-[#1e2824] hover:bg-[#2a3832] border border-white/[0.03] rounded-3xl transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-[#52b788]/5 hover:-translate-y-1.5 flex items-center justify-between">
                
                <div class="flex items-center gap-4">
                  <ColorCircle :color="item.color" size="md" /> 
                  <span class="text-base font-bold text-white group-hover:text-[#74c69d] transition-colors duration-200">
                    {{ item.name }}
                  </span>
                </div>

                <span class="flex items-center justify-center h-8 w-8 rounded-full bg-[#2a3832] group-hover:bg-[#52b788] text-[#9db4a9] group-hover:text-[#151d1a] transition-all duration-300 transform group-hover:rotate-[-45deg]">
                  →
                </span>

              </div>
            </router-link>
          </div>

        </div>

        <div v-else class="py-16 bg-[#1e2824] rounded-3xl border border-white/[0.03] shadow-lg flex flex-col items-center justify-center">
          <n-empty description="Aún no hay proyectos plantados">
            <template #icon>
              <span class="text-5xl">🌱</span>
            </template>
            <template #extra>
              <div class="flex flex-col items-center gap-5 mt-4">
                <span class="text-sm text-[#9db4a9] max-w-xs text-center leading-relaxed">
                  Crea un proyecto para agrupar tus pomodoros y medir tu enfoque de forma visual.
                </span>
                
                <n-button 
                  type="primary" 
                  ghost 
                  class="rounded-xl font-bold tracking-wide h-11 px-6 !border-[#52b788] !text-[#52b788] hover:!bg-[#52b788]/10"
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