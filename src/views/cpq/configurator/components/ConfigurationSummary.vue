<template>
  <div class="configuration-summary">
    <el-card class="summary-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>配置摘要</span>
          <el-tag :type="statusType">{{ statusText }}</el-tag>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="statistics">
        <el-row :gutter="12">
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-value">{{ summary.totalNodes }}</div>
              <div class="stat-label">总节点数</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item success">
              <div class="stat-value">{{ summary.configuredNodes }}</div>
              <div class="stat-label">已配置</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item danger">
              <div class="stat-value">{{ summary.requiredNodes }}</div>
              <div class="stat-label">必选项</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item warning">
              <div class="stat-value">{{ summary.errors }}</div>
              <div class="stat-label">错误</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <!-- 已选配置列表 -->
      <div class="configured-list">
        <div class="list-header">
          <h4>已选配置</h4>
          <el-tag v-if="configuredNodes.length > 0" size="small" type="success">
            {{ configuredNodes.length }} 项
          </el-tag>
        </div>
        
        <el-scrollbar v-if="configuredNodes.length > 0" max-height="280px">
          <div
            v-for="node in configuredNodes"
            :key="node.bomStructureId"
            class="config-item"
          >
            <div class="item-header">
              <el-icon :size="18">
                <component :is="getNodeIcon(node)" />
              </el-icon>
              <span class="item-name">{{ node.nodeName }}</span>
              <el-tag size="small" type="info">x{{ node.quantity }}</el-tag>
            </div>
            <div v-if="node.configuration" class="item-details">
              <div
                v-for="(value, key) in getFilteredConfig(node.configuration)"
                :key="key"
                class="detail-row"
              >
                <span class="detail-label">{{ formatKey(key) }}:</span>
                <span class="detail-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
        
        <el-empty
          v-else
          description="暂无配置项"
          :image-size="80"
        />
      </div>

      <el-divider />

      <!-- 价格明细 -->
      <div class="pricing-section">
        <h4>价格明细</h4>
        
        <div v-if="pricing.breakdown.length > 0" class="price-breakdown">
          <div
            v-for="item in pricing.breakdown"
            :key="item.nodeId"
            class="price-item"
          >
            <span class="price-name">{{ item.nodeName }}</span>
            <span class="price-detail">
              ¥{{ item.unitPrice.toFixed(2) }} × {{ item.quantity }}
            </span>
            <span class="price-total">¥{{ item.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        
        <el-empty
          v-else
          description="暂无价格信息"
          :image-size="60"
        />
        
        <div v-if="pricing.totalPrice > 0" class="total-price">
          <span>总价：</span>
          <span class="price-value">¥{{ pricing.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="summary-actions">
        <el-button :icon="RefreshLeft" @click="handleReset">
          重置配置
        </el-button>
        <el-button type="primary" :icon="Select" @click="handleComplete">
          完成配置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RefreshLeft, Select, Box, Setting, Service } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useConfiguratorStore } from '@/store/modules/configurator'

const configuratorStore = useConfiguratorStore()

// 配置摘要
const summary = computed(() => configuratorStore.configurationSummary)

// 已配置节点
const configuredNodes = computed(() => configuratorStore.configuredNodes)

// 价格信息
const pricing = computed(() => configuratorStore.pricing)

// 状态文本
const statusText = computed(() => {
  const status = configuratorStore.configSession.status
  const statusMap = {
    draft: '配置中',
    saved: '已保存',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
})

// 状态类型
const statusType = computed(() => {
  const status = configuratorStore.configSession.status
  const typeMap = {
    draft: 'info',
    saved: 'warning',
    completed: 'success'
  }
  return typeMap[status] || 'info'
})

// 获取节点图标
const getNodeIcon = (node) => {
  const iconMap = {
    '0': Box,
    '1': Setting,
    '2': Service
  }
  return iconMap[node.nodeType] || Box
}

// 过滤配置对象（排除quantity和selectedProductId）
const getFilteredConfig = (config) => {
  const filtered = { ...config }
  delete filtered.quantity
  delete filtered.selectedProductId
  return filtered
}

// 格式化键名
const formatKey = (key) => {
  // 简单的驼峰命名转中文（可根据实际需要优化）
  return key.replace(/([A-Z])/g, ' $1').trim()
}

// 格式化值
const formatValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

// 重置配置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确认要重置所有配置吗？此操作不可撤销。',
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )

    configuratorStore.resetConfiguration()
    ElMessage.success('配置已重置')
  } catch (error) {
    // 用户取消
  }
}

// 完成配置
const handleComplete = async () => {
  const success = await configuratorStore.completeConfiguration()
  
  if (success) {
    ElMessageBox.confirm(
      '配置已完成！您可以：',
      '配置完成',
      {
        type: 'success',
        confirmButtonText: '生成报价',
        cancelButtonText: '保存配置',
        distinguishCancelAndClose: true
      }
    ).then(() => {
      // 跳转到报价生成页面
      ElMessage.info('跳转到报价生成...')
    }).catch(action => {
      if (action === 'cancel') {
        // 保存配置
        configuratorStore.saveConfigSession()
      }
    })
  }
}
</script>

<style scoped lang="scss">
.configuration-summary {
  height: 100%;
  padding: 16px;
  overflow: auto;

  .summary-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    :deep(.el-card__header) {
      padding: 16px 20px;
      background-color: #f5f7fa;
    }
    
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow: auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .statistics {
      .el-row {
        margin: -6px;
      }
      
      .el-col {
        padding: 6px;
      }
      
      .stat-item {
        padding: 12px;
        text-align: center;
        background-color: #f5f7fa;
        border-radius: 6px;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
        
        .stat-label {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
        
        &.success .stat-value {
          color: #67c23a;
        }
        
        &.danger .stat-value {
          color: #f56c6c;
        }
        
        &.warning .stat-value {
          color: #e6a23c;
        }
      }
    }

    .configured-list {
      flex: 1;
      min-height: 200px;
      
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
      }

      .config-item {
        padding: 12px;
        margin-bottom: 12px;
        background-color: #f5f7fa;
        border-radius: 6px;
        border-left: 3px solid #409eff;
        transition: all 0.2s;
        
        &:hover {
          background-color: #ecf5ff;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;

          .el-icon {
            color: #409eff;
          }

          .item-name {
            flex: 1;
            font-weight: 600;
            font-size: 14px;
            color: #303133;
          }
        }

        .item-details {
          padding-left: 26px;

          .detail-row {
            display: flex;
            margin-bottom: 4px;
            font-size: 12px;
            line-height: 20px;

            .detail-label {
              min-width: 80px;
              color: #909399;
            }

            .detail-value {
              flex: 1;
              color: #606266;
              word-break: break-all;
            }
          }
        }
      }
    }

    .pricing-section {
      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
      }

      .price-breakdown {
        .price-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          margin-bottom: 8px;
          background-color: #f5f7fa;
          border-radius: 6px;

          .price-name {
            flex: 1;
            font-size: 13px;
            color: #303133;
          }

          .price-detail {
            font-size: 12px;
            color: #909399;
          }

          .price-total {
            font-weight: 600;
            color: #f56c6c;
            font-size: 14px;
          }
        }
      }

      .total-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;

        .price-value {
          font-size: 24px;
        }
      }
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
