<template>
  <div class="bom-info-container">
    <div class="bom-management" style="margin-bottom: 20px;">
      <el-button type="primary" size="small" icon="Plus" @click="addBomItem" class="mb-2">添加BOM项</el-button>
      <el-table :data="bomList" border class="cpq-table">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="物料编码" prop="materialCode" min-width="120">
          <template #default="scope">
            <el-input v-model="scope.row.materialCode" placeholder="请输入物料编码" />
          </template>
        </el-table-column>
        <el-table-column label="物料名称" prop="materialName" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.materialName" placeholder="请输入物料名称" />
          </template>
        </el-table-column>
        <el-table-column label="物料规格" prop="materialSpec" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.materialSpec" placeholder="请输入物料规格" />
          </template>
        </el-table-column>
        <el-table-column label="物料类型" prop="materialType" min-width="120">
          <template #default="scope">
            <el-select v-model="scope.row.materialType" placeholder="请选择物料类型" class="cpq-select">
              <el-option label="原材料" value="1" />
              <el-option label="半成品" value="2" />
              <el-option label="成品" value="3" />
              <el-option label="配件" value="4" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="用量" prop="quantity" min-width="100">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="0" :step="0.01" placeholder="请输入用量" />
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" min-width="80">
          <template #default="scope">
            <el-input v-model="scope.row.unit" placeholder="请输入单位" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button type="danger" size="small" icon="Delete" @click="removeBomItem(scope.$index)" />
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
  bomList: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:bomList'])

// BOM组成列表
const bomList = ref([...props.bomList])

// 添加BOM项
const addBomItem = () => {
  bomList.value.push({
    materialCode: '',
    materialName: '',
    materialSpec: '',
    materialType: '',
    quantity: 1,
    unit: ''
  })
  emit('update:bomList', bomList.value)
}

// 删除BOM项
const removeBomItem = (index) => {
  bomList.value.splice(index, 1)
  emit('update:bomList', bomList.value)
}

// 仅监听props变化，初始化本地bomList，不再监听本地变化避免无限递归
watch(
  () => props.bomList,
  (newBomList) => {
    bomList.value = [...newBomList]
  },
  { immediate: true }
)
</script>

<style scoped>
.bom-info-container {
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