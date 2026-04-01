import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import pb from '@/lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  // Inicializamos con lo que ya tenga PocketBase (esto sobrevive al F5)
  const user = ref(pb.authStore.record)
  const token = ref(pb.authStore.token)
  const isLogin = ref(pb.authStore.isValid)

  function login(pbRecord: any, pbToken: string) {
    user.value = pbRecord
    token.value = pbToken
    isLogin.value = true
  }

  function logout() {
    pb.authStore.clear() // Limpia localStorage
    user.value = null
    token.value = null
    isLogin.value = false
  }

  return { isLogin, token, user, login, logout }
})