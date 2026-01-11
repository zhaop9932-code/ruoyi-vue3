<template>
  <div class="main-info-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="由系统自动生成" :readonly="!form.productId"
            :disabled="!form.productId" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="物料类型" prop="materialType">
          <el-select v-model="form.materialType" placeholder="请选择物料类型" class="cpq-select">
            <el-option label="原材料" value="0" />
            <el-option label="半成品" value="1" />
            <el-option label="成品" value="2" />
            <el-option label="配件" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品状态" prop="productStatus">
          <el-radio-group v-model="form.productStatus" class="cpq-radio">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="产品版本" prop="productVersion">
          <el-input v-model="form.productVersion" placeholder="请输入产品版本" />
        </el-form-item>
        <el-form-item label="所属目录" prop="catalogId">
          <el-tree-select
            v-model="form.catalogId"
            :data="catalogTree"
            placeholder="请选择所属目录"
            class="cpq-select"
            clearable
            :props="{ value: 'catalogId', label: 'catalogName', children: 'children' }"
          />
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="form.brandId" placeholder="请选择品牌" class="cpq-select" clearable>
            <el-option v-for="brand in brandList" :key="brand.brandId" :label="brand.brandName"
              :value="brand.brandId" />
          </el-select>
        </el-form-item>
        <el-form-item label="系列" prop="seriesId">
          <el-select v-model="form.seriesId" placeholder="请选择系列" class="cpq-select" :disabled="!form.brandId">
            <el-option v-for="series in seriesList" :key="series.seriesId" :label="series.seriesName"
              :value="series.seriesId" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品型号" prop="productModel">
          <el-input v-model="form.productModel" placeholder="请输入产品型号" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-divider class="cpq-divider"></el-divider>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="包装单位" prop="packagingUnit">
          <el-input v-model="form.packagingUnit" placeholder="请输入包装单位，如：箱、个、套等" />
        </el-form-item>
        <el-form-item label="产品重量(kg)" prop="weight">
          <el-input-number v-model="form.weight" :min="0" :step="0.01" placeholder="请输入产品重量" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="产品尺寸" prop="dimensions">
          <el-input v-model="form.dimensions" placeholder="请输入产品尺寸，格式：长×宽×高，如：400×300×200" />
        </el-form-item>
        <el-form-item label="保质期(月)" prop="warrantyPeriod">
          <el-input-number v-model="form.warrantyPeriod" :min="0" placeholder="请输入保质期，单位：月" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-divider class="cpq-divider"></el-divider>
    <el-form-item label="产品描述" prop="productDesc">
      <el-input v-model="form.productDesc" type="textarea" placeholder="请输入产品描述" :rows="3" />
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
  },
  brandList: {
    type: Array,
    default: () => []
  },
  seriesList: {
    type: Array,
    default: () => []
  },
  catalogTree: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits([])
</script>

<style scoped>
.main-info-container {
  padding: 10px 0;
}

.cpq-select {
  width: 100%;
}

.cpq-radio {
  display: flex;
  gap: 20px;
}

.cpq-divider {
  margin: 20px 0;
}
</style>