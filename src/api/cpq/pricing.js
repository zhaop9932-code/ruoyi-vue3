import request from '@/utils/request'

// 定价策略管理
export function listPricingStrategy(query) {
  return request({
    url: '/cpq/pricingStrategy/list',
    method: 'get',
    params: query
  })
}

export function getPricingStrategy(strategyId) {
  return request({
    url: `/cpq/pricingStrategy/${strategyId}`,
    method: 'get'
  })
}

export function addPricingStrategy(data) {
  return request({
    url: '/cpq/pricingStrategy',
    method: 'post',
    data: data
  })
}

export function updatePricingStrategy(data) {
  return request({
    url: '/cpq/pricingStrategy',
    method: 'put',
    data: data
  })
}

export function deletePricingStrategy(strategyIds) {
  return request({
    url: `/cpq/pricingStrategy/${strategyIds}`,
    method: 'delete'
  })
}

// 产品价格管理
export function listProductPrice(query) {
  return request({
    url: '/cpq/productPrice/list',
    method: 'get',
    params: query
  })
}

export function getProductPrice(priceId) {
  return request({
    url: `/cpq/productPrice/${priceId}`,
    method: 'get'
  })
}

export function addProductPrice(data) {
  return request({
    url: '/cpq/productPrice',
    method: 'post',
    data: data
  })
}

export function updateProductPrice(data) {
  return request({
    url: '/cpq/productPrice',
    method: 'put',
    data: data
  })
}

export function deleteProductPrice(priceIds) {
  return request({
    url: `/cpq/productPrice/${priceIds}`,
    method: 'delete'
  })
}

// 折扣规则管理
export function listDiscountRule(query) {
  return request({
    url: '/cpq/discountRule/list',
    method: 'get',
    params: query
  })
}

export function getDiscountRule(ruleId) {
  return request({
    url: `/cpq/discountRule/${ruleId}`,
    method: 'get'
  })
}

export function addDiscountRule(data) {
  return request({
    url: '/cpq/discountRule',
    method: 'post',
    data: data
  })
}

export function updateDiscountRule(data) {
  return request({
    url: '/cpq/discountRule',
    method: 'put',
    data: data
  })
}

export function deleteDiscountRule(ruleIds) {
  return request({
    url: `/cpq/discountRule/${ruleIds}`,
    method: 'delete'
  })
}
