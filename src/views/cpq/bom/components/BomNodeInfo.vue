<template>
  <div class="bom-node-info">
    
    
    <div class="node-content">
      <!-- 左侧节点树 -->
      <div class="node-tree-container">
        <div class="tree-header">
          <el-input
            v-model="filterText"
            placeholder="搜索节点名称"
            prefix-icon="Search"
            clearable
            size="small"
            style="width: 150px;"
          />
          <el-button
            type="primary"
            icon="Plus"
            @click="handleAddNode"
            size="small"
            style="margin-left: 8px;"
          >新增节点</el-button>
        </div>
        <el-tree
          ref="nodeTree"
          :data="nodeTreeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          @node-contextmenu="handleNodeContextMenu"
          node-key="bomStructureId"
          default-expand-all
          :highlight-current="true">
          <template #default="{ node, data }">
            <div class="tree-node">
              <span>{{ node.label }}</span>
              <el-dropdown @command="(command) => handleTreeNodeCommand(command, data)">
                <span class="tree-node-action">
                  <el-icon class="more-icon"><More /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="addChild">新增子节点</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑节点</el-dropdown-item>
                    <el-dropdown-item command="delete">删除节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-tree>
      </div>
      
      <!-- 右侧标签页内容 -->
      <div class="node-detail-container">
        <div v-if="!selectedNode" class="empty-detail">
          <el-empty description="请选择或新增一个节点" />
        </div>
        <el-tabs v-else v-model="activeTab" type="border-card">
          <el-tab-pane label="节点信息" name="nodeInfo">
            <bom-node-info-detail 
              :bom-id="bomId" 
              :bom-structure-id="selectedNode.bomStructureId"
              :selected-node="selectedNode"
            />
          </el-tab-pane>
          <el-tab-pane label="属性信息" name="attributes">
            <bom-node-attributes 
              :bom-id="bomId" 
              :node-name="selectedNode.nodeName"
              :bom-structure-id="selectedNode.bomStructureId"
            />
          </el-tab-pane>
          <el-tab-pane label="关联产品" name="products">
            <bom-node-products 
              :bom-id="bomId" 
              :bom-structure-id="selectedNode.bomStructureId"
            />
          </el-tab-pane>
          <el-tab-pane label="动态属性" name="dynamicProps">
            <bom-node-dynamic-props 
              :bom-id="bomId" 
              :bom-structure-id="selectedNode.bomStructureId"
            />
          </el-tab-pane>
          <el-tab-pane label="其他" name="other">
            <bom-node-other-info 
              :bom-id="bomId" 
              :bom-structure-id="selectedNode.bomStructureId"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="handleAddChildNode">
        <el-icon><Plus /></el-icon>
        <span>新增子节点</span>
      </div>
      <div class="menu-item" @click="handleEditContextNode">
        <el-icon><Edit /></el-icon>
        <span>编辑节点</span>
      </div>
      <div class="menu-item" @click="handleDeleteContextNode">
        <el-icon><Delete /></el-icon>
        <span>删除节点</span>
      </div>
    </div>
    
    <!-- 新增/编辑节点对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="dialogFormRef" :model="dialogNodeForm" :rules="rules" label-width="120px">
        <el-form-item label="节点编码" prop="nodeCode">
          <el-input v-model="dialogNodeForm.nodeCode" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="dialogNodeForm.nodeName" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="节点类型" prop="nodeType">
          <el-select v-model="dialogNodeForm.nodeType" placeholder="请选择节点类型">
            <el-option label="物料" value="0" />
            <el-option label="组件" value="1" />
            <el-option label="服务" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="父节点" prop="parentNodeId">
          <el-select v-model="dialogNodeForm.parentNodeId" placeholder="请选择父节点" :disabled="isRootNode">
            <el-option
              v-for="node in getAllNodes()"
              :key="node.bomStructureId"
              :label="node.nodeName"
              :value="node.bomStructureId"    
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="dialogNodeForm.quantity" :min="0" :step="1" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="dialogNodeForm.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogNodeForm.status" placeholder="请选择状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="dialogNodeForm.priority" :min="1" :max="10" :step="1" placeholder="请输入优先级" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogNodeForm.description" type="textarea" placeholder="请输入节点描述" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElTree, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Plus, Edit, Delete, Search, More } from '@element-plus/icons-vue'

// 导入子组件
import BomNodeInfoDetail from './BomNodeInfoDetail.vue'
import BomNodeAttributes from './BomNodeAttributes.vue'
import BomNodeProducts from './BomNodeProducts.vue'
import BomNodeDynamicProps from './BomNodeDynamicProps.vue'
import BomNodeOtherInfo from './BomNodeOtherInfo.vue'

// 导入BOM API
import { 
  listSuperBomStructureTree, 
  listSuperBomStructure,
  addSuperBomStructure, 
  updateSuperBomStructure, 
  deleteSuperBomStructure
} from '@/api/cpq/bom'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  }
})

// 树引用
const nodeTree = ref(null)

// 加载状态
const loading = ref(false)

// 搜索过滤
const filterText = ref('')

// 选中的节点
const selectedNode = ref(null)
const originalNode = ref(null)

// 激活的标签页
const activeTab = ref('nodeInfo')

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const contextMenuNode = ref(null)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增节点')
const isRootNode = ref(false)

// 表单引用
const dialogFormRef = ref(null)

// 节点树数据
const nodeTreeData = ref([])

// 树属性配置
const treeProps = {
  label: 'nodeName',
  children: 'children'
}

// 对话框表单数据
const dialogNodeForm = reactive({
  bomStructureId: null,
  bomId: props.bomId,
  nodeCode: '',
  nodeName: '',
  nodeType: '0', // 0：物料，1：组件，2：服务
  parentNodeId: null,
  quantity: 1,
  unit: '',
  status: 'enabled',
  priority: 1,
  description: '',
  children: [],
  isRequired: '0', // 是否必选（0：可选，1：必选）
  selectionType: 'single', // 选择类型（single：单选，multiple：多选）
  minSelection: 0, // 最少选择数量
  maxSelection: 0, // 最多选择数量
  isQuantityEditable: '1', // 数量是否可编辑
  icon: '', // 图标
  nodeDescription: '' // 节点说明
})

// 表单验证规则
const rules = reactive({
  nodeName: [
    { required: true, message: '节点名称不能为空', trigger: 'blur' }
  ],
  nodeType: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  parentNodeId: [
    { required: false, message: '请选择父节点', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '数量不能小于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '优先级必须在1-10之间', trigger: 'blur' }
  ]
})

// 获取节点类型名称
const getNodeTypeName = (type) => {
  const typeMap = {
    '0': '物料',
    '1': '组件',
    '2': '服务'
  }
  return typeMap[type] || type
}

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true
  return data.nodeName.toLowerCase().includes(value.toLowerCase())
}

// 监听过滤文本变化
watch(filterText, (val) => {
  nodeTree.value.filter(val)
})

// 加载节点树数据
const loadNodeTree = async () => {
  loading.value = true
  
  try {
    // 调用真实API获取节点树数据
    const response = await listSuperBomStructureTree(props.bomId)
    const flatData = response.data || []
    
    // 将平级数据转换为树形结构
    nodeTreeData.value = convertListToTree(flatData)
    loading.value = false
  } catch (error) {
    console.error('加载节点树失败:', error)
    ElMessage.error('加载节点树失败')
    loading.value = false
  }
}

// 将列表数据转换为树状结构
const convertListToTree = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return []
  }
  
  const tree = []
  const map = new Map()
  
  // 构建节点映射，确保每个节点都有children属性
  list.forEach(item => {
    map.set(item.bomStructureId, {
      ...item,
      children: []
    })
  })
  
  // 构建树状结构
  list.forEach(item => {
    const node = map.get(item.bomStructureId)
    const parentNodeId = item.parentNodeId || 0
    
    if (parentNodeId === 0 || !map.has(parentNodeId)) {
      // 根节点
      tree.push(node)
    } else {
      // 子节点
      const parentNode = map.get(parentNodeId)
      parentNode.children.push(node)
    }
  })
  
  return tree
}

// 获取所有节点（扁平化）
const getAllNodes = (nodes = nodeTreeData.value, result = []) => {
  for (const node of nodes) {
    result.push(node)
    if (node.children && node.children.length > 0) {
      getAllNodes(node.children, result)
    }
  }
  return result
}

// 根据节点ID获取节点
const getNodeById = (bomStructureId, nodes = nodeTreeData.value) => {
  for (const node of nodes) {
    if (node.bomStructureId === bomStructureId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = getNodeById(bomStructureId, node.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 获取父节点名称
const getParentNodeName = (parentNodeId) => {
  if (!parentNodeId) return '根节点'
  const parent = getNodeById(parentNodeId)
  return parent ? parent.nodeName : ''
}

// 节点点击事件
const handleNodeClick = async (data) => {
  // 先显示加载状态
  loading.value = true
  
  try {
    // 调用API获取最新的节点信息
    const response = await listSuperBomStructure({
      bomStructureId: data.bomStructureId
    })
    
    // 从返回的列表中找到对应的节点
    const latestNode = response.rows.find(node => node.bomStructureId === data.bomStructureId)
    
    if (latestNode) {
      // 使用获取到的最新数据更新selectedNode
      selectedNode.value = { ...latestNode }
      console.log('selectedNode.value:', selectedNode.value)
      console.log('selectedNode.value.bomStructureId:', selectedNode.value.bomStructureId)
      originalNode.value = JSON.parse(JSON.stringify(latestNode))
    } else {
      // 如果没找到，使用本地数据
      selectedNode.value = { ...data }
      originalNode.value = JSON.parse(JSON.stringify(data))
    }
  } catch (error) {
    console.error('获取节点信息失败:', error)
    ElMessage.error('获取节点信息失败')
    // 失败时使用本地数据
    selectedNode.value = { ...data }
    originalNode.value = JSON.parse(JSON.stringify(data))
  } finally {
    loading.value = false
  }
}

// 右键菜单事件
const handleNodeContextMenu = (event, data) => {
  event.preventDefault()
  contextMenuNode.value = data
  contextMenuLeft.value = event.clientX
  contextMenuTop.value = event.clientY
  contextMenuVisible.value = true
}

// 点击空白处关闭右键菜单
const handleClickOutside = (event) => {
  if (event.target.closest('.context-menu') === null) {
    contextMenuVisible.value = false
  }
}

// 处理树形节点命令
const handleTreeNodeCommand = (command, data) => {
  contextMenuNode.value = data
  
  switch (command) {
    case 'addChild':
      handleAddChildNode()
      break
    case 'edit':
      // 设置当前选中节点，以便编辑
      selectedNode.value = { ...data }
      originalNode.value = JSON.parse(JSON.stringify(data))
      handleEditContextNode()
      break
    case 'delete':
      confirmDeleteNode(data)
      break
    default:
      break
  }
}

// 新增节点
const handleAddNode = () => {
  isRootNode.value = true
  resetDialogForm()
  dialogTitle.value = '新增根节点'
  dialogVisible.value = true
}

// 新增子节点
const handleAddChildNode = () => {
  if (!contextMenuNode.value) return
  resetDialogForm()
  dialogNodeForm.parentNodeId = contextMenuNode.value.bomStructureId
  isRootNode.value = false
  dialogTitle.value = '新增子节点'
  contextMenuVisible.value = false
  dialogVisible.value = true
}

// 编辑选中节点
const handleEditSelectedNode = () => {
  if (!selectedNode.value) return
  Object.assign(dialogNodeForm, { ...selectedNode.value })
  isRootNode.value = !selectedNode.value.parentNodeId
  dialogTitle.value = '编辑节点'
  dialogVisible.value = true
}

// 编辑右键菜单节点
const handleEditContextNode = () => {
  if (!contextMenuNode.value) return
  Object.assign(dialogNodeForm, { ...contextMenuNode.value })
  isRootNode.value = !contextMenuNode.value.parentNodeId
  dialogTitle.value = '编辑节点'
  contextMenuVisible.value = false
  dialogVisible.value = true
}

// 删除选中节点
const handleDeleteSelectedNode = async () => {
  if (!selectedNode.value) return
  await confirmDeleteNode(selectedNode.value)
}

// 删除右键菜单节点
const handleDeleteContextNode = async () => {
  if (!contextMenuNode.value) return
  await confirmDeleteNode(contextMenuNode.value)
  contextMenuVisible.value = false
}

// 确认删除节点
const confirmDeleteNode = async (node) => {
  try {
    await ElMessageBox.confirm(`确定要删除节点 "${node.nodeName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用真实API删除节点，将单个ID包装成数组传递给后端
    await deleteSuperBomStructure([node.bomStructureId])
    await loadNodeTree() // 重新加载节点树
    ElMessage.success('节点删除成功')
    
    // 如果删除的是当前选中的节点，清空选中状态
    if (selectedNode.value && selectedNode.value.bomStructureId === node.bomStructureId) {
      selectedNode.value = null
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除节点失败:', error)
    }
  }
}

// 从树中移除节点
const removeNodeFromTree = (bomStructureId, nodes) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].bomStructureId === bomStructureId) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      const removed = removeNodeFromTree(bomStructureId, nodes[i].children)
      if (removed) {
        return true
      }
    }
  }
  return false
}

// 更新树中的节点
const updateNodeInTree = (updatedNode, nodes = nodeTreeData.value) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].bomStructureId === updatedNode.bomStructureId) {
      nodes[i] = { ...updatedNode }
      return true
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      const updated = updateNodeInTree(updatedNode, nodes[i].children)
      if (updated) {
        return true
      }
    }
  }
  return false
}

// 对话框提交
const handleDialogSubmit = async () => {
  try {
    await dialogFormRef.value.validate()
    
    if (dialogNodeForm.bomStructureId) {
      // 编辑模式
      await updateSuperBomStructure(dialogNodeForm)
      await loadNodeTree() // 重新加载节点树
      ElMessage.success('节点更新成功')
    } else {
      // 新增模式
      await addSuperBomStructure(dialogNodeForm)
      await loadNodeTree() // 重新加载节点树
      ElMessage.success('节点新增成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交节点表单失败:', error)
    }
  }
}

// 重置对话框表单
const resetDialogForm = () => {
  dialogNodeForm.bomStructureId = null    
  dialogNodeForm.nodeCode = ''
  dialogNodeForm.nodeName = ''
  dialogNodeForm.nodeType = '0' // 0：物料，1：组件，2：服务
  dialogNodeForm.parentNodeId = null
  dialogNodeForm.quantity = 1
  dialogNodeForm.unit = ''
  dialogNodeForm.status = 'enabled'
  dialogNodeForm.priority = 1
  dialogNodeForm.description = ''
  dialogNodeForm.isRequired = '0'
  dialogNodeForm.selectionType = 'single'
  dialogNodeForm.minSelection = 0
  dialogNodeForm.maxSelection = 0
  dialogNodeForm.isQuantityEditable = '1'
  dialogNodeForm.icon = ''
  dialogNodeForm.nodeDescription = ''
  
  dialogFormRef.value?.resetFields()
}

// 组件挂载时
onMounted(() => {
  loadNodeTree()
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.bom-node-info {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  position: relative;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.current-node-info {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.management-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.node-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 300px);
}

.node-tree-container {
  flex: 0 0 calc(20% - 10px);
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tree-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.node-detail-container {
  flex: 0 0 calc(80% - 10px);
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tree-node-action {
  cursor: pointer;
  color: #909399;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.3s;
}

.tree-node-action:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.more-icon {
  font-size: 16px;
}

.node-type-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.tag-component {
  background-color: #e6f7ff;
  color: #1890ff;
}

.tag-part {
  background-color: #f6ffed;
  color: #52c41a;
}

.tag-material {
  background-color: #fff7e6;
  color: #fa8c16;
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

/* 高亮节点样式 */
.el-tree-node.is-current .el-tree-node__content {
  background-color: #f0f9ff;
  border-radius: 4px;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item .el-icon {
  margin-right: 8px;
  font-size: 14px;
}

.menu-item span {
  font-size: 14px;
}
</style>