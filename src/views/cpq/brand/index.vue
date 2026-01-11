<template>
  <div class="cpq-container">
    <!-- 页面标题 -->
    <div class="cpq-page-title">
      品牌管理
    </div>

    <!-- 操作栏 -->
    <div class="cpq-action-bar">
      <div class="cpq-actions">
        <el-button
          type="primary"
          icon="Plus"
          @click="handleAdd"
        >
          新增品牌
        </el-button>
        <el-button
          type="danger"
          icon="Delete"
          :disabled="multipleSelection.length === 0"
          @click="handleDeleteAll"
        >
          批量删除
        </el-button>
        <el-button
          type="warning"
          icon="Download"
          @click="handleExport"
        >
          导出
        </el-button>
        <el-button
          type="success"
          icon="Upload"
          @click="handleImport"
        >
          导入
        </el-button>
      </div>
      <el-button
        type="info"
        icon="Search"
        @click="toggleSearch"
      >
        {{ showSearch ? '收起' : '展开' }}搜索
      </el-button>
    </div>

    <!-- 搜索卡片 -->
    <div class="cpq-search-card" v-show="showSearch">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
        <el-form-item label="品牌编码" prop="brandCode">
          <el-input
            v-model="queryParams.brandCode"
            placeholder="请输入品牌编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandName">
          <el-input
            v-model="queryParams.brandName"
            placeholder="请输入品牌名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="品牌状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择品牌状态"
            clearable
            size="small"
          >
            <el-option label="启用" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="RefreshRight" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 品牌列表表格 -->
    <div class="cpq-table" style="width: 100%;">
      <el-table v-loading="loading" :data="brandList" @selection-change="handleSelectionChange" border style="width: 100%;">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌编码" align="center" prop="brandCode" min-width="120" />
      <el-table-column label="品牌名称" align="center" prop="brandName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="品牌Logo" align="center" width="120">
        <template #default="scope">
          <el-image v-if="scope.row.brandLogo" :src="scope.row.brandLogo" fit="cover" style="width: 60px; height: 60px;" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
            {{ scope.row.status === '0' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="180">
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
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>

    <!-- 添加或修改品牌对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :ref="(el) => $refs.form = el" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="品牌编码" prop="brandCode">
          <el-input 
            v-model="form.brandCode" 
            placeholder="由系统自动生成" 
            :readonly="!form.brandId" 
            :disabled="!form.brandId"
          />
          <div v-if="!form.brandId" class="el-form-item__help" style="color: #909399;">
            品牌编码由系统自动生成，无需手动输入
          </div>
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌Logo">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :limit="1"
            :file-list="fileList"
            :auto-upload="true"
            accept=".jpg,.jpeg,.png"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/jpeg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
          <el-image v-if="form.brandLogo" :src="form.brandLogo" fit="cover" style="width: 100px; height: 100px; margin-top: 10px;" />
        </el-form-item>
        <el-form-item label="品牌状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入品牌对话框 -->
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
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的品牌数据
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
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, UploadFilled } from '@element-plus/icons-vue'
import { listBrand, getBrand, addBrand, updateBrand, delBrand, checkBrandCodeUnique, exportBrand } from '@/api/cpq/brand'

const { proxy } = getCurrentInstance()
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const brandList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)

// 上传相关
const upload = reactive({
  // 上传参数
  open: false,
  title: '导入品牌',
  url: import.meta.env.VITE_APP_BASE_API + '/cpq/brand/import',
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

// 导入模板
const importTemplate = () => {
  proxy.download("cpq/brand/importTemplate", {}, `brand_import_template_${new Date().getTime()}.xlsx`)
}

// 文件上传相关
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/common/upload')
const fileList = ref([])

const form = reactive({
  brandId: null,
  brandCode: '',
  brandName: '',
  brandLogo: '',
  status: '0',
  sortOrder: 0
})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  brandCode: '',
  brandName: '',
  status: ''
})

const rules = reactive({
  brandName: [
    { required: true, message: '品牌名称不能为空', trigger: 'blur' },
    { min: 2, max: 128, message: '品牌名称长度在 2 到 128 个字符', trigger: 'blur' }
  ],
  status: [{ required: true, message: '品牌状态不能为空', trigger: 'change' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listBrand(queryParams)
    brandList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取品牌列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.brandCode = ''
  queryParams.brandName = ''
  queryParams.status = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = () => {
  form.brandId = null
  form.brandCode = ''
  form.brandName = ''
  form.brandLogo = ''
  form.status = '0'
  form.sortOrder = 0
  fileList.value = []
  title.value = '新增品牌'
  open.value = true
}

const handleUpdate = (row) => {
  form.brandId = row.brandId
  form.brandCode = row.brandCode
  form.brandName = row.brandName
  form.brandLogo = row.brandLogo || ''
  form.status = row.status
  form.sortOrder = row.sortOrder
  fileList.value = []
  title.value = '修改品牌'
  open.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该品牌吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await delBrand(row.brandId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleDeleteAll = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的品牌')
    return
  }
  
  await ElMessageBox.confirm('确定要删除选中的品牌吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    // 批量删除品牌
    const brandIds = multipleSelection.value.map(item => item.brandId).join(',')
    await delBrand(brandIds)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  const { proxy } = getCurrentInstance()
  proxy.download("cpq/brand/export", {
    ...queryParams
  }, `brand_${new Date().getTime()}.xlsx`)
}

// 打开导入对话框
const handleImport = () => {
  upload.title = '导入品牌'
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

// 文件上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    form.brandLogo = response.data.url
    fileList.value = fileList
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败：' + response.msg)
  }
}

// 文件上传失败处理
const handleUploadError = (err, file, fileList) => {
  ElMessage.error('上传失败，请重试')
}

// 文件上传前验证
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

const submitForm = async () => {
  const formRef = $refs.value.form
  if (!formRef) return
  
  await formRef.validate().then(async () => {
    try {
      if (form.brandId) {
        await updateBrand(form)
        ElMessage.success('修改成功')
      } else {
        await addBrand(form)
        ElMessage.success('新增成功')
      }
      open.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.error('表单验证失败，请检查填写内容')
  })
}

const cancel = () => {
  open.value = false
  // 重置表单
  const formRef = $refs.value.form
  if (formRef) {
    formRef.resetFields()
  }
  // 清空文件列表
  fileList.value = []
}

// 定义$refs
const $refs = ref({
  form: null
})

onMounted(() => {
  getList()
})
</script>
