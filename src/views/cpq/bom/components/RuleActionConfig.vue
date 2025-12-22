<template>
  <div class="action-config">
    <el-card class="action-types">
      <template #header>
        <div class="card-header">
          <span>动作类型</span>
          <el-button type="primary" size="small" @click="addAction">
            <el-icon><Plus /></el-icon> 添加动作
          </el-button>
        </div>
      </template>
      
      <div class="action-type-buttons">
        <el-button 
          v-for="type in actionTypes" 
          :key="type.value"
          :type="activeActionType === type.value ? 'primary' : 'default'"
          @click="selectActionType(type.value)"
          size="small"
          class="action-type-btn"
        >
          {{ type.label }}
        </el-button>
      </div>
    </el-card>
    
    <el-card class="action-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>动作列表</span>
          <span class="action-count">{{ actions.length }} 个动作</span>
        </div>
      </template>
      
      <div v-if="actions.length === 0" class="empty-actions">
        <el-empty description="暂无动作" />
      </div>
      
      <draggable 
        v-model="actions" 
        item-key="id"
        handle=".drag-handle"
        ghost-class="ghost"
      >
        <template #item="{ element, index }">
          <div class="action-item">
            <div class="action-item-header">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <span class="action-index">{{ index + 1 }}</span>
              <el-tag :type="getActionTypeTag(element.type)">
                {{ getActionTypeName(element.type) }}
              </el-tag>
              <el-button 
                type="danger" 
                size="small" 
                icon="Delete"
                @click="removeAction(index)"
              />
            </div>
            
            <div class="action-item-content">
              <el-form :model="element" label-position="top" label-width="80px">
                <!-- 设置属性动作 -->
                <template v-if="element.type === 'setProperty'">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="属性字段">
                        <el-select v-model="element.field" placeholder="请选择属性字段">
                          <el-option label="产品价格" value="productPrice" />
                          <el-option label="产品数量" value="quantity" />
                          <el-option label="折扣率" value="discount" />
                          <el-option label="订单状态" value="orderStatus" />
                          <el-option label="交付日期" value="deliveryDate" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="12">
                      <el-form-item label="属性值">
                        <el-input v-model="element.value" placeholder="请输入属性值" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 添加产品动作 -->
                <template v-else-if="element.type === 'addProduct'">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="产品ID">
                        <el-input v-model="element.productId" placeholder="请输入产品ID" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="12">
                      <el-form-item label="产品数量">
                        <el-input-number 
                          v-model="element.quantity" 
                          :min="1" 
                          :max="999"
                          :step="1"
                          placeholder="请输入数量"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 删除产品动作 -->
                <template v-else-if="element.type === 'removeProduct'">
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="产品ID">
                        <el-input v-model="element.productId" placeholder="请输入产品ID" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 显示消息动作 -->
                <template v-else-if="element.type === 'showMessage'">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="消息内容">
                        <el-input v-model="element.message" placeholder="请输入消息内容" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="12">
                      <el-form-item label="消息类型">
                        <el-select v-model="element.messageType" placeholder="请选择消息类型">
                          <el-option label="成功" value="success" />
                          <el-option label="警告" value="warning" />
                          <el-option label="信息" value="info" />
                          <el-option label="错误" value="error" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 调用API动作 -->
                <template v-else-if="element.type === 'callApi'">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="API地址">
                        <el-input v-model="element.url" placeholder="请输入API地址" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="12">
                      <el-form-item label="请求方法">
                        <el-select v-model="element.method" placeholder="请选择请求方法">
                          <el-option label="GET" value="GET" />
                          <el-option label="POST" value="POST" />
                          <el-option label="PUT" value="PUT" />
                          <el-option label="DELETE" value="DELETE" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="请求参数">
                        <el-input
                          v-model="element.params"
                          type="textarea"
                          placeholder="请输入请求参数（JSON格式）"
                          :rows="4"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 执行脚本动作 -->
                <template v-else-if="element.type === 'executeScript'">
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="脚本内容">
                        <el-input
                          v-model="element.script"
                          type="textarea"
                          placeholder="请输入脚本内容"
                          :rows="6"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <!-- 通用动作配置 -->
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="执行条件">
                      <el-input
                        v-model="element.condition"
                        placeholder="请输入执行条件（可选）"
                        :rows="2"
                      />
                      <div class="form-tip">示例：quantity > 10</div>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="12">
                    <el-form-item label="执行顺序">
                      <el-input-number 
                        v-model="element.sequence" 
                        :min="1" 
                        :max="99"
                        :step="1"
                        placeholder="请输入执行顺序"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
    </el-card>
    
    <el-card class="action-preview" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>动作预览</span>
        </div>
      </template>
      
      <div class="preview-content">
        <pre v-if="actions.length > 0">{{ generateActionExpression() }}</pre>
        <el-empty v-else description="暂无动作预览" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  ruleType: {
    type: String,
    default: 'validation'
  }
})

const emit = defineEmits(['update:modelValue', 'update:actions'])

// 动作列表
const actions = ref([...props.modelValue])

// 活跃的动作类型
const activeActionType = ref('setProperty')

// 动作类型
const actionTypes = [
  { label: '设置属性', value: 'setProperty' },
  { label: '添加产品', value: 'addProduct' },
  { label: '删除产品', value: 'removeProduct' },
  { label: '显示消息', value: 'showMessage' },
  { label: '调用API', value: 'callApi' },
  { label: '执行脚本', value: 'executeScript' }
]

// 获取动作类型名称
const getActionTypeName = (type) => {
  const typeMap = {
    setProperty: '设置属性',
    addProduct: '添加产品',
    removeProduct: '删除产品',
    showMessage: '显示消息',
    callApi: '调用API',
    executeScript: '执行脚本'
  }
  return typeMap[type] || type
}

// 获取动作类型标签颜色
const getActionTypeTag = (type) => {
  const tagMap = {
    setProperty: 'primary',
    addProduct: 'success',
    removeProduct: 'danger',
    showMessage: 'warning',
    callApi: 'info',
    executeScript: 'success'
  }
  return tagMap[type] || 'default'
}

// 选择动作类型
const selectActionType = (type) => {
  activeActionType.value = type
}

// 添加动作
const addAction = () => {
  const newAction = {
    id: Date.now(),
    type: activeActionType.value,
    field: '',
    value: '',
    condition: '',
    sequence: actions.value.length + 1
  }
  actions.value.push(newAction)
  updateParent()
}

// 移除动作
const removeAction = (index) => {
  actions.value.splice(index, 1)
  // 更新剩余动作的执行顺序
  actions.value.forEach((action, idx) => {
    action.sequence = idx + 1
  })
  updateParent()
}

// 生成动作表达式
const generateActionExpression = () => {
  if (actions.value.length === 0) return ''
  
  return actions.value.map(action => {
    let actionDesc = ''
    
    switch (action.type) {
      case 'setProperty':
        actionDesc = `设置 ${action.field} = ${action.value}`
        break
      case 'addProduct':
        actionDesc = `添加产品 ${action.productId}，数量：${action.quantity}`
        break
      case 'removeProduct':
        actionDesc = `删除产品 ${action.productId}`
        break
      case 'showMessage':
        actionDesc = `显示消息：${action.message}（${action.messageType}）`
        break
      case 'callApi':
        actionDesc = `调用API：${action.method} ${action.url}`
        break
      case 'executeScript':
        actionDesc = `执行脚本：${action.script.substring(0, 50)}...`
        break
      default:
        actionDesc = `执行动作：${action.type}`
    }
    
    const condition = action.condition ? ` [条件: ${action.condition}]` : ''
    return `${action.sequence}. ${actionDesc}${condition}`
  }).join('\n')
}

// 更新父组件
const updateParent = () => {
  emit('update:modelValue', actions.value)
  emit('update:actions', actions.value)
}

// 监听动作变化
watch(actions, () => {
  updateParent()
}, { deep: true })

// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(actions.value)) {
    actions.value = [...newVal]
  }
}, { deep: true })
</script>

<style scoped>
.action-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-type-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-type-btn {
  margin-bottom: 10px;
}

.action-count {
  font-size: 12px;
  color: #909399;
}

.empty-actions {
  padding: 40px 0;
}

.action-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.action-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.drag-handle {
  cursor: move;
  color: #909399;
}

.drag-handle:hover {
  color: #409eff;
}

.action-index {
  font-weight: bold;
  color: #409eff;
  min-width: 20px;
}

.action-preview {
  margin-top: 20px;
}

.preview-content pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>