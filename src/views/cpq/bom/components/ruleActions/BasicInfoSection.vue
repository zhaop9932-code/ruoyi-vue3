<template>
  <!-- 基本信息 -->
  <el-row :gutter="20">
    <el-col :span="6">
      <el-form-item label="动作优先级">
        <el-space>
          <el-input-number 
            :model-value="priority" 
            @update:model-value="$emit('update:priority', $event)"
            :min="1" 
            :max="100" 
            :step="1"
            placeholder="请输入优先级"
            style="width: 140px;"
          />
          <el-tooltip placement="top" effect="light">
            <template #content>
              <div style="max-width: 280px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;"><strong>优先级说明：</strong></p>
                <p style="margin: 0 0 5px 0;">• 数字越<strong>小</strong>，优先级越<strong>高</strong>，越先执行</p>
                <p style="margin: 0 0 5px 0;">• 示例：优先级1会在优先级2之前执行</p>
                <p style="margin: 0;">• 相同优先级的动作按序号顺序执行</p>
              </div>
            </template>
            <el-icon style="cursor: help; color: #909399;">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-space>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="动作状态">
        <el-switch 
          :model-value="status" 
          @update:model-value="$emit('update:status', $event)" 
          active-value="0" 
          inactive-value="1"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="动作序列">
        <el-space>
          <el-input-number 
            :model-value="sequence" 
            @update:model-value="$emit('update:sequence', $event)"
            :min="1" 
            :max="100" 
            :step="1"
            placeholder="请输入动作序列"
            style="width: 140px;"
          />
          <el-tooltip placement="top" effect="light">
            <template #content>
              <div style="max-width: 280px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;"><strong>序列说明：</strong></p>
                <p style="margin: 0 0 5px 0;">• 在相同优先级下，序号越<strong>小</strong>越先执行</p>
                <p style="margin: 0 0 5px 0;">• 优先级相同，序列1会在序列2之前执行</p>
                <p style="margin: 0;">• 用于精细控制同优先级动作的执行顺序</p>
              </div>
            </template>
            <el-icon style="cursor: help; color: #909399;">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-space>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="版本">
        <el-input 
          v-model="localVersion" 
          placeholder="请输入版本号"
        />
      </el-form-item>
    </el-col>
  </el-row>
  
  <!-- 描述 -->
  <el-row :gutter="20">
    <el-col :span="24">
      <el-form-item label="描述">
        <el-input 
          :model-value="description" 
          @update:model-value="$emit('update:description', $event)"
          type="textarea" 
          :rows="2" 
          placeholder="请输入动作描述"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  priority: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    default: '0'
  },
  sequence: {
    type: Number,
    default: 1
  },
  version: {
    type: String,
    default: '1.0'
  },
  description: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:priority', 'update:status', 'update:sequence', 'update:version', 'update:description'])

// 本地版本变量，用于双向绑定
const localVersion = ref(props.version || '1.0')

// 监听本地版本变化，通知父组件
watch(localVersion, (newVal) => {
  emit('update:version', newVal)
})

// 监听父组件传入的版本变化，更新本地版本
watch(() => props.version, (newVal) => {
  localVersion.value = newVal || '1.0'
})
</script>