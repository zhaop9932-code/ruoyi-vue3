# CPQ规则配置增强设计方案

## 1. 当前系统不足分析

### 1.1 条件配置能力有限
- 条件类型单一，只有简单条件、复杂条件和表达式三种类型
- 条件组合能力有限，缺乏灵活的逻辑组合
- 缺乏对多种数据类型的支持
- 缺乏对动态条件的支持
- 缺乏对条件优先级的支持

### 1.2 动作执行能力有限
- 动作类型单一，缺乏复杂动作序列支持
- 缺乏对动作执行条件和顺序的精细控制
- 缺乏对动作执行结果的处理和反馈机制
- 缺乏对批量操作和循环操作的支持

### 1.3 规则触发机制有限
- 触发时机单一，缺乏对多种触发时机的支持
- 缺乏对触发条件的精细控制
- 缺乏对规则执行上下文的支持

### 1.4 规则管理和维护困难
- 缺乏对规则之间依赖关系的管理
- 缺乏对规则版本控制的支持
- 缺乏对规则执行日志的详细记录和分析
- 缺乏对规则性能的监控和优化

### 1.5 缺乏AI辅助配置
- 缺乏自然语言到规则的转换能力
- 缺乏规则自动生成和优化建议
- 缺乏规则冲突检测和解决建议

## 2. 增强的条件配置能力设计

### 2.1 条件类型增强

| 条件类型 | 描述 | 支持的操作符 |
|---------|------|------------|
| 数值型 | 适用于整数、小数等数值类型 | =, !=, >, >=, <, <=, between, not between, in, not in |
| 文本型 | 适用于字符串类型 | =, !=, contains, not contains, starts with, ends with, in, not in |
| 布尔型 | 适用于布尔值类型 | =, != |
| 日期型 | 适用于日期和时间类型 | =, !=, >, >=, <, <=, between, not between, before, after |
| 列表型 | 适用于数组和列表类型 | contains, not contains, empty, not empty, size =, size >, size < |
| 对象型 | 适用于复杂对象类型 | exists, not exists, has property, property equals |
| 表达式型 | 适用于自定义表达式 | 自定义JavaScript或Groovy表达式 |

### 2.2 条件组合增强

#### 2.2.1 逻辑运算符
- AND：逻辑与，所有条件都必须满足
- OR：逻辑或，至少一个条件满足
- NOT：逻辑非，否定条件结果

#### 2.2.2 条件组支持
- 支持嵌套的条件组
- 每个条件组可以设置独立的逻辑运算符
- 支持条件组的优先级设置

#### 2.2.3 条件组合示例

```json
{
  "conditionType": "complex",
  "operator": "AND",
  "conditions": [
    {
      "field": "productPrice",
      "operator": ">",
      "value": 1000
    },
    {
      "conditionType": "group",
      "operator": "OR",
      "conditions": [
        {
          "field": "productCategory",
          "operator": "=",
          "value": "electronics"
        },
        {
          "field": "productBrand",
          "operator": "in",
          "value": ["Apple", "Samsung"]
        }
      ]
    }
  ]
}
```

### 2.3 动态条件支持

#### 2.3.1 变量支持
- 支持系统变量：${currentUser}, ${currentDate}, ${currentTime}
- 支持上下文变量：${productId}, ${bomId}, ${configurationId}
- 支持自定义变量：${customVar1}, ${customVar2}

#### 2.3.2 函数支持
- 数学函数：sum(), avg(), max(), min(), count()
- 字符串函数：concat(), substring(), replace(), toUpperCase(), toLowerCase()
- 日期函数：dateAdd(), dateSub(), formatDate(), getYear(), getMonth(), getDay()
- 自定义函数：支持通过插件扩展自定义函数

### 2.4 条件模板支持

- 预定义常用条件模板
- 支持自定义条件模板
- 支持模板参数化
- 支持模板版本控制

## 3. 增强的动作执行能力设计

### 3.1 动作类型增强

| 动作类型 | 描述 | 参数示例 |
|---------|------|---------|
| 设置属性 | 设置产品或配置的属性值 | {"field": "productPrice", "value": 1500} |
| 添加产品 | 添加产品到配置中 | {"productId": "123", "quantity": 1} |
| 删除产品 | 从配置中删除产品 | {"productId": "123"} |
| 更新数量 | 更新配置中产品的数量 | {"productId": "123", "quantity": 2} |
| 显示消息 | 向用户显示消息 | {"message": "产品已添加", "type": "info"} |
| 隐藏选项 | 隐藏配置选项 | {"optionId": "456"} |
| 显示选项 | 显示配置选项 | {"optionId": "456"} |
| 禁用选项 | 禁用配置选项 | {"optionId": "456"} |
| 启用选项 | 启用配置选项 | {"optionId": "456"} |
| 触发事件 | 触发自定义事件 | {"eventName": "customEvent", "params": {"key": "value"}} |
| 调用API | 调用外部API | {"url": "https://api.example.com", "method": "POST", "params": {}} |
| 执行脚本 | 执行自定义脚本 | {"script": "console.log('Hello World')", "language": "javascript"} |
| 设置规则状态 | 设置其他规则的状态 | {"ruleId": "789", "status": "disabled"} |

### 3.2 动作序列支持

- 支持按顺序执行多个动作
- 支持动作执行条件
- 支持动作执行结果的分支处理
- 支持动作执行失败的重试机制
- 支持动作执行的回滚机制

#### 3.2.1 动作序列示例

```json
{
  "actionType": "sequence",
  "actions": [
    {
      "type": "setProperty",
      "params": {
        "field": "productPrice",
        "value": 1500
      }
    },
    {
      "type": "showMessage",
      "params": {
        "message": "价格已更新",
        "type": "success"
      },
      "condition": "${productPrice} > 1000"
    },
    {
      "type": "callApi",
      "params": {
        "url": "https://api.example.com/price/update",
        "method": "POST",
        "params": {
          "productId": "${productId}",
          "price": 1500
        }
      },
      "onSuccess": [
        {
          "type": "showMessage",
          "params": {
            "message": "API调用成功",
            "type": "success"
          }
        }
      ],
      "onFailure": [
        {
          "type": "showMessage",
          "params": {
            "message": "API调用失败",
            "type": "error"
          }
        }
      ]
    }
  ]
}
```

### 3.3 动作执行上下文

- 支持在动作中访问条件执行结果
- 支持在动作中访问其他动作的执行结果
- 支持在动作中访问全局变量和上下文变量
- 支持在动作中修改上下文变量

## 4. AI辅助规则配置功能设计

### 4.1 自然语言到规则的转换

- 支持用户通过自然语言描述规则，系统自动生成规则配置
- 支持多种语言输入
- 支持规则描述的模糊匹配和纠错
- 支持生成的规则配置的人工调整

#### 4.1.1 示例

用户输入："如果产品价格大于1000元，并且产品类别是电子产品，那么显示优惠信息"

系统生成：

```json
{
  "ruleName": "产品价格优惠规则",
  "ruleType": "条件",
  "ruleScope": "产品",
  "conditionType": "complex",
  "conditions": [
    {
      "field": "productPrice",
      "operator": ">",
      "value": 1000
    },
    {
      "field": "productCategory",
      "operator": "=",
      "value": "electronics"
    }
  ],
  "actionType": "simple",
  "actions": [
    {
      "type": "showMessage",
      "params": {
        "message": "优惠信息",
        "type": "info"
      }
    }
  ]
}
```

### 4.2 规则自动生成和优化建议

- 基于历史配置数据自动生成规则建议
- 基于规则执行效果自动优化规则配置
- 支持规则合并和拆分建议
- 支持规则优先级调整建议

### 4.3 规则冲突检测和解决建议

- 自动检测规则之间的冲突
- 提供冲突解决建议
- 支持冲突可视化展示
- 支持冲突解决的模拟和验证

### 4.4 AI辅助规则调试

- 提供规则执行模拟环境
- 支持规则执行流程的可视化展示
- 提供规则执行结果的解释和分析
- 提供规则优化建议

## 5. 技术实现方案

### 5.1 技术栈

- 后端：Spring Boot 2.5.15, MyBatis, MySQL 8.0
- 规则引擎：Drools 7.x
- AI模型：DeepSeek API
- 前端：Vue 3, Element Plus
- 序列化：FastJSON 2.0.58

### 5.2 核心模块设计

#### 5.2.1 条件配置模块

- 条件类型管理
- 条件组合管理
- 条件模板管理
- 条件验证和解析

#### 5.2.2 动作执行模块

- 动作类型管理
- 动作序列管理
- 动作执行引擎
- 动作结果处理

#### 5.2.3 AI辅助配置模块

- 自然语言处理
- 规则生成和优化
- 规则冲突检测
- 规则调试辅助

#### 5.2.4 规则管理模块

- 规则版本控制
- 规则依赖管理
- 规则执行日志
- 规则性能监控

### 5.3 数据库设计

#### 5.3.1 条件配置表（cpq_rule_condition）

| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| condition_id | BIGINT | 条件ID |
| rule_id | BIGINT | 规则ID |
| condition_type | VARCHAR(50) | 条件类型 |
| operator | VARCHAR(20) | 逻辑运算符 |
| field | VARCHAR(100) | 字段名 |
| comparison_operator | VARCHAR(20) | 比较运算符 |
| value | TEXT | 比较值 |
| parent_condition_id | BIGINT | 父条件ID |
| priority | INT | 优先级 |
| created_by | VARCHAR(50) | 创建人 |
| created_time | DATETIME | 创建时间 |
| updated_by | VARCHAR(50) | 更新人 |
| updated_time | DATETIME | 更新时间 |

#### 5.3.2 动作配置表（cpq_rule_action）

| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| action_id | BIGINT | 动作ID |
| rule_id | BIGINT | 规则ID |
| action_type | VARCHAR(50) | 动作类型 |
| action_name | VARCHAR(100) | 动作名称 |
| params | TEXT | 动作参数 |
| execute_condition | TEXT | 执行条件 |
| sequence | INT | 执行顺序 |
| on_success_action_id | BIGINT | 成功后执行的动作ID |
| on_failure_action_id | BIGINT | 失败后执行的动作ID |
| created_by | VARCHAR(50) | 创建人 |
| created_time | DATETIME | 创建时间 |
| updated_by | VARCHAR(50) | 更新人 |
| updated_time | DATETIME | 更新时间 |

#### 5.3.3 规则版本表（cpq_rule_version）

| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| version_id | BIGINT | 版本ID |
| rule_id | BIGINT | 规则ID |
| version_code | VARCHAR(50) | 版本号 |
| version_name | VARCHAR(100) | 版本名称 |
| status | VARCHAR(20) | 版本状态 |
| created_by | VARCHAR(50) | 创建人 |
| created_time | DATETIME | 创建时间 |

### 5.4 核心API设计

#### 5.4.1 条件配置API

- GET /cpq/rule/condition/{ruleId}：获取规则条件配置
- POST /cpq/rule/condition：保存规则条件配置
- DELETE /cpq/rule/condition/{conditionId}：删除规则条件

#### 5.4.2 动作配置API

- GET /cpq/rule/action/{ruleId}：获取规则动作配置
- POST /cpq/rule/action：保存规则动作配置
- DELETE /cpq/rule/action/{actionId}：删除规则动作

#### 5.4.3 AI辅助配置API

- POST /cpq/rule/ai/generate：根据自然语言生成规则
- POST /cpq/rule/ai/optimize：优化现有规则
- POST /cpq/rule/ai/detect-conflicts：检测规则冲突
- POST /cpq/rule/ai/debug：调试规则

## 6. 实施计划

### 6.1 第一阶段：核心功能实现

- 增强条件配置能力
- 增强动作执行能力
- 实现规则引擎集成

### 6.2 第二阶段：AI辅助功能实现

- 自然语言到规则的转换
- 规则自动生成和优化建议
- 规则冲突检测和解决建议

### 6.3 第三阶段：规则管理和监控

- 规则版本控制
- 规则依赖管理
- 规则执行日志和性能监控

## 7. 预期效果

- 提高规则配置的灵活性和强大性，支持更多复杂业务场景
- 降低规则配置的复杂度，提高配置效率
- 减少规则配置错误，提高规则质量
- 提高规则的可维护性和可扩展性
- 降低规则配置的学习成本，提高用户体验

## 8. 风险评估

- 技术复杂度增加，需要更多的开发和测试资源
- AI模型的准确性和可靠性需要持续优化
- 规则引擎的性能可能成为瓶颈，需要进行性能优化
- 现有系统的兼容性需要充分考虑

## 9. 结论

通过增强CPQ系统的规则配置能力，特别是条件配置能力、动作执行能力和AI辅助配置功能，可以显著提高系统的灵活性、易用性和性能，支持更多复杂的业务场景，降低用户的学习成本和配置难度，提高规则配置的质量和效率。

该设计方案基于当前系统的实际情况，充分考虑了系统的可扩展性和兼容性，同时引入了先进的AI技术，具有较高的可行性和实用性。