import request from '@/utils/request'

// 根据BOM ID查询BOM结构列表
export function listByBomId(bomId) {
  return request({
    url: `/cpq/superBomStructure/listByBomId/${bomId}`,
    method: 'get'
  })
}

// 根据父节点ID查询BOM结构列表
export function listByParentNodeId(parentNodeId) {
  return request({
    url: `/cpq/superBomStructure/listByParentNodeId/${parentNodeId}`,
    method: 'get'
  })
}

// 根据根节点ID查询BOM结构列表
export function listByRootNodeId(rootNodeId) {
  return request({
    url: `/cpq/superBomStructure/listByRootNodeId/${rootNodeId}`,
    method: 'get'
  })
}

// 查询BOM结构列表
export function listSuperBomStructure(query) {
  return request({
    url: '/cpq/superBomStructure/list',
    method: 'post',
    data: query
  })
}

// 获取BOM结构详情
export function getSuperBomStructureInfo(bomStructureId) {
  return request({
    url: `/cpq/superBomStructure/getInfo/${bomStructureId}`,
    method: 'get'
  })
}

// 新增BOM结构
export function addSuperBomStructure(data) {
  return request({
    url: '/cpq/superBomStructure/add',
    method: 'post',
    data: data
  })
}

// 编辑BOM结构
export function updateSuperBomStructure(data) {
  return request({
    url: '/cpq/superBomStructure/edit',
    method: 'post',
    data: data
  })
}

// 删除BOM结构
export function removeSuperBomStructure(structureIds) {
  return request({
    url: '/cpq/superBomStructure/remove',
    method: 'post',
    data: structureIds
  })
}