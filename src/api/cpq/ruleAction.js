import request from '@/utils/request'

// 动作配置管理
export function listRuleAction(query) {
  return request({
    url: '/cpq/ruleAction/list',
    method: 'get',
    params: query
  })
}

export function getRuleAction(actionId) {
  return request({
    url: `/cpq/ruleAction/${actionId}`,
    method: 'get'
  })
}

export function listRuleActionsByRuleId(ruleId) {
  return request({
    url: `/cpq/ruleAction/listByRuleId/${ruleId}`,
    method: 'get'
  })
}

export function saveRuleAction(data) {
  return request({
    url: '/cpq/ruleAction',
    method: 'post',
    data: data
  })
}

export function updateRuleAction(data) {
  return request({
    url: '/cpq/ruleAction',
    method: 'put',
    data: data
  })
}

export function deleteRuleAction(actionId) {
  return request({
    url: `/cpq/ruleAction/${actionId}`,
    method: 'delete'
  })
}

export function batchDeleteRuleAction(actionIds) {
  return request({
    url: `/cpq/ruleAction/batch`,
    method: 'delete',
    data: { actionIds }
  })
}

export function saveRuleActions(ruleId, actionList) {
  return request({
    url: `/cpq/ruleAction/saveRuleActions/${ruleId}`,
    method: 'post',
    data: actionList
  })
}
