<template>
  <el-form-item label="目标类型" required>
    <el-select 
      :model-value="modelValue" 
      @update:model-value="handleChange" 
      placeholder="请选择目标类型"
      style="width: 100%"
      clearable
    >
      <el-option 
        v-for="option in targetTypeOptions" 
        :key="option.value" 
        :label="option.label" 
        :value="option.value"
      >
        <div style="display: flex; flex-direction: column;">
          <span>{{ option.label }}</span>
          <span style="font-size: 12px; color: #909399; margin-top: 2px;">
            {{ option.description }}
          </span>
        </div>
      </el-option>
    </el-select>
    
    <!-- 已选目标类型的说明提示 -->
    <el-alert
      v-if="modelValue && selectedDescription"
      type="info"
      :closable="false"
      style="margin-top: 8px;"
    >
      <template #title>
        <span style="font-size: 12px;">
          <el-icon style="vertical-align: middle;"><InfoFilled /></el-icon>
          {{ selectedDescription }}
        </span>
      </template>
    </el-alert>
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { getTargetTypeOptions, TARGET_TYPE_DESCRIPTIONS } from './actionConfig'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  actionType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 根据动作类型获取目标类型选项（增加描述信息）
const targetTypeOptions = computed(() => {
  if (!props.actionType) {
    return []
  }
  try {
    const options = getTargetTypeOptions(props.actionType)
    return options.map(opt => ({
      ...opt,
      description: TARGET_TYPE_DESCRIPTIONS[opt.value] || ''
    }))
  } catch (error) {
    console.error('获取目标类型选项失败:', error)
    return []
  }
})

// 获取当前选中目标类型的说明
const selectedDescription = computed(() => {
  return TARGET_TYPE_DESCRIPTIONS[props.modelValue] || ''
})

const handleChange = (value) => {
  console.log('目标类型选择改变:', value)
  emit('update:modelValue', value)
  emit('change', value)

}
</script>

<style scoped>
</style>