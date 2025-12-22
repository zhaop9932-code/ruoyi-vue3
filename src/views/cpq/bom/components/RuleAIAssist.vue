<template>
  <div class="ai-assist">
    <el-card shadow="hover" class="ai-main-card">
      <template #header>
        <div class="card-header">
          <span>AI 辅助配置</span>
          <el-tag type="info">DeepSeek 驱动</el-tag>
        </div>
      </template>
      
      <!-- AI功能选项卡 -->
      <el-tabs v-model="activeTab" type="border-card" class="ai-function-tabs">
        <!-- 自然语言生成规则 -->
        <el-tab-pane label="自然语言生成" name="generate">
          <div class="ai-function-section">
            <el-form-item label="规则描述" required>
              <el-input
                v-model="generateRuleForm.description"
                type="textarea"
                placeholder="请用自然语言描述规则，例如：当产品价格高于1000元且用户是VIP客户时，给予10%折扣"
                :rows="4"
              />
              <div class="form-tip">示例：当产品价格高于1000元且用户是VIP客户时，给予10%折扣</div>
            </el-form-item>
            
            <el-form-item label="规则类型">
              <el-select v-model="generateRuleForm.ruleType" placeholder="请选择规则类型">
                <el-option label="验证规则" value="validation" />
                <el-option label="计算规则" value="calculation" />
                <el-option label="条件规则" value="condition" />
                <el-option label="跳转规则" value="redirect" />
              </el-select>
            </el-form-item>
            
            <div class="ai-action-buttons">
              <el-button 
                type="primary" 
                size="large"
                :loading="isGenerating"
                @click="handleGenerateRule"
              >
                <el-icon><MagicStick /></el-icon> 生成规则
              </el-button>
            </div>
            
            <!-- 生成结果 -->
            <div v-if="generatedRule" class="generated-result">
              <el-divider content-position="left">生成结果</el-divider>
              <el-card shadow="hover">
                <template #header>
                  <div class="result-header">
                    <span>AI 生成的规则</span>
                    <el-button type="success" size="small" @click="applyGeneratedRule">
                      <el-icon><Check /></el-icon> 应用规则
                    </el-button>
                  </div>
                </template>
                
                <div class="result-content">
                  <div class="result-item">
                    <strong>规则名称：</strong>{{ generatedRule.ruleName }}
                  </div>
                  <div class="result-item">
                    <strong>规则类型：</strong>{{ generatedRule.ruleType }}
                  </div>
                  <div class="result-item">
                    <strong>条件配置：</strong>
                    <pre>{{ JSON.stringify(generatedRule.conditions, null, 2) }}</pre>
                  </div>
                  <div class="result-item">
                    <strong>动作配置：</strong>
                    <pre>{{ JSON.stringify(generatedRule.actions, null, 2) }}</pre>
                  </div>
                  <div class="result-item">
                    <strong>规则表达式：</strong>
                    <pre>{{ generatedRule.ruleExpression }}</pre>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 规则优化 -->
        <el-tab-pane label="规则优化" name="optimize">
          <div class="ai-function-section">
            <el-form-item label="当前规则表达式" required>
              <el-input
                v-model="optimizeRuleForm.expression"
                type="textarea"
                placeholder="请输入要优化的规则表达式"
                :rows="6"
              />
              <div class="form-tip">示例：if (price > 1000 && isVip) { discount = 0.1 } else { discount = 0.05 }</div>
            </el-form-item>
            
            <el-form-item label="优化方向">
              <el-checkbox-group v-model="optimizeRuleForm.optimizeDirections">
                <el-checkbox label="性能优化">性能优化</el-checkbox>
                <el-checkbox label="逻辑优化">逻辑优化</el-checkbox>
                <el-checkbox label="可读性优化">可读性优化</el-checkbox>
                <el-checkbox label="完整性检查">完整性检查</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <div class="ai-action-buttons">
              <el-button 
                type="primary" 
                size="large"
                :loading="isOptimizing"
                @click="handleOptimizeRule"
              >
                <el-icon><Top /></el-icon> 优化规则
              </el-button>
            </div>
            
            <!-- 优化结果 -->
            <div v-if="optimizedRule" class="generated-result">
              <el-divider content-position="left">优化结果</el-divider>
              <el-card shadow="hover">
                <template #header>
                  <div class="result-header">
                    <span>AI 优化的规则</span>
                    <el-button type="success" size="small" @click="applyOptimizedRule">
                      <el-icon><Check /></el-icon> 应用优化
                    </el-button>
                  </div>
                </template>
                
                <div class="result-content">
                  <div class="result-item">
                    <strong>原表达式：</strong>
                    <pre>{{ optimizeRuleForm.expression }}</pre>
                  </div>
                  <div class="result-item">
                    <strong>优化后：</strong>
                    <pre>{{ optimizedRule.optimizedExpression }}</pre>
                  </div>
                  <div class="result-item">
                    <strong>优化建议：</strong>
                    <ul class="optimize-suggestions">
                      <li v-for="(suggestion, index) in optimizedRule.suggestions" :key="index">
                        {{ suggestion }}
                      </li>
                    </ul>
                  </div>
                  <div class="result-item">
                    <strong>优化类型：</strong>
                    <el-tag 
                      v-for="(type, index) in optimizedRule.optimizeTypes" 
                      :key="index" 
                      type="success" 
                      size="small"
                      class="optimize-type-tag"
                    >
                      {{ type }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 规则冲突检测 -->
        <el-tab-pane label="冲突检测" name="detect">
          <div class="ai-function-section">
            <el-form-item label="规则列表" required>
              <el-select 
                v-model="detectConflictForm.ruleIds" 
                placeholder="请选择要检测冲突的规则"
                multiple
                collapse-tags
                style="width: 100%"
              >
                <el-option 
                  v-for="rule in availableRules" 
                  :key="rule.ruleId" 
                  :label="rule.ruleName"
                  :value="rule.ruleId"
                />
              </el-select>
              <div class="form-tip">选择要检测冲突的规则，至少选择2个</div>
            </el-form-item>
            
            <div class="ai-action-buttons">
              <el-button 
                type="primary" 
                size="large"
                :loading="isDetecting"
                :disabled="detectConflictForm.ruleIds.length < 2"
                @click="handleDetectConflicts"
              >
                <el-icon><WarningFilled /></el-icon> 检测冲突
              </el-button>
            </div>
            
            <!-- 检测结果 -->
            <div v-if="conflictDetectionResult" class="generated-result">
              <el-divider content-position="left">冲突检测结果</el-divider>
              <el-card shadow="hover">
                <template #header>
                  <div class="result-header">
                    <span>冲突检测报告</span>
                    <el-tag 
                      :type="conflictDetectionResult.hasConflict ? 'danger' : 'success'"
                    >
                      {{ conflictDetectionResult.hasConflict ? '发现冲突' : '无冲突' }}
                    </el-tag>
                  </div>
                </template>
                
                <div class="result-content">
                  <div v-if="conflictDetectionResult.hasConflict" class="conflict-result">
                    <div class="result-item">
                      <strong>冲突数量：</strong>{{ conflictDetectionResult.conflicts.length }}
                    </div>
                    
                    <div v-for="(conflict, index) in conflictDetectionResult.conflicts" :key="index" class="conflict-item">
                      <h4>冲突 {{ index + 1 }}</h4>
                      <div class="conflict-description">{{ conflict.description }}</div>
                      <div class="conflict-rules">
                        <strong>冲突规则：</strong>
                        <ul>
                          <li v-for="ruleId in conflict.ruleIds" :key="ruleId">
                            {{ availableRules.find(r => r.ruleId === ruleId)?.ruleName || `规则ID: ${ruleId}` }}
                          </li>
                        </ul>
                      </div>
                      <div class="conflict-solution">
                        <strong>建议解决方案：</strong>{{ conflict.solution }}
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="no-conflict-result">
                    <el-empty description="未检测到规则冲突" />
                    <div class="success-message">所有规则之间没有冲突，可以安全使用。</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 规则解释 -->
        <el-tab-pane label="规则解释" name="explain">
          <div class="ai-function-section">
            <el-form-item label="规则表达式" required>
              <el-input
                v-model="explainRuleForm.expression"
                type="textarea"
                placeholder="请输入要解释的规则表达式"
                :rows="6"
              />
              <div class="form-tip">示例：weight > 0 && weight < 1000</div>
            </el-form-item>
            
            <div class="ai-action-buttons">
              <el-button 
                type="primary" 
                size="large"
                :loading="isExplaining"
                @click="handleExplainRule"
              >
                <el-icon><HelpFilled /></el-icon> 解释规则
              </el-button>
            </div>
            
            <!-- 解释结果 -->
            <div v-if="explainResult" class="generated-result">
              <el-divider content-position="left">规则解释</el-divider>
              <el-card shadow="hover">
                <template #header>
                  <div class="result-header">
                    <span>规则解释结果</span>
                  </div>
                </template>
                
                <div class="result-content">
                  <div class="result-item">
                    <strong>规则表达式：</strong>
                    <pre>{{ explainRuleForm.expression }}</pre>
                  </div>
                  <div class="result-item">
                    <strong>自然语言解释：</strong>
                    <div class="rule-explanation">{{ explainResult.explanation }}</div>
                  </div>
                  <div class="result-item">
                    <strong>规则类型：</strong>{{ explainResult.ruleType }}
                  </div>
                  <div class="result-item">
                    <strong>适用场景：</strong>
                    <ul class="applicable-scenarios">
                      <li v-for="(scenario, index) in explainResult.applicableScenarios" :key="index">
                        {{ scenario }}
                      </li>
                    </ul>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MagicStick, Top, WarningFilled, HelpFilled, Check } from '@element-plus/icons-vue'

const emit = defineEmits(['generate-rule', 'optimize-rule', 'detect-conflicts'])

// 活跃的AI功能选项卡
const activeTab = ref('generate')

// 生成规则表单
const generateRuleForm = reactive({
  description: '',
  ruleType: 'condition'
})

// 优化规则表单
const optimizeRuleForm = reactive({
  expression: '',
  optimizeDirections: ['性能优化', '逻辑优化', '可读性优化']
})

// 冲突检测表单
const detectConflictForm = reactive({
  ruleIds: []
})

// 规则解释表单
const explainRuleForm = reactive({
  expression: ''
})

// 加载状态
const isGenerating = ref(false)
const isOptimizing = ref(false)
const isDetecting = ref(false)
const isExplaining = ref(false)

// 生成结果
const generatedRule = ref(null)
const optimizedRule = ref(null)
const conflictDetectionResult = ref(null)
const explainResult = ref(null)

// 可用规则列表（模拟数据）
const availableRules = ref([
  { ruleId: 1, ruleName: '重量验证规则' },
  { ruleId: 2, ruleName: '总价计算规则' },
  { ruleId: 3, ruleName: '颜色折扣规则' },
  { ruleId: 4, ruleName: '库存验证规则' }
])

// 自然语言生成规则
const handleGenerateRule = async () => {
  if (!generateRuleForm.description) {
    return
  }
  
  isGenerating.value = true
  
  try {
    // 模拟API调用，实际项目中替换为真实的DeepSeek API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟生成结果
    generatedRule.value = {
      ruleName: 'AI生成的产品折扣规则',
      ruleType: generateRuleForm.ruleType,
      conditions: [
        {
          id: 1,
          type: 'number',
          field: 'productPrice',
          operator: '>',
          value: 1000,
          logic: ''
        },
        {
          id: 2,
          type: 'boolean',
          field: 'isVip',
          operator: '=',
          value: true,
          logic: 'AND'
        }
      ],
      actions: [
        {
          id: 1,
          type: 'setProperty',
          field: 'discount',
          value: 0.1,
          condition: '',
          sequence: 1
        }
      ],
      ruleExpression: 'if (productPrice > 1000 AND isVip) { discount = 0.1 }'
    }
  } catch (error) {
    console.error('生成规则失败:', error)
    ElMessage.error('生成规则失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 应用生成的规则
const applyGeneratedRule = () => {
  if (generatedRule.value) {
    emit('generate-rule', generatedRule.value)
    ElMessage.success('规则已应用到配置中')
  }
}

// 规则优化
const handleOptimizeRule = async () => {
  if (!optimizeRuleForm.expression) {
    return
  }
  
  isOptimizing.value = true
  
  try {
    // 模拟API调用，实际项目中替换为真实的DeepSeek API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟优化结果
    optimizedRule.value = {
      optimizedExpression: 'discount = (price > 1000 && isVip) ? 0.1 : 0.05',
      suggestions: [
        '将if-else语句优化为三元表达式，提高执行效率',
        '简化了逻辑结构，提高了可读性',
        '保持了原有逻辑的完整性',
        '优化后的表达式更易于维护'
      ],
      optimizeTypes: ['性能优化', '逻辑优化', '可读性优化']
    }
  } catch (error) {
    console.error('优化规则失败:', error)
    ElMessage.error('优化规则失败，请稍后重试')
  } finally {
    isOptimizing.value = false
  }
}

// 应用优化后的规则
const applyOptimizedRule = () => {
  if (optimizedRule.value) {
    emit('optimize-rule', optimizedRule.value)
    ElMessage.success('规则优化已应用')
  }
}

// 检测规则冲突
const handleDetectConflicts = async () => {
  if (detectConflictForm.ruleIds.length < 2) {
    return
  }
  
  isDetecting.value = true
  
  try {
    // 模拟API调用，实际项目中替换为真实的DeepSeek API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟检测结果
    conflictDetectionResult.value = {
      hasConflict: true,
      conflicts: [
        {
          description: '两个规则在相同条件下设置了不同的折扣值，可能导致业务逻辑冲突',
          ruleIds: [1, 3],
          solution: '建议合并这两个规则，或明确设置规则优先级'
        }
      ]
    }
  } catch (error) {
    console.error('检测冲突失败:', error)
    ElMessage.error('检测冲突失败，请稍后重试')
  } finally {
    isDetecting.value = false
  }
}

// 解释规则
const handleExplainRule = async () => {
  if (!explainRuleForm.expression) {
    return
  }
  
  isExplaining.value = true
  
  try {
    // 模拟API调用，实际项目中替换为真实的DeepSeek API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟解释结果
    explainResult.value = {
      explanation: '该规则用于验证产品重量必须在0到1000克之间，确保产品配置符合重量限制要求',
      ruleType: 'validation',
      applicableScenarios: [
        '产品配置过程中的重量验证',
        '订单提交前的产品校验',
        '报价生成前的规则检查'
      ]
    }
  } catch (error) {
    console.error('解释规则失败:', error)
    ElMessage.error('解释规则失败，请稍后重试')
  } finally {
    isExplaining.value = false
  }
}
</script>

<style scoped>
.ai-assist {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-function-tabs {
  margin-top: 20px;
}

.ai-function-section {
  padding: 20px 0;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.ai-action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}

.generated-result {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  margin-bottom: 10px;
}

.result-item pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 5px 0;
}

.optimize-suggestions {
  margin: 5px 0;
  padding-left: 20px;
}

.optimize-suggestions li {
  margin-bottom: 5px;
}

.optimize-type-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.conflict-item {
  margin: 15px 0;
  padding: 15px;
  background-color: #fef0f0;
  border: 1px solid #fbc4ab;
  border-radius: 8px;
}

.conflict-item h4 {
  margin: 0 0 10px 0;
  color: #f56c6c;
}

.conflict-description {
  margin-bottom: 10px;
}

.conflict-rules ul {
  margin: 5px 0;
  padding-left: 20px;
}

.conflict-solution {
  margin-top: 10px;
  font-weight: bold;
}

.no-conflict-result {
  text-align: center;
  padding: 20px 0;
}

.success-message {
  margin-top: 10px;
  color: #67c23a;
  font-weight: bold;
}

.conflict-result {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rule-explanation {
  margin: 5px 0;
  line-height: 1.6;
}

.applicable-scenarios {
  margin: 5px 0;
  padding-left: 20px;
}

.applicable-scenarios li {
  margin-bottom: 5px;
}
</style>