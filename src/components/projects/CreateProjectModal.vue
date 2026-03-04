<template>
	<n-button type="primary" text @click="openModal">Nuevo Proyecto</n-button>
	<n-modal 
		v-model:show="showModal" 
		close-on-esc
		close-on-es
		preset="card"
		title="Nuevo Proyecto"
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




				<div class="grid grid-cols-4 items-center gap-3">
					<div class="col-span-3">
						<n-form-item :label="`Rate`" show-require-mark
						:feedback="errors.rate?errors.rate:''"
						>
						  <n-input-number 
						  	min="0"
						  	v-model:value="createForm.rate"
						  	:status="errors.rate?'error':''"
						  	placeholder="Rate"
						  	clearable 
						  />
						</n-form-item>
					</div>
					<div class="col-span-1">
						
						<n-form-item :label="`Dolares?`" show-require-mark
						:feedback="errors.in_dolars?errors.in_dolars:''"
						>
						  <n-switch 
						  	:status="errors.in_dolars?'error':''"
						  	v-model:value="createForm.in_dolars" 
						  	size="medium"
						  >
						    <template #icon>
						      💚
						    </template>
						  </n-switch>
						</n-form-item>
					</div>
				</div>






				<n-form-item :label="`Horas Estimadas (0 para libre)`" show-require-mark
				:feedback="errors.estimate?errors.estimate:''"
				>
				  <n-input-number 
				  	min="0"
				  	v-model:value="createForm.estimate"
				  	:status="errors.estimate?'error':''"
				  	placeholder="Rate"
				  	clearable 
				  />
				</n-form-item>


				<div class="grid grid-cols-4 items-center gap-3">
					<div class="col-span-3">
						<n-form-item label="Color"
						:feedback="errors.name?errors.name:''"
						>
							<n-color-picker
								v-model:value="createForm.color"
								:status="errors.name?'error':''"
								placeholder="Color"
								:swatches="swatches"
							/>
						</n-form-item>
					</div>
					<div>
						<n-button @click="change_color">

							<template #icon>
								<n-icon>
									<ArrowsShuffle/>
								</n-icon>
							</template>
						</n-button>
					</div>
				</div>




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
import pb from '@/lib/pocketbase';
import { ArrowsShuffle } from '@vicons/tabler'

const showModal = ref(false)
const errors = ref({})

const swatches = ref([])

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const createForm = ref({
    name: '',
    color: '',
    rate: 40,
    in_dolars: true,
    estimate: 0,
    processing: false
})

const openModal = () => {
    showModal.value = !showModal.value
}


// Source - https://stackoverflow.com/a/12276501
// Posted by Jack Liu Shurui, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-03, License - CC BY-SA 3.0

const get_random_color = () => {
  // Generate a random number between 0 and 0xFFFFFF (16777215 in decimal)
  const randomNum = Math.floor(Math.random() * 0xFFFFFF); 
  // Convert the number to a hexadecimal string
  let hexColor = randomNum.toString(16); 
  
  // Pad with leading zeros if the generated hex string is less than 6 digits
  // The padStart() method ensures the result is always 6 characters long
  hexColor = hexColor.padStart(6, '0');

  return `#${hexColor.toUpperCase()}`;
}

const change_color = () =>{
	createForm.value.color = get_random_color()
}


const submit = async () => {
    createForm.value.processing = true; // Feedback visual de carga
    errors.value = {}; // Limpiamos errores previos

    try {
        // IMPORTANTE: pasamos createForm.value
        const record = await pb.collection('projects').create(createForm.value);
        
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


onMounted(()=>{
	change_color()
	for (let i = 0; i < 40; i++) {
	  swatches.value.push(get_random_color())
	}
})
</script>