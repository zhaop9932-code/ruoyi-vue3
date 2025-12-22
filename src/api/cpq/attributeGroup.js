import request from '@/utils/request'

// 查询属性组列表
export function listAttributeGroup(query) {
  return request({
    url: '/cpq/attributeGroup/list',
    method: 'get',
    params: query
  })
}

// 根据类目ID查询属性组列表（完整列表，不分页）
export function listAttributeGroupByCatalog(catalogId) {
  return request({
    url: `/cpq/attributeGroup/byCatalog/${catalogId}`,
    method: 'get'
  })
}

// 查询属性组详细
export function getAttributeGroup(attributeGroupId) {
  return request({
    url: '/cpq/attributeGroup/' + attributeGroupId,
    method: 'get'
  })
}

// 新增属性组
export function addAttributeGroup(data) {
  return request({
    url: '/cpq/attributeGroup',
    method: 'post',
    data: data
  })
}

// 修改属性组
export function updateAttributeGroup(data) {
  return request({
    url: '/cpq/attributeGroup',
    method: 'put',
    data: data
  })
}

// 删除属性组
export function delAttributeGroup(attributeGroupId) {
  return request({
    url: '/cpq/attributeGroup/' + attributeGroupId,
    method: 'delete'
  })
}

// 批量删除属性组
export function delAttributeGroupBatch(ids) {
  return request({
    url: '/cpq/attributeGroup/batch',
    method: 'delete',
    data: ids
  })
}

// 检查属性组编码是否唯一
export function checkAttributeGroupCodeUnique(attributeGroupCode, attributeGroupId) {
  return request({
    url: '/cpq/attributeGroup/checkCodeUnique',
    method: 'get',
    params: { attributeGroupCode, attributeGroupId }
  })
}

// 调整属性组顺序
export function updateAttributeGroupOrder(attributeGroupId, sortOrder) {
  return request({
    url: '/cpq/attributeGroup/updateOrder',
    method: 'put',
    params: { attributeGroupId, sortOrder }
  })
}