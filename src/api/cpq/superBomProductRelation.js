import request from '@/utils/request'

// 查询BOM产品关联列表
export function listSuperBomProductRelation(query) {
  return request({
    url: '/cpq/superBomProductRelation/list',
    method: 'post',
    data: query,
    headers: {
      repeatSubmit: false
    }
  })
}

// 获取BOM产品关联详情
export function getSuperBomProductRelationInfo(relationId) {
  return request({
    url: '/cpq/superBomProductRelation/getInfo',
    method: 'post',
    data: relationId
  })
}

// 根据BOM ID查询关联关系
export function getSuperBomProductRelationByBomId(bomId) {
  return request({
    url: '/cpq/superBomProductRelation/getByBomId',
    method: 'post',
    data: bomId
  })
}

// 根据BOM ID和关联类型查询关联关系
export function getSuperBomProductRelationByBomIdAndType(data) {
  return request({
    url: '/cpq/superBomProductRelation/getByBomIdAndType',
    method: 'post',
    data: data
  })
}

// 根据BOM ID和结构ID查询关联关系列表
export function getSuperBomProductRelationByBomIdAndStructureId(data) {
  return request({
    url: '/cpq/superBomProductRelation/getByBomIdAndStructureId',
    method: 'post',
    data: data
  })
}

// 根据BOM ID、结构ID和关联类型查询关联关系列表
export function getSuperBomProductRelationByBomIdStructureIdAndType(data) {
  return request({
    url: '/cpq/superBomProductRelation/getByBomIdStructureIdAndType',
    method: 'post',
    data: data
  })
}

// 根据产品ID查询关联的BOM
export function getSuperBomProductRelationByProductId(productId) {
  return request({
    url: '/cpq/superBomProductRelation/getByProductId',
    method: 'post',
    data: productId
  })
}

// 根据系列ID查询关联的BOM
export function getSuperBomProductRelationBySeriesId(seriesId) {
  return request({
    url: '/cpq/superBomProductRelation/getBySeriesId',
    method: 'post',
    data: seriesId
  })
}

// 根据目录ID查询关联的BOM
export function getSuperBomProductRelationByCatalogId(catalogId) {
  return request({
    url: '/cpq/superBomProductRelation/getByCatalogId',
    method: 'post',
    data: catalogId
  })
}

// 新增BOM产品关联
export function addSuperBomProductRelation(data) {
  return request({
    url: '/cpq/superBomProductRelation/add',
    method: 'post',
    data: data
  })
}

// 编辑BOM产品关联
export function updateSuperBomProductRelation(data) {
  return request({
    url: '/cpq/superBomProductRelation/edit',
    method: 'post',
    data: data
  })
}

// 批量删除BOM产品关联
export function removeSuperBomProductRelation(relationIds) {
  return request({
    url: '/cpq/superBomProductRelation/remove',
    method: 'post',
    data: relationIds
  })
}

// 批量新增BOM产品关联
export function batchAddSuperBomProductRelation(data) {
  return request({
    url: '/cpq/superBomProductRelation/batchAdd',
    method: 'post',
    data: data
  })
}

// 新增或更新BOM与产品的关联关系
export function saveOrUpdateSuperBomProductRelation(data) {
  return request({
    url: '/cpq/superBomProductRelation/saveOrUpdate',
    method: 'post',
    data: data
  })
}