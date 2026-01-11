<template>
  <div class="product-tree">
    <div class="tree-header">
      <el-input
        v-model="searchText"
        placeholder="搜索节点..."
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
    </div>
    
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      node-key="bomStructureId"
      :default-expanded-keys="expandedKeys"
      :highlight-current="true"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <el-icon :class="getNodeIconClass(data)">
            <component :is="getNodeIcon(data)" />
          </el-icon>
          <span class="node-label" :title="data.nodeName">{{ data.nodeName }}</span>
          <div class="node-badges">
            <el-tag
              v-if="data.isRequired === '1'"
              size="small"
              type="danger"
              effect="plain"
            >
              必选
            </el-tag>
            <el-tag
              v-if="data.selectionType === 'single'"
              size="small"
              type="info"
              effect="plain"
            >
              单选
            </el-tag>
            <el-tag
              v-if="data.selectionType === 'multiple'"
              size="small"
              type="info"
              effect="plain"
            >
              多选
            </el-tag>
            <el-badge
              v-if="data.status === 'error'"
              :value="'!'"
              type="danger"
            />
            <el-icon
              v-if="data.status === 'configured'"
              class="status-icon success"
              :size="16"
            >
              <CircleCheck />
            </el-icon>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, CircleCheck, Box, Setting, Service } from '@element-plus/icons-vue'
import useConfiguratorStore from '@/store/modules/configurator'

const props = defineProps({
  bomId: {
    type: [Number, String],
    required: true
  },
  treeData: {
    type: Array,
    default: () => []
  },
  configuredNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['node-select'])

const treeRef = ref()
const searchText = ref('')
const expandedKeys = ref([])

const treeProps = {
  children: 'children',
  label: 'nodeName'
}

// 获取节点图标
const getNodeIcon = (node) => {
  const iconMap = {
    '0': Box,      // 物料
    '1': Setting,  // 组件
    '2': Service   // 服务
  }
  return iconMap[node.nodeType] || Box
}

// 获取节点图标样式类
const getNodeIconClass = (node) => {
  return [
    'node-icon',
    `node-type-${node.nodeType}`,
    `status-${node.status}`,
    {
      'disabled': node.isDisabled,
      'hidden': !node.isVisible
    }
  ]
}

// 节点点击事件
const handleNodeClick = (data) => {
  if (data.status !== 'disabled' && data.isVisible) {
    emit('node-select', data)
  }
}

// 搜索节点
const handleSearch = (value) => {
  treeRef.value.filter(value)
}

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true
  return data.nodeName.toLowerCase().includes(value.toLowerCase()) ||
         data.nodeCode.toLowerCase().includes(value.toLowerCase())
}

// 处理节点配置状态
const updateNodeStatus = (nodes, configuredNodes) => {
  const configuredIds = new Set(configuredNodes.map(node => node.bomStructureId))
  
  const updateStatus = (nodes) => {
    nodes.forEach(node => {
      // 设置节点状态
      if (configuredIds.has(node.bomStructureId)) {
        node.status = 'configured'
      } else {
        node.status = 'pending'
      }
      
      if (node.children && node.children.length > 0) {
        updateStatus(node.children)
      }
    })
  }
  
  updateStatus(nodes)
}

// 监听树数据变化，自动展开第一层
watch(
  () => props.treeData,
  (newData) => {
    if (newData && newData.length > 0) {
      expandedKeys.value = [newData[0].bomStructureId]
      updateNodeStatus(newData, props.configuredNodes)
    }
  },
  { immediate: true, deep: true }
)

// 监听已配置节点变化，更新节点状态
watch(
  () => props.configuredNodes,
  (newConfiguredNodes) => {
    if (props.treeData.length > 0) {
      updateNodeStatus(props.treeData, newConfiguredNodes)
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.product-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  
  .tree-header {
    margin-bottom: 16px;
  }
  
  .el-tree {
    flex: 1;
    overflow: auto;
    
    :deep(.el-tree-node__content) {
      height: 40px;
      padding: 0 12px;
    }
  }
  
  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;
    
    .node-icon {
      flex-shrink: 0;
      font-size: 16px;
      color: #606266;
      
      &.status-configured {
        color: #67c23a;
      }
      
      &.status-error {
        color: #f56c6c;
      }
      
      &.disabled {
        color: #c0c4cc;
      }
      
      &.hidden {
        opacity: 0.5;
      }
    }
    
    .node-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
    }
    
    .node-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    
    .status-icon {
      &.success {
        color: #67c23a;
      }
    }
  }
}
</style>