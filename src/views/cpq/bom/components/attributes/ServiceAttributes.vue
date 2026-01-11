<template>
  <div class="service-attributes">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="服务编码" prop="serviceCode">
            <el-input v-model="formData.serviceCode" placeholder="请输入服务编码" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务名称" prop="serviceName">
            <el-input v-model="formData.serviceName" placeholder="请输入服务名称" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="服务类型" prop="serviceType">
            <el-select v-model="formData.serviceType" placeholder="请选择服务类型" @change="handleUpdate">
              <el-option label="安装服务" value="installation" />
              <el-option label="维护服务" value="maintenance" />
              <el-option label="培训服务" value="training" />
              <el-option label="技术支持" value="support" />
              <el-option label="延保服务" value="warranty" />
              <el-option label="其他服务" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计费方式" prop="billingMethod">
            <el-select v-model="formData.billingMethod" placeholder="请选择计费方式" @change="handleUpdate">
              <el-option label="一次性收费" value="onetime" />
              <el-option label="按次收费" value="pertime" />
              <el-option label="按月收费" value="monthly" />
              <el-option label="按年收费" value="yearly" />
              <el-option label="按工时收费" value="hourly" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="服务时长" prop="serviceDuration">
            <el-input-number v-model="formData.serviceDuration" :min="0" :step="1" @change="handleUpdate" />
            <span style="margin-left: 8px;">{{ durationUnitLabel }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="时长单位" prop="durationUnit">
            <el-select v-model="formData.durationUnit" placeholder="请选择时长单位" @change="handleUpdate">
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
              <el-option label="月" value="month" />
              <el-option label="年" value="year" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="服务价格" prop="servicePrice">
            <el-input-number v-model="formData.servicePrice" :min="0" :precision="2" :step="0.01" @change="handleUpdate" />
            <span style="margin-left: 8px;">元</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否必选" prop="isRequired">
            <el-switch v-model="formData.isRequired" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="默认数量" prop="defaultQuantity">
            <el-input-number v-model="formData.defaultQuantity" :min="0" :step="1" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量可编辑" prop="isQuantityEditable">
            <el-switch v-model="formData.isQuantityEditable" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="服务范围" prop="serviceScope">
        <el-input v-model="formData.serviceScope" type="textarea" :rows="2" placeholder="请输入服务范围" @change="handleUpdate" />
      </el-form-item>

      <el-form-item label="服务描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入服务描述" @change="handleUpdate" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const formRef = ref(null)
const formData = reactive({
  serviceCode: props.nodeData.nodeCode || '',
  serviceName: props.nodeData.nodeName || '',
  serviceType: props.nodeData.serviceType || 'installation',
  billingMethod: props.nodeData.billingMethod || 'onetime',
  serviceDuration: props.nodeData.serviceDuration || 1,
  durationUnit: props.nodeData.durationUnit || 'year',
  servicePrice: props.nodeData.servicePrice || 0,
  isRequired: props.nodeData.isRequired || '0',
  defaultQuantity: props.nodeData.defaultQuantity || 1,
  isQuantityEditable: props.nodeData.isQuantityEditable || '0',
  serviceScope: props.nodeData.serviceScope || '',
  description: props.nodeData.description || ''
})

const rules = {
  serviceCode: [
    { required: true, message: '请输入服务编码', trigger: 'blur' }
  ],
  serviceName: [
    { required: true, message: '请输入服务名称', trigger: 'blur' }
  ],
  serviceType: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ],
  billingMethod: [
    { required: true, message: '请选择计费方式', trigger: 'change' }
  ],
  servicePrice: [
    { required: true, message: '请输入服务价格', trigger: 'blur' }
  ]
}

const durationUnitLabel = computed(() => {
  const unitMap = {
    'hour': '小时',
    'day': '天',
    'month': '月',
    'year': '年'
  }
  return unitMap[formData.durationUnit] || ''
})

const handleUpdate = () => {
  emit('update', {
    nodeCode: formData.serviceCode,
    nodeName: formData.serviceName,
    serviceType: formData.serviceType,
    billingMethod: formData.billingMethod,
    serviceDuration: formData.serviceDuration,
    durationUnit: formData.durationUnit,
    servicePrice: formData.servicePrice,
    isRequired: formData.isRequired,
    defaultQuantity: formData.defaultQuantity,
    isQuantityEditable: formData.isQuantityEditable,
    serviceScope: formData.serviceScope,
    description: formData.description
  })
}

watch(() => props.nodeData, (newVal) => {
  Object.assign(formData, {
    serviceCode: newVal.nodeCode || '',
    serviceName: newVal.nodeName || '',
    serviceType: newVal.serviceType || 'installation',
    billingMethod: newVal.billingMethod || 'onetime',
    serviceDuration: newVal.serviceDuration || 1,
    durationUnit: newVal.durationUnit || 'year',
    servicePrice: newVal.servicePrice || 0,
    isRequired: newVal.isRequired || '0',
    defaultQuantity: newVal.defaultQuantity || 1,
    isQuantityEditable: newVal.isQuantityEditable || '0',
    serviceScope: newVal.serviceScope || '',
    description: newVal.description || ''
  })
}, { deep: true })
</script>

<style scoped>
.service-attributes {
  padding: 10px;
}
</style>
