<template>
  <div class="bom-advanced-settings">
    <div class="management-header">
      <h3>高级设置</h3>
      <el-button type="primary" icon="Check" @click="handleSaveSettings">保存设置</el-button>
    </div>
    
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <h4>版本控制设置</h4>
        </div>
      </template>
      <el-form :model="advancedSettings.versionControl" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用版本控制">
              <el-switch v-model="advancedSettings.versionControl.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本命名规则">
              <el-select v-model="advancedSettings.versionControl.namingRule" placeholder="请选择版本命名规则">
                <el-option label="主版本.次版本" value="major.minor" />
                <el-option label="主版本.次版本.修订版" value="major.minor.patch" />
                <el-option label="日期格式" value="date" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大版本数量">
              <el-input-number v-model="advancedSettings.versionControl.maxVersions" :min="1" :max="100" :step="1" placeholder="请输入最大版本数量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动创建版本">
              <el-switch v-model="advancedSettings.versionControl.autoCreateVersion" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="自定义版本格式" v-if="advancedSettings.versionControl.namingRule === 'custom'">
          <el-input v-model="advancedSettings.versionControl.customFormat" placeholder="请输入自定义版本格式" />
          <div class="form-tip">示例：V{major}.{minor}.{patch} 或 {year}-{month}-{day}</div>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <h4>审批流程设置</h4>
        </div>
      </template>
      <el-form :model="advancedSettings.approval" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用审批流程">
              <el-switch v-model="advancedSettings.approval.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批层级">
              <el-input-number v-model="advancedSettings.approval.levels" :min="1" :max="5" :step="1" placeholder="请输入审批层级" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="自动触发审批">
              <el-switch v-model="advancedSettings.approval.autoTrigger" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批超时时间（天）">
              <el-input-number v-model="advancedSettings.approval.timeoutDays" :min="1" :max="30" :step="1" placeholder="请输入超时时间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="审批人设置" v-if="advancedSettings.approval.enabled">
          <el-table :data="advancedSettings.approval.approvers" border style="width: 100%">
            <el-table-column label="审批层级" width="100" align="center">
              <template #default="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="审批人" min-width="150">
              <template #default="scope">
                <el-select v-model="scope.row.userId" placeholder="请选择审批人">
                  <el-option label="张三" value="1" />
                  <el-option label="李四" value="2" />
                  <el-option label="王五" value="3" />
                  <el-option label="赵六" value="4" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="角色" min-width="150">
              <template #default="scope">
                <el-select v-model="scope.row.role" placeholder="请选择角色">
                  <el-option label="项目经理" value="pm" />
                  <el-option label="工程师" value="engineer" />
                  <el-option label="质量经理" value="quality" />
                  <el-option label="财务经理" value="finance" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button size="small" type="danger" icon="Delete" @click="handleDeleteApprover(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" icon="Plus" size="small" @click="handleAddApprover" style="margin-top: 10px;">
            新增审批人
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <h4>通知设置</h4>
        </div>
      </template>
      <el-form :model="advancedSettings.notification" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用通知">
              <el-switch v-model="advancedSettings.notification.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="通知事件" v-if="advancedSettings.notification.enabled">
          <el-checkbox-group v-model="advancedSettings.notification.events">
            <el-checkbox label="BOM创建">BOM创建</el-checkbox>
            <el-checkbox label="BOM修改">BOM修改</el-checkbox>
            <el-checkbox label="BOM审批">BOM审批</el-checkbox>
            <el-checkbox label="BOM版本变更">BOM版本变更</el-checkbox>
            <el-checkbox label="BOM删除">BOM删除</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="通知方式" v-if="advancedSettings.notification.enabled">
          <el-checkbox-group v-model="advancedSettings.notification.methods">
            <el-checkbox label="邮件">邮件</el-checkbox>
            <el-checkbox label="短信">短信</el-checkbox>
            <el-checkbox label="系统消息">系统消息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="通知接收人" v-if="advancedSettings.notification.enabled">
          <el-select v-model="advancedSettings.notification.recipients" multiple placeholder="请选择通知接收人">
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
            <el-option label="王五" value="3" />
            <el-option label="赵六" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <h4>集成设置</h4>
        </div>
      </template>
      <el-form :model="advancedSettings.integration" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用ERP集成">
              <el-switch v-model="advancedSettings.integration.erpEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用MES集成">
              <el-switch v-model="advancedSettings.integration.mesEnabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用PLM集成">
              <el-switch v-model="advancedSettings.integration.plmEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动同步">
              <el-switch v-model="advancedSettings.integration.autoSync" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="同步频率" v-if="advancedSettings.integration.autoSync">
          <el-select v-model="advancedSettings.integration.syncFrequency" placeholder="请选择同步频率">
            <el-option label="实时同步" value="realtime" />
            <el-option label="每小时" value="hourly" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <h4>访问控制</h4>
        </div>
      </template>
      <el-form :model="advancedSettings.accessControl" label-width="150px" size="default">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用访问控制">
              <el-switch v-model="advancedSettings.accessControl.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="权限设置" v-if="advancedSettings.accessControl.enabled">
          <el-table :data="advancedSettings.accessControl.permissions" border style="width: 100%">
            <el-table-column label="角色" min-width="150">
              <template #default="scope">
                <el-select v-model="scope.row.role" placeholder="请选择角色">
                  <el-option label="管理员" value="admin" />
                  <el-option label="编辑" value="editor" />
                  <el-option label="查看" value="viewer" />
                  <el-option label="审批人" value="approver" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="可编辑" width="100" align="center">
              <template #default="scope">
                <el-switch v-model="scope.row.canEdit" />
              </template>
            </el-table-column>
            <el-table-column label="可审批" width="100" align="center">
              <template #default="scope">
                <el-switch v-model="scope.row.canApprove" />
              </template>
            </el-table-column>
            <el-table-column label="可删除" width="100" align="center">
              <template #default="scope">
                <el-switch v-model="scope.row.canDelete" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button size="small" type="danger" icon="Delete" @click="handleDeletePermission(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" icon="Plus" size="small" @click="handleAddPermission" style="margin-top: 10px;">
            新增权限
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  bomId: {
    type: [String, Number],
    required: true
  }
})

// 高级设置数据
const advancedSettings = reactive({
  // 版本控制设置
  versionControl: {
    enabled: true,
    namingRule: 'major.minor.patch',
    maxVersions: 10,
    autoCreateVersion: true,
    customFormat: ''
  },
  // 审批流程设置
  approval: {
    enabled: false,
    levels: 1,
    autoTrigger: true,
    timeoutDays: 3,
    approvers: [
      {
        userId: '1',
        role: 'pm'
      }
    ]
  },
  // 通知设置
  notification: {
    enabled: true,
    events: ['BOM创建', 'BOM修改', 'BOM审批'],
    methods: ['邮件', '系统消息'],
    recipients: ['1', '2']
  },
  // 集成设置
  integration: {
    erpEnabled: true,
    mesEnabled: false,
    plmEnabled: true,
    autoSync: true,
    syncFrequency: 'hourly'
  },
  // 访问控制
  accessControl: {
    enabled: true,
    permissions: [
      {
        role: 'admin',
        canEdit: true,
        canApprove: true,
        canDelete: true
      },
      {
        role: 'editor',
        canEdit: true,
        canApprove: false,
        canDelete: false
      },
      {
        role: 'viewer',
        canEdit: false,
        canApprove: false,
        canDelete: false
      }
    ]
  }
})

// 保存设置
const handleSaveSettings = async () => {
  try {
    // 实际项目中替换为真实API调用
    // await updateAdvancedSettings(props.bomId, advancedSettings)
    
    // 模拟保存成功
    setTimeout(() => {
      ElMessage.success('高级设置保存成功')
    }, 500)
  } catch (error) {
    ElMessage.error('保存失败，请检查设置数据')
    console.error('保存高级设置失败:', error)
  }
}

// 添加审批人
const handleAddApprover = () => {
  advancedSettings.approval.approvers.push({
    userId: '',
    role: ''
  })
}

// 删除审批人
const handleDeleteApprover = (index) => {
  advancedSettings.approval.approvers.splice(index, 1)
}

// 添加权限
const handleAddPermission = () => {
  advancedSettings.accessControl.permissions.push({
    role: '',
    canEdit: false,
    canApprove: false,
    canDelete: false
  })
}

// 删除权限
const handleDeletePermission = (index) => {
  advancedSettings.accessControl.permissions.splice(index, 1)
}

// 组件挂载时加载数据
onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    console.log('高级设置数据加载完成')
  }, 500)
})
</script>

<style scoped>
.bom-advanced-settings {
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

.setting-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>