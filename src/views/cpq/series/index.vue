<template>
  <div class="series-management">
    <!-- 页面标题和操作栏组合 -->
    <div class="header-wrapper">
      <h2 class="page-title">系列管理</h2>
      <div class="action-bar">
        <div class="primary-actions">
          <el-button
            type="primary"
            size="default"
            icon="Plus"
            @click="handleAdd"
          >
            新增系列
          </el-button>
          <el-button
            type="danger"
            size="default"
            icon="Delete"
            :disabled="multipleSelection.length === 0"
            @click="handleDeleteAll"
          >
            批量删除
          </el-button>
          <el-button
            type="warning"
            size="default"
            icon="Download"
            @click="handleExport"
          >
            导出
          </el-button>
          <el-button
            type="success"
            size="default"
            icon="Upload"
            @click="handleImport"
          >
            导入
          </el-button>
          <el-button
            type="info"
            size="default"
            icon="Search"
            @click="toggleSearch"
          >
            {{ showSearch ? '收起' : '展开' }}搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section" v-show="showSearch">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px" class="search-form">
        <el-form-item label="系列编码" prop="seriesCode">
          <el-input
            v-model="queryParams.seriesCode"
            placeholder="请输入系列编码"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="系列名称" prop="seriesName">
          <el-input
            v-model="queryParams.seriesName"
            placeholder="请输入系列名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="所属品牌" prop="brandId">
          <el-select
            v-model="queryParams.brandId"
            placeholder="请选择所属品牌"
            clearable
            size="small"
          >
            <el-option v-for="brand in brandList" :key="brand.brandId" :label="brand.brandName" :value="brand.brandId" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属产品目录" prop="catalogId">
          <el-select
            v-model="queryParams.catalogId"
            placeholder="请选择归属产品目录"
            clearable
            size="small"
          >
            <el-option
              v-for="catalog in flatCatalogList"
              :key="catalog.catalogId"
              :label="'─'.repeat(catalog.level) + catalog.catalogName"
              :value="catalog.catalogId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="系列状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择系列状态"
            clearable
            size="small"
          >
            <el-option label="启用" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="RefreshRight" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="seriesList" @selection-change="handleSelectionChange" border style="width: 100%;">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="系列编码" align="center" prop="seriesCode" min-width="110" />
        <el-table-column label="系列名称" align="center" prop="seriesName" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="所属品牌" align="center" prop="brandName" min-width="110" />
        <el-table-column label="系列状态" align="center" prop="status" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="70" />
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="150" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              style="margin-right: 5px"
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 添加或修改系列对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body class="dialog-wrapper">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="dialog-form">
        <el-form-item label="系列编码" prop="seriesCode">
          <el-input 
            v-model="form.seriesCode" 
            placeholder="由系统自动生成" 
            :readonly="!form.seriesId" 
            :disabled="!form.seriesId"
            size="default"
          />
          <div v-if="!form.seriesId" class="el-form-item__help" style="color: #909399;">
            系列编码由系统自动生成，无需手动输入
          </div>
        </el-form-item>
        <el-form-item label="系列名称" prop="seriesName">
          <el-input v-model="form.seriesName" placeholder="请输入系列名称" size="default" />
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="form.brandId" placeholder="请选择品牌" size="default">
            <el-option v-for="brand in brandList" :key="brand.brandId" :label="brand.brandName" :value="brand.brandId" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属产品目录" prop="catalogId">
          <el-tree-select
              v-model="form.catalogId"
              :data="treeSelectData"
              :props="{ value: 'catalogId', label: 'catalogName', children: 'children' }"
              placeholder="请选择归属产品目录"
              clearable
              style="width: 100%"
              size="default"
          />
        </el-form-item>
    
        <el-form-item label="系列状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="请输入排序值" size="default" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="default" @click="cancel">取消</el-button>
          <el-button size="default" type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入系列对话框 -->
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的系列数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="upload.isUploading" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.series-management {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 15px;
  box-sizing: border-box;
}

.search-form .search-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
  align-self: center;
  margin-bottom: 0;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.action-bar .el-button {
  transition: all 0.2s ease;
}

.action-bar .el-button:hover {
  transform: translateY(-1px);
}

.primary-actions {
  display: flex;
  gap: 8px;
}

.search-section {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 0;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.search-form .el-form-item {
  margin-right: 12px;
  margin-bottom: 12px;
}

.search-form .el-form-item__label {
  font-size: 13px;
  padding: 0 8px 0 0;
  font-weight: 500;
}

.search-form .el-input__wrapper,
.search-form .el-select__wrapper {
  font-size: 13px;
}

/* 表格样式优化 */
.table-container {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 表格基本样式 */
.table-container .el-table {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  border-radius: 4px;
  overflow: hidden;
}

/* 表头样式 */
.table-container .el-table__header-wrapper {
  background-color: #fafafa;
}

.table-container .el-table__header th {
  font-weight: 600;
  color: #303133;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

/* 表格内容样式 */
.table-container .el-table__body tr {
  height: 48px;
}

.table-container .el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

.table-container .el-table__body td {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

/* 表格内标签样式 */
.table-container .el-tag {
  padding: 0 6px;
  font-size: 12px;
  height: 22px;
  line-height: 20px;
}

/* 表格内按钮样式 */
.table-container .el-button--small {
  padding: 6px 12px;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 15px;
  background-color: #fafafa;
  border-top: 1px solid #ebeef5;
}

/* 对话框相关样式 */
.dialog-wrapper {
  width: 90%;
  max-width: 600px;
  transition: all 0.3s ease;
}

.dialog-form .el-form-item {
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.dialog-form .el-form-item__label {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

/* 交互动效 */
.action-bar .el-button,
.dialog-footer .el-button,
.search-form .el-button {
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.action-bar .el-button:hover,
.dialog-footer .el-button:hover,
.search-form .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 表格行悬停效果增强 */
.table-container .el-table__body tr {
  transition: all 0.15s ease;
}

/* 表单输入框交互 */
.dialog-form .el-input__wrapper:hover,
.dialog-form .el-select__wrapper:hover,
.dialog-form .el-input-number:hover {
  box-shadow: 0 0 0 1px #409EFF inset;
}

/* 搜索区域过渡效果 */
.search-section {
  transition: all 0.3s ease;
}

/* 页面整体过渡效果 */
.series-management {
  transition: padding 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .series-management {
    padding: 10px;
  }
  
  .search-form .el-form-item__content {
    width: 150px;
  }
}

@media (max-width: 768px) {
  .series-management {
    padding: 8px;
    gap: 10px;
  }
  
  .header-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 8px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .action-bar {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .action-bar .el-button {
    padding: 8px 15px;
    font-size: 13px;
  }
  
  .search-section {
    padding: 10px;
  }
  
  .search-form .el-form-item {
    width: 100%;
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .search-form .el-form-item__content {
    width: 100%;
  }
  
  .search-form .search-buttons {
    margin-left: 0;
    margin-top: 5px;
  }
  
  .dialog-wrapper {
    width: 95%;
    margin: 0 auto;
  }
  
  .table-container {
    overflow-x: auto;
  }
}
</style>

<script setup>
import { ref, reactive, onMounted, onActivated, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { listSeries, getSeries, addSeries, updateSeries, delSeries, listBrand, exportSeries } from '@/api/cpq/series'
import { listCatalog } from '@/api/cpq/catalog'

const { proxy } = getCurrentInstance()
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const seriesList = ref([])
const brandList = ref([])
const treeSelectData = ref([]) // 用于目录选择器的数据
const flatCatalogList = ref([])
const multipleSelection = ref([])
const title = ref('')
const open = ref(false)
const formRef = ref()

// 上传相关
const upload = reactive({
  // 上传参数
  open: false,
  title: '导入系列',
  url: import.meta.env.VITE_APP_BASE_API + '/cpq/series/import',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  },
  isUploading: false,
  isUpdateSupport: 0,
  updateSupport: 0,
  fileList: [],
  successMsg: ''
})

const uploadRef = ref()

// 导入模板
const importTemplate = () => {
  proxy.download("cpq/series/importTemplate", {}, `series_import_template_${new Date().getTime()}.xlsx`)
}

const form = reactive({
  seriesId: null,
  seriesCode: '',
  seriesName: '',
  brandId: null,
  catalogId: null,
  status: '0',
  sortOrder: 0
})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  seriesCode: '',
  seriesName: '',
  brandId: '',
  catalogId: '',
  status: ''
})

const rules = reactive({
  seriesName: [
    { required: true, message: '系列名称不能为空', trigger: 'blur' },
    { min: 2, max: 128, message: '系列名称长度在 2 到 128 个字符', trigger: 'blur' }
  ],
  brandId: [{ required: true, message: '请选择所属品牌', trigger: 'change' }],
  catalogId: [
    { required: true, message: '请选择归属产品目录', trigger: 'change' }
  ],
  status: [{ required: true, message: '系列状态不能为空', trigger: 'change' }]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await listSeries(queryParams)
    seriesList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取系列列表失败')
  }
}

/** 查询产品目录下拉树列表（仿照产品目录管理页面的实现）*/
const getTreeselect = async () => {
  try {
    const res = await listCatalog()
    console.log('listCatalog API返回数据:', res)
    // 确保有返回数据再进行处理
    let data = []
    if (res && res.data && Array.isArray(res.data)) {
      // { code: 200, data: [...] } 格式
      data = res.data
    } else if (res && res.rows) {
      // 分页格式的响应 { rows: [...], total: ... }
      data = res.rows
    } else if (Array.isArray(res)) {
      // 直接返回数组的情况
      data = res
    } else if (res && res.data && typeof res.data === 'object') {
      // { data: { rows: [...], total: ... } } 格式
      data = res.data.rows || []
    } else {
      // 其他格式，尝试获取数据
      data = res || []
    }
    console.log('处理后的目录数据:', data)
    // 转换为树形结构，用于树形选择器
    const treeData = convertToTree(data)
    console.log('转换后的树形结构:', treeData)
    treeSelectData.value = treeData
    console.log('最终目录树数据:', treeSelectData.value)
  } catch (error) {
    console.error('获取目录树失败:', error)
    treeSelectData.value = []
    ElMessage.error('获取目录树失败: ' + (error.message || '未知错误'))
  }
}

// 将扁平数据转换为树形结构（仿照产品目录管理页面的实现）
const convertToTree = (data) => {
  const tree = []
  const map = {}
  
  // 确保data是数组
  const dataArray = Array.isArray(data) ? data : []
  
  // 构建目录ID到目录对象的映射，并将catalogId转换为字符串类型
  dataArray.forEach(item => {
    // 支持多种字段名
    const catalogId = String(item.catalogId || item.id || item.CatalogId)
    const parentId = String(item.parentId || item.parent_id || item.ParentId || 0)
    const catalogName = item.catalogName || item.name || item.CatalogName || '未命名目录'
    
    map[catalogId] = { 
      ...item, 
      catalogId, // 转换为字符串类型
      parentId, // 转换为字符串类型
      catalogName, // 确保有名称
      children: [] 
    }
  })
  
  // 构建树形结构
  dataArray.forEach(item => {
    const catalogId = String(item.catalogId || item.id || item.CatalogId)
    const parentId = String(item.parentId || item.parent_id || item.ParentId || 0)
    
    if (map[catalogId]) {
      if (parentId === '0' || !parentId) {
        // 根节点
        tree.push(map[catalogId])
      } else if (map[parentId]) {
        // 子节点
        map[parentId].children.push(map[catalogId])
      } else {
        // 找不到父节点，作为根节点处理
        tree.push(map[catalogId])
      }
    }
  })
  
  // 根据排序字段对每个节点的子节点进行排序
  const sortChildren = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => (a.catalogSort || a.sortOrder || 0) - (b.catalogSort || b.sortOrder || 0))
      node.children.forEach(child => sortChildren(child))
    }
  }
  
  tree.forEach(root => sortChildren(root))
  
  return tree
}

const getBrandList = async () => {
  try {
    const res = await listBrand()
    console.log('listBrand API返回数据:', res)
    // 处理API返回的响应格式，支持多种格式
    let brandData = []
    if (res && res.data && Array.isArray(res.data)) {
      // { code: 200, data: [...] } 格式
      brandData = res.data
    } else if (res && res.rows) {
      // 分页格式 { rows: [...], total: ... }
      brandData = res.rows
    } else if (Array.isArray(res)) {
      // 直接返回数组
      brandData = res
    } else {
      // 其他格式，直接使用
      brandData = res
    }
    console.log('处理后的品牌数据:', brandData)
    // 将品牌列表中的brandId转换为字符串类型，确保与select的value类型一致
    brandList.value = Array.isArray(brandData) ? brandData.map(brand => {
      const processedBrand = {
        ...brand,
        brandId: String(brand.brandId || brand.id || ''), // 转换为字符串类型，支持brandId和id两种字段名
        brandName: brand.brandName || brand.name || '未命名品牌' // 确保有名称
      }
      console.log('转换后的品牌数据项:', processedBrand)
      return processedBrand
    }) : []
    console.log('最终品牌列表:', brandList.value)
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    brandList.value = []
    ElMessage.error('获取品牌列表失败')
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.seriesCode = ''
  queryParams.seriesName = ''
  queryParams.brandId = ''
  queryParams.catalogId = ''
  queryParams.status = ''
  handleQuery()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleAdd = async () => {
  form.seriesId = null
  form.seriesCode = ''
  form.seriesName = ''
  form.brandId = null
  form.catalogId = null
  form.status = '0'
  form.sortOrder = 0
  title.value = '新增系列'
  
  // 确保产品目录数据已加载
  if (treeSelectData.value.length === 0) {
    console.log('目录数据为空，重新加载目录数据...')
    await getTreeselect()
  }
  
  open.value = true
}

const handleUpdate = async (row) => {
  console.log('=== 开始处理修改系列 ===')
  console.log('传入的row数据:', row)
  
  form.seriesId = row.seriesId
  form.seriesCode = row.seriesCode
  form.seriesName = row.seriesName
  
  // 转换为字符串类型，确保与option的value类型一致，正确显示label
  console.log('原始row.brandId:', row.brandId, '类型:', typeof row.brandId)
  form.brandId = String(row.brandId || '')
  console.log('设置form.brandId:', form.brandId, '类型:', typeof form.brandId)
  
  console.log('原始row.catalogId:', row.catalogId, '类型:', typeof row.catalogId)
  form.catalogId = String(row.catalogId || '')
  console.log('设置form.catalogId:', form.catalogId, '类型:', typeof form.catalogId)
  
  form.status = row.status
  form.sortOrder = row.sortOrder
  
  console.log('当前brandList:', brandList.value)
  console.log('当前treeSelectData:', treeSelectData.value)
  
  // 检查品牌是否存在
  const foundBrand = brandList.value.find(brand => brand.brandId === form.brandId)
  console.log('找到的品牌:', foundBrand)
  
  // 确保产品目录数据已加载
  if (treeSelectData.value.length === 0) {
    console.log('目录数据为空，重新加载...')
    await getTreeselect()
    console.log('重新加载后的treeSelectData:', treeSelectData.value)
  }
  
  console.log('打开弹窗前的form数据:', form)
  title.value = '修改系列'
  open.value = true
  console.log('=== 处理修改系列结束 ===')
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该系列吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await delSeries(row.seriesId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleDeleteAll = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的系列')
    return
  }
  
  await ElMessageBox.confirm('确定要删除选中的系列吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    // 批量删除系列
    const seriesIds = multipleSelection.value.map(item => item.seriesId).join(',')
    await delSeries(seriesIds)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleExport = () => {
  const { proxy } = getCurrentInstance()
  proxy.download("cpq/series/export", {
    ...queryParams
  }, `series_${new Date().getTime()}.xlsx`)
}

// 打开导入对话框
const handleImport = () => {
  upload.title = '导入系列'
  upload.open = true
}

// 提交上传文件
const submitFileForm = () => {
  if (uploadRef.value && uploadRef.value.uploadFiles.length > 0) {
    uploadRef.value.submit()
  } else {
    ElMessage.warning('请选择要上传的文件')
  }
}

// 文件上传中处理
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}

// 文件上传成功处理
const handleFileSuccess = (response, file, fileList) => {
  upload.isUploading = false
  if (response.code === 200) {
    upload.successMsg = response.msg
    ElMessage.success(response.msg)
    upload.open = false
    // 重新获取列表数据
    getList()
  } else {
    ElMessage.error(response.msg)
  }
}

// 文件选择变化处理
const handleFileChange = (file, fileList) => {
  upload.updateSupport = fileList.length > 0
}

// 文件移除处理
const handleFileRemove = (file, fileList) => {
  upload.updateSupport = fileList.length > 0
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate().then(async () => {
    try {
      if (form.seriesId) {
        await updateSeries(form)
        ElMessage.success('修改成功')
      } else {
        await addSeries(form)
        ElMessage.success('新增成功')
      }
      open.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    ElMessage.error('表单验证失败，请检查填写内容')
  })
}

const cancel = () => {
  open.value = false
  // 重置表单
  if (formRef.value) {
      formRef.value.resetFields()
    }
}

// 定义$refs
const $refs = ref({
  form: null
})

onMounted(async () => {
  console.log('组件挂载，开始加载初始数据...')
  await getBrandList()
  await getTreeselect() // 加载目录树数据
  getList()
  console.log('初始数据加载完成')
})

// 组件激活时重新加载数据
onActivated(async () => {
  console.log('组件激活，开始重新加载数据...')
  await getBrandList()
  await getTreeselect() // 加载目录树数据
  getList()
  console.log('数据重新加载完成')
})
</script>