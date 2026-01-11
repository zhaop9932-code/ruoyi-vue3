<template>
  <div class="app-container">
    <div class="page-header">
      <h2>{{ bomName }} - BOM管理</h2>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" type="border-card">
      <el-tab-pane label="BOM基本信息" name="basicInfo">
        <bom-basic-info :bom-id="bomId" :bom-name="bomName" @update="handleBomUpdate" />
      </el-tab-pane>
      <el-tab-pane label="变量管理" name="variableManagement">
        <bom-variable-management :bom-id="bomId" />
      </el-tab-pane>
      <el-tab-pane label="节点信息" name="nodeInfo">
        <bom-node-info :bom-id="bomId" />
      </el-tab-pane>
      <el-tab-pane label="规则配置" name="ruleConfig">
        <bom-rule-config ref="ruleConfigRef" :bom-id="bomId" />
      </el-tab-pane>
      <el-tab-pane label="默认产品组" name="defaultProduct">
        <bom-default-product :bom-id="bomId" />
      </el-tab-pane>
      <el-tab-pane label="BOM方案" name="bomSolution">
        <bom-solution-relation :bom-id="bomId" />
      </el-tab-pane>
      <el-tab-pane label="高级设置" name="advancedSettings">
        <bom-advanced-settings :bom-id="bomId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BomBasicInfo from './components/BomBasicInfo.vue'
import BomVariableManagement from './components/BomVariableManagement.vue'
import BomNodeInfo from './components/BomNodeInfo.vue'
import BomRuleConfig from './components/BomRuleConfig.vue'
import BomAdvancedSettings from './components/BomAdvancedSettings.vue'
import BomDefaultProduct from './components/BomDefaultProduct.vue'
import BomSolutionRelation from './components/BomSolutionRelation.vue'

const route = useRoute()
const router = useRouter()

// 路由参数
const bomId = ref(route.query.bomId || '')
const bomName = ref(route.query.bomName || '未命名BOM')

// 当前激活的标签页
const activeTab = ref('basicInfo')

// 组件引用
const ruleConfigRef = ref(null)

// 标签页切换处理
const handleTabChange = (tabName) => {
  console.log(`切换到标签页: ${tabName}`)
  // 可以在这里添加标签页切换时的逻辑
  if (tabName === 'ruleConfig') {
    // 切换到规则配置标签页时，刷新规则列表
    refreshRuleList()
  }
}

// 刷新规则列表
const refreshRuleList = () => {
  if (ruleConfigRef.value && ruleConfigRef.value.loadRuleTree) {
    ruleConfigRef.value.loadRuleTree()
  }
}

// BOM信息更新处理
const handleBomUpdate = (updatedInfo) => {
  bomName.value = updatedInfo.bomName || bomName.value
  ElMessage.success('BOM信息已更新')
}

// 检查BOM ID是否有效
onMounted(() => {
  if (!bomId.value) {
    ElMessage.error('无效的BOM ID')
    router.push('/cpq/bom')
  }
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>