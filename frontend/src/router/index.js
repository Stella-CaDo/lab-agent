import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/manager/home' },
    {
      path: '/manager',
      name: 'Layout',
      component: () => import('@/layouts/Layout.vue'),
      children: [
        { path: 'home', name: 'Home', component: () => import('@/views/Home.vue') },
        { path: 'lab', name: 'Lab', component: () => import('@/views/Lab.vue') },
        { path: 'user', name: 'User', component: () => import('@/views/User.vue') },
        { path: 'equ', name: 'Equ', component: () => import('@/views/Equ.vue') },
        { path: 'data', name: 'Data', component: () => import('@/views/Data.vue') },
        { path: 'booking', name: 'Booking', component: () => import('@/views/Booking.vue') }
      ]
    }
  ]
})

export default router
