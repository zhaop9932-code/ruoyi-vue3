// 超级BOM规则关联API
import request from '@/utils/request'

// 查询超级BOM规则关联列表
export const listSuperBomRuleRelation = (params) => {
  return request({
    url: '/cpq/superBomRuleRelation/list',
    method: 'post',
    data: params
  })
}

// 获取超级BOM与规则关联详细信息
export const getSuperBomRuleRelationInfo = (relationId) => {
  return request({
    url: '/cpq/superBomRuleRelation/getInfo',
    method: 'post',
    data: relationId
  })
}

// 根据BOM ID查询关联规则
export const getSuperBomRuleRelationByBomId = (bomId) => {
  return request({
    url: '/cpq/superBomRuleRelation/getByBomId',
    method: 'post',
    data: typeof bomId === 'object' ? bomId : { bomId }
  })
}

// 根据规则ID查询关联BOM
export const getSuperBomRuleRelationByRuleId = (ruleId) => {
  return request({
    url: '/cpq/superBomRuleRelation/getByRuleId',
    method: 'post',
    data: typeof ruleId === 'object' ? ruleId : { ruleId }
  })
}

// 新增超级BOM规则关联
export const addSuperBomRuleRelation = (data) => {
  return request({
    url: '/cpq/superBomRuleRelation/add',
    method: 'post',
    data: data
  })
}

// 批量新增超级BOM规则关联
export const batchAddSuperBomRuleRelation = (data) => {
  return request({
    url: '/cpq/superBomRuleRelation/batchAdd',
    method: 'post',
    data: data
  })
}

// 修改超级BOM规则关联
export const updateSuperBomRuleRelation = (data) => {
  return request({
    url: '/cpq/superBomRuleRelation/edit',
    method: 'post',
    data: data
  })
}

// 删除超级BOM规则关联
export const deleteSuperBomRuleRelation = (ids) => {
  return request({
    url: '/cpq/superBomRuleRelation/remove',
    method: 'post',
    data: ids
  })
}

// 保存BOM的所有规则关联
export const saveBomRuleRelations = (data) => {
  return request({
    url: '/cpq/superBomRuleRelation/saveBomRuleRelations',
    method: 'post',
    data: data
  })
}

// 检查关联关系是否存在
export const checkSuperBomRuleRelationExists = (params) => {
  return request({
    url: '/cpq/superBomRuleRelation/checkExists',
    method: 'post',
    data: params
  })
}