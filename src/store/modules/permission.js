import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('@/views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            
            // 添加动态路由到路由表
            asyncRoutes.forEach(route => { router.addRoute(route) })
            
            // 添加从后端获取的路由到路由表
            rewriteRoutes.forEach(route => {
              if (!route.path.startsWith('http') && !route.path.startsWith('https')) {
                try {
                  router.addRoute(route)
                  console.log(`成功添加路由: ${route.path}`)
                } catch (error) {
                  console.error(`添加路由失败: ${route.path}`, error)
                }
              }
            })
            
            // 添加404路由到最后
            router.addRoute({
              path: "/:pathMatch(.*)*",
              component: () => import('@/views/error/404.vue'),
              hidden: true
            })
            
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            resolve(rewriteRoutes)
          })
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

// 组件加载函数，使用import.meta.glob预加载所有组件
export const loadView = (view) => {
  // 确保view是字符串
  if (typeof view !== 'string') {
    console.error(`组件路径不是字符串: ${view}`)
    return () => import('@/views/error/404.vue')
  }
  
  // 标准化组件路径，确保格式统一
  let normalizedView = view
  
  // 处理各种可能的组件路径格式
  if (normalizedView.startsWith('@/views/')) {
    // 已标准化路径，直接使用
    normalizedView = normalizedView
  } else if (normalizedView.startsWith('./views/')) {
    normalizedView = normalizedView.replace('./views/', '@/views/')
  } else if (normalizedView.startsWith('../views/')) {
    normalizedView = normalizedView.replace('../views/', '@/views/')
  } else if (normalizedView.startsWith('/views/')) {
    normalizedView = '@' + normalizedView
  } else if (normalizedView.startsWith('./')) {
    normalizedView = '@/views/' + normalizedView.replace('./', '')
  } else if (normalizedView.startsWith('../')) {
    normalizedView = '@/views/' + normalizedView.replace('../', '')
  } else if (!normalizedView.startsWith('@/')) {
    // 默认情况，添加@/views/前缀
    normalizedView = '@/views/' + normalizedView
  }
  
  // 确保路径以.vue结尾
  if (!normalizedView.endsWith('.vue')) {
    normalizedView += '.vue'
  }
  
  // 查找匹配的组件
  for (const path in modules) {
    if (path === normalizedView) {
      console.log(`找到组件: ${view} -> ${path}`)
      return modules[path]
    }
  }
  
  // 如果没有找到组件，尝试移除.vue扩展名再次查找
  const viewWithoutExt = normalizedView.replace('.vue', '')
  for (const path in modules) {
    if (path === viewWithoutExt) {
      console.log(`找到组件: ${view} -> ${path}`)
      return modules[path]
    }
  }
  
  // 如果仍然没有找到，尝试更宽松的匹配，但避免匹配错误的组件
  // 只在没有找到精确匹配时使用，且只匹配包含完整路径段的组件
  const viewPathParts = normalizedView.split('/')
  const viewName = viewPathParts.pop().replace('.vue', '')
  const viewDir = viewPathParts.pop()
  
  for (const path in modules) {
    // 尝试匹配包含视图目录和视图名称的路径，提高匹配准确性
    if (path.includes(viewDir) && path.includes(viewName)) {
      console.log(`找到组件: ${view} -> ${path}`)
      return modules[path]
    }
  }
  
  // 如果还是没有找到，尝试匹配最后一部分路径
  const lastTwoParts = `${viewDir}/${viewName}`
  for (const path in modules) {
    if (path.includes(lastTwoParts)) {
      console.log(`找到组件: ${view} -> ${path}`)
      return modules[path]
    }
  }
  
  // 如果没有找到组件，打印错误信息
  console.error(`未找到组件: ${view}，标准化路径: ${normalizedView}`)
  console.log('可用的组件路径:', Object.keys(modules))
  
  // 返回404组件
  return () => import('@/views/error/404.vue')
}

export default usePermissionStore
