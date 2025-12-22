import request from '@/utils/request'

// 查询超级BOM变量列表
export function listSuperBomVariable(query) {
  return request({
    url: '/cpq/superBomVariable/list',
    method: 'post',
    data: query
  })
}

// 获取超级BOM变量详情
export function getSuperBomVariableInfo(variableId) {
  return request({
    url: '/cpq/superBomVariable/getInfo',
    method: 'post',
    data: variableId
  })
}

// 根据BOM ID查询变量
export function getSuperBomVariableByBomId(bomId) {
  return request({
    url: '/cpq/superBomVariable/getByBomId',
    method: 'post',
    data: bomId
  })
}

// 新增超级BOM变量
export function addSuperBomVariable(data) {
  return request({
    url: '/cpq/superBomVariable/add',
    method: 'post',
    data: data
  })
}

// 编辑超级BOM变量
export function updateSuperBomVariable(data) {
  return request({
    url: '/cpq/superBomVariable/edit',
    method: 'post',
    data: data
  })
}

// 删除超级BOM变量
export function removeSuperBomVariable(variableIds) {
  return request({
    url: '/cpq/superBomVariable/remove',
    method: 'post',
    data: variableIds
  })
}

// 导出超级BOM变量列表
export function exportSuperBomVariable(query) {
  return request({
    url: '/cpq/superBomVariable/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}