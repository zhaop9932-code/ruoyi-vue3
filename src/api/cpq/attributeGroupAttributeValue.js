import request from '@/utils/request'

// 查询属性组属性值列表
export function listAttributeGroupAttributeValue(query) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/list',
    method: 'get',
    params: query
  })
}

// 获取属性组属性值详情
export function getAttributeGroupAttributeValue(id) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/' + id,
    method: 'get'
  })
}

// 根据属性组属性ID查询属性值列表
export function getAttributeGroupAttributeValueByAttributeGroupAttributeId(attributeGroupAttributeId) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/byAttributeGroupAttribute/' + attributeGroupAttributeId,
    method: 'get'
  })
}

// 新增属性组属性值
export function addAttributeGroupAttributeValue(data) {
  return request({
    url: '/cpq/attributeGroupAttributeValue',
    method: 'post',
    data: data
  })
}

// 批量新增属性组属性值
export function batchInsertAttributeGroupAttributeValue(data) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/batchInsert',
    method: 'post',
    data: data
  })
}

// 修改属性组属性值
export function updateAttributeGroupAttributeValue(data) {
  return request({
    url: '/cpq/attributeGroupAttributeValue',
    method: 'put',
    data: data
  })
}

// 批量修改属性组属性值
export function batchUpdateAttributeGroupAttributeValue(data) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/batchUpdate',
    method: 'post',
    data: data
  })
}

// 删除属性组属性值
export function delAttributeGroupAttributeValue(ids) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/' + ids,
    method: 'delete'
  })
}

// 根据属性组属性ID批量删除属性值
export function delAttributeGroupAttributeValueByAttributeGroupAttributeId(attributeGroupAttributeIds) {
  return request({
    url: '/cpq/attributeGroupAttributeValue/byAttributeGroupAttribute/' + attributeGroupAttributeIds,
    method: 'delete'
  })
}