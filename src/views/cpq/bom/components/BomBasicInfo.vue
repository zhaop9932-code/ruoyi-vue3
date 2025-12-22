<template>
  <div class="bom-basic-info">
    <el-form ref="formRef" :model="bomForm" :rules="rules" label-width="120px" size="default">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="BOM编码" prop="bomCode">
            <el-input v-model="bomForm.bomCode" placeholder="请输入BOM编码" :disabled="!isEditable" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="BOM名称" prop="bomName">
            <el-input v-model="bomForm.bomName" placeholder="请输入BOM名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="BOM类型" prop="bomType">
            <el-select v-model="bomForm.bomType" placeholder="请选择BOM类型">
              <el-option label="模板" value="template" />
              <el-option label="实例" value="instance" />
              <el-option label="版本" value="version" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="验证策略" prop="validationStrategy">
            <el-select v-model="bomForm.validationStrategy" placeholder="请选择验证策略">
              <el-option label="严格验证" value="strict" />
              <el-option label="警告验证" value="warning" />
              <el-option label="无验证" value="none" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="规则引擎类型" prop="ruleEngineType">
            <el-select v-model="bomForm.ruleEngineType" placeholder="请选择规则引擎类型">
              <el-option label="内置规则引擎" value="built-in" />
              <el-option label="Drools规则引擎" value="drools" />
              <el-option label="自定义规则引擎" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="bomForm.status" placeholder="请选择状态">
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- <el-form-item label="BOM规则" prop="bomRules">
        <el-input 
          v-model="bomForm.bomRules" 
          type="textarea" 
          placeholder="请输入BOM规则（JSON格式）" 
          :rows="4"
        />
        <div class="form-tip">提示：BOM规则为JSON格式，用于定义BOM的验证和计算规则</div>
      </el-form-item>
      
      <el-form-item label="配置模板" prop="configTemplate">
        <el-input 
          v-model="bomForm.configTemplate" 
          type="textarea" 
          placeholder="请输入配置模板" 
          :rows="6"
        />
      </el-form-item> -->
      
      <el-form-item label="描述" prop="description">
        <el-input 
          v-model="bomForm.description" 
          type="textarea" 
          placeholder="请输入BOM描述" 
          :rows="3"
        />
      </el-form-item>
    </el-form>
    
    <div class="form-actions">
      <el-button type="primary" @click="submitForm">保存</el-button>
      <el-button @click="resetForm">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
// 假设API已经存在，实际使用时需要导入
// import { getSuperBom, updateSuperBom } from '@/api/cpq/bom'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  },
  bomName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update'])

// 表单引用
const formRef = ref(null)

// 是否可编辑（BOM编码在某些情况下可能不可编辑）
const isEditable = computed(() => {
  // 可以根据BOM类型或其他条件判断是否可编辑
  return true
})

// 表单数据
const bomForm = reactive({
  bomId: props.bomId,
  bomCode: '',
  bomName: props.bomName || '',
  bomType: 'template',
  validationStrategy: 'strict',
  ruleEngineType: 'built-in',
  status: 'enabled',
  bomRules: JSON.stringify({
    validationStrategy: 'strict',
    ruleEngineType: 'built-in'
  }, null, 2),
  configTemplate: '',
  description: ''
})

// 表单验证规则
const rules = reactive({
  bomCode: [
    { required: true, message: 'BOM编码不能为空', trigger: 'blur' }
  ],
  bomName: [
    { required: true, message: 'BOM名称不能为空', trigger: 'blur' }
  ],
  bomType: [
    { required: true, message: '请选择BOM类型', trigger: 'change' }
  ],
  validationStrategy: [
    { required: true, message: '请选择验证策略', trigger: 'change' }
  ],
  ruleEngineType: [
    { required: true, message: '请选择规则引擎类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 加载BOM信息
const loadBomInfo = async () => {
  try {
    // 实际项目中替换为真实API调用
    // const res = await getSuperBom(props.bomId)
    // Object.assign(bomForm, res.data)
    
    // 模拟数据
    setTimeout(() => {
      Object.assign(bomForm, {
        bomCode: `BOM-${props.bomId}`,
        bomName: props.bomName || `测试BOM-${props.bomId}`,
        bomType: 'template',
        validationStrategy: 'strict',
        ruleEngineType: 'built-in',
        status: 'enabled',
        bomRules: JSON.stringify({
          validationStrategy: 'strict',
          ruleEngineType: 'built-in',
          version: '1.0'
        }, null, 2),
        configTemplate: '{"template": "default", "version": "1.0"}',
        description: `这是一个测试BOM，ID为${props.bomId}`
      })
    }, 500)
  } catch (error) {
    ElMessage.error('获取BOM信息失败')
    console.error('加载BOM信息失败:', error)
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    // 实际项目中替换为真实API调用
    // await updateSuperBom(bomForm)
    
    // 模拟保存成功
    setTimeout(() => {
      ElMessage.success('BOM信息保存成功')
      emit('update', {
        bomName: bomForm.bomName
      })
    }, 500)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败，请检查表单数据')
      console.error('保存BOM信息失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 组件挂载时加载数据
onMounted(() => {
  loadBomInfo()
})
</script>

<style scoped>
.bom-basic-info {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}
</style>