<template>
	<n-select 
		v-model:value="selected" 
		filterable tag 
		:options="options" 
		:on-focus="handleClick" 
		@update:value="handleSelect"
		size="small"
	/>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CirclePlus } from '@vicons/tabler'
import { useMessage } from 'naive-ui'
import pb from '@/lib/pocketbase';

const message = useMessage()
const showDropdown = ref(false)

const emit = defineEmits(['selectTag'])



const options = ref([])
const tagOptions = ref([])
const selected = ref(null)
const selectedTask = ref(null)


const loadProjects = async () => {
  // Evitamos llamadas duplicadas si ya está cargando

  try {
    // Usamos el nombre de la colección correcto
    const records = await pb.collection('tags').getFullList();
    console.log(records)
    options.value = records.map((p)=>{
    	return { label: p.name, key: p.id  }
    })
  } catch (error) {
    console.error("Error en PocketBase:", error);
  } finally {
  }
}


function handleClick() {
  loadProjects()
}

const submit = async () => {

    let id
    try {
        // IMPORTANTE: pasamos createForm.value
        const record = await pb.collection('tags').create({name: selected.value});
        id = record.id
    } catch (error) {
        console.error("Error en PocketBase:", error);
    } finally {
    }

    return id
}




async function handleSelect(key, option) {
  selected.value = option.label
  

  let exist = options.value.some(item => item.key === option.key);
  console.log(exist)

  if (exist) {
  	emit('selectTag', option.key)
  }else{
  	let key = await submit()
  	emit('selectTag', key)

  }



}

</script>