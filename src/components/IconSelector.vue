<template>
  <div class="icon-selector">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom"
      :width="600"
      trigger="click"
    >
      <template #reference>
        <div class="icon-input-wrapper">
          <el-input
            v-model="iconValue"
            placeholder="选择或输入图标名称"
            @input="handleInput"
            readonly
            :prefix-icon="selectedIconComponent"
          >
            <template #append>
              <el-button
                type="primary"
                icon="Search"
                @click="popoverVisible = true"
              />
            </template>
          </el-input>
        </div>
      </template>
      
      <div class="icon-selector-content">
        <!-- 搜索框 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索图标..."
          clearable
          @input="handleSearch"
          :prefix-icon="Search"
          class="search-input"
        />
        
        <!-- 分类标签 -->
        <div class="category-tabs">
          <el-tag
            v-for="category in categories"
            :key="category"
            :type="activeCategory === category ? 'primary' : ''"
            effect="light"
            @click="activeCategory = category"
            class="category-tag"
          >
            {{ category }}
          </el-tag>
        </div>
        
        <!-- 图标列表 -->
        <div class="icons-container">
          <el-scrollbar height="400px">
            <div class="icons-grid">
              <div
                v-for="icon in filteredIcons"
                :key="icon.name"
                class="icon-item"
                :class="{ 'icon-item-selected': icon.name === iconValue }"
                @click="selectIcon(icon)"
              >
                <el-icon :size="24">
                  <component :is="icon.component" />
                </el-icon>
                <span class="icon-name">{{ icon.name }}</span>
              </div>
              <div v-if="filteredIcons.length === 0" class="no-icons">
                未找到匹配的图标
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 状态管理
const popoverVisible = ref(false)
const searchQuery = ref('')
const activeCategory = ref('全部')
const iconValue = ref(props.modelValue)

// 图标分类映射
const iconCategories = {
  '操作': ['Add', 'Delete', 'Edit', 'Search', 'Refresh', 'Save', 'Upload', 'Download', 'Print', 'Copy', 'Paste', 'Cut', 'Clear', 'Close', 'Open', 'Lock', 'Unlock', 'Check', 'CircleCheck', 'CircleClose', 'CirclePlus', 'CircleMinus', 'Check'],
  '导航': ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'DoubleArrowLeft', 'DoubleArrowRight', 'DoubleArrowUp', 'DoubleArrowDown', 'Back', 'Next', 'Top', 'Bottom', 'Left', 'Right', 'Menu', 'SubMenu', 'Expand', 'Fold', 'FullScreen', 'ExitFullScreen', 'Home', 'Location', 'Flag'],
  '状态': ['Success', 'Warning', 'Error', 'Info', 'Question', 'Loading', 'LoadingFull', 'View', 'Hide', 'Eye', 'EyeClose', 'Bell', 'Message', 'Star', 'StarFilled', 'Like', 'LikeFilled', 'Dislike', 'DislikeFilled', 'Rank', 'RankFilled'],
  '对象': ['Document', 'DocumentCopy', 'DocumentDelete', 'DocumentEdit', 'DocumentRemove', 'DocumentAdd', 'File', 'FileAdd', 'FileDelete', 'FileEdit', 'FileRemove', 'Folder', 'FolderAdd', 'FolderDelete', 'FolderEdit', 'FolderRemove', 'FolderOpened', 'Picture', 'PictureFilled', 'Video', 'Camera', 'Music', 'Message', 'Mail', 'Phone', 'Monitor', 'Mobile', 'Printer', 'Scanner', 'HardDrive', 'Microchip', 'Cpu', 'Memory', 'Storage', 'Battery', 'BatteryCharging', 'Signal', 'Wifi', 'Bluetooth'],
  '符号': ['Plus', 'Minus', 'Times', 'Divide', 'Equals', 'NotEqual', 'Greater', 'GreaterEqual', 'Less', 'LessEqual', 'Percent', 'Dollar', 'Yen', 'Euro', 'Pound', 'At', 'Hash', 'Asterisk', 'Exclamation', 'Question', 'Quote', 'Apostrophe', 'Comma', 'Period', 'Colon', 'Semicolon', 'Slash', 'Backslash', 'Pipe', 'Underscore', 'Hyphen', 'PlusCircle', 'MinusCircle', 'CloseCircle', 'CheckCircle', 'InfoCircle', 'WarningCircle', 'ErrorCircle', 'QuestionCircle'],
  '图形': ['Circle', 'CircleFilled', 'Ellipsis', 'EllipsisHorizontal', 'EllipsisVertical', 'Square', 'SquareFilled', 'Rectangle', 'Triangle', 'TriangleFilled', 'Diamond', 'DiamondFilled', 'Star', 'StarFilled', 'Heart', 'HeartFilled', 'ThumbsUp', 'ThumbsDown', 'Check', 'Close', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  '其他': ['Setting', 'Tools', 'Brush', 'Palette', 'MagicStick', 'Bell', 'Notification', 'Message', 'Comment', 'ChatDotRound', 'ChatLineRound', 'ChatDotSquare', 'ChatLineSquare', 'Postcard', 'Reading', 'DataAnalysis', 'Histogram', 'PieChart', 'LineChart', 'Monitor', 'Mobile', 'Tablet', 'Laptop', 'Cpu', 'Memory', 'HardDrive', 'Storage', 'Printer', 'Scanner', 'Camera', 'VideoCamera', 'Microphone', 'Headset', 'Speaker', 'Volume', 'Mute', 'SwitchButton', 'ToggleRight', 'ToggleLeft']
}

// 获取所有图标并分类
const allIcons = ref([])
const categories = ref(['全部', ...Object.keys(iconCategories)])

// 初始化图标列表
const initIcons = () => {
  const icons = []
  for (const [name, component] of Object.entries(ElIcons)) {
    // 跳过内部组件和非图标组件
    if (name.startsWith('__') || typeof component !== 'object') continue
    
    // 查找图标分类
    let category = '其他'
    for (const [cat, iconNames] of Object.entries(iconCategories)) {
      if (iconNames.includes(name)) {
        category = cat
        break
      }
    }
    
    icons.push({
      name,
      component,
      category
    })
  }
  allIcons.value = icons
}

// 根据搜索和分类过滤图标
const filteredIcons = computed(() => {
  return allIcons.value.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = activeCategory.value === '全部' || icon.category === activeCategory.value
    return matchesSearch && matchesCategory
  })
})

// 计算选中的图标组件
const selectedIconComponent = computed(() => {
  if (!iconValue.value) return null
  return ElIcons[iconValue.value] || null
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    iconValue.value = newValue
  }
)

// 处理输入
const handleInput = (value) => {
  emit('update:modelValue', value)
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 选择图标
const selectIcon = (icon) => {
  iconValue.value = icon.name
  emit('update:modelValue', icon.name)
  popoverVisible.value = false
}

// 组件挂载时初始化
onMounted(() => {
  initIcons()
})
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-input-wrapper {
  display: flex;
  align-items: center;
}

.icon-selector-content {
  padding: 16px;
}

.search-input {
  margin-bottom: 16px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 80px;
  overflow-y: auto;
}

.category-tag {
  cursor: pointer;
  user-select: none;
}

.icons-container {
  max-height: 400px;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-item-selected {
  background-color: #e6f7ff;
  border: 2px solid #1890ff;
}

.icon-item .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #333;
}

.icon-name {
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

.no-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}
</style>