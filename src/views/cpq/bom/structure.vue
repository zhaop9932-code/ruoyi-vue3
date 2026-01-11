<template>
  <div class="app-container">
    <el-card shadow="never" class="mb8">
      <div class="title">
        <h3>{{ bomName }} - BOM结构管理</h3>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- BOM结构树 -->
      <el-col :span="10">
        <el-card shadow="never" title="BOM结构">
          <div class="tree-container">
            <el-tree
              ref="bomTree"
              :data="bomTreeData"
              :props="treeProps"
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
              @node-contextmenu="handleNodeContextMenu"
              node-key="bomStructureId"
              default-expand-all
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span :class="{'node-selected': selectedNode && selectedNode.bomStructureId === data.bomStructureId}">
                    {{ node.label }}
                  </span>
                  <el-tag :type="data.nodeType === '0' ? 'primary' : data.nodeType === '1' ? 'success' : data.nodeType === '2' ? 'warning' : 'info'" size="small" class="node-type-tag">
                    {{ data.nodeType === '0' ? '物料' : data.nodeType === '1' ? '组件' : data.nodeType === '2' ? '服务' : '参数要求' }}
                  </el-tag>
                </div>
              </template>
            </el-tree>
          </div>

          <div class="tree-operations" style="margin-top: 10px;">
            <el-button
              type="primary"
              icon="Plus"
              size="small"
              @click="handleAddNode"
            >
              新增节点
            </el-button>
            <el-button
              type="danger"
              icon="Delete"
              size="small"
              :disabled="!selectedNode"
              @click="handleDeleteNode"
            >
              删除节点
            </el-button>
            <el-button
              type="info"
              icon="Upload"
              size="small"
              @click="handleImportBom"
            >
              导入BOM
            </el-button>
            <el-button
              type="warning"
              icon="Download"
              size="small"
              @click="handleExportBom"
            >
              导出BOM
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 节点详情与属性管理 -->
      <el-col :span="14">
        <el-card shadow="never">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 节点详情 -->
            <el-tab-pane label="节点详情" name="nodeDetail">
              <el-form ref="nodeFormRef" :model="nodeForm" :rules="nodeRules" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="节点名称" prop="nodeName">
                      <el-input v-model="nodeForm.nodeName" placeholder="请输入节点名称" />
                    </el-form-item>
                    <el-form-item label="节点编码" prop="nodeCode">
                      <el-input v-model="nodeForm.nodeCode" placeholder="请输入节点编码" />
                    </el-form-item>
                    <el-form-item label="节点类型" prop="nodeType">
                      <el-select v-model="nodeForm.nodeType" placeholder="请选择节点类型">
                        <el-option label="物料" value="0" />
                        <el-option label="组件" value="1" />
                        <el-option label="服务" value="2" />
                        <el-option label="参数要求" value="3" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="默认数量" prop="defaultQuantity">
                      <el-input-number v-model="nodeForm.defaultQuantity" :min="0.1" :step="0.1" />
                    </el-form-item>
                    <el-form-item label="最小数量" prop="minQuantity">
                      <el-input-number v-model="nodeForm.minQuantity" :min="0.1" :step="0.1" />
                    </el-form-item>
                    <el-form-item label="最大数量" prop="maxQuantity">
                      <el-input-number v-model="nodeForm.maxQuantity" :min="0.1" :step="0.1" />
                    </el-form-item>
                    <el-form-item label="节点状态" prop="nodeStatus">
                      <el-select v-model="nodeForm.nodeStatus" placeholder="请选择节点状态">
                        <el-option label="启用" value="0" />
                        <el-option label="禁用" value="1" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="节点深度" prop="depth">
                      <el-input-number v-model="nodeForm.depth" :min="1" :step="1" :disabled="true" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="节点排序" prop="sortOrder">
                      <el-input-number v-model="nodeForm.sortOrder" :min="1" :step="1" />
                    </el-form-item>
                    <el-form-item label="版本" prop="version">
                      <el-input v-model="nodeForm.version" placeholder="请输入版本" />
                    </el-form-item>
                    <el-form-item label="版本描述" prop="versionDescription">
                      <el-input v-model="nodeForm.versionDescription" placeholder="请输入版本描述" />
                    </el-form-item>
                    <el-form-item label="详细描述" prop="longDescription">
                      <el-input v-model="nodeForm.longDescription" type="textarea" placeholder="请输入详细描述" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 约束配置部分 -->
                <div class="constraint-section" style="margin-top: 30px;">
                  <h4 style="margin-bottom: 20px; color: #333; font-weight: bold;">🔗 约束配置</h4>
                  
                  <el-divider style="margin: 15px 0;" />
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="约束类型" prop="constraintType">
                        <el-select v-model="nodeForm.constraintType" placeholder="请选择约束类型">
                          <el-option label="无约束" value="" />
                          <el-option label="条件约束" value="condition" />
                          <el-option label="数量约束" value="quantity" />
                          <el-option label="依赖约束" value="dependency" />
                          <el-option label="组合约束" value="combination" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="条件表达式" prop="conditionExpr">
                        <el-input v-model="nodeForm.conditionExpr" placeholder="如: parent.attr == 'value'" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 数量约束配置 -->
                  <el-collapse v-model="activeConstraintPanel" accordion>
                    <el-collapse-item title="📊 数量约束" name="quantity">
                      <el-row :gutter="20">
                        <el-col :span="8">
                          <el-form-item label="默认数量" prop="defaultQuantity">
                            <el-input-number v-model="nodeForm.defaultQuantity" :min="0.1" :step="0.1" />
                          </el-form-item>
                        </el-col>
                        <el-col :span="8">
                          <el-form-item label="最小数量" prop="minQuantity">
                            <el-input-number v-model="nodeForm.minQuantity" :min="0.1" :step="0.1" />
                          </el-form-item>
                        </el-col>
                        <el-col :span="8">
                          <el-form-item label="最大数量" prop="maxQuantity">
                            <el-input-number v-model="nodeForm.maxQuantity" :min="0.1" :step="0.1" />
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="最小数量表达式" prop="minQuantityExpr">
                            <el-input v-model="nodeForm.minQuantityExpr" placeholder="如: parent.quantity * 2" />
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="最大数量表达式" prop="maxQuantityExpr">
                            <el-input v-model="nodeForm.maxQuantityExpr" placeholder="如: parent.quantity * 5" />
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <!-- 依赖约束配置 -->
                    <el-collapse-item title="🔗 依赖约束" name="dependency">
                      <el-form-item label="依赖节点ID" prop="dependentNodeIds">
                        <el-input v-model="nodeForm.dependentNodeIds" placeholder="多个节点ID用逗号分隔" />
                      </el-form-item>
                      <el-form-item label="依赖类型" prop="dependencyType">
                        <el-select v-model="nodeForm.dependencyType" placeholder="请选择依赖类型">
                          <el-option label="必须包含" value="mandatory" />
                          <el-option label="互斥" value="exclusive" />
                          <el-option label="条件依赖" value="conditional" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="依赖条件" prop="dependencyCondition">
                        <el-input v-model="nodeForm.dependencyCondition" type="textarea" placeholder="依赖条件表达式" :rows="2" />
                      </el-form-item>
                    </el-collapse-item>

                    <!-- 组合约束配置 -->
                    <el-collapse-item title="🧩 组合约束" name="combination">
                      <el-form-item label="替换节点ID" prop="replaceableNodeIds">
                        <el-input v-model="nodeForm.replaceableNodeIds" placeholder="多个节点ID用逗号分隔" />
                      </el-form-item>
                      <el-form-item label="替换条件" prop="replacementCondition">
                        <el-input v-model="nodeForm.replacementCondition" type="textarea" placeholder="替换条件表达式" :rows="2" />
                      </el-form-item>
                    </el-collapse-item>
                  </el-collapse>

                  <!-- JSON格式约束配置（高级） -->
                  <el-divider style="margin: 15px 0;" />
                  <el-form-item label="约束配置（JSON）" prop="constraintConfig">
                    <el-input 
                      v-model="nodeForm.constraintConfig" 
                      type="textarea" 
                      placeholder="高级配置：JSON格式的约束配置" 
                      :rows="5"
                      style="font-family: monospace;"
                    />
                    <div style="margin-top: 8px; font-size: 12px; color: #999;">
                      💡 提示：可直接编辑JSON配置，支持复杂约束逻辑
                    </div>
                  </el-form-item>
                </div>
              </el-form>

              <div class="form-operations" style="margin-top: 20px;">
                <el-button type="primary" @click="handleSaveNode">保存</el-button>
                <el-button @click="handleCancelNode">取消</el-button>
              </div>
            </el-tab-pane>

            <!-- 属性管理 -->
            <el-tab-pane label="属性管理" name="attribute" v-if="selectedNode">
              <div class="attribute-operations" style="margin-bottom: 20px;">
                <el-button type="primary" icon="Plus" size="small" @click="handleAddAttribute">关联属性</el-button>
                <el-button type="success" icon="Edit" size="small" @click="handleBatchUpdateAttribute">批量更新</el-button>
              </div>
              
              <el-table :data="attributeList" border style="width: 100%">
                <el-table-column prop="attribute.attributeName" label="属性名称" width="180" />
                <el-table-column prop="attribute.attributeCode" label="属性编码" width="180" />
                <el-table-column prop="isRequired" label="是否必填" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.isRequired === '1' ? 'danger' : 'success'" size="small">
                      {{ scope.row.isRequired === '1' ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="默认值" />
                <el-table-column prop="sortOrder" label="排序" width="80" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" icon="Edit" @click="handleEditAttribute(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" icon="Delete" @click="handleDeleteAttribute(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 属性值管理 -->
            <el-tab-pane label="属性值管理" name="attributeValue" v-if="selectedNode">
              <div class="attribute-value-header" style="margin-bottom: 20px;">
                <el-form :model="configSessionQuery" :inline="true" size="small">
                  <el-form-item label="配置会话ID">
                    <el-input v-model="configSessionQuery.configSessionId" placeholder="请输入配置会话ID" style="width: 200px;" />
                  </el-form-item>
                  <el-button type="primary" icon="Search" @click="handleConfigSessionSearch">查询</el-button>
                  <el-button type="success" icon="Plus" @click="handleCreateConfigSession">创建会话</el-button>
                </el-form>
              </div>
              
              <el-table :data="attributeValueList" border style="width: 100%">
                <el-table-column prop="attribute.attributeName" label="属性名称" width="180" />
                <el-table-column prop="attribute.attributeCode" label="属性编码" width="180" />
                <el-table-column prop="attributeValueId" label="属性值" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" icon="Edit" @click="handleEditAttributeValue(scope.row)">编辑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 节点上下文菜单 -->
    <div
      ref="contextMenu"
      v-if="contextMenuVisible"
      :style="contextMenuStyle"
      class="custom-context-menu"
    >
      <div class="menu-item" @click="handleAddChildNode">新增子节点</div>
      <div class="menu-item" @click="handleEditNode">编辑节点</div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleDeleteNode">删除节点</div>
    </div>

    <!-- 属性编辑对话框 -->
    <el-dialog :title="attributeDialogTitle" v-model="attributeDialogVisible" width="600px" append-to-body>
      <el-form ref="attributeFormRef" :model="attributeForm" :rules="attributeRules" label-width="120px">
        <el-form-item label="属性名称" prop="attributeId">
          <el-select v-model="attributeForm.attributeId" placeholder="请选择属性">
            <!-- 这里需要从属性列表中获取选项 -->
            <el-option label="示例属性1" value="1" />
            <el-option label="示例属性2" value="2" />
            <el-option label="示例属性3" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否必填" prop="isRequired">
          <el-switch v-model="attributeForm.isRequired" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="attributeForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="attributeForm.sortOrder" :min="1" :step="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attributeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAttribute">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  listSuperBomStructureTree, 
  listSuperBomStructureByParentNodeId,
  listSuperBomStructureByRootNodeId,
  addSuperBomStructure, 
  updateSuperBomStructure, 
  deleteSuperBomStructure,
  listSuperBomStructureAttributeByBomStructureId,
  batchAddSuperBomStructureAttribute,
  updateSuperBomStructureAttribute,
  listSuperBomStructureAttributeValue
} from '@/api/cpq/bom'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const bomId = ref(route.query.bomId || '')
const bomName = ref(route.query.bomName || '')
const bomTreeData = ref([])
const selectedNode = ref(null)
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})
const currentContextNode = ref(null)
const nodeFormRef = ref(null)
const bomTree = ref(null)
const activeTab = ref('nodeDetail')

// 属性管理相关
const attributeDialogVisible = ref(false)
const attributeFormRef = ref(null)
const attributeDialogTitle = ref('关联属性')
const attributeList = ref([])
const attributeForm = reactive({
  id: null,
  bomStructureId: null,
  attributeId: null,
  isRequired: '0',
  defaultValue: '',
  sortOrder: 1
})

// 属性值管理相关
const configSessionQuery = reactive({
  configSessionId: ''
})
const attributeValueList = ref([])
// 约束配置面板
const activeConstraintPanel = ref('')

// 树配置
const treeProps = {
  label: 'nodeName',
  children: 'children'
}

// 节点表单
const nodeForm = reactive({
  bomStructureId: null,
  parentNodeId: null,
  bomId: bomId.value,
  rootNodeId: null,
  nodeCode: '',
  nodeName: '',
  nodeType: '0',
  conditionExpr: '',
  defaultQuantity: 1,
  minQuantity: 1,
  maxQuantity: null,
  minQuantityExpr: '',
  maxQuantityExpr: '',
  constraintType: '',
  constraintConfig: '',
  depth: 1,
  sortOrder: 1,
  nodeStatus: '0',
  delFlag: '0',
  nodePath: '',
  version: '',
  versionDescription: '',
  isLatest: '1',
  versionStatus: '',
  approvalStatus: '',
  approvalBy: '',
  approvalTime: '',
  effectiveDate: '',
  expireDate: '',
  isActive: '1',
  dependentNodeIds: '',
  dependencyType: '',
  dependencyCondition: '',
  replaceableNodeIds: '',
  replacementCondition: '',
  costType: '',
  costCurrency: '',
  costCalculationRule: '',
  costComponents: '',
  price: null,
  priceType: '',
  priceCurrency: '',
  priceCalculationRule: '',
  priceComponents: '',
  iconUrl: '',
  nodeStyle: '',
  nodeColor: '',
  nodeShape: '',
  longDescription: '',
  documentationUrl: '',
  helpText: '',
  exampleUsage: ''
})

// 节点表单验证规则
const nodeRules = reactive({
  nodeName: [{ required: true, message: '节点名称不能为空', trigger: 'blur' }],
  nodeCode: [{ required: true, message: '节点编码不能为空', trigger: 'blur' }],
  defaultQuantity: [{ required: true, message: '默认数量不能为空', trigger: 'blur' }],
  minQuantity: [{ required: true, message: '最小数量不能为空', trigger: 'blur' }]
})

// 属性表单验证规则
const attributeRules = reactive({
  attributeId: [{ required: true, message: '属性不能为空', trigger: 'change' }],
  sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})

// 加载BOM结构树
const loadBomTree = async () => {
  try {
    const res = await listSuperBomStructureTree(bomId.value)
    bomTreeData.value = res.data || []
  } catch (error) {
    ElMessage.error('获取BOM结构树失败')
    // 模拟数据，实际项目中应删除
    bomTreeData.value = [
      {
        bomStructureId: 1,
        parentNodeId: 0,
        bomId: bomId.value,
        rootNodeId: 1,
        nodeCode: 'NODE-001',
        nodeName: '主组件',
        nodeType: '1',
        conditionExpr: '',
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: null,
        depth: 1,
        sortOrder: 1,
        nodeStatus: '0',
        delFlag: '0',
        nodePath: '1',
        version: '1.0',
        isLatest: '1',
        isActive: '1',
        children: [
          {
            bomStructureId: 2,
            parentNodeId: 1,
            bomId: bomId.value,
            rootNodeId: 1,
            nodeCode: 'NODE-002',
            nodeName: '子组件1',
            nodeType: '1',
            conditionExpr: '',
            defaultQuantity: 2,
            minQuantity: 1,
            maxQuantity: null,
            depth: 2,
            sortOrder: 1,
            nodeStatus: '0',
            delFlag: '0',
            nodePath: '1/2',
            version: '1.0',
            isLatest: '1',
            isActive: '1',
            children: [
              {
                bomStructureId: 4,
                parentNodeId: 2,
                bomId: bomId.value,
                rootNodeId: 1,
                nodeCode: 'NODE-004',
                nodeName: '物料1',
                nodeType: '0',
                conditionExpr: '',
                defaultQuantity: 1,
                minQuantity: 1,
                maxQuantity: null,
                depth: 3,
                sortOrder: 1,
                nodeStatus: '0',
                delFlag: '0',
                nodePath: '1/2/4',
                version: '1.0',
                isLatest: '1',
                isActive: '1'
              },
              {
                bomStructureId: 5,
                parentNodeId: 2,
                bomId: bomId.value,
                rootNodeId: 1,
                nodeCode: 'NODE-005',
                nodeName: '物料2',
                nodeType: '0',
                conditionExpr: '',
                defaultQuantity: 1,
                minQuantity: 1,
                maxQuantity: null,
                depth: 3,
                sortOrder: 2,
                nodeStatus: '0',
                delFlag: '0',
                nodePath: '1/2/5',
                version: '1.0',
                isLatest: '1',
                isActive: '1'
              }
            ]
          },
          {
            bomStructureId: 3,
            parentNodeId: 1,
            bomId: bomId.value,
            rootNodeId: 1,
            nodeCode: 'NODE-003',
            nodeName: '子组件2',
            nodeType: '1',
            conditionExpr: '',
            defaultQuantity: 1,
            minQuantity: 1,
            maxQuantity: null,
            depth: 2,
            sortOrder: 2,
            nodeStatus: '0',
            delFlag: '0',
            nodePath: '1/3',
            version: '1.0',
            isLatest: '1',
            isActive: '1',
            children: [
              {
                bomStructureId: 6,
                parentNodeId: 3,
                bomId: bomId.value,
                rootNodeId: 1,
                nodeCode: 'NODE-006',
                nodeName: '物料3',
                nodeType: '0',
                conditionExpr: '',
                defaultQuantity: 1,
                minQuantity: 1,
                maxQuantity: null,
                depth: 3,
                sortOrder: 1,
                nodeStatus: '0',
                delFlag: '0',
                nodePath: '1/3/6',
                version: '1.0',
                isLatest: '1',
                isActive: '1'
              }
            ]
          }
        ]
      }
    ]
  }
}

// 加载节点详情
const loadNodeDetails = async (bomStructureId) => {
  // 节点详情直接从树数据中获取
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.bomStructureId === bomStructureId) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const child = findNode(node.children)
        if (child) {
          return child
        }
      }
    }
    return null
  }
  
  const node = findNode(bomTreeData.value)
  if (node) {
    // 填充节点表单
    nodeForm.bomStructureId = node.bomStructureId
    nodeForm.parentNodeId = node.parentNodeId
    nodeForm.bomId = node.bomId
    nodeForm.rootNodeId = node.rootNodeId
    nodeForm.nodeCode = node.nodeCode
    nodeForm.nodeName = node.nodeName
    nodeForm.nodeType = node.nodeType
    nodeForm.conditionExpr = node.conditionExpr
    nodeForm.defaultQuantity = node.defaultQuantity
    nodeForm.minQuantity = node.minQuantity
    nodeForm.maxQuantity = node.maxQuantity
    nodeForm.minQuantityExpr = node.minQuantityExpr || ''
    nodeForm.maxQuantityExpr = node.maxQuantityExpr || ''
    nodeForm.constraintType = node.constraintType || ''
    nodeForm.constraintConfig = node.constraintConfig || ''
    nodeForm.depth = node.depth
    nodeForm.sortOrder = node.sortOrder
    nodeForm.nodeStatus = node.nodeStatus
    nodeForm.delFlag = node.delFlag
    nodeForm.nodePath = node.nodePath
    nodeForm.version = node.version
    nodeForm.versionDescription = node.versionDescription || ''
    nodeForm.isLatest = node.isLatest
    nodeForm.versionStatus = node.versionStatus || ''
    nodeForm.approvalStatus = node.approvalStatus || ''
    nodeForm.approvalBy = node.approvalBy || ''
    nodeForm.approvalTime = node.approvalTime || ''
    nodeForm.effectiveDate = node.effectiveDate || ''
    nodeForm.expireDate = node.expireDate || ''
    nodeForm.isActive = node.isActive
    nodeForm.dependentNodeIds = node.dependentNodeIds || ''
    nodeForm.dependencyType = node.dependencyType || ''
    nodeForm.dependencyCondition = node.dependencyCondition || ''
    nodeForm.replaceableNodeIds = node.replaceableNodeIds || ''
    nodeForm.replacementCondition = node.replacementCondition || ''
    nodeForm.costType = node.costType || ''
    nodeForm.costCurrency = node.costCurrency || ''
    nodeForm.costCalculationRule = node.costCalculationRule || ''
    nodeForm.costComponents = node.costComponents || ''
    nodeForm.price = node.price
    nodeForm.priceType = node.priceType || ''
    nodeForm.priceCurrency = node.priceCurrency || ''
    nodeForm.priceCalculationRule = node.priceCalculationRule || ''
    nodeForm.priceComponents = node.priceComponents || ''
    nodeForm.iconUrl = node.iconUrl || ''
    nodeForm.nodeStyle = node.nodeStyle || ''
    nodeForm.nodeColor = node.nodeColor || ''
    nodeForm.nodeShape = node.nodeShape || ''
    nodeForm.longDescription = node.longDescription || ''
    nodeForm.documentationUrl = node.documentationUrl || ''
    nodeForm.helpText = node.helpText || ''
    nodeForm.exampleUsage = node.exampleUsage || ''
    
    // 如果约束配置是JSON字符串，尝试解析并填充到相应字段
    if (nodeForm.constraintConfig && typeof nodeForm.constraintConfig === 'string') {
      try {
        const config = JSON.parse(nodeForm.constraintConfig)
        // 如果解析成功，自动填充表单字段
        if (config.type) {
          nodeForm.constraintType = config.type
        }
        if (config.condition) {
          nodeForm.conditionExpr = config.condition
        }
        if (config.quantity) {
          if (config.quantity.default !== undefined) {
            nodeForm.defaultQuantity = config.quantity.default
          }
          if (config.quantity.min !== undefined) {
            nodeForm.minQuantity = config.quantity.min
          }
          if (config.quantity.max !== undefined) {
            nodeForm.maxQuantity = config.quantity.max
          }
          if (config.quantity.minExpr) {
            nodeForm.minQuantityExpr = config.quantity.minExpr
          }
          if (config.quantity.maxExpr) {
            nodeForm.maxQuantityExpr = config.quantity.maxExpr
          }
        }
        if (config.dependency) {
          if (config.dependency.nodes && config.dependency.nodes.length) {
            nodeForm.dependentNodeIds = config.dependency.nodes.join(',')
          }
          if (config.dependency.type) {
            nodeForm.dependencyType = config.dependency.type
          }
          if (config.dependency.condition) {
            nodeForm.dependencyCondition = config.dependency.condition
          }
        }
        if (config.combination) {
          if (config.combination.replaceableNodes && config.combination.replaceableNodes.length) {
            nodeForm.replaceableNodeIds = config.combination.replaceableNodes.join(',')
          }
          if (config.combination.condition) {
            nodeForm.replacementCondition = config.combination.condition
          }
        }
      } catch (e) {
        // JSON解析失败，保持原配置不变
        console.log('Constraint config is not valid JSON, keeping as-is')
      }
    }
    
    // 加载属性列表
    loadAttributes(node.bomStructureId)
    
    // 加载属性值列表
    loadAttributeValues(node.bomStructureId)
  }
}

// 加载属性列表
const loadAttributes = async (bomStructureId) => {
  try {
    // 使用当前组件的bomId和传入的bomStructureId
    const res = await listSuperBomStructureAttributeByBomStructureId(bomId.value, bomStructureId)
    attributeList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取属性列表失败')
    attributeList.value = []
  }
}

// 加载属性值列表
const loadAttributeValues = async (bomStructureId) => {
  try {
    const res = await listSuperBomStructureAttributeValue({
      bomStructureId,
      configSessionId: configSessionQuery.configSessionId
    })
    attributeValueList.value = res.rows || []
  } catch (error) {
    ElMessage.error('获取属性值列表失败')
    attributeValueList.value = []
  }
}

// 节点点击事件
const handleNodeClick = (data) => {
  selectedNode.value = data
  // 加载节点详情
  loadNodeDetails(data.bomStructureId)
}

// 节点右键菜单事件
const handleNodeContextMenu = (e, data) => {
  e.preventDefault()
  currentContextNode.value = data
  contextMenuVisible.value = true
  contextMenuStyle.value = {
    left: e.clientX + 'px',
    top: e.clientY + 'px',
    position: 'fixed',
    zIndex: 1000
  }
}

// 新增节点
const handleAddNode = () => {
  resetNodeForm()
  selectedNode.value = null
  activeTab.value = 'nodeDetail'
}

// 新增子节点
const handleAddChildNode = () => {
  resetNodeForm()
  nodeForm.parentNodeId = currentContextNode.value.bomStructureId
  nodeForm.rootNodeId = currentContextNode.value.rootNodeId
  nodeForm.depth = currentContextNode.value.depth + 1
  contextMenuVisible.value = false
  selectedNode.value = null
  activeTab.value = 'nodeDetail'
}

// 编辑节点
const handleEditNode = () => {
  selectedNode.value = currentContextNode.value
  loadNodeDetails(currentContextNode.value.bomStructureId)
  contextMenuVisible.value = false
  activeTab.value = 'nodeDetail'
}

// 删除节点
const handleDeleteNode = async () => {
  const node = selectedNode.value || currentContextNode.value
  if (!node) return
  
  await ElMessageBox.confirm('确定要删除该节点吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  try {
    await deleteSuperBomStructure([node.bomStructureId])
    ElMessage.success('删除成功')
    // 重新加载BOM树
    loadBomTree()
    selectedNode.value = null
    contextMenuVisible.value = false
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 保存节点
const handleSaveNode = async () => {
  await nodeFormRef.value.validate()
  try {
    // 自动生成约束配置JSON（如果未手动填写）
    if (!nodeForm.constraintConfig && nodeForm.constraintType) {
      const constraintConfig = {
        type: nodeForm.constraintType,
        condition: nodeForm.conditionExpr,
        quantity: {
          default: nodeForm.defaultQuantity,
          min: nodeForm.minQuantity,
          max: nodeForm.maxQuantity,
          minExpr: nodeForm.minQuantityExpr,
          maxExpr: nodeForm.maxQuantityExpr
        },
        dependency: {
          nodes: nodeForm.dependentNodeIds ? nodeForm.dependentNodeIds.split(',').map(id => parseInt(id.trim())) : [],
          type: nodeForm.dependencyType,
          condition: nodeForm.dependencyCondition
        },
        combination: {
          replaceableNodes: nodeForm.replaceableNodeIds ? nodeForm.replaceableNodeIds.split(',').map(id => parseInt(id.trim())) : [],
          condition: nodeForm.replacementCondition
        }
      }
      nodeForm.constraintConfig = JSON.stringify(constraintConfig, null, 2)
    }
    
    if (nodeForm.bomStructureId) {
      await updateSuperBomStructure(nodeForm)
      ElMessage.success('修改成功')
    } else {
      await addSuperBomStructure(nodeForm)
      ElMessage.success('新增成功')
    }
    // 重新加载BOM树
    loadBomTree()
    resetNodeForm()
    selectedNode.value = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 取消编辑节点
const handleCancelNode = () => {
  resetNodeForm()
  if (selectedNode.value) {
    loadNodeDetails(selectedNode.value.bomStructureId)
  }
}

// 重置节点表单
const resetNodeForm = () => {
  nodeForm.bomStructureId = null
  nodeForm.parentNodeId = selectedNode.value ? selectedNode.value.bomStructureId : 0
  nodeForm.bomId = bomId.value
  nodeForm.rootNodeId = selectedNode.value ? selectedNode.value.rootNodeId : null
  nodeForm.nodeCode = ''
  nodeForm.nodeName = ''
  nodeForm.nodeType = '0'
  nodeForm.conditionExpr = ''
  nodeForm.defaultQuantity = 1
  nodeForm.minQuantity = 1
  nodeForm.maxQuantity = null
  nodeForm.minQuantityExpr = ''
  nodeForm.maxQuantityExpr = ''
  nodeForm.constraintType = ''
  nodeForm.constraintConfig = ''
  nodeForm.depth = selectedNode.value ? selectedNode.value.depth + 1 : 1
  nodeForm.sortOrder = 1
  nodeForm.nodeStatus = '0'
  nodeForm.delFlag = '0'
  nodeForm.nodePath = ''
  nodeForm.version = ''
  nodeForm.versionDescription = ''
  nodeForm.isLatest = '1'
  nodeForm.versionStatus = ''
  nodeForm.approvalStatus = ''
  nodeForm.approvalBy = ''
  nodeForm.approvalTime = ''
  nodeForm.effectiveDate = ''
  nodeForm.expireDate = ''
  nodeForm.isActive = '1'
  nodeForm.dependentNodeIds = ''
  nodeForm.dependencyType = ''
  nodeForm.dependencyCondition = ''
  nodeForm.replaceableNodeIds = ''
  nodeForm.replacementCondition = ''
  nodeForm.costType = ''
  nodeForm.costCurrency = ''
  nodeForm.costCalculationRule = ''
  nodeForm.costComponents = ''
  nodeForm.price = null
  nodeForm.priceType = ''
  nodeForm.priceCurrency = ''
  nodeForm.priceCalculationRule = ''
  nodeForm.priceComponents = ''
  nodeForm.iconUrl = ''
  nodeForm.nodeStyle = ''
  nodeForm.nodeColor = ''
  nodeForm.nodeShape = ''
  nodeForm.longDescription = ''
  nodeForm.documentationUrl = ''
  nodeForm.helpText = ''
  nodeForm.exampleUsage = ''
  // 重置约束面板状态
  activeConstraintPanel.value = ''
}

// 标签页切换事件
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  if (tabName === 'attribute' && selectedNode.value) {
    loadAttributes(selectedNode.value.bomStructureId)
  } else if (tabName === 'attributeValue' && selectedNode.value) {
    loadAttributeValues(selectedNode.value.bomStructureId)
  }
}

// 关联属性
const handleAddAttribute = () => {
  attributeDialogTitle.value = '关联属性'
  attributeForm.id = null
  attributeForm.bomStructureId = selectedNode.value.bomStructureId
  attributeForm.attributeId = null
  attributeForm.isRequired = '0'
  attributeForm.defaultValue = ''
  attributeForm.sortOrder = 1
  attributeDialogVisible.value = true
}

// 编辑属性
const handleEditAttribute = (row) => {
  attributeDialogTitle.value = '编辑属性'
  attributeForm.id = row.id
  attributeForm.bomStructureId = row.bomStructureId
  attributeForm.attributeId = row.attributeId
  attributeForm.isRequired = row.isRequired
  attributeForm.defaultValue = row.defaultValue
  attributeForm.sortOrder = row.sortOrder
  attributeDialogVisible.value = true
}

// 删除属性
const handleDeleteAttribute = (row) => {
  // 这里需要实现属性删除逻辑
  ElMessage.info('属性删除功能待实现')
}

// 批量更新属性
const handleBatchUpdateAttribute = () => {
  // 这里需要实现批量更新属性逻辑
  ElMessage.info('批量更新属性功能待实现')
}

// 保存属性
const handleSaveAttribute = async () => {
  await attributeFormRef.value.validate()
  try {
    if (attributeForm.id) {
      // 编辑属性，使用批量更新接口
      await updateSuperBomStructureAttribute(attributeForm.bomStructureId, [attributeForm])
      ElMessage.success('修改成功')
    } else {
      // 新增属性，使用批量新增接口
      await batchAddSuperBomStructureAttribute([attributeForm])
      ElMessage.success('关联成功')
    }
    // 重新加载属性列表
    loadAttributes(attributeForm.bomStructureId)
    attributeDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 配置会话查询
const handleConfigSessionSearch = () => {
  if (selectedNode.value) {
    loadAttributeValues(selectedNode.value.bomStructureId)
  }
}

// 创建配置会话
const handleCreateConfigSession = () => {
  // 这里需要实现创建配置会话逻辑
  ElMessage.info('创建配置会话功能待实现')
}

// 编辑属性值
const handleEditAttributeValue = (row) => {
  // 这里需要实现编辑属性值逻辑
  ElMessage.info('编辑属性值功能待实现')
}

// BOM导入
const handleImportBom = () => {
  // 实现BOM导入功能
  ElMessage.info('BOM导入功能待实现')
}

// BOM导出
const handleExportBom = () => {
  // 实现BOM导出功能
  ElMessage.info('BOM导出功能待实现')
}

// 点击其他区域关闭上下文菜单
const handleClickOutside = () => {
  contextMenuVisible.value = false
}

onMounted(() => {
  loadBomTree()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tree-container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #e6e6e6;
  padding: 10px;
  border-radius: 4px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-selected {
  font-weight: bold;
  color: #409eff;
}

.node-type-tag {
  margin-left: 10px;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

.custom-context-menu {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 150px;
}

.menu-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.menu-divider {
  height: 1px;
  margin: 5px 0;
  background-color: #e4e7ed;
}
</style>

