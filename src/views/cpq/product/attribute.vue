<template>
  <div class="cpq-page-container">
    <div class="cpq-card">
      <div class="cpq-card-header">
        <div class="cpq-card-title">产品属性管理</div>
        <div class="cpq-card-actions">
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增属性</el-button>
          <el-button type="danger" @click="handleDelete" :disabled="multipleSelection.length === 0" :icon="Delete">批量删除</el-button>
          <el-button type="info" @click="toggleSearch" :icon="Search">
            {{ showSearch ? '收起' : '展开' }}搜索
          </el-button>
        </div>
      </div>
      
      <div class="cpq-card-body">
        <el-card shadow="never" class="cpq-search-card" v-show="showSearch">
          <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
            <el-form-item label="属性编码" prop="attributeCode">
              <el-input
                v-model="queryParams.attributeCode"
                placeholder="请输入属性编码"
                clearable
                size="small"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="属性名称" prop="attributeName">
              <el-input
                v-model="queryParams.attributeName"
                placeholder="请输入属性名称"
                clearable
                size="small"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="属性类型" prop="attributeType">
              <el-select
                v-model="queryParams.attributeType"
                placeholder="请选择属性类型"
                clearable
                size="small"
              >
                <el-option label="文本" value="text" />
                <el-option label="数字" value="number" />
                <el-option label="日期" value="date" />
                <el-option label="枚举" value="enum" />
                <el-option label="布尔" value="boolean" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!catalogId">
              <el-select
                v-model="queryParams.catalogId"
                placeholder="请选择目录"
                clearable
                size="small"
              >
                <el-option
                  v-for="catalog in catalogList"
                  :key="catalog.catalogId"
                  :label="catalog.catalogName"
                  :value="catalog.catalogId"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="handleQuery" :icon="Search">搜索</el-button>
              <el-button size="small" @click="resetQuery" :icon="Refresh">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-row :gutter="20" class="cpq-content-row">
          <!-- 属性列表区 -->
          <el-col :span="10">
            <el-card shadow="never" class="cpq-sub-card">
              <template #header>
                <div class="cpq-card-title">
                  属性列表
                  <span v-if="catalogName" class="cpq-catalog-name">(目录：{{ catalogName }})</span>
                </div>
              </template>
              
              <el-table v-loading="loading" :data="attributeList" @selection-change="handleSelectionChange" @row-click="handleRowClick" height="600" stripe class="cpq-table">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column label="属性编码" align="center" prop="attributeCode" />
                <el-table-column label="属性名称" align="center" prop="attributeName" :show-overflow-tooltip="true" />
                <el-table-column label="属性类型" align="center" prop="attributeType">
                  <template #default="scope">
                    <el-tag size="small">
                      {{ scope.row.attributeType === 'text' ? '文本' : 
                         scope.row.attributeType === 'number' ? '数字' : 
                         scope.row.attributeType === 'date' ? '日期' : 
                         scope.row.attributeType === 'enum' ? '枚举' : '布尔' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="组件类型" align="center" prop="componentType" />
                <el-table-column label="操作" align="center" class-name="cpq-table-action" width="150">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      :icon="Edit"
                      @click="handleUpdate(scope.row)"
                    >
                      修改
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="handleDelete(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="cpq-pagination">
                <pagination
                  v-show="total > 0"
                  :total="total"
                  :page.sync="queryParams.pageNum"
                  :limit.sync="queryParams.pageSize"
                  @pagination="getList"
                />
              </div>
            </el-card>
          </el-col>
          
          <!-- 属性详情区 -->
          <el-col :span="14">
            <el-card shadow="never" class="cpq-sub-card" v-if="selectedAttribute">
              <template #header>
                <div class="cpq-card-title">属性详情</div>
              </template>
              
              <el-descriptions :column="2" border>
                <el-descriptions-item label="属性编码">{{ selectedAttribute.attributeCode }}</el-descriptions-item>
                <el-descriptions-item label="属性名称">{{ selectedAttribute.attributeName }}</el-descriptions-item>
                <el-descriptions-item label="属性类型">
                  {{ selectedAttribute.attributeType === 'text' ? '文本' : 
                     selectedAttribute.attributeType === 'number' ? '数字' : 
                     selectedAttribute.attributeType === 'date' ? '日期' : 
                     selectedAttribute.attributeType === 'enum' ? '枚举' : '布尔' }}
                </el-descriptions-item>
                <el-descriptions-item label="组件类型">{{ selectedAttribute.componentType }}</el-descriptions-item>
                <el-descriptions-item label="默认值">{{ selectedAttribute.defaultValue }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ selectedAttribute.createTime }}</el-descriptions-item>
              <el-descriptions-item label="属性组">{{ selectedAttribute.attributeGroupName || '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            <el-card shadow="never" class="cpq-sub-card" v-else>
              <div class="cpq-empty-tip">请选择一个属性查看详情</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 属性对话框 -->
    <el-dialog :title="attributeTitle" v-model="attributeOpen" width="600px" append-to-body :close-on-click-modal="false">
      <el-form :ref="(el) => attributeFormRef = el" :model="attributeForm" :rules="attributeRules" label-width="100px" class="cpq-form">
        <el-form-item label="属性名称" prop="attributeName">
          <el-input v-model="attributeForm.attributeName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性类型" prop="attributeType">
          <el-select v-model="attributeForm.attributeType" placeholder="请选择属性类型">
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="日期" value="date" />
            <el-option label="枚举" value="enum" />
            <el-option label="布尔" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="组件类型" prop="componentType">
          <el-select v-model="attributeForm.componentType" placeholder="请选择组件类型">
            <el-option label="输入框" value="input" />
            <el-option label="下拉框" value="select" />
            <el-option label="单选框" value="radio" />
            <el-option label="复选框" value="checkbox" />
            <el-option label="滑块" value="slider" />
            <el-option label="开关" value="switch" />
            <el-option label="日期选择器" value="date-picker" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="attributeForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        <el-form-item label="图标URL" prop="iconUrl">
          <el-input v-model="attributeForm.iconUrl" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="提示信息" prop="tooltip">
          <el-input v-model="attributeForm.tooltip" type="textarea" placeholder="请输入提示信息" :rows="2" />
        </el-form-item>
        <el-form-item label="属性组" prop="attributeGroupId">
          <el-select
            v-model="attributeForm.attributeGroupId"
            placeholder="请选择属性组"
            clearable
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="group in attributeGroups"
              :key="group.attributeGroupId"
              :label="group.attributeGroupName"
              :value="group.attributeGroupId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="cpq-dialog-footer">
          <el-button @click="cancelAttribute">取消</el-button>
          <el-button type="primary" @click="submitAttribute">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listAttribute, getAttribute, addAttribute, updateAttribute, deleteAttribute } from '@/api/cpq/product'
import { listAttributeGroup } from '@/api/cpq/attributeGroup'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const catalogId = ref(route.query.catalogId || '')
const catalogName = ref(route.query.catalogName || '')

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const attributeList = ref([])
const multipleSelection = ref([])
const selectedAttribute = ref(null)
const attributeTitle = ref('')
const attributeOpen = ref(false)
const attributeGroups = ref([])
const loadingAttributeGroups = ref(false)

// 加载属性组列表
const loadAttributeGroups = async () => {
  loadingAttributeGroups.value = true
  try {
    const res = await listAttributeGroup({ pageNum: 1, pageSize: 100 }) // 加载所有属性组
    attributeGroups.value = res.rows || []
  } catch (error) {
    ElMessage.error('加载属性组列表失败')
  } finally {
    loadingAttributeGroups.value = false
  }
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  attributeCode: '',
  attributeName: '',
  attributeType: '',
  catalogId: ''
})

const attributeForm = reactive({
  attributeId: null,
  attributeCode: '',
  attributeName: '',
  attributeType: 'text',
  componentType: 'input',
  iconUrl: '',
  defaultValue: '',
  tooltip: '',
  attributeGroupId: '',
  attributeGroupName: ''
})

const attributeRules = reactive({
  attributeName: [{ required: true, message: '属性名称不能为空', trigger: 'blur' }],
  attributeType: [{ required: true, message: '属性类型不能为空', trigger: 'change' }],
  componentType: [{ required: true, message: '组件类型不能为空', trigger: 'change' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listAttribute(queryParams)
    attributeList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取属性列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.attributeCode = ''
  queryParams.attributeName = ''
  queryParams.attributeType = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleRowClick = (row) => {
  selectedAttribute.value = row
}

const handleAdd = () => {
  attributeForm.attributeId = null
  attributeForm.attributeCode = ''
  attributeForm.attributeName = ''
  attributeForm.attributeType = 'text'
  attributeForm.componentType = 'input'
  attributeForm.iconUrl = ''
  attributeForm.defaultValue = ''
  attributeForm.tooltip = ''
  attributeForm.attributeGroupId = ''
  attributeForm.attributeGroupName = ''
  attributeTitle.value = '新增属性'
  loadAttributeGroups()
  attributeOpen.value = true
}

const handleUpdate = async (row) => {
  try {
    const res = await getAttribute(row.attributeId)
    attributeForm.attributeId = res.attributeId
    attributeForm.attributeCode = res.attributeCode
    attributeForm.attributeName = res.attributeName
    attributeForm.attributeType = res.attributeType
    attributeForm.componentType = res.componentType
    attributeForm.iconUrl = res.iconUrl
    attributeForm.defaultValue = res.defaultValue
    attributeForm.tooltip = res.tooltip
    attributeForm.attributeGroupId = res.attributeGroupId || ''
    attributeForm.attributeGroupName = res.attributeGroupName || ''
    attributeTitle.value = '修改属性'
    loadAttributeGroups()
    attributeOpen.value = true
  } catch (error) {
    ElMessage.error('获取属性详情失败')
  }
}

const handleDelete = async (row) => {
  const ids = row.attributeId ? [row.attributeId] : multipleSelection.value.map(item => item.attributeId)
  await ElMessageBox.confirm('确定要删除选中的属性吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteAttribute(ids)
    ElMessage.success('删除成功')
    getList()
    selectedAttribute.value = null
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 定义表单引用
const attributeFormRef = ref(null)

const submitAttribute = async () => {
  if (!attributeFormRef.value) return
  
  await attributeFormRef.value.validate().then(async () => {
    try {
      if (attributeForm.attributeId) {
        await updateAttribute(attributeForm)
        ElMessage.success('修改成功')
      } else {
        await addAttribute(attributeForm)
        ElMessage.success('新增成功')
      }
      attributeOpen.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.error('表单验证失败，请检查填写内容')
  })
}

const cancelAttribute = () => {
  attributeOpen.value = false
  if (attributeFormRef.value) {
    attributeFormRef.value.resetFields()
  }
}

onMounted(() => {
  // 如果有目录ID参数，设置到查询参数中
  if (catalogId.value) {
    queryParams.catalogId = catalogId.value
  }
  getList()
})
</script>

<style lang="scss" scoped>
.cpq-page-container {
  padding: 20px;
}

.cpq-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.cpq-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.cpq-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  .cpq-catalog-name {
    color: #409eff;
    font-weight: normal;
    margin-left: 8px;
  }
}

.cpq-card-actions {
  display: flex;
  gap: 10px;
}

.cpq-card-body {
  padding: 20px;
}

.cpq-search-card {
  margin-bottom: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.cpq-content-row {
  margin-bottom: 20px;
}

.cpq-sub-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.cpq-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cpq-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.cpq-table {
  margin-bottom: 20px;
}

.cpq-table-action {
  text-align: center;
}

.cpq-pagination {
  text-align: right;
  margin-top: 20px;
}

.cpq-form {
  padding: 10px 0;
}

.cpq-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cpq-empty-tip {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;
}
</style>