<template>
  <div class="price-info-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="基准价格" prop="basePrice">
          <el-input v-model="form.basePrice" type="number" placeholder="请输入基准价格（非必填）" />
        </el-form-item>
        <el-form-item label="价格单位" prop="priceUnit">
          <el-select v-model="form.priceUnit" placeholder="请选择价格单位" class="cpq-select">
            <el-option label="元" value="CNY" />
            <el-option label="美元" value="USD" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本价格" prop="costPrice">
          <el-input v-model="form.costPrice" type="number" placeholder="请输入成本价格（非必填）" />
        </el-form-item>
        <el-form-item label="价格类型" prop="priceType">
          <el-select v-model="form.priceType" placeholder="请选择价格类型" class="cpq-select">
            <el-option label="标准价" value="0" />
            <el-option label="促销价" value="1" />
            <el-option label="客户价" value="2" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="最小销售价格" prop="minSalesPrice">
          <el-input v-model="form.minSalesPrice" type="number" placeholder="请输入最小销售价格（非必填）" />
        </el-form-item>
        <el-form-item label="最大销售价格" prop="maxSalesPrice">
          <el-input v-model="form.maxSalesPrice" type="number" placeholder="请输入最大销售价格（非必填）" />
        </el-form-item>
        <el-form-item label="建议零售价" prop="suggestedRetailPrice">
          <el-input v-model="form.suggestedRetailPrice" type="number" placeholder="请输入建议零售价（非必填）" />
        </el-form-item>
        <el-form-item label="货币类型" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择货币类型" class="cpq-select">
            <el-option 
              v-for="item in currencyOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
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
import { ref, reactive, watch, computed, getCurrentInstance, onMounted } from 'vue'
import { addProductPrice, updateProductPrice, listProductPrice } from '@/api/cpq/pricing'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  productId: {
    type: [Number, String],
    default: null
  }
})

// 定义事件
const emit = defineEmits(['update:form', 'price-saved'])

// 获取当前组件实例
const { proxy } = getCurrentInstance()

// 使用useDict获取货币类型字典数据
const { sys_currency } = proxy.useDict('sys_currency')

// 货币类型选项
const currencyOptions = ref([])

// 监听字典数据变化
watch(sys_currency, (newVal) => {
  currencyOptions.value = newVal || []
}, { immediate: true })

// 获取产品价格信息
const fetchProductPriceInfo = async () => {
  if (!props.productId) {
    return
  }
  
  try {
    // 查询产品价格列表
    const response = await listProductPrice({
      productId: props.productId,
      pageNum: 1,
      pageSize: 10
    })
    
    if (response && response.rows && response.rows.length > 0) {
      // 获取最新的有效价格（这里假设列表已按生效日期排序，第一个为最新）
      const latestPrice = response.rows[0]
      
      // 更新表单数据
      const updatedForm = {
        ...props.form,
        priceId: latestPrice.priceId,
        basePrice: latestPrice.basePrice,
        priceUnit: latestPrice.priceUnit,
        costPrice: latestPrice.costPrice,
        minSalesPrice: latestPrice.minSalesPrice,
        maxSalesPrice: latestPrice.maxSalesPrice,
        suggestedRetailPrice: latestPrice.suggestedRetailPrice,
        priceType: latestPrice.priceType,
        currency: latestPrice.currency,
        priceValidityPeriod: latestPrice.priceValidityPeriod
      }
      
      emit('update:form', updatedForm)
    }
  } catch (error) {
    console.error('获取产品价格信息失败:', error)
    ElMessage.error('获取产品价格信息失败：' + (error.message || '未知错误'))
  }
}

// 监听产品ID变化，自动获取价格信息
watch(
  () => props.productId,
  (newProductId) => {
    if (newProductId) {
      fetchProductPriceInfo()
    }
  },
  { immediate: true }
)

// 暴露方法给父组件
defineExpose({
  handlePriceSave,
  fetchProductPriceInfo
})

// 价格数据结构处理
const handlePriceSave = async () => {
  // 验证产品ID是否存在
  if (!props.productId) {
    ElMessage.error('产品ID不存在，无法保存价格信息')
    return false
  }
  
  // 准备价格数据
  const priceData = {
    productId: Number(props.productId),
    basePrice: props.form.basePrice,
    priceUnit: props.form.priceUnit,
    costPrice: props.form.costPrice,
    minSalesPrice: props.form.minSalesPrice,
    maxSalesPrice: props.form.maxSalesPrice,
    suggestedRetailPrice: props.form.suggestedRetailPrice,
    priceType: props.form.priceType,
    currency: props.form.currency,
    // 处理价格有效期
    priceValidityPeriod: props.form.priceValidityPeriod
  }
  
  // 数据验证
  if (!priceData.basePrice && !priceData.costPrice && !priceData.minSalesPrice && 
      !priceData.maxSalesPrice && !priceData.suggestedRetailPrice) {
    // 如果没有填写任何价格字段，不执行保存
    ElMessage.warning('没有填写任何价格信息，跳过保存')
    return true
  }
  
  try {
    let res
    if (props.form.priceId && Number(props.form.priceId) > 0) {
      // 有有效的价格ID，执行更新操作
      priceData.priceId = Number(props.form.priceId)
      res = await updateProductPrice(priceData)
      ElMessage.success('价格更新成功')
    } else {
      // 无有效价格ID，执行新增操作
      res = await addProductPrice(priceData)
      ElMessage.success('价格新增成功')
      // 将新生成的价格ID返回给父组件
      emit('update:form', {
        ...props.form,
        priceId: res.data
      })
    }
    
    // 触发价格保存成功事件
    emit('price-saved', res.data)
    return true
  } catch (error) {
    console.error('保存价格失败:', error)
    ElMessage.error('保存价格失败：' + (error.message || '未知错误'))
    return false
  }
}
</script>

<style scoped>
.price-info-container {
  padding: 10px 0;
}

.cpq-select {
  width: 100%;
}
</style>