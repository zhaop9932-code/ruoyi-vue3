<template>
  <div class="item-header" @click="handleToggleExpand">
    <el-icon class="drag-handle"><Rank /></el-icon>
    <span class="action-index">{{ index + 1 }}</span>
    <div class="action-type-tag">
      <el-tag :type="getActionTypeTag(element.actionType)">
        {{ getActionTypeName(element.actionType) }}
      </el-tag>
    </div>
    <div class="item-actions">
      <el-button 
        type="primary" 
        size="small" 
        @click.stop="handleToggleExpand"
      >
        <el-icon><Edit /></el-icon> 编辑
      </el-button>
      <el-button 
        type="danger" 
        size="small" 
        @click.stop="handleDeleteAction"
      >
        <el-icon><Delete /></el-icon> 删除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Delete, Edit, Rank } from '@element-plus/icons-vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['toggle-expand', 'delete-action'])

const getActionTypeName = (type) => {
  const typeMap = {
    // 基础动作
    enable: '启用',
    disable: '禁用',
    required: '必选',
    recommend: '推荐',
    show: '显示',
    hide: '隐藏',
    exclude: '排除',
    reset: '重置',
    focus: '聚焦',
    linkSelect: '联动选中',
    
    // 价格动作
    applyDiscount: '应用折扣',
    applyFullReduction: '应用满减',
    setPrice: '设置价格',
    adjustPrice: '价格调整',
    
    // 消息通知
    showMessage: '显示消息',
    sendNotification: '发送通知',
    triggerWarning: '触发警告',
    
    // 数据处理
    setVariable: '设置变量',
    callApi: '调用API',
    triggerRule: '触发规则',
    
    // 兼容旧类型
    calculate: '计算',
    validate: '验证',
    notify: '通知',
    data: '数据操作',
    redirect: '跳转'
  }
  return typeMap[type] || type
}

const getActionTypeTag = (type) => {
  const tagMap = {
    // 基础动作
    enable: 'success',
    disable: 'danger',
    required: 'warning',
    recommend: 'info',
    show: 'primary',
    hide: 'default',
    exclude: 'danger',
    reset: 'warning',
    focus: 'info',
    linkSelect: 'primary',
    
    // 价格动作
    applyDiscount: 'success',
    applyFullReduction: 'warning',
    setPrice: 'primary',
    adjustPrice: 'info',
    
    // 消息通知
    showMessage: 'info',
    sendNotification: 'success',
    triggerWarning: 'warning',
    
    // 数据处理
    setVariable: 'primary',
    callApi: 'info',
    triggerRule: 'success',
    
    // 兼容旧类型
    calculate: 'primary',
    validate: 'success',
    notify: 'warning',
    data: 'info',
    redirect: 'danger'
  }
  return tagMap[type] || 'default'
}

const handleToggleExpand = () => {
  emit('toggle-expand')
}

const handleDeleteAction = () => {
  emit('delete-action')
}
</script>

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.drag-handle {
  cursor: move;
  color: #909399;
}

.action-index {
  font-weight: bold;
  color: #409eff;
  min-width: 20px;
}

.action-type-tag {
  margin-right: auto;
}

.action-name {
  font-weight: 500;
}

.action-description {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}
</style>