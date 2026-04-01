<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-[#151d1a] relative overflow-hidden px-4">
    
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#52b788]/5 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-[420px] z-10">
      
      <div class="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="p-3 bg-[#1e2824] rounded-2xl border border-white/[0.05] shadow-xl mb-4">
          <img src="@/assets/logo.svg" width="48" height="48" alt="Tabaterio Logo" />
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight">Iniciar Sesión</h1>
      </div>

      <div class="bg-[#1e2824]/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/[0.04] shadow-2xl">
        
        <form @submit.prevent="submit" class="space-y-5">
          
          <n-form-item 
            label="Email" 
            :feedback="errors.email"
            :validation-status="errors.email ? 'error' : undefined"
            class="!mb-2"
          >
            <n-input
              v-model:value="authForm.email"
              placeholder="nombre@ejemplo.com"
              class="rounded-xl h-12 flex items-center bg-[#151d1a]/50 border-none font-medium"
              clearable
            /> 
          </n-form-item>

          <n-form-item 
            label="Contraseña" 
            :feedback="errors.password"
            :validation-status="errors.password ? 'error' : undefined"
          >
            <n-input
              type="password"
              show-password-on="click"
              v-model:value="authForm.password"
              placeholder="••••••••"
              class="rounded-xl h-12 flex items-center bg-[#151d1a]/50 border-none font-medium"
              @keyup.enter="submit"
            /> 
          </n-form-item>

          <div class="pt-4">
            <n-button 
              @click="submit" 
              block 
              class="rounded-2xl h-14 font-black tracking-wide !bg-[#52b788] hover:!bg-[#74c69d] border-none text-[#151d1a] shadow-lg shadow-[#52b788]/10 transition-all duration-300"
              :loading="loading"
            >
              INICIAR SESIÓN
            </n-button>
          </div>

        </form>

        <div class="mt-8 pt-6 border-t border-white/[0.03] text-center">
          <p class="text-xs font-bold text-[#9db4a9] uppercase tracking-widest">
            ¿No tienes cuenta? 
            <span class="text-[#52b788] cursor-pointer hover:underline ml-1">Contactar soporte</span>
          </p>
        </div>
      </div>

      <p class="text-center mt-10 text-[10px] font-bold text-[#2a3832] uppercase tracking-[0.2em]">
        2026 Tabaterio
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import pb from '@/lib/pocketbase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'

const router = useRouter()
const store = useAuthStore()
const message = useMessage()

const { login } = store

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const authForm = ref({
  email: '',
  password: '',
})

const submit = async () => {
  if (!authForm.value.email || !authForm.value.password) {
    message.warning('Por favor, completa todos los campos')
    return
  }

  errors.value = {}
  loading.value = true
  
  try {
    const { email, password } = authForm.value
    const authData = await pb.collection('users').authWithPassword(email, password)

    if (pb.authStore.isValid) {
      login(authData.record, authData.token)
      message.success('¡Hola de nuevo!')
      router.push({ name: 'tracker' })
    }
  } catch (e: any) {
    message.error('Credenciales inválidas')
    errors.value = { email: 'Verifica tus datos' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Ajuste para los labels de Naive UI en modo oscuro */
:deep(.n-form-item-label) {
  font-weight: 700 !important;
  color: #9db4a9 !important;
  font-size: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}
</style>