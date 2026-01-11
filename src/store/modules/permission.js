import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import { isExternal } from '@/utils/validate'

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
            
            // 添加动态路由到路由实例
            addRoutesToRouter(router, asyncRoutes)
            addRoutesToRouter(router, rewriteRoutes)
            
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
      // 处理对象类型的component属性
      if (typeof route.component === 'object') {
        console.warn(`发现对象类型的component属性: ${route.path}`);
        route.component = Layout;
      } else if (route.component === 'Layout') {
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
      // 不要删除redirect属性，确保路由能正确重定向
      delete route['children']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    // 跳过外部链接，外部链接不需要拼接父路径
    if (!isExternal(el.path)) {
      el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    }
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 添加路由到路由实例
export function addRoutesToRouter(router, routes) {
  routes.forEach(route => {
    // 跳过外部链接，外部链接由前端通过window.open处理
    if (!isExternal(route.path)) {
      // 直接添加整个路由对象，包括其children
      router.addRoute(route)
    }
  })
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

export const loadView = (view) => {
  let res
  // 确保view是字符串
  if (typeof view !== 'string') {
    console.error(`组件路径不是字符串: ${view}`);
    return () => import('@/views/error/404.vue')
  }
  
  // 标准化组件路径，移除首尾斜杠
  const normalizedView = view.replace(/^\/+|\/+$/g, '')
  
  for (const path in modules) {
    let dir
    // 处理@/views/开头的路径
    if (path.startsWith('@/views/')) {
      dir = path.replace('@/views/', '').replace('.vue', '')
    } else {
      // 处理其他路径格式
      dir = path.replace(/^.*views\//, '').replace('.vue', '')
    }
    
    // 标准化dir路径，移除首尾斜杠
    const normalizedDir = dir.replace(/^\/+|\/+$/g, '')
    
    if (normalizedDir === normalizedView) {
      console.log(`找到组件: ${view} -> ${path}`)
      res = () => modules[path]()
      break
    }
  }
  
  // 如果找到组件，返回组件加载函数
  if (res) {
    return res
  }
  
  // 如果没有找到组件，打印所有可用路径以便调试
  console.error(`未找到组件: ${view}`)
  console.log('可用的组件路径:', Object.keys(modules).map(p => {
    let dir
    if (p.startsWith('@/views/')) {
      dir = p.replace('@/views/', '').replace('.vue', '')
    } else {
      dir = p.replace(/^.*views\//, '').replace('.vue', '')
    }
    return dir
  }))
  
  // 返回404组件，避免页面空白
  return () => import('@/views/error/404.vue')
}

export default usePermissionStore
