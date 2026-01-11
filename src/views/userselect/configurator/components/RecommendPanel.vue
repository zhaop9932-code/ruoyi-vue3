<template>
  <div class="recommend-panel">
    <div class="panel-header">
      <h3>智能推荐</h3>
      <el-button type="primary" size="small" :icon="Refresh" @click="loadRecommendations">
        刷新推荐
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" class="recommend-tabs">
      <el-tab-pane label="热门方案" name="popular">
        <div v-loading="loading" class="recommendations-list">
          <div
            v-for="item in popularRecommendations"
            :key="item.id"
            class="recommend-item"
            @click="handleSelectRecommend(item)"
          >
            <div class="item-header">
              <el-icon :size="20" color="#409eff"><Star /></el-icon>
              <span class="item-title">{{ item.title }}</span>
              <el-tag size="small" type="warning">热门</el-tag>
            </div>
            
            <div class="item-content">
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-stats">
                <span><el-icon><User /></el-icon> {{ item.usageCount }} 人使用</span>
                <span><el-icon><Star /></el-icon> {{ item.rating }} 分</span>
              </div>
            </div>
            
            <div class="item-footer">
              <span class="item-price">¥{{ item.estimatedPrice }}</span>
              <el-button type="primary" size="small" @click.stop="handleApply(item)">
                应用方案
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="popularRecommendations.length === 0" description="暂无推荐方案" />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="个性化推荐" name="personalized">
        <div v-loading="loading" class="recommendations-list">
          <div
            v-for="item in personalizedRecommendations"
            :key="item.id"
            class="recommend-item"
            @click="handleSelectRecommend(item)"
          >
            <div class="item-header">
              <el-icon :size="20" color="#67c23a"><MagicStick /></el-icon>
              <span class="item-title">{{ item.title }}</span>
              <el-tag size="small" type="success">为你推荐</el-tag>
            </div>
            
            <div class="item-content">
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-match">
                <span>匹配度:</span>
                <el-progress
                  :percentage="item.matchRate"
                  :color="getMatchColor(item.matchRate)"
                  :show-text="true"
                  style="width: 120px;"
                />
              </div>
            </div>
            
            <div class="item-footer">
              <span class="item-price">¥{{ item.estimatedPrice }}</span>
              <el-button type="success" size="small" @click.stop="handleApply(item)">
                应用方案
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="personalizedRecommendations.length === 0" description="暂无个性化推荐" />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="历史配置" name="history">
        <div v-loading="loading" class="recommendations-list">
          <div
            v-for="item in historyConfigurations"
            :key="item.id"
            class="recommend-item"
            @click="handleSelectRecommend(item)"
          >
            <div class="item-header">
              <el-icon :size="20" color="#909399"><Clock /></el-icon>
              <span class="item-title">{{ item.title }}</span>
              <el-tag size="small" type="info">{{ formatDate(item.createdTime) }}</el-tag>
            </div>
            
            <div class="item-content">
              <p class="item-desc">{{ item.description }}</p>
            </div>
            
            <div class="item-footer">
              <span class="item-price">¥{{ item.totalPrice }}</span>
              <el-button type="info" size="small" plain @click.stop="handleApply(item)">
                加载配置
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="historyConfigurations.length === 0" description="暂无历史配置" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Star, User, MagicStick, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  currentConfig: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['apply-recommend'])

const loading = ref(false)
const activeTab = ref('popular')
const popularRecommendations = ref([])
const personalizedRecommendations = ref([])
const historyConfigurations = ref([])

const getMatchColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadRecommendations = async () => {
  loading.value = true
  try {
    // 模拟加载推荐数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    popularRecommendations.value = [
      {
        id: 1,
        title: '高性能服务器配置',
        description: '适用于企业级应用，高并发场景',
        usageCount: 1205,
        rating: 4.8,
        estimatedPrice: 15800
      },
      {
        id: 2,
        title: '标准商用配置',
        description: '性价比高，适合中小型企业',
        usageCount: 856,
        rating: 4.6,
        estimatedPrice: 8900
      }
    ]
    
    personalizedRecommendations.value = [
      {
        id: 3,
        title: '定制化方案A',
        description: '根据您的使用习惯推荐',
        matchRate: 92,
        estimatedPrice: 12500
      },
      {
        id: 4,
        title: '定制化方案B',
        description: '性能与成本的最佳平衡',
        matchRate: 85,
        estimatedPrice: 10200
      }
    ]
    
    historyConfigurations.value = [
      {
        id: 5,
        title: '2024-01-03 的配置',
        description: '包含8个节点的完整配置',
        totalPrice: 13600,
        createdTime: '2024-01-03'
      }
    ]
  } catch (error) {
    console.error('加载推荐失败:', error)
    ElMessage.error('加载推荐失败')
  } finally {
    loading.value = false
  }
}

const handleSelectRecommend = (item) => {
  console.log('选择推荐:', item)
}

const handleApply = (item) => {
  emit('apply-recommend', item.configuration || {})
  ElMessage.success('方案应用成功')
}

onMounted(() => {
  loadRecommendations()
})
</script>

<style scoped lang="scss">
.recommend-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .recommend-tabs {
    flex: 1;
    overflow: hidden;
    
    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      overflow: auto;
    }
  }
  
  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .recommend-item {
      padding: 16px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        border-color: #409eff;
      }
      
      .item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .item-title {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .item-content {
        margin-bottom: 12px;
        
        .item-desc {
          margin: 0 0 8px;
          font-size: 13px;
          color: #606266;
          line-height: 1.6;
        }
        
        .item-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;
          
          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
        
        .item-match {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #606266;
        }
      }
      
      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #f0f2f5;
        
        .item-price {
          font-size: 18px;
          font-weight: 700;
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
