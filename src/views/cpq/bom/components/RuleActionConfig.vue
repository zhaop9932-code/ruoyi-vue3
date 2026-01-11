<template>
  <div class="rule-action-config">
    <el-card class="action-chain" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>动作执行链</span>
          <div class="header-buttons">
            <el-button 
              type="success" 
              size="small" 
              @click="handleSaveActions"
              :disabled="!props.ruleId"
            >
              <el-icon><Check /></el-icon> 保存动作列表
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="handleAddAction"
            >
              <el-icon><Plus /></el-icon> 添加动作
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="actions.length === 0" class="empty-actions">
        <el-empty description="暂无动作" />
      </div>
      
      <draggable 
        v-model="actions" 
        item-key="actionId"
        handle=".drag-handle"
        ghost-class="ghost"
        @end="handleDragEnd"
      >
        <template #item="{ element, index }">
          <RuleActionItem 
          :element="element" 
          :index="index"
          :expanded-action-id="expandedActionId"
          :expanded-action-index="expandedActionIndex"
          :bom-id="bomId"
          @update:element="handleElementUpdate(index, $event)"
          @delete-action="handleDeleteAction(index)"
          @toggle-expand="handleToggleExpand(element)"
        />
        </template>
      </draggable>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

// 导入子组件
import RuleActionItem from './ruleActions/RuleActionItem.vue'

// 导入动作API
import {
  listRuleAction as listActions,
  listRuleActionsByRuleId,
  saveRuleActions
} from '@/api/cpq/ruleAction'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  ruleType: {
    type: String,
    default: 'validation'
  },
  ruleId: {
    type: [String, Number],
    default: null
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:actions'])

// 动作列表
const actions = ref([...props.modelValue])

// 展开的动作ID
const expandedActionId = ref(null)

// 展开的动作索引，用于新添加的动作
const expandedActionIndex = ref(null)

// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(actions.value)) {
    actions.value = [...newVal]
  }
}, { deep: true })

// 监听规则ID变化
watch(() => props.ruleId, (newRuleId) => {
  if (newRuleId) {
    loadActionsByRuleId(newRuleId)
  }
})

// 根据规则ID加载动作
const loadActionsByRuleId = async (ruleId) => {
  try {
    const response = await listRuleActionsByRuleId(ruleId)
    actions.value = response.data || []
    // 确保每个动作都有完整的关联对象信息
    actions.value.forEach(action => {
      // 初始化关联对象字段
      action.structure = action.structure || null
      action.attribute = action.attribute || null
      action.dynamicAttribute = action.dynamicAttribute || null
    })
    updateParent()
  } catch (error) {
    console.error('加载动作失败:', error)
    ElMessage.error('加载动作失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 组件挂载时加载动作
onMounted(() => {
  if (props.ruleId) {
    loadActionsByRuleId(props.ruleId)
  }
})

// 处理动作元素更新
const handleElementUpdate = (index, updatedElement) => {
  actions.value[index] = updatedElement
  updateParent()
}

// 处理删除动作
const handleDeleteAction = async (index) => {
  try {
    const action = actions.value[index]
    if (action.actionId) {
      // 这里应该调用删除API
      console.log('删除动作:', action.actionId)
    }
    actions.value.splice(index, 1)
    ElMessage.success('动作删除成功')
    updateParent()
  } catch (error) {
    console.error('删除动作失败:', error)
    ElMessage.error('删除动作失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 处理展开/收起动作
const handleToggleExpand = (element) => {
  if (element.actionId === expandedActionId.value) {
    expandedActionId.value = null
  } else {
    expandedActionId.value = element.actionId
    expandedActionIndex.value = null
  }
}

// 添加新动作
const handleAddAction = () => {
  const newAction = {
    actionId: null,
    ruleId: props.ruleId,
    actionType: '',
    actionName: '',
    actionCode: '',
    targetType: '',
    targetId: '',
    actionParams: '',
    actionPriority: 1,
    parentActionId: null,
    actionSequence: actions.value.length + 1,
    executeCondition: '{"type": "always"}',
    actionStatus: '0',
    description: ''
  }
  actions.value.push(newAction)
  // 关闭其他展开项
  expandedActionId.value = null
  // 展开新添加的动作
  expandedActionIndex.value = actions.value.length - 1
  updateParent()
}

// 保存动作列表
const handleSaveActions = async () => {
  try {
    // 保存或更新动作列表
    await saveRuleActions(Number(props.ruleId), actions.value)
    ElMessage.success('动作列表保存成功')
    updateParent()
  } catch (error) {
    console.error('保存动作列表失败:', error)
    ElMessage.error('保存动作列表失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 更新父组件数据
const updateParent = () => {
  emit('update:modelValue', actions.value)
  emit('update:actions', actions.value)
}

// 拖拽结束处理
const handleDragEnd = () => {
  // 更新动作序列
  actions.value.forEach((action, index) => {
    action.actionSequence = index + 1
  })
  updateParent()
}
</script>

<style scoped>
.rule-action-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.action-chain {
  margin-bottom: 20px;
}

.empty-actions {
  padding: 40px 0;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>