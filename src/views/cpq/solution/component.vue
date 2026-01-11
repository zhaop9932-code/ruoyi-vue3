<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="组件编码" prop="componentCode">
          <el-input
            v-model="queryParams.componentCode"
            placeholder="请输入组件编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="组件名称" prop="componentName">
          <el-input
            v-model="queryParams.componentName"
            placeholder="请输入组件名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
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
          新增组件
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

    <el-table v-loading="loading" :data="componentList" @selection-change="handleSelectionChange" fit>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品编码" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.product?.productCode || scope.row.componentCode }}
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.product?.productName || scope.row.componentName }}
        </template>
      </el-table-column>
      <el-table-column label="Model" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.product?.productModel || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="quantity" />
      <el-table-column label="单价" align="center" prop="unitPrice" />
      <el-table-column label="金额" align="center" prop="amount" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
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
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 解决方案组件配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="型号选择" prop="productId">
          <el-select
            v-model="form.productId"
            placeholder="请选择型号"
            filterable
            remote
            reserve-keyword
            :remote-method="searchProducts"
            :loading="productLoading"
          >
            <el-option
              v-for="product in productOptions"
              :key="product.productId"
              :label="product.label"
              :value="product.productId"
            >
              <div>{{ product.label }}</div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0.01" :step="0.01" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number v-model="form.unitPrice" :min="0.01" :step="0.01" placeholder="请输入单价" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :step="0.01" placeholder="请输入金额" disabled />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  listSolutionComponent, 
  addSolutionComponent, 
  updateSolutionComponent, 
  deleteSolutionComponent 
} from '@/api/cpq/solution'
import { listProduct } from '@/api/cpq/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const componentList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const route = useRoute()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  componentCode: '',
  componentName: '',
  solutionId: route.query.solutionId || null
})

const form = reactive({
  componentId: null,
  solutionId: route.query.solutionId || null,
  productId: null,
  quantity: 1,
  unitPrice: 0,
  amount: 0
})

// 产品相关状态
const productOptions = ref([])
const productLoading = ref(false)
const productKeyword = ref('')

const rules = reactive({
  productId: [{ required: true, message: '产品不能为空', trigger: 'change' }],
  quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '单价不能为空', trigger: 'blur' }]
})

// 监听数量和单价变化，自动计算金额
watch(() => [form.quantity, form.unitPrice], ([newQuantity, newUnitPrice]) => {
  form.amount = newQuantity * newUnitPrice
})

// 远程搜索产品
const searchProducts = async (query = '') => {
  if (!query) {
    productOptions.value = []
    return
  }
  productLoading.value = true
  try {
    // 根据API要求，模糊查询只能使用一个参数，不能同时使用多个
    // 这里只使用productModel作为模糊查询参数，不传递其他模糊查询参数
    const res = await listProduct({
      productModel: query, // 使用productModel进行模糊查询
      pageNum: 1,
      pageSize: 10
    })
    productOptions.value = res.rows.map(product => ({
      productId: product.productId,
      label: `${product.productCode} / ${product.productName} / ${product.productModel}`,
      value: product.productId
    }))
  } catch (error) {
    ElMessage.error('获取产品列表失败')
  } finally {
    productLoading.value = false
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await listSolutionComponent(queryParams)
    componentList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取组件列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.componentCode = ''
  queryParams.componentName = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.componentId = null
  form.productId = null
  form.quantity = 1
  form.unitPrice = 0
  form.amount = 0
  title.value = '新增组件'
  open.value = true
}

const handleUpdate = (row) => {
  form.componentId = row.componentId
  form.solutionId = row.solutionId
  form.productId = row.productId
  form.quantity = row.quantity
  form.unitPrice = row.unitPrice
  form.amount = row.amount
  title.value = '修改组件'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.componentId ? [row.componentId] : multipleSelection.value.map(item => item.componentId)
  await ElMessageBox.confirm('确定要删除选中的组件吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteSolutionComponent(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    if (form.componentId) {
      await updateSolutionComponent(form)
      ElMessage.success('修改成功')
    } else {
      await addSolutionComponent(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const cancel = () => {
  open.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.mb8 {
  margin-bottom: 8px;
}

.small-padding {
  padding: 0 5px;
}

.fixed-width {
  width: 150px;
}
</style>