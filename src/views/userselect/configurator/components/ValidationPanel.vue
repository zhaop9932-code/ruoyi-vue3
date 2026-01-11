<template>
  <div class="validation-panel">
    <div v-if="errors.length === 0 && validationResults.length > 0" class="success-state">
      <el-result
        icon="success"
        title="验证通过"
        sub-title="所有配置均符合规则要求"
      >
        <template #icon>
          <el-icon :size="80" color="#67c23a">
            <CircleCheck />
          </el-icon>
        </template>
        <template #extra>
          <el-button type="success" @click="handleExport">导出配置</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-else-if="errors.length > 0" class="error-state">
      <el-alert
        title="配置验证失败"
        type="error"
        :description="`发现 ${errors.length} 个配置错误，请及时修复`"
        show-icon
        :closable="false"
      />
      
      <div class="errors-list">
        <div
          v-for="(error, index) in errors"
          :key="index"
          class="error-item"
        >
          <div class="error-header">
            <el-icon :size="20" color="#f56c6c">
              <WarningFilled />
            </el-icon>
            <span class="error-title">{{ error.ruleName }}</span>
            <el-tag type="danger" size="small">错误</el-tag>
          </div>
          
          <div class="error-content">
            <p class="error-message">{{ error.message }}</p>
            <el-button
              type="primary"
              size="small"
              text
              @click="handleFixError(error)"
            >
              <el-icon><Tools /></el-icon>
              立即修复
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="暂无验证结果，请先配置节点" />
    </div>
    
    <!-- 规则验证详情 -->
    <el-card v-if="validationResults.length > 0" class="validation-details" shadow="never">
      <template #header>
        <span>规则验证详情</span>
      </template>
      
      <el-table :data="validationResults" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="ruleName" label="规则名称" min-width="200" />
        <el-table-column label="验证状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.passed ? 'success' : 'danger'">
              {{ row.passed ? '通过' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="说明" min-width="200" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              v-if="!row.passed"
              type="text"
              size="small"
              @click="handleFixError(row)"
            >
              修复
            </el-button>
            <span v-else style="color: #67c23a;">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { CircleCheck, WarningFilled, Tools } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  validationResults: {
    type: Array,
    default: () => []
  },
  errors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['fix-error'])

const handleFixError = (error) => {
  emit('fix-error', error)
}

const handleExport = () => {
  ElMessage.success('配置导出功能开发中')
}
</script>

<style scoped lang="scss">
.validation-panel {
  .success-state {
    padding: 40px 0;
  }
  
  .error-state {
    .errors-list {
      margin-top: 20px;
      
      .error-item {
        margin-bottom: 16px;
        padding: 16px;
        background: #fef0f0;
        border: 1px solid #fde2e2;
        border-radius: 8px;
        
        .error-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          
          .error-title {
            flex: 1;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .error-content {
          .error-message {
            margin: 0 0 12px;
            padding-left: 28px;
            color: #606266;
            line-height: 1.6;
          }
        }
      }
    }
  }
  
  .validation-details {
    margin-top: 20px;
  }
}
</style>
