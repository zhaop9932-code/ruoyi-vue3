<template>
  <div class="bom-dynamic-attributes">
    <div class="management-header">
      <h3>动态属性管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="Plus" @click="handleAddAttribute">新增属性</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedAttributes.length === 0">批量删除</el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="attributeList" stripe style="width: 100%">
      <el-table-column type="selection" width="55" align="center" @selection-change="handleSelectionChange" />
      <el-table-column label="属性编码" align="center" prop="attrCode" min-width="150" />
      <el-table-column label="属性名称" align="center" prop="attrName" min-width="150" />
      <el-table-column label="属性类型" align="center" prop="attrType" width="120">
        <template #default="scope">
          <el-tag :type="getAttributeTypeTag(scope.row.attrType)">
            {{ getAttributeTypeName(scope.row.attrType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="属性值" align="center" prop="attrValue" min-width="150" />
      <el-table-column label="是否必填" align="center" prop="required" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.required" disabled />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80">
        <template #default="scope">
          <el-input-number v-model="scope.row.sortOrder" :min="0" :step="1" :disabled="true" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditAttribute(scope.row)">
            编辑
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
        <el-form-item label="属性编码" prop="attrCode">
          <el-input v-model="attributeForm.attrCode" placeholder="请输入属性编码" />
        </el-form-item>
        <el-form-item label="属性名称" prop="attrName">
          <el-input v-model="attributeForm.attrName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性类型" prop="attrType">
          <el-select v-model="attributeForm.attrType" placeholder="请选择属性类型" @change="handleAttrTypeChange">
            <el-option label="文本" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="日期" value="date" />
            <el-option label="下拉选择" value="select" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="attributeForm.attrType === 'select'" label="选项列表" prop="options">
          <el-input
            v-model="optionsText"
            type="textarea"
            placeholder="请输入选项，每行一个，格式：值=显示文本" 
            :rows="4"
          />
          <div class="form-tip">示例：red=红色
blue=蓝色
green=绿色</div>
        </el-form-item>
        <el-form-item label="默认值" prop="attrValue">
          <template v-if="attributeForm.attrType === 'boolean'">
            <el-switch v-model="attributeForm.attrValue" />
          </template>
          <template v-else-if="attributeForm.attrType === 'date'">
            <el-date-picker
              v-model="attributeForm.attrValue"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </template>
          <template v-else-if="attributeForm.attrType === 'select' && attributeForm.options && attributeForm.options.length > 0">
            <el-select v-model="attributeForm.attrValue" placeholder="请选择属性值">
              <el-option
                v-for="option in attributeForm.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
          <template v-else-if="attributeForm.attrType === 'number'">
            <el-input-number
              v-model="attributeForm.attrValue"
              :min="0"
              :step="1"
              placeholder="请输入数值"
            />
          </template>
          <template v-else>
            <el-input v-model="attributeForm.attrValue" placeholder="请输入属性值" />
          </template>
        </el-form-item>
        <el-form-item label="是否必填" prop="required">
          <el-switch v-model="attributeForm.required" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="attributeForm.sortOrder" :min="0" :step="1" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="attributeForm.description" type="textarea" placeholder="请输入属性描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  }
})

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

// 选项文本（用于编辑选项列表）
const optionsText = ref('')

// 表单数据
const attributeForm = reactive({
  attrId: null,
  bomId: props.bomId,
  attrCode: '',
  attrName: '',
  attrType: 'string',
  attrValue: '',
  required: false,
  sortOrder: 0,
  description: '',
  options: []
})

// 表单验证规则
const rules = reactive({
  attrCode: [
    { required: true, message: '属性编码不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '属性编码只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  attrName: [
    { required: true, message: '属性名称不能为空', trigger: 'blur' }
  ],
  attrType: [
    { required: true, message: '请选择属性类型', trigger: 'change' }
  ]
})

// 获取属性类型名称
const getAttributeTypeName = (type) => {
  const typeMap = {
    string: '文本',
    number: '数字',
    boolean: '布尔值',
    date: '日期',
    select: '下拉选择'
  }
  return typeMap[type] || type
}

// 获取属性类型标签样式
const getAttributeTypeTag = (type) => {
  const tagMap = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    date: 'info',
    select: 'danger'
  }
  return tagMap[type] || 'default'
}

// 加载属性列表
const loadAttributeList = () => {
  loading.value = true
  
  // 模拟数据加载
  setTimeout(() => {
    attributeList.value = [
      {
        attrId: 1,
        bomId: props.bomId,
        attrCode: 'color',
        attrName: '颜色',
        attrType: 'select',
        attrValue: 'red',
        required: true,
        sortOrder: 1,
        description: '产品颜色',
        options: [
          { value: 'red', label: '红色' },
          { value: 'blue', label: '蓝色' },
          { value: 'green', label: '绿色' }
        ]
      },
      {
        attrId: 2,
        bomId: props.bomId,
        attrCode: 'weight',
        attrName: '重量',
        attrType: 'number',
        attrValue: 100,
        required: false,
        sortOrder: 2,
        description: '产品重量（g）'
      },
      {
        attrId: 3,
        bomId: props.bomId,
        attrCode: 'is_active',
        attrName: '是否激活',
        attrType: 'boolean',
        attrValue: true,
        required: false,
        sortOrder: 3,
        description: '产品是否激活'
      },
      {
        attrId: 4,
        bomId: props.bomId,
        attrCode: 'release_date',
        attrName: '发布日期',
        attrType: 'date',
        attrValue: '2023-01-01',
        required: true,
        sortOrder: 4,
        description: '产品发布日期'
      },
      {
        attrId: 5,
        bomId: props.bomId,
        attrCode: 'description',
        attrName: '产品描述',
        attrType: 'string',
        attrValue: '这是一个测试产品',
        required: false,
        sortOrder: 5,
        description: '产品详细描述'
      }
    ]
    loading.value = false
  }, 500)
}

// 处理属性类型变化
const handleAttrTypeChange = () => {
  // 清空属性值和选项
  attributeForm.attrValue = ''
  attributeForm.options = []
  optionsText.value = ''
  
  // 如果是布尔值，设置默认值为false
  if (attributeForm.attrType === 'boolean') {
    attributeForm.attrValue = false
  }
}

// 处理选项文本变化
const updateOptionsFromText = () => {
  if (!optionsText.value) {
    attributeForm.options = []
    return
  }
  
  const options = optionsText.value.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      const parts = line.split('=')
      if (parts.length === 2) {
        return {
          value: parts[0].trim(),
          label: parts[1].trim()
        }
      }
      return {
        value: line,
        label: line
      }
    })
  
  attributeForm.options = options
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
  // 复制行数据到表单
  Object.assign(attributeForm, { ...row })
  
  // 处理选项文本
  if (row.attrType === 'select' && row.options && row.options.length > 0) {
    optionsText.value = row.options.map(option => `${option.value}=${option.label}`).join('\n')
  } else {
    optionsText.value = ''
  }
  
  dialogTitle.value = '编辑属性'
  dialogVisible.value = true
}

// 删除属性
const handleDeleteAttribute = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性 "${row.attrName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中替换为真实API调用
    // await deleteAttribute(row.attrId)
    
    // 模拟删除成功
    attributeList.value = attributeList.value.filter(item => item.attrId !== row.attrId)
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
    
    const ids = selectedAttributes.value.map(item => item.attrId)
    // 实际项目中替换为真实API调用
    // await batchDeleteAttributes(ids)
    
    // 模拟删除成功
    attributeList.value = attributeList.value.filter(item => !ids.includes(item.attrId))
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
    // 更新选项列表
    if (attributeForm.attrType === 'select') {
      updateOptionsFromText()
    }
    
    await attributeFormRef.value.validate()
    
    if (attributeForm.attrId) {
      // 编辑模式
      // 实际项目中替换为真实API调用
      // await updateAttribute(attributeForm)
      
      // 模拟更新成功
      const index = attributeList.value.findIndex(item => item.attrId === attributeForm.attrId)
      if (index !== -1) {
        attributeList.value[index] = { ...attributeForm }
      }
      ElMessage.success('属性更新成功')
    } else {
      // 新增模式
      // 实际项目中替换为真实API调用
      // const res = await addAttribute(attributeForm)
      
      // 模拟新增成功
      const newAttribute = {
        ...attributeForm,
        attrId: Date.now()
      }
      attributeList.value.push(newAttribute)
      ElMessage.success('属性新增成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交属性表单失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  attributeForm.attrId = null
  attributeForm.attrCode = ''
  attributeForm.attrName = ''
  attributeForm.attrType = 'string'
  attributeForm.attrValue = ''
  attributeForm.required = false
  attributeForm.sortOrder = 0
  attributeForm.description = ''
  attributeForm.options = []
  optionsText.value = ''
  
  attributeFormRef.value?.resetFields()
}

// 组件挂载时加载数据
onMounted(() => {
  loadAttributeList()
})
</script>

<style scoped>
.bom-dynamic-attributes {
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

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  white-space: pre-line;
}
</style>