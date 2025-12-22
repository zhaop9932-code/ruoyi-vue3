import request from '@/utils/request'

// 报价单管理
export function listQuote(query) {
  return request({
    url: '/cpq/quote/list',
    method: 'get',
    params: query
  })
}

export function getQuote(quoteId) {
  return request({
    url: `/cpq/quote/${quoteId}`,
    method: 'get'
  })
}

export function addQuote(data) {
  return request({
    url: '/cpq/quote',
    method: 'post',
    data: data
  })
}

export function updateQuote(data) {
  return request({
    url: '/cpq/quote',
    method: 'put',
    data: data
  })
}

export function deleteQuote(quoteIds) {
  return request({
    url: `/cpq/quote/${quoteIds}`,
    method: 'delete'
  })
}

export function submitQuote(quoteId) {
  return request({
    url: `/cpq/quote/submit/${quoteId}`,
    method: 'post'
  })
}

export function approveQuote(quoteId, data) {
  return request({
    url: `/cpq/quote/approve/${quoteId}`,
    method: 'post',
    data: data
  })
}

export function rejectQuote(quoteId, data) {
  return request({
    url: `/cpq/quote/reject/${quoteId}`,
    method: 'post',
    data: data
  })
}

// 报价项管理
export function listQuoteItem(query) {
  return request({
    url: '/cpq/quote/item/list',
    method: 'get',
    params: query
  })
}

export function getQuoteItem(itemId) {
  return request({
    url: `/cpq/quote/item/${itemId}`,
    method: 'get'
  })
}

export function addQuoteItem(data) {
  return request({
    url: '/cpq/quote/item',
    method: 'post',
    data: data
  })
}

export function updateQuoteItem(data) {
  return request({
    url: '/cpq/quote/item',
    method: 'put',
    data: data
  })
}

export function deleteQuoteItem(itemIds) {
  return request({
    url: `/cpq/quote/item/${itemIds}`,
    method: 'delete'
  })
}
