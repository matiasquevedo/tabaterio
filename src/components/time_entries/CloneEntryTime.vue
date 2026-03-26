<template>
	<n-button type="primary" text @click="cloneEntry">

		<template #icon>
		  <n-icon>
		    <PlayerPlay />
		  </n-icon>
		</template>
		
	</n-button>
	<n-modal 
		v-model:show="showModal" 
		close-on-esc
		close-on-es
		preset="card"
		title="Eliminar"
		style="width: 700px"
		size="huge"
		role="dialog"
		aria-modal="true"
	>	
			{{cloneForm}}
			

			<template #footer>
				<div>
					<n-button type="error" block :loading="cloneForm.processing" :disabled="cloneForm.processing" @click="submit" attr-type="submit">Eliminar</n-button>


				</div>
			</template>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import pb from '@/lib/pocketbase';

import { PlayerPlay } from '@vicons/tabler'


const props = defineProps({
    id: String,
})

const showModal = ref(false)
const errors = ref({})

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const cloneForm = ref(null)

const openModal = () => {
    showModal.value = !showModal.value
}

const cloneEntry = async () => {
	let record = await pb.collection('time_entries').create(cloneForm.value);
}


onMounted(async ()=> {
	let record = await pb.collection('time_entries').getOne(props.id);
	cloneForm.value = {
		description: record.description,
		duration: 0,
		start: null as string | null,
		end: null as string | null,
		non_billable: record.non_billable,
		project: record.project,
		task: record.task,
		tag: record.tag,
		processing: false,
	}
})


</script>