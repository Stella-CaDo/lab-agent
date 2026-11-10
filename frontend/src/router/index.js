import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/manager/home' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/manager',
    name: 'Layout',
    component: () => import('@/layouts/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '系统首页' }
      },
      {
        path: 'lab',
        name: 'Lab',
        component: () => import('@/views/Lab.vue'),
        meta: { title: '实验室管理' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'equ',
        name: 'Equ',
        component: () => import('@/views/Equ.vue'),
        meta: { title: '设备管理' }
      },
      {
        path: 'data',
        name: 'Data',
        component: () => import('@/views/Data.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('@/views/Booking.vue'),
        meta: { title: '预约管理' }
      }
    ]
  },
  // 必须放最后，否则会吃掉前面所有路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const TOKEN_KEY = 'lab_token'

// 守卫里直接读 localStorage，不在这里 useAuthStore()：
// 避免模块加载时 pinia 还没装好，也避免循环依赖
router.beforeEach((to) => {
  const logged = Boolean(localStorage.getItem(TOKEN_KEY))

  if (!logged && to.path !== '/login') {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (logged && to.path === '/login') {
    return { path: '/manager/home' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? to.meta.title + ' - 实验室预约系统' : '实验室预约系统'
})

export default router
