<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-form-item label="目标对象">
        <TargetObjectSelector 
          :action-type="actionType"
          :target-type="targetType"
          :action-params="actionParams"
          @update:action-params="$emit('update:actionParams', $event)"
          @update:target="$emit('update:target', $event)"
        />
      </el-form-item>
    </el-col>
    <!-- 动作参数 -->
    <el-col :span="12">
      <el-form-item label="动作参数">
        <!-- 结构化参数输入，根据动作类型和目标类型显示不同的表单  -->
        <ActionParams :action-type="actionType" :target-type="targetType" :action-params="actionParams" @update:action-params="$emit('update:actionParams', $event)" />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
defineProps({
  actionType: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  actionParams: {
    type: String,
    default: ''
  }
})

defineEmits(['update:actionParams', 'update:target'])
</script>