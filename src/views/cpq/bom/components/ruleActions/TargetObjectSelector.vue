<template>
  <div class="target-object-selector">
    <!-- 场景1: 直接选择节点 -->
    <template v-if="targetType === TARGET_TYPES.NODE">
      <NodeSelector
        v-model="localTargetId"
        :bom-id="bomId"
        :target-type="targetType"
        label="目标对象"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeChange"
      />
    </template>
    
    <!-- 场景2: 节点 + 静态属性 -->
    <template v-else-if="targetType === TARGET_TYPES.NODE_STATIC_ATTR">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="localTargetId"
        attribute-type="static"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="目标对象"
        placeholder="请选择节点下静态属性"
        :multiple="isMultiple"
        :required="true"
        @change="handleAttrChange"
      />
    </template>
    
    <!-- 场景3: 节点 + 静态属性 + 属性值 -->
    <template v-else-if="targetType === TARGET_TYPES.NODE_STATIC_ATTR_VALUE">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="selectedAttr"
        attribute-type="static"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="属性"
        placeholder="请选择节点下静态属性"
        :multiple="false"
        :required="true"
        @change="handleAttrSelectionChange"
      />
      
      <!-- 根据属性类型动态渲染目标对象输入方式 -->
      <el-form-item v-if="selectedAttr" label="目标对象" :required="true">
        <!-- 选择器类型属性 -->
        <AttributeSelector
          v-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'selector'"
          v-model="localTargetId"
          attribute-type="attributeValue"
          :attribute-id="selectedAttr"
          :structure-id="selectedNode"
          :attr-info="selectedAttrInfo"
          :dynamic-values="selectedAttrInfo?.attributeValues || []"
          label=""
          placeholder="请选择静态属性下属性值"
          :multiple="isMultiple"
          :required="true"
          @change="handleAttrValueChange"
        />
        
        <!-- 文本输入类型属性 -->
        <el-input
          v-else-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'text'"
          v-model="localTargetId"
          placeholder="请输入静态属性值"
          :disabled="false"
          style="width: 100%"
          @change="handleAttrValueChange"
        />
        
        <!-- 其他类型或未加载完成时显示加载中 -->
        <el-input
          v-else
          placeholder="加载中..."
          disabled
          style="width: 100%"
        />
      </el-form-item>
    </template>
    
    <!-- 场景4: 节点 + 动态属性 -->
    <template v-else-if="targetType === TARGET_TYPES.NODE_DYNAMIC_ATTR">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="localTargetId"
        attribute-type="dynamic"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="目标对象"
        placeholder="请选择节点下动态属性"
        :multiple="isMultiple"
        :required="true"
        @change="handleAttrChange"
      />
    </template>
    
    <!-- 场景5: 节点 + 动态属性 + 属性值 -->
    <template v-else-if="targetType === TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="selectedAttr"
        attribute-type="dynamic"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="属性"
        placeholder="请选择节点下动态属性"
        :multiple="false"
        :required="true"
        @change="handleAttrSelectionChange"
      />
      
      <!-- 根据属性类型动态渲染目标对象输入方式 -->
      <el-form-item v-if="selectedAttr" label="目标对象" :required="true">
        <!-- 选择器类型属性 -->
        <AttributeSelector
          v-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'selector'"
          v-model="localTargetId"
          attribute-type="attributeValue"
          :attribute-id="selectedAttr"
          :structure-id="selectedNode"
          :attr-info="selectedAttrInfo"
          :dynamic-values="selectedAttrInfo?.attributeValues || []"
          label=""
          placeholder="请选择动态属性下属性值"
          :multiple="isMultiple"
          :required="true"
          @change="handleAttrValueChange"
        />
        
        <!-- 文本输入类型属性 -->
        <el-input
          v-else-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'text'"
          v-model="localTargetId"
          placeholder="请输入动态属性值"
          :disabled="false"
          style="width: 100%"
          @change="handleAttrValueChange"
        />
        
        <!-- 其他类型或未加载完成时显示加载中 -->
        <el-input
          v-else
          placeholder="加载中..."
          disabled
          style="width: 100%"
        />
      </el-form-item>
    </template>
    
    <!-- 场景6: 节点 + 产品 -->
    <template v-else-if="targetType === TARGET_TYPES.NODE_PRODUCT">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-model="localTargetId"
        attribute-type="product"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="目标对象"
        placeholder="请选择节点下产品"
        :multiple="isMultiple"
        :required="true"
        @change="handleProductChange"
      />
    </template>
    
    <!-- 场景7: 动态属性 -->
    <template v-else-if="targetType === TARGET_TYPES.DYNAMIC_ATTR">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="localTargetId"
        attribute-type="dynamic"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="目标对象"
        placeholder="请选择节点下动态属性"
        :multiple="isMultiple"
        :required="true"
        @change="handleAttrChange"
      />
    </template>
    
    <!-- 场景8: 动态属性值 -->
    <template v-else-if="targetType === TARGET_TYPES.DYNAMIC_ATTR_VALUE">
      <NodeSelector
        v-model="selectedNode"
        :bom-id="bomId"
        :target-type="targetType"
        label="节点"
        placeholder="请选择当前BOM下树状节点"
        :multiple="false"
        :required="true"
        @change="handleNodeSelectionChange"
      />
      
      <AttributeSelector
        v-if="selectedNode"
        v-model="selectedAttr"
        attribute-type="dynamic"
        :bom-id="bomId"
        :node-id="selectedNode"
        label="属性"
        placeholder="请选择节点下动态属性"
        :multiple="false"
        :required="true"
        @change="handleAttrSelectionChange"
      />
      
      <!-- 根据属性类型动态渲染目标对象输入方式 -->
      <el-form-item v-if="selectedAttr" label="目标对象" :required="true">
        <!-- 选择器类型属性 -->
        <AttributeSelector
          v-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'selector'"
          v-model="localTargetId"
          attribute-type="attributeValue"
          :attribute-id="selectedAttr"
          :structure-id="selectedNode"
          :attr-info="selectedAttrInfo"
          :dynamic-values="selectedAttrInfo?.attributeValues || []"
          label=""
          placeholder="请选择动态属性下属性值"
          :multiple="isMultiple"
          :required="true"
          @change="handleAttrValueChange"
        />
        
        <!-- 文本输入类型属性 -->
        <el-input
          v-else-if="selectedAttrInfo && selectedAttrInfo.attributeType === 'text'"
          v-model="localTargetId"
          placeholder="请输入动态属性值"
          :disabled="false"
          style="width: 100%"
          @change="handleAttrValueChange"
        />
        
        <!-- 其他类型或未加载完成时显示加载中 -->
        <el-input
          v-else
          placeholder="加载中..."
          disabled
          style="width: 100%"
        />
      </el-form-item>
    </template>
    
    <!-- 场景9: 规则 -->
    <template v-else-if="targetType === TARGET_TYPES.RULE">
      <el-form-item label="目标对象" required>
        <el-select
          v-model="localTargetId"
          multiple
          placeholder="请选择当前BOM规则列表"
          clearable
          filterable
          style="width: 100%"
          @change="handleRuleChange"
        >
          <el-option
            v-for="item in ruleList"
            :key="item.ruleId"
            :label="item.ruleName"
            :value="item.ruleId"
          />
        </el-select>
      </el-form-item>
    </template>
    
    <!-- 场景10: 变量信息 -->
    <template v-else-if="targetType === TARGET_TYPES.VARIABLE">
      <el-form-item label="目标对象" required>
        <el-select
          v-model="localTargetId"
          :multiple="isMultiple"
          placeholder="请选择已定义的变量"
          clearable
          filterable
          style="width: 100%"
          @change="handleVariableChange"
        >
          <el-option
            v-for="item in variableList"
            :key="item.variableId"
            :label="item.variableName"
            :value="item.variableId"
          />
        </el-select>
      </el-form-item>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import NodeSelector from './NodeSelector.vue'
import AttributeSelector from './AttributeSelector.vue'
import { TARGET_TYPES, isMultipleSelection } from './actionConfig'
import { getSuperBomRuleRelationByBomId } from '@/api/cpq/superBomRuleRelation'
import { getSuperBomVariableByBomId } from '@/api/cpq/superBomVariable'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  actionType: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  bomId: {
    type: [String, Number],
    required: true
  },
  structureId: {
    type: [String, Number],
    default: ''
  },
  attributeId: {
    type: [String, Number],
    default: ''
  },
  // 关联对象信息，用于回显
  structure: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'update:structureId', 'update:attributeId'])

// 层级选择的中间状态
const selectedNode = ref(props.structureId || '')
const selectedAttr = ref(props.attributeId || '')
const selectedAttrInfo = ref(null)

// 规则和变量列表
const ruleList = ref([])
const variableList = ref([])

// 加载状态标记，防止重复调用API
const loadingRules = ref(false)
const loadingVariables = ref(false)
// 初始化状态，防止initTargetObject重复调用
const initializing = ref(false)

// 本地目标ID (从计算属性改为ref，避免循环更新)
const localTargetId = ref(props.modelValue)

// 辅助函数：将规则ID值标准化为数字数组
const normalizeRuleId = (value) => {
  if (!value) return []
  let targetIds = []
  
  if (typeof value === 'string') {
    if (value.includes(',')) {
      targetIds = value.split(',').map(val => val.trim())
    } else {
      targetIds = [value]
    }
  } else if (Array.isArray(value)) {
    targetIds = value
  } else {
    targetIds = [String(value)]
  }
  
  return targetIds.map(id => {
    if (!id) return null
    const numId = Number(id)
    return isNaN(numId) ? null : numId
  }).filter(id => id !== null)
}

// 监听localTargetId变化，同步到modelValue
watch(localTargetId, (newValue) => {
  // 使用标准化比较，避免类型差异导致的不必要更新
  const normalizedNew = normalizeRuleId(newValue)
  const normalizedProps = normalizeRuleId(props.modelValue)
  
  if (JSON.stringify(normalizedNew) !== JSON.stringify(normalizedProps)) {
    emit('update:modelValue', newValue)
  }
})

// 监听props.modelValue变化，同步到localTargetId
// 移除immediate: true，避免组件初始化时多次调用
watch(() => props.modelValue, (newValue) => {
  // 使用标准化比较，避免类型差异导致的循环更新
  const normalizedNew = normalizeRuleId(newValue)
  const normalizedLocal = normalizeRuleId(localTargetId.value)
  
  if (JSON.stringify(normalizedNew) !== JSON.stringify(normalizedLocal)) {
    localTargetId.value = newValue
  }
})

// 是否支持多选
const isMultiple = computed(() => {
  return isMultipleSelection(props.actionType, props.targetType)
})

// 处理节点选择变化 (直接选节点)
const handleNodeChange = (value) => {
  emit('change', value)
  emit('update:structureId', value)
}

// 处理节点选择变化 (层级选择)
const handleNodeSelectionChange = (value) => {
  selectedNode.value = value
  selectedAttr.value = '' // 重置属性选择
  localTargetId.value = '' // 重置目标ID
  emit('update:structureId', value)
}

// 处理属性选择变化 (层级选择 - 最终目标)
const handleAttrChange = (value) => {
  emit('change', value)
  emit('update:attributeId', value)
}

// 处理属性选择变化 (层级选择 - 中间层)
const handleAttrSelectionChange = (value, attrInfo) => {
  selectedAttr.value = value
  selectedAttrInfo.value = attrInfo
  localTargetId.value = '' // 重置目标ID
  emit('update:attributeId', value)
}

// 处理属性值选择变化
const handleAttrValueChange = (value) => {
  emit('change', value)
}

// 处理产品选择变化
const handleProductChange = (value) => {
  emit('change', value)
}

// 处理规则选择变化
const handleRuleChange = (value) => {
  emit('change', value)
}

// 处理变量选择变化
const handleVariableChange = (value) => {
  emit('change', value)
}

// 加载规则列表
const loadRules = async () => {
  if (!props.bomId) return
  
  // 增强的防止重复调用逻辑
  if (loadingRules.value) {
    console.log('规则列表正在加载中，跳过重复调用')
    return
  }
  
  loadingRules.value = true
  try {
    const response = await getSuperBomRuleRelationByBomId(props.bomId)
    if (response.code === 200 && response.data) {
      ruleList.value = response.data
      
      // 加载完成后初始化规则选择值
      if (props.targetType === TARGET_TYPES.RULE && props.modelValue) {
        const normalizedIds = normalizeRuleId(props.modelValue)
        // 只在本地更新，不触发watch导致的循环
        localTargetId.value = normalizedIds
      }
    } else {
      ElMessage.error('加载规则列表失败')
    }
  } catch (error) {
    console.error('加载规则列表失败:', error)
    ElMessage.error('加载规则列表失败')
  } finally {
    loadingRules.value = false
    console.log('规则列表加载完成，重置loading状态')
  }
}

// 辅助函数：将变量ID值标准化
const normalizeVariableId = (value) => {
  if (isMultiple.value) {
    return normalizeRuleId(value)
  } else {
    // 单选情况下，返回单个值
    if (!value) return ''
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : ''
    }
    const numId = Number(value)
    return isNaN(numId) ? value : numId
  }
}

// 加载变量列表
const loadVariables = async () => {
  if (!props.bomId) return
  
  // 增强的防止重复调用逻辑
  if (loadingVariables.value) {
    console.log('变量列表正在加载中，跳过重复调用')
    return
  }
  
  loadingVariables.value = true
  try {
    console.log('开始加载变量列表')
    const response = await getSuperBomVariableByBomId(props.bomId)
    if (response.code === 200 && response.data) {
      variableList.value = response.data
      
      // 加载完成后初始化变量选择值
      if (props.targetType === TARGET_TYPES.VARIABLE && props.modelValue) {
        const normalizedIds = normalizeVariableId(props.modelValue)
        // 只在值不同时更新，避免不必要的watcher触发
        if (JSON.stringify(localTargetId.value) !== JSON.stringify(normalizedIds)) {
          localTargetId.value = normalizedIds
        }
      }
    } else {
      ElMessage.error('加载变量列表失败')
    }
  } catch (error) {
    console.error('加载变量列表失败:', error)
    ElMessage.error('加载变量列表失败')
  } finally {
    loadingVariables.value = false
    console.log('变量列表加载完成，重置loading状态')
  }
}

// 初始化或更新目标对象信息
const initTargetObject = () => {
  // 防止重复调用
  if (initializing.value) {
    console.log('初始化过程中，跳过重复调用initTargetObject')
    return
  }
  
  initializing.value = true
  try {
    // 安全检查：确保props存在且包含必要属性
    if (!props) return;
    
    // 使用可选链和默认值，避免解构错误
    const targetType = props.targetType || '';
    const structureId = props.structureId || '';
    const attributeId = props.attributeId || '';
    const modelValue = props.modelValue || '';
    
    // 不重置已有的选择状态，只在必要时重置
    if (!targetType) {
      selectedNode.value = ''
      selectedAttr.value = ''
      selectedAttrInfo.value = null
      localTargetId.value = ''
      return
    }
    
    // 只有当值发生变化时，才更新本地状态，避免不必要的watcher触发
    if (selectedNode.value !== structureId) {
      selectedNode.value = structureId;
    }
    if (selectedAttr.value !== attributeId) {
      selectedAttr.value = attributeId;
    }
    
    // 更精确的条件判断，避免循环调用
    // 1. 当targetType不是VARIABLE时，正常更新localTargetId
    // 2. 当targetType是VARIABLE时，只在localTargetId为空且modelValue有值时更新，避免与loadVariables中的更新冲突
    if (targetType !== TARGET_TYPES.VARIABLE) {
      if (JSON.stringify(localTargetId.value) !== JSON.stringify(modelValue)) {
        localTargetId.value = modelValue;
      }
    } else if (!localTargetId.value && modelValue) {
      // 仅在初始加载时设置值，避免与loadVariables中的更新冲突
      localTargetId.value = modelValue;
    }
    
    // 根据目标类型和层级信息加载必要数据
    if ([TARGET_TYPES.NODE_STATIC_ATTR_VALUE, TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE].includes(targetType) && structureId && attributeId) {
      // 场景3、5、8需要加载属性信息
      console.log('需要加载属性详情:', { attributeId, structureId, targetType });
    } else if (targetType === TARGET_TYPES.RULE) {
      // 场景9: 规则选择，加载规则列表
      if (!loadingRules.value) {
        loadRules();
      }
    } else if (targetType === TARGET_TYPES.VARIABLE) {
      // 场景10: 变量选择，加载变量列表
      if (!loadingVariables.value) {
        loadVariables();
      }
    }
  } finally {
    initializing.value = false
  }
}

// 优化：仅保留一个监听props变化的watcher，避免重复调用
// 移除其他immediate: true的watcher，避免多次调用
// 使用防抖策略，避免短时间内多次触发
let watchTimeout = null
watch(() => [props.structureId, props.attributeId, props.modelValue, props.targetType, props.bomId], 
  ([newStructureId, newAttributeId, newTargetId, newTargetType, newBomId], 
   [oldStructureId, oldAttributeId, oldTargetId, oldTargetType, oldBomId] = []) => {
  
  // 清除之前的定时器
  if (watchTimeout) {
    clearTimeout(watchTimeout)
  }
  
  // 防抖，延迟100ms执行，避免短时间内多次触发
  watchTimeout = setTimeout(() => {
    // 只有当关键属性实际变化时才调用初始化函数
    if (newStructureId !== oldStructureId || 
        newAttributeId !== oldAttributeId || 
        JSON.stringify(newTargetId) !== JSON.stringify(oldTargetId) || 
        newTargetType !== oldTargetType || 
        newBomId !== oldBomId) {
      initTargetObject()
    }
  }, 100)
}, { immediate: true })
</script>

<style scoped>
.target-object-selector {
  width: 100%;
}
</style>
