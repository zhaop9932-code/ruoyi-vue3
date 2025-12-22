<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="策略编码" prop="strategyCode">
          <el-input
            v-model="queryParams.strategyCode"
            placeholder="请输入策略编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="策略名称" prop="strategyName">
          <el-input
            v-model="queryParams.strategyName"
            placeholder="请输入策略名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="策略类型" prop="strategyType">
          <el-select
            v-model="queryParams.strategyType"
            placeholder="请选择策略类型"
            clearable
            size="small"
          >
            <el-option label="成本加成" value="cost_plus" />
            <el-option label="市场定价" value="market" />
            <el-option label="需求定价" value="demand" />
            <el-option label="竞争定价" value="competition" />
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

    <el-table v-loading="loading" :data="strategyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="策略编码" align="center" prop="strategyCode" />
      <el-table-column label="策略名称" align="center" prop="strategyName" :show-overflow-tooltip="true" />
      <el-table-column label="策略类型" align="center" prop="strategyType">
        <template #default="scope">
          <el-tag :type="scope.row.strategyType === 'cost_plus' ? 'primary' : 
                     scope.row.strategyType === 'market' ? 'success' : 
                     scope.row.strategyType === 'demand' ? 'warning' : 'info'" size="small">
            {{ scope.row.strategyType === 'cost_plus' ? '成本加成' : 
               scope.row.strategyType === 'market' ? '市场定价' : 
               scope.row.strategyType === 'demand' ? '需求定价' : '竞争定价' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
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

    <!-- 定价策略配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="策略编码" prop="strategyCode">
          <el-input v-model="form.strategyCode" placeholder="请输入策略编码" />
        </el-form-item>
        <el-form-item label="策略名称" prop="strategyName">
          <el-input v-model="form.strategyName" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="策略类型" prop="strategyType">
          <el-select v-model="form.strategyType" placeholder="请选择策略类型">
            <el-option label="成本加成" value="cost_plus" />
            <el-option label="市场定价" value="market" />
            <el-option label="需求定价" value="demand" />
            <el-option label="竞争定价" value="competition" />
          </el-select>
        </el-form-item>
        <el-form-item label="策略配置" prop="strategyConfig">
          <el-input v-model="form.strategyConfig" type="textarea" placeholder="请输入策略配置（JSON格式）" :rows="4" />
        </el-form-item>
        <el-form-item label="策略描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入策略描述" :rows="3" />
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
import { listPricingStrategy, addPricingStrategy, updatePricingStrategy, deletePricingStrategy } from '@/api/cpq/pricing'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const strategyList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  strategyCode: '',
  strategyName: '',
  strategyType: ''
})

const form = reactive({
  strategyId: null,
  strategyCode: '',
  strategyName: '',
  strategyType: 'cost_plus',
  strategyConfig: '',
  description: ''
})

const rules = reactive({
  strategyCode: [{ required: true, message: '策略编码不能为空', trigger: 'blur' }],
  strategyName: [{ required: true, message: '策略名称不能为空', trigger: 'blur' }],
  strategyType: [{ required: true, message: '策略类型不能为空', trigger: 'change' }],
  strategyConfig: [{ required: true, message: '策略配置不能为空', trigger: 'blur' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listPricingStrategy(queryParams)
    strategyList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取定价策略列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.strategyCode = ''
  queryParams.strategyName = ''
  queryParams.strategyType = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.strategyId = null
  form.strategyCode = ''
  form.strategyName = ''
  form.strategyType = 'cost_plus'
  form.strategyConfig = ''
  form.description = ''
  title.value = '新增定价策略'
  open.value = true
}

const handleUpdate = (row) => {
  form.strategyId = row.strategyId
  form.strategyCode = row.strategyCode
  form.strategyName = row.strategyName
  form.strategyType = row.strategyType
  form.strategyConfig = row.strategyConfig
  form.description = row.description
  title.value = '修改定价策略'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.strategyId ? [row.strategyId] : multipleSelection.value.map(item => item.strategyId)
  await ElMessageBox.confirm('确定要删除选中的定价策略吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deletePricingStrategy(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitForm = async () => {
  await validate(form, rules)
  try {
    if (form.strategyId) {
      await updatePricingStrategy(form)
      ElMessage.success('修改成功')
    } else {
      await addPricingStrategy(form)
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
