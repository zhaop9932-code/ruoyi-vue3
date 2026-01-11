/**
 * 前端规则引擎
 * 用于产品配置器的实时规则验证和执行
 */

import { cloneDeep } from 'lodash-es'

/**
 * 规则引擎类
 */
class RuleEngine {
  constructor() {
    this.rules = []              // 规则列表
    this.context = {}            // 上下文数据
    this.executionLog = []       // 执行日志
    this.validationErrors = []   // 校验错误
  }

  /**
   * 加载规则
   * @param {Array} rules - 规则数组
   */
  loadRules(rules) {
    // 按优先级排序
    this.rules = rules.sort((a, b) => 
      (b.rulePriority || 0) - (a.rulePriority || 0)
    )
  }

  /**
   * 设置上下文
   * @param {Object} context - 上下文对象
   */
  setContext(context) {
    this.context = cloneDeep(context)
  }

  /**
   * 评估所有规则
   * @returns {Object} 评估结果
   */
  async evaluateAll() {
    this.executionLog = []
    this.validationErrors = []
    
    const results = {
      passed: true,
      executedRules: [],
      errors: [],
      actions: []
    }
    
    for (const rule of this.rules) {
      // 检查规则状态
      if (rule.ruleStatus !== '0') {
        continue
      }
      
      try {
        const result = await this.evaluateRule(rule)
        
        if (result.conditionMet) {
          results.executedRules.push(rule.ruleId)
          
          // 执行规则动作
          const actionResults = await this.executeRuleActions(rule)
          results.actions.push(...actionResults)
          
          // 如果是验证规则且失败
          if (rule.ruleType === '1' && !result.valid) {
            results.passed = false
            results.errors.push({
              ruleId: rule.ruleId,
              ruleName: rule.ruleName,
              message: result.message
            })
          }
        }
        
        this.executionLog.push({
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          conditionMet: result.conditionMet,
          valid: result.valid,
          timestamp: new Date()
        })
      } catch (error) {
        console.error(`规则执行失败 [${rule.ruleName}]:`, error)
        results.errors.push({
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          message: error.message
        })
      }
    }
    
    return results
  }

  /**
   * 评估单个规则
   * @param {Object} rule - 规则对象
   * @returns {Object} 评估结果
   */
  async evaluateRule(rule) {
    // 解析条件配置
    const conditionConfig = typeof rule.conditionConfig === 'string'
      ? JSON.parse(rule.conditionConfig)
      : rule.conditionConfig
    
    if (!conditionConfig || !conditionConfig.conditions) {
      return { conditionMet: true, valid: true }
    }
    
    // 评估条件
    const conditionMet = this.evaluateConditions(conditionConfig.conditions)
    
    // 如果条件满足，执行验证逻辑
    let valid = true
    let message = ''
    
    if (conditionMet && rule.ruleType === '1') {
      // 验证规则
      const validationResult = this.validateRule(rule)
      valid = validationResult.valid
      message = validationResult.message
    }
    
    return { conditionMet, valid, message }
  }

  /**
   * 评估条件列表
   * @param {Array} conditions - 条件数组
   * @returns {Boolean} 评估结果
   */
  evaluateConditions(conditions) {
    if (!conditions || conditions.length === 0) {
      return true
    }
    
    let result = null
    
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      const conditionResult = this.evaluateSingleCondition(condition)
      
      if (i === 0) {
        result = conditionResult
      } else {
        const logic = condition.logic || 'AND'
        if (logic === 'AND') {
          result = result && conditionResult
        } else if (logic === 'OR') {
          result = result || conditionResult
        }
      }
    }
    
    return result
  }

  /**
   * 评估单个条件
   * @param {Object} condition - 条件对象
   * @returns {Boolean} 评估结果
   */
  evaluateSingleCondition(condition) {
    // 复杂条件：递归评估
    if (condition.configType === 'complex' && condition.children) {
      return this.evaluateConditions(condition.children)
    }
    
    // 简单条件：获取字段值并评估
    const fieldValue = this.getFieldValue(condition)
    const targetValue = this.parseValue(condition.value, condition.type)
    
    return this.compareValues(fieldValue, condition.operator, targetValue, condition.type)
  }

  /**
   * 获取字段值
   * @param {Object} condition - 条件对象
   * @returns {*} 字段值
   */
  getFieldValue(condition) {
    const { judgeType, node, field } = condition
    
    switch (judgeType) {
      case 'variable':
        // 从变量中获取
        return this.context.variables?.[field]
      
      case 'nodeStaticAttr':
      case 'nodeDynamicAttr':
        // 从节点属性中获取
        return this.context.nodes?.[node]?.attributes?.[field]
      
      case 'nodeProduct':
        // 从节点产品中获取
        return this.context.nodes?.[node]?.product?.[field]
      
      default:
        return null
    }
  }

  /**
   * 解析值
   * @param {*} value - 原始值
   * @param {String} type - 值类型
   * @returns {*} 解析后的值
   */
  parseValue(value, type) {
    switch (type) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true' || value === true
      case 'select':
      case 'multi':
        return Array.isArray(value) ? value : [value]
      default:
        return value
    }
  }

  /**
   * 比较值
   * @param {*} fieldValue - 字段值
   * @param {String} operator - 操作符
   * @param {*} targetValue - 目标值
   * @param {String} type - 类型
   * @returns {Boolean} 比较结果
   */
  compareValues(fieldValue, operator, targetValue, type) {
    // 空值检查
    if (operator === 'is_empty') {
      return fieldValue === null || fieldValue === undefined || fieldValue === ''
    }
    if (operator === 'is_not_empty') {
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
    }
    
    // 数值比较
    if (type === 'number') {
      const numField = Number(fieldValue)
      const numTarget = Number(targetValue)
      
      switch (operator) {
        case '=':
        case '==':
          return numField === numTarget
        case '!=':
          return numField !== numTarget
        case '>':
          return numField > numTarget
        case '>=':
          return numField >= numTarget
        case '<':
          return numField < numTarget
        case '<=':
          return numField <= numTarget
        default:
          return false
      }
    }
    
    // 文本比较
    if (type === 'text') {
      const strField = String(fieldValue || '')
      const strTarget = String(targetValue || '')
      
      switch (operator) {
        case '=':
        case '==':
          return strField === strTarget
        case '!=':
          return strField !== strTarget
        case 'contains':
          return strField.includes(strTarget)
        case 'not_contains':
          return !strField.includes(strTarget)
        case 'starts_with':
          return strField.startsWith(strTarget)
        case 'ends_with':
          return strField.endsWith(strTarget)
        default:
          return false
      }
    }
    
    // 选择/多选比较
    if (type === 'select' || type === 'multi') {
      const arrayField = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
      const arrayTarget = Array.isArray(targetValue) ? targetValue : [targetValue]
      
      switch (operator) {
        case '=':
        case '==':
          return JSON.stringify(arrayField.sort()) === JSON.stringify(arrayTarget.sort())
        case '!=':
          return JSON.stringify(arrayField.sort()) !== JSON.stringify(arrayTarget.sort())
        case 'in':
          return arrayField.some(v => arrayTarget.includes(v))
        case 'not_in':
          return !arrayField.some(v => arrayTarget.includes(v))
        default:
          return false
      }
    }
    
    // 布尔比较
    if (type === 'boolean') {
      return fieldValue === targetValue
    }
    
    return false
  }

  /**
   * 验证规则
   * @param {Object} rule - 规则对象
   * @returns {Object} 验证结果
   */
  validateRule(rule) {
    // 解析动作配置获取验证信息
    const actionConfig = typeof rule.actionConfig === 'string'
      ? JSON.parse(rule.actionConfig)
      : rule.actionConfig
    
    if (!actionConfig || !actionConfig.actions) {
      return { valid: true, message: '' }
    }
    
    // 查找验证动作
    const validationAction = actionConfig.actions.find(
      action => action.actionType === 'validation'
    )
    
    if (!validationAction) {
      return { valid: true, message: '' }
    }
    
    // 执行验证逻辑
    const params = JSON.parse(validationAction.actionParams || '{}')
    const valid = this.executeValidation(params)
    
    return {
      valid,
      message: valid ? '' : (params.errorMessage || '验证失败')
    }
  }

  /**
   * 执行验证
   * @param {Object} params - 验证参数
   * @returns {Boolean} 验证结果
   */
  executeValidation(params) {
    const { validationType, expression } = params
    
    switch (validationType) {
      case 'range':
        return this.validateRange(params)
      case 'regex':
        return this.validateRegex(params)
      case 'custom':
        return this.validateCustom(expression)
      default:
        return true
    }
  }

  /**
   * 范围验证
   * @param {Object} params - 验证参数
   * @returns {Boolean} 验证结果
   */
  validateRange(params) {
    const { field, min, max } = params
    const value = this.getFieldValue({ judgeType: params.judgeType, node: params.node, field })
    
    if (value === null || value === undefined) {
      return false
    }
    
    const numValue = Number(value)
    return numValue >= min && numValue <= max
  }

  /**
   * 正则验证
   * @param {Object} params - 验证参数
   * @returns {Boolean} 验证结果
   */
  validateRegex(params) {
    const { field, pattern } = params
    const value = this.getFieldValue({ judgeType: params.judgeType, node: params.node, field })
    
    if (!value) {
      return false
    }
    
    const regex = new RegExp(pattern)
    return regex.test(String(value))
  }

  /**
   * 自定义验证
   * @param {String} expression - 表达式
   * @returns {Boolean} 验证结果
   */
  validateCustom(expression) {
    try {
      // 构建安全的上下文
      const safeContext = this.buildSafeContext()
      
      // 使用Function构造函数执行表达式
      const func = new Function(...Object.keys(safeContext), `return ${expression}`)
      return func(...Object.values(safeContext))
    } catch (error) {
      console.error('自定义验证表达式执行失败:', error)
      return false
    }
  }

  /**
   * 构建安全上下文
   * @returns {Object} 安全上下文
   */
  buildSafeContext() {
    return {
      variables: this.context.variables || {},
      nodes: this.context.nodes || {},
      Math,
      String,
      Number,
      Array,
      Object
    }
  }

  /**
   * 执行规则动作
   * @param {Object} rule - 规则对象
   * @returns {Array} 动作结果
   */
  async executeRuleActions(rule) {
    const actionConfig = typeof rule.actionConfig === 'string'
      ? JSON.parse(rule.actionConfig)
      : rule.actionConfig
    
    if (!actionConfig || !actionConfig.actions) {
      return []
    }
    
    const results = []
    
    // 按优先级排序动作
    const sortedActions = actionConfig.actions.sort((a, b) =>
      (a.actionPriority || 0) - (b.actionPriority || 0)
    )
    
    for (const action of sortedActions) {
      try {
        const result = await this.executeAction(action)
        results.push({
          actionId: action.actionId,
          actionType: action.actionType,
          success: true,
          result
        })
      } catch (error) {
        console.error(`动作执行失败 [${action.actionType}]:`, error)
        results.push({
          actionId: action.actionId,
          actionType: action.actionType,
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }

  /**
   * 执行单个动作
   * @param {Object} action - 动作对象
   * @returns {*} 执行结果
   */
  async executeAction(action) {
    const params = JSON.parse(action.actionParams || '{}')
    
    switch (action.actionType) {
      case 'setProperty':
        return this.actionSetProperty(params)
      
      case 'showMessage':
        return this.actionShowMessage(params)
      
      case 'hideNode':
        return this.actionHideNode(params)
      
      case 'disableNode':
        return this.actionDisableNode(params)
      
      case 'calculatePrice':
        return this.actionCalculatePrice(params)
      
      case 'autoSelect':
        return this.actionAutoSelect(params)
      
      default:
        console.warn(`未知的动作类型: ${action.actionType}`)
        return null
    }
  }

  /**
   * 动作：设置属性
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionSetProperty(params) {
    const { targetType, targetId, property, value } = params
    
    if (targetType === 'node') {
      if (!this.context.nodes[targetId]) {
        this.context.nodes[targetId] = {}
      }
      if (!this.context.nodes[targetId].attributes) {
        this.context.nodes[targetId].attributes = {}
      }
      this.context.nodes[targetId].attributes[property] = value
    } else if (targetType === 'variable') {
      if (!this.context.variables) {
        this.context.variables = {}
      }
      this.context.variables[property] = value
    }
    
    return { property, value }
  }

  /**
   * 动作：显示消息
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionShowMessage(params) {
    const { messageType, message } = params
    return { messageType, message }
  }

  /**
   * 动作：隐藏节点
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionHideNode(params) {
    const { nodeId } = params
    
    if (this.context.nodes[nodeId]) {
      this.context.nodes[nodeId].isVisible = false
    }
    
    return { nodeId, hidden: true }
  }

  /**
   * 动作：禁用节点
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionDisableNode(params) {
    const { nodeId } = params
    
    if (this.context.nodes[nodeId]) {
      this.context.nodes[nodeId].isDisabled = true
    }
    
    return { nodeId, disabled: true }
  }

  /**
   * 动作：计算价格
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionCalculatePrice(params) {
    const { expression } = params
    
    try {
      const safeContext = this.buildSafeContext()
      const func = new Function(...Object.keys(safeContext), `return ${expression}`)
      const price = func(...Object.values(safeContext))
      
      if (!this.context.pricing) {
        this.context.pricing = {}
      }
      this.context.pricing.calculatedPrice = price
      
      return { price }
    } catch (error) {
      console.error('价格计算失败:', error)
      return { price: 0, error: error.message }
    }
  }

  /**
   * 动作：自动选择
   * @param {Object} params - 参数
   * @returns {Object} 结果
   */
  actionAutoSelect(params) {
    const { nodeId, productId, attributeValues } = params
    
    if (this.context.nodes[nodeId]) {
      if (productId) {
        this.context.nodes[nodeId].selectedProductId = productId
      }
      if (attributeValues) {
        Object.assign(
          this.context.nodes[nodeId].attributes || {},
          attributeValues
        )
      }
    }
    
    return { nodeId, productId, attributeValues }
  }

  /**
   * 检查节点约束
   * @param {Number} nodeId - 节点ID
   * @param {Object} nodeConfig - 节点配置
   * @returns {Object} 检查结果
   */
  checkNodeConstraints(nodeId, nodeConfig) {
    const node = this.context.nodes[nodeId]
    
    if (!node || !nodeConfig.constraintConfig) {
      return { valid: true, errors: [] }
    }
    
    const constraints = typeof nodeConfig.constraintConfig === 'string'
      ? JSON.parse(nodeConfig.constraintConfig)
      : nodeConfig.constraintConfig
    
    const errors = []
    
    // 条件约束
    if (constraints.type === 'condition' && constraints.condition) {
      const conditionMet = this.validateCustom(constraints.condition)
      if (!conditionMet) {
        errors.push({
          type: 'condition',
          message: `节点不满足条件约束: ${constraints.condition}`
        })
      }
    }
    
    // 数量约束
    if (constraints.quantity) {
      const quantity = node.quantity || 0
      const { min, max, minExpr, maxExpr } = constraints.quantity
      
      let actualMin = min
      let actualMax = max
      
      // 动态表达式计算
      if (minExpr) {
        try {
          const safeContext = this.buildSafeContext()
          const func = new Function(...Object.keys(safeContext), `return ${minExpr}`)
          actualMin = func(...Object.values(safeContext))
        } catch (error) {
          console.error('最小数量表达式计算失败:', error)
        }
      }
      
      if (maxExpr) {
        try {
          const safeContext = this.buildSafeContext()
          const func = new Function(...Object.keys(safeContext), `return ${maxExpr}`)
          actualMax = func(...Object.values(safeContext))
        } catch (error) {
          console.error('最大数量表达式计算失败:', error)
        }
      }
      
      if (quantity < actualMin) {
        errors.push({
          type: 'quantity',
          message: `数量不能小于 ${actualMin}`
        })
      }
      
      if (actualMax && quantity > actualMax) {
        errors.push({
          type: 'quantity',
          message: `数量不能大于 ${actualMax}`
        })
      }
    }
    
    // 依赖约束
    if (constraints.dependency) {
      const { nodes, type, condition } = constraints.dependency
      
      if (type === 'mandatory') {
        // 必选依赖：依赖节点必须已配置
        for (const depNodeId of nodes) {
          const depNode = this.context.nodes[depNodeId]
          if (!depNode || depNode.status !== 'configured') {
            errors.push({
              type: 'dependency',
              message: `必须先配置依赖节点: ${depNodeId}`
            })
          }
        }
      } else if (type === 'exclusive') {
        // 互斥依赖：依赖节点不能同时配置
        const configuredDeps = nodes.filter(depNodeId => {
          const depNode = this.context.nodes[depNodeId]
          return depNode && depNode.status === 'configured'
        })
        
        if (configuredDeps.length > 1) {
          errors.push({
            type: 'dependency',
            message: `节点 ${configuredDeps.join(', ')} 不能同时配置`
          })
        }
      } else if (type === 'conditional' && condition) {
        // 条件依赖：满足条件时依赖
        const conditionMet = this.validateCustom(condition)
        if (conditionMet) {
          for (const depNodeId of nodes) {
            const depNode = this.context.nodes[depNodeId]
            if (!depNode || depNode.status !== 'configured') {
              errors.push({
                type: 'dependency',
                message: `在当前条件下，必须配置依赖节点: ${depNodeId}`
              })
            }
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取执行日志
   * @returns {Array} 日志数组
   */
  getExecutionLog() {
    return this.executionLog
  }

  /**
   * 获取上下文
   * @returns {Object} 上下文对象
   */
  getContext() {
    return this.context
  }

  /**
   * 重置引擎
   */
  reset() {
    this.rules = []
    this.context = {}
    this.executionLog = []
    this.validationErrors = []
  }
}

// 导出单例
export default new RuleEngine()
