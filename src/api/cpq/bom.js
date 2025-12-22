import request from '@/utils/request'

// 超级BOM管理
export function listSuperBom(query) {
  return request({
    url: '/cpq/superBom/list',
    method: 'get',
    params: query
  })
}

export function getSuperBom(bomId) {
  return request({
    url: `/cpq/superBom/${bomId}`,
    method: 'get'
  })
}

export function addSuperBom(data) {
  return request({
    url: '/cpq/superBom',
    method: 'post',
    data: data
  })
}

export function updateSuperBom(data) {
  return request({
    url: '/cpq/superBom',
    method: 'put',
    data: data
  })
}

export function deleteSuperBom(bomIds) {
  return request({
    url: `/cpq/superBom/${bomIds}`,
    method: 'delete'
  })
}

export function checkBomCodeUnique(bomCode) {
  return request({
    url: `/cpq/superBom/checkBomCodeUnique/${bomCode}`,
    method: 'get'
  })
}

// BOM结构管理
export function listBomStructure(query) {
  return request({
    url: '/cpq/bomStructure/list',
    method: 'get',
    params: query
  })
}

export function getBomStructure(structureId) {
  return request({
    url: `/cpq/bomStructure/${structureId}`,
    method: 'get'
  })
}

export function addBomStructure(data) {
  return request({
    url: '/cpq/bomStructure',
    method: 'post',
    data: data
  })
}

export function updateBomStructure(data) {
  return request({
    url: '/cpq/bomStructure',
    method: 'put',
    data: data
  })
}

export function deleteBomStructure(structureIds) {
  return request({
    url: `/cpq/bomStructure/${structureIds}`,
    method: 'delete'
  })
}

// BOM节点管理
export function listBomNode(query) {
  return request({
    url: '/cpq/bomNode/list',
    method: 'get',
    params: query
  })
}

export function getBomNode(nodeId) {
  return request({
    url: `/cpq/bomNode/${nodeId}`,
    method: 'get'
  })
}

export function addBomNode(data) {
  return request({
    url: '/cpq/bomNode',
    method: 'post',
    data: data
  })
}

export function updateBomNode(data) {
  return request({
    url: '/cpq/bomNode',
    method: 'put',
    data: data
  })
}

export function deleteBomNode(nodeIds) {
  return request({
    url: `/cpq/bomNode/${nodeIds}`,
    method: 'delete'
  })
}

// 超级BOM结构管理
export function listSuperBomStructure(query) {
  return request({
    url: '/cpq/superBomStructure/list',
    method: 'get',
    params: query
  })
}

export function listSuperBomStructureTree(bomId) {
  return request({
    url: `/cpq/superBomStructure/listByBomId/${bomId}`,
    method: 'get'
  })
}

export function listSuperBomStructureByParentNodeId(parentNodeId) {
  return request({
    url: `/cpq/superBomStructure/listByParentNodeId/${parentNodeId}`,
    method: 'get'
  })
}

export function listSuperBomStructureByRootNodeId(rootNodeId) {
  return request({
    url: `/cpq/superBomStructure/listByRootNodeId/${rootNodeId}`,
    method: 'get'
  })
}

export function addSuperBomStructure(data) {
  return request({
    url: '/cpq/superBomStructure',
    method: 'post',
    data: data
  })
}

export function updateSuperBomStructure(data) {
  return request({
    url: '/cpq/superBomStructure',
    method: 'put',
    data: data
  })
}

export function deleteSuperBomStructure(bomStructureIds) {
  return request({
    url: `/cpq/superBomStructure/${bomStructureIds}`,
    method: 'delete'
  })
}

// BOM结构属性管理
export function listSuperBomStructureAttribute(query) {
  return request({
    url: '/cpq/superBomStructureAttribute/list',
    method: 'get',
    params: query
  })
}

export function listSuperBomStructureAttributeByBomStructureId(bomStructureId) {
  return request({
    url: `/cpq/superBomStructureAttribute/listByBomStructureId/${bomStructureId}`,
    method: 'get'
  })
}

export function batchAddSuperBomStructureAttribute(data) {
  return request({
    url: '/cpq/superBomStructureAttribute/batch',
    method: 'post',
    data: data
  })
}

export function updateSuperBomStructureAttribute(bomStructureId, attributes) {
  return request({
    url: `/cpq/superBomStructureAttribute/updateAttributes/${bomStructureId}`,
    method: 'put',
    data: { attributes }
  })
}

// BOM结构属性值管理
export function listSuperBomStructureAttributeValue(query) {
  return request({
    url: '/cpq/superBomStructureAttributeValue/list',
    method: 'get',
    params: query
  })
}

export function listSuperBomStructureAttributeValueByBomStructureId(bomStructureId) {
  return request({
    url: `/cpq/superBomStructureAttributeValue/listByBomStructureId/${bomStructureId}`,
    method: 'get'
  })
}

export function listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId(bomStructureId, attributeId) {
  return request({
    url: `/cpq/superBomStructureAttributeValue/listByBomStructureIdAndAttributeId/${bomStructureId}/${attributeId}`,
    method: 'get'
  })
}

export function getSuperBomStructureAttributeValue(id) {
  return request({
    url: `/cpq/superBomStructureAttributeValue/${id}`,
    method: 'get'
  })
}

export function addSuperBomStructureAttributeValue(data) {
  return request({
    url: '/cpq/superBomStructureAttributeValue',
    method: 'post',
    data: data
  })
}

export function batchAddSuperBomStructureAttributeValue(data) {
  return request({
    url: '/cpq/superBomStructureAttributeValue/batch',
    method: 'post',
    data: data
  })
}

export function updateSuperBomStructureAttributeValue(data) {
  return request({
    url: '/cpq/superBomStructureAttributeValue',
    method: 'put',
    data: data
  })
}

export function updateAttributeValues(bomStructureId, attributeValues) {
  return request({
    url: `/cpq/superBomStructureAttributeValue/updateAttributeValues/${bomStructureId}`,
    method: 'put',
    data: attributeValues
  })
}

export function deleteSuperBomStructureAttributeValue(ids) {
  return request({
    url: `/cpq/superBomStructureAttributeValue/${ids}`,
    method: 'delete'
  })
}
