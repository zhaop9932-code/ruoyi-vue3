<template>
  <div class="product-selection">
    <el-empty v-if="!currentNode" description="请先选择要配置的节点" />
    
    <div v-else class="selection-container">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-card shadow="never" class="filter-card">
          <template #header>
            <div class="card-header">
              <span>筛选条件</span>
              <el-button text type="primary" @click="handleResetFilters">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
          </template>
          
          <el-form :model="filters" label-width="80px" size="small">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="产品名称">
                  <el-input 
                    v-model="filters.productName" 
                    placeholder="请输入产品名称"
                    clearable
                    @input="handleFilterChange"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="产品型号">
                  <el-input 
                    v-model="filters.productModel" 
                    placeholder="请输入产品型号"
                    clearable
                    @input="handleFilterChange"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="价格范围">
                  <el-slider
                    v-model="filters.priceRange"
                    range
                    :min="0"
                    :max="priceRangeMax"
                    :format-tooltip="formatPriceTooltip"
                    @change="handleFilterChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 动态属性筛选 -->
            <div v-if="dynamicAttributes.length > 0" class="dynamic-filters">
              <el-divider content-position="left">动态属性筛选</el-divider>
              <el-row :gutter="16">
                <el-col 
                  v-for="attr in dynamicAttributes" 
                  :key="attr.attributeId"
                  :span="8"
                >
                  <el-form-item :label="attr.attributeName">
                    <component
                      :is="getFilterComponent(attr.attributeType)"
                      v-model="filters.dynamicAttrs[attr.attributeCode]"
                      v-bind="getComponentProps(attr)"
                      @change="handleFilterChange"
                    >
                      <template v-if="['select', 'radio'].includes(attr.attributeType)">
                        <el-option
                          v-for="option in attr.attributeValues"
                          :key="option.valueId"
                          :label="option.valueName"
                          :value="option.valueCode"
                        />
                      </template>
                    </component>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </el-card>
      </div>
      
      <!-- 产品列表 -->
      <div class="products-section">
        <div class="section-header">
          <div class="header-left">
            <h3>产品列表</h3>
            <el-tag type="info" size="small">共 {{ filteredProducts.length }} 个产品</el-tag>
          </div>
          
          <div class="header-right">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="grid">
                <el-icon><Grid /></el-icon>
                网格
              </el-radio-button>
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
                列表
              </el-radio-button>
            </el-radio-group>
            
            <el-select v-model="sortBy" size="small" style="width: 150px;" @change="handleSortChange">
              <el-option label="推荐排序" value="recommend" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
              <el-option label="匹配度从高到低" value="match_desc" />
            </el-select>
          </div>
        </div>
        
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" v-loading="loading" class="products-grid">
          <div 
            v-for="product in displayProducts" 
            :key="product.productId"
            class="product-card"
            :class="{ 'selected': selectedProduct?.productId === product.productId }"
            @click="handleProductClick(product)"
          >
            <div class="product-image">
              <el-image 
                :src="product.productImage || '/default-product.png'" 
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              
              <!-- 匹配度标签 -->
              <div class="match-badge" :class="`match-${getMatchLevel(product.matchRate)}`">
                匹配度 {{ product.matchRate }}%
              </div>
            </div>
            
            <div class="product-info">
              <h4 class="product-name" :title="product.productName">
                {{ product.productName }}
              </h4>
              <p class="product-model">型号: {{ product.productModel }}</p>
              
              <div class="product-attrs">
                <el-tag 
                  v-for="(value, key) in getDisplayAttrs(product)" 
                  :key="key"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ value }}
                </el-tag>
              </div>
              
              <div class="product-footer">
                <div class="price">
                  <span class="price-label">¥</span>
                  <span class="price-value">{{ product.price }}</span>
                </div>
                
                <el-button 
                  type="primary" 
                  size="small"
                  :icon="selectedProduct?.productId === product.productId ? Check : null"
                  @click.stop="handleSelectProduct(product)"
                >
                  {{ selectedProduct?.productId === product.productId ? '已选择' : '选择' }}
                </el-button>
              </div>
            </div>
          </div>
          
          <el-empty v-if="filteredProducts.length === 0" description="暂无符合条件的产品" />
        </div>
        
        <!-- 列表视图 -->
        <div v-else v-loading="loading" class="products-list">
          <el-table 
            :data="displayProducts" 
            border
            highlight-current-row
            @row-click="handleProductClick"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="productName" label="产品名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="productModel" label="产品型号" width="150" />
            <el-table-column label="匹配度" width="120" align="center">
              <template #default="{ row }">
                <el-progress 
                  :percentage="row.matchRate" 
                  :color="getMatchColor(row.matchRate)"
                  :show-text="true"
                />
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="120" align="right">
              <template #default="{ row }">
                <span class="price-text">¥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :icon="selectedProduct?.productId === row.productId ? Check : null"
                  @click.stop="handleSelectProduct(row)"
                >
                  {{ selectedProduct?.productId === row.productId ? '已选择' : '选择' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页 -->
        <div v-if="filteredProducts.length > pageSize" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48, 96]"
            :total="filteredProducts.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Grid, List, Picture, Check } from '@element-plus/icons-vue'
import { getSuperBomProductRelationByBomIdAndStructureId } from '@/api/cpq/superBomProductRelation'
import { listSuperBomStructureAttributeByBomStructureId } from '@/api/cpq/bom'

const props = defineProps({
  currentNode: {
    type: Object,
    default: null
  },
  bomId: {
    type: [String, Number],
    required: true
  },
  currentFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['product-select'])

// 数据状态
const loading = ref(false)
const allProducts = ref([])
const dynamicAttributes = ref([])
const selectedProduct = ref(null)

// 视图模式
const viewMode = ref('grid')
const sortBy = ref('recommend')

// 筛选条件
const filters = ref({
  productName: '',
  productModel: '',
  priceRange: [0, 10000],
  dynamicAttrs: {}
})

// 分页
const currentPage = ref(1)
const pageSize = ref(12)

// 价格范围最大值
const priceRangeMax = computed(() => {
  if (allProducts.value.length === 0) return 10000
  return Math.ceil(Math.max(...allProducts.value.map(p => p.price || 0)) / 1000) * 1000
})

// 过滤后的产品
const filteredProducts = computed(() => {
  let products = [...allProducts.value]
  
  // 按产品名称筛选
  if (filters.value.productName) {
    const keyword = filters.value.productName.toLowerCase()
    products = products.filter(p => 
      p.productName.toLowerCase().includes(keyword)
    )
  }
  
  // 按产品型号筛选
  if (filters.value.productModel) {
    const keyword = filters.value.productModel.toLowerCase()
    products = products.filter(p => 
      p.productModel?.toLowerCase().includes(keyword)
    )
  }
  
  // 按价格范围筛选
  products = products.filter(p => 
    p.price >= filters.value.priceRange[0] && 
    p.price <= filters.value.priceRange[1]
  )
  
  // 按动态属性筛选
  Object.keys(filters.value.dynamicAttrs).forEach(attrCode => {
    const filterValue = filters.value.dynamicAttrs[attrCode]
    if (filterValue) {
      products = products.filter(p => {
        const productAttr = p.attributes?.[attrCode]
        return productAttr === filterValue
      })
    }
  })
  
  // 排序
  products = sortProducts(products)
  
  return products
})

// 显示的产品（分页后）
const displayProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// 排序产品
const sortProducts = (products) => {
  switch (sortBy.value) {
    case 'price_asc':
      return products.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return products.sort((a, b) => b.price - a.price)
    case 'match_desc':
      return products.sort((a, b) => b.matchRate - a.matchRate)
    case 'recommend':
    default:
      // 推荐排序：匹配度 * 0.7 + (1 - 价格/最高价) * 0.3
      const maxPrice = Math.max(...products.map(p => p.price))
      return products.sort((a, b) => {
        const scoreA = a.matchRate * 0.7 + (1 - a.price / maxPrice) * 30
        const scoreB = b.matchRate * 0.7 + (1 - b.price / maxPrice) * 30
        return scoreB - scoreA
      })
  }
}

// 获取筛选组件
const getFilterComponent = (type) => {
  const componentMap = {
    'select': 'el-select',
    'radio': 'el-select',
    'number': 'el-input-number',
    'text': 'el-input'
  }
  return componentMap[type] || 'el-input'
}

// 获取组件属性
const getComponentProps = (attr) => {
  return {
    placeholder: `请选择${attr.attributeName}`,
    clearable: true,
    size: 'small'
  }
}

// 格式化价格提示
const formatPriceTooltip = (val) => {
  return `¥${val}`
}

// 获取匹配等级
const getMatchLevel = (rate) => {
  if (rate >= 80) return 'high'
  if (rate >= 60) return 'medium'
  return 'low'
}

// 获取匹配颜色
const getMatchColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取显示属性（最多3个）
const getDisplayAttrs = (product) => {
  const attrs = product.attributes || {}
  const entries = Object.entries(attrs).slice(0, 3)
  return Object.fromEntries(entries)
}

// 加载产品列表
const loadProducts = async () => {
  if (!props.currentNode) return
  
  loading.value = true
  try {
    const response = await getSuperBomProductRelationByBomIdAndStructureId({
      bomId: props.bomId,
      structureId: props.currentNode.bomStructureId
    })
    
    allProducts.value = (response.data || []).map(item => ({
      ...item,
      matchRate: calculateMatchRate(item)
    }))
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载动态属性
const loadDynamicAttributes = async () => {
  if (!props.currentNode || !props.bomId) return
  
  try {
    const response = await listSuperBomStructureAttributeByBomStructureId(
      props.bomId,
      props.currentNode.bomStructureId
    )
    dynamicAttributes.value = response.data || []
    
    // 初始化动态属性筛选
    dynamicAttributes.value.forEach(attr => {
      filters.value.dynamicAttrs[attr.attributeCode] = null
    })
  } catch (error) {
    console.error('加载动态属性失败:', error)
  }
}

// 计算匹配度
const calculateMatchRate = (product) => {
  // 这里应该根据实际业务逻辑计算匹配度
  // 暂时返回一个模拟值
  return Math.floor(Math.random() * 40) + 60
}

// 处理筛选变更
const handleFilterChange = () => {
  currentPage.value = 1
}

// 重置筛选
const handleResetFilters = () => {
  filters.value = {
    productName: '',
    productModel: '',
    priceRange: [0, priceRangeMax.value],
    dynamicAttrs: {}
  }
  currentPage.value = 1
}

// 处理排序变更
const handleSortChange = () => {
  currentPage.value = 1
}

// 处理产品点击
const handleProductClick = (product) => {
  selectedProduct.value = product
}

// 处理选择产品
const handleSelectProduct = (product) => {
  selectedProduct.value = product
  emit('product-select', product)
  ElMessage.success('产品选择成功')
}

// 处理分页大小变更
const handleSizeChange = () => {
  currentPage.value = 1
}

// 处理当前页变更
const handleCurrentChange = () => {
  // 滚动到顶部
  document.querySelector('.products-section')?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听节点变化
watch(
  () => props.currentNode,
  async (newNode) => {
    if (newNode) {
      selectedProduct.value = null
      currentPage.value = 1
      await Promise.all([
        loadProducts(),
        loadDynamicAttributes()
      ])
    }
  },
  { immediate: true }
)

// 组件挂载 - 注释掉，因为watch监听器已经有immediate: true选项，会在组件挂载时自动执行
// onMounted(() => {
//   if (props.currentNode) {
//     loadProducts()
//     loadDynamicAttributes()
//   }
// })
</script>

<style scoped lang="scss">
.product-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .selection-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .filter-section {
      flex-shrink: 0;
      
      .filter-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dynamic-filters {
          margin-top: 16px;
        }
      }
    }
    
    .products-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e4e7ed;
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          
          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
      
      .products-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        overflow: auto;
        padding: 4px;
        
        .product-card {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          background: #fff;
          
          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }
          
          &.selected {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
          
          .product-image {
            position: relative;
            width: 100%;
            height: 200px;
            background: #f5f7fa;
            
            .el-image {
              width: 100%;
              height: 100%;
            }
            
            .image-slot {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              background: #f5f7fa;
              color: #c0c4cc;
              font-size: 48px;
            }
            
            .match-badge {
              position: absolute;
              top: 8px;
              right: 8px;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              color: #fff;
              
              &.match-high {
                background: #67c23a;
              }
              
              &.match-medium {
                background: #e6a23c;
              }
              
              &.match-low {
                background: #f56c6c;
              }
            }
          }
          
          .product-info {
            padding: 16px;
            
            .product-name {
              margin: 0 0 8px;
              font-size: 15px;
              font-weight: 600;
              color: #303133;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .product-model {
              margin: 0 0 12px;
              font-size: 13px;
              color: #909399;
            }
            
            .product-attrs {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-bottom: 16px;
              min-height: 24px;
            }
            
            .product-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 12px;
              border-top: 1px solid #e4e7ed;
              
              .price {
                .price-label {
                  font-size: 14px;
                  color: #f56c6c;
                  font-weight: 600;
                }
                
                .price-value {
                  font-size: 20px;
                  color: #f56c6c;
                  font-weight: 700;
                }
              }
            }
          }
        }
      }
      
      .products-list {
        flex: 1;
        overflow: auto;
        
        .price-text {
          font-size: 16px;
          color: #f56c6c;
          font-weight: 600;
        }
      }
      
      .pagination {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e4e7ed;
      }
    }
  }
}
</style>
