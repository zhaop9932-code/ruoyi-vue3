<template>
  <div class="advanced-config">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>高级配置</span>
          <div class="header-actions">
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="save">保存</el-button>
          </div>
        </div>
      </template>
      
      <el-form :model="advancedConfig" label-position="top" label-width="120px">
        <el-row :gutter="20">
          <!-- 触发时机 -->
          <el-col :span="12">
            <el-form-item label="触发时机">
              <el-select 
                v-model="advancedConfig.triggerTiming" 
                placeholder="请选择触发时机"
                multiple
                collapse-tags
              >
                <el-option label="配置时触发" value="on_configure" />
                <el-option label="定价时触发" value="on_pricing" />
                <el-option label="报价生成时触发" value="on_quote_generate" />
                <el-option label="订单提交时触发" value="on_order_submit" />
                <el-option label="订单变更时触发" value="on_order_change" />
                <el-option label="定时触发" value="on_schedule" />
              </el-select>
              <div class="form-tip">可选择多个触发时机</div>
            </el-form-item>
          </el-col>
          
          <!-- 触发优先级 -->
          <el-col :span="12">
            <el-form-item label="触发优先级">
              <el-slider 
                v-model="advancedConfig.priority" 
                :min="1" 
                :max="10" 
                :marks="{
                  1: '低',
                  5: '中',
                  10: '高'
                }"
              />
              <div class="priority-value">当前优先级：{{ advancedConfig.priority }}</div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 有效期 -->
          <el-col :span="24">
            <el-form-item label="有效期">
              <el-date-picker
                v-model="advancedConfig.validityPeriod"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <div class="form-tip">为空表示永久有效</div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 执行次数限制 -->
          <el-col :span="12">
            <el-form-item label="执行次数限制">
              <el-input-number 
                v-model="advancedConfig.executionLimit" 
                :min="0" 
                :max="999999"
                :step="1"
                placeholder="请输入执行次数限制"
              />
              <div class="form-tip">0表示无限制</div>
            </el-form-item>
          </el-col>
          
          <!-- 执行间隔 -->
          <el-col :span="12">
            <el-form-item label="执行间隔（秒）">
              <el-input-number 
                v-model="advancedConfig.executionInterval" 
                :min="0" 
                :max="86400"
                :step="1"
                placeholder="请输入执行间隔"
              />
              <div class="form-tip">0表示无间隔限制</div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 规则依赖 -->
          <el-col :span="24">
            <el-form-item label="规则依赖">
              <el-select 
                v-model="advancedConfig.dependencies" 
                placeholder="请选择依赖的规则"
                multiple
                collapse-tags
              >
                <el-option 
                  v-for="rule in availableRules" 
                  :key="rule.ruleId" 
                  :label="rule.ruleName"
                  :value="rule.ruleId"
                />
              </el-select>
              <div class="form-tip">选择当前规则依赖的其他规则，依赖规则会先执行</div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 规则分组 -->
          <el-col :span="12">
            <el-form-item label="规则分组">
              <el-input 
                v-model="advancedConfig.ruleGroup" 
                placeholder="请输入规则分组"
              />
              <div class="form-tip">用于规则的分类管理</div>
            </el-form-item>
          </el-col>
          
          <!-- 执行模式 -->
          <el-col :span="12">
            <el-form-item label="执行模式">
              <el-select 
                v-model="advancedConfig.executionMode" 
                placeholder="请选择执行模式"
              >
                <el-option label="同步执行" value="sync" />
                <el-option label="异步执行" value="async" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 错误处理策略 -->
          <el-col :span="24">
            <el-form-item label="错误处理策略">
              <el-radio-group v-model="advancedConfig.errorHandling">
                <el-radio label="继续执行">继续执行：忽略错误，继续执行后续规则</el-radio>
                <el-radio label="终止执行">终止执行：遇到错误立即终止所有规则执行</el-radio>
                <el-radio label="回滚执行">回滚执行：遇到错误回滚已执行的动作</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <!-- 备注 -->
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="advancedConfig.remark"
                type="textarea"
                placeholder="请输入备注信息"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'

// 导入API请求函数
import { getRuleAdvancedConfig, saveRuleAdvancedConfig, getAvailableRules } from '@/api/cpq/rule'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  ruleType: {
    type: String,
    default: 'validation'
  },
  ruleId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save-success'])

// 加载状态
const loading = ref(false)
const rulesLoading = ref(false)

// 高级配置数据 - 使用ref和localCopy来实现手动保存
const localConfig = ref({
  triggerTiming: [],
  priority: 5,
  validityPeriod: [],
  executionLimit: 0,
  executionInterval: 0,
  dependencies: [],
  ruleGroup: '',
  executionMode: 'sync',
  errorHandling: 'continue',
  remark: '',
  ...props.modelValue
})

// 计算属性：用于双向绑定
const advancedConfig = computed({
  get: () => localConfig.value,
  set: (value) => {
    localConfig.value = value
  }
})

// 可用规则列表
const availableRules = ref([])

// 获取可用规则列表
const fetchAvailableRules = async () => {
  rulesLoading.value = true
  try {
    const response = await getAvailableRules({ ruleType: props.ruleType })
    if (response.code === 200) {
      availableRules.value = response.data
    } else {
      ElMessage.error(response.message || '获取可用规则列表失败')
    }
  } catch (error) {
    console.error('获取可用规则列表失败:', error)
    ElMessage.error('获取可用规则列表失败')
  } finally {
    rulesLoading.value = false
  }
}

// 获取高级配置
const fetchAdvancedConfig = async () => {
  // 有效性检查：确保ruleId是有效的数字
  let ruleId = props.ruleId
  
  // 处理空字符串、null等边缘情况
  if (!ruleId && ruleId !== 0) {
    console.warn('无效的ruleId，无法获取高级配置:', props.ruleId)
    return
  }
  
  // 转换为数字类型
  ruleId = Number(ruleId)
  
  // 检查是否为有效的数字
  if (isNaN(ruleId) || ruleId <= 0) {
    console.warn('无效的ruleId，无法获取高级配置:', props.ruleId)
    return
  }
  
  loading.value = true
  try {
    const response = await getRuleAdvancedConfig(ruleId)
    if (response.code === 200) {
      localConfig.value = {
        triggerTiming: [],
        priority: 5,
        validityPeriod: [],
        executionLimit: 0,
        executionInterval: 0,
        dependencies: [],
        ruleGroup: '',
        executionMode: 'sync',
        errorHandling: 'continue',
        remark: '',
        ...response.data
      }
    } else {
      ElMessage.error(response.message || '获取高级配置失败')
    }
  } catch (error) {
    console.error('获取高级配置失败:', error)
    ElMessage.error('获取高级配置失败')
  } finally {
    loading.value = false
  }
}

// 保存配置
const save = async () => {
  // 有效性检查：确保ruleId是有效的数字
  let ruleId = props.ruleId
  console.log('ruleId:', ruleId)
  console.log('ruleId:', props)
  // 处理空字符串、null等边缘情况
  if (!ruleId && ruleId !== 0) {
    console.error('无效的ruleId，无法保存高级配置:', props.ruleId)
    ElMessage.error('无效的规则ID，无法保存高级配置')
    return
  }
  
  // 转换为数字类型
  ruleId = Number(ruleId)
  
  // 检查是否为有效的数字
  if (isNaN(ruleId) || ruleId <= 0) {
    console.error('无效的ruleId，无法保存高级配置:', props.ruleId)
    ElMessage.error('无效的规则ID，无法保存高级配置')
    return
  }
  
  loading.value = true
  try {
    // 过滤掉不必要的字段，只保留接口需要的字段
    const configToSave = {
      triggerTiming: localConfig.value.triggerTiming,
      priority: localConfig.value.priority,
      validityPeriod: localConfig.value.validityPeriod,
      executionLimit: localConfig.value.executionLimit,
      executionInterval: localConfig.value.executionInterval,
      dependencies: localConfig.value.dependencies,
      ruleGroup: localConfig.value.ruleGroup,
      executionMode: localConfig.value.executionMode,
      errorHandling: localConfig.value.errorHandling,
      remark: localConfig.value.remark
    }
    
    const response = await saveRuleAdvancedConfig(ruleId, configToSave)
    if (response.code === 200) {
      emit('update:modelValue', localConfig.value)
      emit('save-success')
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存高级配置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 取消修改，恢复到初始值
const cancel = () => {
  localConfig.value = {
    triggerTiming: [],
    priority: 5,
    validityPeriod: [],
    executionLimit: 0,
    executionInterval: 0,
    dependencies: [],
    ruleGroup: '',
    executionMode: 'sync',
    errorHandling: 'continue',
    remark: '',
    ...props.modelValue
  }
  ElMessage.info('已取消修改')
}

// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && JSON.stringify(newVal) !== JSON.stringify(localConfig.value)) {
    localConfig.value = {
      triggerTiming: [],
      priority: 5,
      validityPeriod: [],
      executionLimit: 0,
      executionInterval: 0,
      dependencies: [],
      ruleGroup: '',
      executionMode: 'sync',
      errorHandling: 'continue',
      remark: '',
      ...newVal
    }
  }
}, { deep: true })

// 监听ruleId变化，重新获取高级配置
watch(() => props.ruleId, (newRuleId) => {
  if (newRuleId) {
    fetchAdvancedConfig()
  }
}, { immediate: true })

// 监听ruleType变化，重新获取可用规则列表
watch(() => props.ruleType, (newType) => {
  fetchAvailableRules()
}, { immediate: true })

// 组件挂载时获取数据
onMounted(() => {
  fetchAvailableRules()
})
</script>

<style scoped>
.advanced-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.priority-value {
  margin-top: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
}
</style>