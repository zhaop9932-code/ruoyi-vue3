# CPQ动作配置系统使用文档

## 一、系统概述

本系统是基于主流CPQ系统设计的完整动作配置解决方案,支持多种动作类型、目标类型和参数配置,提供直观的可视化配置界面。

### 核心特性

- ✅ 5大动作分类,15+种动作类型
- ✅ 8种目标类型支持
- ✅ 智能的层级选择(节点→属性→属性值)
- ✅ 结构化参数配置,避免JSON手写错误
- ✅ 完整的配置验证
- ✅ 批量操作支持

## 二、组件架构

```
ruleActions/
├── actionConfig.js              # 核心配置和枚举
├── ActionTypeSelector.vue       # 动作类型选择器
├── TargetTypeSelector.vue       # 目标类型选择器
├── NodeSelector.vue             # 节点选择器
├── AttributeSelector.vue        # 属性选择器
├── TargetObjectSelector.vue     # 目标对象选择器(整合)
├── ActionParamsConfig.vue       # 动作参数配置
├── ActionContent.vue            # 动作内容主组件
├── BasicInfoSection.vue         # 基本信息配置
└── RuleActionManage.vue         # 动作管理页面
```

## 三、使用方式

### 3.1 在规则配置页面中使用

```vue
<template>
  <div>
    <RuleActionManage 
      :rule-id="currentRuleId" 
      :bom-id="currentBomId"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RuleActionManage from './components/ruleActions/RuleActionManage.vue'

const currentRuleId = ref(1001)
const currentBomId = ref(100)
</script>
```

### 3.2 独立使用ActionContent组件

```vue
<template>
  <ActionContent
    v-model:element="actionData"
    :is-expanded="true"
    :bom-id="bomId"
    @validate="handleValidate"
  />
</template>

<script setup>
import { ref } from 'vue'
import ActionContent from './components/ruleActions/ActionContent.vue'

const actionData = ref({
  actionType: '',
  targetType: '',
  targetId: '',
  actionParams: '{}',
  actionPriority: 1,
  actionStatus: '0',
  actionSequence: 1,
  description: ''
})

const bomId = ref(100)

const handleValidate = (validation) => {
  console.log('验证结果:', validation)
}
</script>
```

## 四、动作类型详解

### 4.1 基础动作

#### 1. 是否启用 (isEnable)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点动态属性、节点动态属性值、节点产品、规则

**场景示例**:
- 选择高端CPU后,启用水冷散热器节点
- 选择游戏模式后,启用高端显卡选项

**参数配置**: 开关样式 - 是/否

#### 2. 是否推荐 (isRecommend)
**支持目标类型**: 节点、节点静态属性、节点动态属性、节点产品

**场景示例**:
- 选择办公电脑后,推荐集成显卡
- 选择游戏电脑后,推荐独立显卡

**参数配置**: 开关样式 - 是/否

#### 3. 是否显示 (isShow)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点动态属性、节点动态属性值、节点产品、规则

**场景示例**:
- 选择笔记本电脑后,隐藏独立显卡节点
- 选择标准配置后,隐藏高级设置选项

**参数配置**: 开关样式 - 是/否

#### 4. 是否必选 (isRequired)
**支持目标类型**: 节点、节点静态属性、节点动态属性

**场景示例**:
- 选择定制服务后,CPU配置设为必选
- 选择企业版后,安全配置设为必选

**参数配置**: 开关样式 - 是/否

#### 5. 是否重置 (reset)
**支持目标类型**: 节点、节点静态属性、节点动态属性

**场景示例**:
- 更换主板后,重置CPU选择
- 更换电源后,重置显卡选择

**参数配置**: 开关样式 - 是/否

### 4.2 相互联动

#### 1. 联动选中 (linkSelect)
**支持目标类型**: 节点静态属性值、节点动态属性值、节点产品

**场景示例**:
- 选择Intel主板后,自动选中Intel CPU
- 选择ATX机箱后,自动选中ATX主板

**参数配置**:
- 节点产品: 开关样式 - 是/否
- 节点属性值: 下拉选择属性值

#### 2. 联动排除 (exclude)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点动态属性、节点动态属性值

**场景示例**:
- 选择AMD处理器后,排除Intel主板
- 选择小机箱后,排除大尺寸显卡

**参数配置**: 无需配置

#### 3. 相互选中 (mutualSelect)
**支持目标类型**: 节点静态属性值、节点动态属性值、节点产品

**场景示例**:
- 选择RGB内存时,同时选中RGB风扇
- 选择水冷散热器时,同时选中散热硅脂

**参数配置**: 无需配置

#### 4. 相互排斥 (mutualExclude)
**支持目标类型**: 节点静态属性、节点静态属性值、节点动态属性、节点动态属性值、节点产品

**场景示例**:
- 风冷散热器和水冷散热器互斥
- HDD硬盘和SSD硬盘只能选其一

**参数配置**: 无需配置

#### 5. 多选 (multipleSelect)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点动态属性、节点动态属性值、节点产品

**场景示例**:
- 内存条至少选2条,最多选4条
- 硬盘最多选择3个

**参数配置**:
- 最少选择数量(数字输入)
- 最多选择数量(数字输入)

### 4.3 价格动作

#### 1. 应用折扣 (applyDiscount)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点产品

**场景示例**:
- VIP客户享受9折优惠
- 批量购买显卡享受固定金额折扣

**参数配置**:
- 折扣类型: 百分比/固定金额
- 折扣值: 数字输入
- 是否叠加: 开关(是/否)

#### 2. 应用满减 (applyFullReduction)
**支持目标类型**: 节点

**场景示例**:
- 满1000元减100元
- 购买3个以上配件减200元

**参数配置**:
- 满减条件类型: 满金额/满数量
- 条件值: 数字输入
- 减额类型: 固定金额/百分比
- 减额值: 数字输入
- 是否循环满减: 开关(是/否)

#### 3. 设置单价 (setPrice)
**支持目标类型**: 节点、节点静态属性、节点静态属性值、节点动态属性、节点动态属性值、节点产品

**场景示例**:
- 企业客户固定价格1000元
- 根据公式计算动态价格

**参数配置**:
- 单价设置方式: 固定价格/公式计算
- 单价值/公式: 文本输入

### 4.4 消息通知

#### 1. 显示消息 (showMessage)
**目标类型**: 无需选择

**场景示例**:
- 选择高端配置时提示"该配置性能强劲"
- 配置不兼容时显示警告消息

**参数配置**:
- 消息级别: 信息/成功/警告/错误
- 消息标题: 文本输入
- 消息内容: 文本输入

#### 2. 发送通知 (sendNotification)
**目标类型**: 无需选择

**场景示例**:
- 大额订单邮件通知销售经理
- 配置完成后短信通知客户

**参数配置**:
- 通知类型: 邮件/短信/站内信
- 接收者: 文本输入
- 通知内容: 文本输入

#### 3. 触发警告 (triggerWarning)
**目标类型**: 无需选择

**场景示例**:
- 选择不兼容配件时触发警告
- 超出预算时触发警告

**参数配置**:
- 警告级别: 低/中/高/严重
- 警告消息: 文本输入

### 4.5 数据处理

#### 1. 参数计算 (calculation)
**支持目标类型**: 变量信息、节点静态属性

**场景示例**:
- 计算总功耗 = CPU功耗 + 显卡功耗 + 其他
- 计算性能分数

**参数配置**:
- 计算公式: 文本输入(支持数学表达式)
- 计算结果存储到: 选择变量

#### 2. 调用API (callApi)
**目标类型**: 无需选择

**场景示例**:
- 调用第三方API获取实时价格
- 调用库存接口检查库存

**参数配置**:
- API参数: JSON格式输入

#### 3. 触发规则 (triggerRule)
**支持目标类型**: 规则

**场景示例**:
- 选择游戏配置后触发性能检查规则
- 提交订单前触发价格验证规则

**参数配置**: 无需配置

## 五、配置流程

### 标准配置流程

1. **选择动作类型** → 从5大分类中选择合适的动作类型
2. **选择目标类型** → 根据动作类型,选择要操作的目标类型
3. **选择目标对象** → 层级选择具体的目标对象
   - 直接选择: 节点、规则、变量
   - 二级选择: 节点 → 属性/产品
   - 三级选择: 节点 → 属性 → 属性值
4. **配置动作参数** → 根据动作类型配置相应参数
5. **设置基本信息** → 配置优先级、状态、序列、描述

### 层级选择说明

#### 场景1: 节点静态属性
1. 选择节点(单选)
2. 选择该节点下的静态属性(多选)

#### 场景2: 节点静态属性值
1. 选择节点(单选)
2. 选择该节点下的静态属性(单选)
3. 选择该属性下的属性值(多选)

#### 场景3: 节点动态属性
1. 选择节点(单选)
2. 选择该节点下的动态属性(多选)

#### 场景4: 节点动态属性值
1. 选择节点(单选)
2. 选择该节点下的动态属性(单选)
3. 选择该属性下的属性值(多选)

#### 场景5: 节点产品
1. 选择节点(单选)
2. 选择该节点下的产品(多选)

## 六、API接口

### 6.1 动作列表查询
```javascript
GET /cpq/ruleAction/listByRuleId/{ruleId}
```

### 6.2 动作详情查询
```javascript
GET /cpq/ruleAction/{actionId}
```

### 6.3 新增动作
```javascript
POST /cpq/ruleAction
Content-Type: application/json

{
  "ruleId": 1001,
  "actionType": "isEnable",
  "targetType": "node",
  "targetId": "101,102",
  "structureId": "101",
  "actionParams": "{\"value\": true}",
  "actionPriority": 1,
  "actionStatus": "0",
  "actionSequence": 1
}
```

### 6.4 更新动作
```javascript
PUT /cpq/ruleAction
Content-Type: application/json

{
  "actionId": 1,
  "actionName": "启用节点",
  "actionParams": "{\"value\": false}"
}
```

### 6.5 删除动作
```javascript
DELETE /cpq/ruleAction/{actionId}
```

### 6.6 批量保存
```javascript
POST /cpq/ruleAction/saveRuleActions/{ruleId}
Content-Type: application/json

[
  { ... },
  { ... }
]
```

## 七、数据结构

### 动作数据模型
```typescript
interface RuleAction {
  actionId?: number              // 动作ID
  ruleId: number                // 规则ID
  actionType: string            // 动作类型
  actionName?: string           // 动作名称
  targetType?: string           // 目标类型
  targetId?: string            // 目标对象ID(多个用逗号分隔)
  structureId?: string         // 节点ID
  attributeId?: string         // 属性ID
  actionParams?: string        // 动作参数(JSON字符串)
  actionPriority: number       // 优先级
  actionStatus: string         // 状态: 0-启用, 1-禁用
  actionSequence: number       // 执行序列
  description?: string         // 描述
}
```

### 动作参数示例

#### 基础动作参数
```json
{
  "value": true
}
```

#### 多选参数
```json
{
  "minSelect": 2,
  "maxSelect": 4
}
```

#### 应用折扣参数
```json
{
  "type": "percentage",
  "value": 0.9,
  "isStackable": false
}
```

#### 应用满减参数
```json
{
  "conditionType": "amount",
  "conditionValue": 1000,
  "reduceType": "fixed",
  "reduceValue": 100,
  "isLoop": false
}
```

#### 设置单价参数
```json
{
  "settingType": "fixed",
  "value": 1000
}
```

或

```json
{
  "settingType": "formula",
  "value": "basePrice * (1 + profitRate)"
}
```

## 八、最佳实践

### 8.1 动作优先级设置

- **1-10**: 最高优先级,用于关键业务规则
- **11-50**: 中等优先级,用于常规业务规则
- **51-100**: 低优先级,用于辅助功能

### 8.2 动作序列设置

同一优先级下,序列号决定执行顺序。建议:
- 使用10的倍数(10, 20, 30...)预留扩展空间
- 相关联的动作使用连续序列号

### 8.3 参数配置建议

1. **使用结构化配置** - 避免手写JSON
2. **参数验证** - 保存前进行完整性检查
3. **添加描述** - 为复杂动作添加清晰的描述说明
4. **测试验证** - 配置完成后在测试环境验证

### 8.4 性能优化

1. **减少动作数量** - 合并相似动作
2. **优化目标选择** - 避免选择过多目标对象
3. **简化计算公式** - 复杂计算考虑后端处理

## 九、常见问题

### Q1: 如何实现"选A后自动选B,同时排除C"?
A: 需要配置两个动作:
1. 联动选中动作: 目标对象B
2. 联动排除动作: 目标对象C

### Q2: 折扣能否叠加?
A: 在应用折扣动作中,设置"是否叠加"参数控制

### Q3: 如何配置复杂的价格计算?
A: 使用"设置单价"动作,选择"公式计算"方式,输入计算公式

### Q4: 参数计算的公式支持哪些运算?
A: 支持基本数学运算: +、-、*、/、()等,具体支持的函数取决于后端实现

### Q5: 如何测试配置的动作是否生效?
A: 在规则管理页面使用"测试规则"功能,或在实际BOM配置页面验证

## 十、版本历史

- **v1.0.0** (2024-12-28)
  - 初始版本发布
  - 支持5大动作分类
  - 完整的可视化配置界面
  - 层级选择支持
  - 结构化参数配置

## 十一、技术支持

如有问题或建议,请联系开发团队。
