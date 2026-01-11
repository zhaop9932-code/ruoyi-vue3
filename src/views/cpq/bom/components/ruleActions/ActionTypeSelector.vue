<template>
  <el-form-item label="动作类型" required>
    <el-select 
      :model-value="modelValue" 
      @update:model-value="handleChange" 
      placeholder="请选择动作类型"
      style="width: 100%"
      clearable
    >
      <el-option-group 
        v-for="group in ACTION_TYPE_GROUPS" 
        :key="group.category" 
        :label="group.label"
      >
        <el-option 
          v-for="option in group.options" 
          :key="option.value" 
          :label="option.label" 
          :value="option.value" 
        />
      </el-option-group>
    </el-select>
  </el-form-item>
</template>

<script setup>
import { ACTION_TYPE_GROUPS } from './actionConfig'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
</style>