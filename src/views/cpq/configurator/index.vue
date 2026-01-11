<template>
  <div class="product-configurator">
    <!-- 头部 -->
    <div class="configurator-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
        <div class="header-info">
          <h2>{{ bomName || '产品配置器' }}</h2>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/cpq/configurator' }">产品配置器</el-breadcrumb-item>
            <el-breadcrumb-item>{{ bomName || '配置详情' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="sessionStatusType">{{ sessionStatusText }}</el-tag>
        <el-button :icon="Refresh" @click="handleReload">刷新</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div v-loading="loading" class="configurator-content">
      <el-container>
        <!-- 左侧：产品结构树 -->
        <el-aside width="320px" class="tree-panel">
          <ProductTree
            :bom-id="bomId"
            @node-select="handleNodeSelect"
          />
        </el-aside>

        <!-- 中间：配置面板 -->
        <el-main class="config-panel">
          <AttributeConfig
            :current-node="selectedNode"
            @config-confirm="handleConfigConfirm"
          />
        </el-main>

        <!-- 右侧：配置摘要 -->
        <el-aside width="360px" class="summary-panel">
          <ConfigurationSummary />
        </el-aside>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useConfiguratorStore } from '@/store/modules/configurator'
import ProductTree from './components/ProductTree.vue'
import AttributeConfig from './components/AttributeConfig.vue'
import ConfigurationSummary from './components/ConfigurationSummary.vue'

const route = useRoute()
const router = useRouter()
const configuratorStore = useConfiguratorStore()

// BOM ID和名称（从路由参数获取）
const bomId = ref(route.params.bomId)
const bomName = ref(route.query.bomName || '')

// 当前选中的节点
const selectedNode = ref(null)

// 加载状态
const loading = computed(() => configuratorStore.loading.bom || configuratorStore.loading.rules)

// 会话状态文本
const sessionStatusText = computed(() => {
  const status = configuratorStore.configSession.status
  const statusMap = {
    draft: '配置中',
    saved: '已保存',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
})

// 会话状态类型
const sessionStatusType = computed(() => {
  const status = configuratorStore.configSession.status
  const typeMap = {
    draft: 'info',
    saved: 'warning',
    completed: 'success'
  }
  return typeMap[status] || 'info'
})

// 处理节点选择
const handleNodeSelect = (node) => {
  selectedNode.value = node
}

// 处理配置确认
const handleConfigConfirm = () => {
  selectedNode.value = null
}

// 返回列表
const handleBack = async () => {
  // 检查是否有未保存的配置
  if (configuratorStore.configSession.status === 'draft' && 
      Object.keys(configuratorStore.configSession.configuration).length > 0) {
    try {
      await ElMessageBox.confirm(
        '当前配置尚未保存，确定要返回吗？',
        '提示',
        {
          confirmButtonText: '保存并返回',
          cancelButtonText: '直接返回',
          distinguishCancelAndClose: true,
          type: 'warning'
        }
      )
      // 用户选择保存并返回
      await configuratorStore.saveConfigSession()
      router.push({ name: 'CpqConfigurator' })
    } catch (action) {
      if (action === 'cancel') {
        // 用户选择直接返回
        router.push({ name: 'CpqConfigurator' })
      }
      // 用户选择关闭弹窗，不做任何操作
    }
  } else {
    router.push({ name: 'CpqConfigurator' })
  }
}

// 刷新配置器
const handleReload = async () => {
  await configuratorStore.loadBomStructure(bomId.value)
  selectedNode.value = null
}

// 初始化
onMounted(async () => {
  if (!bomId.value) {
    ElMessage.error('缺少BOM ID参数')
    router.push({ name: 'CpqConfigurator' })
    return
  }
  
  try {
    await configuratorStore.loadBomStructure(bomId.value)
  } catch (error) {
    console.error('加载BOM结构失败:', error)
    ElMessage.error('加载BOM结构失败')
    // 加载失败后返回列表
    setTimeout(() => {
      router.push({ name: 'CpqConfigurator' })
    }, 2000)
  }
})
</script>

<style scoped lang="scss">
.product-configurator {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  .configurator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-info {
        h2 {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 600;
        }

        .el-breadcrumb {
          font-size: 14px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .configurator-content {
    flex: 1;
    overflow: hidden;

    .el-container {
      height: 100%;
    }

    .tree-panel,
    .config-panel,
    .summary-panel {
      background-color: #fff;
      border-right: 1px solid #e4e7ed;
    }

    .config-panel {
      border-right: none;
    }

    .summary-panel {
      border-right: none;
    }
  }
}
</style>
