<template>
  <div class="solution-relation-container">
    <div class="page-header">
      <h3>BOM方案关联</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAddRelation">关联解决方案</el-button>
        <el-button @click="handleRefresh">刷新</el-button>
      </div>
    </div>
    
    <div class="card-list">
      <el-card 
        v-for="relation in solutionRelations" 
        :key="relation.relationId" 
        class="solution-card"
        shadow="hover"
      >
        <div class="card-header">
          <div class="solution-info">
            <h4>{{ relation.solution?.solutionName }}</h4>
            <div class="solution-code">{{ relation.solution?.solutionCode }}</div>
          </div>
          <div class="header-tags">
            <el-tag v-if="relation.isDefault === '1'" type="primary">默认方案</el-tag>
            <el-tag :type="getStatusType(relation.solution?.status)">
              {{ getStatusText(relation.solution?.status) }}
            </el-tag>
          </div>
        </div>
        <div class="card-content">
          <div class="content-item" v-if="relation.relationDesc">
            <span class="label">关联描述：</span>
            <span class="value">{{ relation.relationDesc }}</span>
          </div>
          <div class="content-item">
            <span class="label">关联时间：</span>
            <span class="value">{{ formatDate(relation.createTime) }}</span>
          </div>
          <div class="content-item">
            <span class="label">关联人：</span>
            <span class="value">{{ relation.createBy }}</span>
          </div>
        </div>
        <div class="card-footer">
          <el-button 
            size="small" 
            :disabled="relation.isDefault === '1'"
            @click="handleSetDefault(relation)"
          >
            设为默认
          </el-button>
          <el-button 
            size="small" 
            type="warning"
            v-if="relation.isDefault === '1'"
            @click="handleCancelDefault(relation)"
          >
            取消默认
          </el-button>
          <el-button size="small" @click="handleViewDetail(relation)">查看详情</el-button>
          <el-button size="small" type="danger" @click="handleRemoveRelation(relation)">移除关联</el-button>
        </div>
      </el-card>
      
      <div v-if="solutionRelations.length === 0" class="empty-state">
        <el-empty description="暂无关联的解决方案" />
      </div>
    </div>
    
    <!-- 关联解决方案弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="关联解决方案"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="解决方案" prop="solutionId">
          <el-select
            v-model="formData.solutionId"
            placeholder="请选择或搜索解决方案"
            filterable
            remote
            :remote-method="handleSolutionSearch"
            :loading="solutionLoading"
            style="width: 100%"
          >
            <el-option
              v-for="solution in solutionOptions"
              :key="solution.solutionId"
              :label="`${solution.solutionCode} - ${solution.solutionName}`"
              :value="solution.solutionId"
            >
              <div class="option-content">
                <div class="option-name">{{ solution.solutionName }}</div>
                <div class="option-code">{{ solution.solutionCode }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否默认">
          <el-radio-group v-model="formData.isDefault">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联描述">
          <el-input
            v-model="formData.relationDesc"
            type="textarea"
            rows="3"
            placeholder="请输入关联描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 解决方案详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="`解决方案详情 - ${selectedSolution?.solutionName}`"
      width="700px"
    >
      <div class="detail-content" v-if="selectedSolution">
        <el-descriptions border :column="2">
          <el-descriptions-item label="解决方案编码">{{ selectedSolution.solutionCode }}</el-descriptions-item>
          <el-descriptions-item label="解决方案名称">{{ selectedSolution.solutionName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedSolution.status)">
              {{ getStatusText(selectedSolution.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedSolution.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ selectedSolution.createBy }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedSolution.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新人">{{ selectedSolution.updateBy }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ selectedSolution.description || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  listSuperBomSolutionRelation, 
  addSolutionRelation, 
  removeSolutionRelation, 
  updateSuperBomSolutionRelation 
} from '@/api/cpq/bom'
import { listSolution } from '@/api/cpq/solution'

const props = defineProps({
  bomId: {
    type: String,
    required: true
  }
})

// 数据
const solutionRelations = ref([])
const solutionOptions = ref([])
const solutionLoading = ref(false)
const selectedSolution = ref(null)

// 弹窗相关
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  bomId: props.bomId,
  solutionId: '',
  isDefault: '0',
  relationDesc: ''
})

// 表单规则
const formRules = reactive({
  solutionId: [
    { required: true, message: '请选择解决方案', trigger: 'change' }
  ]
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '草稿',
    '1': '生效',
    '2': '失效'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '0': 'info',
    '1': 'success',
    '2': 'danger'
  }
  return typeMap[status] || 'info'
}

// 加载关联列表
const loadSolutionRelations = async () => {
  try {
    const res = await listSuperBomSolutionRelation({ bomId: props.bomId })
    solutionRelations.value = res.rows || []
  } catch (error) {
    ElMessage.error('加载关联列表失败')
    console.error('加载关联列表失败:', error)
  }
}

// 解决方案搜索
const handleSolutionSearch = async (query) => {
  solutionLoading.value = true
  try {
    const res = await listSolution({ solutionName: query, pageNum: 1, pageSize: 20 })
    solutionOptions.value = res.rows || []
  } catch (error) {
    ElMessage.error('搜索解决方案失败')
    console.error('搜索解决方案失败:', error)
  } finally {
    solutionLoading.value = false
  }
}

// 关联解决方案
const handleAddRelation = () => {
  Object.assign(formData, {
    bomId: props.bomId,
    solutionId: '',
    isDefault: '0',
    relationDesc: ''
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await addSolutionRelation({
          bomId: formData.bomId,
          solutionId: formData.solutionId,
          isDefault: formData.isDefault,
          relationDesc: formData.relationDesc
        })
        if (res.code === 200) {
          ElMessage.success('关联成功')
          dialogVisible.value = false
          loadSolutionRelations()
        } else {
          ElMessage.error(res.msg || '关联失败')
        }
      } catch (error) {
        ElMessage.error('关联失败')
        console.error('关联失败:', error)
      }
    }
  })
}

// 设置默认方案
const handleSetDefault = async (relation) => {
  try {
    const res = await updateSuperBomSolutionRelation({
      relationId: relation.relationId,
      isDefault: '1'
    })
    if (res.code === 200) {
      ElMessage.success('已设置为默认方案')
      loadSolutionRelations()
    } else {
      ElMessage.error(res.msg || '设置失败')
    }
  } catch (error) {
    ElMessage.error('设置失败')
    console.error('设置失败:', error)
  }
}

// 取消默认方案
const handleCancelDefault = async (relation) => {
  try {
    const res = await updateSuperBomSolutionRelation({
      relationId: relation.relationId,
      isDefault: '0'
    })
    if (res.code === 200) {
      ElMessage.success('已取消默认方案')
      loadSolutionRelations()
    } else {
      ElMessage.error(res.msg || '取消失败')
    }
  } catch (error) {
    ElMessage.error('取消失败')
    console.error('取消失败:', error)
  }
}

// 查看详情
const handleViewDetail = (relation) => {
  selectedSolution.value = relation.solution
  detailVisible.value = true
}

// 移除关联
const handleRemoveRelation = (relation) => {
  ElMessageBox.confirm('确定要移除该解决方案关联吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await removeSolutionRelation({
        bomId: relation.bomId,
        solutionId: relation.solutionId
      })
      if (res.code === 200) {
        ElMessage.success('移除成功')
        loadSolutionRelations()
      } else {
        ElMessage.error(res.msg || '移除失败')
      }
    } catch (error) {
      ElMessage.error('移除失败')
      console.error('移除失败:', error)
    }
  }).catch(() => {
    // 取消移除
  })
}

// 刷新
const handleRefresh = () => {
  loadSolutionRelations()
}

// 初始化
onMounted(() => {
  loadSolutionRelations()
})
</script>

<style scoped>
.solution-relation-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.solution-card {
  background-color: #f0fdf4;
  border-left: 4px solid #10b981;
  transition: all 0.3s ease;
}

.solution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.solution-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.solution-code {
  font-size: 14px;
  color: #606266;
}

.header-tags {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.card-content {
  margin-bottom: 20px;
}

.content-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.content-item .label {
  color: #909399;
  width: 80px;
}

.content-item .value {
  color: #303133;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}

.option-content {
  display: flex;
  flex-direction: column;
}

.option-name {
  font-weight: bold;
}

.option-code {
  font-size: 12px;
  color: #606266;
}

.detail-content {
  padding: 10px 0;
}
</style>