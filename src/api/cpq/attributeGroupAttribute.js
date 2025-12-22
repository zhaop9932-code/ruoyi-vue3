import request from '@/utils/request'

// 查询属性组属性关联列表
export function listAttributeGroupAttribute(query) {
  return request({
    url: '/cpq/attributeGroupAttribute/list',
    method: 'get',
    params: query
  })
}

// 获取属性组属性关联详细信息
export function getAttributeGroupAttribute(attributeGroupAttributeId) {
  return request({
    url: '/cpq/attributeGroupAttribute/' + attributeGroupAttributeId,
    method: 'get'
  })
}

// 根据属性组ID查询属性列表
export function listAttributeGroupAttributes(attributeGroupId) {
  return request({
    url: '/cpq/attributeGroupAttribute/byGroup/' + attributeGroupId,
    method: 'get'
  })
}

// 新增属性组属性关联
export function addAttributeGroupAttribute(data) {
  return request({
    url: '/cpq/attributeGroupAttribute',
    method: 'post',
    data: data
  })
}

// 批量新增属性组属性关联
export function addAttributeGroupAttributeBatch(data) {
  return request({
    url: '/cpq/attributeGroupAttribute/batchBind',
    method: 'post',
    data: data
  })
}

// 修改属性组属性关联
export function updateAttributeGroupAttribute(data) {
  return request({
    url: '/cpq/attributeGroupAttribute',
    method: 'put',
    data: data
  })
}

// 删除属性组属性关联
export function delAttributeGroupAttribute(attributeGroupAttributeIds) {
  return request({
    url: '/cpq/attributeGroupAttribute/' + attributeGroupAttributeIds,
    method: 'delete'
  })
}

// 批量解除属性与属性组的关联
export function batchUnbindAttributeGroupAttribute(data) {
  return request({
    url: '/cpq/attributeGroupAttribute/batchUnbind',
    method: 'post',
    data: data
  })
}

// 查询未关联到属性组的属性列表
export function listUnassociatedAttributes(attributeGroupId, params) {
  return request({
    url: '/cpq/attributeGroupAttribute/unassociated/' + attributeGroupId,
    method: 'get',
    params: params
  })
}

// 检查属性是否已关联到属性组
export function checkAttributeGroupAttributeExist(data) {
  return request({
    url: '/cpq/attributeGroupAttribute/checkExist',
    method: 'post',
    data: data
  })
}

// 批量更新属性组属性配置
export function batchUpdateAttributeGroupAttributeConfig(configList) {
  return request({
    url: '/cpq/attributeGroupAttribute/batchUpdateConfig',
    method: 'post',
    data: configList
  })
}