import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFound from '../views/NotFound.vue'
import ProjectsIndex from '../views/Projects/Index.vue'
import ProjectsShow from '../views/Projects/Show.vue'
import Login from '../views/Auth/Login.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- REDIRECCIÓN DINÁMICA DE LA RAÍZ ---
    { 
      path: '/', 
      name: 'root',
      // Si entran a "/", redirigimos al tracker (el Guard decidirá si lo deja pasar o lo manda al login)
      redirect: { name: 'tracker' }
    },
    // ---------------------------------------
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    {
      path: '/tracker',
      name: 'tracker',
      component: HomeView,
      meta: { title: 'Home', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Iniciar Sesión', guestOnly: true }
    },
    {
      path: '/proyectos',
      name: 'proyectos',
      component: ProjectsIndex,
      meta: { title: 'Proyectos', requiresAuth: true }
    },
    {
      path: '/proyecto/:id',
      name: 'proyectos.show',
      component: ProjectsShow,
      props: true,
      meta: { title: 'Ver Proyecto', requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'Acerca de' }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  // 1. Título de la pestaña
  let appName = 'Tabaterio'
  document.title = `${to.meta.title ? to.meta.title + ' |' : ''} ${appName}`;

  const isLogged = auth.isLogin

  // --- LÓGICA DE PROTECCIÓN ACTUALIZADA ---

  // A) Si la ruta requiere auth y NO está logueado -> al Login
  if (to.meta.requiresAuth && !isLogged) {
    next({ name: 'login' })
  } 
  // B) Si la ruta es guestOnly (Login) y YA está logueado -> al Tracker
  else if (to.meta.guestOnly && isLogged) {
    next({ name: 'tracker' })
  } 
  // C) Caso especial: Si "/" no cae en los anteriores, el redirect de la ruta
  // activará una nueva navegación hacia 'tracker', que será evaluada por el caso A.
  else {
    next()
  }
});

export default router