<template>
  <div class="bom-node-other-info">
    <div class="other-info-header">
      <h4>其他信息管理</h4>
    </div>
    
    <div class="other-info-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h5>节点扩展信息</h5>
          </div>
        </template>
        
        <el-form :model="otherInfo" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input v-model="otherInfo.createTime" disabled placeholder="创建时间" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <el-input v-model="otherInfo.updateTime" disabled placeholder="更新时间" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建人">
                <el-input v-model="otherInfo.createBy" disabled placeholder="创建人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新人">
                <el-input v-model="otherInfo.updateBy" disabled placeholder="更新人" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="版本号">
                <el-input v-model="otherInfo.version" placeholder="版本号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="审批状态">
                <el-select v-model="otherInfo.approveStatus" placeholder="请选择审批状态">
                  <el-option label="待审批" value="pending" />
                  <el-option label="已通过" value="approved" />
                  <el-option label="已拒绝" value="rejected" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="备注">
            <el-input v-model="otherInfo.remark" type="textarea" placeholder="请输入备注信息" :rows="4" />
          </el-form-item>
        </el-form>
        
        <div class="card-actions">
          <el-button type="primary" @click="handleSaveOtherInfo">保存</el-button>
        </div>
      </el-card>
      
      <!-- 历史记录卡片 -->
      <el-card class="info-card" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <h5>操作历史记录</h5>
          </div>
        </template>
        
        <el-table
          :data="historyList"
          border
          style="width: 100%"
          stripe
        >
          <el-table-column prop="id" label="记录ID" width="120" />
          <el-table-column prop="operator" label="操作人" width="180" />
          <el-table-column prop="operation" label="操作类型" width="180" />
          <el-table-column prop="content" label="操作内容" />
          <el-table-column prop="createTime" label="操作时间" width="220" />
        </el-table>
      </el-card>
      
      <!-- 附件信息卡片 -->
      <el-card class="info-card" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <h5>附件信息</h5>
            <el-button type="primary" size="small" icon="Plus" @click="handleUpload">上传附件</el-button>
          </div>
        </template>
        
        <el-upload
          v-model:file-list="fileList"
          :auto-upload="false"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture-card"
          style="margin-bottom: 20px;"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <template #tip>
            <div class="el-upload__tip">
              支持上传 PDF、Word、Excel、图片格式文件，单个文件不超过 5MB
            </div>
          </template>
        </el-upload>
        
        <el-table
          :data="fileList"
          border
          style="width: 100%"
        >
          <el-table-column prop="name" label="文件名" width="250" />
          <el-table-column prop="size" label="文件大小" width="120">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="文件类型" width="120" />
          <el-table-column prop="status" label="上传状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'warning'">
                {{ scope.row.status === 'success' ? '已上传' : '待上传' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="220" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handlePreview(scope.row)">预览</el-button>
              <el-button type="danger" size="small" @click="handleRemove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Download, Delete } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    default: null
  }
})

// 其他信息表单
const otherInfo = reactive({
  bomId: props.bomId,
  bomStructureId: props.bomStructureId,
  createTime: '2024-01-01 12:00:00',
  updateTime: '2024-01-02 14:30:00',
  createBy: 'admin',
  updateBy: 'admin',
  version: '1.0.0',
  approveStatus: 'approved',
  remark: ''
})

// 历史记录列表
const historyList = ref([
  {
    id: 1,
    operator: 'admin',
    operation: '新增',
    content: '创建节点',
    createTime: '2024-01-01 12:00:00'
  },
  {
    id: 2,
    operator: 'admin',
    operation: '编辑',
    content: '更新节点名称',
    createTime: '2024-01-02 14:30:00'
  },
  {
    id: 3,
    operator: 'user1',
    operation: '状态变更',
    content: '启用节点',
    createTime: '2024-01-03 09:15:00'
  }
])

// 文件列表
const fileList = ref([
  {
    name: '节点设计文档.pdf',
    url: '#',
    size: 1024 * 1024 * 2,
    type: 'pdf',
    status: 'success',
    uploadTime: '2024-01-01 12:05:00'
  },
  {
    name: '节点图片.jpg',
    url: '#',
    size: 1024 * 512,
    type: 'jpg',
    status: 'success',
    uploadTime: '2024-01-02 14:35:00'
  }
])

// 加载历史记录列表
const loadHistoryList = () => {
  // 实际项目中替换为真实API调用
  // const response = await listNodeHistory(props.bomStructureId)
  // historyList.value = response.data || []
  
  // 目前使用模拟数据，这里可以添加模拟加载逻辑
  console.log('加载历史记录，节点ID:', props.bomStructureId)
  // 模拟数据已经在historyList中初始化，无需重新加载
}

// 监听节点ID变化
watch(() => props.bomStructureId, (newBomStructureId) => {
  otherInfo.bomStructureId = newBomStructureId
  loadHistoryList()
})

// 保存其他信息
const handleSaveOtherInfo = () => {
  // 实际项目中替换为真实API调用
  // await updateNodeOtherInfo(otherInfo)
  
  // 模拟保存成功
  ElMessage.success('其他信息保存成功')
}

// 上传附件
const handleUpload = () => {
  ElMessage.info('上传功能开发中')
}

// 预览文件
const handlePreview = (file) => {
  ElMessage.info('预览功能开发中')
}

// 删除文件
const handleRemove = (file) => {
  ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中替换为真实API调用
    // await deleteNodeAttachment(file.id)
    
    // 模拟删除成功
    const index = fileList.value.findIndex(item => item.name === file.name)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
    ElMessage.success('文件删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 组件挂载时
onMounted(() => {
  // 可以在这里加载初始数据
})
</script>

<style scoped>
.bom-node-other-info {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.other-info-header {
  margin-bottom: 20px;
}

.other-info-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h5 {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.card-actions {
  margin-top: 20px;
  text-align: right;
}

.other-info-content {
  background-color: #fff;
}

:deep(.el-upload-list__item) {
  margin-right: 20px;
  margin-bottom: 20px;
}

:deep(.el-upload-list__item-actions) {
  opacity: 0.8;
}
</style>