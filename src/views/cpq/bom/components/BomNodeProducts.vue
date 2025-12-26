<template>
  <div class="bom-node-products">
    <div class="management-header">
      <h3>关联产品管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="Plus" @click="handleAddProduct">新增关联产品</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedProducts.length === 0">批量删除</el-button>
        <el-button type="info" icon="Refresh" @click="loadProductList">刷新列表</el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="productList" stripe style="width: 100%">
      <el-table-column type="selection" width="55" align="center" @selection-change="handleSelectionChange" />
      <el-table-column label="关联类型" align="center" prop="relationTypeName" width="120">
        <template #default="scope">
          <el-tag :type="getRelationTypeTag(scope.row.relationType)">
            {{ scope.row.relationTypeName }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="关联对象" align="center" prop="relationObjectName" min-width="150" /> -->
      <el-table-column label="产品名称" align="center" prop="productName" min-width="150">
        <template #default="scope">
          {{ scope.row.productName || scope.row.relationObjectName || '无' }}
        </template>
      </el-table-column>
    
      <!-- 仅当关联类型是具体型号时显示产品型号列 -->
      <el-table-column 
        v-if="productList.some(item => item.relationType === 1)" 
        label="产品型号" 
        align="center" 
        min-width="150"
      >
        <template #default="scope">
          {{ scope.row.relationType === 1 ? (scope.row.productModel || scope.row.modelName || '无') : '-' }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditProduct(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" icon="Delete" @click="handleDeleteProduct(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加/编辑关联产品对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px" append-to-body>
      <el-form ref="productFormRef" :model="productForm" :rules="rules" label-width="120px">
        <!-- 编辑模式使用原有布局 -->
        <template v-if="productForm.relationId">
          <el-form-item label="关联类型" prop="relationType">
            <el-select v-model="productForm.relationType" placeholder="请选择关联类型" @change="handleRelationTypeChange">
              <el-option label="具体型号" value="1" />
              <el-option label="产品系列" value="2" />
              <el-option label="产品类目" value="3" />
            </el-select>
          </el-form-item>
          
          <!-- 具体型号选择 -->
        <el-form-item v-if="productForm.relationType === '1'" label="产品型号" prop="relationObjectIds">
          <el-select 
            v-model="productForm.relationObjectIds" 
            placeholder="请选择产品型号" 
            filterable
            collapse-tags
          >
            <el-option
              v-for="product in filteredProducts"
              :key="product.productId"
              :label="`${product.productCode} - ${product.productName}`"
              :value="product.productId"
            />
          </el-select>
        </el-form-item>
        
        <!-- 产品系列选择 -->
        <el-form-item v-else-if="productForm.relationType === '2'" label="产品系列" prop="relationObjectIds">
          <el-select 
            v-model="productForm.relationObjectIds" 
            placeholder="请选择产品系列" 
            filterable
            collapse-tags
          >
            <el-option
              v-for="series in filteredSeries"
              :key="series.seriesId"
              :label="series.seriesName"
              :value="series.seriesId"
            />
          </el-select>
        </el-form-item>
        
        <!-- 产品类目选择 -->
        <el-form-item v-else-if="productForm.relationType === '3'" label="产品类目" prop="relationObjectIds">
          <el-select 
            v-model="productForm.relationObjectIds" 
            placeholder="请选择产品类目" 
            filterable
            collapse-tags
          >
            <el-option
              v-for="catalog in filteredCatalogs"
              :key="catalog.catalogId"
              :label="catalog.catalogName"
              :value="catalog.catalogId"
            />
          </el-select>
        </el-form-item>
        </template>
        
        <!-- 新增模式使用标签页布局 -->
        <template v-else>
          <!-- 搜索和标签页区域 -->
          <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
            <el-tab-pane label="产品" name="product">
              <div class="tab-content">
                <!-- 产品搜索 -->
                <el-form-item label="产品搜索" prop="productSearch">
                  <el-input 
                    v-model="productSearch" 
                    placeholder="请输入产品名称或编码" 
                    clearable
                    @input="handleProductSearch"
                  >
                    <template #append>
                      <el-button type="primary" icon="Search" @click="handleProductSearch">搜索</el-button>
                    </template>
                  </el-input>
                </el-form-item>
                
                <!-- 产品列表 -->
                <div class="selection-list">
                  <div class="selection-header">
                    <span>产品列表</span>
                    <span class="selected-count">已选择: {{ selectedProductsCount('product') }}</span>
                  </div>
                  <el-scrollbar height="250px">
                    <el-skeleton v-if="productsLoading" :rows="5" animated />
                    <el-checkbox-group v-else v-model="selectedProductIds">
                      <div 
                        v-for="product in filteredProducts" 
                        :key="product.productId" 
                        class="selection-item"
                      >
                        <el-checkbox :label="product.productId">
                          <div class="item-info">
                            <div class="item-name">{{ product.productCode }} - {{ product.productName }}</div>
                            <div class="item-desc">型号: {{ product.modelName || product.productModel || '无' }}</div>
                          </div>
                        </el-checkbox>
                      </div>
                      <div v-if="filteredProducts.length === 0" class="empty-tip">
                        暂无产品数据
                      </div>
                    </el-checkbox-group>
                  </el-scrollbar>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="系列" name="series">
              <div class="tab-content">
                <!-- 系列搜索条件 -->
                <el-form :inline="true" :model="seriesSearchForm" class="search-form">
                  <el-form-item label="系列编码">
                    <el-input 
                      v-model="seriesSearchForm.seriesCode" 
                      placeholder="请输入系列编码" 
                      clearable
                      @input="handleSeriesSearch"
                      style="width: 180px;"
                    />
                  </el-form-item>
                  <el-form-item label="系列名称">
                    <el-input 
                      v-model="seriesSearchForm.seriesName" 
                      placeholder="请输入系列名称" 
                      clearable
                      @input="handleSeriesSearch"
                      style="width: 180px;"
                    />
                  </el-form-item>
                  <el-form-item label="品牌">
                    <el-input 
                      v-model="seriesSearchForm.brandName" 
                      placeholder="请输入品牌名称" 
                      clearable
                      @input="handleSeriesSearch"
                      style="width: 180px;"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleSeriesSearch">搜索</el-button>
                    <el-button icon="RefreshRight" @click="resetSeriesSearch">重置</el-button>
                  </el-form-item>
                </el-form>
                
                <!-- 系列列表与分类树 -->
                <div class="series-selection-container">
                  <!-- 左侧分类树 -->
                  <div class="catalog-tree-section">
                    <div class="section-header">分类树</div>
                    <el-scrollbar height="300px">
                      <el-tree
                        ref="catalogTreeRef"
                        :data="catalogTreeData"
                        :props="catalogTreeProps"
                        node-key="catalogId"
                        default-expand-all
                        @node-click="handleCatalogNodeClick"
                      />
                    </el-scrollbar>
                  </div>
                  
                  <!-- 右侧系列列表 -->
                  <div class="series-list-section">
                    <div class="section-header">
                      <span>产品系列列表</span>
                      <span class="selected-count">已选择: {{ selectedProductsCount('series') }}</span>
                    </div>
                    <el-scrollbar height="300px">
                      <el-skeleton v-if="seriesLoading" :rows="5" animated />
                      <el-checkbox-group v-else v-model="selectedSeriesIds">
                        <div 
                          v-for="series in filteredSeries" 
                          :key="series.seriesId" 
                          class="selection-item"
                        >
                          <el-checkbox :label="series.seriesId">
                            <div class="item-info">
                              <div class="item-name">{{ series.seriesCode || '' }} - {{ series.seriesName }}</div>
                              <div class="item-desc">品牌: {{ series.brandName || '无' }}</div>
                            </div>
                          </el-checkbox>
                        </div>
                        <div v-if="filteredSeries.length === 0" class="empty-tip">
                          暂无产品系列数据
                        </div>
                      </el-checkbox-group>
                    </el-scrollbar>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="分类" name="catalog">
              <div class="tab-content">
                <!-- 分类搜索 -->
                <el-form-item label="分类搜索" prop="catalogSearch">
                  <el-input 
                    v-model="catalogSearch" 
                    placeholder="请输入产品类目名称" 
                    clearable
                    @input="handleCatalogSearch"
                  >
                    <template #append>
                      <el-button type="primary" icon="Search" @click="handleCatalogSearch">搜索</el-button>
                    </template>
                  </el-input>
                </el-form-item>
                
                <!-- 分类树选择 -->
                <div class="selection-list">
                  <div class="selection-header">
                    <span>产品类目树</span>
                    <span class="selected-count">已选择: {{ selectedProductsCount('catalog') }}</span>
                  </div>
                  <div style="height: 300px; overflow-y: auto;">
                    <el-skeleton v-if="catalogsLoading" :rows="10" animated />
                    <el-tree
                      v-else
                      ref="catalogSelectTreeRef"
                      :data="filteredCatalogTree"
                      :props="catalogTreeProps"
                      node-key="catalogId"
                      show-checkbox
                      default-expand-all
                      :default-checked-keys="selectedCatalogIds"
                      @check="handleCatalogTreeCheck"
                    >
                      <template #default="{ node }">
                        <div class="tree-node-content">
                          <span>{{ node.label }}</span>
                        </div>
                      </template>
                    </el-tree>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入BOM产品关联API
import {
  listSuperBomProductRelation,
  getSuperBomProductRelationByBomId,
  getSuperBomProductRelationByBomIdAndStructureId,
  addSuperBomProductRelation,
  batchAddSuperBomProductRelation,
  updateSuperBomProductRelation,
  removeSuperBomProductRelation
} from '@/api/cpq/superBomProductRelation'

// 导入产品、系列、分类API
import {
  listProduct
} from '@/api/cpq/product'

import {
  getAllSeries,
  listSeries
} from '@/api/cpq/series'

import {
  listCatalog,
  listCatalogTree
} from '@/api/cpq/catalog'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    default: null
  }
})

// 加载状态
const loading = ref(false)

// 选中的产品
const selectedProducts = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增关联产品')

// 表单引用
const productFormRef = ref(null)

// 关联产品列表
const productList = ref([])

// 可选产品列表（用于选择关联产品）
const availableProducts = ref([])
const productsLoading = ref(false)

// 可选产品系列列表
const availableSeries = ref([])
const seriesLoading = ref(false)

// 可选产品类目列表
const availableCatalogs = ref([])
const catalogsLoading = ref(false)

// 分页参数
const productQueryParams = reactive({
  pageNum: 1,
  pageSize: 100, // 一次加载较多数据，方便选择
  productName: '',
  productCode: ''
})

const seriesQueryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  seriesName: '',
  seriesCode: '',
  brandName: '',
  catalogId: null
})

const catalogQueryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  catalogName: ''
})

// 系列搜索表单
const seriesSearchForm = reactive({
  seriesCode: '',
  seriesName: '',
  brandName: ''
})

// 分类树相关
const catalogTreeRef = ref(null) // 系列标签页左侧分类树
const catalogSelectTreeRef = ref(null) // 分类标签页分类选择树
const catalogTreeData = ref([])
const catalogTreeProps = {
  label: 'catalogName',
  children: 'children'
}
const selectedCatalogId = ref(null)

// 表单数据
const productForm = reactive({
  relationId: null,
  bomId: props.bomId,
  structureId: props.bomStructureId,
  relationType: '',
  relationObjectId: '', // 兼容旧数据结构
  relationObjectIds: [] // 用于多选
})

// 表单验证规则
const rules = reactive({
  relationObjectIds: [
    { required: true, message: '请选择关联对象', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个关联对象', trigger: 'change' }
  ]
})

// 标签页相关
const activeTab = ref('product')

// 搜索相关
const productSearch = ref('')
const seriesSearch = ref('')
const catalogSearch = ref('')

// 已选择的ID列表
const selectedProductIds = ref([])
const selectedSeriesIds = ref([])
const selectedCatalogIds = ref([])

// 获取已关联的ID列表（排除当前正在编辑的项）
const getLinkedIds = (type) => {
  // 处理数据类型匹配问题：字符串和数字类型都要匹配
  const typeNum = Number(type)
  const typeStr = String(type)
  
  const linkedItems = productList.value
    .filter(item => {
      const itemType = item.relationType
      // 检查多种可能的数据类型匹配
      const typeMatch = itemType === typeNum || itemType === typeStr || String(itemType) === typeStr || Number(itemType) === typeNum
      
      console.log(`检查产品 ${item.relationObjectId} 的类型匹配:`, {
        itemType,
        type,
        typeNum,
        typeStr,
        typeMatch
      })
      
      return typeMatch && item.relationId !== productForm.relationId
    })
    .map(item => item.relationObjectId)
  
  console.log(`获取类型 ${type} 的已关联ID:`, linkedItems)
  console.log('当前产品列表:', productList.value)
  
  return linkedItems
}

// 筛选后的列表（过滤已关联的数据）
const filteredProducts = computed(() => {
  const linkedProductIds = getLinkedIds('1')
  console.log('已关联的产品ID列表:', linkedProductIds)
  console.log('可选产品列表:', availableProducts.value)
  
  let filtered = availableProducts.value.filter(product => {
    // 检查多种可能的数据类型匹配
    const isLinked = linkedProductIds.includes(product.productId) || 
                    linkedProductIds.includes(String(product.productId)) ||
                    linkedProductIds.includes(Number(product.productId))
    console.log(`产品 ${product.productId} (${product.productName}) 是否已关联:`, isLinked)
    return !isLinked
  })
  
  if (productSearch.value) {
    const searchValue = productSearch.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.productCode.toLowerCase().includes(searchValue) ||
      product.productName.toLowerCase().includes(searchValue)
    )
  }
  
  console.log('过滤后的产品列表:', filtered)
  return filtered
})

const filteredSeries = computed(() => {
  const linkedSeriesIds = getLinkedIds('2')
  let filtered = availableSeries.value.filter(series => 
    !linkedSeriesIds.includes(series.seriesId)
  )
  
  if (seriesSearch.value) {
    const searchValue = seriesSearch.value.toLowerCase()
    filtered = filtered.filter(series => 
      series.seriesName.toLowerCase().includes(searchValue)
    )
  }
  
  return filtered
})



// 过滤已关联的分类树数据（同时支持搜索过滤）
const filteredCatalogTree = computed(() => {
  const linkedCatalogIds = getLinkedIds('3')
  
  // 先过滤已关联的数据
  const filterLinkedTree = (nodes) => {
    return nodes.filter(node => !linkedCatalogIds.includes(node.catalogId))
      .map(node => ({
        ...node,
        children: node.children ? filterLinkedTree(node.children) : []
      }))
  }
  
  let filteredTree = filterLinkedTree(catalogTreeData.value)
  
  // 如果有关键词搜索，再进行搜索过滤
  if (catalogSearch.value) {
    const searchValue = catalogSearch.value.toLowerCase()
    
    const filterSearchTree = (nodes) => {
      return nodes.reduce((acc, node) => {
        const nameMatch = node.catalogName.toLowerCase().includes(searchValue)
        let children = []
        
        if (node.children && node.children.length > 0) {
          children = filterSearchTree(node.children)
        }
        
        if (nameMatch || children.length > 0) {
          acc.push({
            ...node,
            children
          })
        }
        
        return acc
      }, [])
    }
    
    filteredTree = filterSearchTree(filteredTree)
  }
  
  return filteredTree
})

// 计算已选择数量
const selectedProductsCount = (type) => {
  switch (type) {
    case 'product':
      return selectedProductIds.value.length
    case 'series':
      return selectedSeriesIds.value.length
    case 'catalog':
      return selectedCatalogIds.value.length
    default:
      return 0
  }
}

// 监听bomId或structureId变化，重新加载数据
watch([() => props.bomId, () => props.bomStructureId], ([newBomId, newStructureId]) => {
  if (newBomId) {
    // 更新表单中的bomId和structureId
    productForm.bomId = newBomId
    productForm.structureId = newStructureId
    loadProductList()
  }
})

// 获取关联类型名称
const getRelationTypeName = (type) => {
  const typeMap = {
    '1': '具体型号',
    '2': '产品系列',
    '3': '产品类目'
  }
  return typeMap[type] || type
}

// 获取关联类型标签样式
const getRelationTypeTag = (type) => {
  const tagMap = {
    '1': 'primary',
    '2': 'success',
    '3': 'warning'
  }
  return tagMap[type] || 'default'
}

// 关联类型变化处理
const handleRelationTypeChange = () => {
  // 清空关联对象ID和多选数组
  productForm.relationObjectId = ''
  productForm.relationObjectIds = []
}

// 标签页切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  // 根据切换的标签页预加载数据
  if (tabName === 'product' && availableProducts.value.length === 0) {
    loadProducts()
  } else if (tabName === 'series') {
    if (availableSeries.value.length === 0) {
      loadSeries()
    }
    if (catalogTreeData.value.length === 0) {
      loadCatalogTree()
    }
  } else if (tabName === 'catalog' && availableCatalogs.value.length === 0) {
    loadCatalogs()
  }
}

// 加载产品数据
const loadProducts = async () => {
  productsLoading.value = true
  try {
    const response = await listProduct(productQueryParams)
    availableProducts.value = response.rows || []
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    productsLoading.value = false
  }
}

// 加载系列数据
const loadSeries = async () => {
  seriesLoading.value = true
  try {
    // 将搜索表单的值同步到查询参数
    seriesQueryParams.seriesName = seriesSearchForm.seriesName
    seriesQueryParams.seriesCode = seriesSearchForm.seriesCode
    seriesQueryParams.brandName = seriesSearchForm.brandName
    
    const response = await listSeries(seriesQueryParams)
    availableSeries.value = response.rows || []
  } catch (error) {
    console.error('加载系列列表失败:', error)
    ElMessage.error('加载系列列表失败')
  } finally {
    seriesLoading.value = false
  }
}

// 加载分类数据
let loadCatalogs = async () => {
  catalogsLoading.value = true
  try {
    const response = await listCatalog(catalogQueryParams)
    availableCatalogs.value = response.rows || []
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error('加载分类列表失败')
  } finally {
    catalogsLoading.value = false
  }
}

// 加载分类树
const loadCatalogTree = async () => {
  try {
    catalogsLoading.value = true
    console.log('开始加载分类树数据...')
    
    // 直接使用listCatalog获取分类列表数据
    const response = await listCatalog()
    console.log('listCatalog API返回数据:', response)
    
    let catalogList = []
    if (response && Array.isArray(response.rows)) {
      catalogList = response.rows
    } else if (response && Array.isArray(response.data)) {
      catalogList = response.data
    }
    
    console.log('获取到分类列表，共', catalogList.length, '条数据')
    
    // 如果列表数据为空，使用简化的默认数据
    if (catalogList.length === 0) {
      console.warn('分类列表为空，使用简化默认数据')
      catalogList = [
        { catalogId: 1, catalogName: '默认分类', parentId: 0 }
      ]
    }
    
    // 将列表数据转换为树状结构
    const treeData = convertListToTree(catalogList)
    console.log('分类列表转树状结构成功，共', treeData.length, '个根节点')
    
    // 更新分类树数据
    catalogTreeData.value = treeData
  } catch (error) {
    console.error('加载分类树失败:', error)
    // 出错时使用简化的默认数据
    catalogTreeData.value = [
      { catalogId: 1, catalogName: '默认分类', parentId: 0 }
    ]
    ElMessage.error('加载分类树失败，使用默认数据')
  } finally {
    catalogsLoading.value = false
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
    map.set(item.catalogId, {
      catalogId: item.catalogId,
      catalogName: item.catalogName,
      parentId: item.parentId || 0,
      children: []
    })
  })
  
  // 构建树状结构
  list.forEach(item => {
    const node = map.get(item.catalogId)
    const parentId = item.parentId || 0
    
    if (parentId === 0 || !map.has(parentId)) {
      // 根节点
      tree.push(node)
    } else {
      // 子节点
      const parentNode = map.get(parentId)
      parentNode.children.push(node)
    }
  })
  
  return tree
}

// 产品搜索处理
const handleProductSearch = async () => {
  productQueryParams.productName = productSearch.value
  productQueryParams.productCode = productSearch.value
  productQueryParams.pageNum = 1
  await loadProducts()
}

// 系列搜索处理
const handleSeriesSearch = async () => {
  seriesQueryParams.pageNum = 1
  await loadSeries()
}

// 重置系列搜索
const resetSeriesSearch = async () => {
  seriesSearchForm.seriesCode = ''
  seriesSearchForm.seriesName = ''
  seriesSearchForm.brandName = ''
  seriesQueryParams.catalogId = null
  selectedCatalogId.value = null
  await loadSeries()
}

// 分类节点点击处理
const handleCatalogNodeClick = (data) => {
  selectedCatalogId.value = data.catalogId
  seriesQueryParams.catalogId = data.catalogId
  seriesQueryParams.pageNum = 1
  loadSeries()
}

// 分类搜索处理
const handleCatalogSearch = async () => {
  catalogQueryParams.catalogName = catalogSearch.value
  catalogQueryParams.pageNum = 1
  await loadCatalogs()
}

// 分类树勾选处理
const handleCatalogTreeCheck = (data, checked, indeterminate) => {
  console.log('分类树勾选事件:', data, checked, indeterminate)
  // 使用el-tree组件的API获取所有选中的节点ID
  if (catalogSelectTreeRef.value) {
    const checkedKeys = catalogSelectTreeRef.value.getCheckedKeys()
    console.log('获取到选中的分类ID:', checkedKeys)
    selectedCatalogIds.value = checkedKeys
  }
}

// 分类列表数据，用于兼容原有代码
const filteredCatalogs = computed(() => {
  // 从分类树中提取所有节点
  const getAllCatalogs = (nodes) => {
    let result = []
    nodes.forEach(node => {
      result.push({
        catalogId: node.catalogId,
        catalogName: node.catalogName,
        parentId: node.parentId
      })
      if (node.children && node.children.length > 0) {
        result = result.concat(getAllCatalogs(node.children))
      }
    })
    return result
  }
  
  const allCatalogs = getAllCatalogs(catalogTreeData.value)
  
  // 过滤已关联的分类
  const linkedCatalogIds = getLinkedIds('3')
  let filtered = allCatalogs.filter(catalog => 
    !linkedCatalogIds.includes(catalog.catalogId)
  )
  
  // 如果有关键词搜索，再进行搜索过滤
  if (catalogSearch.value) {
    const searchValue = catalogSearch.value.toLowerCase()
    filtered = filtered.filter(catalog => 
      catalog.catalogName.toLowerCase().includes(searchValue)
    )
  }
  
  return filtered
})

// 更新loadCatalogs函数，确保分类树数据也被更新
const originalLoadCatalogs = loadCatalogs
loadCatalogs = async () => {
  await originalLoadCatalogs()
  // 当加载分类列表时，同时更新分类树数据
  if (catalogTreeData.value.length === 0) {
    await loadCatalogTree()
  }
}

// 加载关联产品列表
const loadProductList = async () => {
  loading.value = true
  
  try {
    console.log('开始加载关联产品列表，bomId:', props.bomId, 'bomStructureId:', props.bomStructureId)
    
    let response
    
    // 根据structureId是否存在选择不同的API
    if (props.bomStructureId) {
      // 如果structureId存在，使用带结构ID的新API
      console.log('使用带结构ID的API')
      response = await getSuperBomProductRelationByBomIdAndStructureId({
        bomId: props.bomId,
        structureId: props.bomStructureId
      })
    } else {
      // 如果structureId不存在，使用旧的API
      console.log('使用不带结构ID的API')
      response = await getSuperBomProductRelationByBomId(props.bomId)
    }
    
    console.log('API响应:', response)
    
    let data = []
    
    // 正确处理API响应 - 响应拦截器已返回res.data
    if (Array.isArray(response)) {
      // 如果直接返回数组
      data = response
    } else if (response && typeof response === 'object') {
      // 如果返回对象，检查是否有rows或data字段
      data = response.rows || response.data || []
    }
    
    console.log('解析后的数据:', data)
    productList.value = data
    loading.value = false
    
    console.log('关联产品列表加载完成，数据量:', data.length)
    return data
  } catch (error) {
    console.error('加载关联产品列表失败:', error)
    ElMessage.error('加载关联产品列表失败')
    loading.value = false
    return []
  }
}

// 多选变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 新增关联产品
const handleAddProduct = () => {
  resetForm()
  dialogTitle.value = '新增关联产品'
  dialogVisible.value = true
  
  // 预加载产品数据和分类树数据，并重新加载已关联产品列表
  loadProducts()
  loadCatalogTree()
  loadProductList() // 确保获取最新的已关联产品数据
}

// 编辑关联产品
const handleEditProduct = (row) => {
  // 确保字段映射正确
  const mappedRow = {
    ...row,
    relationType: row.relationType.toString(),
    relationObjectIds: [row.relationObjectId] // 转换为数组格式，用于多选框显示
  }
  Object.assign(productForm, mappedRow)
  dialogTitle.value = '编辑关联产品'
  dialogVisible.value = true
}

// 删除关联产品
const handleDeleteProduct = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除与${getRelationTypeName(row.relationType)} "${row.relationObjectName}" 的关联吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 使用真实API删除关联产品
    await removeSuperBomProductRelation([row.relationId])
    
    // 更新本地列表
    productList.value = productList.value.filter(item => item.relationId !== row.relationId)
    ElMessage.success('关联产品删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除关联产品失败:', error)
    }
  }
}

// 批量编辑
const handleBatchEdit = async () => {
  if (selectedProducts.value.length === 0) return
  
  try {
    // 简单实现：允许批量修改关联类型
    // 复杂实现可考虑打开对话框让用户选择要修改的字段
    await ElMessageBox.prompt('请输入新的关联类型：\n1. 具体型号\n2. 产品系列\n3. 产品类目', '批量编辑关联产品', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[1-3]$/,
      inputErrorMessage: '请输入有效的关联类型（1-3）'
    }).then(async ({ value }) => {
      const newRelationType = parseInt(value)
      
      // 准备批量编辑数据数组，每个对象包含完整的更新信息
      const batchEditData = selectedProducts.value.map(item => ({
        relationId: item.relationId,
        bomId: item.bomId,
        relationType: newRelationType,
        relationObjectId: item.relationObjectId,
        relationObjectName: item.relationObjectName
      }))
      
      // 批量更新关联类型
      await updateSuperBomProductRelation(batchEditData)
      
      // 更新本地列表
      productList.value = productList.value.map(item => {
        const updatedItem = batchEditData.find(update => update.relationId === item.relationId)
        if (updatedItem) {
          return {
            ...item,
            relationType: updatedItem.relationType,
            relationTypeName: getRelationTypeName(updatedItem.relationType)
          }
        }
        return item
      })
      
      selectedProducts.value = []
      ElMessage.success(`成功批量更新 ${batchEditData.length} 个关联产品的关联类型`)
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量编辑失败')
      console.error('批量编辑关联产品失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedProducts.value.length} 个关联产品吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedProducts.value.map(item => item.relationId)
    // 使用真实API批量删除关联产品
    await removeSuperBomProductRelation(ids)
    
    // 更新本地列表
    productList.value = productList.value.filter(item => !ids.includes(item.relationId))
    selectedProducts.value = []
    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除关联产品失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 准备提交数据
    const submitDataList = []
    
    if (productForm.relationId) {
      // 编辑模式 - 单个编辑
      await productFormRef.value.validate()
      console.log('productForm', productForm)
      // 构建提交数据，只在structureId存在时才添加
      const submitData = {
        ...productForm,
        relationType: parseInt(productForm.relationType),
        relationObjectId: parseInt(productForm.relationObjectIds[0]) // 取第一个值用于编辑
      }
      
      // 只在structureId存在时才添加到提交数据中
      if (props.bomStructureId) {
        submitData.structureId = props.bomStructureId
      }
      
      await updateSuperBomProductRelation(submitData)
      
      // 更新本地列表
      const index = productList.value.findIndex(item => item.relationId === productForm.relationId)
      if (index !== -1) {
        productList.value[index] = { ...submitData }
      }
      ElMessage.success('关联产品更新成功')
    } else {
      // 新增模式 - 支持批量从标签页选择
      // 收集所有选中的产品ID
      if (selectedProductIds.value.length > 0) {
        const productDataList = selectedProductIds.value.map(productId => {
          const item = {
            bomId: props.bomId,
            relationType: 1, // 具体型号
            relationObjectId: parseInt(productId)
          }
          // 只在bomStructureId存在时才添加
          if (props.bomStructureId) {
            item.structureId = props.bomStructureId
          }
          return item
        })
        submitDataList.push(...productDataList)
      }
      
      // 收集所有选中的系列ID
      if (selectedSeriesIds.value.length > 0) {
        const seriesDataList = selectedSeriesIds.value.map(seriesId => {
          const item = {
            bomId: props.bomId,
            relationType: 2, // 产品系列
            relationObjectId: parseInt(seriesId)
          }
          // 只在bomStructureId存在时才添加
          if (props.bomStructureId) {
            item.structureId = props.bomStructureId
          }
          return item
        })
        submitDataList.push(...seriesDataList)
      }
      
      // 收集所有选中的分类ID
      if (selectedCatalogIds.value.length > 0) {
        const catalogDataList = selectedCatalogIds.value.map(catalogId => {
          const item = {
            bomId: props.bomId,
            relationType: 3, // 产品类目
            relationObjectId: parseInt(catalogId)
          }
          // 只在structureId存在时才添加
          if (props.bomStructureId) {
            item.structureId = props.bomStructureId
          }
          return item
        })
        submitDataList.push(...catalogDataList)
      }
      
      if (submitDataList.length === 0) {
        ElMessage.warning('请至少选择一个关联对象')
        return
      }
      
      // 批量新增关联产品
      const addResponse = await batchAddSuperBomProductRelation(submitDataList)
      
      // 使用API返回的数据更新列表
      if (addResponse && Array.isArray(addResponse)) {
        // 如果API直接返回新增的产品数组
        productList.value.push(...addResponse)
      } else if (addResponse && addResponse.code === 200) {
        // 如果API返回包含code和data/rows字段的对象
        const newProducts = addResponse.rows || addResponse.data || []
        if (newProducts.length > 0) {
          productList.value.push(...newProducts)
        } else {
          // 如果API没有返回新增数据，重新加载完整列表
          await loadProductList()
        }
      } else {
        // 如果API返回格式不符合预期，重新加载完整列表
        await loadProductList()
      }
      
      ElMessage.success(`成功新增 ${submitDataList.length} 个关联产品`)
    }
    
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('提交关联产品表单失败:', error)
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
    }
  }
}

// 重置表单
const resetForm = () => {
  productForm.relationId = null
  productForm.bomId = props.bomId
  productForm.structureId = props.bomStructureId   
  productForm.relationType = ''
  productForm.relationObjectId = ''
  productForm.relationObjectIds = []
  
  // 重置搜索和选择状态
  productSearch.value = ''
  seriesSearch.value = ''
  catalogSearch.value = ''
  selectedProductIds.value = []
  selectedSeriesIds.value = []
  selectedCatalogIds.value = []
  activeTab.value = 'product'
  
  productFormRef.value?.resetFields()
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log('组件挂载，开始加载关联产品列表，bomId:', props.bomId)
  await loadProductList()
  console.log('初始加载完成，关联产品列表:', productList.value)
})
</script>

<style scoped>
.bom-node-products {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 标签页内容样式 */
.tab-content {
  padding: 10px 0;
}

/* 搜索表单样式 */
.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #e4e7ed;
}

/* 选择列表样式 */
.selection-list {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 10px;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}

.selected-count {
  font-size: 12px;
  color: #409eff;
}

.selection-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.selection-item:last-child {
  border-bottom: none;
}

.selection-item:hover {
  background-color: #f5f7fa;
}

.item-info {
  margin-left: 8px;
}

.item-name {
  font-size: 14px;
  color: #303133;
}

.item-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 系列选择容器 */
.series-selection-container {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

/* 左侧分类树区域 */
.catalog-tree-section {
  flex: 0 0 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

/* 右侧系列列表区域 */
.series-list-section {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

/* 区域标题 */
.section-header {
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 分类树样式 */
.catalog-tree-section :deep(.el-tree-node__content) {
  padding: 8px 15px;
}

.catalog-tree-section :deep(.el-tree-node) {
  white-space: nowrap;
}

.catalog-tree-section :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}

/* 分类树选择样式 */
.catalog-tree-selection {
  height: 300px;
  overflow: hidden;
}

.catalog-tree-selection :deep(.el-tree) {
  height: 100%;
  overflow: auto;
}

.catalog-tree-selection :deep(.el-tree-node__content) {
  padding: 6px 15px;
  height: auto;
  line-height: 1.4;
}

.catalog-tree-selection :deep(.el-checkbox) {
  margin-right: 8px;
}

.tree-node-content {
  display: inline-block;
}


</style>