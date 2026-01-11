<template>
  <div class="bom-rule-config">
    
    <div class="rule-content">
      <div class="rule-main">
        <!-- 规则列表 -->
        <div class="rule-list-container">
          <div class="list-header">
            <div class="list-actions">
              <el-input
                v-model="filterText"
                placeholder="搜索规则名称"
                prefix-icon="Search"
                clearable
                size="small"
                style="width: 200px; margin-right: 16px;"
              />
              <el-button
                type="primary"
                icon="Plus"
                @click="handleAddRule"
                size="small"
              >新增规则</el-button>
            </div>
          </div>
          
          <div class="rule-list">
            <div 
              v-for="rule in filteredRuleList" 
              :key="rule.ruleId"
              class="rule-item"
              :class="{ 'rule-item-selected': selectedRule?.ruleId === rule.ruleId }"
              @click="handleRuleClick(rule)"
            >
              <div class="rule-item-header">
                <div class="rule-item-info">
                  <div class="rule-name">{{ rule.ruleName }}</div>
                  <div class="rule-meta">
                    <el-tag :type="getRuleTypeTag(rule.ruleType)">
                      {{ getRuleTypeName(rule.ruleType) }}
                    </el-tag>
                    <el-switch 
                      v-model="rule.status" 
                      active-value="enabled" 
                      inactive-value="disabled"
                      @change="(newStatus) => handleToggleRule(rule, newStatus)"
                      size="small"
                      @click.stop
                    />
                  </div>
                </div>
                <el-dropdown @command="(command) => handleRuleCommand(command, rule)" @click.stop>
                  <el-button type="text" icon="More" size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑规则</el-dropdown-item>
                      <el-dropdown-item command="toggle">{{ rule.status === 'enabled' ? '禁用' : '启用' }}</el-dropdown-item>
                      <el-dropdown-item command="delete">删除规则</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="rule-item-description" v-if="rule.description">
                {{ rule.description }}
              </div>
            </div>
          </div>
          
          <div v-if="filteredRuleList.length === 0" class="empty-rules">
            <el-empty description="暂无规则" />
          </div>
        </div>
        
        <!-- 规则详情 -->
        <div class="rule-detail-container">
          <div v-if="!selectedRule" class="empty-detail">
            <el-empty description="请选择或新增一个规则" />
          </div>
          <el-tabs v-else v-model="activeTab" type="border-card">
            <el-tab-pane label="规则基本信息" name="basic">
              <div class="rule-basic-info">
                <el-form :model="selectedRule" label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="规则名称">
                        <el-input v-model="selectedRule.ruleName" placeholder="规则名称" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="规则类型">
                        <el-select v-model="selectedRule.ruleType" placeholder="规则类型">
                          <el-option label="验证规则" value="1" />
                          <el-option label="计算规则" value="2" />
                          <el-option label="条件规则" value="3" />
                          <el-option label="跳转规则" value="4" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="优先级">
                        <el-input-number v-model="selectedRule.priority" :min="1" :max="10" :step="1" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="状态">
                        <el-switch v-model="selectedRule.status" active-value="enabled" inactive-value="disabled" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <!-- <el-form-item label="规则表达式">
                    <el-input v-model="selectedRule.ruleExpression" type="textarea" :rows="4" readonly />
                  </el-form-item> -->
                  <el-form-item label="描述">
                    <el-input v-model="selectedRule.description" type="textarea" :rows="3" placeholder="规则描述" />
                  </el-form-item>
                </el-form>
                <div class="form-actions">
                  <el-button type="primary" @click="handleSaveRule">保存</el-button>
                  <el-button @click="handleCancelEdit">取消</el-button>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="条件配置" name="condition">
              <rule-condition-config
              v-model="selectedRule.conditions"
              :rule-type="selectedRule.ruleType"
              :bom-id="props.bomId"
              :rule-id="selectedRule?.ruleId"
              @update:conditions="updateRuleExpression"
            />
            </el-tab-pane>
            
            <el-tab-pane label="动作配置" name="action">
              <rule-action-config
                v-model="selectedRule.actions"
                :rule-type="selectedRule.ruleType"
                :rule-id="selectedRule?.ruleId"
                :bom-id="props.bomId"
                @update:actions="updateRuleExpression"
              />
            </el-tab-pane>
            
            <el-tab-pane label="高级配置" name="advanced">
              <rule-advanced-config
                v-model="selectedRule.advancedConfig"
                :rule-type="selectedRule.ruleType"
                :rule-id="selectedRule?.ruleId"
              />
            </el-tab-pane>
            
            <el-tab-pane label="AI辅助" name="ai">
              <rule-ai-assist
                @generate-rule="handleAIGenerateRule"
                @optimize-rule="handleAIOptimizeRule"
                @detect-conflicts="handleAIDetectConflicts"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="handleEditContextRule">
        <el-icon><Edit /></el-icon>
        <span>编辑规则</span>
      </div>
      <div class="menu-item" @click="handleToggleContextRule">
        <el-icon><Switch /></el-icon>
        <span>{{ contextMenuRule?.status === 'enabled' ? '禁用规则' : '启用规则' }}</span>
      </div>
      <div class="menu-item" @click="handleDeleteContextRule">
        <el-icon><Delete /></el-icon>
        <span>删除规则</span>
      </div>
    </div>
    
    <!-- 新增规则对话框 -->
    <el-dialog title="新增规则" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="dialogFormRef" :model="dialogRuleForm" :rules="rules" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="dialogRuleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="dialogRuleForm.ruleType" placeholder="请选择规则类型">
            <el-option label="验证规则" value="1" />
            <el-option label="计算规则" value="2" />
            <el-option label="条件规则" value="3" />
            <el-option label="跳转规则" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="dialogRuleForm.priority" :min="1" :max="10" :step="1" placeholder="请输入优先级" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogRuleForm.description" type="textarea" placeholder="请输入规则描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox, ElTree, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Plus, Edit, Delete, Search, More, Switch } from '@element-plus/icons-vue'

// 导入子组件
import RuleConditionConfig from './RuleConditionConfig.vue'
import RuleActionConfig from './RuleActionConfig.vue'
import RuleAdvancedConfig from './RuleAdvancedConfig.vue'
import RuleAIAssist from './RuleAIAssist.vue'

// 导入规则API
import { 
  listConfigurationRule as listBomRules,
  addConfigurationRule as addBomRule,
  updateConfigurationRule as updateBomRule,
  deleteConfigurationRule as deleteBomRule,
  addConfigurationRuleWithBom as addBomRuleWithRelation
} from '@/api/cpq/rule'

// 导入超级BOM规则关联API
import { 
  listSuperBomRuleRelation as listBomRuleRelations,
  getSuperBomRuleRelationByBomId as getRulesByBomId,
  addSuperBomRuleRelation as addBomRuleRelation,
  updateSuperBomRuleRelation as updateBomRuleRelation,
  deleteSuperBomRuleRelation as deleteBomRuleRelation,
  saveBomRuleRelations,
  checkSuperBomRuleRelationExists as checkRuleRelationExists
} from '@/api/cpq/superBomRuleRelation'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  }
})

// 加载状态
const loading = ref(false)

// 过滤文本
const filterText = ref('')

// 规则列表数据
const ruleList = ref([])

// 选中的规则
const selectedRule = ref(null)

// 当前激活的标签页
const activeTab = ref('basic')

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const contextMenuRule = ref(null)

// 过滤后的规则列表
const filteredRuleList = computed(() => {
  if (!filterText.value) {
    return ruleList.value
  }
  return ruleList.value.filter(rule => rule.ruleName.includes(filterText.value))
})

// 获取规则类型名称
const getRuleTypeName = (type) => {
  const typeMap = {
    '1': '验证规则',
    '2': '计算规则',
    '3': '条件规则',
    '4': '跳转规则'
  }
  return typeMap[type] || type
}

// 获取规则类型标签样式
const getRuleTypeTag = (type) => {
  const tagMap = {
    '1': 'primary',
    '2': 'success',
    '3': 'warning',
    '4': 'info'
  }
  return tagMap[type] || 'default'
}

// 对话框
const dialogVisible = ref(false)
const dialogFormRef = ref(null)
const dialogRuleForm = reactive({
  ruleName: '',
  ruleType: '1',
  priority: 1,
  description: ''
})

// 表单验证规则
const rules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  ruleType: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ]
}

// 加载规则列表
const loadRuleList = async () => {
  try {
    loading.value = true
    // 根据BOM ID查询关联的规则
    const response = await getRulesByBomId(props.bomId)
    const relations = response.data || []
    
    // 构建规则列表数据，包含关联关系信息
    ruleList.value = relations.map(relation => ({
      // 规则基本信息
      ruleId: relation.ruleId,
      ruleName: relation.ruleName,
      ruleCode: relation.ruleCode,
      ruleType: relation.ruleType,
      
      // 关联关系信息
      relationId: relation.relationId,
      bomId: relation.bomId,
      ruleOrder: relation.ruleOrder,
      relationType: relation.relationType,
      status: (relation.status === 0 || relation.status === '0') ? 'enabled' : 'disabled',
      remark: relation.remark,
      
      // 规则内容
      ruleExpression: '',
      conditions: [],
      actions: [],
      advancedConfig: {}
    }))
  } catch (error) {
    console.error('加载规则列表失败:', error)
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

// 点击规则项
const handleRuleClick = (rule) => {
  selectedRule.value = rule
  activeTab.value = 'basic'
}

// 规则命令处理
const handleRuleCommand = (command, data) => {
  switch (command) {
    case 'edit':
      handleEditRule(data)
      break
    case 'toggle':
      handleToggleRule(data)
      break
    case 'delete':
      handleDeleteRule(data)
      break
  }
}

// 新增规则
const handleAddRule = () => {
  dialogVisible.value = true
  Object.assign(dialogRuleForm, {
    ruleName: '',
    ruleType: '1',
    priority: 1,
    description: ''
  })
}

// 编辑规则
const handleEditRule = (rule) => {
  selectedRule.value = rule
  activeTab.value = 'basic'
}

// 切换规则状态
const handleToggleRule = async (rule, newStatus) => {
  try {
    // 1. 首先更新规则状态
    rule.status = newStatus
    await updateBomRule(rule)
    
    // 2. 然后更新关联关系状态
    if (rule.relationId) {
      const relationData = {
        relationId: rule.relationId,
        status: newStatus === 'enabled' ? 0 : 1 // 将enabled/disabled转换为0/1
      }
      await updateBomRuleRelation(relationData)
    }
    
    ElMessage.success(`规则及关联关系${newStatus === 'enabled' ? '启用' : '禁用'}成功`)
    await loadRuleList() // 刷新规则列表，确保显示最新状态
  } catch (error) {
    // 恢复原来的状态
    rule.status = rule.status === 'enabled' ? 'disabled' : 'enabled'
    console.error('切换规则状态失败:', error)
    ElMessage.error('切换规则状态失败')
  }
}

// 删除规则
const handleDeleteRule = async (rule) => {
  try {
    await ElMessageBox.confirm(`确定删除规则"${rule.ruleName}"及关联关系吗？`, '提示', {
      type: 'warning'
    })
    
    // 1. 首先删除规则与超级BOM的关联关系
    if (rule.relationId) {
      await deleteBomRuleRelation([rule.relationId])
    }
    
    // 2. 然后删除规则本身
    await deleteBomRule(rule.ruleId)
    
    await loadRuleList()
    if (selectedRule.value?.ruleId === rule.ruleId) {
      selectedRule.value = null
    }
    ElMessage.success('删除规则及关联关系成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规则失败:', error)
      ElMessage.error('删除规则失败')
    }
  }
}

// 右键菜单操作
const handleEditContextRule = () => {
  if (contextMenuRule.value) {
    handleEditRule(contextMenuRule.value)
    contextMenuVisible.value = false
  }
}

const handleToggleContextRule = () => {
  if (contextMenuRule.value) {
    handleToggleRule(contextMenuRule.value, contextMenuRule.value.status === 'enabled' ? 'disabled' : 'enabled')
    contextMenuVisible.value = false
  }
}

const handleDeleteContextRule = () => {
  if (contextMenuRule.value) {
    handleDeleteRule(contextMenuRule.value)
    contextMenuVisible.value = false
  }
}

// 对话框提交
const handleDialogSubmit = async () => {
  try {
    await dialogFormRef.value.validate()
    
    // 构建规则数据
    const ruleData = {
      bomId: props.bomId,
      rule: {
        ruleCode: `RULE_${Date.now()}`, // 自动生成规则编码
        ruleName: dialogRuleForm.ruleName,
        ruleType: dialogRuleForm.ruleType,
        conditionType: 'simple', // 默认简单条件
        triggerCondition: 'onSelect', // 默认触发条件
        conditionConfig: JSON.stringify(dialogRuleForm.conditions || []), // 条件配置
        ruleAction: 'showMessage', // 默认规则动作
        actionType: 'simple', // 默认简单动作
        actionConfig: JSON.stringify(dialogRuleForm.actions || []), // 动作配置
        rulePriority: dialogRuleForm.priority,
        effectiveDate: null, // 生效日期，可选
        expireDate: null, // 失效日期，可选
        ruleStatus: '0', // 0：启用
        description: dialogRuleForm.description,
        ruleOrder: dialogRuleForm.priority || 1, // 规则排序
        remark: '' // 备注
      }
    }
    
    // 使用新的接口一次性添加规则和关联关系
    await addBomRuleWithRelation(ruleData)
    
    dialogVisible.value = false
    await loadRuleList()
    ElMessage.success('新增规则及关联关系成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('新增规则失败:', error)
      ElMessage.error('新增规则失败')
    }
  }
}

// 保存规则
const handleSaveRule = async () => {
  try {
    if (!selectedRule.value) return
    
    // 1. 首先更新规则本身 - 只传递后端需要的字段
    const ruleData = {
      ruleId: selectedRule.value.ruleId,
      ruleName: selectedRule.value.ruleName,
      ruleCode: selectedRule.value.ruleCode,
      ruleType: selectedRule.value.ruleType,
      status: selectedRule.value.status === 'enabled' ? 0 : 1,
      // 只传递规则相关的核心字段，不包含关联关系字段
    }
    await updateBomRule(ruleData)
    
    // 2. 然后更新关联关系
    if (selectedRule.value.relationId) {
      const relationData = {
        relationId: selectedRule.value.relationId,
        ruleOrder: selectedRule.value.ruleOrder || selectedRule.value.priority || 1,
        status: selectedRule.value.status === 'enabled' ? 0 : 1, // 将enabled/disabled转换为0/1
        remark: selectedRule.value.remark
      }
      await updateBomRuleRelation(relationData)
    }
    
    ElMessage.success('保存规则及关联关系成功')
    await loadRuleList()
  } catch (error) {
    console.error('保存规则失败:', error)
    ElMessage.error('保存规则失败')
  }
}

// 取消编辑
const handleCancelEdit = () => {
  selectedRule.value = null
}



// 保存BOM所有规则关联（先删除后新增）
const handleSaveAllRelations = async () => {
  try {
    // 构建要保存的关联关系数据
    const relations = ruleList.value.map(rule => ({
      ruleId: rule.ruleId,
      ruleOrder: rule.ruleOrder || rule.priority || 1,
      relationType: rule.relationType || '1',
      status: rule.status === 'enabled' ? 0 : 1, // 将enabled/disabled转换为0/1
      remark: rule.remark || ''
    }))
    
    // 调用保存BOM规则关联的API
    await saveBomRuleRelations({
      bomId: props.bomId,
      relations
    })
    
    ElMessage.success('保存所有规则关联成功')
    await loadRuleList()
  } catch (error) {
    console.error('保存所有规则关联失败:', error)
    ElMessage.error('保存所有规则关联失败')
  }
}

// 更新规则表达式
const updateRuleExpression = () => {
  if (!selectedRule.value) return
  
  // 根据条件和动作生成规则表达式
  const conditions = selectedRule.value.conditions || []
  const actions = selectedRule.value.actions || []
  
  let expression = ''
  if (conditions.length > 0) {
    expression += 'IF ' + conditions.map(cond => {
      return `${cond.field} ${cond.operator} ${cond.value}`
    }).join(' AND ') + ' THEN '
  }
  
  if (actions.length > 0) {
    expression += actions.map(action => {
      return `${action.type}: ${action.target}`
    }).join('; ')
  }
  
  selectedRule.value.ruleExpression = expression
}

// AI辅助功能
const handleAIGenerateRule = (ruleData) => {
  if (selectedRule.value) {
    Object.assign(selectedRule.value, ruleData)
    updateRuleExpression()
    ElMessage.success('AI生成规则成功')
  }
}

const handleAIOptimizeRule = (optimizedData) => {
  if (selectedRule.value) {
    Object.assign(selectedRule.value, optimizedData)
    updateRuleExpression()
    ElMessage.success('AI优化规则成功')
  }
}

const handleAIDetectConflicts = (conflicts) => {
  if (conflicts.length > 0) {
    ElMessage.warning(`检测到${conflicts.length}个冲突，请检查规则配置`)
  } else {
    ElMessage.success('未检测到冲突')
  }
}

// 点击页面其他地方关闭右键菜单
document.addEventListener('click', () => {
  contextMenuVisible.value = false
})

// 组件挂载时加载数据
onMounted(() => {
  loadRuleList()
})

// 暴露方法给父组件
defineExpose({
  loadRuleList
})
</script>

<style scoped>
.bom-rule-config {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f8f9fa;
}

.rule-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.rule-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.rule-list-container {
  width: 350px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.list-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rule-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.rule-item {
  margin-bottom: 8px;
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.rule-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.rule-item-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.rule-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rule-item-info {
  flex: 1;
  min-width: 0;
}

.rule-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rule-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-item-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-rules {
  padding: 40px 0;
  text-align: center;
}

.rule-detail-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.rule-basic-info {
  padding: 20px 0;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: #f5f7fa;
}
</style>