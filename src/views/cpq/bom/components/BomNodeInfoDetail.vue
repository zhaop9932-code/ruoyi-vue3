<template>
  <div class="bom-node-info-detail">
    <!-- 节点基础信息区域 - 置于顶部 -->
    <div class="node-basic-info-section">
      <div class="section-title">节点基础信息</div>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px" class="node-basic-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="节点编码" prop="nodeCode">
              <el-input v-model="formData.nodeCode" placeholder="请输入节点编码" @change="handleUpdate" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点名称" prop="nodeName">
              <el-input v-model="formData.nodeName" placeholder="请输入节点名称" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="节点类型" prop="nodeType">
              <el-select v-model="formData.nodeType" placeholder="请选择节点类型" @change="handleUpdate">
                <el-option label="物料" value="0" />
                <el-option label="组件" value="1" />
                <el-option label="服务" value="2" />
                <el-option label="参数要求" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点状态" prop="nodeStatus">
              <el-select v-model="formData.nodeStatus" placeholder="请选择节点状态" @change="handleUpdate">
                <el-option label="激活" value="active" />
                <el-option label="停用" value="inactive" />
                <el-option label="草稿" value="draft" />
                <el-option label="已批准" value="approved" />
                <el-option label="已弃用" value="deprecated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择类型" prop="selectionType">
              <el-select v-model="formData.selectionType" placeholder="请选择选择类型" @change="handleUpdate">
                <el-option label="单选" value="single" />
                <el-option label="多选" value="multiple" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必选" prop="isRequired">
              <el-switch v-model="formData.isRequired" active-value="1" inactive-value="0" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最少选择" prop="minSelection">
              <el-input-number v-model="formData.minSelection" :min="0" :step="1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最多选择" prop="maxSelection">
              <el-input-number v-model="formData.maxSelection" :min="0" :step="1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认数量" prop="defaultQuantity">
              <el-input-number v-model="formData.defaultQuantity" :min="0" :step="0.1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量是否可编辑" prop="isQuantityEditable">
              <el-switch v-model="formData.isQuantityEditable" active-value="1" inactive-value="0" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小数量" prop="minQuantity">
              <el-input-number v-model="formData.minQuantity" :min="0" :step="0.1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大数量" prop="maxQuantity">
              <el-input-number v-model="formData.maxQuantity" :min="0" :step="0.1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
         
          <el-col :span="12">
            <el-form-item label="节点排序" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" :min="0" :step="1" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否启用动态属性" prop="enableDynamicAttributes">
              <el-switch v-model="formData.enableDynamicAttributes" active-value="1" inactive-value="0" @change="handleUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否生成临时料号" prop="generateTempPartNumber">
              <el-switch v-model="formData.generateTempPartNumber" active-value="1" inactive-value="0" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="节点图标" prop="iconUrl">
              <icon-selector v-model="formData.iconUrl" @update:modelValue="handleUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点颜色" prop="nodeColor">
              <el-color-picker v-model="formData.nodeColor" @change="handleUpdate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="节点价格" prop="price">
              <el-input-number v-model="formData.price" :min="0" :step="0.01" @change="handleUpdate" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="节点描述" prop="nodeDescription">
          <el-input v-model="formData.nodeDescription" type="textarea" :rows="3" placeholder="请输入节点描述" @change="handleUpdate" />
        </el-form-item>
      </el-form>
    </div>


  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Search, Plus, Delete } from '@element-plus/icons-vue'
// 导入自定义图标选择器组件
import IconSelector from '@/components/IconSelector'

// 导入BOM API
import { updateSuperBomStructure } from '@/api/cpq/bom'
import { listSuperBomStructureAttribute } from '@/api/cpq/bom'
import { listProduct } from '@/api/cpq/product'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    required: true
  },
  selectedNode: {
    type: Object,
    required: true
  }
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  nodeCode: [
    { required: true, message: '请输入节点编码', trigger: 'blur' }
  ],
  nodeName: [
    { required: true, message: '请输入节点名称', trigger: 'blur' }
  ],
  nodeType: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  nodeStatus: [
    { required: true, message: '请选择节点状态', trigger: 'change' }
  ]
}

/**
 * 表单数据对象
 * 包含节点基础信息的核心字段
 */
const formData = reactive({
  // 节点基础信息
  nodeCode: props.selectedNode?.nodeCode || '',
  nodeName: props.selectedNode?.nodeName || '',
  nodeType: props.selectedNode?.nodeType || '0',
  nodeStatus: props.selectedNode?.nodeStatus || 'active',
  /**
   * 选择类型：single(单选)或multiple(多选)
   * @type {string}
   */
  selectionType: props.selectedNode?.selectionType || 'single',
  isRequired: props.selectedNode?.isRequired || '0',
  /**
   * 最小选择数量
   * 当selectionType为single时，自动设为1
   * 当selectionType为multiple时，必须满足0 ≤ minSelection ≤ maxSelection
   * @type {number}
   */
  minSelection: props.selectedNode?.minSelection || 0,
  /**
   * 最大选择数量
   * 当selectionType为single时，自动设为1
   * 当selectionType为multiple时，必须满足minSelection ≤ maxSelection ≥ 1
   * @type {number}
   */
  maxSelection: props.selectedNode?.maxSelection || 999,
  defaultQuantity: props.selectedNode?.defaultQuantity || 1,
  minQuantity: props.selectedNode?.minQuantity || 0,
  maxQuantity: props.selectedNode?.maxQuantity || 999,
  isQuantityEditable: props.selectedNode?.isQuantityEditable || '0',
  /**
   * 是否启用动态属性：开启后用户选型页面自动展示关联产品的属性，供用户根据属性选配
   * @type {string}
   */
  enableDynamicAttributes: props.selectedNode?.enableDynamicAttributes || '0',
  /**
   * 是否生成临时料号
   * @type {string}
   */
  generateTempPartNumber: props.selectedNode?.generateTempPartNumber || '0',
  /**
   * 节点图标URL
   * @type {string}
   */
  iconUrl: props.selectedNode?.iconUrl || '',
  /**
   * 节点颜色
   * @type {string}
   */
  nodeColor: props.selectedNode?.nodeColor || '',
  /**
   * 节点价格
   * @type {number}
   */
  price: props.selectedNode?.price || 0,
  parentNodeId: props.selectedNode?.parentNodeId || '',
  sortOrder: props.selectedNode?.sortOrder || 0,
  nodeDescription: props.selectedNode?.nodeDescription || ''
})

// 当前激活的标签页
const activeTab = ref('attribute')

// 本地节点数据（保持与表单数据同步）
const localNode = computed(() => {
  return {
    ...props.selectedNode,
    ...formData
  }
})

// 动态加载组件类型对应的属性组件
const componentTypeMap = {
  '0': defineAsyncComponent(() => import('./attributes/MaterialAttributes.vue')), // 物料
  '1': defineAsyncComponent(() => import('./attributes/ComponentAttributes.vue')), // 组件
  '2': defineAsyncComponent(() => import('./attributes/ServiceAttributes.vue')) // 服务
}

// 当前属性组件
const currentAttributeComponent = computed(() => {
  return componentTypeMap[localNode.value.nodeType] || null
})

// 动态属性相关
const selectedDynamicAttributes = ref([])
const availableDynamicAttributes = ref([])
const dynamicAttributeDialogVisible = ref(false)
const dynamicAttributeTableRef = ref(null)
const tempSelectedAttributes = ref([])

// 节点产品列表相关
const filteredProducts = ref([])
const productsLoading = ref(false)
const allProducts = ref([])

// 静态属性筛选和动态属性筛选
const staticAttributeFilters = computed(() => {
  // 从节点基本属性中提取静态筛选条件
  return []
})

const dynamicAttributeFilters = computed(() => {
  return selectedDynamicAttributes.value
})

// 获取组件类型名称
const getComponentTypeName = (type) => {
  const typeMap = {
    'input': '输入框',
    'select': '下拉框',
    'radio': '单选框',
    'checkbox': '多选框',
    'number': '数字输入',
    'slider': '滑块',
    'switch': '开关',
    'textarea': '文本域'
  }
  return typeMap[type] || type
}

// 获取组件类型标签样式
const getComponentTypeTag = (type) => {
  const tagMap = {
    'input': 'primary',
    'select': 'success',
    'radio': 'warning',
    'checkbox': 'danger',
    'number': 'info',
    'slider': '',
    'switch': '',
    'textarea': ''
  }
  return tagMap[type] || 'default'
}

// 组件挂载状态标志
let isMounted = false

// 加载可用的动态属性
const loadAvailableDynamicAttributes = async () => {
  try {
    const response = await listSuperBomStructureAttribute({
      bomId: props.bomId,
      bomStructureId: props.bomStructureId
    })
    // 只有在组件仍然挂载时才修改状态
    if (isMounted) {
      availableDynamicAttributes.value = response.rows || []
    }
  } catch (error) {
    console.error('加载动态属性失败:', error)
    // 只有在组件仍然挂载时才显示错误信息
    if (isMounted) {
      ElMessage.error('加载动态属性失败')
    }
  }
}

// 加载节点关联的产品列表
const loadNodeProducts = async () => {
  if (!isMounted) return
  
  productsLoading.value = true
  try {
    // 这里需要调用获取节点关联产品的API
    const response = await listProduct({
      pageNum: 1,
      pageSize: 100
    })
    // 只有在组件仍然挂载时才修改状态
    if (isMounted) {
      allProducts.value = response.rows || []
      filterProducts()
      productsLoading.value = false
    }
  } catch (error) {
    console.error('加载产品列表失败:', error)
    // 只有在组件仍然挂载时才显示错误信息
    if (isMounted) {
      ElMessage.error('加载产品列表失败')
      productsLoading.value = false
    }
  }
}

// 根据静态属性和动态属性筛选产品
const filterProducts = () => {
  let products = [...allProducts.value]
  
  // TODO: 根据静态属性筛选
  // TODO: 根据动态属性筛选
  
  filteredProducts.value = products
}

// 计算匹配度
const calculateMatchRate = (product) => {
  // TODO: 实现匹配度计算逻辑
  return 85
}

// 获取匹配度颜色
const getMatchRateColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 处理添加动态属性
const handleAddDynamicAttribute = async () => {
  await loadAvailableDynamicAttributes()
  dynamicAttributeDialogVisible.value = true
}

// 处理动态属性选择
const handleDynamicAttributeSelection = (selection) => {
  tempSelectedAttributes.value = selection
}

// 确认添加动态属性
const handleConfirmAddDynamicAttributes = () => {
  tempSelectedAttributes.value.forEach(attr => {
    if (!selectedDynamicAttributes.value.find(item => item.id === attr.id)) {
      selectedDynamicAttributes.value.push(attr)
    }
  })
  dynamicAttributeDialogVisible.value = false
  filterProducts() // 重新筛选产品
}

// 删除动态属性
const handleRemoveDynamicAttribute = (attribute) => {
  const index = selectedDynamicAttributes.value.findIndex(item => item.id === attribute.id)
  if (index !== -1) {
    selectedDynamicAttributes.value.splice(index, 1)
    filterProducts() // 重新筛选产品
  }
}

// 处理表单数据更新
const handleUpdate = () => {
  // 更新本地节点数据
  const updatedData = {
    bomStructureId: props.bomStructureId, // 确保传递bomStructureId
    nodeCode: formData.nodeCode,
    nodeName: formData.nodeName,
    nodeType: formData.nodeType,
    nodeStatus: formData.nodeStatus,
    selectionType: formData.selectionType,
    isRequired: formData.isRequired,
    minSelection: formData.minSelection,
    maxSelection: formData.maxSelection,
    defaultQuantity: formData.defaultQuantity,
    minQuantity: formData.minQuantity,
    maxQuantity: formData.maxQuantity,
    isQuantityEditable: formData.isQuantityEditable,
    enableDynamicAttributes: formData.enableDynamicAttributes,
    generateTempPartNumber: formData.generateTempPartNumber,
    iconUrl: formData.iconUrl,
    nodeColor: formData.nodeColor,
    price: formData.price,
    parentNodeId: formData.parentNodeId,
    sortOrder: formData.sortOrder,
    nodeDescription: formData.nodeDescription
  }
  
  // 触发节点更新事件
  emit('node-updated', updatedData)
}

// 处理属性组件的更新
const handleAttributeUpdate = (updatedData) => {
  // 处理属性组件的更新，确保包含bomStructureId
  emit('node-updated', {
    bomStructureId: props.bomStructureId,
    ...updatedData
  })
}

// 处理标签页切换
const handleTabChange = (tabName) => {
  console.log('标签页切换到:', tabName)
  // 可以添加标签页切换时的逻辑
}

// 监听选中节点变化
watch(() => props.selectedNode, (newNode) => {
  // 更新表单数据
  formData.nodeCode = newNode.nodeCode || ''
  formData.nodeName = newNode.nodeName || ''
  formData.nodeType = newNode.nodeType || '0'
  formData.nodeStatus = newNode.nodeStatus || 'active'
  formData.selectionType = newNode.selectionType || 'single'
  formData.isRequired = newNode.isRequired || '0'
  formData.minSelection = newNode.minSelection || 0
  formData.maxSelection = newNode.maxSelection || 999
  formData.defaultQuantity = newNode.defaultQuantity || 1
  formData.minQuantity = newNode.minQuantity || 0
  formData.maxQuantity = newNode.maxQuantity || 999
  formData.isQuantityEditable = newNode.isQuantityEditable || '0'
  formData.enableDynamicAttributes = newNode.enableDynamicAttributes || '0'
  formData.generateTempPartNumber = newNode.generateTempPartNumber || '0'
  formData.iconUrl = newNode.iconUrl || ''
  formData.nodeColor = newNode.nodeColor || ''
  formData.price = newNode.price || 0
  formData.parentNodeId = newNode.parentNodeId || ''
  formData.sortOrder = newNode.sortOrder || 0
  formData.nodeDescription = newNode.nodeDescription || ''
  
  // 重置动态属性和产品列表
  selectedDynamicAttributes.value = []
  loadNodeProducts()
}, { deep: true })

/**
 * 监听表单数据变化，确保单选/多选相关字段的一致性
 * 一致性规则：
 * 1. 当selectionType为单选时，自动将minSelection和maxSelection设置为1
 * 2. 确保minSelection不大于maxSelection
 * 3. 确保minSelection和maxSelection为非负整数
 * 4. maxSelection至少为1，避免无效配置
 */
watch(
  () => [formData.selectionType, formData.minSelection, formData.maxSelection],
  ([selectionType, minSelection, maxSelection]) => {
    // 处理单选情况：自动将minSelection和maxSelection设置为1
    if (selectionType === 'single') {
      console.log('选择类型为单选，自动设置minSelection和maxSelection为1')
      formData.minSelection = 1
      formData.maxSelection = 1
    } else {
      // 处理多选情况：确保minSelection和maxSelection的合理性
      
      // 1. 将minSelection转换为非负整数
      let normalizedMin = Number(minSelection)
      normalizedMin = isNaN(normalizedMin) ? 0 : Math.floor(normalizedMin)
      normalizedMin = Math.max(0, normalizedMin)
      
      // 2. 将maxSelection转换为非负整数，且至少为1
      let normalizedMax = Number(maxSelection)
      normalizedMax = isNaN(normalizedMax) ? 999 : Math.floor(normalizedMax)
      normalizedMax = Math.max(1, normalizedMax)
      
      // 3. 确保minSelection不大于maxSelection
      if (normalizedMin > normalizedMax) {
        normalizedMin = normalizedMax
      }
      
      // 4. 更新表单数据
      formData.minSelection = normalizedMin
      formData.maxSelection = normalizedMax
      
      console.log(`多选配置已归一化: minSelection=${normalizedMin}, maxSelection=${normalizedMax}`)
    }
  },
  { deep: true }
)

// 组件挂载时
onMounted(() => {
  isMounted = true
  loadNodeProducts()
})

// 组件卸载时
onUnmounted(() => {
  isMounted = false
})

// 事件
const emit = defineEmits(['node-updated'])
</script>

<style scoped>
.bom-node-info-detail {
  padding: 20px;
  background-color: #f9f9f9;
}

/* 基本属性区域 */
.basic-attributes-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 动态属性选择区域 */
.dynamic-attributes-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 节点产品列表区域 */
.node-products-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 区域标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

/* 区域头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

/* 筛选信息 */
.filter-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 动态属性列表 */
.dynamic-attributes-list {
  margin-top: 16px;
}

/* 产品列表 */
.products-list {
  margin-top: 16px;
}
</style>
