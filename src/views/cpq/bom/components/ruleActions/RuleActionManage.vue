<template>
  <div class="rule-action-manage">
    <!-- 顶部操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['cpq:ruleAction:add']"
        >
          新增动作
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="DocumentChecked"
          :disabled="selectedActions.length === 0"
          @click="handleBatchSave"
        >
          批量保存
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          :disabled="selectedActions.length === 0"
          @click="handleBatchDelete"
          v-hasPermi="['cpq:ruleAction:remove']"
        >
          批量删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          icon="DocumentCopy"
          :disabled="selectedActions.length !== 1"
          @click="handleCopy"
        >
          复制动作
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-dropdown @command="handleTemplateSelect">
          <el-button type="primary" icon="Memo">
            使用模板
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="'enable_node'">节点启用控制</el-dropdown-item>
              <el-dropdown-item :command="'recommend_product'">产品推荐</el-dropdown-item>
              <el-dropdown-item :command="'discount_90'">常用折扣(9折)</el-dropdown-item>
              <el-dropdown-item :command="'discount_range'">阶梯折扣</el-dropdown-item>
              <el-dropdown-item :command="'full_reduce'">满减优惠</el-dropdown-item>
              <el-dropdown-item :command="'price_formula'">价格公式计算</el-dropdown-item>
              <el-dropdown-item :command="'mutual_exclude'">互斥选择</el-dropdown-item>
              <el-dropdown-item :command="'multi_select'">多选限制</el-dropdown-item>
              <el-dropdown-item divided :command="'conflict_detect'">冲突检测</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
    </el-row>

    <!-- 动作列表 -->
    <div class="action-list" v-loading="loading">
      <!-- 冲突警告 -->
      <el-alert
        v-if="conflicts.length > 0"
        type="warning"
        :closable="false"
        style="margin-bottom: 15px;"
      >
        <template #title>
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-icon><WarningFilled /></el-icon>
            <span style="font-weight: 600;">检测到 {{ conflicts.length }} 个潜在冲突</span>
          </div>
        </template>
        <div style="margin-top: 10px;">
          <div v-for="(conflict, idx) in conflicts" :key="idx" style="margin-bottom: 8px;">
            <el-tag :type="getConflictTagType(conflict.level)" size="small">
              {{ conflict.level === 'error' ? '错误' : conflict.level === 'warning' ? '警告' : '提示' }}
            </el-tag>
            <span style="margin-left: 8px;">{{ conflict.message }}</span>
            <el-button 
              link 
              type="primary" 
              size="small"
              @click="highlightConflictActions(conflict.actions)"
            >
              查看相关动作
            </el-button>
          </div>
        </div>
      </el-alert>
      
      <el-empty v-if="actionList.length === 0" description="暂无动作配置,请点击'新增动作'按钮添加" />
      
      <div v-else class="action-items">
        <div 
          v-for="(action, index) in actionList" 
          :key="action.actionId || index"
          class="action-item"
          :class="{ 'highlight-conflict': highlightedIndexes.includes(index) }"
        >
          <!-- 动作头部 -->
          <div class="action-header" @click="toggleExpand(index)">
            <div class="action-header-left">
              <el-checkbox 
                v-model="action.selected"
                @change="handleSelectionChange"
                @click.stop
              />
              <el-icon class="expand-icon" :class="{ 'is-expanded': expandedIndexes.includes(index) }">
                <ArrowRight />
              </el-icon>
              <span class="action-title">
                <el-tag :type="getActionCategoryType(action.actionType)" size="small">
                  {{ getActionTypeName(action.actionType) }}
                </el-tag>
                <span class="action-name" v-if="action.actionName">{{ action.actionName }}</span>
                <span class="action-name text-muted" v-else>未命名动作 #{{ index + 1 }}</span>
              </span>
              <el-tag v-if="action.targetType" size="small" effect="plain">
                {{ getTargetTypeName(action.targetType) }}
              </el-tag>
            </div>
            <div class="action-header-right">
              <el-tag :type="action.actionStatus === '0' ? 'success' : 'info'" size="small">
                {{ action.actionStatus === '0' ? '启用' : '禁用' }}
              </el-tag>
              <el-button 
                type="primary" 
                link 
                icon="Edit" 
                @click.stop="handleEdit(action, index)"
              >
                编辑
              </el-button>
              <el-button 
                type="info"
                link 
                icon="DocumentCopy" 
                @click.stop="handleCopyAction(action, index)"
              >
                复制
              </el-button>
              <el-button 
                type="danger" 
                link 
                icon="Delete" 
                @click.stop="handleDelete(action, index)"
                v-hasPermi="['cpq:ruleAction:remove']"
              >
                删除
              </el-button>
            </div>
          </div>

          <!-- 动作内容 -->
          <ActionContent
            v-model:element="actionList[index]"
            :is-expanded="expandedIndexes.includes(index)"
            :bom-id="bomId"
            @validate="handleValidate(index, $event)"
          />
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="currentAction" ref="actionFormRef" label-width="120px">
        <el-form-item label="动作名称">
          <el-input v-model="currentAction.actionName" placeholder="请输入动作名称" />
        </el-form-item>
        
        <ActionContent
          v-model:element="currentAction"
          :is-expanded="true"
          :bom-id="bomId"
          @validate="currentValidation = $event"
        />
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAction">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, WarningFilled } from '@element-plus/icons-vue'
import ActionContent from './ActionContent.vue'
import { 
  listRuleActionsByRuleId, 
  saveRuleAction, 
  updateRuleAction, 
  deleteRuleAction,
  saveRuleActions
} from '@/api/cpq/ruleAction'
import { 
  ACTION_TYPE_GROUPS, 
  TARGET_TYPE_LABELS,
  getActionCategory,
  ACTION_CATEGORIES,
  ACTION_TYPES,
  TARGET_TYPES,
  detectActionConflicts,
  getConflictTagType
} from './actionConfig'

const props = defineProps({
  ruleId: {
    type: [String, Number],
    required: true
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const loading = ref(false)
const actionList = ref([])
const expandedIndexes = ref([])
const highlightedIndexes = ref([])
const selectedActions = computed(() => actionList.value.filter(item => item.selected))

// 冲突检测
const conflicts = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentAction = ref({})
const currentIndex = ref(-1)
const actionFormRef = ref(null)
const currentValidation = ref({ valid: true, errors: [] })

// 加载动作列表
const loadActions = async () => {
  loading.value = true
  try {
    const response = await listRuleActionsByRuleId(props.ruleId)
    if (response.code === 200 && response.data) {
      actionList.value = response.data.map(item => ({
        ...item,
        selected: false
      }))
    }
  } catch (error) {
    console.error('加载动作列表失败:', error)
    ElMessage.error('加载动作列表失败')
  } finally {
    loading.value = false
  }
}

// 新增动作
const handleAdd = () => {
  currentAction.value = {
    ruleId: props.ruleId,
    actionType: '',
    actionName: '',
    targetType: '',
    targetId: '',
    structureId: '',
    attributeId: '',
    actionParams: '{}',
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: actionList.value.length + 1,
    description: ''
  }
  currentIndex.value = -1
  dialogTitle.value = '新增动作'
  dialogVisible.value = true
}

// 编辑动作
const handleEdit = (action, index) => {
  currentAction.value = { ...action }
  currentIndex.value = index
  dialogTitle.value = '编辑动作'
  dialogVisible.value = true
}

// 保存动作
const handleSaveAction = async () => {
  // 验证配置
  if (!currentValidation.value.valid) {
    ElMessage.warning(currentValidation.value.errors.join(', '))
    return
  }
  
  loading.value = true
  try {
    if (currentAction.value.actionId) {
      // 更新
      await updateRuleAction(currentAction.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      const response = await saveRuleAction(currentAction.value)
      if (response.code === 200) {
        currentAction.value.actionId = response.data.actionId
        ElMessage.success('新增成功')
      }
    }
    
    // 更新列表
    if (currentIndex.value >= 0) {
      actionList.value[currentIndex.value] = { ...currentAction.value }
    } else {
      actionList.value.push({ ...currentAction.value, selected: false })
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('保存动作失败:', error)
    ElMessage.error('保存动作失败')
  } finally {
    loading.value = false
  }
}

// 删除动作
const handleDelete = async (action, index) => {
  try {
    await ElMessageBox.confirm('确定要删除该动作吗?', '提示', {
      type: 'warning'
    })
    
    if (action.actionId) {
      await deleteRuleAction(action.actionId)
    }
    
    actionList.value.splice(index, 1)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除动作失败:', error)
      ElMessage.error('删除动作失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedActions.value.length} 个动作吗?`, '提示', {
      type: 'warning'
    })
    
    const deletePromises = selectedActions.value
      .filter(item => item.actionId)
      .map(item => deleteRuleAction(item.actionId))
    
    await Promise.all(deletePromises)
    
    // 删除未保存的和已保存的
    actionList.value = actionList.value.filter(item => !item.selected)
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量保存
const handleBatchSave = async () => {
  try {
    const actions = selectedActions.value.map(item => {
      const { selected, ...actionData } = item
      return actionData
    })
    
    await saveRuleActions(Number(props.ruleId), actions)
    ElMessage.success('批量保存成功')
    await loadActions()
  } catch (error) {
    console.error('批量保存失败:', error)
    ElMessage.error('批量保存失败')
  }
}

// 刷新列表
const handleRefresh = () => {
  loadActions()
}

// 切换展开/收起
const toggleExpand = (index) => {
  const idx = expandedIndexes.value.indexOf(index)
  if (idx >= 0) {
    expandedIndexes.value.splice(idx, 1)
  } else {
    expandedIndexes.value.push(index)
  }
}

// 选择变化
const handleSelectionChange = () => {
  // 处理选择变化
}

// 验证处理
const handleValidate = (index, validation) => {
  // 可以在这里处理验证结果
}

// 对话框关闭
const handleDialogClose = () => {
  currentAction.value = {}
  currentIndex.value = -1
  currentValidation.value = { valid: true, errors: [] }
}

// 复制单个动作
const handleCopyAction = (action, index) => {
  const copiedAction = {
    ...action,
    actionId: null, // 清空ID，作为新动作
    actionName: `${action.actionName || '未命名动作'} (副本)`,
    actionSequence: actionList.value.length + 1,
    selected: false
  }
  actionList.value.push(copiedAction)
  ElMessage.success('动作已复制，请编辑后保存')
}

// 批量复制（从顶部按钮）
const handleCopy = () => {
  if (selectedActions.value.length !== 1) {
    ElMessage.warning('请选择一个动作进行复制')
    return
  }
  const action = selectedActions.value[0]
  const index = actionList.value.findIndex(item => item === action)
  handleCopyAction(action, index)
}

// 动作模板配置
const ACTION_TEMPLATES = {
  enable_node: {
    actionName: '节点启用控制',
    actionType: ACTION_TYPES.IS_ENABLE,
    targetType: TARGET_TYPES.NODE,
    actionParams: JSON.stringify({ value: true }),
    actionStatus: '0',
    actionPriority: 1,
    description: '控制指定节点的启用状态'
  },
  recommend_product: {
    actionName: '产品推荐',
    actionType: ACTION_TYPES.IS_RECOMMEND,
    targetType: TARGET_TYPES.NODE_PRODUCT,
    actionParams: JSON.stringify({ value: true }),
    actionStatus: '0',
    actionPriority: 2,
    description: '将指定产品设置为推荐'
  },
  discount_90: {
    actionName: '9折优惠',
    actionType: ACTION_TYPES.APPLY_DISCOUNT,
    targetType: TARGET_TYPES.NODE,
    actionParams: JSON.stringify({ 
      type: 'percentage', 
      value: 0.9, 
      isStackable: false 
    }),
    actionStatus: '0',
    actionPriority: 3,
    description: '应用9折折扣'
  },
  discount_range: {
    actionName: '阶梯折扣',
    actionType: ACTION_TYPES.SET_PRICE,
    targetType: TARGET_TYPES.NODE,
    actionParams: JSON.stringify({ 
      settingType: 'formula', 
      value: '${quantity} < 10 ? ${price} : (${quantity} < 100 ? ${price} * 0.9 : ${price} * 0.8)'
    }),
    actionStatus: '0',
    actionPriority: 3,
    description: '根据数量设置阶梯价格：小于10件原价，10-100件9折，100件以上8折'
  },
  full_reduce: {
    actionName: '满1000减100',
    actionType: ACTION_TYPES.APPLY_FULL_REDUCTION,
    targetType: TARGET_TYPES.NODE,
    actionParams: JSON.stringify({ 
      conditionType: 'amount', 
      conditionValue: 1000, 
      reduceType: 'fixed', 
      reduceValue: 100, 
      isLoop: false 
    }),
    actionStatus: '0',
    actionPriority: 3,
    description: '订单满1000元减100元'
  },
  price_formula: {
    actionName: '公式计算价格',
    actionType: ACTION_TYPES.SET_PRICE,
    targetType: TARGET_TYPES.NODE,
    actionParams: JSON.stringify({ 
      settingType: 'formula', 
      value: '${price} * ${quantity}'
    }),
    actionStatus: '0',
    actionPriority: 3,
    description: '使用公式计算总价'
  },
  mutual_exclude: {
    actionName: '互斥选择',
    actionType: ACTION_TYPES.MUTUAL_EXCLUDE,
    targetType: TARGET_TYPES.NODE_PRODUCT,
    actionParams: JSON.stringify({}),
    actionStatus: '0',
    actionPriority: 2,
    description: '设置产品之间互斥，只能选其一'
  },
  multi_select: {
    actionName: '多选限制',
    actionType: ACTION_TYPES.MULTIPLE_SELECT,
    targetType: TARGET_TYPES.NODE_PRODUCT,
    actionParams: JSON.stringify({ minSelect: 1, maxSelect: 5 }),
    actionStatus: '0',
    actionPriority: 2,
    description: '限制最少选1个，最多选5个产品'
  },
  conflict_detect: {
    actionName: '冲突检测',
    actionType: ACTION_TYPES.TRIGGER_WARNING,
    targetType: '',
    actionParams: JSON.stringify({ level: 'high', message: '检测到配置冲突' }),
    actionStatus: '0',
    actionPriority: 5,
    description: '检测并警告配置冲突'
  }
}

// 处理模板选择
const handleTemplateSelect = (command) => {
  const template = ACTION_TEMPLATES[command]
  if (!template) return
  
  currentAction.value = {
    ruleId: props.ruleId,
    targetId: '',
    structureId: '',
    attributeId: '',
    actionSequence: actionList.value.length + 1,
    ...template
  }
  currentIndex.value = -1
  dialogTitle.value = '使用模板创建动作'
  dialogVisible.value = true
  
  ElMessage.success(`已加载"${template.actionName}"模板，请完善配置后保存`)
}

// 获取动作类型名称
const getActionTypeName = (actionType) => {
  for (const group of ACTION_TYPE_GROUPS) {
    const option = group.options.find(opt => opt.value === actionType)
    if (option) return option.label
  }
  return actionType
}

// 获取目标类型名称
const getTargetTypeName = (targetType) => {
  return TARGET_TYPE_LABELS[targetType] || targetType
}

// 获取动作分类类型(用于显示颜色)
const getActionCategoryType = (actionType) => {
  const category = getActionCategory(actionType)
  const typeMap = {
    [ACTION_CATEGORIES.BASIC]: 'primary',
    [ACTION_CATEGORIES.MUTUAL]: 'success',
    [ACTION_CATEGORIES.PRICE]: 'warning',
    [ACTION_CATEGORIES.MESSAGE]: 'info',
    [ACTION_CATEGORIES.DATA]: 'danger'
  }
  return typeMap[category] || ''
}

// 高亮冲突动作
const highlightConflictActions = (actionIndexes) => {
  highlightedIndexes.value = actionIndexes
  // 展开这些动作
  actionIndexes.forEach(index => {
    if (!expandedIndexes.value.includes(index)) {
      expandedIndexes.value.push(index)
    }
  })
  // 3秒后取消高亮
  setTimeout(() => {
    highlightedIndexes.value = []
  }, 3000)
}

// 执行冲突检测
const runConflictDetection = () => {
  conflicts.value = detectActionConflicts(actionList.value)
}

// 监听动作列表变化，自动执行冲突检测
watch(
  () => actionList.value,
  () => {
    runConflictDetection()
  },
  { deep: true }
)

onMounted(() => {
  loadActions()
})
</script>

<style scoped lang="scss">
.rule-action-manage {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.action-list {
  margin-top: 20px;
  min-height: 400px;
}

.action-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #f5f7fa;
  }
}

.action-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.action-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  transition: transform 0.3s;
  
  &.is-expanded {
    transform: rotate(90deg);
  }
}

.action-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.action-name {
  color: #303133;
  
  &.text-muted {
    color: #909399;
  }
}

.mb8 {
  margin-bottom: 8px;
}

.highlight-conflict {
  border: 2px solid #f56c6c !important;
  box-shadow: 0 0 10px rgba(245, 108, 108, 0.5) !important;
  animation: highlight-pulse 1s ease-in-out 3;
}

@keyframes highlight-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 108, 108, 0.8);
  }
}
</style>
