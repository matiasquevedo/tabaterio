<template>
	<n-button type="error" text @click="openModal">

		<template #icon>
		  <n-icon>
		    <Trash />
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
			<div>
				¿Está seguro que quiere eliminar la entrada?
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
import pb from '@/lib/pocketbase';

import { Trash } from '@vicons/tabler'


const props = defineProps({
    id: String,
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
        await pb.collection('time_entries').delete(props.id);
        
        
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