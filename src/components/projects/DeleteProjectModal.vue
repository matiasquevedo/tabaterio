<template>
	<n-button type="error" block @click="openModal">

		<template #icon>
		  <n-icon>
		    <Trash />
		  </n-icon>
		</template>

		Eliminar Proyecto {{name}}
		
	</n-button>
	<n-modal 
		v-model:show="showModal" 
		close-on-esc
		close-on-es
		preset="card"
		title="Eliminar Tarea"
		style="width: 700px"
		size="huge"
		role="dialog"
		aria-modal="true"
	>	
			<div>
				Eliminar el proyecto <b>{{name}}</b>
			</div>

			

			<template #footer>
				<div>
					<n-button type="error" block :loading="createForm.processing" :disabled="createForm.processing" @click="submit" attr-type="submit">Eliminar</n-button>


				</div>
			</template>
	</n-modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Trash } from '@vicons/tabler'
import pb from '@/lib/pocketbase';



const router = useRouter()

const props = defineProps({
    id: String,
    name: String,
    project: String,
})

const showModal = ref(false)
const errors = ref({})

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const createForm = ref({
    id: props.id,
})

const openModal = () => {
    showModal.value = !showModal.value
}

const submit = async () => {
    createForm.value.processing = true; // Feedback visual de carga
    errors.value = {}; // Limpiamos errores previos

    try {
        // IMPORTANTE: pasamos createForm.value
        await pb.collection('projects').delete(props.id);
        
        // Limpiamos el formulario después de crear (excepto el proyecto)
        createForm.value.name = '';
        createForm.value.rate = 0;
        
        showModal.value = false; // Cerramos el modal

        router.push({name: 'proyectos'})
    } catch (error) {
        console.error("Error en PocketBase:", error);
        // Aquí podrías mapear los errores que devuelve PocketBase a tu ref 'errors'
        errors.value = error.data?.data || {}; 
    } finally {
        createForm.value.processing = false;
    }
}
</script>