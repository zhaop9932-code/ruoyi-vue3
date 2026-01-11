/**
 * 配置会话API
 * 用于保存、加载和管理产品配置会话
 */

import request from '@/utils/request'

/**
 * 查询配置会话列表
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export function listConfigSession(query) {
  return request({
    url: '/cpq/configSession/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询配置会话详细
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export function getConfigSession(sessionId) {
  return request({
    url: `/cpq/configSession/${sessionId}`,
    method: 'get'
  })
}

/**
 * 新增配置会话
 * @param {Object} data - 会话数据
 * @returns {Promise}
 */
export function addConfigSession(data) {
  return request({
    url: '/cpq/configSession',
    method: 'post',
    data: {
      sessionId: data.sessionId,
      bomId: data.bomId,
      sessionName: data.sessionName,
      sessionStatus: data.status || 'draft',
      configurationData: JSON.stringify(data.configuration),
      pricingData: JSON.stringify(data.pricing),
      createdBy: data.createdBy,
      remark: data.remark
    }
  })
}

/**
 * 修改配置会话
 * @param {Object} data - 会话数据
 * @returns {Promise}
 */
export function updateConfigSession(data) {
  return request({
    url: '/cpq/configSession',
    method: 'put',
    data: {
      sessionId: data.sessionId,
      sessionName: data.sessionName,
      sessionStatus: data.status,
      configurationData: JSON.stringify(data.configuration),
      pricingData: JSON.stringify(data.pricing),
      remark: data.remark
    }
  })
}

/**
 * 删除配置会话
 * @param {Number|Array} sessionIds - 会话ID或ID数组
 * @returns {Promise}
 */
export function delConfigSession(sessionIds) {
  return request({
    url: `/cpq/configSession/${sessionIds}`,
    method: 'delete'
  })
}

/**
 * 根据BOM ID查询配置会话列表
 * @param {Number} bomId - BOM ID
 * @returns {Promise}
 */
export function getConfigSessionByBomId(bomId) {
  return request({
    url: `/cpq/configSession/bomId/${bomId}`,
    method: 'get'
  })
}

/**
 * 完成配置会话
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export function completeConfigSession(sessionId) {
  return request({
    url: `/cpq/configSession/complete/${sessionId}`,
    method: 'post'
  })
}

/**
 * 复制配置会话
 * @param {Number} sessionId - 会话ID
 * @param {String} newSessionName - 新会话名称
 * @returns {Promise}
 */
export function copyConfigSession(sessionId, newSessionName) {
  return request({
    url: `/cpq/configSession/copy/${sessionId}`,
    method: 'post',
    data: {
      newSessionName
    }
  })
}

/**
 * 导出配置会话
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export function exportConfigSession(sessionId) {
  return request({
    url: `/cpq/configSession/export/${sessionId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 生成报价
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export function generateQuoteFromSession(sessionId) {
  return request({
    url: `/cpq/configSession/generateQuote/${sessionId}`,
    method: 'post'
  })
}
