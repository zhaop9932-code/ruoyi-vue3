<template>
  <div class="pricing-details">
    <div class="pricing-summary">
      <div class="summary-item total">
        <span class="label">配置总价</span>
        <span class="value">¥{{ formatPrice(totalPrice) }}</span>
      </div>
      
      <el-divider />
      
      <div v-if="discountInfo.discountAmount > 0" class="discount-info">
        <div class="summary-item">
          <span class="label">原价</span>
          <span class="value">¥{{ formatPrice(totalPrice + discountInfo.discountAmount) }}</span>
        </div>
        <div class="summary-item discount">
          <span class="label">
            <el-icon><Discount /></el-icon>
            {{ discountInfo.discountName }}
          </span>
          <span class="value">-¥{{ formatPrice(discountInfo.discountAmount) }}</span>
        </div>
      </div>
    </div>
    
    <div class="pricing-breakdown">
      <div class="breakdown-header">
        <h4>价格明细</h4>
        <el-button type="text" size="small" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出明细
        </el-button>
      </div>
      
      <div v-if="pricingBreakdown.length === 0" class="empty-breakdown">
        <el-empty description="暂无价格明细" :image-size="80" />
      </div>
      
      <div v-else class="breakdown-list">
        <div
          v-for="(item, index) in pricingBreakdown"
          :key="index"
          class="breakdown-item"
        >
          <div class="item-header">
            <span class="item-name">{{ item.nodeName }}</span>
            <el-tag size="small" type="info">{{ item.productName }}</el-tag>
          </div>
          
          <div class="item-details">
            <div class="detail-row">
              <span class="detail-label">单价:</span>
              <span class="detail-value">¥{{ formatPrice(item.unitPrice) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">数量:</span>
              <span class="detail-value">{{ item.quantity }}</span>
            </div>
            <div class="detail-row subtotal">
              <span class="detail-label">小计:</span>
              <span class="detail-value">¥{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 价格趋势图 -->
    <el-card v-if="showTrend" class="price-trend" shadow="never">
      <template #header>
        <span>价格趋势</span>
      </template>
      <div ref="chartRef" class="trend-chart"></div>
    </el-card>
    
    <!-- 成本分析 -->
    <el-card v-if="pricingBreakdown.length > 0" class="cost-analysis" shadow="never">
      <template #header>
        <span>成本分析</span>
      </template>
      
      <div class="analysis-chart">
        <div
          v-for="(item, index) in costDistribution"
          :key="index"
          class="analysis-item"
        >
          <div class="item-info">
            <span class="item-label">{{ item.label }}</span>
            <span class="item-percent">{{ item.percent }}%</span>
          </div>
          <el-progress
            :percentage="item.percent"
            :color="item.color"
            :show-text="false"
          />
          <span class="item-amount">¥{{ formatPrice(item.amount) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="pricing-actions">
      <el-button :icon="Share" @click="handleShare">分享配置</el-button>
      <el-button type="primary" :icon="DocumentCopy" @click="handleGenerateQuote">
        生成报价单
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Discount, Download, Share, DocumentCopy } from '@element-plus/icons-vue'

const props = defineProps({
  pricingBreakdown: {
    type: Array,
    default: () => []
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  discountInfo: {
    type: Object,
    default: () => ({
      discountName: '',
      discountAmount: 0
    })
  }
})

const chartRef = ref(null)
const showTrend = ref(false)

// 成本分布
const costDistribution = computed(() => {
  if (props.pricingBreakdown.length === 0) return []
  
  const distribution = []
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  
  props.pricingBreakdown.forEach((item, index) => {
    const percent = Math.round((item.subtotal / props.totalPrice) * 100)
    distribution.push({
      label: item.nodeName,
      amount: item.subtotal,
      percent,
      color: colors[index % colors.length]
    })
  })
  
  return distribution.sort((a, b) => b.amount - a.amount)
})

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 导出明细
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

// 分享配置
const handleShare = () => {
  ElMessage.success('分享功能开发中')
}

// 生成报价单
const handleGenerateQuote = () => {
  ElMessage.success('生成报价单功能开发中')
}

// 监听价格变化
watch(
  () => props.pricingBreakdown,
  (newVal) => {
    if (newVal.length > 0) {
      // 可以在这里初始化价格趋势图
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.pricing-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  overflow: auto;
  
  .pricing-summary {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .value {
        font-size: 16px;
        font-weight: 600;
      }
      
      &.total {
        .label {
          font-size: 16px;
          font-weight: 600;
        }
        
        .value {
          font-size: 28px;
          font-weight: 700;
        }
      }
      
      &.discount {
        .label {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ffd700;
        }
        
        .value {
          color: #ffd700;
        }
      }
    }
    
    .el-divider {
      border-color: rgba(255, 255, 255, 0.3);
      margin: 16px 0;
    }
    
    .discount-info {
      .summary-item {
        margin-bottom: 8px;
      }
    }
  }
  
  .pricing-breakdown {
    flex-shrink: 0;
    
    .breakdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e4e7ed;
      
      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
      }
    }
    
    .empty-breakdown {
      padding: 20px 0;
    }
    
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .breakdown-item {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 8px;
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .item-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .item-details {
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            font-size: 13px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .detail-label {
              color: #606266;
            }
            
            .detail-value {
              color: #303133;
              font-weight: 500;
            }
            
            &.subtotal {
              margin-top: 4px;
              padding-top: 8px;
              border-top: 1px solid #e4e7ed;
              
              .detail-label {
                font-weight: 600;
              }
              
              .detail-value {
                font-size: 15px;
                font-weight: 700;
                color: #f56c6c;
              }
            }
          }
        }
      }
    }
  }
  
  .cost-analysis {
    flex-shrink: 0;
    
    .analysis-chart {
      .analysis-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .item-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          
          .item-label {
            font-size: 13px;
            color: #606266;
          }
          
          .item-percent {
            font-size: 13px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .item-amount {
          display: inline-block;
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
  
  .pricing-actions {
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
    
    .el-button {
      flex: 1;
    }
  }
}
</style>
