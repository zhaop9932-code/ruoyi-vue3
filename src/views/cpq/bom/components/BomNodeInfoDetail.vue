<template>
  <div class="bom-node-info-detail">
    <el-form ref="nodeFormRef" :model="localNode" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="节点编码" prop="nodeCode">
            <el-input v-model="localNode.nodeCode" placeholder="请输入节点编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="节点名称" prop="nodeName">
            <el-input v-model="localNode.nodeName" placeholder="请输入节点名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="节点类型" prop="nodeType">
            <el-select v-model="localNode.nodeType" placeholder="请选择节点类型">
              <el-option label="物料" value="0" />
              <el-option label="组件" value="1" />
              <el-option label="服务" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="父节点" prop="parentNodeId">
            <el-input :value="getParentNodeName(localNode.parentNodeId)" disabled placeholder="父节点名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="默认数量" prop="defaultQuantity">
            <el-input-number v-model="localNode.defaultQuantity" :min="0" :step="0.1" placeholder="请输入默认数量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-input v-model="localNode.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最小数量" prop="minQuantity">
            <el-input-number v-model="localNode.minQuantity" :min="0" :step="0.1" placeholder="请输入最小数量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大数量" prop="maxQuantity">
            <el-input-number v-model="localNode.maxQuantity" :min="0" :step="0.1" placeholder="请输入最大数量" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="节点状态" prop="nodeStatus">
            <el-select v-model="localNode.nodeStatus" placeholder="请选择节点状态">
              <el-option label="激活" value="active" />
              <el-option label="停用" value="inactive" />
              <el-option label="草稿" value="draft" />
              <el-option label="已批准" value="approved" />
              <el-option label="已弃用" value="deprecated" />
            </el-select>
          </el-form-item>
        </el-col>
      
      </el-row>
      
      <!-- 新增字段：选择规则 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否必选" prop="isRequired">
            <el-select v-model="localNode.isRequired" placeholder="请选择是否必选">
              <el-option label="可选" value="0" />
              <el-option label="必选" value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择类型" prop="selectionType">
            <el-select v-model="localNode.selectionType" placeholder="请选择选择类型">
              <el-option label="单选" value="single" />
              <el-option label="多选" value="multiple" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 多选数量限制（当选择类型为multiple时显示） -->
      <el-row v-if="localNode.selectionType === 'multiple'" :gutter="20">
        <el-col :span="12">
          <el-form-item label="最少选择数量" prop="minSelection">
            <el-input-number v-model="localNode.minSelection" :min="0" :step="1" placeholder="最少选择数量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最多选择数量" prop="maxSelection">
            <el-input-number v-model="localNode.maxSelection" :min="0" :step="1" placeholder="最多选择数量" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 新增字段：数量编辑和图标 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数量是否可编辑" prop="isQuantityEditable">
            <el-select v-model="localNode.isQuantityEditable" placeholder="请选择数量是否可编辑">
              <el-option label="不可编辑" value="0" />
              <el-option label="可编辑" value="1" />
            </el-select>
          </el-form-item>
        </el-col>
         <el-col :span="12">
           <el-form-item label="图标" prop="icon">
             <el-popover
               placement="bottom-start"
               :width="540"
               trigger="click"
             >
               <template #reference>
                 <el-input v-model="localNode.icon" placeholder="点击选择图标" @blur="showSelectIcon" readonly>
                   <template #prefix>
                     <svg-icon
                       v-if="localNode.icon"
                       :icon-class="localNode.icon"
                       class="el-input__icon"
                       style="height: 32px;width: 16px;"
                     />
                     <el-icon v-else style="height: 32px;width: 16px;"><Search /></el-icon>
                   </template>
                 </el-input>
               </template>
               <icon-select ref="iconSelectRef" @selected="selectedIcon" :active-icon="localNode.icon" />
             </el-popover>
           </el-form-item>
         </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="启用动态属性">
            <div class="field-with-tooltip">
              <el-tooltip placement="top" content="开启后用户选型页面自动展示关联产品的属性，供用户根据属性选配">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <el-switch 
              v-model="localNode.enableDynamicAttributes" 
              active-value="1" 
              inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生成临时料号">
            <div class="field-with-tooltip">
              <el-tooltip placement="center" content="开启后，临时型号会根据规则自动生成">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <el-switch 
              v-model="localNode.generateTempPartNumber" 
              active-value="1" 
              inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 新增字段：节点说明 -->
      <el-form-item label="节点说明" prop="nodeDescription">
        <el-input v-model="localNode.nodeDescription" type="textarea" placeholder="请输入节点说明" :rows="3" />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input v-model="localNode.description" type="textarea" placeholder="请输入节点描述" :rows="4" />
      </el-form-item>
      
      <div class="form-actions">
        <el-button type="primary" @click="handleSaveNode">保存</el-button>
        <el-button @click="handleCancelEdit">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Search } from '@element-plus/icons-vue'
import IconSelect from '@/components/IconSelect'
import SvgIcon from '@/components/SvgIcon'

// 导入BOM API
import { updateSuperBomStructure } from '@/api/cpq/bom'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    required: true
  },
  selectedNode: {
    type: Object,
    required: true
  }
})

// 图标选择器引用
const iconSelectRef = ref(null)

// 选择图标
const selectedIcon = (name) => {
  localNode.value.icon = name
}

// 显示选择图标
const showSelectIcon = () => {
  // 可以在这里添加一些逻辑
}

// 表单引用
const nodeFormRef = ref(null)

// 本地节点数据
const localNode = ref({ 
  // 基础信息
  isRequired: '0',
  selectionType: 'single',
  minSelection: 0,
  maxSelection: 0,
  isQuantityEditable: '0',
  icon: '',
  nodeDescription: '',
  
  // 新增的后台字段
  conditionExpr: '',
  defaultQuantity: null,
  minQuantity: null,
  minQuantityExpr: '',
  maxQuantity: null,
  maxQuantityExpr: '',
  constraintType: '',
  constraintConfig: '',
  delFlag: '0',
  rootNodeId: null,
  nodePath: '',
  depth: 0,
  sortOrder: 0,
  version: '',
  versionDescription: '',
  isLatest: '1',
  versionStatus: 'draft',
  nodeStatus: 'active',
  approvalStatus: 'pending',
  approvalBy: '',
  approvalTime: '',
  effectiveDate: '',
  expireDate: '',
  isActive: '1',
  enableDynamicAttributes: '0',
  generateTempPartNumber: '0',
  dependentNodeIds: '[]',
  dependencyType: '',
  dependencyCondition: '',
  replaceableNodeIds: '[]',
  replacementCondition: '',
  costType: '',
  costCurrency: '',
  costCalculationRule: '',
  costComponents: '',
  price: null,
  priceType: '',
  priceCurrency: '',
  priceCalculationRule: '',
  priceComponents: '',
  iconUrl: '',
  nodeStyle: '',
  nodeColor: '',
  nodeShape: '',
  longDescription: '',
  documentationUrl: '',
  helpText: '',
  exampleUsage: '[]',
  
  // 继承选中节点的属性
  ...props.selectedNode 
})
const originalNode = ref(JSON.parse(JSON.stringify(props.selectedNode)))

// 表单验证规则
const rules = reactive({
  nodeCode: [
    { required: true, message: '节点编码不能为空', trigger: 'blur' }
  ],
  nodeName: [
    { required: true, message: '节点名称不能为空', trigger: 'blur' }
  ],
  nodeType: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  defaultQuantity: [
    { required: true, message: '请输入默认数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '默认数量不能小于0', trigger: 'blur' }
  ],
  nodeStatus: [
    { required: true, message: '请选择节点状态', trigger: 'change' }
  ],
  isRequired: [
    { required: true, message: '请选择是否必选', trigger: 'change' }
  ],
  selectionType: [
    { required: true, message: '请选择选择类型', trigger: 'change' }
  ],
  minSelection: [
    { type: 'number', min: 0, message: '最少选择数量不能小于0', trigger: 'blur' }
  ],
  maxSelection: [
    { type: 'number', min: 0, message: '最多选择数量不能小于0', trigger: 'blur' }
  ],
  isQuantityEditable: [
    { required: true, message: '请选择数量是否可编辑', trigger: 'change' }
  ]
})

// 监听选中节点变化
watch(() => props.selectedNode, (newNode) => {
  localNode.value = { 
    // 基础信息
    isRequired: '0',
    selectionType: 'single',
    minSelection: 0,
    maxSelection: 0,
    isQuantityEditable: '0',
    icon: '',
    nodeDescription: '',
    
    // 新增的后台字段
    conditionExpr: '',
    defaultQuantity: null,
    minQuantity: null,
    minQuantityExpr: '',
    maxQuantity: null,
    maxQuantityExpr: '',
    constraintType: '',
    constraintConfig: '',
    delFlag: '0',
    rootNodeId: null,
    nodePath: '',
    depth: 0,
    sortOrder: 0,
    version: '',
    versionDescription: '',
    isLatest: '1',
    versionStatus: 'draft',
    nodeStatus: 'active',
    approvalStatus: 'pending',
    approvalBy: '',
    approvalTime: '',
    effectiveDate: '',
    expireDate: '',
    isActive: '1',
    enableDynamicAttributes: '0',
    generateTempPartNumber: '0',
    dependentNodeIds: '[]',
    dependencyType: '',
    dependencyCondition: '',
    replaceableNodeIds: '[]',
    replacementCondition: '',
    costType: '',
    costCurrency: '',
    costCalculationRule: '',
    costComponents: '',
    price: null,
    priceType: '',
    priceCurrency: '',
    priceCalculationRule: '',
    priceComponents: '',
    iconUrl: '',
    nodeStyle: '',
    nodeColor: '',
    nodeShape: '',
    longDescription: '',
    documentationUrl: '',
    helpText: '',
    exampleUsage: '[]',
    
    // 继承选中节点的属性
    ...newNode 
  }
  originalNode.value = JSON.parse(JSON.stringify(localNode.value))
}, { deep: true })

// 保存节点
const handleSaveNode = async () => {
  try {
    await nodeFormRef.value.validate()
    
    // 调用真实API更新节点信息
    await updateSuperBomStructure(localNode.value)
    
    ElMessage.success('节点保存成功')
    originalNode.value = JSON.parse(JSON.stringify(localNode.value))
    
    // 触发更新事件
    emit('node-updated', localNode.value)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败，请检查表单数据')
      console.error('保存节点失败:', error)
    }
  }
}

// 取消编辑
const handleCancelEdit = () => {
  if (originalNode.value) {
    localNode.value = { ...originalNode.value }
  }
}

// 获取父节点名称
const getParentNodeName = (parentNodeId) => {
  if (!parentNodeId) return '根节点'
  // 这里应该从完整的节点树中查找父节点名称
  // 由于组件中没有完整的节点树数据，我们返回一个模拟值
  return `父节点${parentNodeId}`
}

// 事件
const emit = defineEmits(['node-updated'])
</script>

<style scoped>
.bom-node-info-detail {
  padding: 10px;
}

.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}
</style>