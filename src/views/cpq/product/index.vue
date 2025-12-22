<template>
  <div class="cpq-container">
    <!-- 页面标题 -->
    <div class="cpq-page-title">
      产品管理
    </div>

  <!-- 操作栏 -->
  <div class="cpq-action-bar">
    <div class="cpq-actions">
      <el-button type="primary" icon="Plus" @click="handleAdd">
        新增产品
      </el-button>
      <el-button type="danger" icon="Delete" :disabled="multiple">
        批量删除
      </el-button>
      <el-button type="warning" icon="Download" @click="handleExport">
        导出
      </el-button>
    </div>
    <el-button type="info" icon="Search" @click="toggleSearch">
      {{ showSearch ? '收起' : '展开' }}搜索
    </el-button>
  </div>

  <!-- 搜索卡片 -->
  <div class="cpq-search-card" v-show="showSearch">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
      <el-form-item label="产品编码" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品状态" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择产品状态" clearable>
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="RefreshRight" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 产品列表表格 -->


  <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange" border>
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column label="产品编码" align="center" prop="productCode" min-width="120" />
    <el-table-column label="产品名称" align="left" prop="productName" :show-overflow-tooltip="true" min-width="200" />
    <el-table-column label="产品状态" align="center" prop="productStatus">
      <template #default="scope">
        <el-tag class="cpq-status-tag" :type="scope.row.productStatus === '1' ? 'success' : 'danger'" size="small">
          {{ scope.row.productStatus === '1' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="产品版本" align="center" prop="productVersion" min-width="100" />
    <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
    <el-table-column label="操作" align="center" width="220" fixed="right">
      <template #default="scope">
        <el-button size="small" type="primary" icon="Edit" @click="handleUpdate(scope.row)">
                  修改
                </el-button>
                <el-button size="small" type="danger" icon="Delete" @click="handleDelete(scope.row)">
                  删除
                </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页组件 -->
  <div class="cpq-pagination">
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>


  <!-- 添加或修改产品主数据对话框 -->
  <div class="cpq-dialog">
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="cpq-form">
        <el-tabs v-model="activeTab" class="cpq-tabs" @tab-change="handleTabChange">
          <!-- 主要信息标签页 -->
          <el-tab-pane label="主要信息" name="main">
            <ProductMainInfo
              v-model:form="form"
              :brandList="brandList"
              :seriesList="seriesList"
              :catalogTree="catalogTree"
            />
          </el-tab-pane>

          <!-- 价格信息标签页 -->
          <el-tab-pane label="价格信息" name="price">
            <ProductPriceInfo v-model:form="form" />
          </el-tab-pane>

          <!-- 资料信息标签页 -->
          <el-tab-pane label="资料信息" name="material">
            <ProductMaterialInfo v-model:form="form" />
          </el-tab-pane>

          <!-- BOM组成标签页 -->
          <el-tab-pane label="BOM组成" name="bom">
            <ProductBomInfo v-model:bomList="bomList" />
          </el-tab-pane>

          <!-- 特性参数标签页 -->
          <el-tab-pane label="特性参数" name="params">
            <ProductParamsInfo v-model:paramList="paramList" />
          </el-tab-pane>

          <!-- 产品属性标签页 -->
          <el-tab-pane label="产品属性" name="attributes">
            <ProductAttributesInfo
              ref="attributesRef"
              :form="form"
            />
          </el-tab-pane>

         
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listProduct, addProduct, updateProduct, deleteProduct, listProductAttributeRelation, batchUpdateProductAttributeRelation, autoIntegrateCatalogAttributes } from '@/api/cpq/product'
import { getAllBrand } from '@/api/cpq/brand'
import { getAllSeries, getSeriesByBrand } from '@/api/cpq/series'
import { listCatalog } from '@/api/cpq/catalog'
import { listAttributeGroupByCatalog } from '@/api/cpq/attributeGroup'
import { listAttributeGroupAttributes } from '@/api/cpq/attributeGroupAttribute'
import { getAttributeGroupAttributeValueByAttributeGroupAttributeId } from '@/api/cpq/attributeGroupAttributeValue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

// 引入组件
import ProductMainInfo from './components/ProductMainInfo.vue'
import ProductPriceInfo from './components/ProductPriceInfo.vue'
import ProductMaterialInfo from './components/ProductMaterialInfo.vue'
import ProductBomInfo from './components/ProductBomInfo.vue'
import ProductParamsInfo from './components/ProductParamsInfo.vue'
import ProductAttributesInfo from './components/ProductAttributesInfo.vue'

const router = useRouter()

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const productList = ref([])
const multiple = ref([])
const title = ref('')
const open = ref(false)
const activeTab = ref('main')

// 品牌和系列列表
const brandList = ref([])
const seriesList = ref([])

// 目录树列表
const catalogTree = ref([])

// BOM组成列表
const bomList = ref([])

// 特性参数列表
const paramList = ref([])

// 产品属性相关
const attributesRef = ref(null) // 产品属性组件引用，用于手动触发属性刷新和获取属性

// 标签页切换处理函数
const handleTabChange = (tabName) => {
  if (tabName === 'attributes' && attributesRef.value) {
    // 切换到产品属性标签页，手动触发属性获取
    attributesRef.value.refresh()
  }
}

const form = reactive({
  productId: null,
  productCode: '',
  productName: '',
  productDesc: '',
  productStatus: '1',
  productVersion: 'V1.0',
  catalogId: '',
  basePrice: null,
  priceUnit: 'CNY',
  mainImageUrl: '',
  imageUrls: '',
  detailPageUrl: '',
  model3DUrl: '',
  manualUrl: '',
  installationGuideUrl: '',
  videoUrl: '',
  // 新增基本信息字段
  brandId: null,
  seriesId: null,
  productModel: '',
  packagingUnit: '',
  weight: null,
  dimensions: '',
  warrantyPeriod: null,
  specification: '',
  technicalParams: '',
  materialType: null,
  // 新增价格相关字段
  costPrice: null,
  minSalesPrice: null,
  maxSalesPrice: null,
  suggestedRetailPrice: null,
  priceValidityPeriod: null
})
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productCode: '',
  productName: '',
  productStatus: ''
})
const rules = reactive({
  productName: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
  productStatus: [{ required: true, message: '产品状态不能为空', trigger: 'change' }],
  catalogId: [{ required: true, message: '所属目录不能为空', trigger: 'change' }],
  productVersion: [{ required: true, message: '产品版本不能为空', trigger: 'blur' }],
  basePrice: [
    { required: false, message: '基准价格不能为空', trigger: 'blur' },
    { type: 'number', min: 0, message: '基准价格必须大于等于0', trigger: 'blur' }
  ],
  priceUnit: [{ required: true, message: '价格单位不能为空', trigger: 'change' }],
  mainImageUrl: [
    { required: false, message: '请上传产品主图', trigger: 'change' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  detailPageUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  model3DUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  manualUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  installationGuideUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  videoUrl: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  // 新增字段验证规则
  brandId: [{ required: false, message: '请选择所属品牌', trigger: 'change' }],
  seriesId: [{ required: false, message: '请选择所属系列', trigger: 'change' }],
  materialType: [{ required: true, message: '请选择物料类型', trigger: 'change' }],
  productModel: [{ required: true, message: '请输入产品型号', trigger: 'blur' }],
  packagingUnit: [{ required: false, message: '请输入包装单位', trigger: 'blur' }],
  weight: [
    { required: false, message: '请输入产品重量', trigger: 'blur' },
    { type: 'number', min: 0, message: '产品重量必须大于等于0', trigger: 'blur' }
  ],
  dimensions: [{ required: false, message: '请输入产品尺寸', trigger: 'blur' }],
  warrantyPeriod: [
    { type: 'number', min: 0, message: '保质期必须大于等于0', trigger: 'blur' }
  ]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listProduct(queryParams)
    productList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取产品列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.productCode = ''
  queryParams.productName = ''
  queryParams.productStatus = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleAdd = () => {
  form.productId = null
  form.productCode = ''
  form.productName = ''
  form.productDesc = ''
  form.productStatus = '1'
  form.productVersion = 'V1.0'
  form.catalogId = ''
  form.basePrice = null
  form.priceUnit = 'CNY'
  form.mainImageUrl = ''
  form.imageUrls = ''
  form.detailPageUrl = ''
  form.model3DUrl = ''
  form.manualUrl = ''
  form.installationGuideUrl = ''
  form.videoUrl = ''
  // 新增基本信息字段
  form.brandId = null
  form.seriesId = null
  form.materialType = null
  form.productModel = ''
  form.packagingUnit = ''
  form.weight = null
  form.dimensions = ''
  form.warrantyPeriod = null
  form.specification = ''
  form.technicalParams = ''
  // 新增价格相关字段
  form.costPrice = null
  form.minSalesPrice = null
  form.maxSalesPrice = null
  form.suggestedRetailPrice = null
  form.priceValidityPeriod = null

  // 清空图片列表和文件列表
  imageList.value = []
  mainImageFileList.value = []
  imageListFileList.value = []

  // 清空BOM列表和特性参数列表
  bomList.value = []
  paramList.value = []

  title.value = '新增产品'
  activeTab.value = 'main'
  open.value = true
}



const handleUpdate = (row) => {
  form.productId = row.productId
  form.productCode = row.productCode
  form.productName = row.productName
  form.productDesc = row.productDesc || ''
  form.productStatus = row.productStatus
  form.productVersion = row.productVersion || 'V1.0'
  form.catalogId = row.catalogId
  form.basePrice = row.basePrice
  form.priceUnit = row.priceUnit || 'CNY'
  form.mainImageUrl = row.mainImageUrl || ''
  form.imageUrls = row.imageUrls || ''
  form.detailPageUrl = row.detailPageUrl || ''
  form.model3DUrl = row.model3DUrl || ''
  form.manualUrl = row.manualUrl || ''
  form.installationGuideUrl = row.installationGuideUrl || ''
  form.videoUrl = row.videoUrl || ''
  // 基本信息字段
  form.brandId = row.brandId || null
  form.seriesId = row.seriesId || null
  form.materialType = row.materialType || null
  form.productModel = row.productModel || ''
  form.packagingUnit = row.packagingUnit || ''
  form.weight = row.weight || null
  form.dimensions = row.dimensions || ''
  form.warrantyPeriod = row.warrantyPeriod || null
  form.specification = row.specification || ''
  form.technicalParams = row.technicalParams || ''
  // 价格相关字段
  form.costPrice = row.costPrice || null
  form.minSalesPrice = row.minSalesPrice || null
  form.maxSalesPrice = row.maxSalesPrice || null
  form.suggestedRetailPrice = row.suggestedRetailPrice || null
  form.priceValidityPeriod = row.priceValidityPeriod || null

  // 初始化BOM列表
  bomList.value = row.bomList || []

  // 初始化特性参数列表
  paramList.value = row.paramList || []

  title.value = '修改产品'
  open.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该产品吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteProduct(row.productId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 导出产品列表
const handleExport = () => {
  // 调用导出API
  listProduct(queryParams).then(response => {
    // 创建下载链接并下载文件
    const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '产品列表.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    ElMessage.success('导出成功')
  }).catch(error => {
    ElMessage.error('导出失败')
  })
}



const submitForm = async () => {
  const formElement = formRef.value
  if (!formElement) {
    console.error('表单ref不存在')
    return
  }

  try {
    // 表单验证
    await formElement.validate()
    
    

    let res
    if (form.productId) {
      res = await updateProduct(form)
      ElMessage.success('修改成功')
      
      // 如果选择了产品目录，自动集成目录属性
      if (form.catalogId) {
        await autoIntegrateCatalogAttributes(form.productId)
        // 如果当前在产品属性标签页，保存用户输入的属性值
        if (activeTab.value === 'attributes') {
          await saveProductAttributes()
        }
      }
    } else {
      res = await addProduct(form)
      // 设置产品ID，以便后续操作
      if (res.data) {
        form.productId = res.data
      }
      ElMessage.success('新增成功')
      
      // 如果选择了产品目录，自动集成目录属性
      if (form.catalogId && form.productId) {
        await autoIntegrateCatalogAttributes(form.productId)
        // 如果当前在产品属性标签页，保存用户输入的属性值
        if (activeTab.value === 'attributes' && productAttributes.value.length > 0) {
          await saveProductAttributes()
        }
      }
    }
    
    open.value = false
    getList()
  } catch (error) {
    console.error('操作失败:', error)
    if (error === false) {
      ElMessage.error('表单验证失败，请检查填写内容')
    } else {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  }
}

const cancel = () => {
  open.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 清空BOM列表和特性参数列表
  bomList.value = []
  paramList.value = []
}

// 获取品牌列表
const getBrandList = async () => {
  try {
    const res = await getAllBrand()
    brandList.value = res.data
  } catch (error) {
    ElMessage.error('获取品牌列表失败')
  }
}

// 获取系列列表，支持根据品牌ID过滤
const getSeriesList = async (brandId = null) => {
  try {
    let res
    if (brandId) {
      res = await getSeriesByBrand(brandId)
    } else {
      res = await getAllSeries()
    }
    seriesList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取系列列表失败')
    seriesList.value = []
  }
}




// 将扁平数据转换为树形结构
const convertToTree = (data) => {
  const tree = []
  const map = {}
  
  // 构建目录ID到目录对象的映射
  data.forEach(item => {
    map[item.catalogId] = { ...item, children: [] }
  })
  
  // 构建树形结构
  data.forEach(item => {
    const parentId = item.parentId || 0
    if (parentId === 0) {
      // 根节点
      tree.push(map[item.catalogId])
    } else if (map[parentId]) {
      // 子节点
      map[parentId].children.push(map[item.catalogId])
    }
  })
  
  // 根据排序字段对每个节点的子节点进行排序
  const sortChildren = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => (a.catalogSort || 0) - (b.catalogSort || 0))
      node.children.forEach(child => sortChildren(child))
    }
  }
  
  tree.forEach(root => sortChildren(root))
  
  return tree
}

// 获取目录树列表
const getCatalogTree = async () => {
  try {
    const res = await listCatalog()
    // 确保有返回数据再进行处理
    if (res && res.code === 200 && res.rows) {
      // 转换为树形结构，用于树形选择器
      catalogTree.value = convertToTree(res.rows)
    } else {
      catalogTree.value = []
    }
  } catch (error) {
    console.error('获取目录树失败:', error)
    catalogTree.value = []
    ElMessage.error('获取目录树失败: ' + (error.message || '未知错误'))
  }
}



// 自动集成目录属性
const handleAutoIntegrateAttributes = async () => {
  if (!form.productId || !form.catalogId) return
  
  try {
    const res = await autoIntegrateCatalogAttributes(form.productId)
    if (res.code === 200) {
      ElMessage.success('目录属性集成成功')
      // 手动触发属性刷新
      if (attributesRef.value) {
        attributesRef.value.refresh()
      }
    } else {
      ElMessage.error('目录属性集成失败：' + res.msg)
    }
  } catch (error) {
    console.error('目录属性集成失败:', error)
    ElMessage.error('目录属性集成失败：' + (error.message || '未知错误'))
  }
}

// 保存产品属性
const saveProductAttributes = async () => {
  if (!form.productId) {
    ElMessage.warning('请先保存产品基本信息')
    return
  }
  
  if (!attributesRef.value) {
    ElMessage.warning('产品属性组件未加载完成')
    return
  }
  
  // 从组件中获取最新的产品属性
  const currentAttributes = attributesRef.value.getProductAttributes()
  
  if (currentAttributes.length === 0) {
    ElMessage.warning('没有需要保存的产品属性')
    return
  }
  
  try {
    // 准备需要保存的数据
    const saveData = currentAttributes.map(attrRelation => ({
      relationId: attrRelation.relationId,
      productId: form.productId,
      attributeId: attrRelation.attribute.attributeId,
      catalogRelationId: attrRelation.relationId, // 使用relationId作为catalogRelationId
      attributeValue: attrRelation.attributeValue
    }))
    
    const res = await batchUpdateProductAttributeRelation(saveData)
    if (res.code === 200) {
      ElMessage.success('产品属性保存成功')
    } else {
      ElMessage.error('产品属性保存失败：' + res.msg)
    }
  } catch (error) {
    console.error('保存产品属性失败:', error)
    ElMessage.error('产品属性保存失败：' + (error.message || '未知错误'))
  }
}

// 表单引用
const formRef = ref(null)

// 监听品牌ID变化，联动更新系列列表
watch(
  () => form.brandId,
  (newBrandId, oldBrandId) => {
    if (newBrandId !== oldBrandId) {
      // 清空当前选择的系列
      form.seriesId = null
      // 根据新的品牌ID获取系列列表
      getSeriesList(newBrandId)
    }
  }
)

onMounted(async () => {
  await Promise.all([getBrandList(), getCatalogTree()])
  getList()
})
</script>
