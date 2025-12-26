import request from '@/utils/request'

// 规则条件配置管理

// 保存条件配置
export function saveRuleCondition(data) {
  return request({
    url: '/cpq/ruleCondition',
    method: 'post',
    data: data
  })
}

// 获取条件详情
export function getRuleCondition(conditionId) {
  return request({
    url: `/cpq/ruleCondition/${conditionId}`,
    method: 'get'
  })
}

// 获取规则条件列表
export function listRuleConditionsByRuleId(ruleId) {
  return request({
    url: `/cpq/ruleCondition/listByRuleId/${ruleId}`,
    method: 'get'
  })
}

// 更新条件配置
export function updateRuleCondition(data) {
  return request({
    url: '/cpq/ruleCondition',
    method: 'put',
    data: data
  })
}

// 删除条件
export function deleteRuleCondition(conditionId) {
  return request({
    url: `/cpq/ruleCondition/${conditionId}`,
    method: 'delete'
  })
}

// 批量删除条件
export function batchDeleteRuleConditions(conditionIds) {
  return request({
    url: `/cpq/ruleCondition/batch`,
    method: 'delete',
    data: { conditionIds }
  })
}
