<template>
  <div class="bom-node-attributes">
    <div class="management-header">
      <h3>属性信息管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="Plus" @click="handleAddAttribute">新增属性</el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="selectedAttributes.length === 0">批量删除</el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="attributeList" stripe style="width: 100%">
      <el-table-column type="selection" width="55" align="center" @selection-change="handleSelectionChange" />
      <el-table-column label="属性编码" align="center" prop="attributeCode" min-width="150" />
      <el-table-column label="属性名称" align="center" prop="attributeName" min-width="150" />
      <el-table-column label="组件类型" align="center" prop="componentType" width="120">
        <template #default="scope">
          <el-tag :type="getAttributeTypeTag(scope.row.componentType)">
            {{ getAttributeTypeName(scope.row.componentType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="是否必填" align="center" prop="isRequired" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isRequired === '1' ? 'success' : 'info'">
            {{ scope.row.isRequired === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认值" align="center" prop="defaultValue" min-width="150" show-overflow-tooltip />

      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" icon="Edit" @click="handleEditAttribute(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="info" icon="Setting" @click="handleAttributeValue(scope.row)">
            属性值
          </el-button>
          <el-button size="small" type="danger" icon="Delete" @click="handleDeleteAttribute(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加/编辑属性对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form ref="attributeFormRef" :model="attributeForm" :rules="rules" label-width="120px">
        <div style="margin-bottom: 16px; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
          当前节点：<span style="font-weight: bold;">{{ props.nodeName || '未选择节点' }}</span>
          <span style="margin-left: 10px;">节点ID：{{ props.bomStructureId || '未选择节点' }}</span>
        </div>
        <el-form-item label="属性编码" prop="attributeCode">
          <el-input v-model="attributeForm.attributeCode" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="属性名称" prop="attributeName">
          <el-input v-model="attributeForm.attributeName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="组件类型" prop="componentType">
          <el-select v-model="attributeForm.componentType" placeholder="请选择组件类型">
            <el-option 
              v-for="dict in component_type" 
              :key="dict.value" 
              :label="dict.label" 
              :value="dict.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最小值" prop="minValue" v-if="attributeForm.componentType === 'slider' || attributeForm.componentType === 'number'">
          <el-input v-model="attributeForm.minValue" placeholder="请输入最小值" />
        </el-form-item>
        
        <el-form-item label="最大值" prop="maxValue" v-if="attributeForm.componentType === 'slider' || attributeForm.componentType === 'number'">
          <el-input v-model="attributeForm.maxValue" placeholder="请输入最大值" />
        </el-form-item>
        
        <el-form-item label="步进值" prop="stepValue" v-if="attributeForm.componentType === 'slider'">
          <el-input v-model="attributeForm.stepValue" placeholder="请输入步进值" />
        </el-form-item>
        
        <el-form-item label="是否展示提示" prop="showTooltip">
          <el-radio-group v-model="attributeForm.showTooltip">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        

        <el-form-item label="是否必填" prop="isRequired">
          <el-select v-model="attributeForm.isRequired" placeholder="请选择">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="attributeForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 属性值管理抽屉 -->
    <el-drawer
      v-model="attributeValueDrawerVisible"
      title="属性值管理"
      direction="rtl"
      size="50%"
      append-to-body
    >
      <div class="attribute-value-container">
        <div class="attribute-value-header">
          <h4>{{ currentAttribute?.attributeName }} - 属性值列表</h4>
          <el-button type="primary" icon="Plus" @click="handleAddAttributeValue">新增属性值</el-button>
        </div>
        
        <el-table v-loading="attributeValueLoading" :data="attributeValueList" stripe style="width: 100%">
          <el-table-column type="selection" width="55" align="center" @selection-change="handleAttributeValueSelectionChange" />
          <el-table-column label="属性值编码" align="center" prop="valueCode" min-width="150" />
          <el-table-column label="属性值名称" align="center" prop="valueName" min-width="150" />

          <!-- 状态列，后台接口未实现状态字段 -->
          <!-- <el-table-column label="状态" align="center" prop="status" width="100">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="enabled" inactive-value="disabled" @change="handleAttributeValueStatusChange(scope.row)" />
            </template>
          </el-table-column> -->
          <el-table-column label="是否默认" align="center" prop="isDefault" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isDefault === '1' ? 'success' : 'info'">
                {{ scope.row.isDefault === '1' ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="图标" align="center" prop="imgUrl" min-width="150">
            <template #default="scope">
              <div v-if="scope.row.imgUrl" style="display: flex; align-items: center;">
                <!-- 如果是Element Plus图标，使用el-icon渲染 -->
                <el-icon v-if="scope.row.imgUrl && typeof scope.row.imgUrl === 'string' && elementPlusIcons.some(icon => icon.code === scope.row.imgUrl)" 
                  style="font-size: 24px; margin-right: 8px; color: #409eff;">
                  <component :is="scope.row.imgUrl" />
                </el-icon>
                <!-- 否则使用图片URL渲染 -->
                <el-image 
                  v-else-if="scope.row.imgUrl"
                  :src="scope.row.imgUrl" 
                  :preview-src-list="[scope.row.imgUrl]" 
                  style="width: 30px; height: 30px; margin-right: 8px; cursor: pointer;" 
                  fit="cover"
                />
                <span v-if="scope.row.imgUrl" style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ scope.row.imgUrl }}
                </span>
              </div>
              <span v-else style="color: #909399;">无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" icon="Edit" @click="handleEditAttributeValue(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" icon="Delete" @click="handleDeleteAttributeValue(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 添加/编辑属性值对话框 -->
        <el-dialog :title="attributeValueDialogTitle" v-model="attributeValueDialogVisible" width="500px" append-to-body>
          <el-form ref="attributeValueFormRef" :model="attributeValueForm" :rules="attributeValueRules" label-width="100px">
            <el-form-item label="属性值编码" prop="valueCode">
              <el-input v-model="attributeValueForm.valueCode" placeholder="自动生成" disabled />
            </el-form-item>
            <el-form-item label="属性值名称" prop="valueName">
              <el-input v-model="attributeValueForm.valueName" placeholder="请输入属性值名称" />
            </el-form-item>
            
            <!-- 状态表单项，后台接口未实现状态字段 -->
            <!-- <el-form-item label="状态" prop="status">
              <el-select v-model="attributeValueForm.status" placeholder="请选择">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="是否默认" prop="isDefault">
              <el-select v-model="attributeValueForm.isDefault" placeholder="请选择">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="图标/图片URL" prop="imgUrl">
              <el-input v-model="attributeValueForm.imgUrl" placeholder="请输入图片URL或选择Element Plus图标" />
              <div style="margin-top: 10px;">
                <el-button type="primary" size="small" @click="handleImageUpload">上传图片</el-button>
                <el-button type="success" size="small" @click="openIconLibrary">Element Plus图标库</el-button>
                <span style="margin-left: 10px; color: #909399; font-size: 12px;">
                  支持JPG、PNG格式图片或Element Plus图标
                </span>
              </div>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="attributeValueDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmitAttributeValue">确定</el-button>
            </span>
          </template>
        </el-dialog>
        
        <!-- 多类型图标库选择对话框 -->
        <el-dialog 
          title="图标库" 
          v-model="iconLibraryVisible" 
          width="900px" 
          append-to-body
        >
          <!-- 图标库类型选择和搜索 -->
          <div class="icon-library-header">
            <el-select 
              v-model="selectedIconLibrary" 
              placeholder="选择图标库" 
              size="small"
              @change="changeIconLibrary"
              style="margin-right: 10px;"
            >
              <el-option 
                v-for="type in iconLibraryTypes" 
                :key="type.value" 
                :label="type.label" 
                :value="type.value"
              />
            </el-select>
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索图标" 
              size="small"
              @input="searchIcons"
              clearable
              style="width: 200px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 图标列表 -->
          <div class="icon-library-container">
            <div 
              v-for="icon in filteredIcons" 
              :key="icon.code + icon.type"
              class="icon-item"
              @click="selectIcon(icon)"
            >
              <!-- Element Plus 图标 -->
              <el-icon v-if="icon.type === 'elementPlus'" style="font-size: 32px; margin-bottom: 8px; cursor: pointer; color: #409eff;">
                <component :is="icon.code" />
              </el-icon>
              <!-- SVG 图标 -->
              <div v-else 
                class="svg-icon-preview" 
                style="font-size: 32px; margin-bottom: 8px; cursor: pointer; color: #409eff;"
                v-html="icon.svg"
              ></div>
              <div class="icon-name">{{ icon.name }}</div>
            </div>
          </div>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="iconLibraryVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入BOM属性API
import { 
  listSuperBomStructureAttribute,
  batchAddSuperBomStructureAttribute,
  updateSuperBomStructureAttribute,
  // 导入属性值相关API
  listSuperBomStructureAttributeValue,
  listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId,
  addSuperBomStructureAttributeValue,
  updateSuperBomStructureAttributeValue,
  deleteSuperBomStructureAttributeValue,
  batchAddSuperBomStructureAttributeValue
} from '@/api/cpq/bom'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomStructureId: {
    type: [String, Number],
    default: ''
  },
  nodeName: {
    type: String,
    default: ''
  }
})

// 获取全局属性
const { proxy } = getCurrentInstance()

// 获取字典数据
const { component_type, sys_normal_disable } = proxy.useDict('component_type', 'sys_normal_disable')

// 加载状态
const loading = ref(false)

// 选中的属性
const selectedAttributes = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增属性')

// 表单引用
const attributeFormRef = ref(null)

// 属性列表
const attributeList = ref([])

// 属性值管理相关数据
const attributeValueDrawerVisible = ref(false)
const attributeValueLoading = ref(false)
const attributeValueList = ref([])
const currentAttribute = ref(null)
const attributeValueDialogVisible = ref(false)
const attributeValueDialogTitle = ref('新增属性值')
const attributeValueFormRef = ref(null)
const attributeValueRules = reactive({
  valueCode: [
    // 后台自动生成，无需必填验证
  ],
  valueName: [
    { required: true, message: '属性值名称不能为空', trigger: 'blur' }
  ],
  
  // 状态验证规则，后台接口未实现状态字段
  // status: [
  //   { required: true, message: '请选择状态', trigger: 'change' }
  // ],
  isDefault: [
    { required: true, message: '请选择是否默认', trigger: 'change' }
  ],
  imgUrl: [
    { type: 'string', message: '图片URL必须是字符串', trigger: 'blur' }
  ]
})
const selectedAttributeValues = ref([])
const attributeValueForm = reactive({
  id: null,
  attributeId: null,
  valueCode: '',
  valueName: '',

  // status: 'enabled',
  imgUrl: '',
  isDefault: '0'
})

// 表单数据
const attributeForm = reactive({
  id: null,
  bomId: props.bomId,
  bomStructureId: props.bomStructureId, // 使用bomStructureId作为字段名
  attributeCode: '',
  attributeName: '',
  componentType: 'input',
  stepValue: '',
  minValue: '',
  maxValue: '',
  showTooltip: '0',
  isRequired: '0',
  defaultValue: '',

})

// 加载属性列表
const loadAttributeList = async () => {
  loading.value = true
  try {
    // 使用真实API获取属性列表
    const response = await listSuperBomStructureAttribute({
      bomId: props.bomId,
      bomStructureId: props.bomStructureId
    })

    attributeList.value = response.rows || []
    console.log('response.data:', response.rows)  
    console.log('attributeList:', attributeList.value)
    loading.value = false
  } catch (error) {
    console.error('加载属性列表失败:', error)
    ElMessage.error('加载属性列表失败')
    loading.value = false
  }
}

// 监听props.bomStructureId变化，实时更新表单数据
watch(() => props.bomStructureId, (newBomStructureId) => {
  console.log('bomStructureId:', newBomStructureId)
  // 只有当newBomStructureId是有效值时才更新
  if (newBomStructureId !== undefined && newBomStructureId !== null && newBomStructureId !== '') {
    attributeForm.bomStructureId = newBomStructureId
    console.log('bomStructureId:', newBomStructureId)
    // 重新加载属性列表
    loadAttributeList()
  }
}, { immediate: true }) // 添加immediate选项，确保组件初始化时就同步一次

// 组件挂载时加载属性列表
onMounted(() => {
  loadAttributeList()
})


// 表单验证规则
const rules = reactive({
  attributeName: [
    { required: true, message: '属性名称不能为空', trigger: 'blur' }
  ],
  componentType: [
    { required: true, message: '请选择组件类型', trigger: 'change' }
  ],
  isRequired: [
    { required: true, message: '请选择是否必填', trigger: 'change' }
  ],
  
})

// 获取组件类型名称
const getAttributeTypeName = (type) => {
  // 使用字典数据获取组件类型名称
  const dictItem = component_type.value.find(item => item.value === type)
  return dictItem ? dictItem.label : type
}

// 获取组件类型标签样式
const getAttributeTypeTag = (type) => {
  const tagMap = {
    input: 'primary',
    select: 'info',
    radio: 'success',
    checkbox: 'warning',
    date: 'danger',
    datetime: 'purple',
    number: 'blue',
    slider: 'green',
    switch: 'orange',
    textarea: 'cyan'
  }
  return tagMap[type] || 'default'
}



// 多选变化
const handleSelectionChange = (selection) => {
  selectedAttributes.value = selection
}

// 新增属性
const handleAddAttribute = () => {
  resetForm()
  dialogTitle.value = '新增属性'
  dialogVisible.value = true
}

// 编辑属性
const handleEditAttribute = (row) => {
  // 确保字段映射正确
  const mappedRow = {
    ...row,
    attributeCode: row.attributeCode,
    attributeName: row.attributeName,
    isRequired: row.required !== undefined ? (row.required ? '1' : '0') : (row.isRequired || '0')
  }
  Object.assign(attributeForm, mappedRow)
  // 确保bomStructureId始终与当前选中节点保持一致
  attributeForm.bomStructureId = props.bomStructureId
  dialogTitle.value = '编辑属性'
  dialogVisible.value = true
}

// 删除属性
const handleDeleteAttribute = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性 "${row.attributeName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 注意：API文档中没有提供专门的删除属性接口
    // 这里使用前端模拟删除，实际项目中可能需要根据后端API调整
    attributeList.value = attributeList.value.filter(item => item.id !== row.id)
    ElMessage.success('属性删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除属性失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedAttributes.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedAttributes.value.length} 个属性吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedAttributes.value.map(item => item.id)
    // 注意：API文档中没有提供专门的批量删除属性接口
    // 这里使用前端模拟批量删除，实际项目中可能需要根据后端API调整
    attributeList.value = attributeList.value.filter(item => !ids.includes(item.id))
    selectedAttributes.value = []
    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除属性失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await attributeFormRef.value.validate()
    
    // 确保bomStructureId有值
    // 优先使用attributeForm.bomStructureId，因为它通过watch与props.bomStructureId保持同步
    let structureId = attributeForm.bomStructureId
    // 如果attributeForm.bomStructureId为空，尝试使用props.bomStructureId
    if (structureId === undefined || structureId === null || structureId === '') {
      structureId = props.bomStructureId
    }
    // 再次检查structureId是否为有效值
    if (structureId === undefined || structureId === null || structureId === '') {
      ElMessage.error('请先选择节点')
      return
    }
    
    // 确保bomStructureId有值
    attributeForm.bomStructureId = structureId
    
    // 准备提交数据，确保字段名称与API一致
    const submitData = {
      ...attributeForm,
      // 移除不需要提交的字段
      id: attributeForm.id,
      // API期望isRequired字段为字符串类型
      isRequired: attributeForm.isRequired,
      // 移除description字段，API不再需要
      description: undefined,
      // 移除旧的字段名，避免混淆
      attrCode: undefined,
      attrName: undefined
    }
    
    if (attributeForm.id) {
      // 编辑模式
      try {
        // 使用真实API更新属性
        await updateSuperBomStructureAttribute(attributeForm.bomStructureId, [submitData])
        await loadAttributeList() // 重新加载属性列表
        ElMessage.success('属性更新成功')
        dialogVisible.value = false
      } catch (error) {
        console.error('更新属性失败:', error)
        ElMessage.error('更新属性失败')
      }
    } else {
      // 新增模式
      try {
        // 使用真实API新增属性
        await batchAddSuperBomStructureAttribute([submitData])
        await loadAttributeList() // 重新加载属性列表
        ElMessage.success('属性新增成功')
        dialogVisible.value = false
      } catch (error) {
        console.error('新增属性失败:', error)
        ElMessage.error('新增属性失败')
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交属性表单失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  // 保存当前bomStructureId，避免被resetFields()重置
  const currentBomStructureId = attributeForm.bomStructureId || props.bomStructureId  
        
  // 重置表单字段
  attributeFormRef.value?.resetFields()
  
  // 重置所有字段
  attributeForm.id = null
  attributeForm.attributeCode = ''
  attributeForm.attributeName = ''
  attributeForm.componentType = 'input'
  attributeForm.stepValue = ''
  attributeForm.minValue = ''
  attributeForm.maxValue = ''
  attributeForm.showTooltip = '0'
  attributeForm.isRequired = '0'
  attributeForm.defaultValue = ''

  
  // 确保bomStructureId与当前选中节点一致
  attributeForm.bomStructureId = currentBomStructureId
}

// 打开属性值管理抽屉
const handleAttributeValue = (row) => {
  currentAttribute.value = row
  attributeValueDrawerVisible.value = true
  loadAttributeValueList(row.id)
}

// 加载属性值列表
const loadAttributeValueList = async (attributeId) => {
  attributeValueLoading.value = true
  
  try {
    // 使用新的API根据BOM结构ID和属性ID查询属性值列表
    const response = await listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId(
      props.bomStructureId,
      attributeId
    )
    
    // 根据API返回格式调整数据
    attributeValueList.value = response.data || []
    
    attributeValueLoading.value = false
  } catch (error) {
    console.error('加载属性值列表失败:', error)
    ElMessage.error('加载属性值列表失败')
    attributeValueLoading.value = false
  }
}

// 重置属性值表单
const resetAttributeValueForm = () => {
  attributeValueForm.id = null
  attributeValueForm.attributeId = currentAttribute.value?.id
  attributeValueForm.valueCode = ''
  attributeValueForm.valueName = ''

  // attributeValueForm.status = 'enabled'
  attributeValueForm.imgUrl = ''
  attributeValueForm.isDefault = '0'
  
  attributeValueFormRef.value?.resetFields()
}

// 新增属性值
const handleAddAttributeValue = () => {
  resetAttributeValueForm()
  attributeValueDialogTitle.value = '新增属性值'
  attributeValueDialogVisible.value = true
}

// 编辑属性值
const handleEditAttributeValue = (row) => {
  Object.assign(attributeValueForm, { ...row })
  attributeValueDialogTitle.value = '编辑属性值'
  attributeValueDialogVisible.value = true
}

// 删除属性值
const handleDeleteAttributeValue = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性值 "${row.valueName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 使用真实API删除属性值
    await deleteSuperBomStructureAttributeValue(row.id)
    
    // 更新本地列表
    attributeValueList.value = attributeValueList.value.filter(item => item.id !== row.id)
    ElMessage.success('属性值删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除属性值失败:', error)
    }
  }
}

// 属性值多选变化
const handleAttributeValueSelectionChange = (selection) => {
  selectedAttributeValues.value = selection
}

// 属性值状态变化 - 后台接口未实现状态字段
// const handleAttributeValueStatusChange = async (row) => {
//   try {
//     // 实际项目中替换为真实API调用
//     // await updateAttributeValueStatus(row.id, row.status)
    
//     // 模拟更新
//     ElMessage.success('属性值状态更新成功')
//   } catch (error) {
//     // 恢复原状态
//     row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
//     ElMessage.error('状态更新失败')
//     console.error('更新属性值状态失败:', error)
//   }
// }

// 图片上传处理
const handleImageUpload = () => {
  // 实际项目中替换为真实的图片上传逻辑
  // 这里使用模拟数据
  ElMessage.info('图片上传功能开发中，当前使用模拟URL')
  // 模拟图片URL
  attributeValueForm.imgUrl = `https://example.com/image-${Date.now()}.jpg`
}

// 图标库相关
const iconLibraryVisible = ref(false)
const selectedIconLibrary = ref('elementPlus')
const searchKeyword = ref('')

// 图标库类型列表
const iconLibraryTypes = [
  { label: 'Element Plus 图标', value: 'elementPlus' },
  { label: 'Material 图标', value: 'material' },
  { label: 'Font Awesome', value: 'fontAwesome' },
  { label: '自定义 SVG 图标', value: 'customSvg' }
]

// Element Plus 图标列表（可根据需要扩展）
const elementPlusIcons = [
  { name: 'Add', code: 'Plus', type: 'elementPlus' },
  { name: '编辑', code: 'Edit', type: 'elementPlus' },
  { name: '删除', code: 'Delete', type: 'elementPlus' },
  { name: '设置', code: 'Setting', type: 'elementPlus' },
  { name: '搜索', code: 'Search', type: 'elementPlus' },
  { name: '刷新', code: 'Refresh', type: 'elementPlus' },
  { name: '保存', code: 'Check', type: 'elementPlus' },
  { name: '取消', code: 'Close', type: 'elementPlus' },
  { name: '警告', code: 'Warning', type: 'elementPlus' },
  { name: '错误', code: 'CircleClose', type: 'elementPlus' },
  { name: '成功', code: 'CircleCheck', type: 'elementPlus' },
  { name: '信息', code: 'CircleInfo', type: 'elementPlus' },
  { name: '上移', code: 'Top', type: 'elementPlus' },
  { name: '下移', code: 'Bottom', type: 'elementPlus' },
  { name: '左移', code: 'Left', type: 'elementPlus' },
  { name: '右移', code: 'Right', type: 'elementPlus' },
  { name: '展开', code: 'Expand', type: 'elementPlus' },
  { name: '折叠', code: 'Fold', type: 'elementPlus' },
  { name: '菜单', code: 'Menu', type: 'elementPlus' },
  { name: '首页', code: 'House', type: 'elementPlus' },
  { name: '用户', code: 'User', type: 'elementPlus' },
  { name: '角色', code: 'UserFilled', type: 'elementPlus' },
  { name: '部门', code: 'OfficeBuilding', type: 'elementPlus' },
  { name: '权限', code: 'Key', type: 'elementPlus' },
  { name: '日志', code: 'Document', type: 'elementPlus' },
  { name: '统计', code: 'DataAnalysis', type: 'elementPlus' },
  { name: '导出', code: 'Download', type: 'elementPlus' },
  { name: '导入', code: 'Upload', type: 'elementPlus' },
  { name: '打印', code: 'Printer', type: 'elementPlus' },
  { name: '复制', code: 'CopyDocument', type: 'elementPlus' },
  { name: '剪切', code: 'Scissor', type: 'elementPlus' },
  { name: '粘贴', code: 'PaperClip', type: 'elementPlus' },
  { name: '附件', code: 'Files', type: 'elementPlus' },
  { name: '链接', code: 'Link', type: 'elementPlus' },
  { name: '图片', code: 'Picture', type: 'elementPlus' },
  { name: '视频', code: 'VideoPlay', type: 'elementPlus' },
  { name: '音乐', code: 'Headset', type: 'elementPlus' },
  { name: '文件', code: 'Document', type: 'elementPlus' },
  { name: '文件夹', code: 'Folder', type: 'elementPlus' },
  { name: '新建文件夹', code: 'FolderAdd', type: 'elementPlus' },
  { name: '删除文件夹', code: 'FolderDelete', type: 'elementPlus' },
  { name: '共享', code: 'Share', type: 'elementPlus' },
  { name: '锁定', code: 'Lock', type: 'elementPlus' },
  { name: '解锁', code: 'Unlock', type: 'elementPlus' },
  { name: '密码', code: 'Key', type: 'elementPlus' },
  { name: '眼睛', code: 'View', type: 'elementPlus' },
  { name: '隐藏', code: 'Hide', type: 'elementPlus' },
  { name: '筛选', code: 'Filter', type: 'elementPlus' },
  { name: '排序', code: 'Rank', type: 'elementPlus' },
  { name: '时间', code: 'Clock', type: 'elementPlus' },
  { name: '日历', code: 'Calendar', type: 'elementPlus' },
  { name: '地图', code: 'Location', type: 'elementPlus' },
  { name: '定位', code: 'Position', type: 'elementPlus' },
  { name: '手机', code: 'Cellphone', type: 'elementPlus' },
  { name: '电话', code: 'Phone', type: 'elementPlus' },
  { name: '邮件', code: 'Message', type: 'elementPlus' },
  { name: '微信', code: 'Wechat', type: 'elementPlus' },
  { name: '支付', code: 'CircleCheckFilled', type: 'elementPlus' },
  { name: '购物车', code: 'ShoppingCart', type: 'elementPlus' },
  { name: '商品', code: 'Box', type: 'elementPlus' },
  { name: '订单', code: 'Ticket', type: 'elementPlus' },
  { name: '库存', code: 'DataBoard', type: 'elementPlus' },
  { name: '利润', code: 'TrendCharts', type: 'elementPlus' },
  { name: '销售', code: 'Coin', type: 'elementPlus' },
  { name: '采购', code: 'ShoppingBag', type: 'elementPlus' },
  { name: '报表', code: 'DataLine', type: 'elementPlus' },
  { name: '图表', code: 'DataBar', type: 'elementPlus' },
  { name: '饼图', code: 'DataPie', type: 'elementPlus' },
  { name: '仪表盘', code: 'DataDashboard', type: 'elementPlus' },
  { name: '设置', code: 'Setting', type: 'elementPlus' },
  { name: '主题', code: 'Palette', type: 'elementPlus' },
  { name: '语言', code: 'Translate', type: 'elementPlus' },
  { name: '帮助', code: 'QuestionFilled', type: 'elementPlus' },
  { name: '关于', code: 'InfoFilled', type: 'elementPlus' },
  { name: '退出', code: 'SwitchButton', type: 'elementPlus' },
  { name: '登录', code: 'Avatar', type: 'elementPlus' },
  { name: '注册', code: 'UserFilled', type: 'elementPlus' },
  { name: '验证码', code: 'View', type: 'elementPlus' },
  { name: '滑块', code: 'Slider', type: 'elementPlus' },
  { name: '开关', code: 'Switch', type: 'elementPlus' },
  { name: '单选', code: 'Radio', type: 'elementPlus' },
  { name: '多选', code: 'Checkbox', type: 'elementPlus' },
  { name: '下拉', code: 'ArrowDown', type: 'elementPlus' },
  { name: '上拉', code: 'ArrowUp', type: 'elementPlus' },
  { name: '左拉', code: 'ArrowLeft', type: 'elementPlus' },
  { name: '右拉', code: 'ArrowRight', type: 'elementPlus' },
  { name: '下拉菜单', code: 'More', type: 'elementPlus' },
  { name: '全屏', code: 'FullScreen', type: 'elementPlus' },
  { name: '退出全屏', code: 'FullScreenExit', type: 'elementPlus' },
  { name: '缩放', code: 'ZoomIn', type: 'elementPlus' },
  { name: '缩小', code: 'ZoomOut', type: 'elementPlus' },
  { name: '旋转', code: 'RefreshRight', type: 'elementPlus' },
  { name: '加载', code: 'Loading', type: 'elementPlus' },
  { name: '成功', code: 'SuccessFilled', type: 'elementPlus' },
  { name: '错误', code: 'ErrorFilled', type: 'elementPlus' },
  { name: '警告', code: 'WarningFilled', type: 'elementPlus' },
  { name: '信息', code: 'InfoFilled', type: 'elementPlus' }
]

// Material 图标示例（SVG格式）
const materialIcons = [
  { 
    name: 'Home', 
    code: 'home', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' 
  },
  { 
    name: 'Search', 
    code: 'search', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' 
  },
  { 
    name: 'Menu', 
    code: 'menu', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>' 
  },
  { 
    name: 'Add', 
    code: 'add', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' 
  },
  { 
    name: 'Delete', 
    code: 'delete', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' 
  },
  { 
    name: 'Edit', 
    code: 'edit', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' 
  },
  { 
    name: 'Save', 
    code: 'save', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>' 
  },
  { 
    name: 'Settings', 
    code: 'settings', 
    type: 'material', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>' 
  }
]

// Font Awesome 图标示例（SVG格式）
const fontAwesomeIcons = [
  { 
    name: 'Check', 
    code: 'check', 
    type: 'fontAwesome', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M437.36 174.75L233.6 378.51c-12.39 12.37-32.57 12.37-44.94 0L74.63 274.9c-12.39-12.37-12.39-32.57 0-44.94l19.66-19.66c12.39-12.37 32.57-12.37 44.94 0L240 303.54l132.75-132.74c12.39-12.37 32.57-12.37 44.94 0l19.66 19.66c12.39 12.37 12.39 32.57 0 44.94z"/></svg>' 
  },
  { 
    name: 'Times', 
    code: 'times', 
    type: 'fontAwesome', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/></svg>' 
  },
  { 
    name: 'Star', 
    code: 'star', 
    type: 'fontAwesome', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/></svg>' 
  },
  { 
    name: 'Heart', 
    code: 'heart', 
    type: 'fontAwesome', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>' 
  },
  { 
    name: 'User', 
    code: 'user', 
    type: 'fontAwesome', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>' 
  }
]

// 自定义 SVG 图标示例
const customSvgIcons = [
  { 
    name: 'Custom Icon 1', 
    code: 'custom1', 
    type: 'customSvg', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#409eff"/><path d="M12 8l4 4-4 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' 
  },
  { 
    name: 'Custom Icon 2', 
    code: 'custom2', 
    type: 'customSvg', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#67c23a"/><path d="M9 12h6m-3-3v6" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>' 
  },
  { 
    name: 'Custom Icon 3', 
    code: 'custom3', 
    type: 'customSvg', 
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#e6a23c"/><path d="M2 17l10 5 10-5" fill="none" stroke="#e6a23c" stroke-width="2"/><path d="M2 12l10 5 10-5" fill="none" stroke="#e6a23c" stroke-width="2"/></svg>' 
  }
]

// 合并所有图标
const allIcons = [
  ...elementPlusIcons,
  ...materialIcons,
  ...fontAwesomeIcons,
  ...customSvgIcons
]

// 过滤后的图标列表
const filteredIcons = ref(allIcons.filter(icon => icon.type === selectedIconLibrary.value))

// 切换图标库
const changeIconLibrary = () => {
  searchKeyword.value = ''
  filteredIcons.value = allIcons.filter(icon => icon.type === selectedIconLibrary.value)
}

// 搜索图标
const searchIcons = () => {
  if (!searchKeyword.value) {
    filteredIcons.value = allIcons.filter(icon => icon.type === selectedIconLibrary.value)
    return
  }
  const keyword = searchKeyword.value.toLowerCase()
  filteredIcons.value = allIcons.filter(icon => 
    icon.type === selectedIconLibrary.value && 
    icon.name.toLowerCase().includes(keyword)
  )
}

// 打开图标库
const openIconLibrary = () => {
  selectedIconLibrary.value = 'elementPlus'
  searchKeyword.value = ''
  filteredIcons.value = allIcons.filter(icon => icon.type === selectedIconLibrary.value)
  iconLibraryVisible.value = true
}

// 选择图标
const selectIcon = (icon) => {
  // 根据图标类型保存不同格式
  if (icon.type === 'elementPlus') {
    // Element Plus 图标保存图标代码
    attributeValueForm.imgUrl = icon.code
  } else {
    // SVG 图标保存完整 SVG 代码
    attributeValueForm.imgUrl = icon.svg
  }
  iconLibraryVisible.value = false
  ElMessage.success('图标选择成功')
}

// 提交属性值
const handleSubmitAttributeValue = async () => {
  try {
    await attributeValueFormRef.value.validate()
    
    // 准备提交数据
    const submitData = {
      ...attributeValueForm,
      bomStructureId: props.bomStructureId,
      // 确保字段名与API一致
      attributeValue: attributeValueForm.valueCode || null  
    }
    
    if (attributeValueForm.id) {
      // 编辑模式
      try {
        // 使用真实API更新属性值
        await updateSuperBomStructureAttributeValue(submitData)
        
        // 更新本地列表
        const index = attributeValueList.value.findIndex(item => item.id === attributeValueForm.id)
        if (index !== -1) {
          attributeValueList.value[index] = { ...attributeValueForm }
        }
        ElMessage.success('属性值更新成功')
      } catch (error) {
        console.error('更新属性值失败:', error)
        ElMessage.error('更新属性值失败')
      }
    } else {
      // 新增模式
      try {
        // 使用真实API新增属性值
        const response = await addSuperBomStructureAttributeValue(submitData)
        
        // 添加到本地列表
        const newAttributeValue = {
          ...attributeValueForm,
          id: response.id || Date.now()
        }
        attributeValueList.value.push(newAttributeValue)
        ElMessage.success('属性值新增成功')
      } catch (error) {
        console.error('新增属性值失败:', error)
        ElMessage.error('新增属性值失败')
      }
    }
    
    attributeValueDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请检查表单数据')
      console.error('提交属性值表单失败:', error)
    }
  }
}

</script>

<style scoped>
.bom-node-attributes {
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
  /* 属性值管理样式 */
  .attribute-value-container {
    padding: 20px;
    height: 100%;
    overflow: auto;
  }
  
  .attribute-value-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .attribute-value-header h4 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
  
  /* 图标库样式 */
  .icon-library-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .icon-library-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 20px;
    padding: 20px 0;
    max-height: 500px;
    overflow-y: auto;
  }
  
  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.3s;
  }
  
  .icon-item:hover {
    background-color: #f0f9ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .icon-name {
    font-size: 12px;
    color: #606266;
    text-align: center;
    margin-top: 8px;
    word-break: break-word;
  }
  
  /* SVG 图标预览样式 */
  .svg-icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
  }
  
  .svg-icon-preview svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    stroke: currentColor;
  }

</style>