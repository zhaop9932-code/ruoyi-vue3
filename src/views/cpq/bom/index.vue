<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="BOM编码" prop="bomCode">
          <el-input
            v-model="queryParams.bomCode"
            placeholder="请输入BOM编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="BOM名称" prop="bomName">
          <el-input
            v-model="queryParams.bomName"
            placeholder="请输入BOM名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="BOM类型" prop="bomType">
          <el-select
            v-model="queryParams.bomType"
            placeholder="请选择BOM类型"
            clearable
            size="small"
          >
            <el-option label="模板" value="template" />
            <el-option label="实例" value="instance" />
            <el-option label="版本" value="version" />
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

    <el-table v-loading="loading" :data="superBomList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="BOM编码" align="center" prop="bomCode" />
      <el-table-column label="BOM名称" align="center" prop="bomName" :show-overflow-tooltip="true" />
      <el-table-column label="BOM类型" align="center" prop="bomType">
        <template #default="scope">
          <el-tag :type="scope.row.bomType === 'template' ? 'primary' : 
                     scope.row.bomType === 'instance' ? 'success' : 'warning'" size="small">
            {{ scope.row.bomType === 'template' ? '模板' : 
               scope.row.bomType === 'instance' ? '实例' : '版本' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="验证策略" align="center" prop="validationStrategy">
        <template #default="scope">
          <el-tag :type="scope.row.validationStrategy === 'strict' ? 'danger' : 
                     scope.row.validationStrategy === 'warning' ? 'warning' : 'success'" size="small">
            {{ scope.row.validationStrategy === 'strict' ? '严格验证' : 
               scope.row.validationStrategy === 'warning' ? '警告验证' : '无验证' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="规则引擎" align="center" prop="ruleEngineType" />
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
            type="info"
            icon="SetUp"
            @click="handleBomManage(scope.row)"
          >
            BOM管理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改超级BOM对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="BOM编码" prop="bomCode">
          <el-input v-model="form.bomCode" placeholder="请输入BOM编码" />
        </el-form-item>
        <el-form-item label="BOM名称" prop="bomName">
          <el-input v-model="form.bomName" placeholder="请输入BOM名称" />
        </el-form-item>
        <el-form-item label="BOM类型" prop="bomType">
          <el-select v-model="form.bomType" placeholder="请选择BOM类型">
            <el-option label="模板" value="template" />
            <el-option label="实例" value="instance" />
            <el-option label="版本" value="version" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证策略" prop="validationStrategy">
          <el-select v-model="form.validationStrategy" placeholder="请选择验证策略">
            <el-option label="严格验证" value="strict" />
            <el-option label="警告验证" value="warning" />
            <el-option label="无验证" value="none" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则引擎类型" prop="ruleEngineType">
          <el-select v-model="form.ruleEngineType" placeholder="请选择规则引擎类型">
            <el-option label="内置规则引擎" value="built-in" />
            <el-option label="Drools规则引擎" value="drools" />
            <el-option label="自定义规则引擎" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置模板" prop="configTemplate">
          <el-input v-model="form.configTemplate" type="textarea" placeholder="请输入配置模板" :rows="3" />
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
import { useRouter } from 'vue-router'
import { listSuperBom, addSuperBom, updateSuperBom, deleteSuperBom, checkBomCodeUnique } from '@/api/cpq/bom'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const superBomList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const queryForm = ref(null)
const router = useRouter()

const form = reactive({
  bomId: null,
  bomCode: '',
  bomName: '',
  bomType: 'template',
  bomRules: '',
  validationStrategy: 'strict',
  configTemplate: '',
  ruleEngineType: 'built-in'
})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  bomCode: '',
  bomName: '',
  bomType: ''
})

const rules = reactive({
  bomCode: [{ required: true, message: 'BOM编码不能为空', trigger: 'blur' }],
  bomName: [{ required: true, message: 'BOM名称不能为空', trigger: 'blur' }],
  bomType: [{ required: true, message: 'BOM类型不能为空', trigger: 'change' }],
  validationStrategy: [{ required: true, message: '验证策略不能为空', trigger: 'change' }],
  ruleEngineType: [{ required: true, message: '规则引擎类型不能为空', trigger: 'change' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listSuperBom(queryParams)
    superBomList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取超级BOM列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.bomCode = ''
  queryParams.bomName = ''
  queryParams.bomType = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.bomId = null
  form.bomCode = ''
  form.bomName = ''
  form.bomType = 'template'
  form.bomRules = ''
  form.validationStrategy = 'strict'
  form.configTemplate = ''
  form.ruleEngineType = 'built-in'
  title.value = '新增超级BOM'
  open.value = true
}

const handleUpdate = (row) => {
  form.bomId = row.bomId
  form.bomCode = row.bomCode
  form.bomName = row.bomName
  form.bomType = row.bomType
  form.bomRules = row.bomRules
  form.validationStrategy = row.validationStrategy
  form.configTemplate = row.configTemplate
  form.ruleEngineType = row.ruleEngineType
  title.value = '修改超级BOM'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.bomId ? [row.bomId] : multipleSelection.value.map(item => item.bomId)
  await ElMessageBox.confirm('确定要删除选中的超级BOM吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteSuperBom(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleBomManage = (row) => {
  // 跳转到BOM管理页面
  router.push({
    path: '/cpq/bom/manage',
    query: { bomId: row.bomId, bomName: row.bomName }
  })
}

const submitForm = async () => {
  await formRef.value.validate()
  try {
    // 构建bomRules JSON
    form.bomRules = JSON.stringify({
      validationStrategy: form.validationStrategy,
      ruleEngineType: form.ruleEngineType
    })
    
    if (form.bomId) {
      await updateSuperBom(form)
      ElMessage.success('修改成功')
    } else {
      await addSuperBom(form)
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
