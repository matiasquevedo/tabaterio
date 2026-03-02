<template>
    <AppLayout>
      
      <template #header>
        <div class="flex justify-between items-start">
          <h1 class="font-semibold text-2xl leading-tight">
              Proyectos
          </h1>

          <CreateModal/>

          <n-button @click="crear">
            crear proyecto
          </n-button>

        </div>
      </template>

      <div class="p-6">



        <div v-if="loading">
          cargando
        </div>
        <div v-else>
          
          <div v-if="exampleData.length">
            <div>
              <div v-for="item in exampleData" class="mb-3">
                <router-link :to="{ name: 'proyectos.show', params: { id: item.id } }">
                  <div class="border rounded-xl p-6"
                  >
                      <ColorCircle :color="item.color" /> {{item.name}}

                  </div>
                </router-link>
                {{item}}
              </div>
            </div>

              <pre>{{ exampleData }}</pre>


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
import { RouterLink } from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'
import ColorCircle from '@/components/ColorCircle.vue'
import { ref, onMounted } from 'vue';
import PocketBase from 'pocketbase';

// Definimos la interfaz para TypeScript
interface ProjectRecord {
  id: string;
  name: string;
  color: string;
}

const pb = new PocketBase('/'); 
const exampleData = ref<ProjectRecord[]>([]);
const loading = ref(false);

const loadData = async () => {
  // Evitamos llamadas duplicadas si ya está cargando
  if (loading.value) return;

  loading.value = true;
  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('projects').getFullList<ProjectRecord>();
    exampleData.value = records;
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
    loading.value = false; // El finally asegura que siempre se apague el loading
  }
}


const crear = async () => {
 try{
    const record = await pb.collection('projects').create({
        color: "#33691e",
        estimate: 13,
        in_dolars: false,
        rate: 40700,
    });
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } 
}

onMounted(() => {
  loadData();
});
</script>