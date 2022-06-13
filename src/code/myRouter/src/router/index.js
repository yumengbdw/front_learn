import Vue from 'vue'
import VueRouter from '../components/VueRouter'
import Index from '../views/Index.vue'
import Detail from '../views/Detail'
import About from '../views/About'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/detail',
    name: 'detail',
    component: Detail
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

const router = new VueRouter({
  routes
})

export default router
