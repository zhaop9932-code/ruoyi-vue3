# CPQ规则配置系统API接口文档

## 1. 接口概述

### 1.1 接口基本信息
- **接口名称**: CPQ规则配置系统API
- **接口版本**: v1.0.0
- **基础路径**: `/api/v1`
- **认证方式**: JWT Token
- **数据格式**: JSON

### 1.2 通用响应格式

#### 成功响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

#### 失败响应格式
```json
{
  "code": 500,
  "msg": "操作失败",
  "data": null
}
```

## 2. 规则条件配置接口

### 2.1 获取规则条件列表

#### 接口信息
- **接口路径**: `/cpq/ruleCondition/listByRuleId/{ruleId}`
- **请求方法**: GET
- **接口描述**: 根据规则ID获取对应的条件配置列表，返回树形结构数据

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| ruleId | Long | 是 | - | 规则ID |

#### 响应数据
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "conditionId": 1,
      "ruleId": 1,
      "configType": "complex",
      "type": "group",
      "judgeType": "variable",
      "node": "root",
      "field": "",
      "operator": "",
      "value": "",
      "logic": "AND",
      "parentConditionId": null,
      "priority": 1,
      "children": [
        {
          "conditionId": 2,
          "ruleId": 1,
          "configType": "simple",
          "type": "number",
          "judgeType": "nodeStaticAttr",
          "node": "node001",
          "field": "price",
          "operator": ">",
          "value": "100",
          "logic": "",
          "parentConditionId": 1,
          "priority": 1,
          "children": []
        }
      ]
    }
  ]
}
```

#### 字段说明
| 字段名 | 类型 | 描述 |
|--------|------|------|
| conditionId | Long | 条件ID |
| ruleId | Long | 规则ID |
| configType | String | 条件类型：simple（简单条件）, complex（复杂条件） |
| type | String | 数据类型：number, text, select, boolean |
| judgeType | String | 判断类型：variable, nodeStaticAttr, nodeDynamicAttr, nodeProduct |
| node | String | 节点ID |
| field | String | 字段名 |
| operator | String | 操作符：=, >, <, >=, <=, !=, like, in等 |
| value | String | 比较值 |
| logic | String | 逻辑关系：AND, OR |
| parentConditionId | Long | 父条件ID |
| priority | Integer | 优先级 |
| children | Array | 子条件列表 |

### 2.2 保存规则条件

#### 接口信息
- **接口路径**: `/cpq/ruleCondition`
- **请求方法**: POST
- **接口描述**: 保存规则条件配置，支持嵌套结构

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| condition | Object | 是 | - | 规则条件对象 |

#### 请求示例
```json
{
  "ruleId": 1,
  "configType": "complex",
  "type": "group",
  "judgeType": "variable",
  "logic": "AND",
  "priority": 1,
  "children": [
    {
      "configType": "simple",
      "type": "number",
      "judgeType": "nodeStaticAttr",
      "node": "node001",
      "field": "price",
      "operator": ">",
      "value": "100",
      "priority": 1
    }
  ]
}
```

#### 响应数据
```json
{
  "code": 200,
  "msg": "保存成功",
  "data": {
    "conditionId": 1,
    "ruleId": 1,
    "configType": "complex",
    "type": "group",
    "judgeType": "variable",
    "logic": "AND",
    "priority": 1,
    "children": [
      {
        "conditionId": 2,
        "ruleId": 1,
        "configType": "simple",
        "type": "number",
        "judgeType": "nodeStaticAttr",
        "node": "node001",
        "field": "price",
        "operator": ">",
        "value": "100",
        "priority": 1,
        "parentConditionId": 1
      }
    ]
  }
}
```

### 2.3 更新规则条件

#### 接口信息
- **接口路径**: `/cpq/ruleCondition`
- **请求方法**: PUT
- **接口描述**: 更新规则条件配置

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| condition | Object | 是 | - | 更新后的规则条件对象 |

#### 请求示例
```json
{
  "conditionId": 1,
  "ruleId": 1,
  "configType": "complex",
  "logic": "OR",
  "priority": 2
}
```

#### 响应数据
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null
}
```

### 2.4 删除规则条件

#### 接口信息
- **接口路径**: `/cpq/ruleCondition/{conditionId}`
- **请求方法**: DELETE
- **接口描述**: 删除指定条件及其所有子条件

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| conditionId | Long | 是 | - | 条件ID（路径参数） |

#### 响应数据
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

### 2.5 批量删除规则条件

#### 接口信息
- **接口路径**: `/cpq/ruleCondition/batch`
- **请求方法**: DELETE
- **接口描述**: 批量删除规则条件

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| conditionIds | Array | 是 | - | 条件ID数组 |

#### 请求示例
```json
{
  "conditionIds": [1, 2, 3]
}
```

#### 响应数据
```json
{
  "code": 200,
  "msg": "批量删除成功",
  "data": null
}
```

## 3. 动作配置接口

### 3.1 获取动作列表

#### 接口信息
- **接口路径**: `/cpq/ruleAction/listByRuleId/{ruleId}`
- **请求方法**: GET
- **接口描述**: 根据规则ID获取动作配置列表

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| ruleId | Long | 是 | - | 规则ID |

#### 响应数据
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "actionId": 1,
      "ruleId": 1,
      "actionType": "calculate",
      "actionName": "价格计算",
      "actionCode": "PRICE_CALC",
      "targetType": "node",
      "targetId": "node001",
      "actionParams": "{\"formula\": \"price * quantity\"}",
      "actionPriority": 1,
      "parentActionId": null,
      "actionSequence": 1,
      "executeCondition": "{\"type\": \"always\"}",
      "actionStatus": "0",
      "children": []
    }
  ]
}
```

#### 字段说明
| 字段名 | 类型 | 描述 |
|--------|------|------|
| actionId | Long | 动作ID |
| ruleId | Long | 规则ID |
| actionType | String | 动作类型 |
| actionName | String | 动作名称 |
| actionCode | String | 动作编码 |
| targetType | String | 目标对象类型 |
| targetId | String | 目标对象ID |
| actionParams | String | 动作参数（JSON格式） |
| actionPriority | Integer | 动作优先级 |
| parentActionId | Long | 父动作ID |
| actionSequence | Integer | 动作执行顺序 |
| executeCondition | String | 执行条件（JSON格式） |
| actionStatus | String | 动作状态：0启用，1禁用 |
| children | Array | 子动作列表 |

### 3.2 保存动作配置

#### 接口信息
- **接口路径**: `/cpq/ruleAction`
- **请求方法**: POST
- **接口描述**: 保存动作配置

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| action | Object | 是 | - | 动作配置对象 |

#### 请求示例
```json
{
  "ruleId": 1,
  "actionType": "calculate",
  "actionName": "价格计算",
  "actionCode": "PRICE_CALC",
  "targetType": "node",
  "targetId": "node001",
  "actionParams": "{\"formula\": \"price * quantity\"}",
  "actionPriority": 1,
  "actionSequence": 1,
  "executeCondition": "{\"type\": \"always\"}",
  "actionStatus": "0"
}
```

#### 响应数据
```json
{
  "code": 200,
  "msg": "保存成功",
  "data": {
    "actionId": 1,
    "ruleId": 1,
    "actionType": "calculate",
    "actionName": "价格计算",
    "actionCode": "PRICE_CALC",
    "targetType": "node",
    "targetId": "node001",
    "actionParams": "{\"formula\": \"price * quantity\"}",
    "actionPriority": 1,
    "actionSequence": 1,
    "executeCondition": "{\"type\": \"always\"}",
    "actionStatus": "0"
  }
}
```

## 4. 执行日志接口

### 4.1 获取执行日志列表

#### 接口信息
- **接口路径**: `/cpq/actionExecutionLog/list`
- **请求方法**: GET
- **接口描述**: 分页查询执行日志

#### 请求参数
| 参数名 | 类型 | 是否必填 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| pageNum | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页大小 |
| ruleId | Long | 否 | - | 规则ID |
| actionId | Long | 否 | - | 动作ID |
| executionStatus | String | 否 | - | 执行状态 |
| startTime | String | 否 | - | 开始时间 |
| endTime | String | 否 | - | 结束时间 |

#### 响应数据
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 100,
    "rows": [
      {
        "logId": 1,
        "actionId": 1,
        "ruleId": 1,
        "executionId": "exec_001",
        "sessionId": "sess_001",
        "userId": 1,
        "targetType": "node",
        "targetId": "node001",
        "actionType": "calculate",
        "inputParams": "{\"price\": 100, \"quantity\": 2}",
        "outputResult": "{\"result\": 200}",
        "executionStatus": "success",
        "errorMessage": "",
        "startTime": "2024-01-01 10:00:00",
        "endTime": "2024-01-01 10:00:01",
        "executionDuration": 1000,
        "retryCount": 0
      }
    ]
  }
}
```

#### 字段说明
| 字段名 | 类型 | 描述 |
|--------|------|------|
| logId | Long | 日志ID |
| actionId | Long | 动作ID |
| ruleId | Long | 规则ID |
| executionId | String | 执行批次ID |
| sessionId | String | 会话ID |
| userId | Long | 用户ID |
| targetType | String | 目标对象类型 |
| targetId | String | 目标对象ID |
| actionType | String | 动作类型 |
| inputParams | String | 输入参数（JSON格式） |
| outputResult | String | 输出结果（JSON格式） |
| executionStatus | String | 执行状态 |
| errorMessage | String | 错误信息 |
| startTime | String | 开始时间 |
| endTime | String | 结束时间 |
| executionDuration | Integer | 执行时长（毫秒） |
| retryCount | Integer | 重试次数 |

## 5. 错误码说明

### 5.1 通用错误码
| 错误码 | 错误信息 | 描述 |
|--------|----------|------|
| 200 | 操作成功 | 请求处理成功 |
| 400 | 请求参数错误 | 请求参数格式或内容错误 |
| 401 | 未授权 | 用户未登录或Token无效 |
| 403 | 权限不足 | 用户没有操作权限 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器内部错误 | 服务器处理请求时发生错误 |

### 5.2 业务错误码
| 错误码 | 错误信息 | 描述 |
|--------|----------|------|
| 1001 | 规则不存在 | 指定的规则ID不存在 |
| 1002 | 条件不存在 | 指定的条件ID不存在 |
| 1003 | 动作不存在 | 指定的动作ID不存在 |
| 1004 | 条件配置错误 | 条件配置数据格式错误 |
| 1005 | 动作配置错误 | 动作配置数据格式错误 |
| 1006 | 执行条件不满足 | 动作执行条件不满足 |

## 6. 接口调用示例

### 6.1 获取规则条件列表

#### 请求头
```http
GET /api/v1/cpq/ruleCondition/listByRuleId/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### 响应体
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "conditionId": 1,
      "ruleId": 1,
      "configType": "complex",
      "type": "group",
      "judgeType": "variable",
      "logic": "AND",
      "priority": 1,
      "children": [
        {
          "conditionId": 2,
          "ruleId": 1,
          "configType": "simple",
          "type": "number",
          "judgeType": "nodeStaticAttr",
          "node": "node001",
          "field": "price",
          "operator": ">",
          "value": "100",
          "priority": 1,
          "parentConditionId": 1
        }
      ]
    }
  ]
}
```

### 6.2 保存规则条件

#### 请求头
```http
POST /api/v1/cpq/ruleCondition HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### 请求体
```json
{
  "ruleId": 1,
  "configType": "complex",
  "type": "group",
  "judgeType": "variable",
  "logic": "AND",
  "priority": 1,
  "children": [
    {
      "configType": "simple",
      "type": "number",
      "judgeType": "nodeStaticAttr",
      "node": "node001",
      "field": "price",
      "operator": ">",
      "value": "100",
      "priority": 1
    }
  ]
}
```

#### 响应体
```json
{
  "code": 200,
  "msg": "保存成功",
  "data": {
    "conditionId": 1,
    "ruleId": 1,
    "configType": "complex",
    "type": "group",
    "judgeType": "variable",
    "logic": "AND",
    "priority": 1,
    "children": [
      {
        "conditionId": 2,
        "ruleId": 1,
        "configType": "simple",
        "type": "number",
        "judgeType": "nodeStaticAttr",
        "node": "node001",
        "field": "price",
        "operator": ">",
        "value": "100",
        "priority": 1,
        "parentConditionId": 1
      }
    ]
  }
}
```

## 7. 接口权限要求

### 7.1 权限级别
- **查看权限**: 可查看规则条件和动作配置
- **编辑权限**: 可修改规则条件和动作配置
- **删除权限**: 可删除规则条件和动作配置
- **执行权限**: 可执行规则和查看执行日志

### 7.2 权限控制
- 所有接口都需要JWT Token认证
- 敏感操作需要额外的权限验证
- 数据访问权限基于用户角色和所属组织

## 8. 使用注意事项

### 8.1 数据格式
- 所有JSON数据必须使用UTF-8编码
- 日期时间格式：yyyy-MM-dd HH:mm:ss
- 数字类型使用Long或Integer，避免使用浮点数

### 8.2 性能优化
- 批量操作时使用分页查询
- 复杂查询建议使用索引优化
- 大数据量操作建议使用异步处理

### 8.3 错误处理
- 客户端需要处理网络异常和超时情况
- 服务端错误需要记录详细日志
- 重要操作需要提供重试机制

---

*本文档将持续更新，以反映最新的接口变更和最佳实践。*