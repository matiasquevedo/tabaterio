import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFound from '../views/NotFound.vue'
import ProjectsIndex from '../views/Projects/Index.vue'
import ProjectsShow from '../views/Projects/Show.vue'

import { useCounterStore } from '@/stores/counter'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Inicio' }
    },
    {
      path: '/proyectos',
      name: 'proyectos',
      component: ProjectsIndex,
      meta: { title: 'Proyectos' }
    },
    {
      path: '/proyecto/:id',
      name: 'proyectos.show',
      component: ProjectsShow,
      props: true,
      meta: { title: 'Proyectos' }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'Ejemplito' }

    },
  ],
})

router.beforeEach((to, from, next) => {
  const store = useCounterStore()

  console.log(`valor en el router:${store.count}`)

  let appName = 'Tabaterio'
  document.title = ` -> ${to.meta.title} | ${appName}`;
  next();
});


export default router
