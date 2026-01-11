<template>
  <div class="attribute-config">
    <el-card v-if="!currentNode" class="empty-state" shadow="never">
      <el-empty description="请在左侧选择要配置的节点">
        <el-icon :size="80" color="#c0c4cc">
          <Box />
        </el-icon>
      </el-empty>
    </el-card>
    
    <div v-else class="config-content">
      <!-- 节点信息 -->
      <div class="node-info">
        <div class="info-header">
          <el-icon :size="24">
            <component :is="getNodeIcon(currentNode)" />
          </el-icon>
          <div class="info-text">
            <h3>{{ currentNode.nodeName }}</h3>
            <p class="node-code">节点编码: {{ currentNode.nodeCode }}</p>
          </div>
        </div>
        <p v-if="currentNode.nodeDesc" class="node-desc">{{ currentNode.nodeDesc }}</p>
      </div>
      
      <!-- 属性配置表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="attribute-form"
      >
        <!-- 数量配置 -->
        <div class="form-section">
          <div class="section-header">
            <h4>基本配置</h4>
          </div>
          
          <el-form-item label="数量" prop="quantity" required>
            <el-input-number
              v-model="formData.quantity"
              :min="currentNode.minQuantity || 1"
              :max="currentNode.maxQuantity || 9999"
              :step="1"
              @change="handleQuantityChange"
            />
            <span class="quantity-hint">
              可选范围: {{ currentNode.minQuantity || 1 }} - {{ currentNode.maxQuantity || '无限制' }}
            </span>
          </el-form-item>
          
          <!-- 产品选择（如果节点关联了产品） -->
          <el-form-item
            v-if="relatedProducts.length > 0"
            label="选择产品"
            prop="selectedProductId"
            :required="currentNode.isRequired"
          >
            <el-select
              v-model="formData.selectedProductId"
              placeholder="请选择产品"
              filterable
              clearable
              @change="handleProductChange"
            >
              <el-option
                v-for="product in relatedProducts"
                :key="product.productId"
                :label="product.productName"
                :value="product.productId"
              >
                <div class="product-option">
                  <span>{{ product.productName }}</span>
                  <span class="product-price">¥{{ product.price || 0 }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 按属性组分组显示 -->
        <div
          v-for="group in attributeGroups"
          :key="group.groupId"
          class="form-section"
        >
          <div class="section-header">
            <h4>{{ group.groupName }}</h4>
            <span v-if="group.groupDesc" class="section-desc">{{ group.groupDesc }}</span>
          </div>
          
          <div class="section-content">
            <el-form-item
              v-for="attr in group.attributes"
              :key="attr.attributeId"
              :label="attr.attributeName"
              :prop="`attrs.${attr.attributeCode}`"
              :required="attr.isRequired === '0'"
            >
              <!-- 动态渲染不同类型的输入组件 -->
              <component
                :is="getAttributeComponent(attr.attributeType)"
                v-model="formData.attrs[attr.attributeCode]"
                v-bind="getComponentProps(attr)"
                @change="handleAttributeChange(attr)"
              >
                <!-- 选择类型需要渲染选项 -->
                <template v-if="['select', 'multi', 'radio', 'checkbox'].includes(attr.attributeType)">
                  <component
                    :is="getOptionComponent(attr.attributeType)"
                    v-for="option in attr.attributeValues"
                    :key="option.valueId"
                    :label="option.valueName"
                    :value="option.valueCode"
                  >
                    {{ option.valueName }}
                  </component>
                </template>
              </component>
              
              <!-- 属性提示信息 -->
              <div v-if="attr.attributeDesc" class="attr-help">
                <el-icon><QuestionFilled /></el-icon>
                {{ attr.attributeDesc }}
              </div>
              
              <!-- 校验错误提示 -->
              <div
                v-if="validationErrors[attr.attributeCode]"
                class="attr-error"
              >
                <el-icon><WarningFilled /></el-icon>
                {{ validationErrors[attr.attributeCode] }}
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
      
      <!-- 操作按钮 -->
      <div class="config-actions">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="saving" @click="handleConfirm">
          确认配置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { QuestionFilled, WarningFilled, Box, Setting, Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useConfiguratorStore } from '@/store/modules/configurator'
import { 
  listSuperBomStructureAttributeByBomStructureId
} from '@/api/cpq/bom'
import { 
  getSuperBomProductRelationByBomIdAndStructureId
} from '@/api/cpq/superBomProductRelation'

const props = defineProps({
  currentNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['config-confirm'])

const configuratorStore = useConfiguratorStore()
const formRef = ref()
const formData = ref({
  quantity: 1,
  selectedProductId: null,
  attrs: {}
})
const formRules = ref({})
const validationErrors = ref({})
const attributeGroups = ref([])
const relatedProducts = ref([])
const saving = ref(false)

// 获取节点图标
const getNodeIcon = (node) => {
  const iconMap = {
    '0': Box,
    '1': Setting,
    '2': Service
  }
  return iconMap[node.nodeType] || Box
}

// 动态获取属性组件
const getAttributeComponent = (type) => {
  const componentMap = {
    text: 'el-input',
    number: 'el-input-number',
    select: 'el-select',
    multi: 'el-select',
    radio: 'el-radio-group',
    checkbox: 'el-checkbox-group',
    date: 'el-date-picker',
    datetime: 'el-date-picker',
    textarea: 'el-input',
    slider: 'el-slider',
    switch: 'el-switch',
    color: 'el-color-picker'
  }
  return componentMap[type] || 'el-input'
}

// 获取选项组件
const getOptionComponent = (type) => {
  const componentMap = {
    select: 'el-option',
    multi: 'el-option',
    radio: 'el-radio',
    checkbox: 'el-checkbox'
  }
  return componentMap[type] || 'el-option'
}

// 获取组件属性
const getComponentProps = (attr) => {
  const baseProps = {
    placeholder: attr.attributePlaceholder || `请输入${attr.attributeName}`,
    disabled: attr.isReadonly === '0',
    clearable: true
  }
  
  switch (attr.attributeType) {
    case 'number':
      return {
        ...baseProps,
        min: attr.minValue ? Number(attr.minValue) : undefined,
        max: attr.maxValue ? Number(attr.maxValue) : undefined,
        step: attr.step ? Number(attr.step) : 1,
        controls: true
      }
    case 'select':
      return {
        ...baseProps,
        filterable: true
      }
    case 'multi':
      return {
        ...baseProps,
        multiple: true,
        filterable: true,
        'collapse-tags': true
      }
    case 'textarea':
      return {
        ...baseProps,
        type: 'textarea',
        rows: 4,
        maxlength: attr.maxLength ? Number(attr.maxLength) : undefined,
        'show-word-limit': true
      }
    case 'date':
      return {
        ...baseProps,
        type: 'date',
        format: 'YYYY-MM-DD',
        'value-format': 'YYYY-MM-DD'
      }
    case 'datetime':
      return {
        ...baseProps,
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        'value-format': 'YYYY-MM-DD HH:mm:ss'
      }
    case 'slider':
      return {
        min: attr.minValue ? Number(attr.minValue) : 0,
        max: attr.maxValue ? Number(attr.maxValue) : 100,
        step: attr.step ? Number(attr.step) : 1,
        'show-input': true
      }
    default:
      return baseProps
  }
}

// 加载节点属性
const loadNodeAttributes = async () => {
  if (!props.currentNode) return
  
  try {
    const response = await listSuperBomStructureAttributeByBomStructureId(
      props.currentNode.bomStructureId
    )
    
    const attributes = response.data || []
    
    // 按属性组分组
    const groupMap = new Map()
    
    attributes.forEach(attr => {
      const groupId = attr.attributeGroupId || 0
      const groupName = attr.attributeGroupName || '基本属性'
      
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId,
          groupName,
          groupDesc: attr.attributeGroupDesc || '',
          attributes: []
        })
      }
      
      groupMap.get(groupId).attributes.push(attr)
      
      // 初始化表单数据
      formData.value.attrs[attr.attributeCode] = attr.defaultValue || null
      
      // 设置验证规则
      if (attr.isRequired === '0') {
        formRules.value[`attrs.${attr.attributeCode}`] = [
          { required: true, message: `${attr.attributeName}不能为空`, trigger: 'blur' }
        ]
      }
    })
    
    attributeGroups.value = Array.from(groupMap.values())
  } catch (error) {
    console.error('加载属性配置失败:', error)
    ElMessage.error('加载属性配置失败')
  }
}

// 加载关联产品
const loadRelatedProducts = async () => {
  if (!props.currentNode) return
  
  try {
    const response = await getSuperBomProductRelationByBomIdAndStructureId({
      bomId: configuratorStore.currentBom.bomId,
      structureId: props.currentNode.bomStructureId
    })
    relatedProducts.value = response.data || []
  } catch (error) {
    console.error('加载关联产品失败:', error)
  }
}

// 属性值变化处理
const handleAttributeChange = async (attr) => {
  // 清除该属性的校验错误
  delete validationErrors.value[attr.attributeCode]
  
  // 触发规则引擎校验
  await configuratorStore.validateAttribute(
    props.currentNode.bomStructureId,
    attr.attributeCode,
    formData.value.attrs[attr.attributeCode]
  )
}

// 数量变化处理
const handleQuantityChange = async (value) => {
  await configuratorStore.updateNodeQuantity(
    props.currentNode.bomStructureId,
    value
  )
}

// 产品选择变化处理
const handleProductChange = async (productId) => {
  await configuratorStore.selectNodeProduct(
    props.currentNode.bomStructureId,
    productId
  )
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  validationErrors.value = {}
  
  // 重置为默认值
  formData.value.quantity = props.currentNode.defaultQuantity || 1
  formData.value.selectedProductId = null
}

// 确认配置
const handleConfirm = async () => {
  saving.value = true
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 规则验证
    const valid = await configuratorStore.validateNodeConfiguration(
      props.currentNode.bomStructureId,
      {
        quantity: formData.value.quantity,
        selectedProductId: formData.value.selectedProductId,
        ...formData.value.attrs
      }
    )
    
    if (!valid) {
      validationErrors.value = configuratorStore.validationErrors
      ElMessage.warning('配置不符合规则要求，请检查')
      return
    }
    
    // 保存配置
    await configuratorStore.saveNodeConfiguration(
      props.currentNode.bomStructureId,
      {
        quantity: formData.value.quantity,
        selectedProductId: formData.value.selectedProductId,
        ...formData.value.attrs
      }
    )
    
    ElMessage.success('配置保存成功')
    emit('config-confirm')
  } catch (error) {
    console.error('配置保存失败:', error)
    ElMessage.error('配置验证失败')
  } finally {
    saving.value = false
  }
}

// 监听节点变化
watch(
  () => props.currentNode,
  async (newNode) => {
    if (newNode) {
      // 重置表单
      formData.value = {
        quantity: newNode.defaultQuantity || 1,
        selectedProductId: newNode.selectedProductId || null,
        attrs: {}
      }
      formRules.value = {}
      validationErrors.value = {}
      attributeGroups.value = []
      relatedProducts.value = []
      
      // 加载节点数据
      await Promise.all([
        loadNodeAttributes(),
        loadRelatedProducts()
      ])
      
      // 如果节点已配置，加载配置数据
      if (newNode.configuration) {
        Object.assign(formData.value, newNode.configuration)
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.attribute-config {
  height: 100%;
  padding: 24px;
  overflow: auto;
  
  .empty-state {
    margin-top: 100px;
    text-align: center;
    
    .el-empty {
      padding: 60px 0;
    }
  }
  
  .config-content {
    .node-info {
      margin-bottom: 32px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: #fff;
      
      .info-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
        
        .el-icon {
          flex-shrink: 0;
        }
        
        .info-text {
          flex: 1;
          
          h3 {
            margin: 0 0 6px;
            font-size: 20px;
            font-weight: 600;
          }
          
          .node-code {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
          }
        }
      }
      
      .node-desc {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        opacity: 0.95;
      }
    }
    
    .attribute-form {
      .form-section {
        margin-bottom: 32px;
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e4e7ed;
          
          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
          
          .section-desc {
            font-size: 13px;
            color: #909399;
          }
        }
        
        .section-content {
          padding-left: 16px;
        }
      }
      
      .attr-help {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-top: 6px;
        padding: 8px 12px;
        background-color: #f0f9ff;
        border-left: 3px solid #409eff;
        border-radius: 4px;
        font-size: 12px;
        color: #606266;
        line-height: 1.5;
        
        .el-icon {
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 14px;
          color: #409eff;
        }
      }
      
      .attr-error {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        padding: 8px 12px;
        background-color: #fef0f0;
        border-left: 3px solid #f56c6c;
        border-radius: 4px;
        font-size: 12px;
        color: #f56c6c;
        
        .el-icon {
          font-size: 14px;
        }
      }
      
      .quantity-hint {
        margin-left: 12px;
        font-size: 13px;
        color: #909399;
      }
      
      .product-option {
        display: flex;
        justify-content: space-between;
        width: 100%;
        
        .product-price {
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }
    
    .config-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e4e7ed;
    }
  }
}
</style>
