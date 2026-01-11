import request from '@/utils/request'

// 解决方案管理
export function listSolution(query) {
  return request({
    url: '/cpq/solution/list',
    method: 'get',
    params: query
  })
}

export function getSolution(solutionId) {
  return request({
    url: `/cpq/solution/${solutionId}`,
    method: 'get'
  })
}

export function addSolution(data) {
  return request({
    url: '/cpq/solution',
    method: 'post',
    data: data
  })
}

export function updateSolution(data) {
  return request({
    url: '/cpq/solution',
    method: 'put',
    data: data
  })
}

export function deleteSolution(solutionIds) {
  return request({
    url: `/cpq/solution/${solutionIds}`,
    method: 'delete'
  })
}

// 方案组件管理
export function listSolutionComponent(query) {
  return request({
    url: '/cpq/solutionComponent/listWithProduct',
    method: 'get',
    params: query
  })
}

// 方案组件管理（带产品信息）
export function listSolutionComponentWithProduct(query) {
  return request({
    url: '/cpq/solutionComponent/listWithProduct',
    method: 'get',
    params: query
  })
}

export function getSolutionComponent(componentId) {
  return request({
    url: `/cpq/solutionComponent/withProduct/${componentId}`,
    method: 'get'
  })
}

export function addSolutionComponent(data) {
  return request({
    url: '/cpq/solutionComponent',
    method: 'post',
    data: data
  })
}

export function updateSolutionComponent(data) {
  return request({
    url: '/cpq/solutionComponent',
    method: 'put',
    data: data
  })
}

export function deleteSolutionComponent(componentIds) {
  return request({
    url: `/cpq/solutionComponent/${componentIds}`,
    method: 'delete'
  })
}

export function getSolutionComponentsBySolutionId(solutionId) {
  return request({
    url: `/cpq/solutionComponent/bySolutionIdWithProduct/${solutionId}`,
    method: 'get'
  })
}

export function exportSolutionComponent(query) {
  return request({
    url: '/cpq/solutionComponent/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
