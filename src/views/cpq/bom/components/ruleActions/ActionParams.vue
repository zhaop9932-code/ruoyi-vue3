<template>
  <div class="action-params">
    <!-- 结构化参数输入，根据动作类型和目标类型显示不同的表单 -->
    <div v-if="actionType" class="structured-params">
      <!-- 基础动作参数 - 是否类型 (是否启用、是否显示、是否必选) -->
      <template v-if="['isEnable', 'isShow', 'isRequired', 'reset'].includes(actionType)">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="操作值"> -->
              <el-switch 
                v-model="localParams.value" 
                @change="updateActionParams"
                active-text="是"
                inactive-text="否"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 推荐动作参数 - 文本输入类型 (推荐节点、推荐属性、推荐产品等) -->
      <template v-else-if="['isRecommend', 'recommend'].includes(actionType)">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="推荐内容"> -->
              <el-input 
                v-model="localParams.value" 
                @input="updateActionParams"
                placeholder="请输入推荐内容（如：推荐节点、推荐属性、推荐产品等）"
                style="width: 100%"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 基础动作参数 (启用、禁用、必选、推荐、显示、隐藏、排除) - 兼容旧类型 -->
      <template v-else-if="['enable', 'disable', 'required', 'recommend', 'show', 'hide', 'exclude'].includes(actionType)">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'node'" label="节点1" value="node1" />
                <el-option v-if="targetType === 'node'" label="节点2" value="node2" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性1" value="attr1" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性2" value="attr2" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="属性值1" value="value1" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="属性值2" value="value2" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性1" value="dynAttr1" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性2" value="dynAttr2" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态值1" value="dynValue1" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态值2" value="dynValue2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 联动排除动作参数 -->
      <template v-else-if="actionType === 'exclude'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值1" value="staticValue1" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值2" value="staticValue2" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值1" value="dynamicValue1" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值2" value="dynamicValue2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 重置动作参数 -->
      <template v-else-if="actionType === 'reset'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'variable'" label="变量1" value="var1" />
                <el-option v-if="targetType === 'variable'" label="变量2" value="var2" />
                <el-option v-if="targetType === 'node'" label="节点1" value="node1" />
                <el-option v-if="targetType === 'node'" label="节点2" value="node2" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性1" value="attr1" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性2" value="attr2" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性1" value="dynAttr1" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性2" value="dynAttr2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 聚焦动作参数 -->
      <template v-else-if="actionType === 'focus'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'node'" label="节点1" value="node1" />
                <el-option v-if="targetType === 'node'" label="节点2" value="node2" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性1" value="attr1" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性2" value="attr2" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性1" value="dynAttr1" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性2" value="dynAttr2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 联动选中动作参数 -->
      <template v-else-if="actionType === 'linkSelect'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值1" value="staticValue1" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值2" value="staticValue2" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值1" value="dynamicValue1" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值2" value="dynamicValue2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 触发规则参数 -->
      <template v-else-if="actionType === 'triggerRule'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="触发规则"> -->
              <el-select 
                v-model="localParams.ruleId" 
                @change="updateActionParams"
                multiple
                placeholder="请选择当前BOM下的规则"
                style="width: 100%"
              >
                <el-option label="规则1" value="rule1" />
                <el-option label="规则2" value="rule2" />
                <el-option label="规则3" value="rule3" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="规则参数"> -->
              <el-input 
                v-model="actionParamsText" 
                type="textarea" 
                :rows="2" 
                placeholder="请输入规则参数(JSON格式)"
                @input="handleJsonInput"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 应用折扣参数 -->
      <template v-else-if="actionType === 'applyDiscount'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="折扣类型"> -->
              <el-select v-model="localParams.type" @change="updateActionParams">
                <el-option label="百分比" value="percentage" />
                <el-option label="固定金额" value="fixed" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="折扣值"> -->
              <el-input-number v-model="localParams.value" @change="updateActionParams" :min="0" :step="0.01" placeholder="请输入折扣值" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="是否叠加"> -->
              <el-switch 
                v-model="localParams.isStackable" 
                @change="updateActionParams"
                active-text="是"
                inactive-text="否"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 应用满减参数 -->
      <template v-else-if="actionType === 'applyFullReduction'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="满减条件类型"> -->
              <el-select v-model="localParams.conditionType" @change="updateActionParams">
                <el-option label="满金额" value="amount" />
                <el-option label="满数量" value="quantity" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="条件值"> -->
              <el-input-number v-model="localParams.conditionValue" @change="updateActionParams" :min="0" :step="1" placeholder="请输入条件值" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="减额类型"> -->
              <el-select v-model="localParams.reduceType" @change="updateActionParams">
                <el-option label="固定金额" value="fixed" />
                <el-option label="百分比" value="percentage" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="减额值"> -->
              <el-input-number v-model="localParams.reduceValue" @change="updateActionParams" :min="0" :step="1" placeholder="请输入减额值" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="是否循环满减"> -->
              <el-switch 
                v-model="localParams.isLoop" 
                @change="updateActionParams"
                active-text="是"
                inactive-text="否"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 设置单价参数 -->
      <template v-else-if="actionType === 'setPrice'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="单价设置方式"> -->
              <el-select v-model="localParams.settingType" @change="updateActionParams">
                <el-option label="固定价格" value="fixed" />
                <el-option label="公式计算" value="formula" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- <el-form-item label="单价值/公式"> -->
              <el-input 
                v-model="localParams.value" 
                @input="updateActionParams" 
                :type="localParams.settingType === 'formula' ? 'textarea' : 'input'"
                :rows="localParams.settingType === 'formula' ? 3 : 1"
                placeholder="请输入单价值或计算公式"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 相互联动-多选参数 -->
      <template v-else-if="actionType === 'multipleSelect'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="最少选择数量"> -->
              <el-input-number v-model="localParams.minSelect" @change="updateActionParams" :min="0" :step="1" placeholder="请输入最少选择数量" />
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="最多选择数量"> -->
              <el-input-number v-model="localParams.maxSelect" @change="updateActionParams" :min="1" :step="1" placeholder="请输入最多选择数量" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 相互联动-相互选中参数 -->
      <template v-else-if="actionType === 'mutualSelect'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性1" value="attr1" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性2" value="attr2" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值1" value="value1" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值2" value="value2" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性1" value="dynAttr1" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性2" value="dynAttr2" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值1" value="dynValue1" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值2" value="dynValue2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 相互联动-相互排斥参数 -->
      <template v-else-if="actionType === 'mutualExclude'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="目标对象"> -->
              <el-select 
                v-model="localParams.target" 
                @change="updateActionParams"
                multiple
                placeholder="请选择目标对象"
                style="width: 100%"
              >
                <!-- 根据目标类型动态加载选项 -->
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性1" value="attr1" />
                <el-option v-if="targetType === 'nodeStaticAttr'" label="静态属性2" value="attr2" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值1" value="value1" />
                <el-option v-if="targetType === 'nodeStaticAttrValue'" label="静态属性值2" value="value2" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性1" value="dynAttr1" />
                <el-option v-if="targetType === 'nodeDynamicAttr'" label="动态属性2" value="dynAttr2" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值1" value="dynValue1" />
                <el-option v-if="targetType === 'nodeDynamicAttrValue'" label="动态属性值2" value="dynValue2" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品1" value="product1" />
                <el-option v-if="targetType === 'nodeProduct'" label="产品2" value="product2" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 消息通知-发送通知参数 -->
      <template v-else-if="actionType === 'sendNotification'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="通知类型"> -->
              <el-select v-model="localParams.type" @change="updateActionParams">
                <el-option label="邮件" value="email" />
                <el-option label="短信" value="sms" />
                <el-option label="站内信" value="message" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="接收者"> -->
              <el-input v-model="localParams.recipient" @input="updateActionParams" placeholder="请输入接收者" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- <el-form-item label="通知内容"> -->
              <el-input 
                v-model="localParams.content" 
                @input="updateActionParams" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入通知内容"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 消息通知-触发警告参数 -->
      <template v-else-if="actionType === 'triggerWarning'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="警告级别"> -->
              <el-select v-model="localParams.level" @change="updateActionParams">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="严重" value="critical" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="警告消息"> -->
              <el-input v-model="localParams.message" @input="updateActionParams" placeholder="请输入警告消息" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 数据处理-数量配置参数 -->
      <template v-else-if="actionType === 'quantityConfig'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="最小数量"> -->
              <el-input-number v-model="localParams.minQuantity" @change="updateActionParams" :min="0" :step="1" placeholder="请输入最小数量" />
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="最大数量"> -->
              <el-input-number v-model="localParams.maxQuantity" @change="updateActionParams" :min="1" :step="1" placeholder="请输入最大数量" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 数据处理-参数计算 -->
      <template v-else-if="actionType === 'calculation'">
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- <el-form-item label="计算公式"> -->
              <el-input 
                v-model="localParams.formula" 
                @input="updateActionParams" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入计算公式（支持数学表达式）"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="计算结果存储到"> -->
              <el-input v-model="localParams.resultStorage" @change="updateActionParams" placeholder="请输入变量名或属性名" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 数据处理-调用API -->
      <template v-else-if="actionType === 'callApi'">
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- <el-form-item label="API参数"> -->
              <el-input 
                v-model="localParams.apiParams" 
                @input="updateActionParams" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入API参数（JSON格式）"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 显示消息参数 -->
      <template v-else-if="actionType === 'showMessage'">
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- <el-form-item label="消息级别"> -->
              <el-select v-model="localParams.level" @change="updateActionParams">
                <el-option label="信息" value="info" />
                <el-option label="成功" value="success" />
                <el-option label="警告" value="warning" />
                <el-option label="错误" value="error" />
              </el-select>
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="16">
            <!-- <el-form-item label="消息标题"> -->
              <el-input v-model="localParams.title" @input="updateActionParams" placeholder="请输入消息标题" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <!-- <el-form-item label="消息内容"> -->
              <el-input 
                v-model="localParams.content" 
                @input="updateActionParams" 
                type="textarea" 
                :rows="2" 
                placeholder="请输入消息内容"
              />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 设置变量参数 -->
      <template v-else-if="actionType === 'setVariable'">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- <el-form-item label="变量名称"> -->
              <el-input v-model="localParams.variable" @input="updateActionParams" placeholder="请输入变量名称" />
            <!-- </el-form-item> -->
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="变量值"> -->
              <el-input v-model="localParams.value" @input="updateActionParams" placeholder="请输入变量值" />
            <!-- </el-form-item> -->
          </el-col>
        </el-row>
      </template>
      
      <!-- 其他情况或旧类型，使用JSON文本输入 -->
      <template v-else>
        <el-input 
          v-model="actionParamsText" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入动作参数（JSON格式）"
          @input="handleJsonInput"
        />
      </template>
    </div>
    
    <!-- 初始状态或未选择动作类型时，显示提示 -->
    <div v-else class="params-placeholder">
      请先选择动作类型，系统会自动生成默认参数结构
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  actionType: {
    type: String,
    default: ''
  },
  targetType: {
    type: String,
    default: ''
  },
  actionParams: {
    type: String,
    default: '{}'
  }
})

const emit = defineEmits(['update:action-params'])

// 解析动作参数
const parseParams = () => {
  try {
    const params = JSON.parse(props.actionParams || '{}')
    console.log('params', params)
    // 确保返回的是对象，而不是布尔值或其他类型
    if (typeof params === 'object' && params !== null) {
      return params
    } else {
      // 对于非对象类型，创建一个包含value字段的对象
      // 这确保了推荐动作等场景能正确显示值
      return { value: params }
    }
  } catch (e) {
    return {}
  }
}

// 本地参数副本
const localParams = ref(parseParams())
// JSON文本
const actionParamsText = ref(props.actionParams || '{}')

// 监听actionParams变化，更新本地状态
watch(() => props.actionParams, (newParams) => {
  localParams.value = parseParams()
  actionParamsText.value = newParams || '{}'
})

// 更新动作参数
const updateActionParams = () => {
  emit('update:action-params', JSON.stringify(localParams.value, null, 2))
}

// 处理JSON文本输入
const handleJsonInput = () => {
  emit('update:action-params', actionParamsText.value)
}
</script>

<style scoped>
.action-params {
  width: 100%;
}


</style>