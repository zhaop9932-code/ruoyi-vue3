import request from '@/utils/request'

// 系列管理
export function listSeries(query) {
  return request({
    url: '/cpq/brand/series/list',
    method: 'get',
    params: query
  })
}

// 查询所有系列（用于下拉选择）
export function getAllSeries() {
  return request({
    url: '/cpq/brand/series/all',
    method: 'get'
  })
}

// 根据品牌ID查询系列列表
export function getSeriesByBrand(brandId) {
  return request({
    url: `/cpq/brand/series/byBrand/${brandId}`,
    method: 'get'
  })
}

// 根据分类ID查询系列列表
export function getSeriesByCatalog(catalogId) {
  return request({
    url: `/cpq/brand/series/byCatalog/${catalogId}`,
    method: 'get'
  })
}

// 根据品牌ID和分类ID查询系列列表
export function getSeriesByBrandAndCatalog(params) {
  return request({
    url: '/cpq/brand/series/byBrandAndCatalog',
    method: 'get',
    params: params
  })
}

export function getSeries(seriesId) {
  return request({
    url: `/cpq/brand/series/${seriesId}`,
    method: 'get'
  })
}

export function addSeries(data) {
  return request({
    url: '/cpq/brand/series',
    method: 'post',
    data: data
  })
}

export function updateSeries(data) {
  return request({
    url: '/cpq/brand/series',
    method: 'put',
    data: data
  })
}

export function delSeries(seriesIds) {
  return request({
    url: `/cpq/brand/series/${seriesIds}`,
    method: 'delete'
  })
}

// 检查系列编码是否唯一
export function checkSeriesCodeUnique(seriesCode) {
  return request({
    url: '/cpq/brand/series/checkSeriesCodeUnique',
    method: 'get',
    params: { seriesCode }
  })
}

// 导出系列列表
export function exportSeries(query) {
  return request({
    url: '/cpq/brand/series/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 下载系列导入模板
export function downloadSeriesImportTemplate() {
  return request({
    url: '/cpq/brand/series/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导入系列数据
export function importSeriesData(data) {
  return request({
    url: '/cpq/brand/series/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询品牌列表
export function listBrand() {
  return request({
    url: '/cpq/brand/all',
    method: 'get'
  })
}
