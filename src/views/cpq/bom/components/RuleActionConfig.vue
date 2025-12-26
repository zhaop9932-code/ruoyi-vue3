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
          <div class="action-item">
            <div class="item-header" @click="expandedActionId === element.actionId ? expandedActionId = null : expandedActionId = element.actionId">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <span class="action-index">{{ index + 1 }}</span>
              <div class="action-type-tag">
                <el-tag :type="getActionTypeTag(element.actionType)">
                  {{ getActionTypeName(element.actionType) }}
                </el-tag>
              </div>
              <div class="action-name">{{ element.actionName || '未命名动作' }}</div>
              <div class="action-description">{{ element.description || '无描述' }}</div>
            </div>
            
            <div class="item-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click.stop="expandedActionId === element.actionId ? expandedActionId = null : expandedActionId = element.actionId"
              >
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click.stop="handleDeleteAction(index)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
            
            <div class="action-content" v-if="expandedActionId === element.actionId || (element.actionId === null && expandedActionIndex === index)">
              <el-form :model="element" label-position="top" label-width="100px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="动作类型">
                      <el-select v-model="element.actionType" placeholder="请选择动作类型" @change="handleActionTypeChange(element)">
                        <!-- 基础动作 -->
                        <el-option label="启用" value="enable" />
                        <el-option label="禁用" value="disable" />
                        <el-option label="必选" value="required" />
                        <el-option label="推荐" value="recommend" />
                        <el-option label="显示" value="show" />
                        <el-option label="隐藏" value="hide" />
                        <el-option label="排除" value="exclude" />
                        <el-option label="重置" value="reset" />
                        <el-option label="聚焦" value="focus" />
                        <el-option label="联动选中" value="linkSelect" />
                        
                        <!-- 价格动作 -->
                        <el-option label="应用折扣" value="applyDiscount" />
                        <el-option label="应用满减" value="applyFullReduction" />
                        <el-option label="设置价格" value="setPrice" />
                        <el-option label="价格调整" value="adjustPrice" />
                        
                        <!-- 消息通知 -->
                        <el-option label="显示消息" value="showMessage" />
                        <el-option label="发送通知" value="sendNotification" />
                        <el-option label="触发警告" value="triggerWarning" />
                        
                        <!-- 数据处理 -->
                        <el-option label="设置变量" value="setVariable" />
                        <el-option label="调用API" value="callApi" />
                        <el-option label="触发规则" value="triggerRule" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <!-- 隐藏动作名称 -->
                  <el-col :span="12" v-show="false">
                    <el-form-item label="动作名称">
                      <el-input v-model="element.actionName" placeholder="请输入动作名称" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <!-- 隐藏动作编码 -->
                  <el-col :span="12" v-show="false">
                    <el-form-item label="动作编码">
                      <el-input v-model="element.actionCode" placeholder="请输入动作编码" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="目标类型">
                      <el-select v-model="element.targetType" placeholder="请选择目标类型">
                        <el-option label="节点" value="node" />
                        <el-option label="产品" value="product" />
                        <el-option label="变量" value="variable" />
                        <el-option label="全局" value="global" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="目标ID">
                      <el-input v-model="element.targetId" placeholder="请输入目标ID" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="动作优先级">
                      <el-input-number 
                        v-model="element.actionPriority" 
                        :min="1" 
                        :max="100" 
                        :step="1"
                        placeholder="请输入优先级"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="动作状态">
                      <el-switch v-model="element.actionStatus" active-value="0" inactive-value="1" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="动作序列">
                      <el-input-number 
                        v-model="element.actionSequence" 
                        :min="1" 
                        :max="100" 
                        :step="1"
                        placeholder="请输入动作序列"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="动作参数">
                      <!-- 结构化参数输入，根据动作类型显示不同的表单 -->
                      <div v-if="element.actionType && element.actionParams" class="structured-params">
                        <!-- 基础动作参数 -->
                        <template v-if="['enable', 'disable', 'required', 'recommend', 'show', 'hide', 'exclude', 'reset', 'focus', 'linkSelect'].includes(element.actionType)">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="目标对象">
                                <el-input v-model="JSON.parse(element.actionParams).target" @input="updateActionParams(element, 'target', $event)" placeholder="请输入目标对象" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 触发规则参数 -->
                        <template v-else-if="element.actionType === 'triggerRule'">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="规则ID">
                                <el-input v-model="JSON.parse(element.actionParams).ruleId" @input="updateActionParams(element, 'ruleId', $event)" placeholder="请输入规则ID" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="规则参数">
                                <el-input 
                                  v-model="element.actionParams" 
                                  type="textarea" 
                                  :rows="2" 
                                  placeholder="请输入规则参数(JSON格式)"
                                />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 应用折扣参数 -->
                        <template v-else-if="element.actionType === 'applyDiscount'">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="折扣类型">
                                <el-select v-model="JSON.parse(element.actionParams).type" @change="updateActionParams(element, 'type', $event)">
                                  <el-option label="固定折扣" value="rate" />
                                  <el-option label="动态变量" value="variable" />
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="折扣值">
                                <el-input v-model="JSON.parse(element.actionParams).value" @input="updateActionParams(element, 'value', $event)" placeholder="请输入折扣值，如0.9或$折扣率$" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 应用满减参数 -->
                        <template v-else-if="element.actionType === 'applyFullReduction'">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="满减阈值">
                                <el-input-number v-model="JSON.parse(element.actionParams).threshold" @change="updateActionParams(element, 'threshold', $event)" :min="0" :step="100" placeholder="请输入满减阈值" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="减免金额">
                                <el-input-number v-model="JSON.parse(element.actionParams).reduce" @change="updateActionParams(element, 'reduce', $event)" :min="0" :step="50" placeholder="请输入减免金额" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 设置价格参数 -->
                        <template v-else-if="element.actionType === 'setPrice'">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="价格">
                                <el-input-number v-model="JSON.parse(element.actionParams).value" @change="updateActionParams(element, 'value', $event)" :min="0" :step="10" placeholder="请输入价格" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="货币">
                                <el-select v-model="JSON.parse(element.actionParams).currency" @change="updateActionParams(element, 'currency', $event)">
                                  <el-option label="人民币" value="CNY" />
                                  <el-option label="美元" value="USD" />
                                  <el-option label="欧元" value="EUR" />
                                </el-select>
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 显示消息参数 -->
                        <template v-else-if="element.actionType === 'showMessage'">
                          <el-row :gutter="20">
                            <el-col :span="8">
                              <el-form-item label="消息级别">
                                <el-select v-model="JSON.parse(element.actionParams).level" @change="updateActionParams(element, 'level', $event)">
                                  <el-option label="信息" value="info" />
                                  <el-option label="成功" value="success" />
                                  <el-option label="警告" value="warning" />
                                  <el-option label="错误" value="error" />
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="16">
                              <el-form-item label="消息标题">
                                <el-input v-model="JSON.parse(element.actionParams).title" @input="updateActionParams(element, 'title', $event)" placeholder="请输入消息标题" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                          <el-row :gutter="20">
                            <el-col :span="24">
                              <el-form-item label="消息内容">
                                <el-input 
                                  v-model="JSON.parse(element.actionParams).content" 
                                  @input="updateActionParams(element, 'content', $event)" 
                                  type="textarea" 
                                  :rows="2" 
                                  placeholder="请输入消息内容"
                                />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 设置变量参数 -->
                        <template v-else-if="element.actionType === 'setVariable'">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="变量名称">
                                <el-input v-model="JSON.parse(element.actionParams).variable" @input="updateActionParams(element, 'variable', $event)" placeholder="请输入变量名称" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="变量值">
                                <el-input v-model="JSON.parse(element.actionParams).value" @input="updateActionParams(element, 'value', $event)" placeholder="请输入变量值" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </template>
                        
                        <!-- 其他情况或旧类型，使用JSON文本输入 -->
                        <template v-else>
                          <el-input 
                            v-model="element.actionParams" 
                            type="textarea" 
                            :rows="4" 
                            placeholder="请输入动作参数（JSON格式）"
                          />
                        </template>
                      </div>
                      
                      <!-- 初始状态或未选择动作类型时，显示提示 -->
                      <div v-else class="params-placeholder">
                        请先选择动作类型，系统会自动生成默认参数结构
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="执行条件">
                      <el-input 
                        v-model="element.executeCondition" 
                        type="textarea" 
                        :rows="3" 
                        placeholder="请输入执行条件（JSON格式）"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="描述">
                      <el-input 
                        v-model="element.description" 
                        type="textarea" 
                        :rows="2" 
                        placeholder="请输入动作描述"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <div class="form-actions">
                  <el-button type="primary" @click="handleSaveAction(element)">保存</el-button>
                  <el-button @click="expandedActionId = null">取消</el-button>
                </div>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Delete, Edit, Rank } from '@element-plus/icons-vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElTag, ElSwitch, ElInputNumber, ElEmpty } from 'element-plus'
import draggable from 'vuedraggable'

// 导入动作API
import {
  listRuleAction as listActions,
  listRuleActionsByRuleId,
  saveRuleAction as saveAction,
  updateRuleAction as updateAction,
  deleteRuleAction as deleteAction,
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
  }
})

const emit = defineEmits(['update:modelValue', 'update:actions'])

// 动作列表
const actions = ref([...props.modelValue])

// 展开的动作ID
const expandedActionId = ref(null)

// 展开的动作索引，用于新添加的动作
const expandedActionIndex = ref(null)

// 移除对话框相关的状态和表单
// 我们不再需要对话框，所以移除这些变量



// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(actions.value)) {
    actions.value = [...newVal]
  }
}, { deep: true })

// 监听规则ID变化
watch(() => props.ruleId, (newRuleId) => {
  actionForm.value.ruleId = newRuleId
  if (newRuleId) {
    loadActionsByRuleId(newRuleId)
  }
})

// 根据规则ID加载动作
const loadActionsByRuleId = async (ruleId) => {
  try {
    const response = await listRuleActionsByRuleId(ruleId)
    actions.value = response.data || []
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

// 获取动作类型名称
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

// 获取动作类型标签颜色
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

// 打开动作编辑
const handleEditAction = (action) => {
  expandedActionId.value = action.actionId
}

// 更新动作参数
const updateActionParams = (action, key, value) => {
  if (!action.actionParams) {
    action.actionParams = '{}'
  }
  try {
    const params = JSON.parse(action.actionParams)
    params[key] = value
    action.actionParams = JSON.stringify(params, null, 2)
  } catch (error) {
    console.error('更新动作参数失败:', error)
    ElMessage.error('更新动作参数失败：' + error.message)
  }
}

// 动作类型变化处理
const handleActionTypeChange = (action) => {
  // 根据动作类型设置默认参数
  switch (action.actionType) {
    // 基础动作
    case 'enable':
    case 'disable':
    case 'required':
    case 'recommend':
    case 'show':
    case 'hide':
    case 'exclude':
    case 'reset':
    case 'focus':
    case 'linkSelect':
      action.actionParams = '{"target": ""}'
      break
    
    // 价格动作
    case 'applyDiscount':
      action.actionParams = '{"type": "rate", "value": 0.9}'
      break
    case 'applyFullReduction':
      action.actionParams = '{"threshold": 1000, "reduce": 100}'
      break
    case 'setPrice':
      action.actionParams = '{"value": 100, "currency": "CNY"}'
      break
    case 'adjustPrice':
      action.actionParams = '{"operator": "+", "value": 50}'
      break
    
    // 消息通知
    case 'showMessage':
      action.actionParams = '{"level": "info", "title": "提示", "content": ""}'
      break
    case 'sendNotification':
      action.actionParams = '{"type": "email", "recipient": "", "content": ""}'
      break
    case 'triggerWarning':
      action.actionParams = '{"level": "warning", "message": ""}'
      break
    
    // 数据处理
    case 'setVariable':
      action.actionParams = '{"variable": "", "value": ""}'
      break
    case 'callApi':
      action.actionParams = '{"endpoint": "", "method": "POST", "headers": {}, "requestBody": {}, "onSuccess": {}, "onFailure": {}}'
      break
    case 'triggerRule':
      action.actionParams = '{"ruleId": "", "params": {}}'
      break
    
    // 兼容旧类型
    case 'calculate':
      action.actionParams = '{"formula": ""}'
      break
    case 'validate':
      action.actionParams = '{"rule": ""}'
      break
    case 'notify':
      action.actionParams = '{"message": "", "type": "info"}'
      break
    case 'data':
      action.actionParams = '{"operation": "", "data": {}}'
      break
    case 'redirect':
      action.actionParams = '{"url": "", "target": "_self"}'
      break
    default:
      action.actionParams = ''
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

// 保存动作
const handleSaveAction = async (action) => {
  try {
    if (action.actionId) {
      // 更新现有动作
      await updateAction(action)
      ElMessage.success('动作更新成功')
      expandedActionId.value = null
    } else {
      // 保存新动作
      const response = await saveAction(action)
      // 替换临时动作对象为服务器返回的带有actionId的对象
      const index = actions.value.findIndex(item => item === action)
      if (index !== -1) {
        actions.value[index] = response.data
      }
      ElMessage.success('动作添加成功')
      expandedActionId.value = null
      expandedActionIndex.value = null
    }
    updateParent()
  } catch (error) {
    console.error('保存动作失败:', error)
    ElMessage.error('保存动作失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 删除动作
const handleDeleteAction = async (index) => {
  try {
    const action = actions.value[index]
    if (action.actionId) {
      await deleteAction(action.actionId)
    }
    actions.value.splice(index, 1)
    ElMessage.success('动作删除成功')
    updateParent()
  } catch (error) {
    console.error('删除动作失败:', error)
    ElMessage.error('删除动作失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 拖拽结束处理
const handleDragEnd = () => {
  // 更新动作序列
  actions.value.forEach((action, index) => {
    action.actionSequence = index + 1
  })
  updateParent()
  ElMessage.success('动作顺序已更新')
}

// 保存动作列表
const handleSaveActions = async () => {
  if (!props.ruleId) {
    ElMessage.warning('规则ID不能为空，无法保存动作列表')
    return
  }
  
  try {
    const response = await saveRuleActions(props.ruleId, actions.value)
    ElMessage.success(`动作列表保存成功，共${response.data}个动作`)
  } catch (error) {
    console.error('保存动作列表失败:', error)
    ElMessage.error('保存动作列表失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

// 更新父组件
const updateParent = () => {
  emit('update:modelValue', actions.value)
  emit('update:actions', actions.value)
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

.action-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.action-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

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

.action-content {
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

/* 结构化参数样式 */
.structured-params {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.params-placeholder {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  background-color: #fafafa;
}

/* 优化表单项目间距 */
.structured-params .el-form-item {
  margin-bottom: 15px;
}

/* 优化输入框样式 */
.structured-params .el-input, .structured-params .el-select, .structured-params .el-input-number {
  width: 100%;
}
</style>