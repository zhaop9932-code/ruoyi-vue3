<template>
  <div class="action-content" v-show="isExpanded">
    <el-form :model="localElement" label-position="top" label-width="100px" @submit.prevent>
      <el-row :gutter="20">
        <!-- 动作类型选择 -->
        <el-col :span="12">
          <ActionTypeSelector 
            v-model="localElement.actionType" 
            @change="handleActionTypeChange" 
          />
        </el-col>
        
        <!-- 目标类型选择 - 根据动作类型显示 -->
        <el-col :span="12" v-if="showTargetType">
          <TargetTypeSelector 
            v-model="localElement.targetType"
            :action-type="localElement.actionType"
            @change="handleTargetTypeChange"
          />
        </el-col>
      </el-row>
      
      <!-- 目标对象选择 - 根据动作类型、目标类型和前置选择显示 -->
      <template v-if="showTargetObject">
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="24">
            <TargetObjectSelector 
              v-model="localElement.targetId"
              v-model:structure-id="localElement.structureId"
              v-model:attribute-id="localElement.attributeId"
              :action-type="localElement.actionType"
              :target-type="localElement.targetType"
              :bom-id="bomId"
              :structure="localElement.structure"
              @change="handleTargetChange"
            />
          </el-col>
        </el-row>
      </template>
      
      <!-- 动作参数配置 - 根据动作类型和目标类型显示 -->
      <template v-if="!hideActionParams">
        <ActionParamsConfig
          v-model="localElement.actionParams"
          :action-type="localElement.actionType"
          :target-type="localElement.targetType"
          :attribute-id="localElement.attributeId"
          :bom-id="bomId"
          @change="handleParamsChange"
        />
      </template>
      
      <!-- 基本信息配置 -->
      <el-divider content-position="left">基本信息</el-divider>
      <BasicInfoSection 
        v-model:priority="localElement.actionPriority"
        v-model:status="localElement.actionStatus"
        v-model:sequence="localElement.actionSequence"
        v-model:version="localElement.version"
        v-model:description="localElement.description"
      />
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import ActionTypeSelector from './ActionTypeSelector.vue'
import TargetTypeSelector from './TargetTypeSelector.vue'
import TargetObjectSelector from './TargetObjectSelector.vue'
import ActionParamsConfig from './ActionParamsConfig.vue'
import BasicInfoSection from './BasicInfoSection.vue'
import { 
  shouldShowTargetType, 
  shouldShowTargetObject, 
  shouldHideActionParams,
  getDefaultActionParams,
  validateActionConfig,
  TARGET_TYPES
} from './actionConfig'

// 添加同步标志位，避免循环更新
const isSyncingNodeValue = ref(false)

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    required: true
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:element', 'validate'])

// 创建本地副本,避免直接修改props
const localElement = ref({ 
  actionType: '',
  targetType: '',
  targetId: '',
  structureId: '',
  attributeId: '',
  actionParams: '{}',
  actionPriority: 1,
  actionStatus: '0',
  actionSequence: 1,
  version: '1.0',
  description: '',
  // 关联对象
  structure: null,
  attribute: null,
  dynamicAttribute: null,
  ...props.element 
})


// 计算属性:判断是否显示目标类型
const showTargetType = computed(() => {
  return shouldShowTargetType(localElement.value.actionType)
})

// 计算属性:判断是否显示目标对象
const showTargetObject = computed(() => {
  return shouldShowTargetObject(localElement.value.actionType, localElement.value.targetType)
})

// 计算属性:判断是否隐藏动作参数
const hideActionParams = computed(() => {
  return shouldHideActionParams(localElement.value.actionType, localElement.value.targetType)
})

// 当目标类型为节点时，确保structureId和targetId同步（使用标志位避免循环）
watch(() => [localElement.value.targetType, localElement.value.targetId], 
  ([newTargetType, newTargetId]) => {
    if (newTargetType === TARGET_TYPES.NODE && !isSyncingNodeValue.value) {
      isSyncingNodeValue.value = true
      localElement.value.structureId = newTargetId
      nextTick(() => {
        isSyncingNodeValue.value = false
      })
    }
  }, 
  { immediate: true }
)

// 当structureId变化时，如果目标类型为节点，同步更新targetId
watch(() => localElement.value.structureId, (newStructureId) => {
  if (localElement.value.targetType === TARGET_TYPES.NODE && !isSyncingNodeValue.value) {
    isSyncingNodeValue.value = true
    localElement.value.targetId = newStructureId
    nextTick(() => {
      isSyncingNodeValue.value = false
    })
  }
})

// 监听外部element变化,更新本地副本
watch(() => props.element, (newVal) => {

  // 只有当引用不同或内容不同时才更新
  if (JSON.stringify(newVal) !== JSON.stringify(localElement.value)) {
    localElement.value = { ...newVal }
  }
}, { deep: true })

// 监听本地element变化,通知父组件
watch(localElement, (newVal) => {
   
  // 只有当引用不同或内容不同时才通知父组件
  if (JSON.stringify(newVal) !== JSON.stringify(props.element)) {
    emit('update:element', { ...newVal })
    
    // 验证配置
    const validation = validateActionConfig(newVal)
    emit('validate', validation)
  }
}, { deep: true })

// 动作类型变化处理
const handleActionTypeChange = (actionType) => {
  // 重置相关字段
  localElement.value.targetType = ''
  localElement.value.targetId = ''
  localElement.value.structureId = ''
  localElement.value.attributeId = ''
  
  // 设置默认参数
  const defaultParams = getDefaultActionParams(actionType, '')
  localElement.value.actionParams = JSON.stringify(defaultParams)
}

// 目标类型变化处理
const handleTargetTypeChange = (targetType) => {
  // 重置相关字段
  localElement.value.targetId = ''
  localElement.value.structureId = ''
  localElement.value.attributeId = ''
  // 更新默认参数
  const defaultParams = getDefaultActionParams(localElement.value.actionType, targetType)
  localElement.value.actionParams = JSON.stringify(defaultParams)
}

// 目标对象变化处理
const handleTargetChange = (value) => {
  localElement.value.targetId = value
}

const handleParamsChange = (value) => {
  localElement.value.actionParams = value
}
</script>

<style scoped>
.action-content {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

:deep(.el-divider__text) {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #303133;
}
</style>