<template>
  <div class="app-container">
    <div class="head-container">
      <div class="title-container">
        <el-page-header
          @back="goBack"
          :content="'属性组管理'"
        />
      </div>
      <div class="button-container">
        <el-button
          type="primary"
          plain
          @click="handleAdd"
          v-hasPermi="['cpq:attributeGroup:add']"
        >
          <i class="el-icon-plus"></i> 新增
        </el-button>
        <el-button
          type="danger"
          plain
          @click="handleDeleteAll"
          :disabled="multipleSelection.length === 0"
          v-hasPermi="['cpq:attributeGroup:delete']"
        >
          <i class="el-icon-delete"></i> 批量删除
        </el-button>
        <el-button
          type="warning"
          plain
          @click="handleExport"
          v-hasPermi="['cpq:attributeGroup:export']"
        >
          <i class="el-icon-download"></i> 导出
        </el-button>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="showSearch" class="search-form">
        <el-form
          :inline="true"
          :model="queryParams"
          ref="queryFormRef"
          label-width="68px"
        >
          <el-form-item label="属性组编码" prop="attributeGroupCode">
            <el-input
              v-model="queryParams.attributeGroupCode"
              placeholder="请输入属性组编码"
              clearable
              size="small"
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="属性组名称" prop="attributeGroupName">
            <el-input
              v-model="queryParams.attributeGroupName"
              placeholder="请输入属性组名称"
              clearable
              size="small"
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="handleQuery"
            >
              搜索
            </el-button>
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="resetQuery"
            >
              重置
            </el-button>
            <el-button
              size="small"
              @click="toggleSearch"
            >
              {{ showSearch ? '收起' : '展开' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <el-table
      v-loading="loading"
      :data="attributeGroupList"
      @selection-change="handleSelectionChange"
      border
      stripe
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="属性组ID" prop="attributeGroupId" width="80" align="center" />
      <el-table-column label="属性组编码" prop="attributeGroupCode" min-width="120" />
      <el-table-column label="属性组名称" prop="attributeGroupName" min-width="150" />
      <el-table-column label="描述" prop="description" min-width="200" />
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['cpq:attributeGroup:edit']"
              >
                修改
              </el-button>
              <el-button
                size="small"
                type="info"
                @click="handleAttributeAssociation(scope.row)"
                v-hasPermi="['cpq:attributeGroupAttribute:add']"
              >
                关联属性
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                v-hasPermi="['cpq:attributeGroup:delete']"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/修改属性组对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="属性组编码" prop="attributeGroupCode">
          <el-input
            v-model="formData.attributeGroupCode"
            placeholder="请输入属性组编码"
            clearable
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="属性组名称" prop="attributeGroupName">
          <el-input
            v-model="formData.attributeGroupName"
            placeholder="请输入属性组名称"
            clearable
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="9999"
            :step="1"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitForm"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listAttributeGroup, addAttributeGroup, updateAttributeGroup, delAttributeGroup,
  delAttributeGroupBatch, checkAttributeGroupCodeUnique } from '@/api/cpq/attributeGroup'

const router = useRouter()
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const attributeGroupList = ref([])
const multipleSelection = ref([])
const queryFormRef = ref()
const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)

// 表单数据
const formData = reactive({
  attributeGroupId: null,
  attributeGroupCode: '',
  attributeGroupName: '',
  description: '',
  sortOrder: 0
})

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  attributeGroupCode: '',
  attributeGroupName: ''
})

// 表单验证规则
const formRules = reactive({
  attributeGroupCode: [
    { required: true, message: '属性组编码不能为空', trigger: 'blur' },
    { 
      validator: async (rule, value, callback) => {
        if (!value) {
          callback(new Error('属性组编码不能为空'))
          return
        }
        try {
          const res = await checkAttributeGroupCodeUnique(value, formData.attributeGroupId)
          if (!res.data.unique) {
            callback(new Error('属性组编码已存在'))
          } else {
            callback()
          }
        } catch (error) {
          callback(new Error('验证失败'))
        }
      }, 
      trigger: 'blur' 
    }
  ],
  attributeGroupName: [
    { required: true, message: '属性组名称不能为空', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '排序不能为空', trigger: 'blur' },
    { type: 'number', message: '请输入数字', trigger: 'blur' }
  ]
})

// 计算属性
const dialogTitle = computed(() => {
  return formData.attributeGroupId ? '修改属性组' : '新增属性组'
})

const isEdit = computed(() => {
  return !!formData.attributeGroupId
})

// 初始化
onMounted(() => {
  getList()
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await listAttributeGroup(queryParams)
    attributeGroupList.value = res.rows
    total.value = res.total
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取属性组列表失败')
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.attributeGroupCode = ''
  queryParams.attributeGroupName = ''
  handleQuery()
}

// 切换搜索条件展开/收起
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// 分页大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

// 当前页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getList()
}

// 选择行变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 行点击
const handleRowClick = (row) => {
  // 实现点击行选中效果
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 新增属性组
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 修改属性组
const handleUpdate = async (row) => {
  resetForm()
  try {
    const res = await listAttributeGroup({ attributeGroupId: row.attributeGroupId })
    if (res.rows && res.rows.length > 0) {
      Object.assign(formData, res.rows[0])
      dialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取属性组详情失败')
  }
}

// 删除单个属性组
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该属性组吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await delAttributeGroup(row.attributeGroupId)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 批量删除属性组
const handleDeleteAll = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的属性组')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个属性组吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const ids = multipleSelection.value.map(item => item.attributeGroupId)
    await delAttributeGroupBatch(ids)
    ElMessage.success('删除成功')
    getList()
    multipleSelection.value = []
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能待实现')
}

// 跳转到属性组属性关联页面
const handleAttributeAssociation = (row) => {
  router.push({
    path: '/cpq/attributeGroupAttribute',
    query: {
      attributeGroupId: row.attributeGroupId,
      attributeGroupName: row.attributeGroupName
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.attributeGroupId = null
  formData.attributeGroupCode = ''
  formData.attributeGroupName = ''
  formData.description = ''
  formData.sortOrder = 0
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateAttributeGroup(formData)
          ElMessage.success('修改成功')
        } else {
          await addAttributeGroup(formData)
          ElMessage.success('新增成功')
        }
        closeDialog()
        getList()
      } catch (error) {
        ElMessage.error(isEdit.value ? '修改失败' : '新增失败')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.head-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-container {
  flex: 1;
}

.button-container {
  display: flex;
  gap: 10px;
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>