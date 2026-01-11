/**
 * 用户选型配置器 - Pinia Store
 * 管理产品配置会话、规则引擎、状态同步
 */

import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { 
  listSuperBomStructureTree,
  listSuperBomStructureAttributeByBomStructureId
} from '@/api/cpq/bom'
import { getSuperBomRuleRelationByBomId } from '@/api/cpq/superBomRuleRelation'
import { getSuperBomProductRelationByBomIdAndStructureId } from '@/api/cpq/superBomProductRelation'
import { getConfigurationRule } from '@/api/cpq/rule'
import { getSuperBomVariableByBomId } from '@/api/cpq/superBomVariable'
import { 
  addConfigSession, 
  updateConfigSession, 
  getConfigSession,
  completeConfigSession 
} from '@/api/cpq/configSession'
import RuleEngine from '@/utils/ruleEngine'

export const useConfiguratorStore = defineStore('configurator', {
  state: () => ({
    // 当前BOM ID
    currentBomId: null,
    
    // BOM树形数据
    bomTreeData: [],
    
    // 扁平化节点映射 bomStructureId -> node
    nodesMap: new Map(),
    
    // 配置会话
    configSession: {
      sessionId: null,
      bomId: null,
      sessionName: '',
      createdAt: null,
      updatedAt: null,
      status: 'draft', // draft | completed | saved
      configuration: {}
    },
    
    // 规则列表
    rules: [],
    
    // BOM变量
    variables: {},
    
    // 校验错误
    validationErrors: {},
    
    // 价格计算结果
    pricing: {
      totalPrice: 0,
      breakdown: []
    },
    
    // 加载状态
    loading: {
      bom: false,
      rules: false,
      validation: false
    }
  }),

  getters: {
    /**
     * 获取当前配置的节点
     */
    configuredNodes: (state) => {
      return Array.from(state.nodesMap.values()).filter(
        node => node.status === 'configured'
      )
    },

    /**
     * 获取未配置的必选节点
     */
    unconfiguredRequiredNodes: (state) => {
      return Array.from(state.nodesMap.values()).filter(
        node => node.isRequired && node.status !== 'configured'
      )
    },

    /**
     * 配置是否完整
     */
    isConfigurationComplete: (state) => {
      return Array.from(state.nodesMap.values()).every(
        node => !node.isRequired || node.status === 'configured'
      )
    },

    /**
     * 配置摘要
     */
    configurationSummary: (state) => {
      const summary = {
        totalNodes: state.nodesMap.size,
        configuredNodes: 0,
        requiredNodes: 0,
        optionalNodes: 0,
        errors: 0
      }

      state.nodesMap.forEach(node => {
        if (node.status === 'configured') {
          summary.configuredNodes++
        }
        if (node.isRequired) {
          summary.requiredNodes++
        } else {
          summary.optionalNodes++
        }
        if (node.status === 'error') {
          summary.errors++
        }
      })

      return summary
    }
  },

  actions: {
    /**
     * 加载BOM结构
     * @param {Number} bomId - BOM ID
     */
    async loadBomStructure(bomId) {
      this.loading.bom = true
      this.currentBomId = bomId

      try {
        // 加载BOM树
        const treeResponse = await listSuperBomStructureTree(bomId)
        this.bomTreeData = treeResponse.data || []

        // 构建扁平化节点映射
        this.buildNodesMap(this.bomTreeData)

        // 加载BOM变量
        await this.loadBomVariables(bomId)

        // 加载规则
        await this.loadBomRules(bomId)

        // 初始化配置会话
        this.initConfigSession(bomId)

        return true
      } catch (error) {
        console.error('加载BOM结构失败:', error)
        ElMessage.error('加载BOM结构失败')
        return false
      } finally {
        this.loading.bom = false
      }
    },

    /**
     * 构建节点映射
     * @param {Array} nodes - 节点数组
     */
    buildNodesMap(nodes) {
      nodes.forEach(node => {
        // 初始化节点状态
        node.status = 'unconfigured'
        node.isVisible = true
        node.isDisabled = false
        node.quantity = node.defaultQuantity || 1

        // 解析约束配置
        if (node.constraintConfig && typeof node.constraintConfig === 'string') {
          try {
            node.constraintConfig = JSON.parse(node.constraintConfig)
          } catch (error) {
            console.error('解析约束配置失败:', error)
          }
        }

        // 确定是否必选
        node.isRequired = node.constraintType === '' || 
                         (node.constraintConfig && node.constraintConfig.required === true)

        this.nodesMap.set(node.bomStructureId, node)

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          this.buildNodesMap(node.children)
        }
      })
    },

    /**
     * 加载BOM变量
     * @param {Number} bomId - BOM ID
     */
    async loadBomVariables(bomId) {
      try {
        const response = await getSuperBomVariableByBomId(bomId)
        const variables = response.data || []

        this.variables = {}
        variables.forEach(variable => {
          this.variables[variable.variableCode] = variable.defaultValue
        })
      } catch (error) {
        console.error('加载BOM变量失败:', error)
      }
    },

    /**
     * 加载BOM规则
     * @param {Number} bomId - BOM ID
     */
    async loadBomRules(bomId) {
      this.loading.rules = true

      try {
        // 获取BOM关联的规则
        const relationResponse = await getSuperBomRuleRelationByBomId(bomId)
        const relations = relationResponse.data || []

        // 加载规则详情
        const rulePromises = relations
          .filter(rel => rel.status === 0) // 只加载启用的规则
          .map(rel => getConfigurationRule(rel.ruleId))

        const ruleResponses = await Promise.all(rulePromises)
        this.rules = ruleResponses.map(res => res.data)

        // 加载规则到规则引擎
        RuleEngine.loadRules(this.rules)
      } catch (error) {
        console.error('加载BOM规则失败:', error)
      } finally {
        this.loading.rules = false
      }
    },

    /**
     * 初始化配置会话
     * @param {Number} bomId - BOM ID
     */
    initConfigSession(bomId) {
      this.configSession = {
        sessionId: `SESSION_${Date.now()}`,
        bomId,
        sessionName: `配置会话_${new Date().toLocaleString()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        configuration: {},
        savedToBackend: false
      }
    },

    /**
     * 更新节点配置
     * @param {Number} nodeId - 节点ID
     * @param {Object} config - 配置数据
     */
    async saveNodeConfiguration(nodeId, config) {
      const node = this.nodesMap.get(nodeId)
      if (!node) {
        throw new Error(`节点不存在: ${nodeId}`)
      }

      // 更新节点状态
      node.status = 'configured'
      node.configuration = config

      // 更新配置会话
      this.configSession.configuration[nodeId] = config
      this.configSession.updatedAt = new Date()

      // 触发规则引擎校验
      await this.runRuleEngine()

      // 重新计算价格
      await this.calculateTotalPrice()
    },

    /**
     * 更新节点数量
     * @param {Number} nodeId - 节点ID
     * @param {Number} quantity - 数量
     */
    async updateNodeQuantity(nodeId, quantity) {
      const node = this.nodesMap.get(nodeId)
      if (!node) return

      node.quantity = quantity

      if (this.configSession.configuration[nodeId]) {
        this.configSession.configuration[nodeId].quantity = quantity
      }

      // 触发规则引擎
      await this.runRuleEngine()
      await this.calculateTotalPrice()
    },

    /**
     * 选择节点产品
     * @param {Number} nodeId - 节点ID
     * @param {Number} productId - 产品ID
     */
    async selectNodeProduct(nodeId, productId) {
      const node = this.nodesMap.get(nodeId)
      if (!node) return

      node.selectedProductId = productId

      if (!this.configSession.configuration[nodeId]) {
        this.configSession.configuration[nodeId] = {}
      }
      this.configSession.configuration[nodeId].selectedProductId = productId

      // 触发规则引擎
      await this.runRuleEngine()
      await this.calculateTotalPrice()
    },

    /**
     * 运行规则引擎
     */
    async runRuleEngine() {
      // 构建规则引擎上下文
      const context = {
        variables: this.variables,
        nodes: {},
        pricing: this.pricing
      }

      // 填充节点数据
      this.nodesMap.forEach((node, nodeId) => {
        context.nodes[nodeId] = {
          nodeId,
          nodeCode: node.nodeCode,
          nodeName: node.nodeName,
          nodeType: node.nodeType,
          quantity: node.quantity,
          selectedProductId: node.selectedProductId,
          attributes: node.configuration || {},
          status: node.status,
          isVisible: node.isVisible,
          isDisabled: node.isDisabled,
          product: node.product || {}
        }
      })

      // 设置上下文并评估规则
      RuleEngine.setContext(context)
      const result = await RuleEngine.evaluateAll()

      // 应用规则结果
      this.applyRuleResults(result)

      // 更新校验错误
      this.validationErrors = {}
      result.errors.forEach(error => {
        this.validationErrors[error.ruleId] = error.message
      })

      return result.passed
    },

    /**
     * 应用规则结果
     * @param {Object} result - 规则执行结果
     */
    applyRuleResults(result) {
      // 获取更新后的上下文
      const context = RuleEngine.getContext()

      // 更新节点状态
      Object.entries(context.nodes).forEach(([nodeId, nodeData]) => {
        const node = this.nodesMap.get(Number(nodeId))
        if (node) {
          node.isVisible = nodeData.isVisible !== false
          node.isDisabled = nodeData.isDisabled === true

          // 更新节点属性
          if (nodeData.attributes) {
            Object.assign(node.configuration || {}, nodeData.attributes)
          }
        }
      })

      // 更新变量
      if (context.variables) {
        Object.assign(this.variables, context.variables)
      }

      // 处理消息动作
      result.actions.forEach(action => {
        if (action.actionType === 'showMessage' && action.result) {
          const { messageType, message } = action.result
          if (messageType === 'success') {
            ElMessage.success(message)
          } else if (messageType === 'warning') {
            ElMessage.warning(message)
          } else if (messageType === 'error') {
            ElMessage.error(message)
          } else {
            ElMessage.info(message)
          }
        }
      })
    },

    /**
     * 验证节点配置
     * @param {Number} nodeId - 节点ID
     * @param {Object} config - 配置数据
     * @returns {Boolean} 验证结果
     */
    async validateNodeConfiguration(nodeId, config) {
      const node = this.nodesMap.get(nodeId)
      if (!node) return false

      // 暂存当前配置
      const tempConfig = node.configuration
      node.configuration = config
      node.status = 'configured'

      // 运行规则引擎
      const valid = await this.runRuleEngine()

      // 检查节点约束
      const constraintResult = RuleEngine.checkNodeConstraints(nodeId, node)

      if (!constraintResult.valid) {
        // 恢复配置
        node.configuration = tempConfig
        node.status = 'error'

        // 记录约束错误
        this.validationErrors[nodeId] = constraintResult.errors
          .map(err => err.message)
          .join('; ')

        return false
      }

      return valid
    },

    /**
     * 验证属性
     * @param {Number} nodeId - 节点ID
     * @param {String} attributeCode - 属性代码
     * @param {*} value - 属性值
     */
    async validateAttribute(nodeId, attributeCode, value) {
      // 更新临时值并触发规则引擎
      const context = RuleEngine.getContext()
      if (!context.nodes[nodeId]) {
        context.nodes[nodeId] = { attributes: {} }
      }
      context.nodes[nodeId].attributes[attributeCode] = value

      RuleEngine.setContext(context)
      await RuleEngine.evaluateAll()
    },

    /**
     * 计算总价
     */
    async calculateTotalPrice() {
      let totalPrice = 0
      const breakdown = []

      this.nodesMap.forEach((node, nodeId) => {
        if (node.status === 'configured' && node.isVisible) {
          const quantity = node.quantity || 1
          let nodePrice = 0

          // 如果选择了产品，使用产品价格
          if (node.selectedProductId && node.product) {
            nodePrice = node.product.price || 0
          } else if (node.price) {
            // 否则使用节点配置的价格
            nodePrice = node.price
          }

          // 计算成本
          if (node.costCalculationRule) {
            try {
              const context = RuleEngine.getContext()
              RuleEngine.setContext(context)
              
              const func = new Function(
                ...Object.keys(context),
                `return ${node.costCalculationRule}`
              )
              nodePrice = func(...Object.values(context))
            } catch (error) {
              console.error('价格计算规则执行失败:', error)
            }
          }

          const totalNodePrice = nodePrice * quantity

          totalPrice += totalNodePrice

          breakdown.push({
            nodeId,
            nodeName: node.nodeName,
            quantity,
            unitPrice: nodePrice,
            totalPrice: totalNodePrice
          })
        }
      })

      this.pricing = {
        totalPrice,
        breakdown
      }
    },

    /**
     * 保存配置会话
     */
    async saveConfigSession() {
      try {
        const sessionData = {
          sessionId: this.configSession.sessionId,
          bomId: this.configSession.bomId,
          sessionName: this.configSession.sessionName,
          status: 'saved',
          configuration: this.configSession.configuration,
          pricing: this.pricing,
          remark: `保存于 ${new Date().toLocaleString()}`
        }

        // 如果是新会话，创建；否则更新
        if (!this.configSession.savedToBackend) {
          await addConfigSession(sessionData)
          this.configSession.savedToBackend = true
        } else {
          await updateConfigSession(sessionData)
        }

        this.configSession.status = 'saved'
        this.configSession.updatedAt = new Date()

        ElMessage.success('配置已保存')
        return true
      } catch (error) {
        console.error('保存配置会话失败:', error)
        ElMessage.error('保存配置失败')
        return false
      }
    },

    /**
     * 加载配置会话
     * @param {String} sessionId - 会话ID
     */
    async loadConfigSession(sessionId) {
      try {
        const response = await getConfigSession(sessionId)
        const sessionData = response.data

        // 恢复会话数据
        this.configSession = {
          sessionId: sessionData.sessionId,
          bomId: sessionData.bomId,
          sessionName: sessionData.sessionName,
          createdAt: new Date(sessionData.createTime),
          updatedAt: new Date(sessionData.updateTime),
          status: sessionData.sessionStatus,
          configuration: JSON.parse(sessionData.configurationData || '{}'),
          savedToBackend: true
        }

        // 恢复价格数据
        if (sessionData.pricingData) {
          this.pricing = JSON.parse(sessionData.pricingData)
        }

        // 恢复节点配置状态
        Object.entries(this.configSession.configuration).forEach(([nodeId, config]) => {
          const node = this.nodesMap.get(Number(nodeId))
          if (node) {
            node.status = 'configured'
            node.configuration = config
            node.quantity = config.quantity || node.defaultQuantity || 1
            node.selectedProductId = config.selectedProductId || null
          }
        })

        ElMessage.success('配置已加载')
        return true
      } catch (error) {
        console.error('加载配置会话失败:', error)
        ElMessage.error('加载配置失败')
        return false
      }
    },

    /**
     * 完成配置
     */
    async completeConfiguration() {
      // 验证配置完整性
      if (!this.isConfigurationComplete) {
        ElMessage.warning('请完成所有必选项的配置')
        return false
      }

      // 最终校验
      const valid = await this.runRuleEngine()
      if (!valid) {
        ElMessage.error('配置不符合规则要求')
        return false
      }

      try {
        // 先保存配置
        const saved = await this.saveConfigSession()
        if (!saved) {
          return false
        }

        // 调用后端完成配置
        if (this.configSession.savedToBackend) {
          await completeConfigSession(this.configSession.sessionId)
        }

        this.configSession.status = 'completed'
        this.configSession.updatedAt = new Date()

        ElMessage.success('配置完成')
        return true
      } catch (error) {
        console.error('完成配置失败:', error)
        ElMessage.error('完成配置失败')
        return false
      }
    },

    /**
     * 重置配置
     */
    resetConfiguration() {
      this.nodesMap.forEach(node => {
        node.status = 'unconfigured'
        node.configuration = {}
        node.quantity = node.defaultQuantity || 1
        node.selectedProductId = null
        node.isVisible = true
        node.isDisabled = false
      })

      this.configSession.configuration = {}
      this.configSession.status = 'draft'
      this.validationErrors = {}
      this.pricing = {
        totalPrice: 0,
        breakdown: []
      }

      RuleEngine.reset()
    }
  }
})
