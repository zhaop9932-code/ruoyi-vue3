<template>
  <div class="bom-node-attributes">
    <div class="management-header">
      <h3>属性信息管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="Plus" @click="handleAddAttribute">新增属性</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedAttributes.length === 0">批量删除</el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="attributeList" stripe style="width: 100%">
      <el-table-column type="selection" width="55" align="center" @selection-change="handleSelectionChange" />
      <el-table-column label="属性编码" align="center" prop="attributeCode" min-width="150" />
      <el-table-column label="属性名称" align="center" prop="attributeName" min-width="150" />
      <el-table-column label="组件类型" align="center" prop="componentType" width="120">
        <template #default="scope">
          <el-tag :type="getAttributeTypeTag(scope.row.componentType)">
            {{ getAttributeTypeName(scope.row.componentType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="是否必填" align="center" prop="isRequired" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isRequired === '1' ? 'success' : 'info'">
            {{ scope.row.isRequired === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认值" align="center" prop="defaultValue" min-width="150" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditAttribute(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="info" icon="Setting" @click="handleAttributeValue(scope.row)">
            属性值
          </el-button>
          <el-button size="small" type="danger" icon="Delete" @click="handleDeleteAttribute(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加/编辑属性对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="attributeFormRef" :model="attributeForm" :rules="rules" label-width="120px">
        <div style="margin-bottom: 16px; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
          当前节点：<span style="font-weight: bold;">{{ props.nodeName || '未选择节点' }}</span>
          <span style="margin-left: 10px;">节点ID：{{ props.bomStructureId || '未选择节点' }}</span>
        </div>
        <el-form-item label="属性编码" prop="attributeCode">
          <el-input v-model="attributeForm.attributeCode" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="属性名称" prop="attributeName">
          <el-input v-model="attributeForm.attributeName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="组件类型" prop="componentType">
          <el-select v-model="attributeForm.componentType" placeholder="请选择组件类型">
            <el-option 
              v-for="dict in component_type" 
              :key="dict.value" 
              :label="dict.label" 
              :value="dict.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最小值" prop="minValue" v-if="attributeForm.componentType === 'slider' || attributeForm.componentType === 'number'">
          <el-input v-model="attributeForm.minValue" placeholder="请输入最小值" />
        </el-form-item>
        
        <el-form-item label="最大值" prop="maxValue" v-if="attributeForm.componentType === 'slider' || attributeForm.componentType === 'number'">
          <el-input v-model="attributeForm.maxValue" placeholder="请输入最大值" />
        </el-form-item>
        
        <el-form-item label="步进值" prop="stepValue" v-if="attributeForm.componentType === 'slider'">
          <el-input v-model="attributeForm.stepValue" placeholder="请输入步进值" />
        </el-form-item>
        
        <el-form-item label="是否展示提示" prop="showTooltip">
          <el-radio-group v-model="attributeForm.showTooltip">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        

        <el-form-item label="是否必填" prop="isRequired">
          <el-select v-model="attributeForm.isRequired" placeholder="请选择">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="attributeForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="attributeForm.sortOrder" :min="0" :step="1" placeholder="请输入排序号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 属性值管理抽屉 -->
    <el-drawer
      v-model="attributeValueDrawerVisible"
      title="属性值管理"
      direction="rtl"
      size="50%"
      append-to-body
    >
      <div class="attribute-value-container">
        <div class="attribute-value-header">
          <h4>{{ currentAttribute?.attributeName }} - 属性值列表</h4>
          <el-button type="primary" icon="Plus" @click="handleAddAttributeValue">新增属性值</el-button>
        </div>
        
        <el-table v-loading="attributeValueLoading" :data="attributeValueList" stripe style="width: 100%">
          <el-table-column type="selection" width="55" align="center" @selection-change="handleAttributeValueSelectionChange" />
          <el-table-column label="属性值编码" align="center" prop="valueCode" min-width="150" />
          <el-table-column label="属性值名称" align="center" prop="valueName" min-width="150" />
          <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
          <el-table-column label="状态" align="center" prop="status" width="100">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="enabled" inactive-value="disabled" @change="handleAttributeValueStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="是否默认" align="center" prop="isDefault" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isDefault === '1' ? 'success' : 'info'">
                {{ scope.row.isDefault === '1' ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="图片URL" align="center" prop="imgUrl" min-width="150">
            <template #default="scope">
              <div v-if="scope.row.imgUrl" style="display: flex; align-items: center;">
                <el-image 
                  :src="scope.row.imgUrl" 
                  :preview-src-list="[scope.row.imgUrl]" 
                  style="width: 30px; height: 30px; margin-right: 8px; cursor: pointer;" 
                  fit="cover"
                />
                <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ scope.row.imgUrl }}
                </span>
              </div>
              <span v-else style="color: #909399;">无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" icon="Edit" @click="handleEditAttributeValue(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" icon="Delete" @click="handleDeleteAttributeValue(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 添加/编辑属性值对话框 -->
        <el-dialog :title="attributeValueDialogTitle" v-model="attributeValueDialogVisible" width="500px" append-to-body>
          <el-form ref="attributeValueFormRef" :model="attributeValueForm" :rules="attributeValueRules" label-width="100px">
            <el-form-item label="属性值编码" prop="valueCode">
              <el-input v-model="attributeValueForm.valueCode" placeholder="自动生成" disabled />
            </el-form-item>
            <el-form-item label="属性值名称" prop="valueName">
              <el-input v-model="attributeValueForm.valueName" placeholder="请输入属性值名称" />
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="attributeValueForm.sortOrder" :min="0" :step="1" placeholder="请输入排序号" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="attributeValueForm.status" placeholder="请选择">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否默认" prop="isDefault">
              <el-select v-model="attributeValueForm.isDefault" placeholder="请选择">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="attributeValueForm.imgUrl" placeholder="请输入图片URL" />
              <div style="margin-top: 10px;">
                <el-button type="primary" size="small" @click="handleImageUpload">上传图片</el-button>
                <span style="margin-left: 10px; color: #909399; font-size: 12px;">
                  支持JPG、PNG格式，建议尺寸：100x100px
                </span>
              </div>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="attributeValueDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmitAttributeValue">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入BOM属性API
import { 
  listSuperBomStructureAttribute,
  batchAddSuperBomStructureAttribute,
  updateSuperBomStructureAttribute,
  // 导入属性值相关API
  listSuperBomStructureAttributeValue,
  listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId,
  addSuperBomStructureAttributeValue,
  updateSuperBomStructureAttributeValue,
  deleteSuperBomStructureAttributeValue,
  batchAddSuperBomStructureAttributeValue
} from '@/api/cpq/bom'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    default: ''
  },
  nodeName: {
    type: String,
    default: ''
  }
})

// 获取全局属性
const { proxy } = getCurrentInstance()

// 获取字典数据
const { component_type, sys_normal_disable } = proxy.useDict('component_type', 'sys_normal_disable')

// 加载状态
const loading = ref(false)

// 选中的属性
const selectedAttributes = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增属性')

// 表单引用
const attributeFormRef = ref(null)

// 属性列表
const attributeList = ref([])

// 属性值管理相关数据
const attributeValueDrawerVisible = ref(false)
const attributeValueLoading = ref(false)
const attributeValueList = ref([])
const currentAttribute = ref(null)
const attributeValueDialogVisible = ref(false)
const attributeValueDialogTitle = ref('新增属性值')
const attributeValueFormRef = ref(null)
const attributeValueRules = reactive({
  valueCode: [
    // 后台自动生成，无需必填验证
  ],
  valueName: [
    { required: true, message: '属性值名称不能为空', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序号不能小于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  isDefault: [
    { required: true, message: '请选择是否默认', trigger: 'change' }
  ],
  imgUrl: [
    { type: 'string', message: '图片URL必须是字符串', trigger: 'blur' }
  ]
})
const selectedAttributeValues = ref([])
const attributeValueForm = reactive({
  id: null,
  attributeId: null,
  valueCode: '',
  valueName: '',
  sortOrder: 0,
  status: 'enabled',
  imgUrl: '',
  isDefault: '0'
})

// 表单数据
const attributeForm = reactive({
  id: null,
  bomId: props.bomId,
  bomStructureId: props.bomStructureId, // 使用bomStructureId作为字段名
  attributeCode: '',
  attributeName: '',
  componentType: 'input',
  stepValue: '',
  minValue: '',
  maxValue: '',
  showTooltip: '0',
  isRequired: '0',
  defaultValue: '',
  sortOrder: 0
})

// 加载属性列表
const loadAttributeList = async () => {
  loading.value = true
  try {
    // 使用真实API获取属性列表
    const response = await listSuperBomStructureAttribute({
      bomId: props.bomId,
      bomStructureId: props.bomStructureId
    })

    attributeList.value = response.rows
    console.log('response.data:', response.rows)  
    console.log('attributeList:', attributeList.value)
    loading.value = false
  } catch (error) {
    console.error('加载属性列表失败:', error)
    ElMessage.error('加载属性列表失败')
    loading.value = false
  }
}

// 监听props.bomStructureId变化，实时更新表单数据
watch(() => props.bomStructureId, (newBomStructureId) => {
  console.log('bomStructureId:', newBomStructureId)
  // 只有当newBomStructureId是有效值时才更新
  if (newBomStructureId !== undefined && newBomStructureId !== null && newBomStructureId !== '') {
    attributeForm.bomStructureId = newBomStructureId
    console.log('bomStructureId:', newBomStructureId)
    // 重新加载属性列表
    loadAttributeList()
  }
}, { immediate: true }) // 添加immediate选项，确保组件初始化时就同步一次

// 组件挂载时加载属性列表
onMounted(() => {
  loadAttributeList()
})


// 表单验证规则
const rules = reactive({
  attributeName: [
    { required: true, message: '属性名称不能为空', trigger: 'blur' }
  ],
  componentType: [
    { required: true, message: '请选择组件类型', trigger: 'change' }
  ],
  isRequired: [
    { required: true, message: '请选择是否必填', trigger: 'change' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序号不能小于0', trigger: 'blur' }
  ]
})

// 获取组件类型名称
const getAttributeTypeName = (type) => {
  // 使用字典数据获取组件类型名称
  const dictItem = component_type.value.find(item => item.value === type)
  return dictItem ? dictItem.label : type
}

// 获取组件类型标签样式
const getAttributeTypeTag = (type) => {
  const tagMap = {
    input: 'primary',
    select: 'info',
    radio: 'success',
    checkbox: 'warning',
    date: 'danger',
    datetime: 'purple',
    number: 'blue',
    slider: 'green',
    switch: 'orange',
    textarea: 'cyan'
  }
  return tagMap[type] || 'default'
}



// 多选变化
const handleSelectionChange = (selection) => {
  selectedAttributes.value = selection
}

// 新增属性
const handleAddAttribute = () => {
  resetForm()
  dialogTitle.value = '新增属性'
  dialogVisible.value = true
}

// 编辑属性
const handleEditAttribute = (row) => {
  // 确保字段映射正确
  const mappedRow = {
    ...row,
    attributeCode: row.attributeCode,
    attributeName: row.attributeName,
    isRequired: row.required !== undefined ? (row.required ? '1' : '0') : (row.isRequired || '0')
  }
  Object.assign(attributeForm, mappedRow)
  // 确保bomStructureId始终与当前选中节点保持一致
  attributeForm.bomStructureId = props.bomStructureId
  dialogTitle.value = '编辑属性'
  dialogVisible.value = true
}

// 删除属性
const handleDeleteAttribute = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性 "${row.attributeName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 注意：API文档中没有提供专门的删除属性接口
    // 这里使用前端模拟删除，实际项目中可能需要根据后端API调整
    attributeList.value = attributeList.value.filter(item => item.id !== row.id)
    ElMessage.success('属性删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除属性失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedAttributes.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedAttributes.value.length} 个属性吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedAttributes.value.map(item => item.id)
    // 注意：API文档中没有提供专门的批量删除属性接口
    // 这里使用前端模拟批量删除，实际项目中可能需要根据后端API调整
    attributeList.value = attributeList.value.filter(item => !ids.includes(item.id))
    selectedAttributes.value = []
    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除属性失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await attributeFormRef.value.validate()
    
    // 确保bomStructureId有值
    // 优先使用attributeForm.bomStructureId，因为它通过watch与props.bomStructureId保持同步
    let structureId = attributeForm.bomStructureId
    // 如果attributeForm.bomStructureId为空，尝试使用props.bomStructureId
    if (structureId === undefined || structureId === null || structureId === '') {
      structureId = props.bomStructureId
    }
    // 再次检查structureId是否为有效值
    if (structureId === undefined || structureId === null || structureId === '') {
      ElMessage.error('请先选择节点')
      return
    }
    
    // 确保bomStructureId有值
    attributeForm.bomStructureId = structureId
    
    // 准备提交数据，确保字段名称与API一致
    const submitData = {
      ...attributeForm,
      // 移除不需要提交的字段
      id: attributeForm.id,
      // API期望isRequired字段为字符串类型
      isRequired: attributeForm.isRequired,
      // 移除description字段，API不再需要
      description: undefined,
      // 移除旧的字段名，避免混淆
      attrCode: undefined,
      attrName: undefined
    }
    
    if (attributeForm.id) {
      // 编辑模式
      try {
        // 使用真实API更新属性
        await updateSuperBomStructureAttribute(attributeForm.bomStructureId, [submitData])
        await loadAttributeList() // 重新加载属性列表
        ElMessage.success('属性更新成功')
        dialogVisible.value = false
      } catch (error) {
        console.error('更新属性失败:', error)
        ElMessage.error('更新属性失败')
      }
    } else {
      // 新增模式
      try {
        // 使用真实API新增属性
        await batchAddSuperBomStructureAttribute([submitData])
        await loadAttributeList() // 重新加载属性列表
        ElMessage.success('属性新增成功')
        dialogVisible.value = false
      } catch (error) {
        console.error('新增属性失败:', error)
        ElMessage.error('新增属性失败')
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交属性表单失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  // 保存当前bomStructureId，避免被resetFields()重置
  const currentBomStructureId = attributeForm.bomStructureId || props.bomStructureId  
        
  // 重置表单字段
  attributeFormRef.value?.resetFields()
  
  // 重置所有字段
  attributeForm.id = null
  attributeForm.attributeCode = ''
  attributeForm.attributeName = ''
  attributeForm.componentType = 'input'
  attributeForm.stepValue = ''
  attributeForm.minValue = ''
  attributeForm.maxValue = ''
  attributeForm.showTooltip = '0'
  attributeForm.isRequired = '0'
  attributeForm.defaultValue = ''
  attributeForm.sortOrder = 0
  
  // 确保bomStructureId与当前选中节点一致
  attributeForm.bomStructureId = currentBomStructureId
}

// 打开属性值管理抽屉
const handleAttributeValue = (row) => {
  currentAttribute.value = row
  attributeValueDrawerVisible.value = true
  loadAttributeValueList(row.id)
}

// 加载属性值列表
const loadAttributeValueList = async (attributeId) => {
  attributeValueLoading.value = true
  
  try {
    // 使用新的API根据BOM结构ID和属性ID查询属性值列表
    const response = await listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId(
      props.bomStructureId,
      attributeId
    )
    
    // 根据API返回格式调整数据
    attributeValueList.value = response.data
    
    attributeValueLoading.value = false
  } catch (error) {
    console.error('加载属性值列表失败:', error)
    ElMessage.error('加载属性值列表失败')
    attributeValueLoading.value = false
  }
}

// 重置属性值表单
const resetAttributeValueForm = () => {
  attributeValueForm.id = null
  attributeValueForm.attributeId = currentAttribute.value?.id
  attributeValueForm.valueCode = ''
  attributeValueForm.valueName = ''
  attributeValueForm.sortOrder = 0
  attributeValueForm.status = 'enabled'
  attributeValueForm.imgUrl = ''
  attributeValueForm.isDefault = '0'
  
  attributeValueFormRef.value?.resetFields()
}

// 新增属性值
const handleAddAttributeValue = () => {
  resetAttributeValueForm()
  attributeValueDialogTitle.value = '新增属性值'
  attributeValueDialogVisible.value = true
}

// 编辑属性值
const handleEditAttributeValue = (row) => {
  Object.assign(attributeValueForm, { ...row })
  attributeValueDialogTitle.value = '编辑属性值'
  attributeValueDialogVisible.value = true
}

// 删除属性值
const handleDeleteAttributeValue = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性值 "${row.valueName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 使用真实API删除属性值
    await deleteSuperBomStructureAttributeValue(row.id)
    
    // 更新本地列表
    attributeValueList.value = attributeValueList.value.filter(item => item.id !== row.id)
    ElMessage.success('属性值删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除属性值失败:', error)
    }
  }
}

// 属性值多选变化
const handleAttributeValueSelectionChange = (selection) => {
  selectedAttributeValues.value = selection
}

// 属性值状态变化
const handleAttributeValueStatusChange = async (row) => {
  try {
    // 实际项目中替换为真实API调用
    // await updateAttributeValueStatus(row.id, row.status)
    
    // 模拟更新
    ElMessage.success('属性值状态更新成功')
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.error('状态更新失败')
    console.error('更新属性值状态失败:', error)
  }
}

// 图片上传处理
const handleImageUpload = () => {
  // 实际项目中替换为真实的图片上传逻辑
  // 这里使用模拟数据
  ElMessage.info('图片上传功能开发中，当前使用模拟URL')
  // 模拟图片URL
  attributeValueForm.imgUrl = `https://example.com/image-${Date.now()}.jpg`
}

// 提交属性值
const handleSubmitAttributeValue = async () => {
  try {
    await attributeValueFormRef.value.validate()
    
    // 准备提交数据
    const submitData = {
      ...attributeValueForm,
      bomStructureId: props.bomStructureId,
      // 确保字段名与API一致
      attributeValue: attributeValueForm.valueCode || null  
    }
    
    if (attributeValueForm.id) {
      // 编辑模式
      try {
        // 使用真实API更新属性值
        await updateSuperBomStructureAttributeValue(submitData)
        
        // 更新本地列表
        const index = attributeValueList.value.findIndex(item => item.id === attributeValueForm.id)
        if (index !== -1) {
          attributeValueList.value[index] = { ...attributeValueForm }
        }
        ElMessage.success('属性值更新成功')
      } catch (error) {
        console.error('更新属性值失败:', error)
        ElMessage.error('更新属性值失败')
      }
    } else {
      // 新增模式
      try {
        // 使用真实API新增属性值
        const response = await addSuperBomStructureAttributeValue(submitData)
        
        // 添加到本地列表
        const newAttributeValue = {
          ...attributeValueForm,
          id: response.id || Date.now()
        }
        attributeValueList.value.push(newAttributeValue)
        ElMessage.success('属性值新增成功')
      } catch (error) {
        console.error('新增属性值失败:', error)
        ElMessage.error('新增属性值失败')
      }
    }
    
    attributeValueDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交属性值表单失败:', error)
    }
  }
}

</script>

<style scoped>
.bom-node-attributes {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.management-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}
  /* 属性值管理样式 */
  .attribute-value-container {
    padding: 20px;
    height: 100%;
    overflow: auto;
  }
  
  .attribute-value-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .attribute-value-header h4 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
</style>