<template>
  <div class="condition-config">
    <el-card class="condition-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>条件列表</span>
          <div class="header-actions">
            <span class="condition-count">{{ conditions.length }} 个条件</span>
            <div class="condition-config-type-buttons">
              <el-button 
                v-for="type in conditionConfigTypes" 
                :key="type.value"
                :type="type.value === 'simple' ? 'primary' : 'default'"
                @click="type.value === 'simple' ? addCondition() : addComplexCondition()"
                size="small"
              >
                <el-icon><Plus /></el-icon> {{ type.label }}
              </el-button>
            </div>
          </div>
        </div>
      </template>
      
      <div v-if="conditions.length === 0" class="empty-conditions">
        <el-empty description="暂无条件" />
      </div>
      
      <draggable 
        v-model="conditions" 
        item-key="id"
        handle=".drag-handle"
        ghost-class="ghost"
      >
        <template #item="{ element, index }">
          <div 
              class="condition-item"
              :class="{ 'condition-item-selected': selectedConditionIndex === index, 'complex-condition': element.configType === 'complex' }"
              @click="selectCondition(index, element)"
            >
              <div class="condition-item-header">
                <el-icon class="drag-handle"><Rank /></el-icon>
                <span class="condition-index">{{ index + 1 }}</span>
                <div class="condition-config-type-tag">
                  <el-tag :type="element.configType === 'complex' ? 'warning' : 'success'">
                    {{ element.configType === 'complex' ? '复杂条件' : '简单条件' }}
                  </el-tag>
                </div>
                
                <!-- 简单条件的类型选择 -->
                <div v-if="element.configType === 'simple'" class="condition-type-selector">
                  <el-button 
                    v-for="type in conditionTypes" 
                    :key="type.value"
                    :type="element.type === type.value ? 'primary' : 'default'"
                    @click.stop="updateConditionType(index, type.value)"
                    size="small"
                  >
                    {{ type.label }}
                  </el-button>
                </div>
                
                <!-- 复杂条件的操作按钮 -->
                <div v-else class="complex-condition-actions">
                  <el-button 
                    type="success" 
                    size="small" 
                    @click.stop="addChildCondition(element)"
                  >
                    <el-icon><Plus /></el-icon> 添加子条件
                  </el-button>
                </div>
                
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="Delete"
                  @click.stop="removeCondition(index)"
                />
              </div>
            
              <!-- 简单条件内容 -->
              <div v-if="element.configType === 'simple'" class="condition-item-content">
                <el-form :model="element" label-position="top" label-width="100px">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="判断类型">
                        <el-select v-model="element.judgeType" placeholder="请选择判断类型">
                          <el-option 
                            v-for="judgeType in judgeTypes" 
                            :key="judgeType.value"
                            :label="judgeType.label"
                            :value="judgeType.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <!-- 节点选择，仅当判断类型为非变量时显示 -->
                    <el-col :span="12" v-if="element.judgeType !== 'variable'">
                      <el-form-item label="节点">
                        <el-select v-model="element.node" placeholder="请选择节点">
                          <el-option 
                            v-for="node in bomNodes" 
                            :key="node.value"
                            :label="node.label"
                            :value="node.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="字段">
                        <el-select v-model="element.field" placeholder="请选择字段">
                          <el-option 
                            v-for="field in getFieldsByJudgeTypeAndNode(element.judgeType, element.node)" 
                            :key="field.value"
                            :label="field.label"
                            :value="field.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="12">
                      <el-form-item label="操作符">
                        <el-select v-model="element.operator" placeholder="请选择操作符">
                          <el-option 
                            v-for="op in getOperatorsByType(element.type)" 
                            :key="op.value"
                            :label="op.label"
                            :value="op.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="值">
                        <template v-if="element.type === 'number'">
                          <el-input-number 
                            v-model="element.value" 
                            :min="0" 
                            :max="999999"
                            :step="1"
                            placeholder="请输入数值"
                          />
                        </template>
                        <template v-else-if="element.type === 'text'">
                          <el-input v-model="element.value" placeholder="请输入文本" />
                        </template>
                        <template v-else-if="element.type === 'select'">
                          <el-select v-model="element.value" placeholder="请选择值">
                            <el-option label="选项1" value="option1" />
                            <el-option label="选项2" value="option2" />
                            <el-option label="选项3" value="option3" />
                          </el-select>
                        </template>
                        <template v-else-if="element.type === 'date'">
                          <el-date-picker 
                            v-model="element.value" 
                            type="datetime" 
                            placeholder="选择日期时间"
                          />
                        </template>
                        <template v-else>
                          <el-input v-model="element.value" placeholder="请输入值" />
                        </template>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="逻辑关系">
                        <el-select v-model="element.logic" placeholder="请选择逻辑关系">
                          <el-option label="并且 (AND)" value="AND" />
                          <el-option label="或者 (OR)" value="OR" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              
              <!-- 复杂条件内容 -->
              <div v-else class="complex-condition-content">
                <div class="complex-condition-header">
                  <span class="complex-condition-title">嵌套条件组</span>
                  <el-form-item label="组逻辑关系" inline>
                    <el-select v-model="element.logic" placeholder="请选择逻辑关系">
                      <el-option label="并且 (AND)" value="AND" />
                      <el-option label="或者 (OR)" value="OR" />
                    </el-select>
                  </el-form-item>
                </div>
                
                <!-- 嵌套条件列表 -->
                <div class="nested-conditions">
                  <draggable 
                    v-model="element.children" 
                    item-key="id"
                    handle=".drag-handle"
                    ghost-class="ghost"
                  >
                    <template #item="{ element: childElement, index: childIndex }">
                      <div class="nested-condition-item">
                        <div class="condition-item-header">
                          <el-icon class="drag-handle"><Rank /></el-icon>
                          <span class="condition-index">{{ childIndex + 1 }}</span>
                          <div class="condition-type-selector">
                            <el-button 
                              v-for="type in conditionTypes" 
                              :key="type.value"
                              :type="childElement.type === type.value ? 'primary' : 'default'"
                              @click.stop="childElement.type = type.value"
                              size="small"
                            >
                              {{ type.label }}
                            </el-button>
                          </div>
                          <el-button 
                            type="danger" 
                            size="small" 
                            icon="Delete"
                            @click.stop="element.children.splice(childIndex, 1); updateParent()"
                          />
                        </div>
                        
                        <div class="condition-item-content">
                          <el-form :model="childElement" label-position="top" label-width="100px">
                            <el-row :gutter="20">
                              <el-col :span="12">
                                <el-form-item label="判断类型">
                                  <el-select v-model="childElement.judgeType" placeholder="请选择判断类型">
                                    <el-option 
                                      v-for="judgeType in judgeTypes" 
                                      :key="judgeType.value"
                                      :label="judgeType.label"
                                      :value="judgeType.value"
                                    />
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              
                              <!-- 节点选择，仅当判断类型为非变量时显示 -->
                              <el-col :span="12" v-if="childElement.judgeType !== 'variable'">
                                <el-form-item label="节点">
                                  <el-select v-model="childElement.node" placeholder="请选择节点">
                                    <el-option 
                                      v-for="node in bomNodes" 
                                      :key="node.value"
                                      :label="node.label"
                                      :value="node.value"
                                    />
                                  </el-select>
                                </el-form-item>
                              </el-col>
                            </el-row>
                            
                            <el-row :gutter="20">
                              <el-col :span="12">
                                <el-form-item label="字段">
                                  <el-select v-model="childElement.field" placeholder="请选择字段">
                                    <el-option 
                                      v-for="field in getFieldsByJudgeTypeAndNode(childElement.judgeType, childElement.node)" 
                                      :key="field.value"
                                      :label="field.label"
                                      :value="field.value"
                                    />
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              
                              <el-col :span="12">
                                <el-form-item label="操作符">
                                  <el-select v-model="childElement.operator" placeholder="请选择操作符">
                                    <el-option 
                                      v-for="op in getOperatorsByType(childElement.type)" 
                                      :key="op.value"
                                      :label="op.label"
                                      :value="op.value"
                                    />
                                  </el-select>
                                </el-form-item>
                              </el-col>
                            </el-row>
                            
                            <el-row :gutter="20">
                              <el-col :span="24">
                                <el-form-item label="值">
                                  <template v-if="childElement.type === 'number'">
                                    <el-input-number 
                                      v-model="childElement.value" 
                                      :min="0" 
                                      :max="999999"
                                      :step="1"
                                      placeholder="请输入数值"
                                    />
                                  </template>
                                  <template v-else-if="childElement.type === 'text'">
                                    <el-input v-model="childElement.value" placeholder="请输入文本" />
                                  </template>
                                  <template v-else-if="childElement.type === 'select'">
                                    <el-select v-model="childElement.value" placeholder="请选择值">
                                      <el-option label="选项1" value="option1" />
                                      <el-option label="选项2" value="option2" />
                                      <el-option label="选项3" value="option3" />
                                    </el-select>
                                  </template>
                                  <template v-else-if="childElement.type === 'date'">
                                    <el-date-picker 
                                      v-model="childElement.value" 
                                      type="datetime" 
                                      placeholder="选择日期时间"
                                    />
                                  </template>
                                  <template v-else>
                                    <el-input v-model="childElement.value" placeholder="请输入值" />
                                  </template>
                                </el-form-item>
                              </el-col>
                            </el-row>
                            
                            <el-row :gutter="20">
                              <el-col :span="24">
                                <el-form-item label="逻辑关系">
                                  <el-select v-model="childElement.logic" placeholder="请选择逻辑关系">
                                    <el-option label="并且 (AND)" value="AND" />
                                    <el-option label="或者 (OR)" value="OR" />
                                  </el-select>
                                </el-form-item>
                              </el-col>
                            </el-row>
                          </el-form>
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </div>
        </template>
      </draggable>
    </el-card>
    
    <!-- DeepSeek AI辅助配置 -->
    <el-card class="ai-assist" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>AI辅助配置</span>
        </div>
      </template>
      
      <div class="ai-assist-content">
        <el-button 
          type="primary" 
          size="small" 
          @click="useDeepSeekSuggestion"
        >
          <el-icon><ChatDotRound /></el-icon> 使用DeepSeek智能调整条件
        </el-button>
        <div v-if="aiSuggestion" class="ai-suggestion">
          <h4>DeepSeek建议：</h4>
          <pre>{{ aiSuggestion }}</pre>
        </div>
      </div>
    </el-card>
    
    <el-card class="condition-preview" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>条件预览</span>
        </div>
      </template>
      
      <div class="preview-content">
        <pre v-if="conditions.length > 0">{{ generateConditionExpression() }}</pre>
        <el-empty v-else description="暂无条件预览" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete, Rank, ChatDotRound } from '@element-plus/icons-vue'
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

const emit = defineEmits(['update:modelValue', 'update:conditions'])

// 条件列表
const conditions = ref([...props.modelValue])

// 活跃的条件类型
const activeConditionType = ref('number')

// 当前选中的条件项索引
const selectedConditionIndex = ref(null)

// AI建议
const aiSuggestion = ref('')

// 条件类型
const conditionTypes = [
  { label: '数值条件', value: 'number' },
  { label: '文本条件', value: 'text' },
  { label: '选择条件', value: 'select' },
  { label: '日期条件', value: 'date' },
  { label: '布尔条件', value: 'boolean' }
]

// 条件配置类型
const conditionConfigTypes = [
  { label: '简单条件', value: 'simple' },
  { label: '复杂条件', value: 'complex' }
]

// 判断类型
const judgeTypes = [
  { label: '变量', value: 'variable' },
  { label: '节点静态属性', value: 'nodeStaticAttr' },
  { label: '节点动态属性', value: 'nodeDynamicAttr' },
  { label: '节点产品', value: 'nodeProduct' }
]

// 模拟超级BOM节点数据
const bomNodes = [
  { label: '节点1', value: 'node1' },
  { label: '节点2', value: 'node2' },
  { label: '节点3', value: 'node3' },
  { label: '节点4', value: 'node4' }
]

// 模拟超级BOM变量数据
const bomVariables = [
  { label: '变量1', value: 'var1' },
  { label: '变量2', value: 'var2' },
  { label: '变量3', value: 'var3' }
]

// 模拟节点静态属性数据
const nodeStaticAttrs = {
  node1: [
    { label: '属性1', value: 'attr1' },
    { label: '属性2', value: 'attr2' }
  ],
  node2: [
    { label: '属性3', value: 'attr3' },
    { label: '属性4', value: 'attr4' }
  ]
}

// 模拟节点动态属性数据
const nodeDynamicAttrs = {
  node1: [
    { label: '动态属性1', value: 'dynAttr1' },
    { label: '动态属性2', value: 'dynAttr2' }
  ],
  node2: [
    { label: '动态属性3', value: 'dynAttr3' },
    { label: '动态属性4', value: 'dynAttr4' }
  ]
}

// 模拟节点产品数据
const nodeProducts = {
  node1: [
    { label: '产品1', value: 'prod1' },
    { label: '产品2', value: 'prod2' }
  ],
  node2: [
    { label: '产品3', value: 'prod3' },
    { label: '产品4', value: 'prod4' }
  ]
}

// 根据条件类型获取操作符
const getOperatorsByType = (type) => {
  const operators = {
    number: [
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' },
      { label: '大于', value: '>' },
      { label: '大于等于', value: '>=' },
      { label: '小于', value: '<' },
      { label: '小于等于', value: '<=' },
      { label: '为空', value: 'is_empty' },
      { label: '不为空', value: 'is_not_empty' },
    ],
    text: [
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' },
      { label: '包含', value: 'contains' },
      { label: '不包含', value: 'not_contains' },
      { label: '为空', value: 'is_empty' },
      { label: '不为空', value: 'is_not_empty' },
      { label: '开始于', value: 'starts_with' },
      { label: '结束于', value: 'ends_with' }
    ],
    select: [
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' },
      { label: '在列表中', value: 'in' },
      { label: '不在列表中', value: 'not_in' }
    ],
    date: [
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' },
      { label: '大于', value: '>' },
      { label: '小于', value: '<' },
    ],
    boolean: [
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' }
    ]
  }
  return operators[type] || []
}

// 根据判断类型和节点获取字段
const getFieldsByJudgeTypeAndNode = (judgeType, node) => {
  switch (judgeType) {
    case 'variable':
      return bomVariables
    case 'nodeStaticAttr':
      return nodeStaticAttrs[node] || []
    case 'nodeDynamicAttr':
      return nodeDynamicAttrs[node] || []
    case 'nodeProduct':
      return nodeProducts[node] || []
    default:
      return []
  }
}

// 获取条件类型名称
const getConditionTypeName = (type) => {
  const typeMap = {
    number: '数值条件',
    text: '文本条件',
    select: '选择条件',
    date: '日期条件',
    boolean: '布尔条件'
  }
  return typeMap[type] || type
}

// 获取条件类型标签颜色
const getConditionTypeTag = (type) => {
  const tagMap = {
    number: 'primary',
    text: 'success',
    select: 'warning',
    date: 'info',
    boolean: 'danger'
  }
  return tagMap[type] || 'default'
}

// 选择条件项
const selectCondition = (index, element) => {
  selectedConditionIndex.value = index
  activeConditionType.value = element.type
}

// 更新条件类型
const updateConditionType = (index, type) => {
  conditions.value[index].type = type
  selectedConditionIndex.value = index
}

// 选择条件类型
const selectConditionType = (type) => {
  activeConditionType.value = type
  
  // 如果有选中的条件项，将其类型更新为选择的类型
  if (selectedConditionIndex.value !== null) {
    conditions.value[selectedConditionIndex.value].type = type
  }
}

// 添加条件
const addCondition = (parentConditions = null, parentIndex = null) => {
  const targetConditions = parentConditions || conditions.value
  
  const newCondition = {
    id: Date.now(),
    configType: 'simple', // 默认简单条件
    type: activeConditionType.value,
    judgeType: 'variable', // 默认判断类型为变量
    node: '', // 默认节点为空
    field: '',
    operator: '',
    value: '',
    logic: targetConditions.length > 0 ? 'AND' : '',
    children: [] // 复杂条件的子条件
  }
  
  if (parentIndex !== null) {
    targetConditions.splice(parentIndex + 1, 0, newCondition)
  } else {
    targetConditions.push(newCondition)
  }
  
  updateParent()
}

// 添加复杂条件
const addComplexCondition = () => {
  const newCondition = {
    id: Date.now(),
    configType: 'complex',
    logic: conditions.value.length > 0 ? 'AND' : '',
    children: [
      {
        id: Date.now() + 1,
        configType: 'simple',
        type: 'number',
        judgeType: 'variable',
        node: '',
        field: '',
        operator: '',
        value: '',
        logic: ''
      }
    ]
  }
  conditions.value.push(newCondition)
  updateParent()
}

// 在复杂条件中添加子条件
const addChildCondition = (parentCondition) => {
  if (!parentCondition.children) {
    parentCondition.children = []
  }
  
  const newChild = {
    id: Date.now(),
    configType: 'simple',
    type: 'number',
    judgeType: 'variable',
    node: '',
    field: '',
    operator: '',
    value: '',
    logic: parentCondition.children.length > 0 ? 'AND' : ''
  }
  
  parentCondition.children.push(newChild)
  updateParent()
}

// 移除条件
const removeCondition = (index, parentConditions = null) => {
  const targetConditions = parentConditions || conditions.value
  
  targetConditions.splice(index, 1)
  
  // 更新剩余条件的逻辑关系
  if (targetConditions.length > 0) {
    targetConditions[0].logic = ''
  }
  
  updateParent()
}



// 生成条件表达式
const generateConditionExpression = () => {
  const generateExpression = (condList) => {
    if (!condList || condList.length === 0) return ''
    
    return condList.map(cond => {
      const logic = cond.logic ? `${cond.logic} ` : ''
      
      if (cond.configType === 'complex') {
        const childExpr = generateExpression(cond.children)
        return `${logic}(${childExpr})`
      } else {
        const judgeType = judgeTypes.find(t => t.value === cond.judgeType)?.label || cond.judgeType
        const field = cond.field || 'field'
        const operator = cond.operator || '='
        const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value
        
        // 根据判断类型构建不同的表达式格式
        let fieldExpr = field
        if (cond.judgeType !== 'variable') {
          const node = bomNodes.find(n => n.value === cond.node)?.label || cond.node
          fieldExpr = `${judgeType}[${node}].${field}`
        } else {
          fieldExpr = `${judgeType}[${field}]`
        }
        
        return `${logic}${fieldExpr} ${operator} ${value}`
      }
    }).join(' ')
  }
  
  return generateExpression(conditions.value)
}

// 使用DeepSeek获取智能建议
const useDeepSeekSuggestion = async () => {
  if (conditions.value.length === 0) {
    aiSuggestion.value = '请先添加条件，然后使用AI辅助配置'
    return
  }
  
  try {
    // 这里应该调用DeepSeek API获取智能建议
    // 暂时使用模拟数据
    const conditionExpression = generateConditionExpression()
    
    // 模拟DeepSeek API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟DeepSeek返回的智能建议
    aiSuggestion.value = `
# DeepSeek智能建议

## 当前条件分析
- 条件数量：${conditions.value.length}
- 条件表达式：${conditionExpression}

## 优化建议
1. **字段选择优化**：建议根据业务需求选择更精确的字段
2. **操作符优化**：对于数值类型，建议使用更精确的操作符
3. **值范围优化**：建议设置合理的值范围
4. **逻辑关系优化**：建议优化逻辑关系，提高条件执行效率

## 推荐配置
- 推荐使用：${conditionTypes.find(t => t.value === conditions.value[0].type)?.label}
- 推荐字段：根据业务需求选择
- 推荐操作符：根据条件类型选择
- 推荐值：根据业务规则设置
    `
  } catch (error) {
    console.error('DeepSeek API调用失败:', error)
    aiSuggestion.value = 'DeepSeek API调用失败，请稍后重试'
  }
}

// 更新父组件
const updateParent = () => {
  emit('update:modelValue', conditions.value)
  emit('update:conditions', conditions.value)
}

// 监听条件变化
watch(conditions, () => {
  updateParent()
}, { deep: true })

// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(conditions.value)) {
    conditions.value = [...newVal]
  }
}, { deep: true })
</script>

<style scoped>
.condition-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-config-type-buttons {
  display: flex;
  gap: 10px;
}

.condition-type-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.condition-type-btn {
  margin-bottom: 10px;
}

.condition-count {
  font-size: 12px;
  color: #909399;
}

.condition-config-type-tag {
  margin-right: 10px;
}

.complex-condition-actions {
  display: flex;
  gap: 8px;
  margin-right: auto;
}

.empty-conditions {
  padding: 40px 0;
}

.condition-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.condition-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.condition-item-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.complex-condition {
  border: 2px solid #e6a23c;
  background-color: #fdf6ec;
}

.condition-item-content {
  cursor: default;
}

.condition-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
}

/* 适配新的表单布局 */
.condition-item-content .el-form-item {
  margin-bottom: 15px;
}

.condition-item-content .el-select {
  width: 100%;
}

/* 嵌套条件的表单样式 */
.nested-condition-item .condition-item-content {
  padding-left: 10px;
}

/* 适配判断类型和节点选择的布局 */
.condition-item-content .el-row {
  margin-bottom: 10px;
}

.condition-item-content .el-col {
  margin-bottom: 10px;
}

.condition-type-selector {
  display: flex;
  gap: 8px;
  margin-right: auto;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.drag-handle {
  cursor: move;
  color: #909399;
}

.drag-handle:hover {
  color: #409eff;
}

.condition-index {
  font-weight: bold;
  color: #409eff;
  min-width: 20px;
}

.condition-preview {
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

.ai-assist {
  margin-top: 20px;
}

.ai-assist-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ai-suggestion {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.ai-suggestion h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.ai-suggestion pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

/* 复杂条件样式 */
.complex-condition-content {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 10px;
}

.complex-condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.complex-condition-title {
  font-weight: bold;
  color: #e6a23c;
  font-size: 14px;
}

.nested-conditions {
  margin-left: 20px;
  border-left: 3px dashed #e6a23c;
  padding-left: 20px;
}

.nested-condition-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #ffffff;
}

.complex-condition-header .el-form-item {
  margin: 0;
}
</style>