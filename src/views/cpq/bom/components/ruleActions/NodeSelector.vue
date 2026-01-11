<template>
  <el-form-item :label="label" :required="required">
    <!-- 树形数据加载完成后渲染el-tree-select -->
    <el-tree-select
      v-if="treeData.length > 0 && !loading"
      v-model="localSelectedValue"
      :data="treeData"
      :props="treeProps"
      :multiple="multiple"
      :check-strictly="checkStrictly"
      :render-after-expand="false"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      filterable
      :key="treeKey"
      style="width: 100%"
      @change="handleChange"
    />
    <!-- 树形数据加载中显示带加载状态的输入框 -->
    <el-input
      v-else
      :model-value="displayLoadingValue"
      :placeholder="loading ? '加载中...' : placeholder"
      :loading="loading"
      :disabled="true"
      readonly
      style="width: 100%"
    >
      <template #suffix v-if="loading">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </template>
    </el-input>
  </el-form-item>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { listByBomId } from '@/api/cpq/superBomStructure'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: () => ''
  },
  bomId: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    default: '节点'
  },
  placeholder: {
    type: String,
    default: '请选择当前BOM下树状节点'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const loading = ref(false)
const treeData = ref([])
// 本地选中值，单选模式下始终初始化为空字符串
const localSelectedValue = ref('')
// 用于标记是否正在处理回显，避免watchers循环
const isEchoProcessing = ref(false)

// 加载中时显示的值（单选模式）
const displayLoadingValue = computed(() => {
  if (loading.value) return '加载中...'
  
  const currentValue = props.modelValue
  if (!currentValue) return ''
  
  // 单选模式：直接查找结构名称
  return findStructureNameById(currentValue) || currentValue
})

// 根据结构ID查找结构名称
const findStructureNameById = (structureId, treeNodes = treeData.value) => {
  if (!structureId) return null
  
  for (const node of treeNodes) {
    // 使用宽松比较，处理数字和字符串类型不匹配的问题
    if (node.bomStructureId == structureId) {
      return node.nodeName
    }
    if (node.children && node.children.length > 0) {
      const name = findStructureNameById(structureId, node.children)
      if (name) return name
    }
  }
  return null
}

// 树形选择器配置
const treeProps = {
  children: 'children',
  label: 'nodeName',
  value: 'bomStructureId'
}

// 用于强制更新el-tree-select的key
const treeKey = ref(0)

// 加载BOM结构树
const loadBomStructure = async () => {
  if (!props.bomId) {
    ElMessage.warning('BOM ID为空，无法加载节点数据')
    return
  }
  
  loading.value = true
  try {
    const data = await listByBomId(props.bomId)
    let treeDataArray = []
    
    // 检查数据格式
    if (Array.isArray(data)) {
      treeDataArray = data
    } else if (data && data.code === 200 && Array.isArray(data.data)) {
      treeDataArray = data.data
    } else if (data && data.data) {
      treeDataArray = [data.data]
    } else {
      treeDataArray = []
    }
    
    if (treeDataArray.length > 0) {
      // 检查并转换treeDataArray，确保每个节点都有正确的字段名
      const processedTreeDataArray = treeDataArray.map(node => ({
        ...node,
        bomStructureId: node.bomStructureId || node.id || node.structureId || '',
        nodeName: node.nodeName || node.name || node.structureName || '未知节点'
      }))
      
      treeData.value = buildTree(processedTreeDataArray)
      console.log('BOM结构树加载成功，节点数量:', treeData.value.length)
    } else {
      treeData.value = []
      console.warn('BOM结构树数据为空数组')
    }
  } catch (error) {
    console.error('加载BOM结构树失败:', error)
    ElMessage.error('加载BOM结构树失败: ' + (error.message || '未知错误'))
    treeData.value = []
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildTree = (list) => {
  if (!list || list.length === 0) return []
  
  const map = {}  
  const roots = []
  
  // 创建映射
  list.forEach(item => {
    if (!item.bomStructureId) {
      console.warn('节点缺少bomStructureId:', item)
      return
    }
    
    map[item.bomStructureId] = {
      ...item,
      children: []
    }
  })
  
  // 构建树形结构
  list.forEach(item => {
    if (!item.bomStructureId) return
    
    if (item.parentNodeId && map[item.parentNodeId]) {
      map[item.parentNodeId].children.push(map[item.bomStructureId])
    } else {
      roots.push(map[item.bomStructureId])
    }
  })
  
  return roots
}

// 处理选择变化
const handleChange = (value) => {
  console.log('节点选择变化:', value)
  localSelectedValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 优化的回显处理函数（修复回显显示ID问题）
const handleEcho = async (value) => {
  if (!value || treeData.value.length === 0) {
    localSelectedValue.value = ''
    return
  }
  
  console.log('开始回显处理, 值:', value, '类型:', typeof value)
  
  isEchoProcessing.value = true
  
  try {
    // 1. 确保treeData中存在该结构ID，并获取匹配的实际节点（处理类型不匹配问题）
    let matchedNode = null
    const findNodeById = (id, nodes = treeData.value) => {
      for (const node of nodes) {
        if (node.bomStructureId == id) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeById(id, node.children)
          if (found) return found
        }
      }
      return null
    }
    
    matchedNode = findNodeById(value)
    
    if (!matchedNode) {
      console.warn('结构ID不在树形数据中:', value)
      localSelectedValue.value = ''
      return
    }
    
    console.log('匹配到的节点:', matchedNode)
    
    // 2. 使用节点实际的bomStructureId，确保类型一致
    const actualStructureId = matchedNode.bomStructureId
    const structureName = matchedNode.nodeName
    
    // 3. 清空localSelectedValue，确保组件重新渲染
    localSelectedValue.value = ''
    
    // 4. 等待组件更新
    await nextTick()
    
    // 5. 设置localSelectedValue为匹配到的实际结构ID（类型一致）
    localSelectedValue.value = actualStructureId
    
    console.log('回显处理完成，结构ID:', actualStructureId, '类型:', typeof actualStructureId, '结构名称:', structureName)
    
  } finally {
    isEchoProcessing.value = false
  }
}

// 监听bomId变化，重新加载树形数据
watch(() => props.bomId, async (newBomId) => {
  if (newBomId) {
    await loadBomStructure()
  }
}, { immediate: true })

// 监听树形数据变化，触发回显
watch(treeData, async (newTreeData) => {
  console.log('树形数据已更新，节点数量:', newTreeData.length)
  if (newTreeData.length > 0 && props.modelValue) {
    // 树形数据加载完成后，处理回显
    await handleEcho(props.modelValue)
  }
}, { deep: true })

// 监听props.modelValue变化，处理回显
watch(() => props.modelValue, async (newValue, oldValue) => {
  // 避免重复处理相同的值
  if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
    return
  }
  
  console.log('modelValue变化:', oldValue, '->', newValue)
  
  if (newValue) {
    if (treeData.value.length === 0) {
      // 如果树形数据未加载，先加载
      console.log('树形数据未加载，开始加载')
      await loadBomStructure()
    } else {
      // 如果树形数据已加载，直接回显
      await handleEcho(newValue)
    }
  } else {
    // 清空选择（单选模式）
    if (!isEchoProcessing.value) {
      localSelectedValue.value = ''
    }
  }
}, { immediate: true })

// 监听localSelectedValue变化，同步到modelValue
watch(localSelectedValue, (newValue) => {
  // 处理回显时不触发emit，避免循环
  if (!isEchoProcessing.value && JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
    console.log('localSelectedValue变化，触发emit:', newValue)
    emit('update:modelValue', newValue)
  }
})

onMounted(async () => {
  console.log('NodeSelector组件已挂载, bomId:', props.bomId, 'modelValue:', props.modelValue)
  await loadBomStructure()
})
</script>

<style scoped>
</style>
