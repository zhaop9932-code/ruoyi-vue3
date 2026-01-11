import request from '@/utils/request'

// 查询产品目录列表
export function listCatalog(query) {
  return request({
    url: '/cpq/catalog/list',
    method: 'get',
    params: query
  })
}

// 查询产品目录详细
export function getCatalog(catalogId) {
  return request({
    url: `/cpq/catalog/${catalogId}`,
    method: 'get'
  })
}

// 新增产品目录
export function addCatalog(data) {
  return request({
    url: '/cpq/catalog',
    method: 'post',
    data: data
  })
}

// 修改产品目录
export function updateCatalog(data) {
  return request({
    url: '/cpq/catalog',
    method: 'put',
    data: data
  })
}

// 删除产品目录
export function delCatalog(catalogId) {
  return request({
    url: `/cpq/catalog/${catalogId}`,
    method: 'delete'
  })
}

// 查询产品目录下拉树结构
export function listCatalogTree() {
  return request({
    url: '/cpq/catalog/tree',
    method: 'get'
  })
}

// 导出产品目录列表
export function exportCatalog(query) {
  return request({
    url: '/cpq/catalog/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 下载产品目录导入模板
export function downloadCatalogImportTemplate() {
  return request({
    url: '/cpq/catalog/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导入产品目录数据
export function importCatalogData(data) {
  return request({
    url: '/cpq/catalog/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}