<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="报价单号" prop="quoteNumber">
          <el-input
            v-model="queryParams.quoteNumber"
            placeholder="请输入报价单号"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input
            v-model="queryParams.customerName"
            placeholder="请输入客户名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="报价状态" prop="quoteStatus">
          <el-select
            v-model="queryParams.quoteStatus"
            placeholder="请选择报价状态"
            clearable
            size="small"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
            <el-option label="审批中" value="approving" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
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
          新增报价单
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

    <el-table v-loading="loading" :data="quoteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="报价单号" align="center" prop="quoteNumber" />
      <el-table-column label="客户名称" align="center" prop="customerName" />
      <el-table-column label="报价金额" align="center" prop="totalAmount" />
      <el-table-column label="报价状态" align="center" prop="quoteStatus">
        <template #default="scope">
          <el-tag :type="scope.row.quoteStatus === 'draft' ? 'info' : 
                     scope.row.quoteStatus === 'submitted' ? 'warning' : 
                     scope.row.quoteStatus === 'approving' ? 'primary' : 
                     scope.row.quoteStatus === 'approved' ? 'success' : 
                     scope.row.quoteStatus === 'rejected' ? 'danger' : 'warning'" size="small">
            {{ scope.row.quoteStatus === 'draft' ? '草稿' : 
               scope.row.quoteStatus === 'submitted' ? '已提交' : 
               scope.row.quoteStatus === 'approving' ? '审批中' : 
               scope.row.quoteStatus === 'approved' ? '已通过' : 
               scope.row.quoteStatus === 'rejected' ? '已拒绝' : '已失效' }}
          </el-tag>
        </template>
      </el-table-column>
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
            icon="Document"
            @click="handleView(scope.row)"
          >
            查看
          </el-button>
          <el-button
            size="small"
            type="warning"
            icon="Upload"
            @click="handleSubmit(scope.row)"
            :disabled="scope.row.quoteStatus !== 'draft'"
          >
            提交审批
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

    <!-- 报价单配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-form-item label="报价单号" prop="quoteNumber">
              <el-input v-model="form.quoteNumber" placeholder="请输入报价单号" :disabled="form.quoteId" />
            </el-form-item>
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="报价日期" prop="quoteDate">
              <el-date-picker v-model="form.quoteDate" type="date" placeholder="请选择报价日期" />
            </el-form-item>
            <el-form-item label="有效期至" prop="validUntil">
              <el-date-picker v-model="form.validUntil" type="date" placeholder="请选择有效期至" />
            </el-form-item>
            <el-form-item label="报价状态" prop="quoteStatus">
              <el-select v-model="form.quoteStatus" placeholder="请选择报价状态">
                <el-option label="草稿" value="draft" />
                <el-option label="已提交" value="submitted" />
              </el-select>
            </el-form-item>
            <el-form-item label="报价备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入报价备注" :rows="3" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="报价项" name="items">
          <div class="quote-items-container">
            <el-button
              type="primary"
              icon="Plus"
              size="small"
              @click="handleAddQuoteItem"
              style="margin-bottom: 10px;"
            >
              新增报价项
            </el-button>
            <el-table :data="quoteItems" border>
              <el-table-column label="产品名称" align="center" prop="productName" />
              <el-table-column label="产品编码" align="center" prop="productCode" />
              <el-table-column label="数量" align="center" prop="quantity">
                <template #default="scope">
                  <el-input-number v-model="scope.row.quantity" :min="1" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="单价" align="center" prop="unitPrice">
                <template #default="scope">
                  <el-input v-model="scope.row.unitPrice" type="number" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="折扣" align="center" prop="discount">
                <template #default="scope">
                  <el-input-number v-model="scope.row.discount" :min="0" :max="100" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="金额" align="center" prop="itemAmount">
                <template #default="scope">
                  {{ (scope.row.quantity * scope.row.unitPrice * (1 - scope.row.discount / 100)).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="100">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="danger"
                    icon="Delete"
                    @click="handleDeleteQuoteItem(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="价格明细" name="price">
          <div class="price-details">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="商品总价">{{ totalAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="折扣金额">{{ discountAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="运费">{{ form.freightAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="税费">{{ taxAmount.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="最终总价">{{ finalAmount.toFixed(2) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button type="success" @click="submitQuote" :disabled="!form.quoteId">提交审批</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { listQuote, addQuote, updateQuote, deleteQuote, submitQuote as submitQuoteApi } from '@/api/cpq/quote'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const quoteList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)
const activeTab = ref('basic')

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  quoteNumber: '',
  customerName: '',
  quoteStatus: ''
})

const form = reactive({
  quoteId: null,
  quoteNumber: '',
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  quoteDate: '',
  validUntil: '',
  quoteStatus: 'draft',
  totalAmount: 0,
  discountAmount: 0,
  freightAmount: 0,
  taxAmount: 0,
  finalAmount: 0,
  remark: '',
  quoteItems: []
})

const rules = reactive({
  quoteNumber: [{ required: true, message: '报价单号不能为空', trigger: 'blur' }],
  customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
  quoteDate: [{ required: true, message: '报价日期不能为空', trigger: 'change' }],
  validUntil: [{ required: true, message: '有效期至不能为空', trigger: 'change' }]
})

const quoteItems = ref([])

// 计算属性
const totalAmount = computed(() => {
  return quoteItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
})

const discountAmount = computed(() => {
  return quoteItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount / 100) || 0), 0)
})

const taxAmount = computed(() => {
  // 简单计算税费（假设税率为13%）
  return (totalAmount.value - discountAmount.value) * 0.13
})

const finalAmount = computed(() => {
  return (totalAmount.value - discountAmount.value) + form.freightAmount + taxAmount.value
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listQuote(queryParams)
    quoteList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取报价单列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.quoteNumber = ''
  queryParams.customerName = ''
  queryParams.quoteStatus = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.quoteId = null
  form.quoteNumber = ''
  form.customerName = ''
  form.contactPerson = ''
  form.contactPhone = ''
  form.quoteDate = ''
  form.validUntil = ''
  form.quoteStatus = 'draft'
  form.totalAmount = 0
  form.discountAmount = 0
  form.freightAmount = 0
  form.taxAmount = 0
  form.finalAmount = 0
  form.remark = ''
  quoteItems.value = []
  title.value = '新增报价单'
  activeTab.value = 'basic'
  open.value = true
}

const handleUpdate = (row) => {
  form.quoteId = row.quoteId
  form.quoteNumber = row.quoteNumber
  form.customerName = row.customerName
  form.contactPerson = row.contactPerson
  form.contactPhone = row.contactPhone
  form.quoteDate = row.quoteDate
  form.validUntil = row.validUntil
  form.quoteStatus = row.quoteStatus
  form.totalAmount = row.totalAmount
  form.discountAmount = row.discountAmount
  form.freightAmount = row.freightAmount
  form.taxAmount = row.taxAmount
  form.finalAmount = row.finalAmount
  form.remark = row.remark
  // 模拟加载报价项
  quoteItems.value = [
    { itemId: 1, productName: '产品1', productCode: 'PROD001', quantity: 2, unitPrice: 1000, discount: 10 },
    { itemId: 2, productName: '产品2', productCode: 'PROD002', quantity: 1, unitPrice: 2000, discount: 5 }
  ]
  title.value = '修改报价单'
  activeTab.value = 'basic'
  open.value = true
}

const handleDelete = async (row) => {
  const ids = row.quoteId ? [row.quoteId] : multipleSelection.value.map(item => item.quoteId)
  await ElMessageBox.confirm('确定要删除选中的报价单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteQuote(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleView = (row) => {
  // 跳转到报价单详情页面
  router.push({
    path: '/cpq/quote/detail',
    query: { quoteId: row.quoteId }
  })
}

const handleSubmit = (row) => {
  // 提交报价单进行审批
  submitQuoteApi(row.quoteId)
    .then(() => {
      ElMessage.success('提交成功')
      getList()
    })
    .catch(error => {
      ElMessage.error('提交失败')
    })
}

const handleAddQuoteItem = () => {
  quoteItems.value.push({
    itemId: null,
    productName: '',
    productCode: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0
  })
}

const handleDeleteQuoteItem = (row) => {
  const index = quoteItems.value.findIndex(item => item.itemId === row.itemId)
  if (index !== -1) {
    quoteItems.value.splice(index, 1)
  }
}

const submitForm = async () => {
  await validate(form, rules)
  try {
    // 更新表单的金额字段
    form.totalAmount = totalAmount.value
    form.discountAmount = discountAmount.value
    form.taxAmount = taxAmount.value
    form.finalAmount = finalAmount.value
    
    if (form.quoteId) {
      await updateQuote(form)
      ElMessage.success('修改成功')
    } else {
      await addQuote(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const submitQuote = async () => {
  try {
    await submitQuoteApi(form.quoteId)
    ElMessage.success('提交审批成功')
    open.value = false
    getList()
  } catch (error) {
    ElMessage.error('提交审批失败')
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

<style scoped>
.quote-items-container {
  margin-top: 20px;
}

.price-details {
  margin-top: 20px;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
