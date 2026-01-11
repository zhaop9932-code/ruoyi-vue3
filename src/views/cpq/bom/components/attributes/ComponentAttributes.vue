<template>
  <div class="component-attributes">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="组件编码" prop="componentCode">
            <el-input v-model="formData.componentCode" placeholder="请输入组件编码" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件名称" prop="componentName">
            <el-input v-model="formData.componentName" placeholder="请输入组件名称" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="组件类型" prop="componentType">
            <el-select v-model="formData.componentType" placeholder="请选择组件类型" @change="handleUpdate">
              <el-option label="硬件组件" value="hardware" />
              <el-option label="软件组件" value="software" />
              <el-option label="配件组件" value="accessory" />
              <el-option label="可选组件" value="optional" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择类型" prop="selectionType">
            <el-select v-model="formData.selectionType" placeholder="请选择选择类型" @change="handleUpdate">
              <el-option label="单选" value="single" />
              <el-option label="多选" value="multiple" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="formData.selectionType === 'multiple'" :gutter="20">
        <el-col :span="12">
          <el-form-item label="最少选择数" prop="minSelection">
            <el-input-number v-model="formData.minSelection" :min="0" :step="1" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最多选择数" prop="maxSelection">
            <el-input-number v-model="formData.maxSelection" :min="0" :step="1" @change="handleUpdate" />
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
          <el-form-item label="单位" prop="unit">
            <el-select v-model="formData.unit" placeholder="请选择单位" @change="handleUpdate">
              <el-option label="个" value="个" />
              <el-option label="台" value="台" />
              <el-option label="套" value="套" />
              <el-option label="件" value="件" />
            </el-select>
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

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="启用动态属性" prop="enableDynamicAttributes">
            <el-switch v-model="formData.enableDynamicAttributes" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生成临时料号" prop="generateTempPartNumber">
            <el-switch v-model="formData.generateTempPartNumber" active-value="1" inactive-value="0" @change="handleUpdate" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="组件描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入组件描述" @change="handleUpdate" />
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
  componentCode: props.nodeData.nodeCode || '',
  componentName: props.nodeData.nodeName || '',
  componentType: props.nodeData.componentType || 'hardware',
  selectionType: props.nodeData.selectionType || 'single',
  minSelection: props.nodeData.minSelection || 0,
  maxSelection: props.nodeData.maxSelection || 10,
  defaultQuantity: props.nodeData.defaultQuantity || 1,
  unit: props.nodeData.unit || '个',
  isRequired: props.nodeData.isRequired || '0',
  isQuantityEditable: props.nodeData.isQuantityEditable || '0',
  enableDynamicAttributes: props.nodeData.enableDynamicAttributes || '0',
  generateTempPartNumber: props.nodeData.generateTempPartNumber || '0',
  description: props.nodeData.description || ''
})

const rules = {
  componentCode: [
    { required: true, message: '请输入组件编码', trigger: 'blur' }
  ],
  componentName: [
    { required: true, message: '请输入组件名称', trigger: 'blur' }
  ],
  componentType: [
    { required: true, message: '请选择组件类型', trigger: 'change' }
  ],
  selectionType: [
    { required: true, message: '请选择选择类型', trigger: 'change' }
  ],
  defaultQuantity: [
    { required: true, message: '请输入默认数量', trigger: 'blur' }
  ]
}

const handleUpdate = () => {
  emit('update', {
    nodeCode: formData.componentCode,
    nodeName: formData.componentName,
    componentType: formData.componentType,
    selectionType: formData.selectionType,
    minSelection: formData.minSelection,
    maxSelection: formData.maxSelection,
    defaultQuantity: formData.defaultQuantity,
    unit: formData.unit,
    isRequired: formData.isRequired,
    isQuantityEditable: formData.isQuantityEditable,
    enableDynamicAttributes: formData.enableDynamicAttributes,
    generateTempPartNumber: formData.generateTempPartNumber,
    description: formData.description
  })
}

watch(() => props.nodeData, (newVal) => {
  Object.assign(formData, {
    componentCode: newVal.nodeCode || '',
    componentName: newVal.nodeName || '',
    componentType: newVal.componentType || 'hardware',
    selectionType: newVal.selectionType || 'single',
    minSelection: newVal.minSelection || 0,
    maxSelection: newVal.maxSelection || 10,
    defaultQuantity: newVal.defaultQuantity || 1,
    unit: newVal.unit || '个',
    isRequired: newVal.isRequired || '0',
    isQuantityEditable: newVal.isQuantityEditable || '0',
    enableDynamicAttributes: newVal.enableDynamicAttributes || '0',
    generateTempPartNumber: newVal.generateTempPartNumber || '0',
    description: newVal.description || ''
  })
}, { deep: true })
</script>

<style scoped>
.component-attributes {
  padding: 10px;
}
</style>
