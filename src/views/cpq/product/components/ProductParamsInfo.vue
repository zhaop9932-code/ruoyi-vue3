<template>
  <div class="params-info-container">
    <div class="params-management" style="margin-bottom: 20px;">
      <el-button type="primary" size="small" icon="Plus" @click="addParamItem" class="mb-2">添加特性参数</el-button>
      <el-table :data="paramList" border class="cpq-table">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="参数名称" prop="paramName" min-width="120">
          <template #default="scope">
            <el-input v-model="scope.row.paramName" placeholder="请输入参数名称" />
          </template>
        </el-table-column>
        <el-table-column label="参数值" prop="paramValue" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.paramValue" placeholder="请输入参数值" />
          </template>
        </el-table-column>
       
        <el-table-column label="描述" prop="description" min-width="200">
          <template #default="scope">
            <el-input v-model="scope.row.description" placeholder="请输入描述" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button type="danger" size="small" icon="Delete" @click="removeParamItem(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// 定义props
const props = defineProps({
  paramList: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:paramList'])

// 特性参数列表
const paramList = ref([...props.paramList])

// 添加特性参数
const addParamItem = () => {
  paramList.value.push({
    paramName: '',
    paramValue: '',
    paramUnit: '',
    paramType: '',
    description: ''
  })
  emit('update:paramList', paramList.value)
}

// 删除特性参数
const removeParamItem = (index) => {
  paramList.value.splice(index, 1)
  emit('update:paramList', paramList.value)
}

// 仅监听props变化，初始化本地paramList，不再监听本地变化避免无限递归
watch(
  () => props.paramList,
  (newParamList) => {
    paramList.value = [...newParamList]
  },
  { immediate: true }
)
</script>

<style scoped>
.params-info-container {
  padding: 10px 0;
}

.cpq-table {
  width: 100%;
}

.mb-2 {
  margin-bottom: 8px;
}

.cpq-select {
  width: 100%;
}
</style>