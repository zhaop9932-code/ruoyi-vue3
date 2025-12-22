# 产品相关操作接口文档

## 1. 产品主数据接口

### 1.1 查询产品主数据列表

**接口地址**：`/cpq/product/list`
**请求方法**：GET
**权限标识**：`cpq/product:list`
**功能描述**：查询产品主数据列表，支持分页和条件查询
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productCode | String | 否 | 产品编码 |
| productName | String | 否 | 产品名称 |
| catalogId | Long | 否 | 所属目录ID |
| brandId | Long | 否 | 品牌ID |
| seriesId | Long | 否 | 系列ID |
| productStatus | String | 否 | 产品状态（0：概念，1：开发，2：上市，3：退市） |
| materialType | String | 否 | 物料类型(0:原材料，1：半成品，2：成品，3：配件) |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "productId": 1,
      "productCode": "P001",
      "productName": "测试产品",
      "catalogId": 1001,
      "brandId": 1,
      "seriesId": 1,
      "productModel": "M001",
      "packagingUnit": "台",
      "weight": 10.5,
      "dimensions": "100×200×300",
      "warrantyPeriod": "12",
      "productDesc": "测试产品描述",
      "specification": "测试规格",
      "technicalParams": "测试技术参数",
      "mainImageUrl": "http://example.com/image.jpg",
      "imageUrls": "[{\"url\":\"http://example.com/image1.jpg\"},{\"url\":\"http://example.com/image2.jpg\"}]",
      "detailPageUrl": "http://example.com/detail.html",
      "model3DUrl": "http://example.com/model3d.glb",
      "manualUrl": "http://example.com/manual.pdf",
      "installationGuideUrl": "http://example.com/guide.pdf",
      "videoUrl": "http://example.com/video.mp4",
      "productStatus": "2",
      "materialType": "2",
      "version": "V1.0",
      "createBy": "admin",
      "createTime": "2025-12-06 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-06 10:00:00"
    }
  ],
  "total": 1
}
```

### 1.2 导出产品主数据列表

**接口地址**：`/cpq/product/export`
**请求方法**：POST
**权限标识**：`cpq:product:export`
**功能描述**：导出产品主数据列表
**请求参数**：同查询产品主数据列表
**响应示例**：Excel文件流

### 1.3 获取产品主数据详细信息

**接口地址**：`/cpq/product/{productId}`
**请求方法**：GET
**权限标识**：`cpq:product:query`
**功能描述**：获取产品主数据详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productId | Long | 是 | 产品ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "productId": 1,
    "productCode": "P001",
    "productName": "测试产品",
    "catalogId": 1001,
    "brandId": 1,
    "seriesId": 1,
    "productModel": "M001",
    "packagingUnit": "台",
    "weight": 10.5,
    "dimensions": "100×200×300",
    "warrantyPeriod": "12",
    "productDesc": "测试产品描述",
    "specification": "测试规格",
    "technicalParams": "测试技术参数",
    "mainImageUrl": "http://example.com/image.jpg",
    "imageUrls": "[{\"url\":\"http://example.com/image1.jpg\"},{\"url\":\"http://example.com/image2.jpg\"}]",
    "detailPageUrl": "http://example.com/detail.html",
    "model3DUrl": "http://example.com/model3d.glb",
    "manualUrl": "http://example.com/manual.pdf",
    "installationGuideUrl": "http://example.com/guide.pdf",
    "videoUrl": "http://example.com/video.mp4",
    "productStatus": "2",
    "materialType": "2",
    "version": "V1.0",
    "createBy": "admin",
    "createTime": "2025-12-06 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-06 10:00:00"
  }
}
```

### 1.4 新增产品主数据

**接口地址**：`/cpq/product`
**请求方法**：POST
**权限标识**：`cpq:product:add`
**功能描述**：新增产品主数据
**请求参数**：
```json
{
  "productCode": "P001",
  "productName": "测试产品",
  "catalogId": 1001,
  "brandId": 1,
  "seriesId": 1,
  "productModel": "M001",
  "packagingUnit": "台",
  "weight": 10.5,
  "dimensions": "100×200×300",
  "warrantyPeriod": "12",
  "productDesc": "测试产品描述",
  "specification": "测试规格",
  "technicalParams": "测试技术参数",
  "productStatus": "2",
  "materialType": "2",
  "version": "V1.0"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 1.5 修改产品主数据

**接口地址**：`/cpq/product`
**请求方法**：PUT
**权限标识**：`cpq:product:edit`
**功能描述**：修改产品主数据
**请求参数**：
```json
{
  "productId": 1,
  "productCode": "P001",
  "productName": "测试产品",
  "catalogId": 1001,
  "brandId": 1,
  "seriesId": 1,
  "productModel": "M001",
  "packagingUnit": "台",
  "weight": 10.5,
  "dimensions": "100×200×300",
  "warrantyPeriod": "12",
  "productDesc": "测试产品描述",
  "specification": "测试规格",
  "technicalParams": "测试技术参数",
  "productStatus": "2",
  "materialType": "2",
  "version": "V1.0"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 1.6 删除产品主数据

**接口地址**：`/cpq/product/{productIds}`
**请求方法**：DELETE
**权限标识**：`cpq:product:remove`
**功能描述**：删除产品主数据
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productIds | Long[] | 是 | 产品ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

## 2. 产品目录接口

### 2.1 查询产品目录列表

**接口地址**：`/cpq/catalog/list`
**请求方法**：GET
**权限标识**：`cpq:catalog:list`
**功能描述**：查询产品目录列表，支持分页和条件查询
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| catalogCode | String | 否 | 目录编码 |
| catalogName | String | 否 | 目录名称 |
| parentId | Long | 否 | 父目录ID |
| status | String | 否 | 状态 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "catalogId": 1001,
      "catalogCode": "CAT001",
      "catalogName": "测试目录",
      "parentId": 0,
      "catalogLevel": 1,
      "status": "0",
      "createBy": "admin",
      "createTime": "2025-12-06 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-06 10:00:00"
    }
  ],
  "total": 1
}
```

### 2.2 导出产品目录列表

**接口地址**：`/cpq/catalog/export`
**请求方法**：POST
**权限标识**：`cpq:catalog:export`
**功能描述**：导出产品目录列表
**请求参数**：同查询产品目录列表
**响应示例**：Excel文件流

### 2.3 获取产品目录详细信息

**接口地址**：`/cpq/catalog/{catalogId}`
**请求方法**：GET
**权限标识**：`cpq:catalog:query`
**功能描述**：获取产品目录详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| catalogId | Long | 是 | 目录ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "catalogId": 1001,
    "catalogCode": "CAT001",
    "catalogName": "测试目录",
    "parentId": 0,
    "catalogLevel": 1,
    "status": "0",
    "createBy": "admin",
    "createTime": "2025-12-06 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-06 10:00:00"
  }
}
```

### 2.4 获取产品目录树列表

**接口地址**：`/cpq/catalog/tree`
**请求方法**：GET
**权限标识**：`cpq:catalog:list`
**功能描述**：获取产品目录树列表
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "catalogId": 1001,
      "catalogCode": "CAT001",
      "catalogName": "测试目录",
      "parentId": 0,
      "catalogLevel": 1,
      "status": "0",
      "children": [
        {
          "catalogId": 1002,
          "catalogCode": "CAT002",
          "catalogName": "子目录",
          "parentId": 1001,
          "catalogLevel": 2,
          "status": "0"
        }
      ]
    }
  ]
}
```

### 2.5 新增产品目录

**接口地址**：`/cpq/catalog`
**请求方法**：POST
**权限标识**：`cpq:catalog:add`
**功能描述**：新增产品目录
**请求参数**：
```json
{
  "catalogCode": "CAT001",
  "catalogName": "测试目录",
  "parentId": 0,
  "status": "0"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 2.6 修改产品目录

**接口地址**：`/cpq/catalog`
**请求方法**：PUT
**权限标识**：`cpq:catalog:edit`
**功能描述**：修改产品目录
**请求参数**：
```json
{
  "catalogId": 1001,
  "catalogCode": "CAT001",
  "catalogName": "测试目录",
  "parentId": 0,
  "status": "0"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 2.7 删除产品目录

**接口地址**：`/cpq/catalog/{catalogIds}`
**请求方法**：DELETE
**权限标识**：`cpq:catalog:remove`
**功能描述**：删除产品目录
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| catalogIds | Long[] | 是 | 目录ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

## 3. 产品属性接口

### 3.1 查询产品属性列表

**接口地址**：`/cpq/attribute/list`
**请求方法**：GET
**权限标识**：`cpq:attribute:list`
**功能描述**：查询产品属性列表，支持分页和条件查询
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| attributeCode | String | 否 | 属性编码 |
| attributeName | String | 否 | 属性名称 |
| attributeType | String | 否 | 属性类型（1：文本，2：下拉，3：数值，4：日期） |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "attributeId": 1,
      "attributeCode": "ATTR001",
      "attributeName": "颜色",
      "attributeType": "2",
      "options": "红色,蓝色,绿色",
      "defaultValue": "红色",
      "isRequired": "1",
      "unit": "个",
      "createBy": "admin",
      "createTime": "2025-12-06 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-06 10:00:00"
    }
  ],
  "total": 1
}
```

### 3.2 导出产品属性列表

**接口地址**：`/cpq/attribute/export`
**请求方法**：POST
**权限标识**：`cpq:attribute:export`
**功能描述**：导出产品属性列表
**请求参数**：同查询产品属性列表
**响应示例**：Excel文件流

### 3.3 获取产品属性详细信息

**接口地址**：`/cpq/attribute/{attributeId}`
**请求方法**：GET
**权限标识**：`cpq:attribute:query`
**功能描述**：获取产品属性详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| attributeId | Long | 是 | 属性ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "attributeId": 1,
    "attributeCode": "ATTR001",
    "attributeName": "颜色",
    "attributeType": "2",
    "options": "红色,蓝色,绿色",
    "defaultValue": "红色",
    "isRequired": "1",
    "unit": "个",
    "createBy": "admin",
    "createTime": "2025-12-06 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-06 10:00:00"
  }
}
```

### 3.4 新增产品属性

**接口地址**：`/cpq/attribute`
**请求方法**：POST
**权限标识**：`cpq:attribute:add`
**功能描述**：新增产品属性
**请求参数**：
```json
{
  "attributeCode": "ATTR001",
  "attributeName": "颜色",
  "attributeType": "2",
  "options": "红色,蓝色,绿色",
  "defaultValue": "红色",
  "isRequired": "1",
  "unit": "个"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 3.5 修改产品属性

**接口地址**：`/cpq/attribute`
**请求方法**：PUT
**权限标识**：`cpq:attribute:edit`
**功能描述**：修改产品属性
**请求参数**：
```json
{
  "attributeId": 1,
  "attributeCode": "ATTR001",
  "attributeName": "颜色",
  "attributeType": "2",
  "options": "红色,蓝色,绿色",
  "defaultValue": "红色",
  "isRequired": "1",
  "unit": "个"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 3.6 删除产品属性

**接口地址**：`/cpq/attribute/{attributeIds}`
**请求方法**：DELETE
**权限标识**：`cpq:attribute:remove`
**功能描述**：删除产品属性
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| attributeIds | Long[] | 是 | 属性ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 3.7 校验属性编码是否唯一

**接口地址**：`/cpq/attribute/checkAttributeCodeUnique`
**请求方法**：POST
**权限标识**：无
**功能描述**：校验属性编码是否唯一
**请求参数**：
```json
{
  "attributeCode": "ATTR001",
  "attributeId": 1
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": false
}
```

### 3.8 校验属性名称是否唯一

**接口地址**：`/cpq/attribute/checkAttributeNameUnique`
**请求方法**：POST
**权限标识**：无
**功能描述**：校验属性名称是否唯一
**请求参数**：
```json
{
  "attributeName": "颜色",
  "attributeId": 1
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": false
}
```

## 4. 产品属性值接口

### 4.1 查询产品属性值列表

**接口地址**：`/cpq/attribute/value/list`
**请求方法**：GET
**权限标识**：`cpq:attribute:value:list`
**功能描述**：查询产品属性值列表，支持分页和条件查询
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| attributeId | Long | 否 | 属性ID |
| attributeValue | String | 否 | 属性值 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "id": 1,
      "attributeId": 1,
      "attributeValue": "红色",
      "valueConditions": "",
      "valueActions": "",
      "isDefault": "1",
      "sortOrder": 1,
      "iconUrl": "http://example.com/red.jpg",
      "createBy": "admin",
      "createTime": "2025-12-06 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-06 10:00:00"
    }
  ],
  "total": 1
}
```

### 4.2 导出产品属性值列表

**接口地址**：`/cpq/attribute/value/export`
**请求方法**：POST
**权限标识**：`cpq:attribute:value:export`
**功能描述**：导出产品属性值列表
**请求参数**：同查询产品属性值列表
**响应示例**：Excel文件流

### 4.3 获取产品属性值详细信息

**接口地址**：`/cpq/attribute/value/{id}`
**请求方法**：GET
**权限标识**：`cpq:attribute:value:query`
**功能描述**：获取产品属性值详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | Long | 是 | 属性值ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "attributeId": 1,
    "attributeValue": "红色",
    "valueConditions": "",
    "valueActions": "",
    "isDefault": "1",
    "sortOrder": 1,
    "iconUrl": "http://example.com/red.jpg",
    "createBy": "admin",
    "createTime": "2025-12-06 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-06 10:00:00"
  }
}
```

### 4.4 新增产品属性值

**接口地址**：`/cpq/attribute/value`
**请求方法**：POST
**权限标识**：`cpq:attribute:value:add`
**功能描述**：新增产品属性值
**请求参数**：
```json
{
  "attributeId": 1,
  "attributeValue": "红色",
  "valueConditions": "",
  "valueActions": "",
  "isDefault": "1",
  "sortOrder": 1,
  "iconUrl": "http://example.com/red.jpg"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 4.5 修改产品属性值

**接口地址**：`/cpq/attribute/value`
**请求方法**：PUT
**权限标识**：`cpq:attribute:value:edit`
**功能描述**：修改产品属性值
**请求参数**：
```json
{
  "id": 1,
  "attributeId": 1,
  "attributeValue": "红色",
  "valueConditions": "",
  "valueActions": "",
  "isDefault": "1",
  "sortOrder": 1,
  "iconUrl": "http://example.com/red.jpg"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 4.6 删除产品属性值

**接口地址**：`/cpq/attribute/value/{ids}`
**请求方法**：DELETE
**权限标识**：`cpq:attribute:value:remove`
**功能描述**：删除产品属性值
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| ids | Long[] | 是 | 属性值ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

## 5. 产品属性关联接口

### 5.1 根据产品ID查询产品属性关联列表

**接口地址**：`/cpq/productAttributeRelation/list/{productId}`
**请求方法**：GET
**权限标识**：`cpq:product:attribute:list`
**功能描述**：根据产品ID查询产品属性关联列表
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productId | Long | 是 | 产品ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "relationId": 1,
      "productId": 1001,
      "attributeId": 1,
      "catalogRelationId": 101,
      "attributeValue": "红色",
      "attribute": {
        "attributeId": 1,
        "attributeName": "颜色",
        "attributeType": "2",
        "options": "红色,蓝色,绿色"
      },
      "createBy": "admin",
      "createTime": "2025-12-10 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-10 10:00:00"
    }
  ]
}
```

### 5.2 获取产品属性关联详细信息

**接口地址**：`/cpq/productAttributeRelation/{relationId}`
**请求方法**：GET
**权限标识**：`cpq:product:attribute:query`
**功能描述**：获取产品属性关联详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| relationId | Long | 是 | 产品属性关联ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "relationId": 1,
    "productId": 1001,
    "attributeId": 1,
    "catalogRelationId": 101,
    "attributeValue": "红色",
    "attribute": {
      "attributeId": 1,
      "attributeName": "颜色",
      "attributeType": "2",
      "options": "红色,蓝色,绿色"
    },
    "createBy": "admin",
    "createTime": "2025-12-10 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-10 10:00:00"
  }
}
```

### 5.3 修改产品属性关联

**接口地址**：`/cpq/productAttributeRelation`
**请求方法**：PUT
**权限标识**：`cpq:product:attribute:edit`
**功能描述**：修改产品属性关联
**请求参数**：
```json
{
  "relationId": 1,
  "attributeValue": "蓝色"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 5.4 批量修改产品属性关联

**接口地址**：`/cpq/productAttributeRelation/batchUpdate`
**请求方法**：POST
**权限标识**：`cpq:product:attribute:edit`
**功能描述**：批量修改产品属性关联
**请求参数**：
```json
[
  {
    "relationId": 1,
    "attributeValue": "蓝色"
  },
  {
    "relationId": 2,
    "attributeValue": "1000mAh"
  }
]
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "更新成功，共更新2条记录",
  "data": null
}
```

### 5.5 删除产品属性关联

**接口地址**：`/cpq/productAttributeRelation/remove/{relationIds}`
**请求方法**：GET
**权限标识**：`cpq:product:attribute:remove`
**功能描述**：删除产品属性关联
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| relationIds | Long[] | 是 | 产品属性关联ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

## 6. 产品价格接口

### 6.1 查询产品价格列表

**接口地址**：`/cpq/productPrice/list`
**请求方法**：GET
**权限标识**：`cpq:productPrice:list`
**功能描述**：查询产品价格列表，支持分页和条件查询
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productId | Long | 否 | 产品ID |
| priceType | String | 否 | 价格类型 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "id": 1,
      "productId": 1,
      "priceType": "1",
      "price": 100.00,
      "currency": "CNY",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "createBy": "admin",
      "createTime": "2025-12-06 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-06 10:00:00"
    }
  ],
  "total": 1
}
```

### 6.2 导出产品价格列表

**接口地址**：`/cpq/productPrice/export`
**请求方法**：GET
**权限标识**：`cpq:productPrice:export`
**功能描述**：导出产品价格列表
**请求参数**：同查询产品价格列表
**响应示例**：Excel文件流

### 6.3 获取产品价格详细信息

**接口地址**：`/cpq/productPrice/{id}`
**请求方法**：GET
**权限标识**：`cpq:productPrice:query`
**功能描述**：获取产品价格详细信息
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | Long | 是 | 价格ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "productId": 1,
    "priceType": "1",
    "price": 100.00,
    "currency": "CNY",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "createBy": "admin",
    "createTime": "2025-12-06 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-06 10:00:00"
  }
}
```

### 6.4 新增产品价格

**接口地址**：`/cpq/productPrice`
**请求方法**：POST
**权限标识**：`cpq:productPrice:add`
**功能描述**：新增产品价格
**请求参数**：
```json
{
  "productId": 1,
  "priceType": "1",
  "price": 100.00,
  "currency": "CNY",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 6.5 修改产品价格

**接口地址**：`/cpq/productPrice`
**请求方法**：PUT
**权限标识**：`cpq:productPrice:edit`
**功能描述**：修改产品价格
**请求参数**：
```json
{
  "id": 1,
  "productId": 1,
  "priceType": "1",
  "price": 150.00,
  "currency": "CNY",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 6.6 删除产品价格

**接口地址**：`/cpq/productPrice/{ids}`
**请求方法**：DELETE
**权限标识**：`cpq:productPrice:remove`
**功能描述**：删除产品价格
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| ids | Long[] | 是 | 价格ID数组 |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 6.7 根据产品ID查询产品价格

**接口地址**：`/cpq/productPrice/byProductId/{productId}`
**请求方法**：GET
**权限标识**：`cpq:productPrice:query`
**功能描述**：根据产品ID查询产品价格
**请求参数**：
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| productId | Long | 是 | 产品ID |
**响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "priceType": "1",
      "price": 100.00,
      "currency": "CNY",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31"
    }
  ]
}
```

## 7. 数据结构说明

### 7.1 产品主数据对象（CpqProductMaster）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| productId | Long | 产品ID |
| productCode | String | 产品编码 |
| productName | String | 产品名称 |
| catalogId | Long | 所属目录ID |
| brandId | Long | 品牌ID |
| seriesId | Long | 系列ID |
| productModel | String | 产品型号 |
| packagingUnit | String | 包装单位 |
| weight | Double | 产品重量（kg） |
| dimensions | String | 产品尺寸（长×宽×高，单位：mm） |
| warrantyPeriod | String | 保质期（月） |
| productDesc | String | 产品描述 |
| specification | String | 产品规格 |
| technicalParams | String | 技术参数 |
| mainImageUrl | String | 产品主图片URL |
| imageUrls | String | 产品图片列表（JSON格式存储多个图片URL） |
| detailPageUrl | String | 产品详情页URL |
| model3DUrl | String | 产品3D模型URL |
| manualUrl | String | 产品手册URL |
| installationGuideUrl | String | 安装指南URL |
| videoUrl | String | 视频介绍URL |
| productStatus | String | 产品状态（0：概念，1：开发，2：上市，3：退市） |
| materialType | String | 物料类型(0:原材料，1：半成品，2：成品，3：配件) |
| version | String | 产品版本 |

### 7.2 产品属性关联对象（CpqProductAttributeRelation）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| relationId | Long | 关联ID |
| productId | Long | 产品ID |
| attributeId | Long | 属性ID |
| catalogRelationId | Long | 目录属性关联ID |
| attributeValue | String | 属性值 |
| attribute | CpqProductAttribute | 关联的属性对象 |
| product | CpqProductMaster | 关联的产品对象 |

### 7.3 产品属性对象（CpqProductAttribute）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| attributeId | Long | 属性ID |
| attributeCode | String | 属性编码 |
| attributeName | String | 属性名称 |
| attributeType | String | 属性类型（1：文本，2：下拉，3：数值，4：日期） |
| options | String | 下拉选项（JSON格式） |
| defaultValue | String | 默认值 |
| isRequired | String | 是否必填（0：否，1：是） |
| unit | String | 单位 |

## 8. 接口使用说明

### 8.1 产品属性自动带出流程

1. **选择产品目录**：在产品主数据页面选择产品目录
2. **自动集成属性**：系统自动将目录的属性集成到产品
3. **查看产品属性**：切换到产品属性标签页，调用 `/cpq/productAttributeRelation/list/{productId}` 接口获取产品属性列表
4. **编辑属性值**：根据属性类型编辑属性值
5. **保存属性值**：调用 `/cpq/productAttributeRelation/batchUpdate` 接口批量保存属性值

### 8.2 权限管理

所有接口都需要相应的权限标识才能访问，权限标识格式为 `cpq:模块:操作`，例如 `cpq:product:list` 表示查询产品列表的权限。

### 8.3 分页参数

列表查询接口默认支持分页，分页参数为：
- `pageNum`：页码，默认值为 1
- `pageSize`：每页条数，默认值为 10

### 8.4 响应格式

所有接口的响应格式统一为：
```json
{
  "code": 200,  // 响应码，200表示成功
  "msg": "操作成功",  // 响应消息
  "data": {}  // 响应数据
}
```

## 9. 开发注意事项

1. **接口版本控制**：接口地址中不包含版本号，后续如需版本控制，建议在路径中添加版本号，如 `/cpq/v2/product/list`
2. **异常处理**：调用接口时应处理可能的异常情况，如网络异常、权限不足等
3. **参数验证**：客户端应在调用接口前验证参数的合法性，减少无效请求
4. **性能优化**：对于大数据量的查询，建议使用分页查询，并合理设置分页大小
5. **安全性**：敏感数据应进行加密传输，避免明文传输
6. **幂等性**：PUT、DELETE等接口应保证幂等性，避免重复操作导致数据不一致


