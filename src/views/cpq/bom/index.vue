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

    <div v-loading="loading" class="bom-card-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="(item, index) in superBomList" :key="item.bomId">
          <el-card shadow="hover" class="bom-card">
            <template #header>
              <div class="bom-card-header">
                <div class="bom-card-title">
                  <h3>{{ item.bomName }}</h3>
                  <el-checkbox v-model="selectedBomIds[item.bomId]" @change="handleBomSelect(item)"></el-checkbox>
                </div>
                <div class="bom-card-type">
                  <el-tag :type="item.bomType === 'template' ? 'primary' : 
                             item.bomType === 'instance' ? 'success' : 'warning'" size="small">
                    {{ item.bomType === 'template' ? '模板' : 
                       item.bomType === 'instance' ? '实例' : '版本' }}
                  </el-tag>
                </div>
              </div>
            </template>
            
            <div class="bom-card-content">
              <div class="bom-info-item">
                <div class="info-label">BOM编码:</div>
                <div class="info-value">{{ item.bomCode }}</div>
              </div>
              
              <div class="bom-info-item">
                <div class="info-label">验证策略:</div>
                <div class="info-value">
                  <el-tag :type="item.validationStrategy === 'strict' ? 'danger' : 
                             item.validationStrategy === 'warning' ? 'warning' : 'success'" size="small">
                    {{ item.validationStrategy === 'strict' ? '严格验证' : 
                       item.validationStrategy === 'warning' ? '警告验证' : '无验证' }}
                  </el-tag>
                </div>
              </div>
              
              <div class="bom-info-item">
                <div class="info-label">规则引擎:</div>
                <div class="info-value">{{ item.ruleEngineType }}</div>
              </div>
              
              <div class="bom-info-item">
                <div class="info-label">创建时间:</div>
                <div class="info-value">{{ item.createTime }}</div>
              </div>
            </div>
            
            <div class="bom-card-actions">
              <el-button
                size="small"
                type="primary"
                icon="Edit"
                @click="handleUpdate(item)"
              >
                修改
              </el-button>
              <el-button
                size="small"
                type="danger"
                icon="Delete"
                @click="handleDelete(item)"
              >
                删除
              </el-button>
              <el-button
                size="small"
                type="info"
                icon="SetUp"
                @click="handleBomManage(item)"
              >
                BOM管理
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
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
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { listSuperBom, addSuperBom, updateSuperBom, deleteSuperBom, checkBomCodeUnique } from '@/api/cpq/bom'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const superBomList = ref([])
const multipleSelection = ref([])
const selectedBomIds = ref({})
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

const handleBomSelect = (item) => {
  if (selectedBomIds.value[item.bomId]) {
    // 添加到选择列表
    multipleSelection.value.push(item)
  } else {
    // 从选择列表中移除
    const index = multipleSelection.value.findIndex(bom => bom.bomId === item.bomId)
    if (index > -1) {
      multipleSelection.value.splice(index, 1)
    }
  }
}

const handleSelectionChange = (selection) => {
  // 保持原有函数签名，确保兼容性
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

// 组件激活时重新加载数据
onActivated(() => {
  getList()
})
</script>

<style scoped>
/* BOM卡片容器样式 */
.bom-card-container {
  padding: 20px 0;
}

/* BOM卡片样式 */
.bom-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bom-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

/* 卡片头部样式 */
.bom-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.bom-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.bom-card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.bom-card-type {
  margin-top: 5px;
}

/* 卡片内容样式 */
.bom-card-content {
  padding: 15px 0;
  flex: 1;
}

.bom-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.bom-info-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  width: 80px;
  text-align: left;
}

.info-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片操作按钮样式 */
.bom-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.bom-card-actions .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .bom-info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label,
  .info-value {
    text-align: left;
    width: 100%;
  }
  
  .info-value {
    margin-top: 5px;
  }
  
  .bom-card-actions {
    flex-direction: column;
  }
  
  .bom-card-actions .el-button {
    width: 100%;
  }
}
</style>
