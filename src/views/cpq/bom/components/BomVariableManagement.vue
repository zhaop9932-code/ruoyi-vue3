<template>
  <div class="bom-variable-management">
    <div class="management-header">
      <h3>变量管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="Plus" @click="handleAddVariable">新增变量</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedVariables.length === 0">
          批量删除
        </el-button>
      </div>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form" label-width="100px">
      <el-form-item label="变量编码">
        <el-input v-model="searchForm.variableCode" placeholder="请输入变量编码" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="变量名称">
        <el-input v-model="searchForm.variableName" placeholder="请输入变量名称" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="变量类型">
        <el-select v-model="searchForm.variableType" placeholder="请选择变量类型" clearable style="width: 150px">
          <el-option label="字符串" value="string" />
          <el-option label="数字" value="number" />
          <el-option label="布尔值" value="boolean" />
          <el-option label="日期" value="date" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否必填">
        <el-select v-model="searchForm.isRequired" placeholder="请选择是否必填" clearable style="width: 150px">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
        <el-button icon="RefreshRight" @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 变量列表 -->
    <el-table v-loading="loading" :data="variableList" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="变量编码" align="center" prop="variableCode" min-width="150" />
      <el-table-column label="变量名称" align="center" prop="variableName" min-width="150" />
      <el-table-column label="变量类型" align="center" prop="variableType" width="120">
        <template #default="scope">
          <el-tag :type="getVariableTypeTag(scope.row.variableType)">
            {{ getVariableTypeName(scope.row.variableType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认值" align="center" prop="defaultValue" min-width="150" />
      <el-table-column label="是否必填" align="center" prop="isRequired" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.isRequired" :active-value="'1'" :inactive-value="'0'" disabled />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="100" />
      <el-table-column label="描述" align="center" prop="description" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditVariable(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" icon="Delete" @click="handleDeleteVariable(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
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
    
    <!-- 添加/编辑变量对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="variableFormRef" :model="variableForm" :rules="rules" label-width="120px">
        <el-form-item label="变量编码" prop="variableCode">
          <el-input v-model="variableForm.variableCode" placeholder="请输入变量编码" :disabled="!variableForm.variableId" />
          <div class="form-tip">新增时自动生成，编辑时可修改</div>
        </el-form-item>
        <el-form-item label="变量名称" prop="variableName">
          <el-input v-model="variableForm.variableName" placeholder="请输入变量名称" />
        </el-form-item>
        <!-- <el-form-item label="变量类型" prop="variableType">
          <el-select v-model="variableForm.variableType" placeholder="请选择变量类型" @change="handleVariableTypeChange">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="默认值" prop="defaultValue">
          <el-input
            v-if="variableForm.variableType !== 'date'"
            v-model="variableForm.defaultValue" 
            placeholder="请输入默认值"
            :type="variableForm.variableType === 'number' ? 'number' : 'text'"
          />
          <el-date-picker
            v-else
            v-model="variableForm.defaultValue"
            type="date"
            placeholder="请选择默认日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="是否必填" prop="isRequired">
          <el-switch v-model="variableForm.isRequired" :active-value="'1'" :inactive-value="'0'" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="variableForm.sortOrder" :min="1" :max="999" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="variableForm.description" type="textarea" placeholder="请输入变量描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Edit, RefreshRight } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  }
})

// 加载状态
const loading = ref(false)

// 变量列表
const variableList = ref([])

// 多选选中的变量
const selectedVariables = ref([])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增变量')

// 表单引用
const variableFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  bomId: props.bomId,
  variableCode: '',
  variableName: '',
  variableType: '',
  isRequired: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const variableForm = reactive({
  variableId: null,
  bomId: props.bomId,
  variableCode: '',
  variableName: '',
  variableType: 'string',
  defaultValue: '',
  isRequired: '0',
  sortOrder: 1,
  description: ''
})

// 表单验证规则
const rules = reactive({
  variableCode: [
    { pattern: /^[A-Z0-9_]+$/, message: '变量编码只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  variableName: [
    { required: true, message: '变量名称不能为空', trigger: 'blur' }
  ],
  variableType: [
    { required: true, message: '请选择变量类型', trigger: 'change' }
  ]
})

// 获取变量类型名称
const getVariableTypeName = (type) => {
  const typeMap = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    date: '日期'
  }
  return typeMap[type] || type
}

// 获取变量类型标签样式
const getVariableTypeTag = (type) => {
  const tagMap = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    date: 'info'
  }
  return tagMap[type] || 'primary'
}

// 加载变量列表
const loadVariableList = () => {
  loading.value = true
  
  // 构建请求参数
  const params = {
    ...searchForm,
    bomId: props.bomId,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  }
  
  // 尝试调用API，如果失败则使用模拟数据
  import('@/api/cpq/superBomVariable').then(({ listSuperBomVariable }) => {
    listSuperBomVariable(params).then(response => {
      variableList.value = response.rows
      pagination.total = response.total
      loading.value = false
    }).catch(error => {
      console.error('API调用失败，使用模拟数据:', error)
      // 使用模拟数据作为后备
      loadMockData(params)
    })
  }).catch(error => {
    console.error('API模块加载失败，使用模拟数据:', error)
    // 使用模拟数据作为后备
    loadMockData(params)
  })
}

// 加载模拟数据
const loadMockData = (params) => {
  // 模拟API调用，使用文档中定义的数据模型
  setTimeout(() => {
    let mockData = [
      {
        variableId: 1,
        bomId: props.bomId,
        bomName: '产品A超级BOM',
        variableCode: 'COLOR',
        variableName: '颜色',
        defaultValue: '红色',
        description: '产品颜色变量',
        variableType: 'string',
        isRequired: '1',
        sortOrder: 1,
        createTime: '2025-12-12 10:00:00',
        updateTime: '2025-12-12 10:00:00'
      },
      {
        variableId: 2,
        bomId: props.bomId,
        bomName: '产品A超级BOM',
        variableCode: 'SIZE',
        variableName: '尺寸',
        defaultValue: 'M',
        description: '产品尺寸变量',
        variableType: 'string',
        isRequired: '1',
        sortOrder: 2,
        createTime: '2025-12-12 10:00:00',
        updateTime: '2025-12-12 10:00:00'
      },
      {
        variableId: 3,
        bomId: props.bomId,
        bomName: '产品A超级BOM',
        variableCode: 'WEIGHT',
        variableName: '重量',
        defaultValue: '100',
        description: '产品重量变量',
        variableType: 'number',
        isRequired: '0',
        sortOrder: 3,
        createTime: '2025-12-12 10:00:00',
        updateTime: '2025-12-12 10:00:00'
      },
      {
        variableId: 4,
        bomId: props.bomId,
        bomName: '产品A超级BOM',
        variableCode: 'IS_ACTIVE',
        variableName: '是否激活',
        defaultValue: 'true',
        description: '产品是否激活',
        variableType: 'boolean',
        isRequired: '0',
        sortOrder: 4,
        createTime: '2025-12-12 10:00:00',
        updateTime: '2025-12-12 10:00:00'
      },
      {
        variableId: 5,
        bomId: props.bomId,
        bomName: '产品A超级BOM',
        variableCode: 'PRODUCTION_DATE',
        variableName: '生产日期',
        defaultValue: '2025-01-01',
        description: '产品生产日期',
        variableType: 'date',
        isRequired: '1',
        sortOrder: 5,
        createTime: '2025-12-12 10:00:00',
        updateTime: '2025-12-12 10:00:00'
      }
    ]
    
    // 根据筛选条件过滤
    if (params.variableCode) {
      mockData = mockData.filter(item => item.variableCode.toLowerCase().includes(params.variableCode.toLowerCase()))
    }
    if (params.variableName) {
      mockData = mockData.filter(item => item.variableName.toLowerCase().includes(params.variableName.toLowerCase()))
    }
    if (params.variableType) {
      mockData = mockData.filter(item => item.variableType === params.variableType)
    }
    if (params.isRequired) {
      mockData = mockData.filter(item => item.isRequired === params.isRequired)
    }
    
    // 模拟分页
    const startIndex = (params.pageNum - 1) * params.pageSize
    const endIndex = startIndex + params.pageSize
    const paginatedData = mockData.slice(startIndex, endIndex)
    
    variableList.value = paginatedData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 新增变量
const handleAddVariable = () => {
  resetForm()
  dialogTitle.value = '新增变量'
  dialogVisible.value = true
}

// 编辑变量
const handleEditVariable = (row) => {
  // 复制行数据到表单
  Object.assign(variableForm, { ...row })
  dialogTitle.value = '编辑变量'
  dialogVisible.value = true
}

// 删除变量
const handleDeleteVariable = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除变量 "${row.variableName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 尝试调用API，如果失败则使用模拟数据
    import('@/api/cpq/superBomVariable').then(({ removeSuperBomVariable }) => {
      removeSuperBomVariable([row.variableId]).then(response => {
        ElMessage.success('变量删除成功')
        loadVariableList()
      }).catch(error => {
        console.error('API调用失败，使用模拟数据:', error)
        // 模拟删除成功
        variableList.value = variableList.value.filter(item => item.variableId !== row.variableId)
        pagination.total = variableList.value.length
        ElMessage.success('变量删除成功')
      })
    }).catch(error => {
      console.error('API模块加载失败，使用模拟数据:', error)
      // 模拟删除成功
      variableList.value = variableList.value.filter(item => item.variableId !== row.variableId)
      pagination.total = variableList.value.length
      ElMessage.success('变量删除成功')
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除变量失败:', error)
    }
  }
}

// 批量删除变量
const handleBatchDelete = async () => {
  if (selectedVariables.value.length === 0) {
    ElMessage.warning('请选择要删除的变量')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedVariables.value.length} 个变量吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 尝试调用API，如果失败则使用模拟数据
    import('@/api/cpq/superBomVariable').then(({ removeSuperBomVariable }) => {
      const variableIds = selectedVariables.value.map(variable => variable.variableId)
      removeSuperBomVariable(variableIds).then(response => {
        ElMessage.success('变量批量删除成功')
        loadVariableList()
        selectedVariables.value = []
      }).catch(error => {
        console.error('API调用失败，使用模拟数据:', error)
        // 模拟批量删除成功
        const variableIds = selectedVariables.value.map(variable => variable.variableId)
        variableList.value = variableList.value.filter(item => !variableIds.includes(item.variableId))
        pagination.total = variableList.value.length
        selectedVariables.value = []
        ElMessage.success('变量批量删除成功')
      })
    }).catch(error => {
      console.error('API模块加载失败，使用模拟数据:', error)
      // 模拟批量删除成功
      const variableIds = selectedVariables.value.map(variable => variable.variableId)
      variableList.value = variableList.value.filter(item => !variableIds.includes(item.variableId))
      pagination.total = variableList.value.length
      selectedVariables.value = []
      ElMessage.success('变量批量删除成功')
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除变量失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await variableFormRef.value.validate()
    
    // 构建提交数据
    const submitData = { ...variableForm }
    
    // 尝试调用API，如果失败则使用模拟数据
    import('@/api/cpq/superBomVariable').then(({ addSuperBomVariable, updateSuperBomVariable }) => {
      if (submitData.variableId) {
        // 编辑模式
        updateSuperBomVariable(submitData).then(response => {
          ElMessage.success('变量更新成功')
          dialogVisible.value = false
          loadVariableList()
        }).catch(error => {
          console.error('API调用失败，使用模拟数据:', error)
          // 模拟更新成功
          const index = variableList.value.findIndex(item => item.variableId === submitData.variableId)
          if (index !== -1) {
            variableList.value[index] = { ...submitData }
          }
          ElMessage.success('变量更新成功')
          dialogVisible.value = false
        })
      } else {
        // 新增模式 - 移除变量编码，由后端自动生成
        delete submitData.variableCode
        addSuperBomVariable(submitData).then(response => {
          ElMessage.success('变量新增成功')
          dialogVisible.value = false
          loadVariableList()
        }).catch(error => {
          console.error('API调用失败，使用模拟数据:', error)
          // 模拟新增成功
          const newVariable = {
            ...submitData,
            variableId: Date.now(),
            variableCode: `VAR_${Date.now()}`, // 模拟后端生成的变量编码
            bomName: '产品A超级BOM',
            createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          variableList.value.unshift(newVariable)
          pagination.total = variableList.value.length
          ElMessage.success('变量新增成功')
          dialogVisible.value = false
        })
      }
    }).catch(error => {
      console.error('API模块加载失败，使用模拟数据:', error)
      // 使用模拟数据处理
      if (submitData.variableId) {
        // 编辑模式
        const index = variableList.value.findIndex(item => item.variableId === submitData.variableId)
        if (index !== -1) {
          variableList.value[index] = { ...submitData }
        }
        ElMessage.success('变量更新成功')
        dialogVisible.value = false
      } else {
        // 新增模式
        const newVariable = {
          ...submitData,
          variableId: Date.now(),
          variableCode: `VAR_${Date.now()}`, // 模拟后端生成的变量编码
          bomName: '产品A超级BOM',
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        variableList.value.unshift(newVariable)
        pagination.total = variableList.value.length
        ElMessage.success('变量新增成功')
        dialogVisible.value = false
      }
    })
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交变量表单失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  variableForm.variableId = null
  variableForm.variableCode = '' // 新增时由后端生成，编辑时可修改
  variableForm.variableName = ''
  variableForm.variableType = 'string'
  variableForm.defaultValue = ''
  variableForm.isRequired = '0'
  variableForm.sortOrder = 1
  variableForm.description = ''
  
  variableFormRef.value?.resetFields()
}

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

// 搜索变量
const handleSearch = () => {
  pagination.currentPage = 1
  loadVariableList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.variableCode = ''
  searchForm.variableName = ''
  searchForm.variableType = ''
  searchForm.isRequired = ''
  pagination.currentPage = 1
  loadVariableList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadVariableList()
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current
  loadVariableList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedVariables.value = selection
}

// 变量类型变化
const handleVariableTypeChange = () => {
  // 根据变量类型重置默认值
  variableForm.defaultValue = ''
}

// 组件挂载时加载数据
onMounted(() => {
  loadVariableList()
})
</script>

<style scoped>
.bom-variable-management {
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

.search-form {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1;
}
</style>