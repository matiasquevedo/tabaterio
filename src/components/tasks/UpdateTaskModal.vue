<template>
	<n-button type="warning" text @click="openModal">
		<template #icon>
		  <n-icon>
		    <Pencil />
		  </n-icon>
		</template>
	</n-button>
	<n-modal 
		v-model:show="showModal" 
		close-on-esc
		close-on-es
		preset="card"
		:title="`Editar la tarea ${task.name}`"
		style="width: 700px"
		size="huge"
		role="dialog"
		aria-modal="true"
	>
			{{updateForm}}
			<form @submit.prevent="submit">

				<n-form-item label="Nombre" show-require-mark
				:feedback="errors.name?errors.name:''"
				>
				  <n-input
				  	v-model:value="updateForm.name"
				  	:status="errors.name?'error':''"
				  	placeholder="Nombre"
				  /> 
				</n-form-item>


				<n-form-item :label="`Rate (${dolars?'En Dólares':''})`" show-require-mark
				:feedback="errors.name?errors.name:''"
				>
				  <n-input-number 
				  	min="0"
				  	v-model:value="updateForm.task_rate"
				  	:status="errors.task_rate?'error':''"
				  	placeholder="Rate"
				  	clearable 
				  />
				</n-form-item>



			</form>


			<template #footer>
				<div>
					<n-button type="success" block :loading="updateForm.processing" :disabled="updateForm.processing" @click="submit" attr-type="submit">Editar</n-button>


				</div>
			</template>
	</n-modal>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import pb from '@/lib/pocketbase';
import { Pencil } from '@vicons/tabler'


const props = defineProps({
    project: String,
    dolars: Boolean,
    task: Object
})

const showModal = ref(false)
const errors = ref({})

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const updateForm = ref({
    project: props.project,
    processing: false,
    ...props.task
})

const openModal = () => {
    showModal.value = !showModal.value
}

const submit = async () => {
    updateForm.value.processing = true; // Feedback visual de carga
    errors.value = {}; // Limpiamos errores previos

    try {

        const record = await pb.collection('tasks').update(props.task.id, updateForm.value);

        
        showModal.value = false; // Cerramos el modal
    } catch (error) {
        console.error("Error en PocketBase:", error);
        // Aquí podrías mapear los errores que devuelve PocketBase a tu ref 'errors'
        errors.value = error.data?.data || {}; 
    } finally {
        updateForm.value.processing = false;
    }
}


</script>