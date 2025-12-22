<template>
  <div class="app-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h3>产品目录管理</h3>
      <el-button
        type="primary"
        icon="Plus"
        size="small"
        @click="handleAdd()"
      >
        新增目录
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card" v-show="showSearch">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
        <el-form-item label="目录名称" prop="catalogName">
          <el-input
            v-model="queryParams.catalogName"
            placeholder="请输入目录名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="目录状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择目录状态"
            clearable
            size="small"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="RefreshRight" size="small" @click="resetQuery">重置</el-button>
          <el-button
            type="info"
            icon="Search"
            size="small"
            @click="toggleSearch"
          >
            收起搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-button
      v-show="!showSearch"
      type="info"
      icon="Search"
      size="small"
      @click="toggleSearch"
      style="margin-bottom: 10px;"
    >
      展开搜索
    </el-button>

    <!-- 目录树形表格 -->
    <el-card shadow="never" class="table-card">
      <el-table 
        v-loading="loading" 
        :data="treeData" 
        row-key="catalogId" 
        @selection-change="handleSelectionChange"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        fit
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column 
          label="目录名称" 
          align="left" 
          prop="catalogName" 
          :show-overflow-tooltip="true"
          min-width="200"
          flex-grow="1"
        >
          <template #default="scope">
            <span>{{ scope.row.catalogName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目录描述" align="left" prop="catalogDesc" :show-overflow-tooltip="true" min-width="150" flex-grow="1" />
        <el-table-column label="排序" align="center" prop="catalogSort" width="80" />
        <el-table-column label="目录状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(scope.row)"
              style="margin-right: 5px;"
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="success"
              link
              icon="Plus"
              @click="handleAdd(scope.row)"
              style="margin-right: 5px;"
            >
              新增子目录
              </el-button>
              <el-button
                size="small"
                type="info"
                link
                icon="SetUp"
                @click="handleAttributeManagement(scope.row)"
                style="margin-right: 5px;"
              >
                属性管理
              </el-button>
              <el-button
                size="small"
                type="danger"
                link
                icon="Delete"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加或修改产品目录对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="catalogFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级目录" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeSelectData"
            :props="{ value: 'catalogId', label: 'catalogName', children: 'children' }"
            placeholder="选择上级目录"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="目录名称" prop="catalogName">
          <el-input v-model="form.catalogName" placeholder="请输入目录名称" />
        </el-form-item>
        <el-form-item label="目录描述" prop="catalogDesc">
          <el-input v-model="form.catalogDesc" type="textarea" placeholder="请输入目录描述" :rows="3" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示排序" prop="catalogSort">
              <el-input-number v-model="form.catalogSort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目录状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { listCatalog, getCatalog, addCatalog, updateCatalog, delCatalog, } from '@/api/cpq/catalog'

const router = useRouter()

// 表单引用
const catalogFormRef = ref(null)
const queryFormRef = ref(null)

const catalogList = ref([])
const treeData = ref([])
const treeSelectData = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const single = ref(true)
const multiple = ref(true)
const ids = ref([])

// 查询参数
const queryParams = reactive({
  parentId: undefined,
  catalogName: undefined,
  status: undefined
})

// 表单参数
const form = reactive({
  catalogId: undefined,
  parentId: 0,
  catalogName: undefined,
  catalogDesc: undefined,
  catalogSort: 0,
  status: '1'
})

// 表单校验
const rules = reactive({
  catalogName: [{ required: true, message: '目录名称不能为空', trigger: 'blur' }],
  catalogSort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
})

// 生成带有level字段的扁平目录列表
function generateCatalogList(tree, level = 0, parentId = 0) {
  let list = []
  tree.forEach(item => {
    const catalog = {
      ...item,
      level,
      parentId
    }
    list.push(catalog)
    if (item.children && item.children.length > 0) {
      list = list.concat(generateCatalogList(item.children, level + 1, item.catalogId))
    }
  })
  return list
}

// 处理树形数据
function handleTree(data, id, parentId, children) {
  const result = []
  const map = {}
  data.forEach(item => {
    map[item[id]] = item
    item[children] = []
  })
  data.forEach(item => {
    const parent = map[item[parentId]]
    if (parent) {
      parent[children].push(item)
    } else {
      result.push(item)
    }
  })
  return result
}

/** 查询产品目录列表 */
function getList() {
  loading.value = true
  // 确保清空列表，避免数据重复
  catalogList.value = []
  treeData.value = []
  listCatalog(queryParams).then(response => {
    // 直接使用获取到的列表
    catalogList.value = response.rows
    // 转换为树形结构
    treeData.value = convertToTree(response.rows)
    loading.value = false
  }).catch(error => {
    loading.value = false
    ElMessage.error('获取目录列表失败')
  })
}

/** 将扁平数据转换为树形结构 */
function convertToTree(data) {
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
  function sortChildren(node) {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => (a.catalogSort || 0) - (b.catalogSort || 0))
      node.children.forEach(child => sortChildren(child))
    }
  }
  
  tree.forEach(root => sortChildren(root))
  
  return tree
}

/** 查询产品目录下拉列表 */
function getTreeselect() {
  listCatalog({ parentId: undefined }).then(response => {
    // 确保清空下拉列表，避免数据重复
    treeSelectData.value = []
    // 转换为树形结构，用于树形选择器
    treeSelectData.value = convertToTree(response.rows)
  }).catch(error => {
    ElMessage.error('获取目录列表失败')
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  queryParams.parentId = undefined
  queryParams.catalogName = undefined
  queryParams.status = undefined
  handleQuery()
}

/** 展开/收起搜索栏 */
function toggleSearch() {
  showSearch.value = !showSearch.value
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.catalogId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd(row) {
  resetForm()
  getTreeselect()
  if (row && row.catalogId) {
    form.parentId = row.catalogId
    title.value = '添加子目录'
  } else {
    form.parentId = 0
    title.value = '添加目录'
  }
  open.value = true
}

/** 修改按钮操作 */
function handleUpdate(row) {
  resetForm()
  getTreeselect()
  if (row) {
    getCatalog(row.catalogId).then(response => {
      Object.assign(form, response.data)
      title.value = '修改目录'
      open.value = true
    }).catch(error => {
      ElMessage.error('获取目录详情失败')
    })
  } else {
    const catalogId = ids.value[0]
    getCatalog(catalogId).then(response => {
      Object.assign(form, response.data)
      title.value = '修改目录'
      open.value = true
    }).catch(error => {
      ElMessage.error('获取目录详情失败')
    })
  }
}

/** 提交按钮 */
function submitForm() {
  if (!catalogFormRef.value) return
  
  catalogFormRef.value.validate().then(async () => {
    try {
      if (form.catalogId) {
        await updateCatalog(form)
        ElMessage.success('修改成功')
      } else {
        await addCatalog(form)
        ElMessage.success('新增成功')
      }
      open.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    ElMessage.error('表单验证失败，请检查填写内容')
  })
}
  
/** 属性管理操作 */
function handleAttributeManagement(row) {
  // 跳转到属性管理页面，传递目录ID和目录名称用于测试属性组管理
  router.push({
    path: '/cpq/attributeGroupAttribute',
    query: { 
      catalogId: row.catalogId, 
      catalogName: row.catalogName,
      // 添加额外参数说明这是用于测试属性组管理以及右侧选中属性组下的属性和属性值管理
      testMode: true
    }
  })
}
  
  /** 删除按钮操作 */
function handleDelete(row) {
  const catalogIds = row.catalogId || ids.value
  ElMessageBox.confirm('是否确认删除所选目录？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await delCatalog(catalogIds)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

/** 取消按钮 */
function cancel() {
  open.value = false
  resetForm()
}

/** 表单重置 */
function resetForm() {
  form.catalogId = undefined
  form.parentId = 0
  form.catalogName = undefined
  form.catalogDesc = undefined
  form.catalogSort = 0
  form.status = '1'
  
  if (catalogFormRef.value) {
    catalogFormRef.value.resetFields()
  }
}

onMounted(() => {
  getList()
  getTreeselect()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
}

.search-card {
  margin-bottom: 15px;
  .el-form {
    margin-bottom: 0;
  }
}

.table-card {
  width: 100%;
  margin: 0;
  padding: 0;
  
  .el-table {
    width: 100%;
    border: 1px solid #ebeef5;
    .el-table__header-wrapper {
      .el-table__header {
        width: 100%;
        th {
          background-color: #f5f7fa;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>