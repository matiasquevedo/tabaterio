<template>
    <h1>PocketBase + Vue</h1>

    <div>
      <div v-for="item in exampleData">
        <n-button type="primary" @click="verNumerito(item.id)">
        {{item.id}} -> {{item.numerito}}
        </n-button>
      </div>
    </div>


    <div v-if="exampleData.length"  class="bg-red-700 text-blue-200">
        <pre>{{ exampleData }}</pre>
    </div>
    <p v-else>Cargando datos o colección vacía...</p>






    <!-- <button @click="loadData">Cargar</button> -->



    <!-- pb.collection('tasks').getOne<Task>("RECORD_ID") -->
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import pb from '@/lib/pocketbase'; // Importamos la instancia única
const exampleData = ref([]);

// Función para manejar la suscripción
const subscribeRealtime = async () => {
  console.log('Intentando conectar al realtime...');
  
  // '*' escucha cualquier cambio (create, update, delete)
  await pb.collection('example').subscribe('*', (e) => {
    console.log('Evento recibido:', e.action);
    console.log('Datos del registro:', e.record);

    // Lógica para actualizar la interfaz sin recargar todo:
    if (e.action === 'create') {
      exampleData.value.push(e.record);
    } else if (e.action === 'update') {
      exampleData.value = exampleData.value.map(item => 
        item.id === e.record.id ? e.record : item
      );
    } else if (e.action === 'delete') {
      exampleData.value = exampleData.value.filter(item => item.id !== e.record.id);
    }
  });
};

const loadInitialData = async () => {
    const records = await pb.collection('example').getFullList();
    exampleData.value = records;
}

onMounted(async () => {
  await loadInitialData(); // Primero cargamos lo que ya existe
  subscribeRealtime();     // Luego escuchamos cambios en vivo
});

// ¡IMPORTANTE! Limpiar la conexión al salir
onUnmounted(() => {
  pb.collection('example').unsubscribe('*');
});
</script>