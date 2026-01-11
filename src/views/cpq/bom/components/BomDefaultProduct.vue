<template>
  <div class="default-product-container">
    <div class="page-header">
      <h3>默认产品配置</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAddProduct">添加默认产品</el-button>
        <el-button @click="handleApplyDefault">应用默认配置</el-button>
      </div>
    </div>
    
    <div class="card-list">
      <el-card 
        v-for="product in defaultProducts" 
        :key="product.id" 
        class="product-card"
        shadow="hover"
      >
        <div class="card-header">
          <div class="product-info">
            <h4>{{ product.product?.productName }}</h4>
            <div class="product-model">{{ product.product?.productModel }}</div>
          </div>
          <el-tag :type="product.isActive === '1' ? 'success' : 'info'">
            {{ product.isActive === '1' ? '已激活' : '未激活' }}
          </el-tag>
        </div>
        <div class="card-content">
          <div class="content-item">
            <span class="label">数量：</span>
            <span class="value">{{ product.qty || 1 }}</span>
          </div>
          <div class="content-item">
            <span class="label">排序：</span>
            <span class="value">{{ product.sortOrder }}</span>
          </div>
          <div class="content-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(product.createTime) }}</span>
          </div>
        </div>
        <div class="card-footer">
          <el-button size="small" @click="handleEditProduct(product)">编辑</el-button>
          <el-button 
            size="small" 
            :type="product.isActive === '1' ? 'warning' : 'success'"
            @click="handleToggleStatus(product)"
          >
            {{ product.isActive === '1' ? '停用' : '激活' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteProduct(product)">删除</el-button>
        </div>
      </el-card>
      
      <div v-if="defaultProducts.length === 0" class="empty-state">
        <el-empty description="暂无默认产品配置" />
      </div>
    </div>
    
    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="产品" prop="productId">
          <el-select
            v-model="formData.productId"
            placeholder="请选择产品"
            filterable
            remote
            :remote-method="handleProductSearch"
            :loading="productLoading"
            style="width: 100%"
          >
            <el-option
              v-for="product in productOptions"
              :key="product.productId"
              :label="`${product.productCode} - ${product.productName}`"
              :value="product.productId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :step="1"
            placeholder="请输入排序"
          />
        </el-form-item>
        <el-form-item label="数量" prop="qty">
          <el-input-number
            v-model="formData.qty"
            :min="1"
            :step="1"
            placeholder="请输入数量"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.isActive">
            <el-radio label="1">已激活</el-radio>
            <el-radio label="0">未激活</el-radio>
          </el-radio-group>
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
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  listSuperBomDefaultProduct, 
  addSuperBomDefaultProduct, 
  updateSuperBomDefaultProduct, 
  deleteSuperBomDefaultProduct, 
  applyDefaultProducts 
} from '@/api/cpq/bom'
import { listProduct } from '@/api/cpq/product'

const props = defineProps({
  bomId: {
    type: String,
    required: true
  }
})

// 数据
const defaultProducts = ref([])
const productOptions = ref([])
const productLoading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加默认产品')
const formRef = ref(null)
const formData = reactive({
  id: '',
  bomId: props.bomId,
  productId: '',
  sortOrder: 0,
  isActive: '1',
  qty: 1
})

// 表单规则
const formRules = reactive({
  productId: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ]
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 加载默认产品列表
const loadDefaultProducts = async () => {
  try {
    const res = await listSuperBomDefaultProduct({ bomId: props.bomId })
    defaultProducts.value = res.rows || []
  } catch (error) {
    ElMessage.error('加载默认产品失败')
    console.error('加载默认产品失败:', error)
  }
}



// 产品搜索
const handleProductSearch = async (query) => {
  productLoading.value = true
  try {
    const res = await listProduct({ productName: query, pageNum: 1, pageSize: 20 })
    productOptions.value = res.rows || []
  } catch (error) {
    ElMessage.error('搜索产品失败')
    console.error('搜索产品失败:', error)
  } finally {
    productLoading.value = false
  }
}

// 添加产品
const handleAddProduct = () => {
  dialogTitle.value = '添加默认产品'
  Object.assign(formData, {
    id: '',
    bomId: props.bomId,
    productId: '',
    sortOrder: 0,
    isActive: '1',
    qty: 1
  })
  dialogVisible.value = true
}

// 编辑产品
const handleEditProduct = (product) => {
  dialogTitle.value = '编辑默认产品'
  Object.assign(formData, {
    id: product.id,
    bomId: product.bomId,
    productId: product.productId,
    sortOrder: product.sortOrder,
    isActive: product.isActive,
    qty: product.qty || 1
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (formData.id) {
          res = await updateSuperBomDefaultProduct(formData)
        } else {
          res = await addSuperBomDefaultProduct(formData)
        }
        if (res.code === 200) {
          ElMessage.success(res.msg || '操作成功')
          dialogVisible.value = false
          loadDefaultProducts()
        } else {
          ElMessage.error(res.msg || '操作失败')
        }
      } catch (error) {
        ElMessage.error('操作失败')
        console.error('操作失败:', error)
      }
    }
  })
}

// 切换状态
const handleToggleStatus = async (product) => {
  try {
    const res = await updateSuperBomDefaultProduct({
      id: product.id,
      isActive: product.isActive === '1' ? '0' : '1'
    })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      loadDefaultProducts()
    } else {
      ElMessage.error(res.msg || '状态更新失败')
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error('状态更新失败:', error)
  }
}

// 删除产品
const handleDeleteProduct = (product) => {
  ElMessageBox.confirm('确定要删除该默认产品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSuperBomDefaultProduct([product.id])
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadDefaultProducts()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 应用默认配置
const handleApplyDefault = async () => {
  try {
    const res = await applyDefaultProducts(props.bomId)
    if (res.code === 200) {
      ElMessage.success('应用成功')
    } else {
      ElMessage.error(res.msg || '应用失败')
    }
  } catch (error) {
    ElMessage.error('应用失败')
    console.error('应用失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadDefaultProducts()
})
</script>

<style scoped>
.default-product-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.product-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.product-model {
  font-size: 14px;
  color: #606266;
  margin-top: 2px;
}

.card-content {
  margin-bottom: 20px;
}

.content-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.content-item .label {
  color: #909399;
  width: 80px;
}

.content-item .value {
  color: #303133;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}
</style>