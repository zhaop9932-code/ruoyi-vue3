<template>
  <div class="configuration-summary">
    <el-card class="summary-card" shadow="never">
      <!-- 配置清单 -->
      <div class="config-list">
        <h4>配置清单</h4>
        
        <div v-if="pricing.breakdown.length > 0" class="product-list">
          <div
            v-for="(item, index) in pricing.breakdown"
            :key="item.nodeId || index"
            class="product-item"
          >
            <div class="product-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-spec">
                {{ item.specification }}
                <span class="quantity">×{{ item.quantity }}</span>
              </div>
            </div>
            <div class="product-amount">¥{{ item.totalPrice.toFixed(2) }}</div>
          </div>
        </div>
        
        <el-empty
          v-else
          description="暂无配置项"
          :image-size="80"
        />
      </div>

      <el-divider />

      <!-- 费用汇总 -->
      <div class="cost-summary">
        <h4>费用汇总</h4>
        
        <div class="cost-details">
          <div class="cost-item">
            <span class="cost-label">产品价格</span>
            <span class="cost-value">¥{{ (pricing.productPrice || pricing.totalPrice).toFixed(2) }}</span>
        
          </div>
          <div class="cost-item">
            <span class="cost-label">服务费用</span>
            <span class="cost-value">¥{{ (pricing.servicePrice || 0).toFixed(2) }}</span>
          </div>
          <div class="cost-item cost-divider">
            <span class="cost-label">未税总价</span>
            <span class="cost-value">¥{{ (pricing.subtotal || pricing.totalPrice).toFixed(2) }}</span>
          </div>
          <div class="cost-item total">
            <span class="cost-label">含税总价</span>
            <span class="cost-value">¥{{ pricing.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>


    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import useConfiguratorStore from '@/store/modules/configurator'

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


</script>

<style scoped lang="scss">
.configuration-summary {
  height: 100%;
  padding: 3px;
  overflow: auto;

  .summary-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    :deep(.el-card__header) {
      padding: 12px 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
    }
    
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      // padding: 12px;
      overflow: auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .config-list {
      flex: 1;
      min-height: 150px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
      }

      .product-list {
        overflow: hidden;
        border-radius: 4px;
        border: 1px solid #ebeef5;
      }
      
      .product-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #fafafa;
        }
      }
      
      .product-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      
      .product-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .product-spec {
        font-size: 11px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
      }
      
      .product-spec .quantity {
        margin-left: 4px;
        color: #606266;
        font-weight: 500;
      }
      
      .product-amount {
        font-size: 12px;
        font-weight: 600;
        color: #f56c6c;
        margin: 0 16px;
        min-width: 60px;
        text-align: right;
      }
      
    }

    .cost-summary {
      h4 {
        margin: 8px 0 8px;
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;
      }

      .cost-details {
        background-color: #fafafa;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 10px;
      }
      
      .cost-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        padding: 4px 0;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &.cost-divider {
          border-top: 1px solid #e4e7ed;
          border-bottom: 1px solid #e4e7ed;
          margin: 8px 0;
          padding: 6px 0;
        }
        
        &.total {
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px solid #409eff;
        }
      }
      
      .cost-label {
        font-size: 12px;
        color: #606266;
        flex: 1;
      }
      
      .cost-value {
        font-size: 12px;
        font-weight: 600;
        color: #303133;
        text-align: right;
        min-width: 60px;
        margin: 0 8px;
      }
      
      .cost-desc {
        font-size: 10px;
        color: #909399;
        flex: 1;
        text-align: right;
      }
      
      .cost-item.total .cost-label {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
      }
      
      .cost-item.total .cost-value {
        font-size: 14px;
        color: #f56c6c;
      }
    }
  }
}
</style>
