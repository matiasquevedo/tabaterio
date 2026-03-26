<template>
	<n-button 
		text 
		@click="setBillableState"
		:disable="loading"
		:loading="loading"
	>
		<template #icon>
			<n-icon v-if="billabe" size="24" color="#27272a">
			  <CurrencyDollar />
			</n-icon>
			<n-icon v-else size="24" color="#00c950">
			  <CurrencyDollar />
			</n-icon>
		</template>
		
	</n-button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import pb from '@/lib/pocketbase';

import { CurrencyDollar } from '@vicons/tabler'


const props = defineProps({
    id: String,
    nonBillable: Boolean,
})

const loading = ref(false)
const errors = ref({})

const billabe = ref(false)

// Inicializamos el ref. 
// Nota: Si el prop 'project' ya viene definido al cargar, esto funcionará.
const cloneForm = ref(null)



const setBillableState = async () => {
	loading.value = true
	let record = await pb.collection('time_entries').update(props.id, {"non_billable": !billabe.value });

	console.log(record)

	billabe.value = !billabe.value
	loading.value = false

}


onMounted(() => {
	billabe.value = props.nonBillable

})


</script>