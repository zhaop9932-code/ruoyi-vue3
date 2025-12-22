<template>
  <div class="price-info-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="基准价格" prop="basePrice">
          <el-input v-model="form.basePrice" type="number" placeholder="请输入基准价格" />
        </el-form-item>
        <el-form-item label="价格单位" prop="priceUnit">
          <el-select v-model="form.priceUnit" placeholder="请选择价格单位" class="cpq-select">
            <el-option label="元" value="CNY" />
            <el-option label="美元" value="USD" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本价格" prop="costPrice">
          <el-input v-model="form.costPrice" type="number" placeholder="请输入成本价格" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="最小销售价格" prop="minSalesPrice">
          <el-input v-model="form.minSalesPrice" type="number" placeholder="请输入最小销售价格" />
        </el-form-item>
        <el-form-item label="最大销售价格" prop="maxSalesPrice">
          <el-input v-model="form.maxSalesPrice" type="number" placeholder="请输入最大销售价格" />
        </el-form-item>
        <el-form-item label="建议零售价" prop="suggestedRetailPrice">
          <el-input v-model="form.suggestedRetailPrice" type="number" placeholder="请输入建议零售价" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="价格有效期" prop="priceValidityPeriod">
      <el-date-picker v-model="form.priceValidityPeriod" type="daterange" range-separator="至"
        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
        style="width: 100%;" />
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// 定义props
const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits([])
</script>

<style scoped>
.price-info-container {
  padding: 10px 0;
}

.cpq-select {
  width: 100%;
}
</style>