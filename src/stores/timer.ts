import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimerStore = defineStore('timer', () => {
  const run = ref(false)
  const phase = ref<'prepare' | 'work' | 'pause' | 'stop'>('stop')

  function setPhase(phaseArr){
    phase.value = phaseArr
  }

  function execute() {
    run.value = !run.value
  }

  return { run, phase, execute, setPhase }
})
