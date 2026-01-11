<template>
  <div class="attribute-selector">
    <!-- 静态属性选择 -->
  <el-form-item v-if="attributeType === 'static'" :label="label" :required="required">
    <el-select
      v-model="selectedValue"
      :multiple="multiple"
      :placeholder="placeholder"
      :loading="loading"
      :disabled="disabled"
      clearable
      filterable
      style="width: 100%"
      @change="handleChange"
    >
      <el-option
        v-for="item in attributeList"
        :key="item.id"
        :label="item.attributeName"
        :value="String(item.id)"
      />
    </el-select>
  </el-form-item>
    
    <!-- 动态属性选择 -->
    <el-form-item v-else-if="attributeType === 'dynamic'" :label="label" :required="required">
      <el-select
        v-model="selectedValue"
        :multiple="multiple"
        :placeholder="placeholder"
        :loading="loading"
        :disabled="disabled"
        clearable
        filterable
        style="width: 100%"
        @change="handleChange"
      >
        <el-option
          v-for="item in attributeList"
          :key="item.id"
          :label="item.attributeName"
          :value="String(item.id)"
        />
      </el-select>
    </el-form-item>
    
    <!-- 属性值选择 -->
    <el-form-item v-else-if="attributeType === 'attributeValue'" :label="label" :required="required">
      <el-select
        v-model="selectedValue"
        :multiple="multiple"
        :placeholder="placeholder"
        :loading="loading"
        :disabled="disabled"
        clearable
        filterable
        style="width: 100%"
        @change="handleChange"
      >
        <el-option
          v-for="item in attributeValueList"
          :key="item.valueId"
          :label="item.valueName"
          :value="String(item.valueId)"
        />
      </el-select>
    </el-form-item>
    
    <!-- 产品选择 -->
    <el-form-item v-else-if="attributeType === 'product'" :label="label" :required="required">
      <el-select
        v-model="selectedValue"
        :multiple="multiple"
        :placeholder="placeholder"
        :loading="loading"
        :disabled="disabled"
        clearable
        filterable
        style="width: 100%"
        @change="handleChange"
      >
        <el-option
          v-for="item in productList"
          :key="item.productId"
          :label="`${item.relationTypeName} / ${item.relationObjectName  || ''}`"
          :value="String(item.productId)"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listAttributeValue } from '@/api/cpq/product'
import { listSuperBomStructureAttribute, listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId } from '@/api/cpq/bom'
import { listSuperBomDynamicAttribute, getSuperBomDynamicAttributeByBomStructureId } from '@/api/cpq/superBomDynamicAttribute'
import { listSuperBomProductRelation, getSuperBomProductRelationByBomIdAndStructureId } from '@/api/cpq/superBomProductRelation'
import { debounce } from '@/utils/index'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  // 属性类型: static-静态属性, dynamic-动态属性, attributeValue-属性值, product-产品
  attributeType: {
    type: String,
    required: true,
    validator: (value) => ['static', 'dynamic', 'attributeValue', 'product'].includes(value)
  },
  // BOM ID
  bomId: {
    type: [String, Number],
    default: ''
  },
  // 节点ID (用于查询节点下的属性或产品)
  nodeId: {
    type: [String, Number],
    default: ''
  },
  // 结构ID (用于查询属性值)
  structureId: {
    type: [String, Number],
    default: ''
  },
  // 属性ID (用于查询属性值)
  attributeId: {
    type: [String, Number],
    default: ''
  },
  // 属性信息，用于动态属性的attributeValues
  attrInfo: {
    type: Object,
    default: null
  },
  // 动态属性的attributeValues
  dynamicValues: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: '选择'
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const loading = ref(false)
const attributeList = ref([])
const attributeValueList = ref([])
const productList = ref([])

const selectedValue = computed({
  get: () => {
    // 将modelValue转换为字符串，与attributeList中的id类型匹配
    if (props.modelValue === undefined || props.modelValue === null || props.modelValue === '') {
      return props.multiple ? [] : ''
    }
    if (Array.isArray(props.modelValue)) {
      // 处理多选情况，将数组中的每个值转换为字符串
      const validValues = props.modelValue.filter(val => val !== undefined && val !== null && val !== '')
      return validValues.map(val => typeof val === 'string' ? val : String(val))
    }
    const modelValueStr = typeof props.modelValue === 'string' ? props.modelValue : String(props.modelValue)
    
    // 处理空字符串情况
    if (modelValueStr.trim() === '') {
      return props.multiple ? [] : ''
    }
    
    // 处理多选且modelValue是逗号分隔字符串的情况，如"2,3"
    if (props.multiple && modelValueStr.includes(',')) {
      const values = modelValueStr.split(',').map(val => val.trim()).filter(val => val !== '')
      return values
    }
    
    // 处理单选情况或多选但modelValue是单个值的情况
    return props.multiple ? [modelValueStr] : modelValueStr
  },
  set: (value) => emit('update:modelValue', value)
})

// 防抖包装的静态属性加载函数
const debouncedLoadStaticAttributes = debounce(async () => {
  if (!props.nodeId || !props.bomId) return
  
  loading.value = true
  try {
    const response = await listSuperBomStructureAttribute({
      bomId: props.bomId,
      bomStructureId: props.nodeId
    })
    if (response.code === 200) {
      // 处理分页数据结构，获取rows数组
      attributeList.value = response.rows
      // 确保每个属性都有attributeType字段，默认设置为selector
      attributeList.value = attributeList.value.map(attr => ({
        ...attr,
        attributeType: attr.attributeType || 'selector'
      }))
      console.log('静态属性列表:', response)
      
      // 静态属性列表加载完成后，初始化选中的属性
      initSelectedAttr()
    } else {
      ElMessage.error('加载静态属性失败')
    }
  } catch (error) {
    console.error('加载静态属性失败:', error)
    ElMessage.error('加载静态属性失败')
  } finally {
    loading.value = false
  }
}, 300)

// 加载静态属性列表（使用防抖版本）
const loadStaticAttributes = debouncedLoadStaticAttributes

// 防抖包装的动态属性加载函数
const debouncedLoadDynamicAttributes = debounce(async () => {
  if (!props.nodeId) return
  
  loading.value = true
  try {
    const response = await getSuperBomDynamicAttributeByBomStructureId(props.nodeId)
    if (response.code === 200) {
      // 处理分页数据结构，获取rows数组
      attributeList.value = response.data
      // 确保每个属性都有attributeType字段，默认设置为selector
      attributeList.value = attributeList.value.map(attr => ({
        ...attr,
        attributeType: attr.attributeType || 'selector'
      }))
      
      // 动态属性列表加载完成后，初始化选中的属性
      initSelectedAttr()
    } else {
      ElMessage.error('加载动态属性失败')
    }
  } catch (error) {
    console.error('加载动态属性失败:', error)
    ElMessage.error('加载动态属性失败')
  } finally {
    loading.value = false
  }
}, 300)

// 加载动态属性列表（使用防抖版本）
const loadDynamicAttributes = debouncedLoadDynamicAttributes

// 防抖包装的属性值加载函数
const debouncedLoadAttributeValues = debounce(async () => {
  if (!props.attributeId) return
  console.log('props.attributeType:', props.attributeType )
  console.log('props.dynamicValues:', props.dynamicValues )
  console.log('props.attrInfo:', props.attrInfo )
  
  // 只有动态属性才使用dynamicValues，静态属性应该从API获取值
  // 判断是否为动态属性：
  // 1. 静态属性值：应该从API获取，无论是否有dynamicValues
  // 2. 动态属性值：可以使用传入的dynamicValues
  // 关键区别：动态属性的attrInfo通常有attributeValues字段，而静态属性没有
  const isDynamicAttr = props.attributeType === 'attributeValue' && 
                        props.attrInfo && 
                        props.attrInfo.attributeValues && 
                        props.dynamicValues
  
  // 只有动态属性且有attributeValues时，才使用dynamicValues
  // 静态属性值总是从API获取
  if (isDynamicAttr) {
    console.log('使用传入的dynamicValues:', props.dynamicValues)
    console.log('dynamicValues类型:', typeof props.dynamicValues)
    console.log('是否为数组:', Array.isArray(props.dynamicValues))
    
    // 确保dynamicValues是数组
    let dynamicValuesArray = []
    if (Array.isArray(props.dynamicValues)) {
      dynamicValuesArray = props.dynamicValues
    } else if (typeof props.dynamicValues === 'string') {
      // 如果是字符串，尝试解析为数组
      const trimmedStr = props.dynamicValues.trim()
      try {
        // 尝试JSON解析，处理类似 '["304","305"]' 格式的字符串
        const parsed = JSON.parse(trimmedStr)
        if (Array.isArray(parsed)) {
          dynamicValuesArray = parsed
        } else {
          // 解析成功但不是数组，直接返回空数组
          attributeValueList.value = []
          console.log('dynamicValues解析后不是数组，返回空数组')
          return
        }
      } catch (e) {
        // JSON解析失败，尝试用逗号分割
        dynamicValuesArray = trimmedStr.split(',').map(val => val.trim())
      }
    } else {
      // 其他情况，直接返回空数组
      attributeValueList.value = []
      console.log('dynamicValues不是数组，返回空数组')
      return
    }
    
    // 过滤掉undefined、null和空字符串
    const validDynamicValues = dynamicValuesArray.filter(value => value !== undefined && value !== null && value !== '')
    
    if (validDynamicValues.length === 0) {
      attributeValueList.value = []
      console.log('没有有效的dynamicValues，返回空数组')
      return
    }
    
    // 检查dynamicValues是否为字符串数组，如果是则转换为对象数组格式
    if (typeof validDynamicValues[0] === 'string') {
      // 将字符串数组转换为 { valueId, valueName } 格式的对象数组
      attributeValueList.value = validDynamicValues.map((value, index) => ({
        valueId: index + 1,
        valueName: value
      }))
    } else if (typeof validDynamicValues[0] === 'object') {
      // 如果已经是对象数组，则直接使用
      attributeValueList.value = validDynamicValues
    } else {
      // 其他情况，返回空数组
      attributeValueList.value = []
    }
    console.log('转换后的dynamicValues:', attributeValueList.value)
    
    // 属性值列表加载完成后，初始化选中的属性
    initSelectedAttr()
    return
  }
  
  // 确定使用的结构ID，优先使用structureId，如果为空则使用nodeId
  const effectiveStructureId = props.structureId || props.nodeId
  
  console.log('加载属性值：参数信息')
  console.log('props.attributeType:', props.attributeType)
  console.log('props.structureId:', props.structureId)
  console.log('props.nodeId:', props.nodeId)
  console.log('effectiveStructureId:', effectiveStructureId)
  console.log('props.attributeId:', props.attributeId)
  console.log('props.attrInfo:', props.attrInfo)
  console.log('isDynamicAttr:', isDynamicAttr)
  
  // 如果结构ID为空，则不调用API
  if (!effectiveStructureId || !props.attributeId) {
    console.log('结构ID或属性ID为空，不调用API')
    attributeValueList.value = []
    return
  }
  
  // 否则调用API获取属性值
  loading.value = true
  try {
    console.log('调用API获取属性值:', effectiveStructureId, props.attributeId)
    const response = await listSuperBomStructureAttributeValueByBomStructureIdAndAttributeId(effectiveStructureId, props.attributeId)
    console.log('API返回结果:', response)
    if (response.code === 200) {
      // 处理分页数据结构，获取rows数组
      attributeValueList.value = response.rows || response.data
      console.log('处理后的属性值列表:', attributeValueList.value)
      
      // 属性值列表加载完成后，初始化选中的属性
      initSelectedAttr()
    } else {
      ElMessage.error('加载属性值失败')
    }
  } catch (error) {
    console.error('加载属性值失败:', error)
    ElMessage.error('加载属性值失败')
  } finally {
    loading.value = false
  }
}, 300)

// 加载属性值列表（使用防抖版本）
const loadAttributeValues = debouncedLoadAttributeValues

// 防抖包装的产品列表加载函数
const debouncedLoadProducts = debounce(async () => {
  // 初始化产品列表，确保始终有值
  productList.value = []
  
  // 打印modelValue信息，便于调试
  console.log('当前modelValue:', props.modelValue)
  console.log('modelValue类型:', typeof props.modelValue)
  console.log('bomId:', props.bomId)
  console.log('nodeId:', props.nodeId)
  
  // 如果nodeId或bomId为空，直接返回，但已初始化productList
  if (!props.nodeId || !props.bomId) {
    console.log('产品选择：nodeId或bomId为空，无法加载产品列表')
    return
  }
  
  loading.value = true
  try {
    // 使用新的API：根据BOM ID和结构ID查询产品关联
    const response = await getSuperBomProductRelationByBomIdAndStructureId({
      bomId: props.bomId,
      structureId: props.nodeId
    })
    if (response.code === 200) {
      // 处理返回结果，根据API返回格式调整
      let rows = []
      if (Array.isArray(response.data)) {
        // 如果返回的data是数组，直接使用
        rows = response.data
      } else if (response.data && Array.isArray(response.data.rows)) {
        // 如果返回的data有rows属性，使用rows
        rows = response.data.rows
      } else if (response.rows) {
        // 兼容旧格式，使用rows
        rows = response.rows
      }
      
      console.log('原始产品数据:', rows)
      // 确保每个产品对象都有productId字段
      productList.value = rows.map(item => {
        // 从控制台输出可以看到，产品对象有relationObjectId字段，这是实际的产品ID
        const productId = item.relationObjectId
        console.log('产品relationObjectId:', productId)
        return {
          ...item,
          productId: productId
        }
      })
      console.log('处理后的产品列表:', productList.value)
      console.log('产品列表长度:', productList.value.length)
      
      // 产品列表加载完成后，初始化选中的产品
      initSelectedAttr()
    } else {
      ElMessage.error('加载产品失败')
    }
  } catch (error) {
    console.error('加载产品失败:', error)
    ElMessage.error('加载产品失败')
  } finally {
    loading.value = false
  }
}, 300) // 300ms防抖等待时间

// 加载产品列表（使用防抖版本）
const loadProducts = debouncedLoadProducts

// 初始化选中的属性对象
const initSelectedAttr = () => {
  if (!props.modelValue) return
  
  let selectedAttr = null
  let modelValues = []
  
  // 处理字符串类型的modelValue，特别是逗号分隔的多个值，如 "2,3"
  if (typeof props.modelValue === 'string') {
    if (props.modelValue.includes(',')) {
      // 如果是逗号分隔的多个值，转换为数组
      modelValues = props.modelValue.split(',').map(val => val.trim())
    } else {
      // 单个值的字符串
      modelValues = [props.modelValue]
    }
  } else if (Array.isArray(props.modelValue)) {
    // 数组类型的modelValue
    modelValues = props.modelValue
  } else {
    // 其他类型，转换为数组
    modelValues = [props.modelValue]
  }
  
  console.log('处理后的modelValues:', modelValues)
  
  switch (props.attributeType) {
    case 'static':
      // 处理静态属性
      selectedAttr = modelValues.map(val => attributeList.value.find(item => String(item.id) === String(val))).filter(Boolean)
      if (selectedAttr.length === 1 && !Array.isArray(props.modelValue)) {
        selectedAttr = selectedAttr[0]
      }
      break
    case 'dynamic':
      // 处理动态属性
      selectedAttr = modelValues.map(val => attributeList.value.find(item => String(item.id) === String(val))).filter(Boolean)
      if (selectedAttr.length === 1 && !Array.isArray(props.modelValue)) {
        selectedAttr = selectedAttr[0]
      }
      break
    case 'attributeValue':
      // 处理属性值
      selectedAttr = modelValues.map(val => attributeValueList.value.find(item => String(item.valueId) === String(val))).filter(Boolean)
      if (selectedAttr.length === 1 && !Array.isArray(props.modelValue)) {
        selectedAttr = selectedAttr[0]
      }
      break
    case 'product':
      // 处理产品选择
      selectedAttr = modelValues.map(val => {
        return productList.value.find(item => String(item.productId) === String(val))
      }).filter(Boolean)
      
      // 如果只有一个选中对象，返回单个对象而不是数组
      if (selectedAttr.length === 1 && !Array.isArray(props.modelValue)) {
        selectedAttr = selectedAttr[0]
      }
      break
  }
  console.log(`初始化选中的${props.attributeType}属性:`, selectedAttr)
  // 触发change事件，将选中的属性对象传递给父组件
  emit('change', props.modelValue, selectedAttr)
}

// 处理选择变化
const handleChange = (value) => {
  // 找到选中的属性对象
  let selectedAttr = null
  if (props.attributeType === 'static') {
    // 处理单选和多选情况
    if (Array.isArray(value)) {
      // 多选情况，返回所有选中的对象
      selectedAttr = value.map(val => attributeList.value.find(item => String(item.id) === val)).filter(Boolean)
    } else {
      // 单选情况，返回单个选中对象
      selectedAttr = attributeList.value.find(item => String(item.id) === value)
    }
  } else if (props.attributeType === 'dynamic') {
    // 处理单选和多选情况
    if (Array.isArray(value)) {
      selectedAttr = value.map(val => attributeList.value.find(item => String(item.id) === val)).filter(Boolean)
    } else {
      selectedAttr = attributeList.value.find(item => String(item.id) === value)
    }
  } else if (props.attributeType === 'attributeValue') {
    // 处理属性值选择
    if (Array.isArray(value)) {
      selectedAttr = value.map(val => attributeValueList.value.find(item => String(item.valueId) === val)).filter(Boolean)
    } else {
      selectedAttr = attributeValueList.value.find(item => String(item.valueId) === value)
    }
  } else if (props.attributeType === 'product') {
    // 处理产品选择
    console.log('产品选择值:', value)
    console.log('产品列表:', productList.value)
    if (Array.isArray(value)) {
      selectedAttr = value.map(val => {
        const found = productList.value.find(item => String(item.productId) === val)
        console.log('找到的产品:', found)
        return found
      }).filter(Boolean)
      console.log('多选时选中的产品:', selectedAttr)
    } else {
      selectedAttr = productList.value.find(item => String(item.productId) === value)
      console.log('单选时选中的产品:', selectedAttr)
    }
  }
  emit('change', value, selectedAttr)
}

// 加载数据
const loadData = () => {
  switch (props.attributeType) {
    case 'static':
      loadStaticAttributes()
      break
    case 'dynamic':
      loadDynamicAttributes()
      break
    case 'attributeValue':
      loadAttributeValues()
      break
    case 'product':
      console.log('产品选择参数:', props)
      loadProducts()
      break
  }
}

// 监听相关参数变化
watch(() => [props.attributeType, props.nodeId, props.attributeId, props.dynamicValues], () => {
  loadData()
}, { immediate: true, deep: true })

// 监听modelValue变化，确保selectedValue能够正确初始化
watch(() => props.modelValue, (newValue) => {
  console.log('modelValue变化:', newValue)
  // 当modelValue变化时，重新加载数据，确保选项列表与选中值匹配
  loadData()
}, { immediate: true })
</script>

<style scoped>
.attribute-selector {
  width: 100%;
}
</style>
