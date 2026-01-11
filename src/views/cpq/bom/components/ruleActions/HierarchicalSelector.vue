<template>
  <!-- 节点选择 -->
  <el-row :gutter="20">
    <el-col :span="12">
      <el-form-item label="节点">
        <el-select 
          :model-value="node" 
          @update:model-value="$emit('update:node', $event)"
          placeholder="请选择当前BOM下树状节点"
          @change="$emit('nodeChange', $event)"
          style="width: 100%"
        >
          <el-option label="节点1" value="node1" />
          <el-option label="节点2" value="node2" />
          <el-option label="节点3" value="node3" />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
  
  <!-- 静态属性选择 - 在节点选择后显示 -->
  <el-row :gutter="20" v-if="node">
    <el-col :span="12">
      <el-form-item label="静态属性">
        <el-select 
          :model-value="staticAttr" 
          @update:model-value="$emit('update:staticAttr', $event)"
          placeholder="请选择节点下静态属性"
          @change="$emit('staticAttrChange', $event)"
          style="width: 100%"
        >
          <el-option label="静态属性1" value="attr1" />
          <el-option label="静态属性2" value="attr2" />
          <el-option label="静态属性3" value="attr3" />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
  
  <!-- 目标对象选择 - 在静态属性选择后显示 -->
  <el-row :gutter="20" v-if="staticAttr">
    <el-col :span="12">
      <el-form-item label="目标对象">
        <el-select 
          :model-value="attrValues" 
          @update:model-value="$emit('update:attrValues', $event)"
          multiple
          placeholder="请选择静态属性下属性值"
          @change="$emit('attrValuesChange', $event)"
          style="width: 100%"
        >
          <el-option label="属性值1" value="value1" />
          <el-option label="属性值2" value="value2" />
          <el-option label="属性值3" value="value3" />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
defineProps({
  node: {
    type: String,
    default: ''
  },
  staticAttr: {
    type: String,
    default: ''
  },
  attrValues: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'update:node',
  'update:staticAttr', 
  'update:attrValues',
  'nodeChange',
  'staticAttrChange',
  'attrValuesChange'
])
</script>