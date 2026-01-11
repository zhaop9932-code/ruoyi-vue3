# 🎯 用户选型配置器 - 快速开始

> 基于RuoYi-Vue3的CPQ产品配置解决方案

## ⚡ 5分钟快速上手

### 1. 访问配置器

```
URL: http://localhost:5173/cpq/configurator?bomId={您的BOM_ID}
```

### 2. 配置流程

```
选择节点 → 填写属性 → 确认配置 → 查看摘要 → 完成配置
```

### 3. 核心操作

| 操作 | 位置 | 说明 |
|-----|------|------|
| **选择节点** | 左侧产品树 | 点击节点开始配置 |
| **配置属性** | 中间配置面板 | 填写数量、选择产品、设置属性 |
| **查看进度** | 右侧摘要面板 | 查看已配置项和总价 |
| **保存配置** | 摘要面板底部 | 保存当前配置进度 |
| **完成配置** | 摘要面板底部 | 完成并生成报价 |

---

## 📂 项目文件

```
src/
├── views/cpq/configurator/          # 📁 配置器主目录
│   ├── index.vue                    # 主容器
│   └── components/
│       ├── ProductTree.vue          # 产品树
│       ├── AttributeConfig.vue      # 属性配置
│       └── ConfigurationSummary.vue # 配置摘要
├── store/modules/
│   └── configurator.js              # 状态管理
├── utils/
│   └── ruleEngine.js                # 规则引擎
└── api/cpq/
    └── configSession.js             # 配置会话API
```

---

## 🔧 核心功能

### ✅ 已实现

- [x] 可视化产品结构树
- [x] 12+种动态属性类型
- [x] 前端实时规则验证
- [x] 多层级BOM支持
- [x] 智能约束处理
- [x] 实时价格计算
- [x] 配置保存/加载
- [x] 配置进度跟踪

### 🎨 界面布局

```
┌─────────────────────────────────────────────────┐
│             顶部导航栏                           │
├──────────┬──────────────────┬──────────────────┤
│          │                  │                  │
│ 产品树   │   配置面板        │   配置摘要       │
│          │                  │                  │
│ • 搜索   │ • 节点信息        │ • 统计卡片       │
│ • 树形   │ • 数量配置        │ • 已选配置       │
│ • 状态   │ • 属性表单        │ • 价格明细       │
│          │ • 实时校验        │ • 操作按钮       │
│          │                  │                  │
└──────────┴──────────────────┴──────────────────┘
```

---

## 💻 开发调试

### 启动开发服务器

```bash
npm run dev
```

### 调试代码

```javascript
// 1. 查看Store状态
import { useConfiguratorStore } from '@/store/modules/configurator'
const store = useConfiguratorStore()
console.log(store.$state)

// 2. 查看规则执行日志
import RuleEngine from '@/utils/ruleEngine'
console.log(RuleEngine.getExecutionLog())

// 3. 查看当前配置
console.log(store.configSession.configuration)
```

---

## 📚 完整文档

| 文档 | 说明 |
|-----|------|
| **用户选型配置器使用指南.md** | 详细使用说明、API文档、常见问题 |
| **产品配置器实现总结.md** | 技术实现细节、架构设计、代码统计 |
| **CONFIGURATOR_README.md** | 本文档 - 快速开始 |

---

## 🔑 关键概念

### 节点状态

| 状态 | 图标 | 说明 |
|-----|------|------|
| `unconfigured` | - | 未配置 |
| `configured` | ✓ | 已配置 |
| `error` | ! | 配置错误 |
| `disabled` | - | 禁用（不满足约束） |

### 约束类型

1. **条件约束** - 基于表达式的条件判断
2. **数量约束** - 最小/最大数量限制
3. **依赖约束** - 节点间依赖关系
4. **组合约束** - 节点替换关系

### 规则类型

| 类型 | 代码 | 说明 |
|-----|------|------|
| 验证规则 | `1` | 校验配置合规性 |
| 计算规则 | `2` | 动态计算属性值 |
| 条件规则 | `3` | 条件控制逻辑 |
| 跳转规则 | `4` | 流程跳转控制 |

---

## 🚀 使用示例

### 示例1：从BOM列表跳转

```vue
<template>
  <el-button @click="handleConfigure(row.bomId)">
    开始配置
  </el-button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleConfigure = (bomId) => {
  router.push({
    name: 'CpqConfigurator',
    query: { bomId }
  })
}
</script>
```

### 示例2：直接使用Store

```vue
<script setup>
import { onMounted } from 'vue'
import { useConfiguratorStore } from '@/store/modules/configurator'

const store = useConfiguratorStore()

onMounted(async () => {
  // 加载BOM
  await store.loadBomStructure(123)
  
  // 获取配置摘要
  const summary = store.configurationSummary
  console.log(`已配置: ${summary.configuredNodes}/${summary.totalNodes}`)
})
</script>
```

### 示例3：监听配置变化

```vue
<script setup>
import { watch } from 'vue'
import { useConfiguratorStore } from '@/store/modules/configurator'

const store = useConfiguratorStore()

// 监听配置完成度
watch(
  () => store.isConfigurationComplete,
  (isComplete) => {
    if (isComplete) {
      ElMessage.success('所有必选项已配置完成！')
    }
  }
)

// 监听价格变化
watch(
  () => store.pricing.totalPrice,
  (newPrice, oldPrice) => {
    console.log(`价格从 ¥${oldPrice} 变更为 ¥${newPrice}`)
  }
)
</script>
```

---

## 🎯 常见任务

### 任务1：保存配置

```javascript
import { useConfiguratorStore } from '@/store/modules/configurator'

const store = useConfiguratorStore()

// 保存当前配置
await store.saveConfigSession()
```

### 任务2：加载历史配置

```javascript
// 从URL参数加载
const { sessionId } = useRoute().query
if (sessionId) {
  await store.loadConfigSession(sessionId)
}
```

### 任务3：重置配置

```javascript
// 重置所有配置
store.resetConfiguration()
```

### 任务4：完成配置

```javascript
// 完成配置并处理结果
const success = await store.completeConfiguration()
if (success) {
  // 跳转到报价页面
  router.push('/cpq/quote')
}
```

---

## ⚙️ 配置选项

### Store配置

```javascript
// src/store/modules/configurator.js

export const useConfiguratorStore = defineStore('configurator', {
  state: () => ({
    currentBomId: null,        // 当前BOM ID
    bomTreeData: [],           // BOM树形数据
    nodesMap: new Map(),       // 节点映射
    configSession: {},         // 配置会话
    rules: [],                 // 规则列表
    variables: {},             // 变量
    validationErrors: {},      // 校验错误
    pricing: {}                // 价格信息
  })
})
```

### 规则引擎配置

```javascript
// src/utils/ruleEngine.js

// 加载规则
RuleEngine.loadRules(rules)

// 设置上下文
RuleEngine.setContext({
  variables: { totalPrice: 0 },
  nodes: { 1: { attributes: {} } }
})

// 评估所有规则
const result = await RuleEngine.evaluateAll()
```

---

## 🐛 故障排查

### 问题1：配置器加载失败

**原因：** 缺少bomId参数或BOM不存在

**解决：**
```javascript
// 检查URL参数
const bomId = route.query.bomId
if (!bomId) {
  ElMessage.error('缺少BOM ID参数')
  router.push('/cpq/bom')
}
```

### 问题2：规则不生效

**原因：** 规则状态为禁用或条件不满足

**解决：**
```javascript
// 检查规则状态
console.log('规则列表:', store.rules.filter(r => r.ruleStatus === '0'))

// 查看执行日志
console.log('执行日志:', RuleEngine.getExecutionLog())
```

### 问题3：价格计算不正确

**原因：** 节点价格未配置或计算规则错误

**解决：**
```javascript
// 检查价格明细
console.log('价格明细:', store.pricing.breakdown)

// 手动触发价格计算
await store.calculateTotalPrice()
```

---

## 📊 性能建议

### 大数据量优化

```javascript
// 1. 虚拟滚动（待实现）
import { RecycleScroller } from 'vue-virtual-scroller'

// 2. 懒加载节点属性
const loadAttributes = async (nodeId) => {
  if (!cache.has(nodeId)) {
    cache.set(nodeId, await fetchAttributes(nodeId))
  }
  return cache.get(nodeId)
}

// 3. 防抖搜索
import { debounce } from 'lodash-es'

const handleSearch = debounce((value) => {
  // 搜索逻辑
}, 300)
```

---

## 🔗 相关链接

- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [RuoYi-Vue 文档](https://doc.ruoyi.vip/ruoyi-vue/)

---

## 📝 更新日志

### v1.0.0 (2024-01-03)

- ✨ 初始版本发布
- ✅ 完成所有核心功能
- 📚 提供完整文档

---

## 🤝 技术支持

遇到问题？查看：

1. **用户选型配置器使用指南.md** - 常见问题章节
2. **产品配置器实现总结.md** - 技术细节
3. **控制台日志** - 浏览器开发者工具
4. **Vue DevTools** - Vue组件调试工具

---

**快速导航：**

- 📖 [详细使用指南](./用户选型配置器使用指南.md)
- 🏗️ [实现总结](./产品配置器实现总结.md)
- 🎯 [快速开始](./CONFIGURATOR_README.md) (本文档)

---

**开始您的配置之旅！** 🚀
