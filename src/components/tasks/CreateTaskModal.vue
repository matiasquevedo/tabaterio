<template>
	<n-button type="primary" text @click="openModal">Nueva Tarea</n-button>
	<n-modal 
		v-model:show="showModal" 
		close-on-esc
		close-on-es
		preset="card"
		title="Nueva Tarea"
		style="width: 700px"
		size="huge"
		role="dialog"
		aria-modal="true"
	>
			
			<form @submit.prevent="submit">

				<n-form-item label="Nombre" show-require-mark
				:feedback="errors.name?errors.name:''"
				>
				  <n-input
				  	v-model:value="createForm.name"
				  	:status="errors.name?'error':''"
				  	placeholder="Nombre"
				  /> 
				</n-form-item>


				<n-form-item :label="`Rate (${dolars?'En Dólares':''})`" show-require-mark
				:feedback="errors.name?errors.name:''"
				>
				  <n-input-number 
				  	min="0"
				  	v-model:value="createForm.task_rate"
				  	:status="errors.task_rate?'error':''"
				  	placeholder="Rate"
				  	clearable 
				  />
				</n-form-item>



			</form>


			<template #footer>
				<div>
					<n-button type="success" block :loading="createForm.processing" :disabled="createForm.processing" @click="submit" attr-type="submit">Crear</n-button>


				</div>
			</template>
	</n-modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import PocketBase from 'pocketbase';

const pb = new PocketBase('/'); 

const props = defineProps({
    project: String,
    dolars: Boolean
})

const showModal = ref(false)
const errors = ref({})

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const createForm = ref({
    name: '',
    project: props.project, // Se asigna al inicio
    task_rate: 0,
    processing: false
})

const openModal = () => {
    showModal.value = !showModal.value
}

const submit = async () => {
    createForm.value.processing = true; // Feedback visual de carga
    errors.value = {}; // Limpiamos errores previos

    try {
        // IMPORTANTE: pasamos createForm.value
        const record = await pb.collection('tasks').create(createForm.value);
        
        // Limpiamos el formulario después de crear (excepto el proyecto)
        createForm.value.name = '';
        createForm.value.rate = 0;
        
        showModal.value = false; // Cerramos el modal
    } catch (error) {
        console.error("Error en PocketBase:", error);
        // Aquí podrías mapear los errores que devuelve PocketBase a tu ref 'errors'
        errors.value = error.data?.data || {}; 
    } finally {
        createForm.value.processing = false;
    }
}
</script>