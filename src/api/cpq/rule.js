import request from '@/utils/request'

// 配置规则管理
export function listConfigurationRule(query) {
  return request({
    url: '/cpq/configurationRule/list',
    method: 'get',
    params: query
  })
}

export function getConfigurationRule(ruleId) {
  return request({
    url: `/cpq/configurationRule/${ruleId}`,
    method: 'get'
  })
}

export function addConfigurationRule(data) {
  return request({
    url: '/cpq/configurationRule',
    method: 'post',
    data: data
  })
}

export function updateConfigurationRule(data) {
  return request({
    url: '/cpq/configurationRule',
    method: 'put',
    data: data
  })
}

export function deleteConfigurationRule(ruleIds) {
  return request({
    url: `/cpq/configurationRule/${ruleIds}`,
    method: 'delete'
  })
}

export function checkRuleCodeUnique(ruleCode) {
  return request({
    url: `/cpq/configurationRule/checkRuleCodeUnique/${ruleCode}`,
    method: 'get'
  })
}

// 根据BOM ID添加规则配置，同时创建规则信息和规则BOM映射关系
export function addConfigurationRuleWithBom(data) {
  return request({
    url: '/cpq/configurationRule/addWithBom',
    method: 'post',
    data: data
  })
}

// 获取规则高级配置
export function getRuleAdvancedConfig(ruleId) {
  return request({
    url: `/cpq/rule/advanced-config/${ruleId}`,
    method: 'get'
  })
}

// 保存规则高级配置
export function saveRuleAdvancedConfig(ruleId, data) {
  return request({
    url: `/cpq/rule/advanced-config/${ruleId}`,
    method: 'post',
    data: data
  })
}

// 获取可用规则列表
export function getAvailableRules(params) {
  return request({
    url: '/cpq/rule/advanced-config/available-rules',
    method: 'get',
    params: params
  })
}
