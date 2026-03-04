<template>

	<n-dropdown trigger="click" :options="options" @select="handleSelect">
	  <n-button 
	  	type="info" 
	  	text 
	  	@click="handleClick"
	  >
	  	<template #icon>
	  		<n-icon>
	  			<CirclePlus />
	  		</n-icon>
	  	</template>

	  	Proyecto{{selected?`:${selected.label}`:''}}
	  </n-button>

	</n-dropdown>



</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CirclePlus } from '@vicons/tabler'
import { useMessage } from 'naive-ui'
import pb from '@/lib/pocketbase';

const message = useMessage()
const showDropdown = ref(false)

const emit = defineEmits(['selectProject'])



const options = ref([])
const selected = ref(null)


const loadProjects = async () => {
  // Evitamos llamadas duplicadas si ya está cargando

  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('projects').getFullList();
    options.value = records.map((p)=>{
    	return { label: p.name, key: p.id}
    })
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
  }
}


function handleClick() {
  loadProjects()
}


function handleSelect(key, option) {
  console.log(option.label)
  selected.value = option
  emit('selectProject', key)
}
</script>