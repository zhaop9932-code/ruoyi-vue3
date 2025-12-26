<template>
  <div class="bom-node-dynamic-props">
    <div class="dynamic-props-header">
      <h4>动态属性管理</h4>
      <el-button type="primary" icon="Edit" @click="handleEdit" :disabled="selectedProps.length !== 1">编辑</el-button>
      <el-button type="primary" icon="Refresh" @click="handleRefresh">刷新</el-button>
    </div>
    
    <div class="dynamic-props-content">
      <el-table
        v-loading="loading"
        :data="dynamicPropsList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="attributeId" label="属性ID" width="120" />
        <el-table-column prop="attributeName" label="属性名称" width="180" />
        <el-table-column prop="attributeCode" label="属性编码" width="180" />
        <el-table-column prop="attributeType" label="属性类型" width="120">
          <template #default="scope">
            <el-tag :type="getPropTypeTagType(scope.row.attributeType)">
              {{ getPropTypeName(scope.row.attributeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="componentType" label="组件类型" width="120" />
        <el-table-column prop="attributeValues" label="属性值" width="250">
          <template #default="scope">
            <!-- 解析属性值，支持数组和字符串格式 -->
            <template v-if="Array.isArray(scope.row.attributeValues)">
              <el-tag
                v-for="(value, index) in scope.row.attributeValues"
                :key="index"
                type="info"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ value.valueName || value }}
              </el-tag>
            </template>
            <template v-else-if="scope.row.attributeValues">
              <!-- 处理字符串格式，尝试解析JSON -->
              <el-tag
                v-for="(value, index) in parseAttributeValues(scope.row.attributeValues)"
                :key="index"
                type="info"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ value }}
              </el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源类型" width="100">
          <template #default="scope">
            <el-tag :type="getSourceTypeTagType(scope.row.sourceType)">
              {{ getSourceTypeName(scope.row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isRequired" label="是否必填" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isRequired === '1' ? 'success' : 'warning'">
              {{ scope.row.isRequired === '1' ? '必填' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="默认值" width="120" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
      </el-table>
      
      <div class="table-footer">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 编辑动态属性对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="propFormRef" :model="propForm" :rules="rules" label-width="120px">
        <el-form-item label="属性名称" prop="attributeName">
          <el-input v-model="propForm.attributeName" placeholder="请输入属性名称" disabled />
        </el-form-item>
        <el-form-item label="属性编码" prop="attributeCode">
          <el-input v-model="propForm.attributeCode" placeholder="请输入属性编码" disabled />
        </el-form-item>
        <el-form-item label="属性类型" prop="attributeType">
          <el-select v-model="propForm.attributeType" placeholder="请选择属性类型" disabled>
            <el-option label="文本" value="0" />
            <el-option label="数值" value="1" />
            <el-option label="下拉" value="2" />
            <el-option label="单选" value="3" />
            <el-option label="多选" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="组件类型" prop="componentType">
          <el-select v-model="propForm.componentType" placeholder="请选择组件类型">
            <el-option label="输入框" value="input" />
            <el-option label="下拉框" value="select" />
            <el-option label="单选框" value="radio" />
            <el-option label="多选框" value="checkbox" />
            <el-option label="数字输入框" value="input-number" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否必填" prop="isRequired">
          <el-select v-model="propForm.isRequired" placeholder="请选择是否必填">
            <el-option label="可选" value="0" />
            <el-option label="必填" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="propForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="propForm.sortOrder" :min="0" :step="1" placeholder="请输入排序" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Refresh } from '@element-plus/icons-vue'

// 导入动态属性API
import {
  getSuperBomDynamicAttributeByBomStructureId,
  getSuperBomDynamicAttribute,
  updateSuperBomDynamicAttribute
} from '@/api/cpq/superBomDynamicAttribute'

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

// 动态属性列表
const dynamicPropsList = ref([])

// 选中的属性
const selectedProps = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('编辑动态属性')

// 表单引用
const propFormRef = ref(null)

// 表单数据
const propForm = reactive({
  id: null,
  bomStructureId: props.bomStructureId,
  attributeId: null,
  attributeCode: '',
  attributeName: '',
  attributeType: '',
  componentType: '',
  sourceType: null,
  sourceId: null,
  attributeValues: [],
  isRequired: '0',
  defaultValue: '',
  sortOrder: 0
})

// 表单验证规则
const rules = reactive({
  attributeName: [
    { required: true, message: '属性名称不能为空', trigger: 'blur' }
  ],
  attributeType: [
    { required: true, message: '请选择属性类型', trigger: 'change' }
  ],
  componentType: [
    { required: true, message: '请选择组件类型', trigger: 'change' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序必须大于等于0', trigger: 'blur' }
  ]
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取属性类型名称
const getPropTypeName = (type) => {
  const typeMap = {
    '0': '文本',
    '1': '数值',
    '2': '下拉',
    '3': '单选',
    '4': '多选'
  }
  return typeMap[type] || type
}

// 获取属性类型标签样式
const getPropTypeTagType = (type) => {
  const typeMap = {
    '0': 'primary',
    '1': 'success',
    '2': 'warning',
    '3': 'info',
    '4': 'danger'
  }
  return typeMap[type] || 'primary'
}

// 获取来源类型名称
const getSourceTypeName = (type) => {
  const typeMap = {
    '1': '产品',
    '2': '系列',
    '3': '分类'
  }
  return typeMap[type] || type
}

// 获取来源类型标签样式
const getSourceTypeTagType = (type) => {
  const typeMap = {
    '1': 'primary',
    '2': 'success',
    '3': 'warning'
  }
  return typeMap[type] || 'primary'
}

// 解析属性值，支持JSON字符串和普通字符串
const parseAttributeValues = (attributeValues) => {
  if (!attributeValues) {
    return []
  }
  
  // 如果是字符串，尝试解析为JSON数组
  if (typeof attributeValues === 'string') {
    try {
      const parsed = JSON.parse(attributeValues)
      if (Array.isArray(parsed)) {
        return parsed
      } else {
        // 如果解析后不是数组，作为单个值返回
        return [parsed]
      }
    } catch (error) {
      // 解析失败，作为单个值返回
      return [attributeValues]
    }
  }
  
  // 如果是其他类型，转换为数组
  return [attributeValues]
}

// 选中项变化
const handleSelectionChange = (selection) => {
  selectedProps.value = selection
}

// 加载动态属性数据
const loadDynamicProps = async () => {
  if (!props.bomStructureId) {
    dynamicPropsList.value = []
    return
  }
  
  loading.value = true
  
  try {
    // 调用真实API获取动态属性数据
    const response = await getSuperBomDynamicAttributeByBomStructureId(props.bomStructureId)
    
    // 处理API响应
    if (response && Array.isArray(response.data)) {
      dynamicPropsList.value = response.data
      pagination.total = response.data.length
    } else if (response && response.rows) {
      dynamicPropsList.value = response.rows
      pagination.total = response.total || response.rows.length
    } else {
      dynamicPropsList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载动态属性失败:', error)
    ElMessage.error('加载动态属性失败')
    dynamicPropsList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 监听节点ID变化
watch(() => props.bomStructureId, (newBomStructureId) => {
  loadDynamicProps()
})

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadDynamicProps()
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current
  loadDynamicProps()
}

// 刷新动态属性
const handleRefresh = async () => {
  if (!props.bomStructureId) {
    ElMessage.warning('请先选择BOM节点')
    return
  }
  
  try {
    loading.value = true
    
    // 重新加载动态属性列表
    await loadDynamicProps()
    
    ElMessage.success('动态属性刷新成功')
  } catch (error) {
    console.error('刷新动态属性失败:', error)
    ElMessage.error('刷新动态属性失败')
  } finally {
    loading.value = false
  }
}

// 编辑动态属性
const handleEdit = () => {
  if (selectedProps.value.length !== 1) {
    ElMessage.warning('请选择一个动态属性进行编辑')
    return
  }
  
  const selectedProp = selectedProps.value[0]
  // 填充表单数据
  Object.assign(propForm, {
    ...selectedProp,
    bomStructureId: props.bomStructureId
  })
  
  dialogVisible.value = true
}

// 对话框提交
const handleDialogSubmit = async () => {
  try {
    await propFormRef.value.validate()
    
    // 更新动态属性
    await updateSuperBomDynamicAttribute(propForm)
    
    // 重新加载数据
    await loadDynamicProps()
    
    ElMessage.success('动态属性更新成功')
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交动态属性表单失败:', error)
    }
  }
}

// 监听BOM结构ID变化
watch(() => props.bomStructureId, (newBomStructureId) => {
  propForm.bomStructureId = newBomStructureId
  loadDynamicProps()
})

// 组件挂载时
onMounted(() => {
  loadDynamicProps()
})
</script>

<style scoped>
.bom-node-dynamic-props {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.dynamic-props-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dynamic-props-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.dynamic-props-content {
  background-color: #fff;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.selection-actions {
  display: flex;
  gap: 10px;
}
</style>