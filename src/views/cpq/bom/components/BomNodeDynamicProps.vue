<template>
  <div class="bom-node-dynamic-props">
    <div class="dynamic-props-header">
      <h4>动态属性管理</h4>
      <el-button type="primary" icon="Plus" @click="handleAddProp">新增动态属性</el-button>
    </div>
    
    <div class="dynamic-props-content">
      <el-table
        v-loading="loading"
        :data="dynamicPropsList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="propId" label="属性ID" width="120" />
        <el-table-column prop="propName" label="属性名称" width="180" />
        <el-table-column prop="propKey" label="属性键" width="180" />
        <el-table-column prop="propValue" label="属性值" width="180" />
        <el-table-column prop="propType" label="属性类型" width="120">
          <template #default="scope">
            <el-tag :type="getPropTypeTagType(scope.row.propType)">
              {{ getPropTypeName(scope.row.propType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" icon="Edit" @click="handleEditProp(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" icon="Delete" @click="handleDeleteProp(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="table-footer">
        <div class="selection-actions" v-if="selectedProps.length > 0">
          <el-button type="danger" icon="Delete" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 新增/编辑动态属性对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="propFormRef" :model="propForm" :rules="rules" label-width="120px">
        <el-form-item label="属性名称" prop="propName">
          <el-input v-model="propForm.propName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性键" prop="propKey">
          <el-input v-model="propForm.propKey" placeholder="请输入属性键" />
        </el-form-item>
        <el-form-item label="属性值" prop="propValue">
          <el-input v-model="propForm.propValue" placeholder="请输入属性值" />
        </el-form-item>
        <el-form-item label="属性类型" prop="propType">
          <el-select v-model="propForm.propType" placeholder="请选择属性类型">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="数组" value="array" />
            <el-option label="对象" value="object" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="propForm.status" placeholder="请选择状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="propForm.priority" :min="1" :max="10" :step="1" placeholder="请输入优先级" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="propForm.description" type="textarea" placeholder="请输入属性描述" :rows="3" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    default: null
  }
})

// 加载状态
const loading = ref(false)

// 动态属性列表
const dynamicPropsList = ref([])

// 选中的属性
const selectedProps = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增动态属性')

// 表单引用
const propFormRef = ref(null)

// 表单数据
const propForm = reactive({
  propId: null,
  bomId: props.bomId,
  bomStructureId: props.bomStructureId,
  propName: '',
  propKey: '',
  propValue: '',
  propType: 'string',
  status: 'enabled',
  priority: 0,
  description: ''
})

// 表单验证规则
const rules = reactive({
  propName: [
    { required: true, message: '属性名称不能为空', trigger: 'blur' }
  ],
  propKey: [
    { required: true, message: '属性键不能为空', trigger: 'blur' }
  ],
  propType: [
    { required: true, message: '请选择属性类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '优先级必须在1-10之间', trigger: 'blur' }
  ]
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取属性类型名称
const getPropTypeName = (type) => {
  const typeMap = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    array: '数组',
    object: '对象'
  }
  return typeMap[type] || type
}

// 获取属性类型标签样式
const getPropTypeTagType = (type) => {
  const typeMap = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    array: 'info',
    object: 'danger'
  }
  return typeMap[type] || 'primary'
}

// 加载动态属性数据
const loadDynamicProps = () => {
  loading.value = true
  
  // 模拟数据加载
  setTimeout(() => {
    dynamicPropsList.value = [
      {
        propId: 1,
        bomId: props.bomId,
        bomStructureId: props.bomStructureId || 1,
        propName: '颜色',
        propKey: 'color',
        propValue: '红色',
        propType: 'string',
        status: 'enabled',
        priority: 1,
        description: '产品颜色'
      },
      {
        propId: 2,
        bomId: props.bomId,
        bomStructureId: props.bomStructureId || 1,
        propName: '尺寸',
        propKey: 'size',
        propValue: 'M',
        propType: 'string',
        status: 'enabled',
        priority: 2,
        description: '产品尺寸'
      },
      {
        propId: 3,
        bomId: props.bomId,
        bomStructureId: props.bomStructureId || 1,
        propName: '重量',
        propKey: 'weight',
        propValue: '1.5',
        propType: 'number',
        status: 'enabled',
        priority: 3,
        description: '产品重量'
      }
    ]
    loading.value = false
  }, 500)
}

// 监听节点ID变化
watch(() => props.bomStructureId, (newBomStructureId) => {
  propForm.bomStructureId = newBomStructureId
  loadDynamicProps()
})

// 新增动态属性
const handleAddProp = () => {
  resetForm()
  dialogTitle.value = '新增动态属性'
  dialogVisible.value = true
}

// 编辑动态属性
const handleEditProp = (row) => {
  Object.assign(propForm, { ...row })
  dialogTitle.value = '编辑动态属性'
  dialogVisible.value = true
}

// 删除动态属性
const handleDeleteProp = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除动态属性 "${row.propName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中替换为真实API调用
    // await deleteDynamicProp(row.propId)
    
    // 模拟删除成功
    const index = dynamicPropsList.value.findIndex(prop => prop.propId === row.propId)
    if (index !== -1) {
      dynamicPropsList.value.splice(index, 1)
      pagination.total = dynamicPropsList.value.length
      ElMessage.success('动态属性删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除动态属性失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedProps.value.length === 0) {
    ElMessage.warning('请选择要删除的动态属性')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedProps.value.length} 个动态属性吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中替换为真实API调用
    // await batchDeleteDynamicProps(selectedProps.value.map(prop => prop.propId))
    
    // 模拟批量删除成功
    const propIds = selectedProps.value.map(prop => prop.propId)
    dynamicPropsList.value = dynamicPropsList.value.filter(prop => !propIds.includes(prop.propId))
    pagination.total = dynamicPropsList.value.length
    selectedProps.value = []
    ElMessage.success('动态属性批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除动态属性失败:', error)
    }
  }
}

// 状态变更
const handleStatusChange = (row) => {
  // 实际项目中替换为真实API调用
  // await updateDynamicPropStatus(row.propId, row.status)
  
  // 模拟更新成功
  ElMessage.success(`动态属性状态已更新为${row.status === 'enabled' ? '启用' : '禁用'}`)
}

// 对话框提交
const handleDialogSubmit = async () => {
  try {
    await propFormRef.value.validate()
    
    if (propForm.propId) {
      // 编辑模式
      // 实际项目中替换为真实API调用
      // await updateDynamicProp(propForm)
      
      // 模拟更新成功
      const index = dynamicPropsList.value.findIndex(prop => prop.propId === propForm.propId)
      if (index !== -1) {
        dynamicPropsList.value[index] = { ...propForm }
      }
      ElMessage.success('动态属性更新成功')
    } else {
      // 新增模式
      // 实际项目中替换为真实API调用
      // const res = await addDynamicProp(propForm)
      
      // 模拟新增成功
      const newProp = {
        ...propForm,
        propId: Date.now()
      }
      dynamicPropsList.value.unshift(newProp)
      pagination.total = dynamicPropsList.value.length
      ElMessage.success('动态属性新增成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交动态属性表单失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  propForm.propId = null
  propForm.propName = ''
  propForm.propKey = ''
  propForm.propValue = ''
  propForm.propType = 'string'
  propForm.status = 'enabled'
  propForm.priority = 1
  propForm.description = ''
  
  propFormRef.value?.resetFields()
}

// 选中项变化
const handleSelectionChange = (selection) => {
  selectedProps.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadDynamicProps()
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current
  loadDynamicProps()
}

// 组件挂载时
onMounted(() => {
  loadDynamicProps()
})
</script>

<style scoped>
.bom-node-dynamic-props {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.dynamic-props-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dynamic-props-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.dynamic-props-content {
  background-color: #fff;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.selection-actions {
  display: flex;
  gap: 10px;
}
</style>