<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="规则编码" prop="ruleCode">
          <el-input
            v-model="queryParams.ruleCode"
            placeholder="请输入规则编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input
            v-model="queryParams.ruleName"
            placeholder="请输入规则名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-select
            v-model="queryParams.ruleType"
            placeholder="请选择规则类型"
            clearable
            size="small"
          >
            <el-option label="条件规则" value="condition" />
            <el-option label="动作规则" value="action" />
            <el-option label="验证规则" value="validation" />
            <el-option label="计算规则" value="calculation" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态" prop="ruleStatus">
          <el-select
            v-model="queryParams.ruleStatus"
            placeholder="请选择规则状态"
            clearable
            size="small"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="RefreshRight" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multipleSelection.length === 0"
          @click="handleDelete"
        >
          批量删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="Download"
          size="small"
          @click="handleExport"
        >
          导出
        </el-button>
      </el-col>
      <el-col :span="20.5">
        <el-button
          type="info"
          icon="Search"
          size="small"
          @click="toggleSearch"
          style="float: right;"
        >
          {{ showSearch ? '收起' : '展开' }}搜索
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="ruleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则编码" align="center" prop="ruleCode" />
      <el-table-column label="规则名称" align="center" prop="ruleName" :show-overflow-tooltip="true" />
      <el-table-column label="规则类型" align="center" prop="ruleType">
        <template #default="scope">
          <el-tag :type="scope.row.ruleType === 'condition' ? 'primary' : 
                     scope.row.ruleType === 'action' ? 'success' : 
                     scope.row.ruleType === 'validation' ? 'warning' : 'info'" size="small">
            {{ scope.row.ruleType === 'condition' ? '条件规则' : 
               scope.row.ruleType === 'action' ? '动作规则' : 
               scope.row.ruleType === 'validation' ? '验证规则' : '计算规则' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="条件类型" align="center" prop="conditionType" />
      <el-table-column label="动作类型" align="center" prop="actionType" />
      <el-table-column label="优先级" align="center" prop="rulePriority" />
      <el-table-column label="规则状态" align="center" prop="ruleStatus">
        <template #default="scope">
          <el-tag :type="scope.row.ruleStatus === '1' ? 'success' : 'danger'" size="small">
            {{ scope.row.ruleStatus === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
          <el-button
            size="small"
            type="success"
            icon="PlayCircle"
            @click="handleTestRule(scope.row)"
          >
            测试
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 规则配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="规则编码" prop="ruleCode">
          <el-input v-model="form.ruleCode" placeholder="请输入规则编码" />
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="form.ruleType" placeholder="请选择规则类型">
            <el-option label="条件规则" value="condition" />
            <el-option label="动作规则" value="action" />
            <el-option label="验证规则" value="validation" />
            <el-option label="计算规则" value="calculation" />
          </el-select>
        </el-form-item>
        <el-form-item label="条件类型" prop="conditionType">
          <el-select v-model="form.conditionType" placeholder="请选择条件类型">
            <el-option label="简单条件" value="simple" />
            <el-option label="复杂条件" value="complex" />
          </el-select>
        </el-form-item>
        <el-form-item label="条件配置" prop="conditionConfig">
          <el-input v-model="form.conditionConfig" type="textarea" placeholder="请输入条件配置（JSON格式）" :rows="4" />
        </el-form-item>
        <el-form-item label="动作类型" prop="actionType">
          <el-select v-model="form.actionType" placeholder="请选择动作类型">
            <el-option label="简单动作" value="simple" />
            <el-option label="复杂动作" value="complex" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作配置" prop="actionConfig">
          <el-input v-model="form.actionConfig" type="textarea" placeholder="请输入动作配置（JSON格式）" :rows="4" />
        </el-form-item>
        <el-form-item label="规则优先级" prop="rulePriority">
          <el-input-number v-model="form.rulePriority" :min="1" :step="1" />
        </el-form-item>
        <el-form-item label="规则状态" prop="ruleStatus">
          <el-radio-group v-model="form.ruleStatus">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="规则描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入规则描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { listConfigurationRule, addConfigurationRule, updateConfigurationRule, deleteConfigurationRule, checkRuleCodeUnique } from '@/api/cpq/rule'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const ruleList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const queryForm = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ruleCode: '',
  ruleName: '',
  ruleType: '',
  ruleStatus: ''
})

const form = reactive({
  ruleId: null,
  ruleCode: '',
  ruleName: '',
  ruleType: 'condition',
  conditionType: 'simple',
  conditionConfig: '',
  actionType: 'simple',
  actionConfig: '',
  rulePriority: 1,
  effectiveDate: '',
  expireDate: '',
  ruleStatus: '1',
  description: ''
})

const rules = reactive({
  ruleCode: [{ required: true, message: '规则编码不能为空', trigger: 'blur' }],
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  ruleType: [{ required: true, message: '规则类型不能为空', trigger: 'change' }],
  conditionType: [{ required: true, message: '条件类型不能为空', trigger: 'change' }],
  conditionConfig: [{ required: true, message: '条件配置不能为空', trigger: 'blur' }],
  actionType: [{ required: true, message: '动作类型不能为空', trigger: 'change' }],
  actionConfig: [{ required: true, message: '动作配置不能为空', trigger: 'blur' }],
  rulePriority: [{ required: true, message: '规则优先级不能为空', trigger: 'blur' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listConfigurationRule(queryParams)
    ruleList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取规则列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.ruleCode = ''
  queryParams.ruleName = ''
  queryParams.ruleType = ''
  queryParams.ruleStatus = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.ruleId = null
  form.ruleCode = ''
  form.ruleName = ''
  form.ruleType = 'condition'
  form.conditionType = 'simple'
  form.conditionConfig = ''
  form.actionType = 'simple'
  form.actionConfig = ''
  form.rulePriority = 1
  form.effectiveDate = ''
  form.expireDate = ''
  form.ruleStatus = '1'
  form.description = ''
  title.value = '新增配置规则'
  open.value = true
}

const handleUpdate = (row) => {
  form.ruleId = row.ruleId
  form.ruleCode = row.ruleCode
  form.ruleName = row.ruleName
  form.ruleType = row.ruleType
  form.conditionType = row.conditionType
  form.conditionConfig = row.conditionConfig
  form.actionType = row.actionType
  form.actionConfig = row.actionConfig
  form.rulePriority = row.rulePriority
  form.effectiveDate = row.effectiveDate
  form.expireDate = row.expireDate
  form.ruleStatus = row.ruleStatus
  form.description = row.description
  title.value = '修改配置规则'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.ruleId ? [row.ruleId] : multipleSelection.value.map(item => item.ruleId)
  await ElMessageBox.confirm('确定要删除选中的规则吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteConfigurationRule(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleTestRule = (row) => {
  // 实现规则测试功能
  ElMessage.info('规则测试功能待实现')
}

const submitForm = async () => {
  await formRef.value.validate()
  try {
    if (form.ruleId) {
      await updateConfigurationRule(form)
      ElMessage.success('修改成功')
    } else {
      await addConfigurationRule(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const cancel = () => {
  open.value = false
  resetForm()
}

onMounted(() => {
  getList()
})
</script>
