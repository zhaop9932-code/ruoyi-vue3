<template>
  <div class="attributes-info-container">
    <div class="attributes-management" style="margin-bottom: 20px;">
      <el-alert v-if="!form.catalogId" title="请先选择产品目录" type="warning" :closable="false" />
      <div v-else-if="isLoadingAttributes" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="attributeGroups.length === 0" class="empty-container">
        <el-empty description="暂无产品属性" />
      </div>
      <div v-else class="attribute-forms">
        <el-collapse v-model="activeAttributeGroup">
          <el-collapse-item 
            v-for="group in attributeGroups" 
            :key="group.attributeGroup.attributeGroupId" 
            :name="group.attributeGroup.attributeGroupId"
            :title="group.attributeGroup.attributeGroupName">
            <el-row :gutter="20">
              <el-col :span="12" v-for="attrRelation in group.attributes" :key="attrRelation.relationId">
                <el-form-item :label="attrRelation.attribute.attributeName" :prop="`attribute_${attrRelation.relationId}`">
                  <!-- 所有类型都显示为下拉选择框 -->
                  <el-select
                    v-model="attrRelation.attributeValue"
                    :placeholder="`请选择${attrRelation.attribute.attributeName}`"
                    filterable
                    allow-create
                    default-first-option
                  >
                    <!-- 可选的属性值列表 -->
                    <el-option
                      v-for="option in attrRelation.attributeValues"
                      :key="option.id"
                      :label="option.valueName"
                      :value="option.valueName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { listProductAttributeRelation, batchUpdateProductAttributeRelation, autoIntegrateCatalogAttributes } from '@/api/cpq/product'
import { listAttributeGroupByCatalog } from '@/api/cpq/attributeGroup'
import { listAttributeGroupAttributes } from '@/api/cpq/attributeGroupAttribute'
import { getAttributeGroupAttributeValueByAttributeGroupAttributeId } from '@/api/cpq/attributeGroupAttributeValue'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits([])

// 产品属性相关
const productAttributes = ref([])
const attributeGroups = ref([])
const isLoadingAttributes = ref(false)
const activeAttributeGroup = ref([])

// 获取产品属性列表
const getProductAttributes = async () => {

  isLoadingAttributes.value = true
  try {
    // 如果产品已保存，从产品属性关联中获取
    if (props.form.productId) {
      const res = await listProductAttributeRelation(props.form.productId)
      if (res.code === 200) {
        const attributes = res.data || []
        
        // 按属性组组织属性
        const groups = {}
        attributes.forEach(attrRelation => {
          // 获取属性组ID
          const groupId = attrRelation.attributeGroup?.attributeGroupId || 'default'
          if (!groups[groupId]) {
            groups[groupId] = {
              attributeGroup: attrRelation.attributeGroup || { attributeGroupId: 'default', attributeGroupName: '默认属性组' },
              attributes: []
            }
          }
          groups[groupId].attributes.push(attrRelation)
        })
        
        // 转换为数组
        attributeGroups.value = Object.values(groups)
        productAttributes.value = attributes
        console.log('attributeGroups', attributeGroups.value)
        
        // 默认展开所有属性组
        activeAttributeGroup.value = attributeGroups.value.map(group => group.attributeGroup.attributeGroupId)
        
        // 属性已在组件内部更新，不需要通知父组件
      } else {
        productAttributes.value = []
        attributeGroups.value = []
        ElMessage.error('获取产品属性失败：' + res.msg)
      }
    }
    // 否则从目录获取
    else if (props.form.catalogId) {
      // 1. 根据目录ID获取属性组列表
      const groupRes = await listAttributeGroupByCatalog(props.form.catalogId)
      if (groupRes.code !== 200) {
        productAttributes.value = []
        attributeGroups.value = []
        ElMessage.error('获取属性组失败：' + groupRes.msg)
        return
      }
      
      const groups = groupRes.data || []
      const organizedGroups = []
      
      // 2. 对每个属性组，获取其下的属性列表
      for (const group of groups) {
        const attrRes = await listAttributeGroupAttributes(group.attributeGroupId)
        if (attrRes.code === 200) {
          const attributesWithValues = []
          
          // 3. 对每个属性，获取其属性值列表
          for (const attr of attrRes.data || []) {
            // 获取属性值列表
            const valueRes = await getAttributeGroupAttributeValueByAttributeGroupAttributeId(attr.attributeGroupAttributeId)
            const attributeValues = valueRes.code === 200 ? valueRes.data || [] : []
            
            attributesWithValues.push({
              ...attr,
              attributeValues: attributeValues, // 保存属性值列表
              attributeValue: attr.defaultValue || '' // 设置默认值
            })
          }
          
          organizedGroups.push({
            attributeGroup: group,
            attributes: attributesWithValues
          })
        }
      }
      
      attributeGroups.value = organizedGroups
      console.log('organizedGroups', organizedGroups)
      
      // 转换为产品属性列表格式，用于保存
      const allAttributes = []
      organizedGroups.forEach(group => {
        group.attributes.forEach(attr => {
          allAttributes.push({
            relationId: attr.attributeGroupAttributeId,
            attribute: attr.attribute,
            attributeValue: attr.attributeValue || '',
            attributeValues: attr.attributeValues || [],
            attributeGroup: group.attributeGroup
          })
        })
      })
      
      productAttributes.value = allAttributes
      
      // 默认展开所有属性组
      activeAttributeGroup.value = attributeGroups.value.map(group => group.attributeGroup.attributeGroupId)
      
      // 属性已在组件内部更新，不需要通知父组件
    }
    
  } catch (error) {
    productAttributes.value = []
    attributeGroups.value = []
    ElMessage.error('获取产品属性失败：' + (error.message || '未知错误'))
  } finally {
    isLoadingAttributes.value = false
  }
}

// 暴露方法和属性给父组件
defineExpose({
  refresh: getProductAttributes,
  getProductAttributes: () => productAttributes.value
})

// 监听目录ID变化，自动获取产品属性
watch(
  () => props.form.catalogId,
  (newCatalogId, oldCatalogId) => {
    if (newCatalogId !== oldCatalogId) {
      getProductAttributes()
    }
  }
)

// 监听产品ID变化，自动获取产品属性
watch(
  () => props.form.productId,
  (newProductId, oldProductId) => {
    if (newProductId !== oldProductId && newProductId) {
      getProductAttributes()
    }
  }
)

// 初始化时获取产品属性
onMounted(() => {
  if (props.form.productId || props.form.catalogId) {
    getProductAttributes()
  }
})


</script>

<style scoped>
.attributes-info-container {
  padding: 10px 0;
}

.loading-container {
  padding: 20px 0;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}

.attribute-forms {
  padding: 10px 0;
}
</style>