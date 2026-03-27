<template>
  <n-button 
    type="primary" 
    class="rounded-2xl font-bold tracking-wide shadow-lg shadow-[#52b788]/20 hover:shadow-[#52b788]/30 transition-all duration-300 h-11 px-5 !bg-[#52b788] hover:!bg-[#74c69d] border-none"
    @click="openModal"
  >
    <template #icon>
      <span class="text-xl font-bold">+</span>
    </template>
    Nuevo Proyecto
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="🌱  Nuevo Proyecto"
    style="width: 550px" 
    class="rounded-3xl bg-[#1e2824] border border-white/[0.04] shadow-2xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >   
    <form @submit.prevent="submit" class="space-y-4">

      <n-form-item 
        label="Nombre del proyecto" 
        :feedback="errors.name"
        :validation-status="errors.name ? 'error' : undefined"
      >
        <n-input
          v-model:value="createForm.name"
          placeholder="Ej: Rediseño de Plataforma o Estudio de Historia"
          class="rounded-xl h-11 flex items-center bg-[#2a3832]"
          clearable
        /> 
      </n-form-item>

      <div class="grid grid-cols-4 items-end gap-4">
        <div class="col-span-3">
          <n-form-item 
            label="Tarifa por hora" 
            :feedback="errors.rate"
            :validation-status="errors.rate ? 'error' : undefined"
          >
            <n-input-number 
              v-model:value="createForm.rate"
              :min="0"
              placeholder="0.00"
              class="w-full rounded-xl h-11 flex items-center bg-[#2a3832]"
              clearable 
            />
          </n-form-item>
        </div>

        <div class="col-span-1 pb-3">
          <n-form-item label="¿En dólares?" :show-feedback="false">
            <n-switch 
              v-model:value="createForm.in_dolars" 
              size="medium"
              class="mt-1"
            />
          </n-form-item>
        </div>
      </div>

      <n-form-item 
        label="Horas estimadas (0 para libre)" 
        :feedback="errors.estimate"
        :validation-status="errors.estimate ? 'error' : undefined"
      >
        <n-input-number 
          v-model:value="createForm.estimate"
          :min="0"
          placeholder="0"
          class="w-full rounded-xl h-11 flex items-center bg-[#2a3832]"
          clearable 
        />
      </n-form-item>

      <div class="grid grid-cols-4 items-end gap-4">
        <div class="col-span-3">
          <n-form-item label="Identificador visual (Color)">
            <n-color-picker
              v-model:value="createForm.color"
              :swatches="swatches"
              class="rounded-xl bg-[#2a3832]"
            />
          </n-form-item>
        </div>

        <div class="col-span-1 pb-3">
          <n-button 
            @click="change_color" 
            secondary 
            class="w-full rounded-xl h-11 flex items-center justify-center bg-[#2a3832] border border-white/[0.04] hover:bg-[#364941]"
            title="Generar color aleatorio"
          >
            <template #icon>
              <n-icon size="18" class="text-[#9db4a9] group-hover:text-white">
                <ArrowsShuffle />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>

    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-4 pt-2">
        <n-button 
          secondary 
          class="rounded-xl h-11 px-5 border border-white/[0.04] bg-[#2a3832] text-[#f4f9f4] hover:bg-[#364941]" 
          @click="showModal = false"
          :disabled="createForm.processing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="primary" 
          class="rounded-xl h-11 px-6 font-bold tracking-wide !bg-[#52b788] hover:!bg-[#74c69d] border-none text-[#151d1a] shadow-lg shadow-[#52b788]/10"
          :loading="createForm.processing" 
          :disabled="createForm.processing" 
          @click="submit" 
          attr-type="submit"
        >
          Comenzar Proyecto
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import pb from '@/lib/pocketbase';
import { ArrowsShuffle } from '@vicons/tabler'

interface CreateForm {
  name: string;
  color: string;
  rate: number;
  in_dolars: boolean;
  estimate: number;
  processing: boolean;
}

const showModal = ref(false)
const errors = ref<Record<string, string>>({})
const swatches = ref<string[]>([])

const createForm = ref<CreateForm>({
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

const get_random_color = (): string => {
  const randomNum = Math.floor(Math.random() * 0xFFFFFF); 
  let hexColor = randomNum.toString(16); 
  hexColor = hexColor.padStart(6, '0');
  return `#${hexColor.toUpperCase()}`;
}

const change_color = () => {
  createForm.value.color = get_random_color()
}

const submit = async () => {
  createForm.value.processing = true;
  errors.value = {}; 

  try {
    const { processing, ...payload } = createForm.value;
    
    await pb.collection('projects').create(payload);
    
    createForm.value.name = '';
    createForm.value.rate = 40;
    createForm.value.estimate = 0;
    change_color(); 
    
    showModal.value = false; 
  } catch (error: any) {
    console.error("Error en PocketBase:", error);
    errors.value = error.data?.data || {}; 
  } finally {
    createForm.value.processing = false;
  }
}

onMounted(() => {
  change_color()
  for (let i = 0; i < 40; i++) {
    swatches.value.push(get_random_color())
  }
})
</script>