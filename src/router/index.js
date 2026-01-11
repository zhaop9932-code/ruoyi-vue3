import { createRouter, createWebHistory } from 'vue-router'

// 静态路由
export const constantRoutes = [
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/index.vue'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: '/index',
        redirect: '/dashboard',
        hidden: true
      }
    ]
  },
  // 用户选择配置器路由
  {
    path: '/userselect',
    component: () => import('@/layout/index.vue'),
    redirect: '/userselect/configurator/list',
    hidden: true,
    children: [
      {
        path: 'configurator/list',
        component: () => import('@/views/userselect/configurator/list.vue'),
        name: 'UserSelectConfiguratorList',
        meta: { title: '产品配置选型' }
      },
      {
        path: 'configurator/:bomId',
        component: () => import('@/views/userselect/configurator/index.vue'),
        name: 'UserSelectConfiguratorDetail',
        meta: { title: '产品配置详情' }
      }
    ]
  },
  // 字典数据路由
  {
    path: '/system/dict-data',
    component: () => import('@/layout/index.vue'),
    hidden: true,
    children: [
      {
        path: 'index/:dictId',
        component: () => import('@/views/system/dict/data.vue'),
        name: 'DictData',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    name: 'Login',
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    name: 'Register',
    hidden: true
  },
  {
    path: '/redirect',
    component: () => import('@/layout/index.vue'),
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    name: '404',
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    name: '401',
    hidden: true
  }
]

// 动态路由 - 只保留404路由作为兜底，其他路由通过后端接口动态获取
export const dynamicRoutes = [
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes // 只包含静态路由，动态路由通过permission.js从后端获取并添加
})

export default router