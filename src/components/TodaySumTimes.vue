<template>

  <div class="p-6">


    <div v-if="loading">
      cargando
    </div>
    <div v-else class="text-xl">
      
      <div v-if="entries.length">
        Hoy: {{formattedTime(sumTime)}}
      </div>
      <div v-else>
        Hoy: {{formattedTime(0)}}
      </div>


    </div>



  </div>


</template>



<script setup lang="ts">
import { ref, onMounted, computed} from 'vue';
import { RouterLink } from 'vue-router'
import { format, endOfDay, startOfDay } from 'date-fns'
import _ from 'lodash'
import pb from '@/lib/pocketbase';

import DeleteTimeEntryModal from '@/components/time_entries/DeleteTimeEntryModal.vue'



const entries = ref<any[]>([]);
const loading = ref(false);

const todayStart = format(startOfDay(new Date()), "y-MM-dd HH:mm:ss.SSS'Z'")
const todayEnd = format(endOfDay(new Date()), "y-MM-dd HH:mm:ss.SSS'Z'")

const dateFilter = `created >= '${todayStart}' && created <= '${todayEnd}'`

const loadData = async () => {
  // Evitamos llamadas duplicadas si ya está cargando
  if (loading.value) return;

  loading.value = true;
  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('time_entries').getFullList(
      {fields:'id,duration', sort: '-created', filter: dateFilter}
    );
    console.log(records)
    entries.value = records;
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
    loading.value = false; // El finally asegura que siempre se apague el loading
  }
}

const sumTime = computed(()=>{
  return _.sumBy(entries.value, function(o) { return o.duration; });
})



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
  },  {fields:'id, duration', sort: '-created', filter: dateFilter});

};


const formattedTime = (s) => {
  const hours = Math.floor(s / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const seconds = (s % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}




onMounted(async () => {
  console.log('montdado')
  await loadData();
  suscribeRealTimeProject()
});
</script>