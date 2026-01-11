<template>
  <div class="material-attributes">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="物料编码" prop="materialCode">
            <el-input v-model="formData.materialCode" placeholder="请输入物料编码" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料名称" prop="materialName">
            <el-input v-model="formData.materialName" placeholder="请输入物料名称" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="物料规格" prop="specification">
            <el-input v-model="formData.specification" placeholder="请输入物料规格" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入物料型号" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-select v-model="formData.unit" placeholder="请选择单位" @change="handleUpdate">
              <el-option label="个" value="个" />
              <el-option label="台" value="台" />
              <el-option label="套" value="套" />
              <el-option label="件" value="件" />
              <el-option label="米" value="米" />
              <el-option label="千克" value="千克" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="默认数量" prop="defaultQuantity">
            <el-input-number v-model="formData.defaultQuantity" :min="0" :step="1" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最小数量" prop="minQuantity">
            <el-input-number v-model="formData.minQuantity" :min="0" :step="1" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大数量" prop="maxQuantity">
            <el-input-number v-model="formData.maxQuantity" :min="0" :step="1" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否必选" prop="isRequired">
            <el-switch v-model="formData.isRequired" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量可编辑" prop="isQuantityEditable">
            <el-switch v-model="formData.isQuantityEditable" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="物料描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入物料描述" @change="handleUpdate" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const formRef = ref(null)
const formData = reactive({
  materialCode: props.nodeData.nodeCode || '',
  materialName: props.nodeData.nodeName || '',
  specification: props.nodeData.specification || '',
  model: props.nodeData.model || '',
  unit: props.nodeData.unit || '个',
  defaultQuantity: props.nodeData.defaultQuantity || 1,
  minQuantity: props.nodeData.minQuantity || 0,
  maxQuantity: props.nodeData.maxQuantity || 999,
  isRequired: props.nodeData.isRequired || '0',
  isQuantityEditable: props.nodeData.isQuantityEditable || '0',
  description: props.nodeData.description || ''
})

const rules = {
  materialCode: [
    { required: true, message: '请输入物料编码', trigger: 'blur' }
  ],
  materialName: [
    { required: true, message: '请输入物料名称', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择单位', trigger: 'change' }
  ],
  defaultQuantity: [
    { required: true, message: '请输入默认数量', trigger: 'blur' }
  ]
}

const handleUpdate = () => {
  emit('update', {
    nodeCode: formData.materialCode,
    nodeName: formData.materialName,
    specification: formData.specification,
    model: formData.model,
    unit: formData.unit,
    defaultQuantity: formData.defaultQuantity,
    minQuantity: formData.minQuantity,
    maxQuantity: formData.maxQuantity,
    isRequired: formData.isRequired,
    isQuantityEditable: formData.isQuantityEditable,
    description: formData.description
  })
}

watch(() => props.nodeData, (newVal) => {
  Object.assign(formData, {
    materialCode: newVal.nodeCode || '',
    materialName: newVal.nodeName || '',
    specification: newVal.specification || '',
    model: newVal.model || '',
    unit: newVal.unit || '个',
    defaultQuantity: newVal.defaultQuantity || 1,
    minQuantity: newVal.minQuantity || 0,
    maxQuantity: newVal.maxQuantity || 999,
    isRequired: newVal.isRequired || '0',
    isQuantityEditable: newVal.isQuantityEditable || '0',
    description: newVal.description || ''
  })
}, { deep: true })
</script>

<style scoped>
.material-attributes {
  padding: 10px;
}
</style>
