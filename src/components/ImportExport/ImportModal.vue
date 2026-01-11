<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="!isImporting" class="import-modal-content">
      <!-- 模板下载 -->
      <div class="section">
        <h4>步骤1：下载导入模板</h4>
        <el-button
          type="primary"
          :loading="downloadingTemplate"
          @click="handleDownloadTemplate"
          class="template-button"
        >
          <el-icon><Download /></el-icon> 下载导入模板
        </el-button>
        <div class="tip">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <span>请使用下载的模板填写数据，确保格式正确</span>
        </div>
      </div>

      <!-- 文件上传 -->
      <div class="section">
        <h4>步骤2：选择文件上传</h4>
        <el-upload
          class="upload-dragger"
          drag
          :action="uploadUrl"
          :headers="headers"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :on-progress="handleUploadProgress"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :auto-upload="false"
          :show-file-list="true"
          accept=".xlsx,.xls"
          ref="uploadRef"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持上传 .xlsx 和 .xls 格式文件，单个文件大小不超过 10MB
            </div>
          </template>
        </el-upload>
        
        <!-- 更新支持选项 -->
        <div class="update-support-option">
          <el-switch
            v-model="updateSupport"
            active-text="支持更新"
            inactive-text="不支持更新"
            size="small"
          />
          <div class="tip">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            <span>选择"支持更新"时，已存在的数据会被更新；选择"不支持更新"时，已存在的数据会被跳过</span>
          </div>
        </div>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="section">
        <h4>步骤3：文件上传中</h4>
        <el-progress
          :percentage="uploadProgress"
          :status="uploadStatus"
          :stroke-width="8"
          class="progress-bar"
        >
          <template #default>
            <span>{{ uploadProgress }}%</span>
          </template>
        </el-progress>
      </div>
    </div>

    <!-- 导入结果 -->
    <div v-else class="import-result">
      <h4>导入结果</h4>
      <div class="result-stats">
        <div class="stat-item success">
          <span class="stat-label">成功</span>
          <span class="stat-value">{{ importResult.successCount || 0 }}</span>
          <span class="stat-unit">条</span>
        </div>
        <div class="stat-item failure">
          <span class="stat-label">失败</span>
          <span class="stat-value">{{ importResult.failureCount || 0 }}</span>
          <span class="stat-unit">条</span>
        </div>
      </div>

      <!-- 失败详情 -->
      <div v-if="importResult.failureCount > 0" class="failure-details">
        <h5>失败详情</h5>
        <el-table :data="importResult.errorList" border style="width: 100%">
          <el-table-column prop="rowNum" label="行号" width="80" />
          <el-table-column prop="errorMsg" label="错误信息" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="!isImporting && selectedFile"
          type="primary"
          :loading="uploading"
          @click="handleStartImport"
        >
          <el-icon><Upload /></el-icon> 开始导入
        </el-button>
        <el-button
          v-else-if="isImporting"
          type="primary"
          @click="handleClose"
        >
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Download, UploadFilled, InfoFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  moduleName: {
    type: String,
    required: true
  },
  importApi: {
    type: Function,
    required: true
  },
  templateApi: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['close', 'success', 'error'])

// 状态管理
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit('close')
    }
  }
})

const dialogTitle = computed(() => `导入${props.moduleName}`)
const selectedFile = ref(null)
const uploading = ref(false)
const downloadingTemplate = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('success')
const isImporting = ref(false)
const uploadRef = ref(null)

// 导入结果
const importResult = ref({
  successCount: 0,
  failureCount: 0,
  errorList: []
})

// 更新支持选项
const updateSupport = ref(false)

// 上传配置
const headers = ref({
  Authorization: `Bearer ${getToken()}`
})
const uploadUrl = ref('') // 实际上传地址由beforeUpload处理

// 监听对话框关闭，重置状态
watch(() => props.visible, (val) => {
  if (!val) {
    resetState()
  }
})

// 重置状态
function resetState() {
  selectedFile.value = null
  uploading.value = false
  downloadingTemplate.value = false
  uploadProgress.value = 0
  uploadStatus.value = 'success'
  isImporting.value = false
  updateSupport.value = false
  importResult.value = {
    successCount: 0,
    failureCount: 0,
    errorList: []
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 处理对话框关闭
function handleClose() {
  emit('close')
}

// 处理模板下载
async function handleDownloadTemplate() {
  try {
    downloadingTemplate.value = true
    const response = await props.templateApi()
    handleFileDownload(response, `${props.moduleName}导入模板.xlsx`)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('模板下载失败:', error)
    ElMessage.error('模板下载失败，请重试')
  } finally {
    downloadingTemplate.value = false
  }
}

// 处理文件下载
function handleFileDownload(response, filename) {
  const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 文件上传前验证
function beforeUpload(file) {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('请上传Excel文件(.xlsx或.xls格式)')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

// 处理文件选择
function handleFileChange(file) {
  selectedFile.value = file.raw
  return false // 阻止自动上传
}

// 处理上传进度
function handleUploadProgress(event) {
  if (event.total > 0) {
    uploadProgress.value = Math.round((event.loaded / event.total) * 100)
  }
}

// 处理开始导入
async function handleStartImport() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  try {
    uploading.value = true
    isImporting.value = true
    uploadProgress.value = 0
    uploadStatus.value = 'success'

    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('updateSupport', updateSupport.value)

    const response = await props.importApi(formData)
    importResult.value = response.data || {
      successCount: 0,
      failureCount: 0,
      errorList: []
    }

    if (importResult.value.successCount > 0) {
      ElMessage.success(`成功导入 ${importResult.value.successCount} 条数据`)
      emit('success', importResult.value)
    }
    if (importResult.value.failureCount > 0) {
      ElMessage.warning(`导入失败 ${importResult.value.failureCount} 条数据，请查看详情`)
      emit('error', importResult.value)
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请重试')
    uploadStatus.value = 'exception'
    emit('error', { message: error.message })
  } finally {
    uploading.value = false
  }
}

// 处理上传成功（预留）
function handleUploadSuccess(response) {
  // 此方法在使用action属性时会被调用，我们使用手动上传，所以可能不会用到
  console.log('上传成功:', response)
}

// 处理上传失败（预留）
function handleUploadError(error) {
  // 此方法在使用action属性时会被调用，我们使用手动上传，所以可能不会用到
  console.error('上传失败:', error)
  ElMessage.error('上传失败，请重试')
  uploadStatus.value = 'exception'
}
</script>

<style scoped lang="scss">
.import-modal-content {
  padding: 10px 0;
}

.section {
  margin-bottom: 24px;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.template-button {
  margin-bottom: 12px;
}

.tip {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 13px;

  .tip-icon {
    margin-right: 6px;
    font-size: 14px;
  }
}

.upload-dragger {
  margin-bottom: 16px;
}

.update-support-option {
  margin-top: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  
  .tip {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    color: #1890ff;
    font-size: 13px;
    
    .tip-icon {
      margin-right: 6px;
      font-size: 14px;
    }
  }
}

.progress-bar {
  margin: 16px 0;
}

.import-result {
  padding: 10px 0;

  h4 {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.result-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
    }

    .stat-unit {
      font-size: 14px;
      color: #666;
    }

    &.success {
      .stat-value {
        color: #67c23a;
      }
    }

    &.failure {
      .stat-value {
        color: #f56c6c;
      }
    }
  }
}

.failure-details {
  h5 {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #666;
  }

  .el-table {
    max-height: 300px;
    overflow: auto;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
