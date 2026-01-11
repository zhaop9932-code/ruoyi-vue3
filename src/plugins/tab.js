import useTagsViewStore from '@/store/modules/tagsView'
import router from '@/router'

export default {
  // 刷新当前tab页签
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute.value
    let refreshPath = path
    let refreshQuery = query
    
    // 如果提供了obj，使用obj中的路径和查询参数
    if (obj) {
      // 检查obj是否包含fullPath（来自标签页）
      if (obj.fullPath) {
        // 从完整路径中提取路径和查询参数
        const url = new URL(obj.fullPath, window.location.origin)
        refreshPath = url.pathname
        refreshQuery = { ...obj.query }
      } else {
        // 直接使用obj中的path和query
        refreshPath = obj.path
        refreshQuery = obj.query || query
      }
    } else {
      // 没有提供obj，从当前路由中获取信息
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: refreshPath, query: refreshQuery }
          }
        }
      })
    }
    
    // 创建用于删除缓存的obj对象
    const cacheObj = obj || { name: '', path: refreshPath, query: refreshQuery }
    
    return useTagsViewStore().delCachedView(cacheObj).then(() => {
      // 使用重定向机制实现页面刷新
      // 先跳转到一个临时路径，再跳回原路径，确保组件重新加载
      router.replace({
        path: '/redirect' + refreshPath,
        query: refreshQuery
      })
    })
  },
  // 关闭当前tab页签，打开新页签
  closeOpenPage(obj) {
    useTagsViewStore().delView(router.currentRoute.value)
    if (obj !== undefined) {
      return router.push(obj)
    }
  },
  // 关闭指定tab页签
  closePage(obj) {
    if (obj === undefined) {
      return useTagsViewStore().delView(router.currentRoute.value).then(({ visitedViews }) => {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return router.push(latestView.fullPath)
        }
        return router.push('/')
      })
    }
    return useTagsViewStore().delView(obj)
  },
  // 关闭所有tab页签
  closeAllPage() {
    return useTagsViewStore().delAllViews()
  },
  // 关闭左侧tab页签
  closeLeftPage(obj) {
    return useTagsViewStore().delLeftTags(obj || router.currentRoute.value)
  },
  // 关闭右侧tab页签
  closeRightPage(obj) {
    return useTagsViewStore().delRightTags(obj || router.currentRoute.value)
  },
  // 关闭其他tab页签
  closeOtherPage(obj) {
    return useTagsViewStore().delOthersViews(obj || router.currentRoute.value)
  },
  // 打开tab页签
  openPage(title, url, params) {
    const obj = { path: url, meta: { title: title } }
    useTagsViewStore().addView(obj)
    return router.push({ path: url, query: params })
  },
  // 修改tab页签
  updatePage(obj) {
    return useTagsViewStore().updateVisitedView(obj)
  }
}
