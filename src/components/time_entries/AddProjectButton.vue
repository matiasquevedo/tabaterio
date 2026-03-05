<template>

	<div class="flex gap-3">
		<div>
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
		</div>
		<div>
			<n-dropdown v-if="selected" trigger="click" :options="tagOptions" @select="handleSelectTask">
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

			  	Tarea{{selectedTask?`:${selectedTask.label}`:''}}
			  </n-button>


			</n-dropdown>

		</div>
	</div>


</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CirclePlus } from '@vicons/tabler'
import { useMessage } from 'naive-ui'
import pb from '@/lib/pocketbase';

const message = useMessage()
const showDropdown = ref(false)

const emit = defineEmits(['selectProject','selectTask'])



const options = ref([])
const tagOptions = ref([])
const selected = ref(null)
const selectedTask = ref(null)


const loadProjects = async () => {
  // Evitamos llamadas duplicadas si ya está cargando

  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('projects').getFullList({
    	expand: "tasks_via_project" 
    });
    console.log(records)
    options.value = records.map((p)=>{
    	let children = []
    	if (p.expand?.tasks_via_project) {
    		children = p.expand?.tasks_via_project.map((t)=>{
    			return { label: t.name, key: t.id }
    		})
    	}
    	return { label: p.name, key: p.id, tasks:children  }
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
  console.log(option)
  selected.value = option
  tagOptions.value = option.tasks
  emit('selectProject', key)
}

function handleSelectTask(key, option) {
  console.log(option)
  selectedTask.value = option
  emit('selectTask', key)
}
</script>