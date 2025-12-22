<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="方案名称" prop="solutionName">
          <el-input
            v-model="queryParams.solutionName"
            placeholder="请输入方案名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="方案状态" prop="solutionStatus">
          <el-select
            v-model="queryParams.solutionStatus"
            placeholder="请选择方案状态"
            clearable
            size="small"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已失效" value="expired" />
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
          新增方案
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
      <el-col :span="21">
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

    <el-table v-loading="loading" :data="solutionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="方案编码" align="center" prop="solutionCode" />
      <el-table-column label="方案名称" align="center" prop="solutionName" :show-overflow-tooltip="true" />
      <el-table-column label="方案状态" align="center" prop="solutionStatus">
        <template #default="scope">
          <el-tag :type="scope.row.solutionStatus === 'draft' ? 'info' : 
                     scope.row.solutionStatus === 'published' ? 'success' : 'danger'" size="small">
            {{ scope.row.solutionStatus === 'draft' ? '草稿' : 
               scope.row.solutionStatus === 'published' ? '已发布' : '已失效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="BOM数量" align="center" prop="bomCount" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="success"
            icon="DocumentAdd"
            @click="handleComponent(scope.row)"
          >
            组件管理
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >
            删除
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

    <!-- 解决方案配置对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="方案编码" prop="solutionCode">
          <el-input v-model="form.solutionCode" placeholder="请输入方案编码" />
        </el-form-item>
        <el-form-item label="方案名称" prop="solutionName">
          <el-input v-model="form.solutionName" placeholder="请输入方案名称" />
        </el-form-item>
        <el-form-item label="方案描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入方案描述" :rows="3" />
        </el-form-item>
        <el-form-item label="方案状态" prop="solutionStatus">
          <el-select v-model="form.solutionStatus" placeholder="请选择方案状态">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已失效" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联BOM" prop="bomId">
          <el-select v-model="form.bomId" placeholder="请选择关联的超级BOM">
            <el-option label="BOM-001" value="1" />
            <el-option label="BOM-002" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联规则" prop="ruleIds">
          <el-select v-model="form.ruleIds" multiple placeholder="请选择关联的配置规则">
            <el-option label="规则-001" value="1" />
            <el-option label="规则-002" value="2" />
            <el-option label="规则-003" value="3" />
          </el-select>
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
import { listSolution, addSolution, updateSolution, deleteSolution } from '@/api/cpq/solution'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const solutionList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  solutionName: '',
  solutionStatus: ''
})

const form = reactive({
  solutionId: null,
  solutionCode: '',
  solutionName: '',
  description: '',
  solutionStatus: 'draft',
  bomId: '',
  ruleIds: []
})

const rules = reactive({
  solutionCode: [{ required: true, message: '方案编码不能为空', trigger: 'blur' }],
  solutionName: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
  solutionStatus: [{ required: true, message: '方案状态不能为空', trigger: 'change' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listSolution(queryParams)
    solutionList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取解决方案列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.solutionName = ''
  queryParams.solutionStatus = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.solutionId = null
  form.solutionCode = ''
  form.solutionName = ''
  form.description = ''
  form.solutionStatus = 'draft'
  form.bomId = ''
  form.ruleIds = []
  title.value = '新增解决方案'
  open.value = true
}

const handleUpdate = (row) => {
  form.solutionId = row.solutionId
  form.solutionCode = row.solutionCode
  form.solutionName = row.solutionName
  form.description = row.description
  form.solutionStatus = row.solutionStatus
  form.bomId = row.bomId
  form.ruleIds = row.ruleIds
  title.value = '修改解决方案'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.solutionId ? [row.solutionId] : multipleSelection.value.map(item => item.solutionId)
  await ElMessageBox.confirm('确定要删除选中的解决方案吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteSolution(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleComponent = (row) => {
  // 跳转到方案组件管理页面
  router.push({
    path: '/cpq/solution/component',
    query: { solutionId: row.solutionId, solutionName: row.solutionName }
  })
}

const submitForm = async () => {
  await validate(form, rules)
  try {
    if (form.solutionId) {
      await updateSolution(form)
      ElMessage.success('修改成功')
    } else {
      await addSolution(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const cancel = () => {
  open.value = false
  resetForm()
}

onMounted(() => {
  getList()
})
</script>
