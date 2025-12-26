import request from '@/utils/request'

// 查询动态属性列表
export function listSuperBomDynamicAttribute(query) {
  return request({
    url: '/cpq/superBomDynamicAttribute/list',
    method: 'get',
    params: query
  })
}

// 根据BOM结构ID查询动态属性
export function getSuperBomDynamicAttributeByBomStructureId(bomStructureId) {
  return request({
    url: `/cpq/superBomDynamicAttribute/byBomStructureId/${bomStructureId}`,
    method: 'get'
  })
}

// 获取动态属性详情
export function getSuperBomDynamicAttribute(id) {
  return request({
    url: `/cpq/superBomDynamicAttribute/${id}`,
    method: 'get'
  })
}

// 新增动态属性
export function addSuperBomDynamicAttribute(data) {
  return request({
    url: '/cpq/superBomDynamicAttribute',
    method: 'post',
    data: data
  })
}

// 修改动态属性
export function updateSuperBomDynamicAttribute(data) {
  return request({
    url: '/cpq/superBomDynamicAttribute',
    method: 'put',
    data: data
  })
}

// 删除动态属性
export function deleteSuperBomDynamicAttribute(ids) {
  return request({
    url: `/cpq/superBomDynamicAttribute/${ids}`,
    method: 'delete'
  })
}

// 刷新动态属性
export function refreshSuperBomDynamicAttribute(bomStructureId) {
  return request({
    url: `/cpq/superBomDynamicAttribute/refresh/${bomStructureId}`,
    method: 'post'
  })
}
