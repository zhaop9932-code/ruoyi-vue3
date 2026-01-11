<template>
  <div class="product-configurator">
    <!-- 头部 -->
    <div class="configurator-header">
      <div class="header-left">
        <div class="header-info">
          <h2>{{ bomInfo.bomName || '产品配置器' }}</h2>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/userselect/configurator/list' }">产品配置器</el-breadcrumb-item>
            <el-breadcrumb-item>{{ bomInfo.bomName || '配置详情' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div class="header-right">
        <!-- 配置进度 -->
        <div class="config-progress">
          <el-progress 
            :percentage="configProgress" 
            :color="progressColor"
            :show-text="false"
            style="width: 120px;"
          />
          <span class="progress-text">{{ configProgress }}%</span>
        </div>
        
        <!-- 总价显示 -->
        <div class="total-price">
          <span class="price-label">总价:</span>
          <span class="price-value">¥{{ formatPrice(totalPrice) }}</span>
        </div>
        
        <!-- 方案选择 -->
        <el-dropdown @command="handleSolutionChange" trigger="click">
          <el-button :icon="Collection">
            {{ currentSolution?.solutionName || '选择方案' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="solution in solutions" 
                :key="solution.solutionId"
                :command="solution.solutionId"
                :disabled="solution.solutionId === currentSolution?.solutionId"
              >
                <div class="solution-item">
                  <span>{{ solution.solutionName }}</span>
                  <el-tag size="small" type="info">{{ solution.scenarioName }}</el-tag>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="custom">
                <el-icon><Plus /></el-icon> 自定义方案
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button :icon="Refresh" @click="handleReload">刷新</el-button>
        <el-button :icon="Setting" @click="handleResetConfig">重置</el-button>
        <el-button :icon="Document" @click="handleGenerateQuote">生成报价单</el-button>
        <el-button :icon="Share" @click="handleShareConfig">分享配置</el-button>
        <el-button type="primary" :icon="Check" @click="handleComplete">完成配置</el-button>
        <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
      </div>
    </div>

    <!-- 配置向导步骤 -->
    <div v-if="showWizard" class="config-wizard">
      <el-steps :active="wizardStep" align-center finish-status="success">
        <el-step 
          v-for="(step, index) in wizardSteps" 
          :key="index"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
        />
      </el-steps>
    </div>

    <!-- 主内容区 -->
    <div v-loading="loading" class="configurator-content">
      <el-container>
        <!-- 左侧：产品结构树 + 快捷操作 -->
        <el-aside :width="leftPanelWidth" class="tree-panel">
          <div class="panel-header">
            <el-tabs v-model="leftActiveTab" @tab-click="handleLeftTabChange">
              <el-tab-pane label="产品结构" name="tree">
                <template #label>
                  <span class="tab-label">
                    <el-icon><Histogram /></el-icon>
                    产品结构
                  </span>
                </template>
              </el-tab-pane>
              <el-tab-pane label="推荐方案" name="recommend">
                <template #label>
                  <span class="tab-label">
                    <el-icon><MagicStick /></el-icon>
                    智能推荐
                  </span>
                </template>
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <!-- 产品结构树 -->
          <div v-if="leftActiveTab === 'tree'" class="panel-content">
            <ProductTree
              ref="productTreeRef"
              :bom-id="bomId"
              :tree-data="treeData"
              :configured-nodes="configuredNodes"
              @node-select="handleNodeSelect"
            />
          </div>
          
          <!-- 智能推荐 -->
          <div v-if="leftActiveTab === 'recommend'" class="panel-content">
            <RecommendPanel 
              :bom-id="bomId"
              :current-config="currentConfig"
              @apply-recommend="handleApplyRecommend"
            />
          </div>
        </el-aside>

        <!-- 中间：配置面板 -->
        <el-main class="config-panel">
          <!-- 属性配置面板 -->
          <AttributeConfig
            ref="attributeConfigRef"
            :current-node="selectedNode"
            :bom-id="bomId"
            @config-change="handleConfigChange"
            @config-confirm="handleConfigConfirm"
          />
        </el-main>

        <!-- 右侧：配置摘要 -->
        <el-aside :width="rightPanelWidth" class="summary-panel">
          <div class="panel-header">
            <div class="tab-label">
              &nbsp; &nbsp;
              <el-icon><DocumentCopy /></el-icon>
              配置摘要
            </div>
          </div>
          
          <div class="panel-content">
            <!-- 配置摘要 -->
            <ConfigurationSummary
              :configured-nodes="configuredNodes"
              :total-nodes="totalNodes"
              :required-nodes="requiredNodes"
              @node-click="handleSummaryNodeClick"
            />
          </div>
        </el-aside>
      </el-container>
    </div>

    <!-- 保存配置对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      title="保存配置"
      width="500px"
      append-to-body
    >
      <el-form ref="saveFormRef" :model="saveForm" :rules="saveRules" label-width="100px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="saveForm.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置描述" prop="configDesc">
          <el-input 
            v-model="saveForm.configDesc" 
            type="textarea" 
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Refresh, ArrowLeft, Check, Plus, Collection, ArrowDown,
  Histogram, MagicStick, Setting,
  DocumentCopy, Tickets, Share, Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useConfiguratorStore from '@/store/modules/configurator'
import ProductTree from './components/ProductTree.vue'
import AttributeConfig from './components/AttributeConfig.vue'
import ConfigurationSummary from './components/ConfigurationSummary.vue'
import RecommendPanel from './components/RecommendPanel.vue'
import PricingDetails from './components/PricingDetails.vue'
import { 
  getSuperBom,
  listSuperBomStructureTree,
  getSolutionsByBomId,
  applyDefaultProducts
} from '@/api/cpq/bom'
import { listConfigurationRule } from '@/api/cpq/rule'

const route = useRoute()
const router = useRouter()
const configuratorStore = useConfiguratorStore()

// 引用
const productTreeRef = ref(null)
const attributeConfigRef = ref(null)
const saveFormRef = ref(null)

// BOM ID（从路由参数获取）
const bomId = ref(route.params.bomId || route.query.bomId)

// BOM信息
const bomInfo = ref({
  bomId: null,
  bomName: '',
  bomCode: '',
  bomDesc: ''
})

// 面板宽度
const leftPanelWidth = ref('320px')
const rightPanelWidth = ref('380px')

// 激活的标签页
const leftActiveTab = ref('tree')
const rightActiveTab = ref('summary')

// 配置向导
const showWizard = ref(false)
const wizardStep = ref(0)
const wizardSteps = ref([
  { title: '选择产品', description: '从产品结构树选择节点', icon: Histogram },
  { title: '配置属性', description: '设置产品属性和参数', icon: Setting },
  { title: '完成配置', description: '保存配置结果', icon: Check }
])

// 数据状态
const loading = ref(false)
const treeData = ref([])
const selectedNode = ref(null)
const configuredNodes = ref([])
const currentConfig = ref({})

// 方案相关
const solutions = ref([])
const currentSolution = ref(null)

// 规则验证
const validationResults = ref([])
const validationErrors = ref([])

// 价格相关
const pricingBreakdown = ref([])
const totalPrice = ref(0)
const discountInfo = ref({})

// 保存对话框
const saveDialogVisible = ref(false)
const saveForm = ref({
  configName: '',
  configDesc: ''
})
const saveRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ]
}

// 计算属性
const totalNodes = computed(() => {
  return countNodes(treeData.value)
})

const requiredNodes = computed(() => {
  return countRequiredNodes(treeData.value)
})

const configProgress = computed(() => {
  if (totalNodes.value === 0) return 0
  return Math.round((configuredNodes.value.length / totalNodes.value) * 100)
})

const progressColor = computed(() => {
  const progress = configProgress.value
  if (progress < 30) return '#f56c6c'
  if (progress < 60) return '#e6a23c'
  if (progress < 100) return '#409eff'
  return '#67c23a'
})

// 递归统计节点数量
const countNodes = (nodes) => {
  let count = 0
  nodes.forEach(node => {
    count++
    if (node.children && node.children.length > 0) {
      count += countNodes(node.children)
    }
  })
  return count
}

// 递归统计必选节点数量
const countRequiredNodes = (nodes) => {
  let count = 0
  nodes.forEach(node => {
    if (node.isRequired === '1') {
      count++
    }
    if (node.children && node.children.length > 0) {
      count += countRequiredNodes(node.children)
    }
  })
  return count
}

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 加载BOM信息
const loadBomInfo = async () => {
  try {
    const response = await getSuperBom(bomId.value)
    bomInfo.value = response.data || {}
    // 将BOM信息存储到store中，供其他组件访问
    configuratorStore.setCurrentBom({
      bomId: bomInfo.value.bomId,
      bomName: bomInfo.value.bomName,
      bomCode: bomInfo.value.bomCode
    })
  } catch (error) {
    console.error('加载BOM信息失败:', error)
    ElMessage.error('加载BOM信息失败')
    // 重置store中的BOM信息
    configuratorStore.setCurrentBom()
  }
}

// 加载BOM结构树
const loadBomStructure = async (forceReload = false) => {
  try {
    // 如果不是强制刷新且已有数据，直接返回
    if (!forceReload && treeData.value.length > 0) {
      return
    }
    
    loading.value = true
    const response = await listSuperBomStructureTree(bomId.value)
    const newTreeData = response.data || []
    
    // 比较新旧数据，只在数据变化时更新
    if (!isEqual(treeData.value, newTreeData)) {
      treeData.value = newTreeData
      
      // 初始化节点状态
      initializeNodeStatus(treeData.value)
      
      // 更新节点数量统计
      updateNodeCount()
      
      // 如果当前选中的节点在新数据中不存在，清空选中状态
      if (selectedNode.value) {
        const nodeExists = findNodeById(treeData.value, selectedNode.value.bomStructureId)
        if (!nodeExists) {
          selectedNode.value = null
        }
      }
      
      // 更新已配置节点列表，移除不存在的节点
      configuredNodes.value = configuredNodes.value.filter(configuredNode => {
        return findNodeById(treeData.value, configuredNode.bomStructureId) !== null
      })
      
      // 自动选中第一个节点
      if (newTreeData.length > 0 && !selectedNode.value) {
        const firstNode = newTreeData[0]
        console.log('自动选中第一个节点:', firstNode)
        handleNodeSelect(firstNode)
      }
    }
  } catch (error) {
    console.error('加载BOM结构失败:', error)
    ElMessage.error('加载BOM结构失败')
  } finally {
    loading.value = false
  }
}

// 深度比较两个对象是否相等
const isEqual = (obj1, obj2) => {
  // 处理基本类型比较
  if (obj1 === obj2) return true
  
  // 处理null/undefined情况
  if (obj1 == null || obj2 == null) return false
  
  // 处理不同类型比较
  if (typeof obj1 !== typeof obj2) return false
  
  // 处理数组比较
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) return false
    }
    return true
  }
  
  // 处理对象比较
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    
    if (keys1.length !== keys2.length) return false
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false
      if (!isEqual(obj1[key], obj2[key])) return false
    }
    return true
  }
  
  return false
}

// 更新节点数量统计
const updateNodeCount = () => {
  // 这个函数会在计算属性中自动调用，不需要额外实现
}



// 定期检查BOM结构更新（每分钟检查一次）
let bomStructureCheckTimer = null
const startBomStructureCheck = () => {
  if (bomStructureCheckTimer) {
    clearInterval(bomStructureCheckTimer)
  }
  // 每分钟检查一次BOM结构更新
  bomStructureCheckTimer = setInterval(async () => {
    await loadBomStructure(true)
  }, 60000)
}

// 停止检查BOM结构更新
const stopBomStructureCheck = () => {
  if (bomStructureCheckTimer) {
    clearInterval(bomStructureCheckTimer)
    bomStructureCheckTimer = null
  }
}

// 初始化节点状态
const initializeNodeStatus = (nodes) => {
  nodes.forEach(node => {
    node.status = 'pending' // pending, configured, error
    node.isVisible = true
    node.isDisabled = false
    
    if (node.children && node.children.length > 0) {
      initializeNodeStatus(node.children)
    }
  })
}

// 加载方案列表
const loadSolutions = async () => {
  try {
    const response = await getSolutionsByBomId(bomId.value)
    solutions.value = response.data || []
    
    // 默认选择第一个方案
    if (solutions.value.length > 0) {
      currentSolution.value = solutions.value[0]
      await applySolution(currentSolution.value.solutionId)
    }
  } catch (error) {
    console.error('加载方案列表失败:', error)
  }
}

// 应用方案
const applySolution = async (solutionId) => {
  try {
    loading.value = true
    // 这里应该调用API加载方案配置
    ElMessage.success('方案加载成功')
  } catch (error) {
    console.error('应用方案失败:', error)
    ElMessage.error('应用方案失败')
  } finally {
    loading.value = false
  }
}

// 处理方案切换
const handleSolutionChange = async (solutionId) => {
  if (solutionId === 'custom') {
    // 自定义方案
    currentSolution.value = null
    return
  }
  
  const solution = solutions.value.find(s => s.solutionId === solutionId)
  if (solution) {
    currentSolution.value = solution
    await applySolution(solutionId)
  }
}

// 处理左侧标签页切换
const handleLeftTabChange = (tab) => {
  console.log('左侧标签页切换:', tab.paneName)
}



// 处理节点选择
const handleNodeSelect = (node) => {
  console.log('节点被点击:', node)
  selectedNode.value = node
  
  // 更新向导步骤
  if (showWizard.value) {
    wizardStep.value = 1
  }
  
  console.log('selectedNode已更新:', selectedNode.value)
}

// 处理配置变更
const handleConfigChange = (config) => {
  currentConfig.value = {
    ...currentConfig.value,
    [selectedNode.value.bomStructureId]: config
  }
  
  // 实时验证规则
  validateConfiguration()
  
  // 更新价格
  calculatePrice()
}

// 处理配置确认
const handleConfigConfirm = (config) => {
  if (!selectedNode.value) return
  
  // 标记节点为已配置
  selectedNode.value.status = 'configured'
  selectedNode.value.configuration = config
  
  // 添加到已配置列表
  if (!configuredNodes.value.find(n => n.bomStructureId === selectedNode.value.bomStructureId)) {
    configuredNodes.value.push({
      ...selectedNode.value,
      configuration: config
    })
  }
  
  // 更新向导步骤
  if (showWizard.value) {
    wizardStep.value = 2
  }
  
  ElMessage.success('配置保存成功')
  
  // 清空选中节点，准备选择下一个
  setTimeout(() => {
    selectedNode.value = null
  }, 500)
}



// 处理应用推荐
const handleApplyRecommend = (recommendConfig) => {
  ElMessageBox.confirm(
    '应用推荐配置将覆盖当前配置，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 应用推荐配置
    currentConfig.value = recommendConfig
    ElMessage.success('推荐配置已应用')
    
    // 重新加载配置
    loadBomStructure()
  }).catch(() => {
    // 取消操作
  })
}

// 验证配置
const validateConfiguration = async () => {
  try {
    // 调用规则引擎验证
    const response = await listConfigurationRule({
      bomId: bomId.value
    })
    
    const rules = response.rows || []
    validationResults.value = []
    validationErrors.value = []
    
    // 执行规则验证
    rules.forEach(rule => {
      const result = executeRule(rule, currentConfig.value)
      validationResults.value.push(result)
      
      if (!result.passed) {
        validationErrors.value.push({
          nodeId: result.nodeId,
          ruleName: rule.ruleName,
          message: result.message
        })
      }
    })
    
    // 更新节点状态
    updateNodeStatusByValidation()
    
  } catch (error) {
    console.error('验证配置失败:', error)
  }
}

// 执行单个规则
const executeRule = (rule, config) => {
  // 这里应该实现完整的规则引擎逻辑
  // 暂时返回模拟结果
  return {
    ruleId: rule.ruleId,
    ruleName: rule.ruleName,
    passed: true,
    message: '',
    nodeId: null
  }
}

// 根据验证结果更新节点状态
const updateNodeStatusByValidation = () => {
  const errorNodeIds = new Set(validationErrors.value.map(e => e.nodeId))
  
  const updateStatus = (nodes) => {
    nodes.forEach(node => {
      if (errorNodeIds.has(node.bomStructureId)) {
        node.status = 'error'
      } else if (node.status === 'error' && !errorNodeIds.has(node.bomStructureId)) {
        node.status = node.configuration ? 'configured' : 'pending'
      }
      
      if (node.children && node.children.length > 0) {
        updateStatus(node.children)
      }
    })
  }
  
  updateStatus(treeData.value)
}



// 查找节点
const findNodeById = (nodes, nodeId) => {
  for (const node of nodes) {
    if (node.bomStructureId === nodeId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, nodeId)
      if (found) return found
    }
  }
  return null
}

// 处理摘要节点点击
const handleSummaryNodeClick = (node) => {
  handleNodeSelect(node)
}

// 计算价格
const calculatePrice = () => {
  let breakdown = []
  let total = 0
  
  configuredNodes.value.forEach(node => {
    if (node.configuration) {
      const nodeType = node.nodeType || '0'
      
      // 检查是否有选中的产品ID
      const hasSelectedProducts = node.configuration.selectedProductId || 
                                 (Array.isArray(node.configuration.selectedProductIds) && node.configuration.selectedProductIds.length > 0)
      
      if (hasSelectedProducts) {
        // 处理选中的产品
        const selectedProductIds = Array.isArray(node.configuration.selectedProductIds) 
          ? node.configuration.selectedProductIds 
          : [node.configuration.selectedProductId]
        
        selectedProductIds.forEach((productId, index) => {
          if (node.configuration.price) {
            const quantity = node.configuration.productQuantities?.[productId] || node.configuration.quantity || 1
            const price = node.configuration.price
            const subtotal = quantity * price
            
            // 从配置中获取产品详情
            const productDetails = node.configuration.productDetails || {}
            const productDetail = productDetails[productId] || {}
            
            breakdown.push({
              nodeId: `${node.bomStructureId}-${index}`,
              productName: productDetail.name || node.configuration.productName || `产品${productId}`,
              specification: productDetail.model || '',
              quantity,
              unitPrice: price,
              subtotal
            })
            
            total += subtotal
          }
        })
      } else if (!['0', '1', '2'].includes(nodeType) && node.configuration.price) {
        // 只有当节点类型不是0,1,2且没有选中产品时，才添加节点信息
        const quantity = node.configuration.quantity || 1
        const price = node.configuration.price
        const subtotal = quantity * price
        
        breakdown.push({
          nodeId: node.bomStructureId,
          productName: node.nodeName,
          specification: '',
          quantity,
          unitPrice: price,
          subtotal
        })
        
        total += subtotal
      }
    }
  })
  
  pricingBreakdown.value = breakdown
  totalPrice.value = total
}

// 返回列表
const handleBack = async () => {
  if (configuredNodes.value.length > 0) {
    try {
      await ElMessageBox.confirm(
        '当前配置尚未保存，确定要返回吗？',
        '提示',
        {
          confirmButtonText: '保存并返回',
          cancelButtonText: '直接返回',
          distinguishCancelAndClose: true,
          type: 'warning'
        }
      )
      // 用户选择保存并返回
      await handleSaveConfig()
      router.push({ path: '/userselect/configurator/list' })
    } catch (action) {
      if (action === 'cancel') {
        // 用户选择直接返回
        router.push({ path: '/userselect/configurator/list' })
      }
    }
  } else {
    router.push({ path: '/userselect/configurator/list' })
  }
}

// 刷新配置器
const handleReload = async () => {
  await loadBomStructure()
  selectedNode.value = null
  configuredNodes.value = []
  currentConfig.value = {}
  validationResults.value = []
  validationErrors.value = []
}

// 重置配置
const handleResetConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有配置吗？此操作不可撤销。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用store的重置方法
    configuratorStore.resetConfiguration()
    
    // 重置本地状态
    selectedNode.value = null
    configuredNodes.value = []
    currentConfig.value = {}
    validationResults.value = []
    validationErrors.value = []
    pricingBreakdown.value = []
    totalPrice.value = 0
    
    // 重新加载BOM结构
    await loadBomStructure(true)
    
    ElMessage.success('配置已重置')
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('重置配置失败:', error)
      ElMessage.error('重置配置失败')
    }
  }
}

// 生成报价单
const handleGenerateQuote = async () => {
  try {
    // 检查是否有已配置的节点
    if (configuredNodes.value.length === 0) {
      ElMessage.warning('请先配置产品后再生成报价单')
      return
    }
    
    loading.value = true
    
    // 这里应该调用API生成报价单
    // 暂时模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟生成报价单数据
    const quoteData = {
      bomId: bomId.value,
      bomName: bomInfo.value.bomName,
      totalPrice: totalPrice.value,
      pricingBreakdown: pricingBreakdown.value,
      configuredNodes: configuredNodes.value,
      generateTime: new Date().toISOString()
    }
    
    // 这里可以根据需求实现页面内展示或下载功能
    console.log('生成报价单:', quoteData)
    
    // 暂时使用消息提示
    ElMessage.success('报价单生成成功')
    
    // 后续可以扩展：
    // 1. 弹出报价单预览对话框
    // 2. 触发文件下载
    // 3. 跳转到报价单详情页
  } catch (error) {
    console.error('生成报价单失败:', error)
    ElMessage.error('生成报价单失败')
  } finally {
    loading.value = false
  }
}

// 分享配置
const handleShareConfig = async () => {
  try {
    // 检查是否有已配置的节点
    if (configuredNodes.value.length === 0) {
      ElMessage.warning('请先配置产品后再分享')
      return
    }
    
    loading.value = true
    
    // 这里应该调用API生成分享链接或二维码
    // 暂时模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟生成分享链接
    const shareUrl = `${window.location.origin}${window.location.pathname}?bomId=${bomId.value}&shareToken=mock-share-token-123456`
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(shareUrl)
    
    ElMessage.success('分享链接已复制到剪贴板')
    
    // 后续可以扩展：
    // 1. 弹出分享对话框，显示二维码和链接
    // 2. 支持多种分享方式
    // 3. 生成带有效期的分享链接
  } catch (error) {
    console.error('分享配置失败:', error)
    ElMessage.error('分享配置失败')
  } finally {
    loading.value = false
  }
}

// 完成配置
const handleComplete = async () => {
  // 检查必选节点是否都已配置
  const missingRequired = checkRequiredNodes()
  
  if (missingRequired.length > 0) {
    ElMessage.warning(`还有${missingRequired.length}个必选节点未配置`)
    return
  }
  
  // 最终验证
  await validateConfiguration()
  
  if (validationErrors.value.length > 0) {
    ElMessage.error('配置不符合规则要求，请检查')
    return
  }
  
  // 显示保存对话框
  saveDialogVisible.value = true
}

// 检查必选节点
const checkRequiredNodes = () => {
  const missing = []
  
  const check = (nodes) => {
    nodes.forEach(node => {
      if (node.isRequired === '1' && node.status !== 'configured') {
        missing.push(node)
      }
      if (node.children && node.children.length > 0) {
        check(node.children)
      }
    })
  }
  
  check(treeData.value)
  return missing
}

// 保存配置
const handleSaveConfig = async () => {
  try {
    await saveFormRef.value.validate()
    
    loading.value = true
    
    // 构建保存数据
    const saveData = {
      bomId: bomId.value,
      configName: saveForm.value.configName,
      configDesc: saveForm.value.configDesc,
      configuration: currentConfig.value,
      configuredNodes: configuredNodes.value,
      totalPrice: totalPrice.value,
      pricingBreakdown: pricingBreakdown.value
    }
    
    // 调用API保存
    // await saveConfiguration(saveData)
    
    ElMessage.success('配置保存成功')
    saveDialogVisible.value = false
    
  } catch (error) {
    if (error !== false) {
      console.error('保存配置失败:', error)
      ElMessage.error('保存配置失败')
    }
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  console.log('初始化开始')
  console.log('路由参数:', route.params)
  console.log('查询参数:', route.query)
  console.log('初始bomId:', bomId.value)
  
  if (!bomId.value) {
    ElMessage.error('缺少BOM ID参数')
    router.push({ path: '/userselect/configurator/list' })
    return
  }
  
  try {
    await Promise.all([
      loadBomInfo(),
      loadBomStructure(),
      loadSolutions()
    ])
    
    console.log('初始化完成')
    console.log('treeData:', treeData.value)
    console.log('selectedNode:', selectedNode.value)
    
    // 启动定期检查BOM结构更新
    startBomStructureCheck()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败')
    setTimeout(() => {
      router.push({ path: '/userselect/configurator/list' })
    }, 2000)
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopBomStructureCheck()
})

// 监听BOM ID变化，重新加载数据
watch(
  () => bomId.value,
  async (newBomId) => {
    if (newBomId) {
      try {
        await Promise.all([
          loadBomInfo(),
          loadBomStructure(true),
          loadSolutions()
        ])
      } catch (error) {
        console.error('切换BOM失败:', error)
        ElMessage.error('切换BOM失败')
      }
    }
  }
)

// 监听路由变化，确保BOM ID正确
watch(
  () => route.params.bomId,
  (newBomId) => {
    if (newBomId && newBomId !== bomId.value) {
      bomId.value = newBomId
    }
  }
)

// 监听配置变化
watch(
  () => configuredNodes.value.length,
  () => {
    calculatePrice()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.product-configurator {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  .configurator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    z-index: 10;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-info {
        h2 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        .el-breadcrumb {
          font-size: 14px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .config-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .progress-text {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
          min-width: 40px;
        }
      }
      
      .total-price {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        
        .price-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .price-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }
      }
      
      .solution-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 200px;
      }
    }
  }
  
  .config-wizard {
    padding: 24px 48px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
    
    :deep(.el-steps) {
      .el-step__title {
        font-size: 14px;
      }
      
      .el-step__description {
        font-size: 12px;
      }
    }
  }

  .configurator-content {
    flex: 1;
    overflow: hidden;
    padding: 16px;

    .el-container {
      height: 100%;
      gap: 16px;
    }

    .tree-panel,
    .config-panel,
    .summary-panel {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 0;
    }
    
    .panel-header {
      flex-shrink: 0;
      border-bottom: 1px solid #e4e7ed;
      
      :deep(.el-tabs) {
        .el-tabs__header {
          margin: 0;
          
          .el-tabs__nav-wrap {
            padding: 0 16px;
          }
          
          .el-tabs__item {
            height: 48px;
            line-height: 48px;
            font-size: 14px;
          }
        }
      }
      
      .tab-label {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
    
    .panel-content {
      flex: 1;
      overflow: auto;
      padding: 0;
    }


    
    .summary-panel {
      .panel-content {
        padding: 0;
      }
    }
  }
}
</style>
