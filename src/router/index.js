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
      }
    ]
  },
  // CPQ系统路由移到这里，使其成为静态路由
  {
    path: '/cpq',
    component: () => import('@/layout/index.vue'),
    redirect: '/cpq/product',
    name: 'Cpq',
    meta: { title: 'CPQ系统', icon: 'shopping', alwaysShow: true },
    children: [
      {
          path: 'product',
          component: () => import('@/views/cpq/product/index.vue'),
          name: 'CpqProduct',
          meta: { title: '产品管理', icon: 'example' }
        },
        {
          path: 'product/catalog',
          component: () => import('@/views/cpq/product/catalog.vue'),
          name: 'CpqProductCatalog',
          meta: { title: '产品目录', icon: 'nested' }
        },
      {
        path: 'product/attribute',
        component: () => import('@/views/cpq/product/attribute.vue'),
        name: 'CpqProductAttribute',
        meta: { title: '产品属性', icon: 'list' }
      },
      {
        path: 'brand',
        component: () => import('@/views/cpq/brand/index.vue'),
        name: 'CpqBrand',
        meta: { title: '品牌管理', icon: 'brand' }
      },
      {
        path: 'series',
        component: () => import('@/views/cpq/series/index.vue'),
        name: 'CpqSeries',
        meta: { title: '系列管理', icon: 'category' }
      },
      {
        path: 'bom',
        component: () => import('@/views/cpq/bom/index.vue'),
        name: 'CpqBom',
        meta: { title: 'BOM管理', icon: 'tree-table' }
      },
      {
        path: 'bom/structure',
        component: () => import('@/views/cpq/bom/structure.vue'),
        name: 'CpqBomStructure',
        meta: { title: 'BOM结构', icon: 'tree' }
      },
      {
        path: 'bom/manage',
        component: () => import('@/views/cpq/bom/manage.vue'),
        name: 'CpqBomManage',
        meta: { title: 'BOM管理详情', icon: 'settings' },
        hidden: true
      },
      {
        path: 'rule',
        component: () => import('@/views/cpq/rule/index.vue'),
        name: 'CpqRule',
        meta: { title: '配置规则', icon: 'edit' }
      },
      {
        path: 'pricing',
        component: () => import('@/views/cpq/pricing/strategy.vue'),
        name: 'CpqPricing',
        meta: { title: '定价管理', icon: 'money' }
      },
      {
        path: 'solution',
        component: () => import('@/views/cpq/solution/index.vue'),
        name: 'CpqSolution',
        meta: { title: '解决方案', icon: 'setting' }
      },
      {
        path: 'quote',
        component: () => import('@/views/cpq/quote/index.vue'),
        name: 'CpqQuote',
        meta: { title: '报价管理', icon: 'document' }
      },
      {
        path: 'attributeGroupAttribute',
        component: () => import('@/views/cpq/attributeGroupAttribute/index.vue'),
        name: 'CpqAttributeGroupAttribute',
        meta: { title: '属性组属性关联', icon: 'component' }
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

// 动态路由
export const dynamicRoutes = [
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/user',
    name: 'System',
    meta: { title: '系统管理', icon: 'system', alwaysShow: true },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user', permissions: ['system:user:list'] }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'peoples', permissions: ['system:role:list'] }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index.vue'),
        name: 'Menu',
        meta: { title: '菜单管理', icon: 'tree', permissions: ['system:menu:list'] }
      },
      {
        path: 'dept',
        component: () => import('@/views/system/dept/index.vue'),
        name: 'Dept',
        meta: { title: '部门管理', icon: 'tree-table', permissions: ['system:dept:list'] }
      },
      {
        path: 'post',
        component: () => import('@/views/system/post/index.vue'),
        name: 'Post',
        meta: { title: '岗位管理', icon: 'post', permissions: ['system:post:list'] }
      },
      {
        path: 'dict',
        component: () => import('@/views/system/dict/index.vue'),
        name: 'Dict',
        meta: { title: '字典管理', icon: 'dict', permissions: ['system:dict:list'] }
      },
      {
        path: 'config',
        component: () => import('@/views/system/config/index.vue'),
        name: 'Config',
        meta: { title: '参数设置', icon: 'setting', permissions: ['system:config:list'] }
      },
      {
        path: 'notice',
        component: () => import('@/views/system/notice/index.vue'),
        name: 'Notice',
        meta: { title: '通知公告', icon: 'message', permissions: ['system:notice:list'] }
      }
    ]
  },
  {
    path: '/monitor',
    component: () => import('@/layout/index.vue'),
    redirect: '/monitor/online',
    name: 'Monitor',
    meta: { title: '系统监控', icon: 'monitor', alwaysShow: true },
    children: [
      {
        path: 'online',
        component: () => import('@/views/monitor/online/index.vue'),
        name: 'Online',
        meta: { title: '在线用户', icon: 'online', permissions: ['monitor:online:list'] }
      },
      {
        path: 'logininfor',
        component: () => import('@/views/monitor/logininfor/index.vue'),
        name: 'Logininfor',
        meta: { title: '登录日志', icon: 'logininfor', permissions: ['monitor:logininfor:list'] }
      },
      {
        path: 'operlog',
        component: () => import('@/views/monitor/operlog/index.vue'),
        name: 'Operlog',
        meta: { title: '操作日志', icon: 'log', permissions: ['monitor:operlog:list'] }
      },
      {
        path: 'job',
        component: () => import('@/views/monitor/job/index.vue'),
        name: 'Job',
        meta: { title: '定时任务', icon: 'job', permissions: ['monitor:job:list'] }
      },
      {
        path: 'druid',
        component: () => import('@/views/monitor/druid/index.vue'),
        name: 'Druid',
        meta: { title: '数据监控', icon: 'druid', permissions: ['monitor:druid:list'] }
      },
      {
        path: 'cache',
        component: () => import('@/views/monitor/cache/index.vue'),
        name: 'Cache',
        meta: { title: '缓存监控', icon: 'redis', permissions: ['monitor:cache:list'] }
      },
      {
        path: 'server',
        component: () => import('@/views/monitor/server/index.vue'),
        name: 'Server',
        meta: { title: '服务监控', icon: 'server', permissions: ['monitor:server:list'] }
      }
    ]
  },
  {
    path: '/tool',
    component: () => import('@/layout/index.vue'),
    redirect: '/tool/gen',
    name: 'Tool',
    meta: { title: '工具管理', icon: 'tool', alwaysShow: true },
    children: [
      {
        path: 'gen',
        component: () => import('@/views/tool/gen/index.vue'),
        name: 'Gen',
        meta: { title: '代码生成', icon: 'code', permissions: ['tool:gen:list'] }
      },
      {
        path: 'build',
        component: () => import('@/views/tool/build/index.vue'),
        name: 'Build',
        meta: { title: '表单构建', icon: 'build', permissions: ['tool:build:list'] }
      },
      {
        path: 'swagger',
        component: () => import('@/views/tool/swagger/index.vue'),
        name: 'Swagger',
        meta: { title: '系统接口', icon: 'swagger', permissions: ['tool:swagger:list'] }
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/layout/index.vue'),
    hidden: true,
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router