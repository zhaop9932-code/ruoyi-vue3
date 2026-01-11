<template>
  <div class="cpq-page-container">
    <div class="cpq-card">
      <div class="cpq-card-header">
        <div class="cpq-card-title">产品属性管理</div>
        <div class="cpq-card-actions">
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增属性</el-button>
          <el-button type="danger" @click="handleDelete" :disabled="multipleSelection.length === 0" :icon="Delete">批量删除</el-button>
          <el-button type="warning" @click="handleExport" :icon="Download">导出</el-button>
          <el-button type="success" @click="handleImport" :icon="Upload">导入</el-button>
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
        
        <!-- 属性列表区 -->
        <el-card shadow="never" class="cpq-sub-card">
          <template #header>
            <div class="cpq-card-title">
              属性列表
              <span v-if="catalogName" class="cpq-catalog-name">(目录：{{ catalogName }})</span>
            </div>
          </template>
          
          <el-table v-loading="loading" :data="attributeList" @selection-change="handleSelectionChange" stripe fit style="width: 100%" class="cpq-table">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="属性编码" align="left" prop="attributeCode" min-width="150" />
            <el-table-column label="属性名称" align="left" prop="attributeName" :show-overflow-tooltip="true" min-width="200" />
            <el-table-column label="属性类型" align="center" prop="attributeType" width="120">
              <template #default="scope">
                <el-tag size="small">
                  {{ scope.row.attributeType === 'text' ? '文本' : 
                     scope.row.attributeType === 'number' ? '数字' : 
                     scope.row.attributeType === 'date' ? '日期' : 
                     scope.row.attributeType === 'enum' ? '枚举' : '布尔' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="组件类型" align="center" prop="componentType" width="120" />
            <el-table-column label="默认值" align="left" prop="defaultValue" :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
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
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getList"
            />
          </div>
        </el-card>
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

    <!-- 导入属性对话框 -->
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的属性数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="upload.isUploading" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { UploadFilled } from '@element-plus/icons-vue'
import { listAttribute, getAttribute, addAttribute, updateAttribute, deleteAttribute, exportAttribute } from '@/api/cpq/product'
import { listAttributeGroup } from '@/api/cpq/attributeGroup'
import { ElMessage, ElMessageBox } from 'element-plus'
import useUserStore from '@/store/modules/user'

const route = useRoute()
const { proxy } = getCurrentInstance()
const catalogId = ref(route.query.catalogId || '')
const catalogName = ref(route.query.catalogName || '')

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const attributeList = ref([])
const multipleSelection = ref([])
const attributeTitle = ref('')
const attributeOpen = ref(false)
const attributeGroups = ref([])
const loadingAttributeGroups = ref(false)

// 上传相关
const upload = reactive({
  // 上传参数
  open: false,
  title: '导入产品属性',
  url: import.meta.env.VITE_APP_BASE_API + '/cpq/product/importAttribute',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  },
  isUploading: false,
  isUpdateSupport: 0,
  updateSupport: 0,
  fileList: [],
  successMsg: ''
})

const uploadRef = ref()

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
    const attributeData = res.data
    attributeForm.attributeId = attributeData.attributeId
    attributeForm.attributeCode = attributeData.attributeCode
    attributeForm.attributeName = attributeData.attributeName
    // 映射属性类型编码到对应的value值
    const attributeTypeMap = {
      '1': 'text',
      '2': 'number',
      '3': 'date',
      '4': 'enum',
      '5': 'boolean',
      'text': 'text',
      'number': 'number',
      'date': 'date',
      'enum': 'enum',
      'boolean': 'boolean'
    }
    // 获取属性类型值，转换为字符串
    const typeValue = String(attributeData.attributeType).toLowerCase()
    // 使用映射关系，确保值与option的value完全匹配
    attributeForm.attributeType = attributeTypeMap[typeValue] || 'text'
    // 映射组件类型编码到对应的value值
    const componentTypeMap = {
      '1': 'input',
      '2': 'select',
      '3': 'radio',
      '4': 'checkbox',
      '5': 'slider',
      '6': 'switch',
      '7': 'date-picker',
      'input': 'input',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'slider': 'slider',
      'switch': 'switch',
      'date-picker': 'date-picker'
    }
    // 获取组件类型值，转换为字符串
    const componentValue = String(attributeData.componentType).toLowerCase()
    // 使用映射关系，确保值与option的value完全匹配
    attributeForm.componentType = componentTypeMap[componentValue] || 'input'
    attributeForm.iconUrl = attributeData.iconUrl
    attributeForm.defaultValue = attributeData.defaultValue
    attributeForm.tooltip = attributeData.tooltip
    attributeForm.attributeGroupId = attributeData.attributeGroupId || ''
    attributeForm.attributeGroupName = attributeData.attributeGroupName || ''
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

/** 导出产品属性 */
const handleExport = () => {
  proxy.download("cpq/product/exportAttribute", {
    ...queryParams
  }, `attribute_${new Date().getTime()}.xlsx`)
}

// 导入模板
const importTemplate = () => {
  proxy.download("cpq/product/downloadAttributeImportTemplate", {}, `attribute_import_template_${new Date().getTime()}.xlsx`)
}

// 打开导入对话框
const handleImport = () => {
  upload.title = '导入产品属性'
  upload.open = true
}

// 提交上传文件
const submitFileForm = () => {
  if (uploadRef.value && uploadRef.value.uploadFiles.length > 0) {
    uploadRef.value.submit()
  } else {
    ElMessage.warning('请选择要上传的文件')
  }
}

// 文件上传中处理
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}

// 文件上传成功处理
const handleFileSuccess = (response, file, fileList) => {
  upload.isUploading = false
  if (response.code === 200) {
    upload.successMsg = response.msg
    ElMessage.success(response.msg)
    upload.open = false
    // 重新获取列表数据
    getList()
  } else {
    ElMessage.error(response.msg)
  }
}

// 文件选择变化处理
const handleFileChange = (file, fileList) => {
  upload.updateSupport = fileList.length > 0
}

// 文件移除处理
const handleFileRemove = (file, fileList) => {
  upload.updateSupport = fileList.length > 0
}

onMounted(() => {
  // 获取用户store实例
  const userStore = useUserStore()
  // 如果有目录ID参数，设置到查询参数中
  if (catalogId.value) {
    queryParams.catalogId = catalogId.value
  }
  getList()
})

// 组件激活时重新加载数据
onActivated(() => {
  // 获取用户store实例
  const userStore = useUserStore()
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
  width: 100%;
}

.cpq-sub-card {
  width: 100%;
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