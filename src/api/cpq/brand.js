import request from '@/utils/request'

// 品牌管理
export function listBrand(query) {
  return request({
    url: '/cpq/brand/list',
    method: 'get',
    params: query
  })
}

// 查询所有品牌（用于下拉选择）
export function getAllBrand() {
  return request({
    url: '/cpq/brand/all',
    method: 'get'
  })
}

export function getBrand(brandId) {
  return request({
    url: `/cpq/brand/${brandId}`,
    method: 'get'
  })
}

export function addBrand(data) {
  return request({
    url: '/cpq/brand',
    method: 'post',
    data: data
  })
}

export function updateBrand(data) {
  return request({
    url: '/cpq/brand',
    method: 'put',
    data: data
  })
}

export function delBrand(brandIds) {
  return request({
    url: `/cpq/brand/${brandIds}`,
    method: 'delete'
  })
}

// 检查品牌编码是否唯一
export function checkBrandCodeUnique(brandCode) {
  return request({
    url: '/cpq/brand/checkBrandCodeUnique',
    method: 'get',
    params: { brandCode }
  })
}

// 导出品牌列表
export function exportBrand(query) {
  return request({
    url: '/cpq/brand/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 下载品牌导入模板
export function downloadBrandImportTemplate() {
  return request({
    url: '/cpq/brand/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导入品牌数据
export function importBrandData(data) {
  return request({
    url: '/cpq/brand/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
