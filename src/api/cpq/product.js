import request from '@/utils/request'

// 产品主数据管理
export function listProduct(query) {
  return request({
    url: '/cpq/product/list',
    method: 'get',
    params: query
  })
}

export function getProduct(productId) {
  return request({
    url: `/cpq/product/${productId}`,
    method: 'get'
  })
}

export function addProduct(data) {
  return request({
    url: '/cpq/product',
    method: 'post',
    data: data
  })
}

export function updateProduct(data) {
  return request({
    url: '/cpq/product',
    method: 'put',
    data: data
  })
}

export function deleteProduct(productIds) {
  return request({
    url: `/cpq/product/${productIds}`,
    method: 'delete'
  })
}

// 产品属性管理
export function listAttribute(query) {
  return request({
    url: '/cpq/attribute/list',
    method: 'get',
    params: query
  })
}

export function getAttribute(attributeId) {
  return request({
    url: `/cpq/attribute/${attributeId}`,
    method: 'get'
  })
}

export function addAttribute(data) {
  return request({
    url: '/cpq/attribute',
    method: 'post',
    data: data
  })
}

export function updateAttribute(data) {
  return request({
    url: '/cpq/attribute',
    method: 'put',
    data: data
  })
}

export function deleteAttribute(attributeIds) {
  return request({
    url: `/cpq/attribute/${attributeIds}`,
    method: 'delete'
  })
}

export function checkAttributeCodeUnique(data) {
  return request({
    url: '/cpq/attribute/checkAttributeCodeUnique',
    method: 'post',
    data: data
  })
}

// 产品属性值管理
export function listAttributeValue(query) {
  return request({
    url: '/cpq/attribute/value/list',
    method: 'get',
    params: query
  })
}

export function getAttributeValue(id) {
  return request({
    url: `/cpq/attribute/value/${id}`,
    method: 'get'
  })
}

export function addAttributeValue(data) {
  return request({
    url: '/cpq/attribute/value',
    method: 'post',
    data: data
  })
}

export function updateAttributeValue(data) {
  return request({
    url: '/cpq/attribute/value',
    method: 'put',
    data: data
  })
}

export function deleteAttributeValue(ids) {
  return request({
    url: `/cpq/attribute/value/${ids}`,
    method: 'delete'
  })
}

// 产品属性关联管理
export function listProductAttributeRelation(productId) {
  return request({
    url: `/cpq/productAttributeRelation/list/${productId}`,
    method: 'get'
  })
}

export function batchUpdateProductAttributeRelation(data) {
  return request({
    url: '/cpq/productAttributeRelation/batchUpdate',
    method: 'post',
    data: data
  })
}

// 自动集成目录属性
export function autoIntegrateCatalogAttributes(productId) {
  return request({
    url: `/cpq/productAttributeRelation/autoIntegrate/${productId}`,
    method: 'get'
  })
}

// 导出产品主数据列表
export function exportProduct(query) {
  return request({
    url: '/cpq/product/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 下载产品主数据导入模板
export function downloadProductImportTemplate() {
  return request({
    url: '/cpq/product/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导入产品主数据
export function importProductData(data) {
  return request({
    url: '/cpq/product/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出产品属性列表
export function exportAttribute(query) {
  return request({
    url: '/cpq/attribute/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 下载产品属性导入模板
export function downloadAttributeImportTemplate() {
  return request({
    url: '/cpq/attribute/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导入产品属性数据
export function importAttributeData(data) {
  return request({
    url: '/cpq/attribute/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


