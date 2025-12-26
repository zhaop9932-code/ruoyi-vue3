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
            <el-button 
              type="primary" 
              size="small" 
              @click="handleSave"
            >
              <el-icon><Check /></el-icon> 保存条件
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="conditions.length === 0" class="empty-conditions">
        <el-empty description="暂无条件" />
      </div>
      
      <draggable 
        v-model="conditions" 
        item-key="conditionId"
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
                          <el-select 
                            v-model="element.judgeType" 
                            placeholder="请选择判断类型"
                            @change="handleJudgeTypeChange(element)"
                          >
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
                        <el-cascader
                          v-model="element.node"
                          :options="bomNodesOptions"
                          :props="cascaderProps"
                          placeholder="请选择节点"
                          :loading="bomNodesLoading"
                          filterable
                          clearable
                          @change="handleNodeChange(element)"
                          :collapse-tags="true"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <!-- 字段选择，当判断类型为节点产品时隐藏 -->
                    <el-col :span="12" v-if="element.judgeType !== 'nodeProduct'">
                      <el-form-item label="字段">
                        <el-select 
                          v-model="element.field" 
                          placeholder="请选择字段"
                          :loading="fieldsLoading"
                          @visible-change="handleFieldsVisibleChange(element)"
                          @change="handleFieldChange(element)"
                        >
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
                        <el-select v-model="element.operator" placeholder="请选择操作符" @change="handleOperatorChange(element)">
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
                  
                  <el-row :gutter="20" v-if="element.operator && element.operator !== 'is_empty' && element.operator !== 'is_not_empty'">
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
                            <el-option 
                              v-for="option in getAttributeOptions(element)" 
                              :key="option.value"
                              :label="option.label"
                              :value="option.value"
                            />
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
                    item-key="conditionId"
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
                                  <el-select 
                                    v-model="childElement.judgeType" 
                                    placeholder="请选择判断类型"
                                    @change="handleJudgeTypeChange(childElement)"
                                  >
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
                                  <el-cascader
                                    v-model="childElement.node"
                                    :options="bomNodesOptions"
                                    :props="cascaderProps"
                                    placeholder="请选择节点"
                                    :loading="bomNodesLoading"
                                    filterable
                                    clearable
                                    @change="handleNodeChange(childElement)"
                                    :collapse-tags="true"
                                  />
                                </el-form-item>
                              </el-col>
                            </el-row>
                            
                            <el-row :gutter="20">
                              <!-- 字段选择，当判断类型为节点产品时隐藏 -->
                              <el-col :span="12" v-if="childElement.judgeType !== 'nodeProduct'">
                                <el-form-item label="字段">
                                <el-select 
                                  v-model="childElement.field" 
                                  placeholder="请选择字段"
                                  :loading="fieldsLoading"
                                  @visible-change="handleFieldsVisibleChange(childElement)"
                                >
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
                                  <el-select v-model="childElement.operator" placeholder="请选择操作符" @change="handleOperatorChange(childElement)">
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
                            
                            <el-row :gutter="20" v-if="childElement.operator && childElement.operator !== 'is_empty' && childElement.operator !== 'is_not_empty'">
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
                                      <el-option 
                                        v-for="option in getAttributeOptions(childElement)" 
                                        :key="option.value"
                                        :label="option.label"
                                        :value="option.value"
                                      />
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
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Delete, Rank, ChatDotRound, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

// 导入BOM结构API
import {
  listByBomId
} from '@/api/cpq/superBomStructure'

// 导入BOM属性API
import {
  listSuperBomStructureAttributeByBomStructureId,
  listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId,
  getSuperBomStructureAttributeValue
} from '@/api/cpq/bom'

// 导入超级BOM变量API
import {
  getSuperBomVariableByBomId
} from '@/api/cpq/superBomVariable'

// 导入动态属性API
import {
  getSuperBomDynamicAttributeByBomStructureId
} from '@/api/cpq/superBomDynamicAttribute'

// 导入产品关联API
import {
  getSuperBomProductRelationByBomIdAndStructureId
} from '@/api/cpq/superBomProductRelation'

// 导入规则条件API
import {
  saveRuleCondition,
  updateRuleCondition,
  listRuleConditionsByRuleId,
  deleteRuleCondition
} from '@/api/cpq/ruleCondition'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  ruleType: {
    type: String,
    default: 'validation'
  },
  bomId: {
    type: [String, Number],
    default: null
  },
  ruleId: {
    type: [String, Number],
    default: null
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
  // { label: '日期条件', value: 'date' },
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

// 超级BOM节点数据（树结构）
const bomNodes = ref([])
const bomNodeTree = ref([])
const bomNodesOptions = ref([])
const bomNodesLoading = ref(false)

// 级联选择器配置
const cascaderProps = {
  value: 'bomStructureId',
  label: 'nodeName',
  children: 'children',
  multiple: false,
  checkStrictly: false,
  emitPath: false
}

// 加载BOM节点树
const loadBomNodes = async () => {
  if (!props.bomId) {
    console.warn('BOM ID为空，无法加载节点')
    return
  }
  
  bomNodesLoading.value = true
  try {
    console.log('开始加载BOM节点，bomId:', props.bomId)
    const response = await listByBomId(props.bomId)
    console.log('API响应:', response)
    
    // 处理不同的响应格式
    let flatData = []
    if (Array.isArray(response)) {
      flatData = response
    } else if (response.data && Array.isArray(response.data)) {
      flatData = response.data
    } else if (response.rows && Array.isArray(response.rows)) {
      flatData = response.rows
    } else {
      console.warn('未知的响应格式:', response)
      ElMessage.warning('BOM节点数据格式错误')
      return
    }
    
    console.log('处理后的数据:', flatData)
    
    // 将平级数据转换为树形结构
    bomNodeTree.value = convertListToTree(flatData)
    console.log('树形结构:', bomNodeTree.value)
    
    // 转换为下拉选项格式
    const flattenNodes = (nodes, parentPath = '') => {
      let result = []
      nodes.forEach(node => {
        const label = parentPath ? `${parentPath} > ${node.nodeName}` : node.nodeName
        console.log('处理节点:', node, '标签:', label)
        result.push({
          label,
          value: node.bomStructureId
        })
        if (node.children && node.children.length > 0) {
          result = result.concat(flattenNodes(node.children, label))
        }
      })
      return result
    }
    
    bomNodes.value = flattenNodes(bomNodeTree.value)
    bomNodesOptions.value = bomNodeTree.value
    console.log('下拉选项:', bomNodes.value)
    console.log('级联选项:', bomNodesOptions.value)
    
    if (bomNodes.value.length === 0) {
      console.warn('没有找到BOM节点数据')
      ElMessage.info('当前BOM没有节点数据')
    }
  } catch (error) {
    console.error('加载BOM节点失败:', error)
    ElMessage.error('加载BOM节点失败')
  } finally {
    bomNodesLoading.value = false
  }
}

// 将列表数据转换为树状结构
const convertListToTree = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return []
  }
  
  const tree = []
  const map = new Map()
  
  // 构建节点映射，确保每个节点都有children属性
  list.forEach(item => {
    map.set(item.bomStructureId, {
      ...item,
      children: []
    })
  })
  
  // 构建树状结构
  list.forEach(item => {
    const node = map.get(item.bomStructureId)
    const parentNodeId = item.parentNodeId || 0
    
    if (parentNodeId === 0 || !map.has(parentNodeId)) {
      // 根节点
      tree.push(node)
    } else {
      // 子节点
      const parentNode = map.get(parentNodeId)
      parentNode.children.push(node)
    }
  })
  
  return tree
}

// 监听BOM ID变化，重新加载节点和变量
watch(() => props.bomId, (newBomId) => {
  if (newBomId) {
    loadBomNodes()
    loadBomVariables()
  } else {
    bomNodes.value = []
    bomNodeTree.value = []
    bomVariables.value = []
  }
})

// 监听规则ID变化，重新加载条件
watch(() => props.ruleId, (newRuleId) => {
  if (newRuleId) {
    loadConditionsByRuleId(newRuleId)
  } else {
    conditions.value = [...props.modelValue]
  }
})

// 加载规则条件
const loadConditionsByRuleId = async (ruleId) => {
  if (!ruleId) return
  
  try {
    const response = await listRuleConditionsByRuleId(ruleId)
    if (response.code === 200) {
      conditions.value = response.data || []
    } else {
      ElMessage.error('加载条件失败：' + response.message)
    }
  } catch (error) {
    console.error('加载条件失败:', error)
    ElMessage.error('加载条件失败')
  }
}

// 节点选择变化处理
const handleNodeChange = (element) => {
  // 级联选择器返回的是选中的值本身（因为emitPath: false）
  console.log('节点选择变化:', element.node)
  
  // 清空当前字段选择和值选择
  element.field = ''
  element.value = ''
  
  // 清除该节点的所有缓存，确保每次更换节点都能获取最新数据
  if (element.node) {
    dynamicFields.value.staticAttrs.delete(element.node)
    dynamicFields.value.dynamicAttrs.delete(element.node)
    dynamicFields.value.products.delete(element.node)
  }
  
  // 根据判断类型加载对应的字段数据
  if (element.judgeType !== 'variable' && element.node) {
    loadFieldsByJudgeTypeAndNode(element.judgeType, element.node, element)
  }
}

// 加载字段数据
const loadFieldsByJudgeTypeAndNode = async (judgeType, bomStructureId, element) => {
  if (!bomStructureId) return
  
  fieldsLoading.value = true
  try {
    switch (judgeType) {
      case 'nodeStaticAttr':
        await loadStaticAttrs(bomStructureId)
        break
      case 'nodeDynamicAttr':
        await loadDynamicAttrs(bomStructureId)
        break
      case 'nodeProduct':
        await loadProductFields(bomStructureId)
        break
    }
  } catch (error) {
    console.error('加载字段数据失败:', error)
    ElMessage.error('加载字段数据失败')
  } finally {
    fieldsLoading.value = false
    // 确保字段下拉列表更新，即使结果为空
    // 这里我们通过触发一个响应式更新来确保下拉列表重新渲染
    console.log('字段数据加载完成，当前节点字段数:', getFieldsByJudgeTypeAndNode(judgeType, bomStructureId).length)
  }
}

// 加载静态属性
const loadStaticAttrs = async (bomStructureId) => {
  if (dynamicFields.value.staticAttrs.has(bomStructureId)) return
  
  try {
    const response = await listSuperBomStructureAttributeByBomStructureId(bomStructureId)
    
    // 正确处理各种响应格式
    let staticAttrs = []
    if (Array.isArray(response)) {
      // 直接返回数组
      staticAttrs = response
    } else if (response.data) {
      // 响应包含data字段
      if (Array.isArray(response.data)) {
        staticAttrs = response.data
      } else if (response.data.rows && Array.isArray(response.data.rows)) {
        // 有些API可能返回rows字段
        staticAttrs = response.data.rows
      }
    }
    
    console.log('加载静态属性成功，数量:', staticAttrs.length)
    
    // 保存完整的属性信息，包括属性值
    const attrs = staticAttrs.map(attr => ({
      label: attr.attributeName,
      value: attr.attributeCode || attr.attributeName,
      ...attr
    }))
    
    dynamicFields.value.staticAttrs.set(bomStructureId, attrs)
  } catch (error) {
    console.error('加载静态属性失败:', error)
    // 即使失败，也要设置空数组，确保下拉列表能正确更新
    dynamicFields.value.staticAttrs.set(bomStructureId, [])
  }
}

// 加载动态属性
const loadDynamicAttrs = async (bomStructureId) => {
  if (dynamicFields.value.dynamicAttrs.has(bomStructureId)) return
  
  try {
    const response = await getSuperBomDynamicAttributeByBomStructureId(bomStructureId)
    
    // 正确处理各种响应格式
    let dynamicAttrs = []
    if (Array.isArray(response)) {
      // 直接返回数组
      dynamicAttrs = response
    } else if (response.data) {
      // 响应包含data字段
      if (Array.isArray(response.data)) {
        dynamicAttrs = response.data
      } else if (response.data.rows && Array.isArray(response.data.rows)) {
        // 有些API可能返回rows字段
        dynamicAttrs = response.data.rows
      }
    }
    
    console.log('加载动态属性成功，数量:', dynamicAttrs.length)
    
    // 保存完整的属性信息，包括属性值
    const attrs = dynamicAttrs.map(attr => ({
      label: attr.attributeName,
      value: attr.attributeCode || attr.attributeName,
      ...attr
    }))
    
    dynamicFields.value.dynamicAttrs.set(bomStructureId, attrs)
  } catch (error) {
    console.error('加载动态属性失败:', error)
    // 即使失败，也要设置空数组，确保下拉列表能正确更新
    dynamicFields.value.dynamicAttrs.set(bomStructureId, [])
  }
}

// 加载产品字段
const loadProductFields = async (bomStructureId) => {
  if (dynamicFields.value.products.has(bomStructureId)) return
  
  try {
    // 使用正确的API函数名和参数格式
    const response = await getSuperBomProductRelationByBomIdAndStructureId({
      bomId: props.bomId,
      bomStructureId: bomStructureId
    })
    
    // 正确处理各种响应格式
    let productRelations = []
    if (Array.isArray(response)) {
      // 直接返回数组
      productRelations = response
    } else if (response.data) {
      // 响应包含data字段
      if (Array.isArray(response.data)) {
        productRelations = response.data
      } else if (response.data.rows && Array.isArray(response.data.rows)) {
        // 有些API可能返回rows字段
        productRelations = response.data.rows
      }
    }
    
    console.log('加载产品字段成功，数量:', productRelations.length)
    
    const productFields = []
    productRelations.forEach(relation => {
      // 直接使用relationObjectName作为字段标签
      productFields.push({
        label: relation.relationObjectName,
        value: relation.relationObjectId
      })
    })
    
    dynamicFields.value.products.set(bomStructureId, productFields)
  } catch (error) {
    console.error('加载产品字段失败:', error)
    // 即使失败，也要设置空数组，确保下拉列表能正确更新
    dynamicFields.value.products.set(bomStructureId, [])
  }
}

// 组件挂载时加载节点和变量
onMounted(() => {
  if (props.bomId) {
    loadBomNodes()
    loadBomVariables()
  }
  
  if (props.ruleId) {
    loadConditionsByRuleId(props.ruleId)
  }
})

// 动态字段数据管理
const dynamicFields = ref({
  staticAttrs: new Map(), // key: bomStructureId, value: [{ label, value, ...attr }]
  dynamicAttrs: new Map(), // key: bomStructureId, value: [{ label, value, ...attr }]
  products: new Map() // key: bomStructureId, value: [{ label, value }]
})

// 字段加载状态
const fieldsLoading = ref(false)

// 变量数据（响应式，从API获取）
const bomVariables = ref([])

// 加载当前BOM的变量列表
const loadBomVariables = async () => {
  if (!props.bomId) {
    bomVariables.value = []
    return
  }
  
  try {
    const response = await getSuperBomVariableByBomId(props.bomId)
    
    // 处理API响应，转换为选项格式
    if (response.data && Array.isArray(response.data)) {
      bomVariables.value = response.data.map(variable => ({
        label: variable.variableName,
        value: variable.variableCode
      }))
    } else {
      bomVariables.value = []
    }
  } catch (error) {
    console.error('加载变量列表失败:', error)
    bomVariables.value = []
    ElMessage.error('加载变量列表失败')
  }
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

// 字段选择下拉框可见时加载字段
const handleFieldsVisibleChange = (element) => {
  if (element.judgeType !== 'variable' && element.node && !element.field) {
    loadFieldsByJudgeTypeAndNode(element.judgeType, element.node, element)
  }
}

// 判断类型变化处理
const handleJudgeTypeChange = (element) => {
  // 清空当前字段选择和值选择
  element.field = ''
  element.value = ''
  
  // 根据判断类型加载对应的字段数据
  if (element.judgeType !== 'variable' && element.node) {
    loadFieldsByJudgeTypeAndNode(element.judgeType, element.node, element)
  }
}

// 字段选择变化处理
const handleFieldChange = async (element) => {
  // 当选择字段后，需要加载该字段的属性值
  if (element.type === 'select' && element.node && element.field) {
    console.log('字段选择变化:', element.field)
    
    // 只有静态属性才需要调用API获取属性值
    if (element.judgeType === 'nodeStaticAttr') {
      // 查找当前字段
      const fields = dynamicFields.value.staticAttrs.get(element.node) || []
      const currentField = fields.find(field => field.value === element.field)
      
      if (currentField) {
        // 确定属性ID字段名，优先使用attributeId，其次使用id
        const attributeId = currentField.attributeId || currentField.id
        
        if (attributeId) {
          try {
            // 调用API获取属性值，需要传递bomStructureId和attributeId
            const response = await listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId(
              element.node,
              attributeId
            )
            
            // 更新字段的属性值
            currentField.attributeValueList = response.data || []
            
            console.log('属性值加载成功:', currentField.attributeValueList)
          } catch (error) {
            console.error('加载属性值失败:', error)
            ElMessage.error('加载属性值失败')
          }
        }
      }
    }
  }
}

// 操作符变化处理
const handleOperatorChange = (element) => {
  // 当操作符为【为空】或【不为空】时，清空值
  if (element.operator === 'is_empty' || element.operator === 'is_not_empty') {
    element.value = ''
  }
}

// 根据判断类型和节点获取字段
const getFieldsByJudgeTypeAndNode = (judgeType, node) => {
  switch (judgeType) {
    case 'variable':
      // 变量类型不需要node参数，直接返回当前BOM的变量列表
      return bomVariables.value
    case 'nodeStaticAttr':
      if (!node) return []
      return dynamicFields.value.staticAttrs.get(node) || []
    case 'nodeDynamicAttr':
      if (!node) return []
      return dynamicFields.value.dynamicAttrs.get(node) || []
    case 'nodeProduct':
      if (!node) return []
      return dynamicFields.value.products.get(node) || []
    default:
      return []
  }
}

// 根据条件元素获取属性值选项
const getAttributeOptions = (element) => {
  if (element.type !== 'select' || !element.node) {
    return []
  }
  
  // 当判断类型为节点产品时，直接返回该节点的产品列表作为选项
  if (element.judgeType === 'nodeProduct') {
    // 直接返回产品列表，不需要字段选择
    return dynamicFields.value.products.get(element.node) || []
  }
  
  // 其他判断类型的处理逻辑保持不变
  if (!element.field) {
    return []
  }
  
  let fields = []
  if (element.judgeType === 'nodeStaticAttr') {
    fields = dynamicFields.value.staticAttrs.get(element.node) || []
  } else if (element.judgeType === 'nodeDynamicAttr') {
    fields = dynamicFields.value.dynamicAttrs.get(element.node) || []
  }
  
  // 查找当前字段
  const currentField = fields.find(field => field.value === element.field)
  
  if (!currentField) {
    return []
  }
  
  // 解析属性值
  let attributeValues = []
  
  // 检查静态属性的属性值字段名
  if (element.judgeType === 'nodeStaticAttr') {
    // 静态属性可能使用不同的字段名存储属性值
    attributeValues = currentField.attributeValueList || currentField.attributeValues || currentField.values || []
  } else {
    // 动态属性使用attributeValues
    attributeValues = currentField.attributeValues || []
  }
  
  if (typeof attributeValues === 'string') {
    try {
      attributeValues = JSON.parse(attributeValues)
    } catch (error) {
      console.error('解析属性值失败:', error)
      return []
    }
  }
  
  // 转换为选项格式
  if (Array.isArray(attributeValues)) {
    return attributeValues.map(value => {
      if (typeof value === 'object' && value !== null) {
        return {
          label: value.valueName || value.label || value.attributeValue || value.value || '',
          value: value.valueCode || value.code || value.attributeValue || value.value || ''
        }
      } else {
        return {
          label: String(value),
          value: String(value)
        }
      }
    })
  }
  
  return []
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
    conditionId: null,
    ruleId: props.ruleId,
    configType: 'simple', // 默认简单条件
    type: activeConditionType.value,
    judgeType: 'variable', // 默认判断类型为变量
    node: '', // 默认节点为空
    field: '',
    operator: '',
    value: '',
    logic: targetConditions.length > 0 ? 'AND' : '',
    parentConditionId: null,
    children: [] // 复杂条件的子条件
  }
  
  if (parentConditions) {
    newCondition.parentConditionId = parentConditions.conditionId
    parentConditions.children.push(newCondition)
  } else {
    targetConditions.push(newCondition)
  }
  
  updateParent()
}

// 添加复杂条件
const addComplexCondition = () => {
  const newCondition = {
    conditionId: null,
    ruleId: props.ruleId,
    configType: 'complex',
    logic: conditions.value.length > 0 ? 'AND' : '',
    parentConditionId: null,
    children: [
      {
        conditionId: null,
        ruleId: props.ruleId,
        configType: 'simple',
        type: 'number',
        judgeType: 'variable',
        node: '',
        field: '',
        operator: '',
        value: '',
        logic: '',
        parentConditionId: null
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
    conditionId: null,
    ruleId: props.ruleId,
    configType: 'simple',
    type: 'number',
    judgeType: 'variable',
    node: '',
    field: '',
    operator: '',
    value: '',
    logic: parentCondition.children.length > 0 ? 'AND' : '',
    parentConditionId: parentCondition.conditionId
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

// 保存条件
const handleSave = async () => {
  try {
    // 1. 检查规则ID是否存在
    if (!props.ruleId) {
      // 开发环境下添加调试信息
      if (process.env.NODE_ENV === 'development') {
        console.warn('规则ID为空，无法保存条件。请检查父组件是否传递了正确的ruleId参数。')
        console.debug('当前组件props:', props)
      }
      ElMessage.warning('规则ID不能为空，无法保存条件。请先选择或创建规则，再配置条件。')
      return
    }
    
    // 2. 递归处理条件树，确保所有子条件都设置了ruleId和parentConditionId
    const processConditions = (conditionsList, parentId = null) => {
      return conditionsList.map(condition => {
        const processedCondition = {
          ...condition,
          ruleId: props.ruleId,
          parentConditionId: parentId
        }
        
        if (processedCondition.children && processedCondition.children.length > 0) {
          processedCondition.children = processConditions(processedCondition.children, processedCondition.conditionId)
        }
        
        return processedCondition
      })
    }
    
    const processedConditions = processConditions(conditions.value)
    
    // 3. 批量保存或更新条件
    for (const condition of processedConditions) {
      if (condition.conditionId) {
        // 更新现有条件
        await updateRuleCondition(condition)
      } else {
        // 保存新条件
        const response = await saveRuleCondition(condition)
        condition.conditionId = response.data.conditionId
        
        // 递归更新子条件的parentConditionId
        if (condition.children && condition.children.length > 0) {
          const updateChildParentIds = (children, parentId) => {
            children.forEach(child => {
              child.parentConditionId = parentId
              if (child.children && child.children.length > 0) {
                updateChildParentIds(child.children, parentId)
              }
            })
          }
          updateChildParentIds(condition.children, condition.conditionId)
        }
      }
    }
    
    updateParent()
    ElMessage.success('条件保存成功')
  } catch (error) {
    console.error('保存条件失败:', error)
    // 开发环境下添加更详细的错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('错误详情:', error.response || error)
    }
    ElMessage.error('保存条件失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}



// 生成条件表达式
const generateConditionExpression = () => {
  // 查找节点名称
  const findNodeName = (nodes, nodeId) => {
    for (const node of nodes) {
      if (node.bomStructureId === nodeId || node.bomStructureId === Number(nodeId)) {
        return node.nodeName
      }
      if (node.children && node.children.length > 0) {
        const childName = findNodeName(node.children, nodeId)
        if (childName) return childName
      }
    }
    return null
  }
  
  // 获取字段显示名称
  const getFieldLabel = (cond) => {
    if (!cond.field) return 'field'
    
    switch (cond.judgeType) {
      case 'variable':
        // 从bomVariables中查找变量名称
        const variable = bomVariables.value.find(v => v.value === cond.field)
        return variable ? variable.label : cond.field
      case 'nodeStaticAttr':
        // 从静态属性中查找字段名称
        const staticAttrs = dynamicFields.value.staticAttrs.get(cond.node) || []
        const staticAttr = staticAttrs.find(attr => attr.value === cond.field)
        return staticAttr ? staticAttr.label : cond.field
      case 'nodeDynamicAttr':
        // 从动态属性中查找字段名称
        const dynamicAttrs = dynamicFields.value.dynamicAttrs.get(cond.node) || []
        const dynamicAttr = dynamicAttrs.find(attr => attr.value === cond.field)
        return dynamicAttr ? dynamicAttr.label : cond.field
      case 'nodeProduct':
        // 从产品中查找字段名称
        const products = dynamicFields.value.products.get(cond.node) || []
        const product = products.find(p => p.value === cond.field)
        return product ? product.label : cond.field
      default:
        return cond.field
    }
  }
  
  // 获取值显示名称
  const getValueLabel = (cond) => {
    if (cond.value === undefined || cond.value === null || cond.value === '') {
      return ''
    }
    
    // 对于选择类型，尝试查找值标签
    if (cond.type === 'select') {
      const options = getAttributeOptions(cond)
      const option = options.find(opt => opt.value === cond.value)
      if (option) {
        return typeof option.label === 'string' ? `"${option.label}"` : option.label
      }
    }
    
    // 对于其他类型，直接返回值
    return typeof cond.value === 'string' ? `"${cond.value}"` : cond.value
  }
  
  const generateExpression = (condList) => {
    if (!condList || condList.length === 0) return ''
    
    return condList.map(cond => {
      const logic = cond.logic ? `${cond.logic} ` : ''
      
      if (cond.configType === 'complex') {
        const childExpr = generateExpression(cond.children)
        return `${logic}(${childExpr})`
      } else {
        const judgeType = judgeTypes.find(t => t.value === cond.judgeType)?.label || cond.judgeType
        const operatorLabel = getOperatorsByType(cond.type).find(op => op.value === cond.operator)?.label || cond.operator
        const operator = cond.operator || '='
        
        // 根据判断类型构建不同的表达式格式
        let nodeLabel = ''
        let fieldLabel = getFieldLabel(cond)
        let valueLabel = getValueLabel(cond)
        
        if (cond.judgeType !== 'variable') {
          // 查找节点名称
          if (cond.node) {
            nodeLabel = findNodeName(bomNodesOptions.value, cond.node) || cond.node
          }
        }
        
        // 构建字段表达式
        let fieldExpr = ''
        if (cond.judgeType !== 'variable') {
          fieldExpr = `${judgeType}[${nodeLabel}].${fieldLabel}`
        } else {
          fieldExpr = `${judgeType}[${fieldLabel}]`
        }
        
        return `${logic}${fieldExpr} ${operatorLabel} ${valueLabel}`
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
  console.log('更新父组件条件:', conditions.value)
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