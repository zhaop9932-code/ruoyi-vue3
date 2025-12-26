# BOM结构动态属性管理前端开发文档

## 1. 需求说明
BOM结构动态属性管理，实现新增关联产品/系列/分类时自动汇聚属性和属性值，使用新表存储动态属性和属性值，属性值采用JSON格式存储。

## 2. 功能描述
- 新增关联产品/系列/分类时，自动汇聚属性和属性值到BOM结构
- 支持查看BOM结构的动态属性和属性值
- 支持编辑动态属性的配置
- 支持区分静态属性和动态属性

## 3. 接口说明

### 3.1 查询动态属性列表
- **接口地址**：`GET /cpq/superBomDynamicAttribute/list`
- **请求参数**：
  | 参数名 | 类型 | 描述 |
  | --- | --- | --- |
  | bomStructureId | Long | BOM结构ID |
  | attributeCode | String | 属性编码 |
  | attributeName | String | 属性名称 |
  | attributeType | String | 属性类型 |
  | sourceType | Integer | 来源类型 |
  | sourceId | Long | 来源ID |

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "rows": [
    {
      "id": 1,
      "bomStructureId": 1001,
      "attributeId": 2001,
      "attributeCode": "ATTR001",
      "attributeName": "颜色",
      "attributeType": "2",
      "componentType": "select",
      "sourceType": 1,
      "sourceId": 3001,
      "attributeValues": [{"valueCode": "RED", "valueName": "红色"}, {"valueCode": "BLUE", "valueName": "蓝色"}],
      "isRequired": "1",
      "defaultValue": "RED",
      "sortOrder": 1,
      "delFlag": "0",
      "createBy": "admin",
      "createTime": "2025-12-23 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-23 10:00:00"
    }
  ],
  "total": 1
}
```

### 3.2 根据BOM结构ID查询动态属性
- **接口地址**：`GET /cpq/superBomDynamicAttribute/byBomStructureId/{bomStructureId}`
- **请求参数**：
  | 参数名 | 类型 | 描述 |
  | --- | --- | --- |
  | bomStructureId | Long | BOM结构ID（路径参数） |

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "bomStructureId": 1001,
      "attributeId": 2001,
      "attributeCode": "ATTR001",
      "attributeName": "颜色",
      "attributeType": "2",
      "componentType": "select",
      "sourceType": 1,
      "sourceId": 3001,
      "attributeValues": [{"valueCode": "RED", "valueName": "红色"}, {"valueCode": "BLUE", "valueName": "蓝色"}],
      "isRequired": "1",
      "defaultValue": "RED",
      "sortOrder": 1,
      "delFlag": "0",
      "createBy": "admin",
      "createTime": "2025-12-23 10:00:00",
      "updateBy": "admin",
      "updateTime": "2025-12-23 10:00:00"
    }
  ]
}
```

### 3.3 获取动态属性详情
- **接口地址**：`GET /cpq/superBomDynamicAttribute/{id}`
- **请求参数**：
  | 参数名 | 类型 | 描述 |
  | --- | --- | --- |
  | id | Long | 动态属性ID（路径参数） |

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "bomStructureId": 1001,
    "attributeId": 2001,
    "attributeCode": "ATTR001",
    "attributeName": "颜色",
    "attributeType": "2",
    "componentType": "select",
    "sourceType": 1,
    "sourceId": 3001,
    "attributeValues": [{"valueCode": "RED", "valueName": "红色"}, {"valueCode": "BLUE", "valueName": "蓝色"}],
    "isRequired": "1",
    "defaultValue": "RED",
    "sortOrder": 1,
    "delFlag": "0",
    "createBy": "admin",
    "createTime": "2025-12-23 10:00:00",
    "updateBy": "admin",
    "updateTime": "2025-12-23 10:00:00"
  }
}
```

### 3.4 新增动态属性
- **接口地址**：`POST /cpq/superBomDynamicAttribute`
- **请求参数**：
```json
{
  "bomStructureId": 1001,
  "attributeId": 2001,
  "attributeCode": "ATTR001",
  "attributeName": "颜色",
  "attributeType": "2",
  "componentType": "select",
  "sourceType": 1,
  "sourceId": 3001,
  "attributeValues": [{"valueCode": "RED", "valueName": "红色"}, {"valueCode": "BLUE", "valueName": "蓝色"}],
  "isRequired": "1",
  "defaultValue": "RED",
  "sortOrder": 1
}
```

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 3.5 修改动态属性
- **接口地址**：`PUT /cpq/superBomDynamicAttribute`
- **请求参数**：
```json
{
  "id": 1,
  "bomStructureId": 1001,
  "attributeId": 2001,
  "attributeCode": "ATTR001",
  "attributeName": "颜色",
  "attributeType": "2",
  "componentType": "select",
  "sourceType": 1,
  "sourceId": 3001,
  "attributeValues": [{"valueCode": "RED", "valueName": "红色"}, {"valueCode": "BLUE", "valueName": "蓝色"}, {"valueCode": "GREEN", "valueName": "绿色"}],
  "isRequired": "1",
  "defaultValue": "RED",
  "sortOrder": 1
}
```

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

### 3.6 删除动态属性
- **接口地址**：`DELETE /cpq/superBomDynamicAttribute/{ids}`
- **请求参数**：
  | 参数名 | 类型 | 描述 |
  | --- | --- | --- |
  | ids | Long[] | 动态属性ID数组（路径参数，逗号分隔） |

- **响应示例**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1
}
```

## 4. 使用说明

### 4.1 查看动态属性
1. 在BOM结构管理页面，选择需要查看动态属性的BOM结构
2. 点击"动态属性"标签页，系统将调用`/cpq/superBomDynamicAttribute/byBomStructureId/{bomStructureId}`接口查询动态属性列表
3. 列表将显示动态属性的基本信息，包括属性名称、类型、来源等
4. 点击"查看详情"按钮，可以查看动态属性的详细信息和属性值

### 4.2 新增关联关系时自动汇聚属性
1. 在BOM结构管理页面，点击"关联产品"按钮
2. 选择关联类型（具体型号/产品系列/产品类目）
3. 选择关联对象
4. 保存关联关系后，系统将自动调用后端接口新增关联关系，并触发属性汇聚逻辑
5. 汇聚完成后，在动态属性列表中可以看到新增的动态属性

### 4.3 编辑动态属性
1. 在动态属性列表中，点击"编辑"按钮
2. 在编辑页面，可以修改动态属性的配置，包括是否必填、默认值、排序等
3. 保存修改后，系统将调用`PUT /cpq/superBomDynamicAttribute`接口更新动态属性

### 4.4 删除动态属性
1. 在动态属性列表中，选择需要删除的动态属性
2. 点击"删除"按钮，确认删除操作
3. 系统将调用`DELETE /cpq/superBomDynamicAttribute/{ids}`接口删除动态属性

## 5. 集成示例

### 5.1 查询动态属性列表示例
```javascript
// 导入axios
import axios from 'axios';

// 查询动态属性列表
async function getDynamicAttributes(bomStructureId) {
  try {
    const response = await axios.get(`/cpq/superBomDynamicAttribute/byBomStructureId/${bomStructureId}`);
    return response.data.data;
  } catch (error) {
    console.error('查询动态属性列表失败:', error);
    throw error;
  }
}

// 调用示例
const bomStructureId = 1001;
getDynamicAttributes(bomStructureId)
  .then(attributes => {
    console.log('动态属性列表:', attributes);
    // 处理动态属性列表数据
  })
  .catch(error => {
    console.error('获取动态属性失败:', error);
  });
```

### 5.2 渲染动态属性表单示例
```vue
<template>
  <div class="dynamic-attributes-form">
    <el-form :model="formData" label-width="120px">
      <el-form-item v-for="attribute in dynamicAttributes" :key="attribute.id" :label="attribute.attributeName" :required="attribute.isRequired === '1'">
        <!-- 文本类型 -->
        <el-input v-if="attribute.attributeType === '0'" v-model="formData[attribute.attributeCode]" placeholder="请输入{{ attribute.attributeName }}"></el-input>
        
        <!-- 数值类型 -->
        <el-input-number v-else-if="attribute.attributeType === '1'" v-model="formData[attribute.attributeCode]" :min="0" :precision="2"></el-input-number>
        
        <!-- 下拉类型 -->
        <el-select v-else-if="attribute.attributeType === '2'" v-model="formData[attribute.attributeCode]" placeholder="请选择{{ attribute.attributeName }}">
          <el-option v-for="value in attribute.attributeValues" :key="value.valueCode" :label="value.valueName" :value="value.valueCode"></el-option>
        </el-select>
        
        <!-- 单选类型 -->
        <el-radio-group v-else-if="attribute.attributeType === '3'" v-model="formData[attribute.attributeCode]">
          <el-radio v-for="value in attribute.attributeValues" :key="value.valueCode" :label="value.valueCode">{{ value.valueName }}</el-radio>
        </el-radio-group>
        
        <!-- 多选类型 -->
        <el-checkbox-group v-else-if="attribute.attributeType === '4'" v-model="formData[attribute.attributeCode]">
          <el-checkbox v-for="value in attribute.attributeValues" :key="value.valueCode" :label="value.valueCode">{{ value.valueName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bomStructureId: 1001,
      dynamicAttributes: [],
      formData: {}
    };
  },
  mounted() {
    this.loadDynamicAttributes();
  },
  methods: {
    async loadDynamicAttributes() {
      try {
        const response = await this.$axios.get(`/cpq/superBomDynamicAttribute/byBomStructureId/${this.bomStructureId}`);
        this.dynamicAttributes = response.data.data;
        
        // 初始化表单数据
        this.dynamicAttributes.forEach(attribute => {
          if (attribute.defaultValue) {
            this.formData[attribute.attributeCode] = attribute.defaultValue;
          } else {
            this.formData[attribute.attributeCode] = '';
          }
        });
      } catch (error) {
        this.$message.error('加载动态属性失败');
        console.error('加载动态属性失败:', error);
      }
    },
    submitForm() {
      // 提交表单逻辑
      console.log('表单数据:', this.formData);
    },
    resetForm() {
      // 重置表单逻辑
      this.dynamicAttributes.forEach(attribute => {
        if (attribute.defaultValue) {
          this.formData[attribute.attributeCode] = attribute.defaultValue;
        } else {
          this.formData[attribute.attributeCode] = '';
        }
      });
    }
  }
};
</script>
```

## 6. 注意事项

1. **权限控制**：前端需要确保用户具有访问动态属性管理的权限，根据后端返回的权限信息控制按钮的显示和隐藏
2. **数据格式化**：动态属性值采用JSON格式存储，前端需要正确处理JSON数据的解析和渲染
3. **异步处理**：所有接口调用都需要正确处理异步操作，包括加载状态、错误处理等
4. **性能优化**：对于大量动态属性的情况，建议采用分页加载或懒加载方式，提高页面渲染性能
5. **数据验证**：前端需要根据动态属性的配置（如是否必填、属性类型等）进行客户端数据验证

## 7. 版本历史

| 版本 | 日期 | 描述 |
| --- | --- | --- |
| v1.0 | 2025-12-23 | 初始版本，实现BOM结构动态属性管理功能 |

## 8. 联系方式

如有任何问题或建议，请联系后端开发团队。