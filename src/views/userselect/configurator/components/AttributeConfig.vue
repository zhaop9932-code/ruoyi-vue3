<template>
  <div class="attribute-config">
    <!-- 空状态 -->
    <div v-if="!props.currentNode" class="empty-state">
      <el-empty description="请在左侧选择要配置的节点">
        <template #image>
          <el-icon :size="48" color="#c0c4cc">
            <Box />
          </el-icon>
        </template>
      </el-empty>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="attributeGroups.length === 0 && relatedProducts.length === 0" class="loading-state">
      <el-empty description="加载中...">
        <template #image>
          <el-icon class="loading-icon" :size="48" color="#409eff">
            <Loading />
          </el-icon>
        </template>
      </el-empty>
    </div>
    
    <!-- 配置内容 -->
    <div v-else class="config-content">
      <!-- 属性配置表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="attribute-form"
      >
        <!-- 基本配置 - 数量 -->
       

        <!-- 属性组配置 -->
        <div
          v-for="group in attributeGroups"
          :key="group.groupId"
          class="form-section attribute-group"
        >
          <div class="section-header">
            <h3>{{ group.groupName }}</h3>
            <span v-if="group.groupDesc" class="section-desc">{{ group.groupDesc }}</span>
          </div>
          
          <el-row :gutter="20">
            <!-- 动态渲染不同类型的输入组件 -->
            <el-col
              v-for="attr in group.attributes"
              :key="attr.attributeId"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item
                :label="attr.attributeName"
                :prop="`attrs.${attr.attributeCode}`"
                :required="attr.isRequired === '1'"
                class="attribute-item"
              >
                <!-- 非选择类型组件 -->
                <template v-if="!['select', 'multi', 'radio', 'checkbox'].includes(attr.componentType)">
                  <component
                    :is="getAttributeComponent(attr)"
                    v-model="formData.attrs[attr.attributeCode]"
                    v-bind="getComponentProps(attr)"
                    @change="handleAttributeChange(attr)"
                    size="large"
                  ></component>
                </template>
                
                <!-- 选择类型组件 -->
                <template v-else>
                  <!-- 单选框组 -->
                  <el-radio-group
                    v-if="getAttributeComponent(attr) === 'el-radio-group'"
                    v-model="formData.attrs[attr.attributeCode]"
                    v-bind="getComponentProps(attr)"
                    @change="handleAttributeChange(attr)"
                    size="large"
                  >
                    <el-radio
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-radio>
                  </el-radio-group>
                  
                  <!-- 多选框组 -->
                  <el-checkbox-group
                    v-else-if="getAttributeComponent(attr) === 'el-checkbox-group'"
                    v-model="formData.attrs[attr.attributeCode]"
                    v-bind="getComponentProps(attr)"
                    @change="handleAttributeChange(attr)"
                    size="large"
                  >
                    <el-checkbox
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                  
                  <!-- 选择框 -->
                  <el-select
                    v-else
                    v-model="formData.attrs[attr.attributeCode]"
                    v-bind="getComponentProps(attr)"
                    @change="handleAttributeChange(attr)"
                    size="large"
                  >
                    <el-option
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueName || option.name || option.label"
                      :value="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-option>
                  </el-select>
                </template>
                
                <!-- 校验错误提示 -->
                <div
                  v-if="validationErrors[attr.attributeId]"
                  class="attr-error"
                >
                  <el-icon><WarningFilled /></el-icon>
                  <span>{{ validationErrors[attr.attributeId] }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 统一的属性与搜索条件表单 -->
        <div v-if="relatedProducts.length > 0 || dynamicAttributes.length > 0" class="form-section unified-attribute-section">
          <div class="section-header">
            <h3>配置属性</h3>
            <span class="section-desc">根据需求配置产品属性</span>
          </div>
          
          <el-row :gutter="20">
            <!-- 合并后的属性列表：搜索条件 + 动态属性 -->
            <!-- 产品型号搜索 -->
            <el-col
              v-if="relatedProducts.length > 0"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item
                label="产品型号"
                class="attribute-item"
              >
                <el-input
                  v-model="productSearchForm.productModel"
                  placeholder="输入产品型号"
                  clearable
                  @input="handleProductSearch"
                  size="large"
                />

              </el-form-item>
            </el-col>
            
            <!-- 品牌搜索 -->
            <el-col
              v-if="relatedProducts.length > 0"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item
                label="品牌"
                class="attribute-item"
              >
                <el-select
                  v-model="productSearchForm.brand"
                  placeholder="选择品牌"
                  clearable
                  @change="handleProductSearch"
                  size="large"
                >
                  <el-option
                    v-for="brand in availableBrands"
                    :key="brand"
                    :label="brand"
                    :value="brand"
                  />
                </el-select>

              </el-form-item>
            </el-col>
            
            <!-- 系列搜索 -->
            <el-col
              v-if="relatedProducts.length > 0"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item
                label="系列"
                class="attribute-item"
              >
                <el-select
                  v-model="productSearchForm.series"
                  placeholder="选择系列"
                  clearable
                  @change="handleProductSearch"
                  size="large"
                >
                  <el-option
                    v-for="series in availableSeries"
                    :key="series"
                    :label="series"
                    :value="series"
                  />
                </el-select>

              </el-form-item>
            </el-col>
            <!-- 动态属性 -->
            <el-col
              v-for="attr in dynamicAttributes"
              :key="attr.attributeId"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-form-item
                :label="attr.attributeName"
                :prop="`dynamicAttrs.${attr.attributeId}`"
                :required="attr.isRequired === '1'"
                class="attribute-item"
              >
                <!-- 非选择类型组件 -->
                <template v-if="!['select', 'multi', 'radio', 'checkbox'].includes(attr.componentType)">
                  <component
                    :is="getAttributeComponent(attr)"
                    v-model="formData.dynamicAttrs[attr.attributeId]"
                    v-bind="getComponentProps(attr)"
                    @change="handleDynamicAttributeChange(attr)"
                    size="large"
                  ></component>
                </template>
                
                <!-- 选择类型组件 -->
                <template v-else>
                  <!-- 单选框组 -->
                  <el-radio-group
                    v-if="getAttributeComponent(attr) === 'el-radio-group'"
                    v-model="formData.dynamicAttrs[attr.attributeId]"
                    v-bind="getComponentProps(attr)"
                    @change="handleDynamicAttributeChange(attr)"
                    size="large"
                  >
                    <el-radio
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-radio>
                  </el-radio-group>
                  
                  <!-- 多选框组 -->
                  <el-checkbox-group
                    v-else-if="getAttributeComponent(attr) === 'el-checkbox-group'"
                    v-model="formData.dynamicAttrs[attr.attributeId]"
                    v-bind="getComponentProps(attr)"
                    @change="handleDynamicAttributeChange(attr)"
                    size="large"
                  >
                    <el-checkbox
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                  
                  <!-- 选择框 -->
                  <el-select
                    v-else
                    v-model="formData.dynamicAttrs[attr.attributeId]"
                    v-bind="getComponentProps(attr)"
                    @change="handleDynamicAttributeChange(attr)"
                    size="large"
                  >
                    <el-option
                      v-for="option in parseAndFilterAttributeValues(attr, attr.attributeValues)"
                      :key="option.valueId || option.id || option.valueCode || option.code"
                      :label="option.valueName || option.name || option.label"
                      :value="option.valueCode || option.code || option.value"
                    >
                      {{ option.valueName || option.name || option.label }}
                    </el-option>
                  </el-select>
                </template>
                

                
                <!-- 校验错误提示 -->
                <div
                  v-if="validationErrors[attr.attributeId]"
                  class="attr-error"
                >
                  <el-icon><WarningFilled /></el-icon>
                  <span>{{ validationErrors[attr.attributeId] }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 产品选择（如果节点关联了产品） -->
        <div v-if="relatedProducts.length > 0" class="form-section product-selection">
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24">
              <el-form-item
                label="选择产品"
                :validate-status="validateStatus"
                :error="validateError"
              >
                <!-- 卡片形式展示 (≤6个产品) -->
                <div v-if="filteredProducts.length <= 6" class="product-card-container">
                  <div
                    v-for="product in filteredProducts"
                    :key="product.relationObjectId"
                    class="product-card"
                    :class="{ 'selected': (props.currentNode.selectionType === 'multiple' ? formData.selectedProductIds.includes(product.relationObjectId) : formData.selectedProductId === product.relationObjectId) }"
                    @click="selectProduct(product)"
                  >
                    <div class="card-header">
                      <div class="product-title">{{ product.relationObjectName }}</div>
                      <div class="product-meta">
                        <span class="brand-tag">{{ product.brandInfo?.brandName || '未知品牌' }}</span>
                        <span class="series-tag">{{ product.seriesInfo?.seriesName || '未知系列' }}</span>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="product-info">
                        <div class="info-item">
                          <span class="info-label">型号：</span>
                          <span class="info-value">{{ product.productInfo?.productModel || '无型号' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">分类：</span>
                          <span class="info-value">{{ product.catalogInfo?.catalogName || '未知分类' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <el-input-number
                        v-model="formData.productQuantities[product.relationObjectId]"
                        :min="props.currentNode.minQuantity || 1"
                        :max="props.currentNode.maxQuantity || 9999"
                        :step="1"
                        @change="(value) => handleQuantityChange(product.relationObjectId, value)"
                        size="small"
                        @click.stop
                        style="margin-right: 12px;"
                      />
                      <div class="selection-control">
                        <!-- 单选模式使用单选框 -->
                        <el-radio
                          v-if="props.currentNode.selectionType === 'single'"
                          v-model="formData.selectedProductId"
                          :label="product.relationObjectId"
                          @change="async (value) => {
                            // 更新selectedProductIds以保持一致性
                            formData.selectedProductIds = value ? [value] : []
                            await handleProductChange(value)
                          }"
                          @click.stop
                          size="small"
                        >
                          选择
                        </el-radio>
                        <!-- 多选模式使用复选框 -->
                        <el-checkbox
                          v-else
                          v-model="formData.selectedProductIds"
                          :label="product.relationObjectId"
                          @change="async () => {
                            // 根据复选框的选中状态决定是选中还是取消选中
                            const isSelected = formData.selectedProductIds.includes(product.relationObjectId)
                            await handleProductChange(isSelected ? product.relationObjectId : null)
                          }"
                          @click.stop
                          size="small"
                        >
                          选择
                        </el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 分页列表展示 (>6个产品) -->
                <div v-else class="product-table-container">
                  <!-- 多选模式 -->
                  <template v-if="props.currentNode.selectionType === 'multiple'">
                    <el-table
                      :data="filteredPaginatedProducts"
                      :row-class-name="({ row }) => formData.selectedProductIds.includes(row.relationObjectId) ? 'selected-row' : ''"
                      :row-selection="{ selectedRowKeys: formData.selectedProductIds, onChange: handleTableSelectionChange }"
                      size="small"
                      style="width: 100%; margin-bottom: 12px"
                      @row-click="selectProduct"
                    >
                      <el-table-column type="selection" width="55" />
                      <el-table-column prop="relationObjectName" label="产品名称" width="200" />
                      <el-table-column label="品牌" width="120">
                        <template #default="scope">{{ scope.row.brandInfo?.brandName || '未知品牌' }}</template>
                      </el-table-column>
                      <el-table-column label="系列" width="120">
                        <template #default="scope">{{ scope.row.seriesInfo?.seriesName || '未知系列' }}</template>
                      </el-table-column>
                      <el-table-column label="型号" width="180">
                        <template #default="scope">{{ scope.row.productInfo?.productModel || '无型号' }}</template>
                      </el-table-column>
                      <el-table-column label="产品代码" width="180">
                        <template #default="scope">{{ scope.row.productInfo?.productCode || '无代码' }}</template>
                      </el-table-column>
                      <el-table-column label="分类" width="120">
                        <template #default="scope">{{ scope.row.catalogInfo?.catalogName || '未知分类' }}</template>
                      </el-table-column>
                    </el-table>
                  </template>
                  
                  <!-- 单选模式 -->
                  <template v-else>
                    <el-table
                      :data="filteredPaginatedProducts"
                      :row-class-name="({ row }) => row.relationObjectId === formData.selectedProductId ? 'selected-row' : ''"
                      size="small"
                      style="width: 100%; margin-bottom: 12px"
                      @row-click="selectProduct"
                    >
                      <el-table-column prop="relationObjectName" label="产品名称" width="200" />
                      <el-table-column label="品牌" width="120">
                        <template #default="scope">{{ scope.row.brandInfo?.brandName || '未知品牌' }}</template>
                      </el-table-column>
                      <el-table-column label="系列" width="120">
                        <template #default="scope">{{ scope.row.seriesInfo?.seriesName || '未知系列' }}</template>
                      </el-table-column>
                      <el-table-column label="型号" width="180">
                        <template #default="scope">{{ scope.row.productInfo?.productModel || '无型号' }}</template>
                      </el-table-column>
                      <el-table-column label="产品代码" width="180">
                        <template #default="scope">{{ scope.row.productInfo?.productCode || '无代码' }}</template>
                      </el-table-column>
                      <el-table-column label="分类" width="120">
                        <template #default="scope">{{ scope.row.catalogInfo?.catalogName || '未知分类' }}</template>
                      </el-table-column>
                    </el-table>
                  </template>
                  
                  <el-pagination
                    v-model:current-page="productPage.currentPage"
                    v-model:page-size="productPage.pageSize"
                    :page-sizes="[10, 20]"
                    layout="total, prev, pager, next"
                    :total="relatedProducts.length"
                    @size-change="handleProductPageChange"
                    @current-change="handleProductPageChange"
                    size="small"
                    style="margin-top: 8px; text-align: right"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { QuestionFilled, WarningFilled, Box, Setting, Service, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useConfiguratorStore from '@/store/modules/configurator'
import { 
  listSuperBomStructureAttributeByBomStructureId
} from '@/api/cpq/bom'
import { 
  getSuperBomProductRelationByBomIdAndStructureId
} from '@/api/cpq/superBomProductRelation'
import { 
  getSuperBomDynamicAttributeByBomStructureId
} from '@/api/cpq/superBomDynamicAttribute'

const props = defineProps({
  currentNode: {
    type: Object,
    default: null
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['config-confirm'])

const configuratorStore = useConfiguratorStore()
const formRef = ref()
const formData = ref({
  selectedProductId: null,
  selectedProductIds: [], // 用于多选产品
  productQuantities: {}, // 用于存储每个产品的独立数量 { productId: quantity }
  attrs: {},
  dynamicAttrs: {} // 动态属性数据
})
const formRules = ref({})
const validationErrors = ref({})
const attributeGroups = ref([])
const relatedProducts = ref([])
const dynamicAttributes = ref([]) // 动态属性列表
const saving = ref(false)
// 自定义表单验证状态
const validateStatus = ref('')
const validateError = ref('')

// 重置表单数据
const resetFormData = () => {
  formData.value = {
    selectedProductId: null,
    selectedProductIds: [],
    productQuantities: {},
    attrs: {},
    dynamicAttrs: {}
  }
  formRules.value = {}
  validationErrors.value = {}
  attributeGroups.value = []
  relatedProducts.value = []
  dynamicAttributes.value = []
  validateStatus.value = ''
  validateError.value = ''
}

// 产品搜索表单
const productSearchForm = ref({
  productModel: '',
  brand: '',
  series: ''
})

// 过滤后的产品列表
const filteredProducts = computed(() => {
  let result = [...relatedProducts.value]
  
  // 产品型号搜索
  if (productSearchForm.value.productModel) {
    const model = productSearchForm.value.productModel.toLowerCase()
    result = result.filter(product => 
      product.productInfo?.productModel?.toLowerCase().includes(model) || 
      product.relationObjectName?.toLowerCase().includes(model)
    )
  }
  
  // 品牌搜索
  if (productSearchForm.value.brand) {
    result = result.filter(product => 
      product.brandInfo?.brandName === productSearchForm.value.brand
    )
  }
  
  // 系列搜索
  if (productSearchForm.value.series) {
    result = result.filter(product => 
      product.seriesInfo?.seriesName === productSearchForm.value.series
    )
  }
  
  // 动态参数筛选
  const dynamicAttrs = formData.value.dynamicAttrs
  if (dynamicAttrs && typeof dynamicAttrs === 'object') {
    Object.entries(dynamicAttrs).forEach(([attrId, attrValue]) => {
      // 只处理非空的属性值
      if (attrValue !== null && attrValue !== undefined && attrValue !== '') {
        console.log(`应用动态参数筛选: ${attrId} = ${attrValue}`)
        console.log(`筛选前产品数量: ${result.length}`)
        
        result = result.filter(product => {
          // 检查产品是否有属性信息
          if (!product.productInfo) {
            console.log(`产品${product.relationObjectId}没有productInfo`)
            return false
          }
          
          // 根据产品属性的结构进行不同处理
          if (Array.isArray(product.productInfo.attributes)) {
            // 处理 productInfo.attributes 数组结构
            // 确保attributeId比较时类型一致
            const stringAttrId = String(attrId)
            
            // 1. 匹配产品属性ID与筛选条件中指定的属性ID
            const productAttr = product.productInfo.attributes.find(attr => {
              // 确保属性ID类型一致后再比较
              return String(attr.attributeId) === stringAttrId
            })
            
            // 如果找不到匹配的属性ID，跳过该产品
            if (!productAttr) {
              console.log(`产品${product.relationObjectId}没有找到属性${stringAttrId}`)
              return false
            }
            
            // 2. 获取产品在该属性ID下的属性值
            const productAttrValue = productAttr.attributeValue
            console.log(`产品${product.relationObjectId}的属性${stringAttrId}值:`, productAttrValue)
            
            // 3. 容错处理：确保属性值是字符串类型
            const productValue = String(productAttrValue).trim()
            const selectedValue = String(attrValue).trim()
            
            console.log(`比较属性值: 产品值="${productValue}", 选中值="${selectedValue}"`)
            
            // 4. 严格基于属性ID关联的属性值进行精确匹配过滤
            let isMatch = false
            
            if (Array.isArray(attrValue)) {
              // 多选情况：检查产品属性值是否包含在用户选择的属性值列表中
              isMatch = attrValue.some(value => {
                const stringValue = String(value).trim()
                // 精确匹配
                return productValue === stringValue
              })
            } else {
              // 单选情况：精确匹配产品属性值和用户选择的属性值
              isMatch = productValue === selectedValue
            }
            
            console.log(`产品${product.relationObjectId}是否匹配:`, isMatch, `产品值: "${productValue}", 选中值: "${selectedValue}"`)
            return isMatch
          } else {
            // 不支持直接键值对结构，跳过该产品
            console.log(`产品${product.relationObjectId}的productInfo结构不支持:`, product.productInfo)
            return false
          }
        })
        
        console.log(`筛选后产品数量: ${result.length}`)
      }
    })
  }
  
  return result
})

// 可用品牌列表（去重）
const availableBrands = computed(() => {
  const brands = new Set()
  relatedProducts.value.forEach(product => {
    if (product.brandInfo?.brandName) {
      brands.add(product.brandInfo.brandName)
    }
  })
  return Array.from(brands).sort()
})

// 可用系列列表（去重）
const availableSeries = computed(() => {
  const series = new Set()
  relatedProducts.value.forEach(product => {
    if (product.seriesInfo?.seriesName) {
      series.add(product.seriesInfo.seriesName)
    }
  })
  return Array.from(series).sort()
})

// 产品分页数据
const productPage = ref({
  currentPage: 1,
  pageSize: 10
})

// 分页产品数据（未过滤）
const paginatedProducts = computed(() => {
  const start = (productPage.value.currentPage - 1) * productPage.value.pageSize
  const end = start + productPage.value.pageSize
  return relatedProducts.value.slice(start, end)
})

// 过滤后的分页产品数据
const filteredPaginatedProducts = computed(() => {
  const start = (productPage.value.currentPage - 1) * productPage.value.pageSize
  const end = start + productPage.value.pageSize
  return filteredProducts.value.slice(start, end)
})

// 处理产品搜索
const handleProductSearch = () => {
  // 搜索时重置分页
  productPage.value.currentPage = 1
}

// 重置产品搜索
const resetProductSearch = () => {
  productSearchForm.value = {
    productModel: '',
    brand: '',
    series: ''
  }
  
  // 重置动态属性值
  formData.value.dynamicAttrs = {}
  
  productPage.value.currentPage = 1
}

// 选择产品（用于卡片和表格）
const selectProduct = async (product) => {
  if (props.currentNode.selectionType === 'multiple') {
    // 多选模式
    const index = formData.value.selectedProductIds.indexOf(product.relationObjectId)
    if (index > -1) {
      // 取消选择
      formData.value.selectedProductIds.splice(index, 1)
      // 调用handleProductChange更新store，传递null表示取消选中
      await handleProductChange(null)
    } else {
      // 添加选择
      formData.value.selectedProductIds.push(product.relationObjectId)
      // 调用handleProductChange更新store
      await handleProductChange(product.relationObjectId)
    }
  } else {
    // 单选模式 - 支持再次点击取消选中
    if (formData.value.selectedProductId === product.relationObjectId) {
      // 如果点击的是已选中的产品，则取消选中
      formData.value.selectedProductId = null
      formData.value.selectedProductIds = []
      // 调用handleProductChange更新store，传递null表示取消选中
      await handleProductChange(null)
    } else {
      // 选择新的产品
      formData.value.selectedProductId = product.relationObjectId
      // 单选模式下selectedProductIds数组只存储当前选中的产品ID
      formData.value.selectedProductIds = [product.relationObjectId]
      // 调用handleProductChange更新store
      await handleProductChange(product.relationObjectId)
    }
  }
}

// 处理表格选择变化
const handleTableSelectionChange = async (selection, selectedRowKeys) => {
  if (props.currentNode.selectionType === 'single') {
    if (selectedRowKeys.length > 1) {
      // 单选模式下只保留第一个选中的产品
      selectedRowKeys = [selectedRowKeys[0]]
    }
    // 更新selectedProductId
    formData.value.selectedProductId = selectedRowKeys.length > 0 ? selectedRowKeys[0] : null
    formData.value.selectedProductIds = selectedRowKeys
    // 调用handleProductChange更新store
    await handleProductChange(formData.value.selectedProductId)
  } else {
    // 多选模式
    formData.value.selectedProductIds = selectedRowKeys
    // 调用handleProductChange更新store
    await handleProductChange(null)
  }
}

// 处理产品分页变化
const handleProductPageChange = () => {
  // 分页变化时，重置选择
  if (props.currentNode.selectionType === 'multiple') {
    formData.value.selectedProductIds = []
  } else {
    formData.value.selectedProductId = null
  }
}

// 获取节点图标
const getNodeIcon = (node) => {
  const iconMap = {
    '0': Box,
    '1': Setting,
    '2': Service
  }
  return iconMap[node.nodeType] || Box
}

// 动态获取属性组件
const getAttributeComponent = (attr) => {
  // 组件类型映射，仅使用componentType
  const componentMap = {
    'input': 'el-input',
    'input-number': 'el-input-number',
    'select': 'el-select',
    'radio': 'el-radio-group',
    'checkbox': 'el-checkbox-group',
    'date-picker': 'el-date-picker',
    'slider': 'el-slider',
    'switch': 'el-switch',
    'color-picker': 'el-color-picker'
  }
  
  // 仅使用componentType字段
  const componentKey = attr.componentType
  return componentMap[componentKey] || 'el-input'
}

// 获取选项组件
const getOptionComponent = (type) => {
  const componentMap = {
    select: 'el-option',
    multi: 'el-option',
    radio: 'el-radio',
    checkbox: 'el-checkbox'
  }
  return componentMap[type] || 'el-option'
}

// 收集当前产品列表中所有产品的属性值集合，用于动态属性过滤
// 返回一个以attributeCode为键，以属性值集合为值的对象
const getAvailableAttributeValues = () => {
  const availableValuesMap = new Map()
  
  // 调试信息：打印当前过滤后的产品数量
  console.log('过滤后的产品数量:', filteredProducts.value.length)
  
  // 遍历所有过滤后的产品，收集产品属性值
  filteredProducts.value.forEach((product, index) => {
    // 调试信息：打印每个产品的信息
    console.log(`产品${index + 1}:`, {
      productId: product.relationObjectId,
      productName: product.relationObjectName,
      hasProductInfo: !!product.productInfo,
      productInfo: product.productInfo
    })
    
    // 检查产品是否有属性信息
    if (product.productInfo && typeof product.productInfo === 'object') {
      // 检查productInfo是否有attributes数组
      if (Array.isArray(product.productInfo.attributes)) {
        console.log(`产品${index + 1}的attributes数组长度:`, product.productInfo.attributes.length)
        
        // 遍历productInfo.attributes数组，收集每个属性的attributeValue
        product.productInfo.attributes.forEach((attr, attrIndex) => {
          console.log(`产品${index + 1}的属性${attrIndex + 1}:`, attr)
          
          // 确保属性有attributeId和attributeValue
          if (attr.attributeId && attr.attributeValue) {
            // 只处理非空的字符串和数字属性值
            if (attr.attributeValue !== null && attr.attributeValue !== undefined && attr.attributeValue !== '' && 
                (typeof attr.attributeValue === 'string' || typeof attr.attributeValue === 'number')) {
              const attrId = String(attr.attributeId)
              const attrValue = String(attr.attributeValue)
              
              // 如果Map中没有该attributeId，创建一个新的Set
              if (!availableValuesMap.has(attrId)) {
                availableValuesMap.set(attrId, new Set())
              }
              
              // 将attributeValue添加到对应的Set中
              availableValuesMap.get(attrId).add(attrValue)
              
              // 调试信息：打印收集到的属性值
              console.log(`收集到属性值: ${attr.attributeValue} (属性ID: ${attr.attributeId})`)
            }
          }
        })
      } else {
        // 只支持attributes数组结构，其他结构忽略
        console.log(`产品${index + 1}的productInfo没有attributes数组，忽略`)
      }
    } else {
      console.log(`产品${index + 1}没有productInfo或不是对象`)
    }
  })
  
  // 调试信息：打印最终收集到的属性值集合
  console.log('最终收集到的属性值集合:', Object.fromEntries(availableValuesMap))
  
  return availableValuesMap
}

// 解析属性值（兼容旧版）
const parseAttributeValues = (attributeValues) => {
  // 旧版函数，不进行过滤，仅解析属性值
  if (!attributeValues) {
    return []
  }
  
  // 先解析原始属性值
  let parsedValues = []
  
  // 如果是字符串，尝试解析为JSON数组
  if (typeof attributeValues === 'string') {
    try {
      const parsed = JSON.parse(attributeValues)
      if (Array.isArray(parsed)) {
        // 处理字符串数组情况，转换为对象数组
        parsedValues = parsed.map(item => {
          // 如果是对象，直接返回
          if (typeof item === 'object' && item !== null) {
            return item
          }
          // 如果是字符串，转换为对象格式
          return {
            valueCode: item,
            valueName: item
          }
        })
      } else {
        // 如果解析后不是数组，返回空数组
        return []
      }
    } catch (error) {
      // 解析失败，返回空数组
      console.warn('解析属性值失败:', error, attributeValues)
      return []
    }
  } else if (Array.isArray(attributeValues)) {
    // 如果已经是数组，处理其中的元素
    parsedValues = attributeValues.map(item => {
      // 如果是对象，直接返回
      if (typeof item === 'object' && item !== null) {
        return item
      }
      // 如果是字符串，转换为对象格式
      return {
        valueCode: item,
        valueName: item
      }
    })
  } else {
    // 如果是其他类型，返回空数组
    return []
  }
  
  return parsedValues
}

// 解析并过滤属性值，仅保留当前产品列表中实际存在的属性值
// 实现逻辑：仅使用attributeValue进行对比，仅保留存在于产品属性值集合中的属性值
const parseAndFilterAttributeValues = (attribute, attributeValues) => {
  if (!attributeValues) {
    console.log(`属性${attribute.attributeName}没有attributeValues，返回空数组`)
    return []
  }
  
  // 先解析原始属性值
  let parsedValues = []
  
  // 如果是字符串，尝试解析为JSON数组
  if (typeof attributeValues === 'string') {
    console.log(`属性${attribute.attributeName}的attributeValues是字符串:`, attributeValues)
    try {
      const parsed = JSON.parse(attributeValues)
      if (Array.isArray(parsed)) {
        console.log(`属性${attribute.attributeName}的attributeValues解析为数组:`, parsed)
        // 处理字符串数组情况，转换为对象数组
        parsedValues = parsed.map(item => {
          // 如果是对象，直接返回
          if (typeof item === 'object' && item !== null) {
            return item
          }
          // 如果是字符串，转换为对象格式
          return {
            valueCode: item,
            valueName: item
          }
        })
      } else {
        console.log(`属性${attribute.attributeName}的attributeValues解析后不是数组，尝试直接使用该值作为单一项`)
        // 如果解析后不是数组，尝试直接使用该值作为单一项
        parsedValues = [{
          valueCode: attributeValues,
          valueName: attributeValues
        }]
      }
    } catch (error) {
      // 解析失败，尝试以逗号分隔解析
      console.log(`属性${attribute.attributeName}的attributeValues JSON解析失败，尝试以逗号分隔解析:`, error)
      try {
        const parsed = attributeValues.split(',').map(item => item.trim()).filter(Boolean)
        console.log(`属性${attribute.attributeName}的attributeValues以逗号分隔解析为数组:`, parsed)
        parsedValues = parsed.map(item => ({
          valueCode: item,
          valueName: item
        }))
      } catch (e) {
        console.log(`属性${attribute.attributeName}的attributeValues以逗号分隔解析也失败，尝试直接使用该值作为单一项:`, e)
        // 解析失败，尝试直接使用该值作为单一项
        parsedValues = [{
          valueCode: attributeValues,
          valueName: attributeValues
        }]
      }
    }
  } else if (Array.isArray(attributeValues)) {
    console.log(`属性${attribute.attributeName}的attributeValues是数组:`, attributeValues)
    // 如果已经是数组，处理其中的元素
    parsedValues = attributeValues.map(item => {
      // 如果是对象，直接返回
      if (typeof item === 'object' && item !== null) {
        return item
      }
      // 如果是字符串，转换为对象格式
      return {
        valueCode: item,
        valueName: item
      }
    })
  } else {
    console.log(`属性${attribute.attributeName}的attributeValues是其他类型:`, typeof attributeValues)
    // 如果是其他类型，尝试直接使用该值作为单一项
    parsedValues = [{
      valueCode: String(attributeValues),
      valueName: String(attributeValues)
    }]
  }
  
  // 调试信息：打印动态属性的基本信息
  console.log('动态属性基本信息:', {
    attributeName: attribute.attributeName,
    attributeCode: attribute.attributeCode,
    attributeId: attribute.attributeId,
    parsedValuesLength: parsedValues.length
  })
  
  // 只有选择类型的属性才需要进行过滤
  if (['select', 'multi', 'radio', 'checkbox'].includes(attribute.componentType)) {
    // 获取当前可用的属性值集合：直接存储属性值，不使用attributeCode作为键
    const availableValues = getAvailableAttributeValues()
    
    // 调试信息：打印可用属性值集合
    console.log(`可用属性值集合:`, Object.fromEntries(availableValues))
    
    // 过滤属性值：仅保留存在于可用属性值集合中的属性值
    const filteredValues = parsedValues.filter(attrValue => {
      // 属性值的实际值：直接使用显示值
      const displayValue = String(attrValue.valueName || attrValue.label || attrValue.valueCode || attrValue.code || attrValue.value || attrValue)
      console.log(`检查属性值${displayValue}是否在可用值集合中`)
      
      // 获取该属性的可用值集合，确保使用字符串类型的键（与getAvailableAttributeValues保持一致）
      const attrId = String(attribute.attributeId)
      const attrAvailableValues = availableValues.get(attrId)
      if (!attrAvailableValues) {
        console.log(`属性${attrId}没有可用值集合，跳过过滤`)
        return true // 如果没有可用值集合，保留所有属性值
      }
      
      // 仅保留存在于可用属性值集合中的属性值
      const isAvailable = attrAvailableValues.has(displayValue)
      console.log(`属性值${displayValue}是否可用:`, isAvailable)
      return isAvailable
    })
    
    console.log(`属性值过滤前后数量:`, {
      before: parsedValues.length,
      after: filteredValues.length
    })
    console.log(`过滤前的值:`, parsedValues.map(v => v.valueCode || v.code || v.value))
    console.log(`过滤后的值:`, filteredValues.map(v => v.valueCode || v.code || v.value))
    
    return filteredValues
  } else {
    // 非选择类型的属性不需要过滤，直接返回解析后的属性值
    console.log(`属性${attribute.attributeName}是非选择类型，跳过过滤`)
    return parsedValues
  }
}

// 获取组件属性
const getComponentProps = (attr) => {
  const baseProps = {
    placeholder: attr.attributePlaceholder || `请输入${attr.attributeName}`,
    disabled: attr.isReadonly === '0',
    clearable: true
  }
  
  // 仅使用componentType字段
  const componentType = attr.componentType
  
  // 基于组件类型设置属性
  switch (componentType) {
    // 数字输入框
    case 'input-number':
      return {
        ...baseProps,
        min: attr.minValue ? Number(attr.minValue) : undefined,
        max: attr.maxValue ? Number(attr.maxValue) : undefined,
        step: attr.step ? Number(attr.step) : 1,
        controls: true
      }
    
    // 单选框
    case 'radio':
      return {
        ...baseProps
      }
    
    // 多选框
    case 'checkbox':
      return {
        ...baseProps
      }
    
    // 选择框（单选）
    case 'select':
      return {
        ...baseProps,
        filterable: true
      }
    
    // 选择框（多选）
    case 'multi':
      return {
        ...baseProps,
        multiple: true,
        filterable: true,
        'collapse-tags': true
      }
    
    // 日期选择器
    case 'date-picker':
      return {
        ...baseProps,
        type: 'date',
        format: 'YYYY-MM-DD',
        'value-format': 'YYYY-MM-DD'
      }
    
    // 日期时间选择器
    case 'datetime-picker':
      return {
        ...baseProps,
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
        'value-format': 'YYYY-MM-DD HH:mm:ss'
      }
    
    // 滑块
    case 'slider':
      return {
        ...baseProps,
        min: attr.minValue ? Number(attr.minValue) : 0,
        max: attr.maxValue ? Number(attr.maxValue) : 100,
        step: attr.step ? Number(attr.step) : 1,
        'show-input': true
      }
    
    // 开关
    case 'switch':
      return {
        ...baseProps
      }
    
    // 颜色选择器
    case 'color-picker':
      return {
        ...baseProps
      }
    
    // 文本域
    case 'textarea':
      return {
        ...baseProps,
        type: 'textarea',
        rows: 4,
        maxlength: attr.maxLength ? Number(attr.maxLength) : undefined,
        'show-word-limit': true
      }
    
    // 默认情况 - 普通输入框
    default:
      return baseProps
  }
}

// 加载节点静态属性
const loadStaticAttributes = async () => {
  if (!props.currentNode || !props.bomId) return
  
  console.log('loadStaticAttributes: 开始加载节点静态属性')
  console.log('loadStaticAttributes: bomId:', props.bomId)
  console.log('loadStaticAttributes: bomStructureId:', props.currentNode.bomStructureId)
  
  try {
    const response = await listSuperBomStructureAttributeByBomStructureId(
      props.bomId,
      props.currentNode.bomStructureId
    )
    
    console.log('loadStaticAttributes: API返回:', response)
    
    // 确保response.data存在，兼容不同的API响应格式
    const attributes = response.data?.rows || response.rows || []
    
    console.log('loadStaticAttributes: 静态属性数量:', attributes.length)
    
    // 按属性组分组
    const groupMap = new Map()
    
    attributes.forEach(attr => {
      const groupId = attr.attributeGroupId || 0
      const groupName = attr.attributeGroupName || '基本属性'
      
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId,
          groupName,
          groupDesc: attr.attributeGroupDesc || '',
          attributes: []
        })
      }
      
      groupMap.get(groupId).attributes.push(attr)
      
      // 初始化表单数据
      formData.value.attrs[attr.attributeCode] = attr.defaultValue || null
      
      // 设置验证规则
      if (attr.isRequired === '1') {
        formRules.value[`attrs.${attr.attributeCode}`] = [
          { required: true, message: `${attr.attributeName}不能为空`, trigger: 'blur' }
        ]
      }
    })
    
    attributeGroups.value = Array.from(groupMap.values())
    
    console.log('loadStaticAttributes: 属性组数量:', attributeGroups.value.length)
    
  } catch (error) {
    console.error('加载静态属性配置失败:', error)
    ElMessage.error('加载静态属性配置失败: ' + (error.message || error))
    // 设置一个空数组，避免显示加载中状态
    attributeGroups.value = []
  }
}

// 加载节点动态属性
const loadDynamicAttributes = async () => {
  if (!props.currentNode) return
  
  console.log('loadDynamicAttributes: 开始加载节点动态属性')
  console.log('loadDynamicAttributes: bomStructureId:', props.currentNode.bomStructureId)
  
  try {
    const response = await getSuperBomDynamicAttributeByBomStructureId(
      props.currentNode.bomStructureId
    )
    
    console.log('loadDynamicAttributes: API返回:', response)
    
    // 确保response.data存在，兼容不同的API响应格式
    const attributes = response.data?.rows || response.rows || response.data || []
    
    console.log('loadDynamicAttributes: 动态属性数量:', attributes.length)
    
    dynamicAttributes.value = attributes
    
    // 调试信息：打印每个动态属性的完整结构
    attributes.forEach((attr, index) => {
      console.log(`动态属性${index + 1}:`, {
        attributeName: attr.attributeName,
        attributeCode: attr.attributeCode,
        attributeId: attr.attributeId,
        componentType: attr.componentType,
        attributeValues: attr.attributeValues,
        parsedValues: typeof attr.attributeValues === 'string' ? JSON.parse(attr.attributeValues) : attr.attributeValues
      })
    })
    
    // 初始化动态属性表单数据
    attributes.forEach(attr => {
      formData.value.dynamicAttrs[attr.attributeId] = attr.defaultValue || null
      
      // 设置动态属性验证规则
      if (attr.isRequired === '1') {
        formRules.value[`dynamicAttrs.${attr.attributeId}`] = [
          { required: true, message: `${attr.attributeName}不能为空`, trigger: 'blur' }
        ]
      }
    })
    
  } catch (error) {
    console.error('加载动态属性配置失败:', error)
    ElMessage.error('加载动态属性配置失败: ' + (error.message || error))
    // 设置一个空数组，避免显示加载中状态
    dynamicAttributes.value = []
  }
}

// 加载节点所有属性（静态+动态）
const loadNodeAttributes = async () => {
  await Promise.all([
    loadStaticAttributes(),
    loadDynamicAttributes()
  ])
}

// 监听当前节点变化
watch(
  () => props.currentNode,
  async (newNode) => {
    if (newNode) {
      console.log('当前节点变化，重新加载配置:', newNode)
      // 初始化表单数据，优先使用节点配置中的数据
      const nodeConfig = newNode.configuration || {}
      formData.value = {
        selectedProductId: nodeConfig.selectedProductId || null,
        selectedProductIds: nodeConfig.selectedProductIds || [], // 用于多选产品
        productQuantities: nodeConfig.productQuantities || {}, // 用于存储每个产品的独立数量 { productId: quantity }
        attrs: nodeConfig.attrs || {},
        dynamicAttrs: nodeConfig.dynamicAttrs || {} // 动态属性数据
      }
      
      // 重新加载节点属性和相关产品
      await Promise.all([
        loadStaticAttributes(),
        loadDynamicAttributes(),
        loadRelatedProducts()
      ])
    } else {
      // 当currentNode为null时，重置表单数据
      resetFormData()
    }
  },
  { deep: true, immediate: true }
)

// 初始化选中状态
const initializeSelectedState = () => {
  if (!props.currentNode || !relatedProducts.value.length) return
  
  console.log('initializeSelectedState: 开始初始化选中状态')
  console.log('initializeSelectedState: 节点配置:', props.currentNode.configuration)
  
  // 从节点配置中获取选中的产品ID
  const nodeConfig = props.currentNode.configuration || {}
  const selectedId = nodeConfig.selectedProductId
  let selectedIds = nodeConfig.selectedProductIds || []
  const savedQuantities = nodeConfig.productQuantities || {}
  
  // 确保selectedIds是数组类型
  if (!Array.isArray(selectedIds)) {
    if (selectedIds) {
      selectedIds = [selectedIds]
    } else {
      selectedIds = []
    }
  }
  
  console.log('initializeSelectedState: 配置中的选中信息:', {
    selectedId,
    selectedIds,
    savedQuantities
  })
  
  // 根据选择类型初始化选中状态
  if (props.currentNode.selectionType === 'multiple') {
    // 多选模式
    formData.value.selectedProductIds = [...selectedIds] // 使用展开运算符创建新数组
    
    console.log('initializeSelectedState: 多选模式，设置selectedProductIds:', formData.value.selectedProductIds)
  } else {
    // 单选模式
    // 确保selectedId是有效的产品ID（存在于产品列表中）
    const validSelectedId = selectedId && relatedProducts.value.some(p => p.relationObjectId === selectedId) 
      ? selectedId 
      : null
    formData.value.selectedProductId = validSelectedId
    formData.value.selectedProductIds = validSelectedId ? [validSelectedId] : []
    
    console.log('initializeSelectedState: 单选模式，设置selectedProductId:', formData.value.selectedProductId)
  }
  
  // 为每个产品初始化数量（优先使用保存的数量，否则使用默认值）
  relatedProducts.value.forEach(product => {
    const productId = product.relationObjectId
    // 从保存的配置中获取数量，如果没有则使用默认值
    if (savedQuantities[productId] !== undefined) {
      formData.value.productQuantities[productId] = savedQuantities[productId]
    } else if (formData.value.productQuantities[productId] === undefined) {
      formData.value.productQuantities[productId] = props.currentNode.defaultQuantity || 1
    }
  })
  
  // 恢复其他配置（属性值等）
  if (nodeConfig.attrs) {
    Object.assign(formData.value.attrs, nodeConfig.attrs)
  }
  if (nodeConfig.dynamicAttrs) {
    Object.assign(formData.value.dynamicAttrs, nodeConfig.dynamicAttrs)
  }
  
  console.log('initializeSelectedState: 初始化完成', {
    selectedProductId: formData.value.selectedProductId,
    selectedProductIds: formData.value.selectedProductIds,
    productQuantities: formData.value.productQuantities
  })
  
  // 更新表单验证状态，初始加载时不显示错误
  updateValidationStatus()
  
  // 强制更新表单，确保选中状态立即生效
  if (formRef.value) {
    formRef.value.resetFields()
    // 重新设置表单数据
    formData.value = {
      ...formData.value,
      selectedProductId: formData.value.selectedProductId,
      selectedProductIds: formData.value.selectedProductIds,
      productQuantities: formData.value.productQuantities,
      attrs: formData.value.attrs,
      dynamicAttrs: formData.value.dynamicAttrs
    }
  }
}

// 加载关联产品
const loadRelatedProducts = async (autoInitialize = true) => {
  if (!props.currentNode || !props.bomId) return
  
  console.log('loadRelatedProducts: 开始加载关联产品')
  console.log('loadRelatedProducts: bomId:', props.bomId)
  console.log('loadRelatedProducts: structureId:', props.currentNode.bomStructureId)
  
  try {
    const response = await getSuperBomProductRelationByBomIdAndStructureId({
      bomId: props.bomId,
      structureId: props.currentNode.bomStructureId
    })
    
    console.log('loadRelatedProducts: API返回:', response)
    
    // 确保response.data存在，兼容不同的API响应格式
    const products = response.data?.rows || response.data || []
    
    console.log('loadRelatedProducts: 关联产品数量:', products.length)
    
    // 调试信息：打印第一个产品的完整结构
    if (products.length > 0) {
      console.log('第一个产品的完整结构:', products[0])
      console.log('第一个产品的productInfo:', products[0].productInfo)
    }
    
    // 为每个产品预初始化数量，避免渲染时出现undefined导致标红
    products.forEach(product => {
      const productId = product.relationObjectId
      // 先为产品设置默认数量，避免渲染时出现undefined
      if (formData.value.productQuantities[productId] === undefined) {
        formData.value.productQuantities[productId] = props.currentNode.defaultQuantity || 1
      }
    })
    
    // 设置产品列表
    relatedProducts.value = products
    
    // 如果autoInitialize为true，则自动初始化选中状态和数量
    if (autoInitialize) {
      await nextTick()
      initializeSelectedState()
    }
    
  } catch (error) {
    console.error('加载关联产品失败:', error)
    ElMessage.error('加载关联产品失败: ' + (error.message || error))
    // 设置一个空数组，避免显示加载中状态
    relatedProducts.value = []
  }
}

// 静态属性值变化处理
const handleAttributeChange = async (attr) => {
  // 清除该属性的校验错误
  delete validationErrors.value[attr.attributeCode]
  
  // 触发规则引擎校验
  await configuratorStore.validateAttribute(
    props.currentNode.bomStructureId,
    attr.attributeCode,
    formData.value.attrs[attr.attributeCode]
  )
}

// 动态属性值变化处理
const handleDynamicAttributeChange = async (attr) => {
  // 清除该属性的校验错误
  delete validationErrors.value[attr.attributeId]
  
  // 获取当前的属性值
  const attrValue = formData.value.dynamicAttrs[attr.attributeId]
  
  // 只有当属性值不是null或undefined时，才进行验证
  if (attrValue !== null && attrValue !== undefined) {
    // 重新获取最新的可用属性值集合
    const availableValues = getAvailableAttributeValues()
    
    // 检查属性ID是否存在于可用值集合中，并且该属性是选择类型
    if (availableValues.has(attr.attributeId) && ['select', 'multi', 'radio', 'checkbox'].includes(attr.componentType)) {
      // 获取该属性的可用值集合
      const attrAvailableValues = availableValues.get(attr.attributeId)
      
      // 检查Set集合是否不为空
      if (attrAvailableValues && attrAvailableValues.size > 0) {
        // 容错处理：确保属性值是字符串类型
        const stringValue = String(attrValue)
        
        // 检查属性值是否存在于可用值集合中
        const isValid = attrAvailableValues.has(stringValue)
        
        // 输出验证结果
        console.log(`\n=== 动态属性值验证结果 ===`)
        if (isValid) {
          console.log(`✓ 验证通过：属性ID ${attr.attributeId} 的值 "${stringValue}" 是有效的`)
        } else {
          console.log(`✗ 验证失败：属性ID ${attr.attributeId} 的值 "${stringValue}" 无效`)
          console.log(`  有效取值范围：[${Array.from(attrAvailableValues).join(', ')}]`)
        }
        console.log(`=== 验证完成 ===\n`)
      }
    }
  }
  
  // 触发规则引擎校验
  await configuratorStore.validateAttribute(
    props.currentNode.bomStructureId,
    attr.attributeId,
    formData.value.dynamicAttrs[attr.attributeId]
  )
}

// 数量变化处理
const handleQuantityChange = async (productId, value) => {
  // 更新本地状态
  formData.value.productQuantities[productId] = value
  
  // 如果是单选模式且当前产品是选中状态，或者是多选模式且当前产品在选中列表中，则更新store
  const isSelected = props.currentNode.selectionType === 'single' 
    ? formData.value.selectedProductId === productId
    : formData.value.selectedProductIds.includes(productId)
    
  if (isSelected) {
    await configuratorStore.updateProductQuantity(
      props.currentNode.bomStructureId,
      productId,
      value
    )
  }
}

// 获取选中产品的详细信息
const getSelectedProductDetails = () => {
  const productIds = props.currentNode.selectionType === 'multiple' 
    ? formData.value.selectedProductIds 
    : formData.value.selectedProductId ? [formData.value.selectedProductId] : []
  
  const productDetails = {};
  productIds.forEach(id => {
    const product = relatedProducts.value.find(p => p.relationObjectId === id);
    if (product) {
      productDetails[id] = {
        name: product.relationObjectName,
        model: product.productInfo?.productModel || ''
      };
    }
  });
  return productDetails;
};

// 产品选择变化处理
const handleProductChange = async (productId) => {
  // 如果productId为null，表示取消选中，不需要设置默认数量
  if (productId !== null && productId !== undefined) {
    // 为新选择的产品设置默认数量
    if (!formData.value.productQuantities[productId]) {
      formData.value.productQuantities[productId] = props.currentNode.defaultQuantity || 1
    }
  }
  
  // 调用store更新产品选择
  if (props.currentNode.selectionType === 'multiple') {
    await configuratorStore.selectNodeProducts(
      props.currentNode.bomStructureId,
      [...formData.value.selectedProductIds]
    )
  } else {
    // 单选模式：如果productId为null，传递null给store表示取消选中
    await configuratorStore.selectNodeProduct(
      props.currentNode.bomStructureId,
      productId
    )
  }
  
  // 自动保存配置到清单，无需等待确认按钮
  await configuratorStore.saveNodeConfiguration(
    props.currentNode.bomStructureId,
    {
      // 如果productId为null，quantity使用第一个选中产品的数量，或者使用默认值
      quantity: productId !== null && productId !== undefined 
        ? formData.value.productQuantities[productId] 
        : (formData.value.selectedProductIds.length > 0 
          ? formData.value.productQuantities[formData.value.selectedProductIds[0]] 
          : props.currentNode.defaultQuantity || 1),
      productQuantities: formData.value.productQuantities,
      // 根据选择类型传递正确的产品ID字段
      ...(props.currentNode.selectionType === 'multiple' 
        ? { selectedProductIds: formData.value.selectedProductIds }
        : { selectedProductId: formData.value.selectedProductId }),
      productDetails: getSelectedProductDetails(),
      ...formData.value.attrs,
      ...formData.value.dynamicAttrs
    }
  )
  
  // 触发配置确认事件，确保父组件更新configuredNodes
  emit('config-confirm', {
    quantity: productId !== null && productId !== undefined 
      ? formData.value.productQuantities[productId] 
      : (formData.value.selectedProductIds.length > 0 
        ? formData.value.productQuantities[formData.value.selectedProductIds[0]] 
        : props.currentNode.defaultQuantity || 1),
    productQuantities: formData.value.productQuantities,
    // 根据选择类型传递正确的产品ID字段
    ...(props.currentNode.selectionType === 'multiple' 
      ? { selectedProductIds: formData.value.selectedProductIds }
      : { selectedProductId: formData.value.selectedProductId }),
    productDetails: getSelectedProductDetails(),
    ...formData.value.attrs,
    ...formData.value.dynamicAttrs
  })
  
  // 更新表单验证状态
  updateValidationStatus()
}

// 更新表单验证状态
const updateValidationStatus = (triggeredByUser = false) => {
  // 只有在用户触发或需要强制验证时才显示错误
  // 初始加载时不显示错误
  if (props.currentNode.isRequired === '1') {
    const hasSelected = props.currentNode.selectionType === 'multiple' 
      ? formData.value.selectedProductIds.length > 0
      : !!formData.value.selectedProductId
    
    if (hasSelected) {
      validateStatus.value = 'success'
      validateError.value = ''
    } else if (triggeredByUser) {
      // 只有在用户触发时才显示错误
      validateStatus.value = 'error'
      validateError.value = '请选择产品'
    } else {
      // 初始状态不显示错误
      validateStatus.value = ''
      validateError.value = ''
    }
  } else {
    validateStatus.value = ''
    validateError.value = ''
  }
}



// 组件挂载时初始化
onMounted(async () => {
  console.log('AttributeConfig: 组件挂载')
  // 重置表单数据，确保页面刷新时已选中的产品和属性会被取消选中
  resetFormData()
  
  if (props.currentNode) {
    console.log('AttributeConfig: 初始化选中状态')
    await nextTick()
    // 确保选中状态正确设置
    if (props.currentNode.selectionType === 'multiple') {
      if (formData.value.selectedProductIds && !Array.isArray(formData.value.selectedProductIds)) {
        formData.value.selectedProductIds = []
      }
    } else {
      if (formData.value.selectedProductIds && formData.value.selectedProductIds.length > 0) {
        formData.value.selectedProductId = formData.value.selectedProductIds[0]
      }
    }
  }
})

// 监听节点变化
watch(
  () => props.currentNode?.bomStructureId, // 只监听bomStructureId变化，避免不必要的重置
  async (newBomStructureId, oldBomStructureId) => {
    console.log('AttributeConfig: bomStructureId变化:', newBomStructureId, oldBomStructureId)
    
    // 只有当bomStructureId真正改变时才重置和重新加载数据
    if (newBomStructureId && newBomStructureId !== oldBomStructureId) {
      const newNode = props.currentNode
      if (newNode) {
        // 重置表单数据
        resetFormData()
        
        console.log('AttributeConfig: 开始加载节点数据')
        console.log('AttributeConfig: 节点配置:', newNode.configuration)
        
        // 加载节点数据（自动初始化选中状态）
        try {
          await Promise.all([
            loadStaticAttributes(),
            loadDynamicAttributes(),
            loadRelatedProducts() // 自动初始化选中状态
          ])
          
          console.log('AttributeConfig: 节点数据加载完成')
          
          console.log('AttributeConfig: 表单数据:', formData.value)
          console.log('AttributeConfig: 属性组:', attributeGroups.value)
          console.log('AttributeConfig: 关联产品:', relatedProducts.value)
          console.log('AttributeConfig: 动态属性:', dynamicAttributes.value)
        } catch (error) {
          console.error('AttributeConfig: 加载节点数据失败:', error)
          ElMessage.error('加载节点数据失败')
        }
      }
    }
  },
  { immediate: true }
)

// 监听currentNode的深度变化，确保页面刷新时重置表单
watch(
  () => props.currentNode,
  async (newNode) => {
    console.log('AttributeConfig: currentNode变化:', newNode)
    // 当currentNode为null时，重置表单数据
    if (!newNode) {
      resetFormData()
    }
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.attribute-config {
  height: 100%;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fafafa;
  box-sizing: border-box;
  // 优化滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
  
  /* 空状态样式 */
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 300px;
    padding: 20px;
    
    .el-empty {
      margin: 0;
      
      &__image {
        margin-bottom: 16px;
      }
      
      &__description {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  /* 加载状态样式 */
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 300px;
    padding: 20px;
    
    .el-empty {
      margin: 0;
      
      &__image {
        margin-bottom: 16px;
      }
      
      &__description {
        font-size: 14px;
        color: #409eff;
      }
    }
    
    .loading-icon {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .config-content {
    background-color: #fff;
    padding: 12px;
    border-radius: 6px;
    margin: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    /* 小屏幕优化 */
    @media screen and (max-width: 768px) {
      padding: 8px;
      border-radius: 4px;
    }
    
    .attribute-form {
      .form-section {
        margin-bottom: 16px;
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e4e7ed;
          
          h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
          
          .section-desc {
            font-size: 12px;
            color: #909399;
          }
        }
      }
      
      .el-form-item {
        margin-bottom: 12px;
        
        .el-form-item__label {
          padding-bottom: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #303133;
        }
        
        .el-form-item__content {
          line-height: 1;
        }
        
        /* 优化输入框样式 */
        .el-input,
        .el-input-number,
        .el-select,
        .el-date-picker,
        .el-color-picker {
          .el-input__inner {
            padding: 6px 12px;
            font-size: 13px;
            border-radius: 4px;
            border: 1px solid #dcdfe6;
            transition: all 0.2s ease;
            
            &:focus {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }
          }
        }
        
        /* 优化选择框样式 */
        .el-select {
          .el-select__tags {
            min-height: 32px;
            padding: 2px 40px 2px 10px;
          }
          
          .el-tag {
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 2px;
          }
        }
        
        /* 优化单选和多选框样式 */
        .el-radio-group,
        .el-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          
          .el-radio,
          .el-checkbox {
            margin: 0;
            font-size: 13px;
            
            .el-radio__label,
            .el-checkbox__label {
              margin-left: 6px;
            }
          }
        }
        
        /* 优化滑块样式 */
        .el-slider {
          margin: 8px 0;
          
          .el-slider__bar {
            background-color: #409eff;
          }
          
          .el-slider__button {
            border-color: #409eff;
          }
          
          .el-slider__runway {
            background-color: #e4e7ed;
          }
        }
        
        /* 优化开关样式 */
        .el-switch {
          margin: 0;
        }
      }
      
      .quantity-hint {
        font-size: 12px;
        color: #909399;
        margin: 4px 0 0 0;
      }
      
      .product-option {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      
      /* 产品卡片容器 - 响应式设计 */
      .product-card-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 16px;
        
        /* 中屏幕 */
        @media screen and (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
        }
        
        /* 小屏幕 */
        @media screen and (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }
      
      /* 统一属性表单样式 */
      .unified-attribute-section {
        margin-bottom: 24px;
        
        .section-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #fff;
          padding: 12px 0 6px 0;
          margin-bottom: 16px;
          margin-top: -12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
      }
      
      /* 搜索操作按钮样式 */
      .search-actions-col {
        display: flex;
        align-items: flex-end;
        
        .search-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          width: 100%;
          
          .el-button {
            flex: 1;
            height: 40px;
            font-size: 14px;
          }
          
          .search-button {
            background-color: #409eff;
            border-color: #409eff;
          }
          
          .reset-button {
            background-color: #ffffff;
            border-color: #dcdfe6;
            color: #606266;
          }
        }
      }
      
      /* 属性项统一样式 */
      .attribute-item {
        .el-form-item__label {
          font-weight: 500;
          color: #303133;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .el-form-item__content {
          line-height: 1;
        }
        
        /* 统一输入组件样式 */
        .el-input,
        .el-input-number,
        .el-select,
        .el-date-picker,
        .el-color-picker {
          .el-input__inner {
            height: 40px;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #dcdfe6;
            transition: all 0.2s ease;
            
            &:focus {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }
          }
        }
      }
      
      /* 产品卡片 - 放大尺寸 */
      .product-card {
        padding: 24px;
        background: #ffffff;
        border: 1px solid #e4e7ed;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        min-height: 250px;
        display: flex;
        flex-direction: column;
        
        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
          transform: translateY(-2px);
        }
        
        &.selected {
          border-color: #409eff;
          background: #ecf5ff;
          box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
        }
        
        .card-header {
          margin-bottom: 16px;
          
          .product-title {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .product-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            
            .brand-tag {
              background: #ecf5ff;
              color: #409eff;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .series-tag {
              background: #f0f9eb;
              color: #67c23a;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
          }
        }
        
        .card-body {
          flex: 1;
          margin-bottom: 20px;
          
          .product-info {
            .info-item {
              display: flex;
              margin-bottom: 8px;
              line-height: 1.5;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .info-label {
                width: 80px;
                font-size: 13px;
                color: #909399;
                font-weight: 500;
              }
              
              .info-value {
                flex: 1;
                font-size: 13px;
                color: #606266;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }
        
        .card-footer {
          display: flex;
          align-items: center;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #f0f2f5;
          
          .el-input-number {
            width: 120px;
            margin-right: 16px;
            
            .el-input__inner {
              height: 36px;
              font-size: 14px;
            }
            
            .el-input-number__decrease,
            .el-input-number__increase {
              width: 36px;
              height: 36px;
            }
          }
          
          .el-button {
            min-width: 70px;
            padding: 8px 16px;
          }
        }
      }
      
      /* 下拉选择框产品选项样式 */
      .product-option {
        display: flex;
        flex-direction: column;
        width: 100%;
        
        .option-main {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .option-detail {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #606266;
          
          span {
            &:before {
              content: '| ';
              color: #dcdfe6;
              margin-right: 4px;
            }
            
            &:first-child {
              &:before {
                display: none;
              }
            }
          }
        }
      }
      
      /* 产品表格容器 */
      .product-table-container {
        margin-top: 6px;
        
        .selected-row {
          background-color: #ecf5ff !important;
        }
        
        .el-table {
          border-radius: 4px;
          overflow: hidden;
          
          th {
            background-color: #f5f7fa;
            font-weight: 600;
            font-size: 12px;
            padding: 6px;
          }
          
          td {
            padding: 6px;
            font-size: 12px;
          }
        }
        
        .el-pagination {
          margin-top: 8px;
          
          .el-pagination__sizes,
          .el-pagination__total,
          .el-pagination__jump {
            display: none;
          }
          
          .el-pagination__prev,
          .el-pagination__next,
          .el-pager li {
            min-width: 24px;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
          }
        }
      }
      
      /* 选择控件样式 */
      .selection-control {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      /* 产品卡片选中状态增强 */
      .product-card {
        position: relative;
        transition: all 0.3s ease;
        
        &.selected {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          
          /* 添加选中标识 */
          &:before {
            content: '';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 12px;
            height: 12px;
            background-color: #409eff;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }
          
          &:after {
            content: '';
            position: absolute;
            top: 10px;
            right: 14px;
            width: 4px;
            height: 8px;
            border: solid #fff;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
        }
        
        /* 悬停效果增强 */
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
      
      .attr-error {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        padding: 4px 8px;
        background-color: #fef0f0;
        border-left: 2px solid #f56c6c;
        border-radius: 3px;
        font-size: 11px;
        color: #f56c6c;
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
    
    .config-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #e4e7ed;
      
      .el-button {
        padding: 6px 14px;
        font-size: 12px;
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: none;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
          transform: translateY(0);
        }
        
        &--primary {
          background-color: #409eff;
          border-color: #409eff;
          
          &:hover {
            background-color: #66b1ff;
            border-color: #66b1ff;
          }
          
          &:active {
            background-color: #3a8ee6;
            border-color: #3a8ee6;
          }
        }
        
        &--success {
          background-color: #67c23a;
          border-color: #67c23a;
          
          &:hover {
            background-color: #85ce61;
            border-color: #85ce61;
          }
          
          &:active {
            background-color: #5daf34;
            border-color: #5daf34;
          }
        }
        
        &--danger {
          background-color: #f56c6c;
          border-color: #f56c6c;
          
          &:hover {
            background-color: #f78989;
            border-color: #f78989;
          }
          
          &:active {
            background-color: #dd6161;
            border-color: #dd6161;
          }
        }
        
        &--large {
          padding: 8px 18px;
          font-size: 13px;
        }
        
        &--small {
          padding: 4px 10px;
          font-size: 11px;
        }
      }
    }
    
    /* 优化提示图标样式 */
    .attr-help-icon {
      margin-left: 4px;
      cursor: help;
      color: #909399;
      font-size: 13px;
      transition: color 0.2s ease;
      
      &:hover {
        color: #409eff;
      }
    }
    
    /* 优化数量输入框样式 */
    .quantity-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-input-number {
        width: 120px;
        
        .el-input-number__decrease,
        .el-input-number__increase {
          width: 28px;
          height: 32px;
        }
      }
    }
  }
}
</style>
