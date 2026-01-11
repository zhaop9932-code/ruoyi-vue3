<template>
  <div class="action-config-example">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>动作配置示例页面</span>
          <el-tag type="success">演示</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 完整管理页面示例 -->
        <el-tab-pane label="完整管理页面" name="manage">
          <el-alert
            title="完整的动作管理页面,包含新增、编辑、删除、批量操作等功能"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          />
          
          <el-form :inline="true">
            <el-form-item label="规则ID">
              <el-input-number v-model="demoRuleId" :min="1" />
            </el-form-item>
            <el-form-item label="BOM ID">
              <el-input-number v-model="demoBomId" :min="1" />
            </el-form-item>
          </el-form>
          
          <RuleActionManage 
            :rule-id="demoRuleId" 
            :bom-id="demoBomId"
          />
        </el-tab-pane>

        <!-- 单个动作配置示例 -->
        <el-tab-pane label="单个动作配置" name="single">
          <el-alert
            title="单独使用ActionContent组件,可嵌入到其他表单中"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          />
          
          <el-card>
            <ActionContent
              v-model:element="singleAction"
              :is-expanded="true"
              :bom-id="demoBomId"
              @validate="handleValidate"
            />
            
            <el-divider />
            
            <div class="action-preview">
              <h4>当前配置数据:</h4>
              <pre>{{ JSON.stringify(singleAction, null, 2) }}</pre>
              
              <div v-if="validationResult.errors.length > 0" class="validation-errors">
                <h4>验证错误:</h4>
                <el-alert
                  v-for="(error, index) in validationResult.errors"
                  :key="index"
                  :title="error"
                  type="error"
                  :closable="false"
                  style="margin-bottom: 10px"
                />
              </div>
              
              <div v-else class="validation-success">
                <el-alert
                  title="配置验证通过!"
                  type="success"
                  :closable="false"
                />
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 常见场景示例 -->
        <el-tab-pane label="常见场景" name="scenarios">
          <el-collapse v-model="activeScenarios">
            <!-- 场景1: 联动选中 -->
            <el-collapse-item title="场景1: 选择Intel主板后自动选中Intel CPU" name="1">
              <div class="scenario-content">
                <h4>配置说明:</h4>
                <ul>
                  <li>动作类型: 相互联动 - 联动选中</li>
                  <li>目标类型: 节点产品</li>
                  <li>选择节点: CPU节点</li>
                  <li>目标对象: Intel系列CPU产品(多选)</li>
                  <li>动作参数: 开关设为"是"</li>
                </ul>
                
                <h4>配置数据:</h4>
                <pre>{{ scenarioExamples.scenario1 }}</pre>
                
                <el-button type="primary" @click="loadScenario(1)">
                  加载此配置
                </el-button>
              </div>
            </el-collapse-item>

            <!-- 场景2: 应用折扣 -->
            <el-collapse-item title="场景2: VIP客户享受9折优惠" name="2">
              <div class="scenario-content">
                <h4>配置说明:</h4>
                <ul>
                  <li>动作类型: 价格动作 - 应用折扣</li>
                  <li>目标类型: 节点</li>
                  <li>目标对象: 选择需要打折的节点(多选)</li>
                  <li>折扣类型: 百分比</li>
                  <li>折扣值: 0.9 (即9折)</li>
                  <li>是否叠加: 否</li>
                </ul>
                
                <h4>配置数据:</h4>
                <pre>{{ scenarioExamples.scenario2 }}</pre>
                
                <el-button type="primary" @click="loadScenario(2)">
                  加载此配置
                </el-button>
              </div>
            </el-collapse-item>

            <!-- 场景3: 多选限制 -->
            <el-collapse-item title="场景3: 内存条最少2条,最多4条" name="3">
              <div class="scenario-content">
                <h4>配置说明:</h4>
                <ul>
                  <li>动作类型: 相互联动 - 多选</li>
                  <li>目标类型: 节点产品</li>
                  <li>选择节点: 内存节点</li>
                  <li>目标对象: 内存产品(多选)</li>
                  <li>最少选择数量: 2</li>
                  <li>最多选择数量: 4</li>
                </ul>
                
                <h4>配置数据:</h4>
                <pre>{{ scenarioExamples.scenario3 }}</pre>
                
                <el-button type="primary" @click="loadScenario(3)">
                  加载此配置
                </el-button>
              </div>
            </el-collapse-item>

            <!-- 场景4: 参数计算 -->
            <el-collapse-item title="场景4: 计算总功耗" name="4">
              <div class="scenario-content">
                <h4>配置说明:</h4>
                <ul>
                  <li>动作类型: 数据处理 - 参数计算</li>
                  <li>目标类型: 变量信息</li>
                  <li>目标对象: 选择"总功耗"变量</li>
                  <li>计算公式: cpuPower + gpuPower + otherPower</li>
                  <li>结果存储到: totalPower</li>
                </ul>
                
                <h4>配置数据:</h4>
                <pre>{{ scenarioExamples.scenario4 }}</pre>
                
                <el-button type="primary" @click="loadScenario(4)">
                  加载此配置
                </el-button>
              </div>
            </el-collapse-item>

            <!-- 场景5: 满减活动 -->
            <el-collapse-item title="场景5: 满1000减100" name="5">
              <div class="scenario-content">
                <h4>配置说明:</h4>
                <ul>
                  <li>动作类型: 价格动作 - 应用满减</li>
                  <li>目标类型: 节点</li>
                  <li>目标对象: 选择参与活动的节点(单选)</li>
                  <li>满减条件类型: 满金额</li>
                  <li>条件值: 1000</li>
                  <li>减额类型: 固定金额</li>
                  <li>减额值: 100</li>
                  <li>是否循环满减: 是</li>
                </ul>
                
                <h4>配置数据:</h4>
                <pre>{{ scenarioExamples.scenario5 }}</pre>
                
                <el-button type="primary" @click="loadScenario(5)">
                  加载此配置
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>

        <!-- API调用示例 -->
        <el-tab-pane label="API调用" name="api">
          <el-alert
            title="展示如何通过API进行动作的增删改查操作"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          />
          
          <el-space direction="vertical" :size="20" style="width: 100%">
            <el-card>
              <template #header>查询动作列表</template>
              <el-button type="primary" @click="testListActions" :loading="apiLoading">
                GET /cpq/ruleAction/listByRuleId/{ruleId}
              </el-button>
              <div v-if="apiResponse.list" class="api-response">
                <h4>响应数据:</h4>
                <pre>{{ JSON.stringify(apiResponse.list, null, 2) }}</pre>
              </div>
            </el-card>

            <el-card>
              <template #header>新增动作</template>
              <el-button type="success" @click="testAddAction" :loading="apiLoading">
                POST /cpq/ruleAction
              </el-button>
              <div v-if="apiResponse.add" class="api-response">
                <h4>响应数据:</h4>
                <pre>{{ JSON.stringify(apiResponse.add, null, 2) }}</pre>
              </div>
            </el-card>

            <el-card>
              <template #header>更新动作</template>
              <el-button type="warning" @click="testUpdateAction" :loading="apiLoading">
                PUT /cpq/ruleAction
              </el-button>
              <div v-if="apiResponse.update" class="api-response">
                <h4>响应数据:</h4>
                <pre>{{ JSON.stringify(apiResponse.update, null, 2) }}</pre>
              </div>
            </el-card>

            <el-card>
              <template #header>删除动作</template>
              <el-button type="danger" @click="testDeleteAction" :loading="apiLoading">
                DELETE /cpq/ruleAction/{actionId}
              </el-button>
              <div v-if="apiResponse.delete" class="api-response">
                <h4>响应数据:</h4>
                <pre>{{ JSON.stringify(apiResponse.delete, null, 2) }}</pre>
              </div>
            </el-card>
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import RuleActionManage from './RuleActionManage.vue'
import ActionContent from './ActionContent.vue'
import { 
  listRuleActionsByRuleId, 
  saveRuleAction, 
  updateRuleAction, 
  deleteRuleAction 
} from '@/api/cpq/ruleAction'

// Tab切换
const activeTab = ref('manage')
const activeScenarios = ref(['1'])

// Demo数据
const demoRuleId = ref(1001)
const demoBomId = ref(100)

// 单个动作配置
const singleAction = ref({
  actionType: '',
  targetType: '',
  targetId: '',
  structureId: '',
  attributeId: '',
  actionParams: '{}',
  actionPriority: 1,
  actionStatus: '0',
  actionSequence: 1,
  description: ''
})

// 验证结果
const validationResult = ref({
  valid: true,
  errors: []
})

// API测试相关
const apiLoading = ref(false)
const apiResponse = ref({
  list: null,
  add: null,
  update: null,
  delete: null
})

// 场景示例数据
const scenarioExamples = {
  scenario1: {
    actionType: 'linkSelect',
    targetType: 'nodeProduct',
    structureId: '101',  // CPU节点ID
    targetId: '201,202,203',  // Intel CPU产品ID
    actionParams: JSON.stringify({ value: true }),
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: 1,
    description: '选择Intel主板后自动选中Intel CPU'
  },
  scenario2: {
    actionType: 'applyDiscount',
    targetType: 'node',
    targetId: '101,102,103',
    actionParams: JSON.stringify({
      type: 'percentage',
      value: 0.9,
      isStackable: false
    }),
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: 1,
    description: 'VIP客户享受9折优惠'
  },
  scenario3: {
    actionType: 'multipleSelect',
    targetType: 'nodeProduct',
    structureId: '102',  // 内存节点ID
    targetId: '301,302,303',
    actionParams: JSON.stringify({
      minSelect: 2,
      maxSelect: 4
    }),
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: 1,
    description: '内存条最少2条,最多4条'
  },
  scenario4: {
    actionType: 'calculation',
    targetType: 'variable',
    targetId: '1',  // 总功耗变量ID
    actionParams: JSON.stringify({
      formula: 'cpuPower + gpuPower + otherPower',
      resultStorage: 'totalPower'
    }),
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: 1,
    description: '计算总功耗'
  },
  scenario5: {
    actionType: 'applyFullReduction',
    targetType: 'node',
    targetId: '100',
    actionParams: JSON.stringify({
      conditionType: 'amount',
      conditionValue: 1000,
      reduceType: 'fixed',
      reduceValue: 100,
      isLoop: true
    }),
    actionPriority: 1,
    actionStatus: '0',
    actionSequence: 1,
    description: '满1000减100'
  }
}

// 处理验证
const handleValidate = (validation) => {
  validationResult.value = validation
}

// 加载场景配置
const loadScenario = (scenarioNum) => {
  const scenarioKey = `scenario${scenarioNum}`
  singleAction.value = {
    ...scenarioExamples[scenarioKey],
    ruleId: demoRuleId.value
  }
  activeTab.value = 'single'
  ElMessage.success(`场景${scenarioNum}配置已加载`)
}

// API测试 - 查询列表
const testListActions = async () => {
  apiLoading.value = true
  try {
    const response = await listRuleActionsByRuleId(demoRuleId.value)
    apiResponse.value.list = response
    ElMessage.success('查询成功')
  } catch (error) {
    ElMessage.error('查询失败')
  } finally {
    apiLoading.value = false
  }
}

// API测试 - 新增
const testAddAction = async () => {
  apiLoading.value = true
  try {
    const testData = {
      ruleId: demoRuleId.value,
      actionType: 'isEnable',
      actionName: '测试动作',
      targetType: 'node',
      targetId: '101',
      actionParams: JSON.stringify({ value: true }),
      actionPriority: 1,
      actionStatus: '0',
      actionSequence: 1
    }
    const response = await saveRuleAction(testData)
    apiResponse.value.add = response
    ElMessage.success('新增成功')
  } catch (error) {
    ElMessage.error('新增失败')
  } finally {
    apiLoading.value = false
  }
}

// API测试 - 更新
const testUpdateAction = async () => {
  if (!apiResponse.value.add || !apiResponse.value.add.data) {
    ElMessage.warning('请先执行新增操作')
    return
  }
  
  apiLoading.value = true
  try {
    const testData = {
      actionId: apiResponse.value.add.data.actionId,
      actionName: '测试动作(已更新)',
      actionParams: JSON.stringify({ value: false })
    }
    const response = await updateRuleAction(testData)
    apiResponse.value.update = response
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    apiLoading.value = false
  }
}

// API测试 - 删除
const testDeleteAction = async () => {
  if (!apiResponse.value.add || !apiResponse.value.add.data) {
    ElMessage.warning('请先执行新增操作')
    return
  }
  
  apiLoading.value = true
  try {
    const actionId = apiResponse.value.add.data.actionId
    const response = await deleteRuleAction(actionId)
    apiResponse.value.delete = response
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    apiLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.action-config-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-preview {
  margin-top: 20px;
  
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }
  
  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
  }
}

.validation-errors,
.validation-success {
  margin-top: 20px;
}

.scenario-content {
  padding: 20px;
  
  h4 {
    margin-bottom: 15px;
    color: #303133;
  }
  
  ul {
    margin-bottom: 15px;
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      color: #606266;
    }
  }
  
  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
}

.api-response {
  margin-top: 20px;
  
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }
  
  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.5;
    max-height: 400px;
  }
}
</style>
