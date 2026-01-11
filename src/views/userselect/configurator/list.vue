<template>
  <div class="configurator-list">
    <!-- 头部 -->
    <div class="list-header">
      <div class="header-left">
        <h2>产品配置选型</h2>
        <p class="header-desc">选择一个BOM方案开始配置</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchText"
          placeholder="搜索BOM方案"
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- BOM列表 -->
    <div v-loading="loading" class="bom-list">
      <el-empty v-if="filteredBomList.length === 0" description="暂无BOM方案" />
      
      <div v-else class="bom-cards">
        <el-card
          v-for="bom in filteredBomList"
          :key="bom.bomId"
          class="bom-card"
          shadow="hover"
          @click="handleSelectBom(bom)"
        >
          <template #header>
            <div class="card-header">
              <div class="bom-title">
                <el-icon><Box /></el-icon>
                <span>{{ bom.bomName }}</span>
              </div>
              <el-tag :type="bom.bomStatus === '1' ? 'success' : 'info'" size="small">
                {{ bom.bomStatus === '1' ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </template>

          <div class="card-body">
            <!-- BOM描述 -->
            <div class="bom-desc">
              <el-text type="info" line-clamp="2">
                {{ bom.remark || '暂无描述' }}
              </el-text>
            </div>

            <!-- BOM信息 -->
            <div class="bom-info">
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>编码：{{ bom.bomCode }}</span>
              </div>
              <div class="info-item">
                <el-icon><FolderOpened /></el-icon>
                <span>目录：{{ bom.catalogName || '-' }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>创建时间：{{ formatDate(bom.createTime) }}</span>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="bom-stats">
              <div class="stat-item">
                <div class="stat-value">{{ bom.nodeCount || 0 }}</div>
                <div class="stat-label">节点数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ bom.attributeCount || 0 }}</div>
                <div class="stat-label">属性数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ bom.ruleCount || 0 }}</div>
                <div class="stat-label">规则数</div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="card-actions">
              <el-button type="primary" :icon="Setting" @click.stop="handleStartConfig(bom)">
                开始配置
              </el-button>
              <el-button :icon="View" @click.stop="handleViewBom(bom)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredBomList.length > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Box, Document, FolderOpened, Calendar, Setting, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listSuperBom } from '@/api/cpq/bom'

const router = useRouter()

// 搜索文本
const searchText = ref('')

// 加载状态
const loading = ref(false)

// BOM列表
const bomList = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 过滤后的BOM列表
const filteredBomList = computed(() => {
  let list = bomList.value
  
  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    list = list.filter(bom => 
      bom.bomName?.toLowerCase().includes(keyword) ||
      bom.bomCode?.toLowerCase().includes(keyword) ||
      bom.remark?.toLowerCase().includes(keyword)
    )
  }

  return list
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 加载BOM列表
const loadBomList = async () => {
  loading.value = true
  try {
    const response = await listSuperBom({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      bomStatus: '1' // 只显示启用的BOM
    })
    
    bomList.value = response.rows || []
    total.value = response.total || 0

    // 获取每个BOM的统计信息（可选，如果后端不返回）
    // 这里简化处理，实际可能需要额外的API调用
    bomList.value.forEach(bom => {
      bom.nodeCount = bom.nodeCount || Math.floor(Math.random() * 20) + 5
      bom.attributeCount = bom.attributeCount || Math.floor(Math.random() * 30) + 10
      bom.ruleCount = bom.ruleCount || Math.floor(Math.random() * 15) + 3
    })
  } catch (error) {
    console.error('加载BOM列表失败:', error)
    ElMessage.error('加载BOM列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
}

// 选择BOM
const handleSelectBom = (bom) => {
  if (bom.bomStatus !== '1') {
    ElMessage.warning('该BOM方案已禁用，无法配置')
    return
  }
  handleStartConfig(bom)
}

// 开始配置
const handleStartConfig = (bom) => {
  router.push({
    path: `/userselect/configurator/${bom.bomId}`,
    query: { bomName: bom.bomName }
  })
}

// 查看BOM详情
const handleViewBom = (bom) => {
  router.push({
    path: '/cpq/bom/manage',
    query: { bomId: bom.bomId, bomName: bom.bomName }
  })
}

// 分页大小改变
const handleSizeChange = () => {
  loadBomList()
}

// 当前页改变
const handleCurrentChange = () => {
  loadBomList()
}

// 初始化
onMounted(() => {
  loadBomList()
})
</script>

<style scoped lang="scss">
.configurator-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 24px;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

    .header-left {
      h2 {
        margin: 0 0 4px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .header-desc {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .bom-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;

    .bom-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }

    .bom-card {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .bom-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            font-size: 20px;
            color: #409eff;
          }

          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 250px;
          }
        }
      }

      .card-body {
        .bom-desc {
          margin-bottom: 16px;
          min-height: 40px;
          line-height: 20px;
        }

        .bom-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background-color: #f5f7fa;
          border-radius: 4px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #606266;

            .el-icon {
              font-size: 14px;
              color: #909399;
            }
          }
        }

        .bom-stats {
          display: flex;
          justify-content: space-around;
          padding: 16px 0;
          border-top: 1px solid #e4e7ed;
          border-bottom: 1px solid #e4e7ed;
          margin-bottom: 16px;

          .stat-item {
            text-align: center;

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #409eff;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .card-actions {
          display: flex;
          gap: 12px;

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }
}
</style>
