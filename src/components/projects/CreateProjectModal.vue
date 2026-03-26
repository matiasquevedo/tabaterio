<template>
  <n-button 
    type="primary" 
    class="rounded-xl font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300"
    @click="openModal"
  >
    <template #icon>
      <span class="text-lg">+</span>
    </template>
    Nuevo Proyecto
  </n-button>

  <n-modal 
    v-model:show="showModal" 
    close-on-esc
    preset="card"
    title="🚀 Crear Nuevo Proyecto"
    style="width: 600px" 
    class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
    size="huge"
    role="dialog"
    aria-modal="true"
  >   
    <form @submit.prevent="submit" class="space-y-2">

      <n-form-item 
        label="Nombre del proyecto" 
        :feedback="errors.name"
        :validation-status="errors.name ? 'error' : undefined"
      >
        <n-input
          v-model:value="createForm.name"
          placeholder="Ej: Rediseño de Plataforma"
          class="rounded-lg"
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
              class="w-full rounded-lg"
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
          class="w-full rounded-lg"
          clearable 
        />
      </n-form-item>

      <div class="grid grid-cols-4 items-end gap-4">
        <div class="col-span-3">
          <n-form-item label="Identificador visual (Color)">
            <n-color-picker
              v-model:value="createForm.color"
              :swatches="swatches"
              class="rounded-lg"
            />
          </n-form-item>
        </div>

        <div class="col-span-1 pb-3">
          <n-button 
            @click="change_color" 
            secondary 
            class="w-full rounded-lg h-[34px] flex items-center justify-center"
            title="Generar color aleatorio"
          >
            <template #icon>
              <n-icon size="18" class="text-slate-300">
                <ArrowsShuffle />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>

    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3 pt-2">
        <n-button 
          secondary 
          class="rounded-lg" 
          @click="showModal = false"
          :disabled="createForm.processing"
        >
          Cancelar
        </n-button>

        <n-button 
          type="primary" 
          class="rounded-lg px-6 font-semibold"
          :loading="createForm.processing" 
          :disabled="createForm.processing" 
          @click="submit" 
          attr-type="submit"
        >
          Crear Proyecto
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
    // Desestructuramos para no enviar 'processing' a PocketBase
    const { processing, ...payload } = createForm.value;
    
    await pb.collection('projects').create(payload);
    
    // Limpieza amigable
    createForm.value.name = '';
    createForm.value.rate = 40;
    createForm.value.estimate = 0;
    change_color(); // Reiniciar a un color nuevo
    
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