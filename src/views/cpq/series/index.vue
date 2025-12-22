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
      <el-table v-loading="loading" :data="seriesList" @selection-change="handleSelectionChange" border style="width: 100%">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="系列编码" align="center" prop="seriesCode" width="110" />
        <el-table-column label="系列名称" align="center" prop="seriesName" width="140" :show-overflow-tooltip="true" />
        <el-table-column label="所属品牌" align="center" prop="brandName" width="110" />
        <el-table-column label="系列状态" align="center" prop="status" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="70" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
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
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
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
  </div>
</template>

<style scoped>
.series-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 15px;
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listSeries, getSeries, addSeries, updateSeries, delSeries, listBrand, exportSeries } from '@/api/cpq/series'
import { listCatalog } from '@/api/cpq/catalog'

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
    // 确保有返回数据再进行处理
    if (res && (res.rows || Array.isArray(res))) {
      const data = res.rows || res
      // 转换为树形结构，用于树形选择器
      treeSelectData.value = convertToTree(data)
    } else {
      treeSelectData.value = []
    }
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

const getBrandList = async () => {
  try {
    const res = await listBrand()
    // 处理API返回的标准响应格式
    const brandData = res.code === 200 ? res.data : []
    brandList.value = Array.isArray(brandData) ? brandData : []
  } catch (error) {
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
  form.seriesId = row.seriesId
  form.seriesCode = row.seriesCode
  form.seriesName = row.seriesName
  form.brandId = row.brandId
  form.catalogId = row.catalogId
  form.status = row.status
  form.sortOrder = row.sortOrder
  
  // 确保产品目录数据已加载
  if (treeSelectData.value.length === 0) {
    console.log('目录数据为空，重新加载目录数据...')
    await getTreeselect()
  }
  
  title.value = '修改系列'
  open.value = true
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
  // 调用导出API
  exportSeries(queryParams).then(response => {
    // 创建下载链接并下载文件
    const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '系列列表.xlsx'
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
</script>