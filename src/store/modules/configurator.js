import { defineStore } from 'pinia';
const useConfiguratorStore = defineStore(
  'configurator',
  {
    state: () => ({
      // 当前BOM信息
      currentBom: {
        bomId: '',
        bomName: '',
        bomCode: ''
      },
      // 加载状态
      loading: {
        bom: false,
        rules: false,
        attributes: false
      },
      // 配置会话
      configSession: {
        status: 'draft', // draft, saved, completed
        configuration: {}
      },
      // 配置摘要
      configurationSummary: {
        totalNodes: 0,
        configuredNodes: 0,
        requiredNodes: 0,
        errors: 0
      },
      // 已配置节点
      configuredNodes: [],
      // 规则验证结果
      validationResults: [],
      // 价格信息
      pricing: {
        breakdown: [],
        totalPrice: 0,
        productPrice: 0,
        servicePrice: 0,
        subtotal: 0
      }
    }),
    
    getters: {
      // 获取当前BOM信息
      getCurrentBom: (state) => state.currentBom,
      // 获取配置会话状态
      getConfigSessionStatus: (state) => state.configSession.status,
      // 获取已配置节点
      getConfiguredNodes: (state) => state.configuredNodes,
      // 获取价格明细
      getPricingBreakdown: (state) => state.pricing.breakdown,
      // 获取总价
      getTotalPrice: (state) => state.pricing.totalPrice
    },
    
    actions: {
      // 设置当前BOM信息
      setCurrentBom(bomInfo) {
        this.currentBom = bomInfo || { bomId: '', bomName: '', bomCode: '' }
      },
      
      // 更新加载状态
      updateLoadingState(type, status) {
        if (this.loading[type] !== undefined) {
          this.loading[type] = status
        }
      },
      
      // 保存配置会话
      async saveConfigSession() {
        try {
          // 这里应该调用实际的API来保存配置会话
          // 暂时模拟异步请求
          await new Promise(resolve => setTimeout(resolve, 800))
          this.configSession.status = 'saved'
          console.log('保存配置会话成功')
        } catch (error) {
          console.error('保存配置会话失败:', error)
          throw error
        }
      },
      // 重置配置
      resetConfiguration() {
        this.configSession.configuration = {}
        this.configuredNodes = []
        this.pricing = {
          breakdown: [],
          totalPrice: 0,
          productPrice: 0,
          servicePrice: 0,
          subtotal: 0
        }
        this.configurationSummary.configuredNodes = 0
        this.configurationSummary.errors = 0
      },
      // 完成配置
      completeConfiguration() {
        if (this.configuredNodes.length === 0) {
          return false
        }
        this.configSession.status = 'completed'
        return true
      },
      // 更新节点数量
      updateNodeQuantity(nodeId, quantity) {
        console.log('更新节点数量:', nodeId, quantity)
        // 查找并更新节点数量
        const nodeIndex = this.configuredNodes.findIndex(node => node.bomStructureId === nodeId)
        if (nodeIndex !== -1) {
          this.configuredNodes[nodeIndex].quantity = quantity
          // 更新价格等信息
          this.updatePriceBreakdown(nodeId, this.configuredNodes[nodeIndex].configuration, this.configuredNodes[nodeIndex])
        }
      },
      
      // 更新产品数量
      updateProductQuantity(nodeId, productId, quantity) {
        console.log('更新产品数量:', nodeId, productId, quantity)
        // 查找节点
        const nodeIndex = this.configuredNodes.findIndex(node => node.bomStructureId === nodeId)
        if (nodeIndex !== -1) {
          const node = this.configuredNodes[nodeIndex]
          // 更新节点配置中的产品数量
          if (!node.configuration.productQuantities) {
            node.configuration.productQuantities = {}
          }
          node.configuration.productQuantities[productId] = quantity
          // 更新价格明细
          this.updatePriceBreakdown(nodeId, node.configuration, node)
        }
      },
      
      selectNodeProduct(nodeId, productId) {
        console.log('选择节点产品:', nodeId, productId)
        // 查找节点，如果不存在则添加
        let node = this.configuredNodes.find(n => n.bomStructureId === nodeId)
        if (!node) {
          // 模拟节点数据，实际应该从API获取
          node = {
            bomStructureId: nodeId,
            nodeName: `节点${nodeId}`,
            nodeType: '0',
            quantity: 1,
            configuration: {}
          }
          this.configuredNodes.push(node)
          this.configurationSummary.configuredNodes++
        }
        // 更新节点配置
        node.configuration.selectedProductId = productId
      },
      selectNodeProducts(nodeId, productIds) {
        console.log('选择多个节点产品:', nodeId, productIds)
        // 查找节点，如果不存在则添加
        let node = this.configuredNodes.find(n => n.bomStructureId === nodeId)
        if (!node) {
          // 模拟节点数据，实际应该从API获取
          node = {
            bomStructureId: nodeId,
            nodeName: `节点${nodeId}`,
            nodeType: '0',
            quantity: 1,
            configuration: {}
          }
          this.configuredNodes.push(node)
          this.configurationSummary.configuredNodes++
        }
        // 更新节点配置
        node.configuration.selectedProductIds = productIds
      },
      // 保存节点配置
      async saveNodeConfiguration(nodeId, config) {
        console.log('保存节点配置:', nodeId, config)
        try {
          // 这里应该调用实际的API来保存节点配置
          // 暂时模拟异步请求
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 查找节点，如果不存在则添加
          let node = this.configuredNodes.find(n => n.bomStructureId === nodeId)
          if (!node) {
            // 模拟节点数据，实际应该从API获取
            node = {
              bomStructureId: nodeId,
              nodeName: `节点${nodeId}`,
              nodeType: '0',
              quantity: config.quantity || 1,
              configuration: {}
            }
            this.configuredNodes.push(node)
            this.configurationSummary.configuredNodes++
          }
          
          // 更新节点配置
          node.quantity = config.quantity || 1
          node.configuration = {
            ...node.configuration,
            ...config
          }
          
          // 更新价格明细
          this.updatePriceBreakdown(nodeId, config, node)
          
          return true
        } catch (error) {
          console.error('保存节点配置失败:', error)
          return false
        }
      },
      
      // 更新价格明细
      updatePriceBreakdown(nodeId, config, node) {
        // 移除当前节点的所有现有价格明细条目，包括使用nodeId-index格式的条目
        this.pricing.breakdown = this.pricing.breakdown.filter(item => 
          typeof item.nodeId !== 'string' || !item.nodeId.startsWith(`${nodeId}`)
        )
        
        // 获取所有选中的产品ID
        let selectedProductIds = []
        if (config) {
          if (config.selectedProductId !== null && config.selectedProductId !== undefined) {
            // 单选模式 - 只显示一个产品
            selectedProductIds = [config.selectedProductId]
          } else if (Array.isArray(config.selectedProductIds)) {
            // 多选模式 - 显示所有选中的产品
            selectedProductIds = config.selectedProductIds
          }
        }
        
        // 获取节点类型，默认为'0'
        const nodeType = node?.nodeType || '0'
        
        // 根据节点类型和选中产品情况处理
        if (selectedProductIds.length > 0) {
          // 有选中产品时，为每个选中的产品添加一行
          selectedProductIds.forEach((productId, index) => {
            // 准备产品信息
            let productName = `产品${productId}`
            let productModel = ''
            
            // 优先从productDetails获取产品名称和型号（新逻辑）
            if (config && config.productDetails && config.productDetails[productId]) {
              productName = config.productDetails[productId].name || productName
              productModel = config.productDetails[productId].model || ''
            } else if (config) {
              // 向后兼容：尝试从其他地方获取产品型号
              productModel = config.model || config.productModel || ''
              
              if (!productModel) {
                productModel = config.attrs?.model || config.attrs?.productModel || 
                              config.dynamicAttrs?.model || config.dynamicAttrs?.productModel || ''
              }
            }
            
            // 准备规格描述 - 只显示产品型号
            let specification = productModel || ''
            
            // 计算产品数量
            // 在多选模式下，每个产品使用独立的数量
            // 尝试从配置中获取当前产品的独立数量
            let quantity = 1
            if (config && config.productQuantities) {
              quantity = config.productQuantities[productId] || config.quantity || 1
            } else {
              quantity = config?.quantity || 1
            }
            const unitPrice = config?.price || 0
            
            // 添加产品条目
            this.pricing.breakdown.push({
              nodeId: `${nodeId}-${index}`, // 使用唯一ID避免覆盖
              productName: productName,       // 名称直接使用产品名称
              specification: specification,   // 规格描述直接使用产品型号
              unitPrice: unitPrice,
              quantity: quantity,
              totalPrice: unitPrice * quantity
            })
          })
        }
        
        // 重新计算总价
        this.recalculateTotalPrice()
      },
      
      // 重新计算总价
      recalculateTotalPrice() {
        // 计算总价
        this.pricing.totalPrice = this.pricing.breakdown.reduce((total, item) => {
          return total + item.totalPrice
        }, 0)
        
        // 产品价格和服务价格暂时使用相同的值
        this.pricing.productPrice = this.pricing.totalPrice
        this.pricing.servicePrice = 0
        this.pricing.subtotal = this.pricing.totalPrice
      },
      
      // 验证配置
      async validateConfiguration() {
        try {
          // 这里应该调用实际的API来验证配置
          // 暂时模拟异步请求
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 模拟验证结果
          this.validationResults = []
          return true
        } catch (error) {
          console.error('验证配置失败:', error)
          return false
        }
      },
      
      // 验证属性
      async validateAttribute(nodeId, attributeCode, value) {
        console.log('验证属性:', nodeId, attributeCode, value)
        
        // 查找节点
        let node = this.configuredNodes.find(n => n.bomStructureId === nodeId)
        if (!node) {
          // 创建新节点
          node = {
            bomStructureId: nodeId,
            nodeName: `节点${nodeId}`,
            nodeType: '3', // 默认参数要求类型
            quantity: 1,
            configuration: {
              attrs: {},
              dynamicAttrs: {}
            }
          }
          this.configuredNodes.push(node)
          this.configurationSummary.configuredNodes++
        }
        
        // 更新节点配置中的属性值
        // 确保 attributeCode 是字符串
        const attrCodeStr = String(attributeCode)
        if (attrCodeStr.startsWith('dynamicAttrs.')) {
          // 动态属性
          const attrId = attrCodeStr.replace('dynamicAttrs.', '')
          node.configuration.dynamicAttrs = {
            ...node.configuration.dynamicAttrs,
            [attrId]: value
          }
        } else {
          // 静态属性
          node.configuration.attrs = {
            ...node.configuration.attrs,
            [attributeCode]: value
          }
        }
        
        // 如果是参数要求类型，更新价格明细
        if (node.nodeType === '3') {
          this.updatePriceBreakdown(nodeId, node.configuration, node)
        }
        
        return true
      }
    }
  }
)

export default useConfiguratorStore