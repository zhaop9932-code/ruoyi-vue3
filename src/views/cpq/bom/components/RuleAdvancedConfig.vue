<template>
  <div class="advanced-config">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>高级配置</span>
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
import { ref, watch, reactive } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  ruleType: {
    type: String,
    default: 'validation'
  }
})

const emit = defineEmits(['update:modelValue'])

// 高级配置数据
const advancedConfig = reactive({
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

// 可用规则列表（模拟数据）
const availableRules = ref([
  { ruleId: 1, ruleName: '重量验证规则' },
  { ruleId: 2, ruleName: '总价计算规则' },
  { ruleId: 3, ruleName: '颜色折扣规则' },
  { ruleId: 4, ruleName: '库存验证规则' }
])

// 监听配置变化
watch(advancedConfig, () => {
  emit('update:modelValue', advancedConfig)
}, { deep: true })

// 监听外部模型变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && JSON.stringify(newVal) !== JSON.stringify(advancedConfig)) {
    Object.assign(advancedConfig, newVal)
  }
}, { deep: true })
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