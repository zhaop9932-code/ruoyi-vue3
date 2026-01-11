<template>
  <div class="action-params-config">
    <!-- 基础动作参数 - 开关样式 (是否启用、是否显示、是否必选、是否重置) -->
    <template v-if="isBooleanParam">
      <el-form-item label="动作参数" required>
        <el-switch
          v-model="localParams.value"
          @change="updateParams"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </template>
    
    <!-- 推荐动作参数 - 文本输入样式 (是否推荐) -->
    <template v-else-if="actionType === ACTION_TYPES.IS_RECOMMEND">
      <el-form-item label="推荐内容" required>
        <el-input
          v-model="localParams.value"
          @input="updateParams"
          placeholder="请输入推荐内容（如：推荐节点、推荐属性、推荐产品等）"
          style="width: 100%"
        />
      </el-form-item>
    </template>
    
    <!-- 联动选中 - 节点产品 (开关样式) -->
    <template v-else-if="actionType === ACTION_TYPES.LINK_SELECT && targetType === TARGET_TYPES.NODE_PRODUCT">
      <el-form-item label="动作参数" required>
        <el-switch
          v-model="localParams.value"
          @change="updateParams"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </template>
    
    <!-- 联动选中 - 节点静态属性/动态属性 (下拉选择属性值) -->
    <template v-else-if="actionType === ACTION_TYPES.LINK_SELECT && (targetType === TARGET_TYPES.NODE_STATIC_ATTR_VALUE || targetType === TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE)">
      <el-form-item label="动作参数" required>
        <!-- 当attributeId为空时，显示提示 -->
        <el-alert 
          v-if="!attributeId" 
          type="warning" 
          :closable="false"
          style="margin-bottom: 10px;"
        >
          <template #title>
            <span style="font-size: 13px;">
              <el-icon style="vertical-align: middle;"><InfoFilled /></el-icon>
              请先在上方选择节点和属性，然后再配置要联动选中的属性值
            </span>
          </template>
        </el-alert>
        
        <AttributeSelector
          v-else
          v-model="localParams.value"
          :attribute-type="'attributeValue'"
          :attribute-id="attributeId"
          label=""
          placeholder="请选择属性下属性值"
          :multiple="true"
          @change="updateParams"
        />
      </el-form-item>
    </template>
    
    <!-- 多选 -->
    <template v-else-if="actionType === ACTION_TYPES.MULTIPLE_SELECT">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item 
            label="最少选择数量" 
            required
            :error="minSelectError"
          >
            <el-input-number
              v-model="localParams.minSelect"
              @change="validateMultiSelectRange"
              :min="0"
              :max="localParams.maxSelect || 999"
              :step="1"
              style="width: 100%"
              placeholder="请输入最少选择数量"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item 
            label="最多选择数量" 
            required
            :error="maxSelectError"
          >
            <el-input-number
              v-model="localParams.maxSelect"
              @change="validateMultiSelectRange"
              :min="localParams.minSelect || 1"
              :step="1"
              style="width: 100%"
              placeholder="请输入最多选择数量"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 应用折扣 -->
    <template v-else-if="actionType === ACTION_TYPES.APPLY_DISCOUNT">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="折扣类型" required>
            <el-select 
              v-model="localParams.type" 
              @change="validateDiscountValue" 
              style="width: 100%"
            >
              <el-option label="百分比" value="percentage" />
              <el-option label="固定金额" value="fixed" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item 
            label="折扣值" 
            required
            :error="discountValueError"
          >
            <el-input-number
              v-model="localParams.value"
              @change="validateDiscountValue"
              :min="0"
              :max="localParams.type === 'percentage' ? 1 : undefined"
              :step="localParams.type === 'percentage' ? 0.01 : 1"
              :precision="localParams.type === 'percentage' ? 2 : 0"
              style="width: 100%"
              :placeholder="localParams.type === 'percentage' ? '0-1之间' : '折扣金额'"
            >
              <template #append v-if="localParams.type === 'percentage'">
                {{ (localParams.value * 100).toFixed(0) }}%
              </template>
              <template #append v-else>
                元
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否叠加" required>
            <el-switch
              v-model="localParams.isStackable"
              @change="updateParams"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 折扣说明 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-alert 
            type="info" 
            :closable="false"
            style="margin-top: 10px;"
          >
            <template #title>
              <span style="font-size: 12px;">
                {{ localParams.type === 'percentage' 
                  ? `百分比折扣：原价100元，折后${(100 * localParams.value).toFixed(2)}元（${(localParams.value * 100).toFixed(0)}%）`
                  : `固定金额折扣：原价100元，折后${(100 - localParams.value).toFixed(2)}元`
                }}
              </span>
            </template>
          </el-alert>
        </el-col>
      </el-row>
    </template>
    
    <!-- 应用满减 -->
    <template v-else-if="actionType === ACTION_TYPES.APPLY_FULL_REDUCTION">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="满减条件类型" required>
            <el-select v-model="localParams.conditionType" @change="updateParams" style="width: 100%">
              <el-option label="满金额" value="amount" />
              <el-option label="满数量" value="quantity" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="条件值" required>
            <el-input-number
              v-model="localParams.conditionValue"
              @change="updateParams"
              :min="0"
              :step="1"
              style="width: 100%"
              placeholder="请输入条件值"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="减额类型" required>
            <el-select v-model="localParams.reduceType" @change="updateParams" style="width: 100%">
              <el-option label="固定金额" value="fixed" />
              <el-option label="百分比" value="percentage" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="减额值" required>
            <el-input-number
              v-model="localParams.reduceValue"
              @change="updateParams"
              :min="0"
              :step="1"
              style="width: 100%"
              placeholder="请输入减额值"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否循环满减" required>
            <el-space>
              <el-switch
                v-model="localParams.isLoop"
                @change="updateParams"
                active-text="是"
                inactive-text="否"
              />
              <el-tooltip placement="top">
                <template #content>
                  <div style="max-width: 300px;">
                    <p><strong>循环满减说明：</strong></p>
                    <p v-if="localParams.conditionType === 'amount'">
                      示例：满1000减100<br/>
                      • 开启循环：订单2500元，减2次=200元<br/>
                      • 关闭循环：订单2500元，减1次=100元
                    </p>
                    <p v-else>
                      示例：满10件减50<br/>
                      • 开启循环：订单25件，减2次=100元<br/>
                      • 关闭循环：订单25件，减1次=50元
                    </p>
                  </div>
                </template>
                <el-icon style="cursor: help;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-space>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 实时计算示例 -->
      <el-row :gutter="20" v-if="localParams.conditionValue && localParams.reduceValue">
        <el-col :span="24">
          <el-alert 
            type="info" 
            :closable="false" 
            style="margin-top: 10px;"
          >
            <template #title>
              <span style="font-size: 12px;">
                计算示例：
                {{ localParams.conditionType === 'amount' ? '订单金额' : '订单数量' }}
                {{ localParams.conditionValue * 2.5 }}
                {{ localParams.conditionType === 'amount' ? '元' : '件' }}，
                {{ localParams.isLoop ? '循环' : '单次' }}满减，
                {{ calculateFullReductionExample() }}
              </span>
            </template>
          </el-alert>
        </el-col>
      </el-row>
    </template>
    
    <!-- 设置单价 -->
    <template v-else-if="actionType === ACTION_TYPES.SET_PRICE">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单价设置方式" required>
            <el-select v-model="localParams.settingType" @change="updateParams" style="width: 100%">
              <el-option label="固定价格" value="fixed" />
              <el-option label="公式计算" value="formula" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="单价值/公式" required :error="localParams.settingType === 'formula' ? formulaError : ''">
            <el-input-number
              v-if="localParams.settingType === 'fixed'"
              v-model="localParams.value"
              @change="updateParams"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 100%"
              placeholder="请输入单价值"
            >
              <template #append>元</template>
            </el-input-number>
            <el-input
              v-else
              v-model="localParams.value"
              @input="validateFormula"
              type="textarea"
              :rows="3"
              placeholder="请输入计算公式（支持数学表达式和变量引用）"
            />
            
            <!-- 快速插入变量按钮组 -->
            <div v-if="localParams.settingType === 'formula'" style="margin-top: 10px;">
              <el-space wrap>
                <el-button 
                  size="small" 
                  @click="insertVariable('${price}')"
                  :icon="Plus"
                >
                  插入价格
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertVariable('${quantity}')"
                  :icon="Plus"
                >
                  插入数量
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertVariable('${attr.}')"
                  :icon="Plus"
                >
                  插入属性
                </el-button>
                <el-button 
                  size="small" 
                  @click="showFormulaHelper = true"
                  :icon="QuestionFilled"
                >
                  公式帮助
                </el-button>
              </el-space>
            </div>
            
            <!-- 公式预览 -->
            <div v-if="localParams.settingType === 'formula' && localParams.value" style="margin-top: 10px;">
              <el-alert type="info" :closable="false">
                <template #title>
                  <span style="font-size: 12px;">
                    <strong>公式预览：</strong>
                    <span>{{ formulaPreview }}</span>
                  </span>
                </template>
              </el-alert>
            </div>
            
            <!-- 公式类型时显示实时测试 -->
            <div v-if="localParams.settingType === 'formula' && localParams.value" style="margin-top: 10px;">
              <el-alert type="info" :closable="false">
                <template #title>
                  <span style="font-size: 12px;">
                    公式测试（假设 price=100, quantity=5, attr=10）: 
                    <strong>{{ testFormula() }}</strong>
                  </span>
                </template>
              </el-alert>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 显示消息 -->
    <template v-else-if="actionType === ACTION_TYPES.SHOW_MESSAGE">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="消息级别" required>
            <el-select v-model="localParams.level" @change="updateParams" style="width: 100%">
              <el-option label="信息" value="info" />
              <el-option label="成功" value="success" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="消息标题" required>
            <el-input
              v-model="localParams.title"
              @input="updateParams"
              placeholder="请输入消息标题"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="消息内容" required>
            <el-input
              v-model="localParams.content"
              @input="updateParams"
              type="textarea"
              :rows="3"
              placeholder="请输入消息内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 发送通知 -->
    <template v-else-if="actionType === ACTION_TYPES.SEND_NOTIFICATION">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="通知类型" required>
            <el-select v-model="localParams.type" @change="updateParams" style="width: 100%">
              <el-option label="邮件" value="email" />
              <el-option label="短信" value="sms" />
              <el-option label="站内信" value="message" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="接收者" required>
            <el-input
              v-model="localParams.recipient"
              @input="updateParams"
              placeholder="请输入接收者"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="通知内容" required>
            <el-input
              v-model="localParams.content"
              @input="updateParams"
              type="textarea"
              :rows="3"
              placeholder="请输入通知内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 触发警告 -->
    <template v-else-if="actionType === ACTION_TYPES.TRIGGER_WARNING">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="警告级别" required>
            <el-select v-model="localParams.level" @change="updateParams" style="width: 100%">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="严重" value="critical" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="警告消息" required>
            <el-input
              v-model="localParams.message"
              @input="updateParams"
              placeholder="请输入警告消息"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 参数计算 -->
    <template v-else-if="actionType === ACTION_TYPES.CALCULATION">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="计算公式" required :error="formulaError">
            <el-input
              v-model="localParams.formula"
              @input="validateFormula"
              type="textarea"
              :rows="3"
              placeholder="请输入计算公式（支持数学表达式和变量引用）"
            />
            
            <!-- 快速插入变量按钮组 -->
            <div style="margin-top: 10px;">
              <el-space wrap>
                <el-button 
                  size="small" 
                  @click="insertVariable('${price}', 'formula')"
                  :icon="Plus"
                >
                  插入价格
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertVariable('${quantity}', 'formula')"
                  :icon="Plus"
                >
                  插入数量
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertVariable('${attr.}', 'formula')"
                  :icon="Plus"
                >
                  插入属性
                </el-button>
                <el-button 
                  size="small" 
                  @click="showFormulaHelper = true"
                  :icon="QuestionFilled"
                >
                  公式帮助
                </el-button>
              </el-space>
            </div>
            
            <!-- 公式预览 -->
            <div v-if="localParams.formula" style="margin-top: 10px;">
              <el-alert type="info" :closable="false">
                <template #title>
                  <span style="font-size: 12px;">
                    <strong>公式预览：</strong>
                    <span>{{ formulaPreview }}</span>
                  </span>
                </template>
              </el-alert>
            </div>
            
            <!-- 实时公式测试 -->
            <div v-if="localParams.formula" style="margin-top: 10px;">
              <el-alert type="info" :closable="false">
                <template #title>
                  <span style="font-size: 12px;">
                    公式测试（假设 price=100, quantity=5, attr=10）: 
                    <strong>{{ testFormula() }}</strong>
                  </span>
                </template>
              </el-alert>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="计算结果存储到" required>
            <el-input
              v-model="localParams.resultStorage"
              @input="updateParams"
              placeholder="请输入变量名或属性名（如: totalPrice, attr.finalPrice）"
            >
              <template #append>
                <el-button type="primary" size="small" @click="openResultStorageDialog" :icon="Plus">
                  选择
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 调用API -->
    <template v-else-if="actionType === ACTION_TYPES.CALL_API">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="API参数" required>
            <el-input
              v-model="localParams.apiParams"
              @input="updateParams"
              type="textarea"
              :rows="4"
              placeholder="请输入API参数（JSON格式）"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    
    <!-- 没有参数显示的情况 -->
    <template v-else-if="shouldHide">
      <div class="no-params-hint">
        <el-empty description="该动作类型无需配置参数" :image-size="60" />
      </div>
    </template>
    
    <!-- 公式帮助对话框 -->
    <el-dialog v-model="showFormulaHelper" title="公式编写帮助" width="700px">
      <el-tabs>
        <el-tab-pane label="变量引用">
          <el-table :data="variableHelp" size="small" :show-header="true">
            <el-table-column prop="var" label="变量" width="150" />
            <el-table-column prop="desc" label="说明" width="150" />
            <el-table-column prop="example" label="示例" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="数学函数">
          <el-table :data="functionHelp" size="small" :show-header="true">
            <el-table-column prop="func" label="函数" width="180" />
            <el-table-column prop="desc" label="说明" width="150" />
            <el-table-column prop="example" label="示例" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="示例公式">
          <el-space direction="vertical" :fill="true" style="width: 100%;">
            <el-card v-for="(item, index) in formulaExamples" :key="index" size="small" shadow="hover">
              <template #header>
                <strong>{{ item.title }}</strong>
              </template>
              <pre style="margin: 0; background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ item.formula }}</pre>
              <el-button 
                size="small" 
                type="primary" 
                @click="useExample(item.formula)"
                style="margin-top: 10px;"
              >
                使用此公式
              </el-button>
            </el-card>
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 插入属性对话框 -->
    <el-dialog v-model="showAttributeDialog" title="选择属性" width="900px" @close="resetAttributeDialog">
      <el-tabs v-model="activeAttributeTab">
        <!-- 静态属性标签页 -->
        <el-tab-pane label="静态属性" name="static">
          <div class="attribute-dialog-content">
            <!-- 左侧节点树 -->
            <div class="attribute-dialog-left">
              <el-card size="small" class="node-tree-card">
                <template #header>
                  <div class="card-header">
                    <span>节点树</span>
                  </div>
                </template>
                <NodeSelector
                  v-model="selectedStaticAttributeNode"
                  :bom-id="bomId"
                  :label="''"
                  :placeholder="'请选择节点'"
                  :multiple="false"
                  :required="false"
                  @change="handleStaticAttributeNodeChange"
                />
              </el-card>
            </div>
            <!-- 右侧属性列表 -->
            <div class="attribute-dialog-right">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>属性列表</span>
                    <span v-if="selectedStaticAttributeNode" class="selected-node-info">(当前节点: {{ getNodeName(selectedStaticAttributeNode) }})</span>
                  </div>
                </template>
                <AttributeSelector
                  v-if="selectedStaticAttributeNode"
                  v-model="selectedStaticAttribute"
                  attribute-type="static"
                  :bom-id="bomId"
                  :node-id="selectedStaticAttributeNode"
                  :label="''"
                  :placeholder="'请选择静态属性'"
                  :multiple="false"
                  :required="false"
                  @change="handleStaticAttributeChange"
                />
                <div v-else class="no-selection-hint">请先选择左侧节点</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <!-- 动态属性标签页 -->
        <el-tab-pane label="动态属性" name="dynamic">
          <div class="attribute-dialog-content">
            <!-- 左侧节点树 -->
            <div class="attribute-dialog-left">
              <el-card size="small" class="node-tree-card">
                <template #header>
                  <div class="card-header">
                    <span>节点树</span>
                  </div>
                </template>
                <NodeSelector
                  v-model="selectedDynamicAttributeNode"
                  :bom-id="bomId"
                  :label="''"
                  :placeholder="'请选择节点'"
                  :multiple="false"
                  :required="false"
                  @change="handleDynamicAttributeNodeChange"
                />
              </el-card>
            </div>
            <!-- 右侧属性列表 -->
            <div class="attribute-dialog-right">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>属性列表</span>
                    <span v-if="selectedDynamicAttributeNode" class="selected-node-info">(当前节点: {{ getNodeName(selectedDynamicAttributeNode) }})</span>
                  </div>
                </template>
                <AttributeSelector
                  v-if="selectedDynamicAttributeNode"
                  v-model="selectedDynamicAttribute"
                  attribute-type="dynamic"
                  :bom-id="bomId"
                  :node-id="selectedDynamicAttributeNode"
                  :label="''"
                  :placeholder="'请选择动态属性'"
                  :multiple="false"
                  :required="false"
                  @change="handleDynamicAttributeChange"
                />
                <div v-else class="no-selection-hint">请先选择左侧节点</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <!-- 变量标签页 -->
        <el-tab-pane label="变量" name="variable">
          <div class="attribute-dialog-content">
            <div class="attribute-dialog-left" style="flex: 1;">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>变量列表</span>
                  </div>
                </template>
                <el-select
                  v-model="selectedAttributeVariable"
                  placeholder="请选择变量"
                  style="width: 100%"
                  @change="handleAttributeVariableChange"
                >
                  <el-option
                    v-for="variable in bomVariableList"
                    :key="variable.variableId"
                    :label="`${variable.variableName} (${variable.variableCode})`"
                    :value="variable.variableId"
                  >
                    <div class="variable-option-content">
                      <div>{{ variable.variableName }}</div>
                      <div class="variable-option-code">{{ variable.variableCode }}</div>
                      <div class="variable-option-desc">{{ variable.description }}</div>
                    </div>
                  </el-option>
                </el-select>
                <div v-if="bomVariableList.length === 0" class="no-selection-hint">当前BOM下没有可用变量</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAttributeDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAttributeSelection" :disabled="!selectedAttribute">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 计算结果存储到选择对话框 -->
    <el-dialog v-model="showResultStorageDialog" title="选择计算结果存储目标" width="900px">
      <el-tabs v-model="activeResultStorageTab">
        <!-- 静态属性标签页 -->
        <el-tab-pane label="静态属性" name="static">
          <div class="attribute-dialog-content">
            <!-- 左侧节点树 -->
            <div class="attribute-dialog-left">
              <el-card size="small" class="node-tree-card">
                <template #header>
                  <div class="card-header">
                    <span>节点树</span>
                  </div>
                </template>
                <NodeSelector
                  v-model="selectedResultStorageStaticNode"
                  :bom-id="bomId"
                  :label="''"
                  :placeholder="'请选择节点'"
                  :multiple="false"
                  :required="false"
                  @change="handleResultStorageStaticNodeChange"
                />
              </el-card>
            </div>
            <!-- 右侧属性列表 -->
            <div class="attribute-dialog-right">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>属性列表</span>
                    <span v-if="selectedResultStorageStaticNode" class="selected-node-info">(当前节点: {{ getNodeName(selectedResultStorageStaticNode) }})</span>
                  </div>
                </template>
                <AttributeSelector
                  v-if="selectedResultStorageStaticNode"
                  v-model="selectedResultStorageStaticAttribute"
                  attribute-type="static"
                  :bom-id="bomId"
                  :node-id="selectedResultStorageStaticNode"
                  :label="''"
                  :placeholder="'请选择静态属性'"
                  :multiple="false"
                  :required="false"
                  @change="handleResultStorageStaticAttributeChange"
                />
                <div v-else class="no-selection-hint">请先选择左侧节点</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <!-- 动态属性标签页 -->
        <el-tab-pane label="动态属性" name="dynamic">
          <div class="attribute-dialog-content">
            <!-- 左侧节点树 -->
            <div class="attribute-dialog-left">
              <el-card size="small" class="node-tree-card">
                <template #header>
                  <div class="card-header">
                    <span>节点树</span>
                  </div>
                </template>
                <NodeSelector
                  v-model="selectedResultStorageDynamicNode"
                  :bom-id="bomId"
                  :label="''"
                  :placeholder="'请选择节点'"
                  :multiple="false"
                  :required="false"
                  @change="handleResultStorageDynamicNodeChange"
                />
              </el-card>
            </div>
            <!-- 右侧属性列表 -->
            <div class="attribute-dialog-right">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>属性列表</span>
                    <span v-if="selectedResultStorageDynamicNode" class="selected-node-info">(当前节点: {{ getNodeName(selectedResultStorageDynamicNode) }})</span>
                  </div>
                </template>
                <AttributeSelector
                  v-if="selectedResultStorageDynamicNode"
                  v-model="selectedResultStorageDynamicAttribute"
                  attribute-type="dynamic"
                  :bom-id="bomId"
                  :node-id="selectedResultStorageDynamicNode"
                  :label="''"
                  :placeholder="'请选择动态属性'"
                  :multiple="false"
                  :required="false"
                  @change="handleResultStorageDynamicAttributeChange"
                />
                <div v-else class="no-selection-hint">请先选择左侧节点</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        <!-- 变量标签页 -->
        <el-tab-pane label="当前BOM下的变量" name="variable">
          <div class="attribute-dialog-content">
            <div class="attribute-dialog-left" style="flex: 1;">
              <el-card size="small" class="attribute-list-card">
                <template #header>
                  <div class="card-header">
                    <span>变量列表</span>
                  </div>
                </template>
                <el-select
                  v-model="selectedResultStorageVariable"
                  placeholder="请选择当前BOM下的变量"
                  style="width: 100%"
                  @change="handleResultStorageVariableChange"
                >
                  <el-option
                    v-for="variable in bomVariableList"
                    :key="variable.variableId"
                    :label="`${variable.variableName} (${variable.variableCode})`"
                    :value="variable.variableId"
                  >
                    <div class="variable-option-content">
                      <div>{{ variable.variableName }}</div>
                      <div class="variable-option-code">{{ variable.variableCode }}</div>
                      <div class="variable-option-desc">{{ variable.description }}</div>
                    </div>
                  </el-option>
                </el-select>
                <div v-if="bomVariableList.length === 0" class="no-selection-hint">当前BOM下没有可用变量</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showResultStorageDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmResultStorageSelection" :disabled="!selectedResultStorage">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { QuestionFilled, InfoFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AttributeSelector from './AttributeSelector.vue'
import NodeSelector from './NodeSelector.vue'
import { 
  ACTION_TYPES, 
  TARGET_TYPES,
  shouldHideActionParams, 
  getDefaultActionParams 
} from './actionConfig'
import { listByBomId } from '@/api/cpq/superBomStructure'
import { getSuperBomVariableByBomId } from '@/api/cpq/superBomVariable'

const props = defineProps({
  modelValue: {
    type: String,
    default: '{}'
  },
  actionType: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    default: ''
  },
  attributeId: {
    type: [String, Number],
    default: ''
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 解析参数
const parseParams = () => {
  try {
    console.log('props.modelValue', props.modelValue)
    console.log('JSON.parse(props.modelValue || \'\')', JSON.parse(props.modelValue || '{}'))
    return JSON.parse(props.modelValue || '{}')
  } catch (e) {
    return {}
  }
}

// 本地参数
const localParams = ref(parseParams())

// 解析已有的resultStorage值，恢复选择状态
const parseResultStorage = (resultStorage) => {
  if (!resultStorage) return
  
  // 重置所有选择状态
  selectedResultStorageStaticNode.value = ''
  selectedResultStorageStaticAttribute.value = ''
  selectedResultStorageDynamicNode.value = ''
  selectedResultStorageDynamicAttribute.value = ''
  selectedResultStorageVariable.value = ''
  
  // 静态属性：attr.xxx
  if (resultStorage.startsWith('attr.')) {
    const attributeId = resultStorage.replace('attr.', '')
    selectedResultStorageStaticAttribute.value = attributeId
    activeResultStorageTab.value = 'static'
  }
  // 动态属性：dynAttr.xxx
  else if (resultStorage.startsWith('dynAttr.')) {
    const attributeId = resultStorage.replace('dynAttr.', '')
    selectedResultStorageDynamicAttribute.value = attributeId
    activeResultStorageTab.value = 'dynamic'
  }
  // 变量：直接是变量代码
  else {
    const variable = bomVariableList.value.find(v => v.variableCode === resultStorage)
    if (variable) {
      selectedResultStorageVariable.value = variable.variableId
      activeResultStorageTab.value = 'variable'
    }
  }
}

// 错误提示变量
const minSelectError = ref('')
const maxSelectError = ref('')
const discountValueError = ref('')
const formulaError = ref('')

// 首次加载标志
const isFirstLoad = ref(true)

// 公式帮助对话框
const showFormulaHelper = ref(false)

// 插入属性对话框
const showAttributeDialog = ref(false)
const activeAttributeTab = ref('static')
// 跟踪当前插入属性的字段类型
const currentInsertField = ref('value')

// 计算结果存储到选择对话框
const showResultStorageDialog = ref(false)
const activeResultStorageTab = ref('static')
// 静态属性选择相关
const selectedResultStorageStaticNode = ref('')
const selectedResultStorageStaticAttribute = ref('')
// 动态属性选择相关
const selectedResultStorageDynamicNode = ref('')
const selectedResultStorageDynamicAttribute = ref('')
// 变量列表
const bomVariableList = ref([])

// BOM结构树数据，用于获取节点名称
const bomStructureTree = ref([])

// 静态属性选择相关
const selectedStaticAttributeNode = ref('')
const selectedStaticAttribute = ref('')
const staticAttributeList = ref([])

// 动态属性选择相关
const selectedDynamicAttributeNode = ref('')
const selectedDynamicAttribute = ref('')
const dynamicAttributeList = ref([])

// 变量选择相关
const selectedAttributeVariable = ref('')

// 计算选中的属性
const selectedAttribute = computed(() => {
  switch (activeAttributeTab.value) {
    case 'static':
      return selectedStaticAttribute.value
    case 'dynamic':
      return selectedDynamicAttribute.value
    case 'variable':
      return selectedAttributeVariable.value
    default:
      return ''
  }
})

// 计算选中的结果存储目标
const selectedResultStorage = computed(() => {
  switch (activeResultStorageTab.value) {
    case 'static':
      return selectedResultStorageStaticAttribute.value ? `attr.${selectedResultStorageStaticAttribute.value}` : ''
    case 'dynamic':
      return selectedResultStorageDynamicAttribute.value ? `dynAttr.${selectedResultStorageDynamicAttribute.value}` : ''
    case 'variable':
      return bomVariableList.value.find(v => v.variableId === selectedResultStorageVariable.value)?.variableCode || ''
    default:
      return ''
  }
})

// 选中的变量ID
const selectedResultStorageVariable = ref('')

// 变量帮助
const variableHelp = ref([
  { var: '${price}', desc: '节点价格', example: '${price} * 0.9' },
  { var: '${quantity}', desc: '节点数量', example: '${price} * ${quantity}' },
  { var: '${totalPrice}', desc: '节点总价', example: '${totalPrice} + ${shipping}' },
  { var: '${weight}', desc: '节点重量', example: '${weight} * ${quantity}' },
  { var: '${attr.xxx}', desc: '节点静态属性值', example: '${attr.width} * ${attr.height}' },
  { var: '${dynAttr.xxx}', desc: '节点动态属性值', example: '${dynAttr.dynamicPrice} * 0.9' },
  { var: '${var.xxx}', desc: '自定义变量', example: '${var.discount} / 100' },
  { var: '${parent.price}', desc: '父节点价格', example: '${parent.price} + ${price}' },
  { var: '${root.price}', desc: '根节点价格', example: '${root.price} * 0.05' },
  { var: '${system.today}', desc: '当前日期', example: '${system.today} > ${attr.validUntil}' },
  { var: '${system.now}', desc: '当前时间戳', example: '${system.now} - ${var.createdAt}' },
  { var: '${count}', desc: '节点数量', example: '${count} > 10 ? ${price} * 0.9 : ${price}' }
])

// 函数帮助
const functionHelp = ref([
  // 数学函数
  { func: 'Math.max(a, b, ...)', desc: '返回最大值', example: 'Math.max(${price}, ${attr.costPrice}, 100)' },
  { func: 'Math.min(a, b, ...)', desc: '返回最小值', example: 'Math.min(${price}, 1000, ${var.maxPrice})' },
  { func: 'Math.round(x)', desc: '四舍五入', example: 'Math.round(${price} * 0.9)' },
  { func: 'Math.floor(x)', desc: '向下取整', example: 'Math.floor(${price} / 10) * 10' },
  { func: 'Math.ceil(x)', desc: '向上取整', example: 'Math.ceil(${price} / 10) * 10' },
  { func: 'Math.abs(x)', desc: '绝对值', example: 'Math.abs(${price} - ${cost})' },
  { func: 'Math.pow(x, y)', desc: 'x的y次方', example: 'Math.pow(${base}, 2)' },
  { func: 'Math.sqrt(x)', desc: '平方根', example: 'Math.sqrt(${attr.area})' },
  { func: 'Math.PI', desc: '圆周率', example: 'Math.PI * ${attr.radius} * ${attr.radius}' },
  { func: 'Math.random()', desc: '随机数(0-1)', example: 'Math.floor(Math.random() * 100)' },
  { func: 'Math.sin(x)', desc: '正弦值', example: 'Math.sin(${attr.angle})' },
  { func: 'Math.cos(x)', desc: '余弦值', example: 'Math.cos(${attr.angle})' },
  
  // 逻辑函数
  { func: '&&', desc: '逻辑与', example: '${quantity} > 10 && ${price} > 100' },
  { func: '||', desc: '逻辑或', example: '${attr.color} === "red" || ${attr.color} === "blue"' },
  { func: '!', desc: '逻辑非', example: '!${attr.isAvailable}' },
  { func: '? :', desc: '三元运算符', example: '${quantity} < 10 ? ${price} : ${price} * 0.9' },
  
  // 比较运算符
  { func: '===', desc: '等于', example: '${attr.status} === "active"' },
  { func: '!==', desc: '不等于', example: '${attr.status} !== "disabled"' },
  { func: '>', desc: '大于', example: '${quantity} > 10' },
  { func: '<', desc: '小于', example: '${price} < 100' },
  { func: '>=', desc: '大于等于', example: '${quantity} >= 10' },
  { func: '<=', desc: '小于等于', example: '${price} <= 1000' },
  
  // 字符串函数
  { func: 'length', desc: '字符串长度', example: '${attr.name}.length > 10' },
  { func: 'includes()', desc: '包含字符串', example: '${attr.name}.includes("VIP")' },
  { func: 'startsWith()', desc: '以字符串开头', example: '${attr.sku}.startsWith("A-")' },
  { func: 'endsWith()', desc: '以字符串结尾', example: '${attr.fileName}.endsWith(".pdf")' },
  { func: 'toUpperCase()', desc: '转换为大写', example: '${attr.code}.toUpperCase()' },
  { func: 'toLowerCase()', desc: '转换为小写', example: '${attr.code}.toLowerCase()' },
  { func: 'trim()', desc: '去除首尾空格', example: '${attr.name}.trim().length > 0' },
  
  // 数组函数
  { func: 'Array.isArray()', desc: '是否为数组', example: 'Array.isArray(${attr.options})' },
  { func: 'length', desc: '数组长度', example: '${attr.options}.length > 0' },
  { func: 'includes()', desc: '数组包含元素', example: '${attr.options}.includes("option1")' },
  
  // 条件判断函数
  { func: 'if(condition, trueValue, falseValue)', desc: '条件判断', example: 'if(${quantity} > 10, ${price} * 0.9, ${price})' },
  { func: 'switch(value, cases)', desc: '多条件判断', example: 'switch(${attr.size}, {"S": 10, "M": 15, "L": 20})' },
  
  // CPQ专用函数
  { func: 'sum(path)', desc: '求和', example: 'sum("${children.price}")' },
  { func: 'avg(path)', desc: '平均值', example: 'avg("${children.price}")' },
  { func: 'count(path)', desc: '计数', example: 'count("${children}")' },
  { func: 'min(path)', desc: '求最小值', example: 'min("${children.price}")' },
  { func: 'max(path)', desc: '求最大值', example: 'max("${children.price}")' },
  { func: 'exists(path)', desc: '是否存在', example: 'exists("${attr.customField}")' },
  { func: 'isEmpty(value)', desc: '是否为空', example: 'isEmpty(${attr.description})' },
  { func: 'formatNumber(value, decimals)', desc: '格式化数字', example: 'formatNumber(${price}, 2)' },
  { func: 'formatCurrency(value, currency)', desc: '格式化货币', example: 'formatCurrency(${price}, "CNY")' },
  { func: 'calculateTax(base, rate)', desc: '计算税费', example: 'calculateTax(${price}, 0.13)' },
  { func: 'calculateDiscount(base, discount)', desc: '计算折扣', example: 'calculateDiscount(${price}, ${var.discount})' }
])

// 公式示例
const formulaExamples = ref([
  {
    title: '计算折扣后价格（9折）',
    formula: '${price} * 0.9'
  },
  {
    title: '计算总价（价格 × 数量）',
    formula: '${price} * ${quantity}'
  },
  {
    title: '计算最低价格（不低于成本价）',
    formula: 'Math.max(${price} * 0.9, ${attr.costPrice})'
  },
  {
    title: '阶梯价格（数量越多单价越低）',
    formula: '${quantity} < 10 ? ${price} : (${quantity} < 100 ? ${price} * 0.9 : ${price} * 0.8)'
  },
  {
    title: '计算面积（长×宽）',
    formula: '${attr.length} * ${attr.width}'
  },
  {
    title: '条件判断（VIP客户额外95折）',
    formula: '${attr.isVip} ? (${price} * 0.9 * 0.95) : (${price} * 0.9)'
  },
  {
    title: '多条件组合（数量+VIP+日期）',
    formula: '${quantity} > 50 && ${attr.isVip} && ${system.today} < ${attr.promotionEnd} ? ${price} * 0.8 : (${quantity} > 10 ? ${price} * 0.9 : ${price})'
  },
  {
    title: '计算税费（13%增值税）',
    formula: '${price} * 1.13'
  },
  {
    title: '计算运费（重量×单价+首重）',
    formula: '${weight} > 1 ? (${weight} * ${var.shippingRate} + ${var.baseShipping}) : ${var.baseShipping}'
  },
  {
    title: '动态价格（基于属性值）',
    formula: '${attr.material} === "steel" ? ${price} * 1.2 : (${attr.material} === "aluminum" ? ${price} * 1.1 : ${price})'
  },
  {
    title: '计算总分（多属性加权）',
    formula: '${attr.quality} * 0.4 + ${attr.price} * 0.3 + ${attr.deliveryTime} * 0.3'
  },
  {
    title: '字符串条件判断',
    formula: '${attr.sku}.startsWith("VIP-") ? ${price} * 0.85 : ${price}'
  },
  {
    title: '父节点价格影响',
    formula: '${parent.price} > 1000 ? ${price} * 0.95 : ${price}'
  },
  {
    title: '数组条件判断',
    formula: '${attr.options}.includes("premium") ? ${price} + 50 : ${price}'
  },
  {
    title: '日期比较',
    formula: '${system.today} > ${attr.validFrom} && ${system.today} < ${attr.validUntil} ? ${price} : ${price} * 1.1'
  },
  {
    title: '求和与计数',
    formula: 'sum("${children.price}") + ${var.handlingFee}'
  },
  {
    title: '格式化输出',
    formula: 'formatNumber(${price} * 1.13, 2)'
  },
  {
    title: '计算折扣链',
    formula: '${price} * (1 - ${var.baseDiscount}) * (1 - ${attr.additionalDiscount})'
  },
  {
    title: '库存判断',
    formula: '${attr.stock} > ${quantity} ? ${price} : ${price} * 1.05'
  },
  {
    title: '复杂条件嵌套',
    formula: '${quantity} > 10 ? (${attr.isVip} ? ${price} * 0.85 : ${price} * 0.9) : (${attr.isVip} ? ${price} * 0.9 : ${price})'
  }
])

// 判断是否为布尔参数类型
const isBooleanParam = computed(() => {
  const booleanActions = [
    ACTION_TYPES.IS_ENABLE,
    ACTION_TYPES.IS_SHOW,
    ACTION_TYPES.IS_REQUIRED,
    ACTION_TYPES.RESET
  ]
  return booleanActions.includes(props.actionType)
})

// 判断是否应该隐藏参数配置
const shouldHide = computed(() => {
  return shouldHideActionParams(props.actionType, props.targetType)
})

// 公式预览文本生成
const formulaPreview = computed(() => {
  let formula = ''
  
  // 区分不同类型的公式
  if (localParams.value?.settingType === 'formula' && localParams.value?.value) {
    formula = localParams.value.value
  } else if (props.actionType === ACTION_TYPES.CALCULATION && localParams.value?.formula) {
    formula = localParams.value.formula
  } else {
    return ''
  }
  
  // 简单的公式预览解析，将代码/ID转换为直观名称
  let preview = formula
  
  // 替换静态属性：attr.xxx → 静态属性.属性名
  preview = preview.replace(/\$\{attr\.(\w+)\}/g, (match, attrId) => {
    // 这里需要根据实际情况替换为真实属性名，目前使用示例映射
    // 实际项目中应该从属性列表中查找对应的属性名称
    const attrMap = {
      '01': '长度',
      '02': '宽度',
      '03': '高度',
      '04': '颜色',
      '05': '材质',
      '06': '重量',
      '07': '成本价'
    }
    return `静态属性.${attrMap[attrId] || attrId}`
  })
  
  // 替换动态属性：dynAttr.xxx → 动态属性.属性名
  preview = preview.replace(/\$\{dynAttr\.(\w+)\}/g, (match, attrId) => {
    const attrMap = {
      'd01': '动态价格',
      'd02': '库存',
      'd03': '促销价'
    }
    return `动态属性.${attrMap[attrId] || attrId}`
  })
  
  // 替换变量：var.xxx → 变量.变量名
  preview = preview.replace(/\$\{var\.(\w+)\}/g, (match, varCode) => {
    // 查找实际变量名称
    const variable = bomVariableList.value.find(v => v.variableCode === varCode)
    return `变量.${variable?.variableName || varCode}`
  })
  
  // 替换系统变量
  preview = preview.replace(/\$\{system\.(\w+)\}/g, (match, sysVar) => {
    const sysVarMap = {
      'today': '当前日期',
      'now': '当前时间戳'
    }
    return `系统.${sysVarMap[sysVar] || sysVar}`
  })
  
  // 替换价格相关变量
  preview = preview.replace(/\$\{price\}/g, '价格')
  preview = preview.replace(/\$\{quantity\}/g, '数量')
  preview = preview.replace(/\$\{totalPrice\}/g, '总价')
  preview = preview.replace(/\$\{weight\}/g, '重量')
  preview = preview.replace(/\$\{count\}/g, '节点数量')
  
  // 替换父节点和根节点变量
  preview = preview.replace(/\$\{parent\.(\w+)\}/g, (match, prop) => {
    return `父节点.${prop}`
  })
  preview = preview.replace(/\$\{root\.(\w+)\}/g, (match, prop) => {
    return `根节点.${prop}`
  })
  
  return preview
})

// 更新参数
const updateParams = () => {
  const paramsStr = JSON.stringify(localParams.value)
  emit('update:modelValue', paramsStr)
  emit('change', paramsStr)
}

// 验证多选数量范围
const validateMultiSelectRange = () => {
  minSelectError.value = ''
  maxSelectError.value = ''
  
  // 添加安全检查，避免解构错误
  if (!localParams.value || !('minSelect' in localParams.value) || !('maxSelect' in localParams.value)) {
    return false
  }
  
  const { minSelect, maxSelect } = localParams.value
  
  // 检查最小值是否大于最大值
  if (minSelect > maxSelect) {
    minSelectError.value = '不能大于最多选择数量'
    maxSelectError.value = '不能小于最少选择数量'
    return false
  }
  
  // 检查负数
  if (minSelect < 0) {
    minSelectError.value = '不能为负数'
    return false
  }
  
  if (maxSelect < 1) {
    maxSelectError.value = '不能小于1'
    return false
  }
  
  updateParams()
  return true
}

// 验证折扣值
const validateDiscountValue = () => {
  discountValueError.value = ''
  
  // 添加安全检查，避免解构错误
  if (!localParams.value || !('type' in localParams.value) || !('value' in localParams.value)) {
    return false
  }
  
  const { type, value } = localParams.value
  
  if (type === 'percentage') {
    if (value < 0 || value > 1) {
      discountValueError.value = '百分比应在0-1之间（0.9=90%=9折）'
      return false
    }
  } else if (type === 'fixed') {
    if (value < 0) {
      discountValueError.value = '固定金额不能为负数'
      return false
    }
  }
  
  updateParams()
  return true
}

// 计算满减示例
const calculateFullReductionExample = () => {
  // 添加安全检查，避免解构错误
  if (!localParams.value) {
    return '请先配置满减参数'
  }
  
  const { conditionType, conditionValue, reduceType, reduceValue, isLoop } = localParams.value || {};
  
  if (!conditionValue || !reduceValue) return '请先配置条件值和减额值'
  
  const testValue = conditionValue * 2.5 // 测试值为条件值的2.5倍
  
  if (isLoop) {
    // 循环满减
    const times = Math.floor(testValue / conditionValue)
    if (reduceType === 'fixed') {
      return `优惠 ${times} 次，共减 ${times * reduceValue} 元`
    } else {
      const discount = times * reduceValue
      return `优惠 ${times} 次，共减 ${discount}%`
    }
  } else {
    // 单次满减
    if (testValue >= conditionValue) {
      if (reduceType === 'fixed') {
        return `优惠 1 次，减 ${reduceValue} 元`
      } else {
        return `优惠 1 次，减 ${reduceValue}%`
      }
    }
    return '未达到满减条件'
  }
}

// 使用示例公式
const useExample = (formula) => {
  if (localParams.value.formula !== undefined) {
    localParams.value.formula = formula
  } else {
    localParams.value.value = formula
  }
  showFormulaHelper.value = false
  validateFormula()
}

// 加载BOM结构树数据
const getBomStructureTree = async () => {
  if (!props.bomId) return
  try {
    const response = await listByBomId(props.bomId)
    if (response.code === 200 && response.data) {
      bomStructureTree.value = response.data
    }
  } catch (error) {
    console.error('加载BOM结构树失败:', error)
  }
}

// 根据节点ID获取节点名称
const getNodeName = (nodeId) => {
  if (!nodeId) return ''
  
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.bomStructureId == nodeId) {
        return node.nodeName || '未知节点'
      }
      if (node.children && node.children.length > 0) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return ''
  }
  
  return findNode(bomStructureTree.value)
}

// 处理静态属性节点选择变化
const handleStaticAttributeNodeChange = (nodeId) => {
  selectedStaticAttributeNode.value = nodeId
  selectedStaticAttribute.value = ''
}

// 处理动态属性节点选择变化
const handleDynamicAttributeNodeChange = (nodeId) => {
  selectedDynamicAttributeNode.value = nodeId
  selectedDynamicAttribute.value = ''
}

// 处理静态属性选择变化
const handleStaticAttributeChange = (attribute) => {
  selectedStaticAttribute.value = attribute
}

// 处理动态属性选择变化
const handleDynamicAttributeChange = (attribute) => {
  selectedDynamicAttribute.value = attribute
}

// 处理变量选择变化
const handleAttributeVariableChange = (variableId) => {
  selectedAttributeVariable.value = variableId
}

// 重置属性对话框状态
const resetAttributeDialog = () => {
  selectedStaticAttributeNode.value = ''
  selectedStaticAttribute.value = ''
  selectedDynamicAttributeNode.value = ''
  selectedDynamicAttribute.value = ''
  selectedAttributeVariable.value = ''
  activeAttributeTab.value = 'static'
}

// 确认属性选择
const confirmAttributeSelection = () => {
  if (!selectedAttribute.value) return
  
  let attributeVariable = ''
  
  // 根据不同类型使用不同的前缀标识
  if (activeAttributeTab.value === 'static') {
    attributeVariable = `\${attr.${selectedAttribute.value}}`
  } else if (activeAttributeTab.value === 'dynamic') {
    attributeVariable = `\${dynAttr.${selectedAttribute.value}}`
  } else if (activeAttributeTab.value === 'variable') {
    // 查找变量代码
    const variable = bomVariableList.value.find(v => v.variableId === selectedAttribute.value)
    if (variable) {
      attributeVariable = `\${var.${variable.variableCode}}`
    }
  }
  
  // 使用存储的字段类型插入变量
  if (attributeVariable) {
    insertVariable(attributeVariable, currentInsertField.value)
    
    showAttributeDialog.value = false
    resetAttributeDialog()
  }
}

// 打开结果存储选择对话框
const openResultStorageDialog = async () => {
  // 加载变量列表
  await loadBomVariableList()
  // 加载BOM结构树
  getBomStructureTree()
  showResultStorageDialog.value = true
}

// 加载当前BOM下的变量列表
const loadBomVariableList = async () => {
  if (!props.bomId) return
  try {
    const response = await getSuperBomVariableByBomId(props.bomId)
    if (response.code === 200 && response.data) {
      bomVariableList.value = response.data
      // 变量列表加载完成后，解析已有的resultStorage值
      parseResultStorage(localParams.value.resultStorage)
    }
  } catch (error) {
    console.error('加载变量列表失败:', error)
    ElMessage.error('加载变量列表失败')
  }
}

// 处理结果存储静态属性节点变化
const handleResultStorageStaticNodeChange = (nodeId) => {
  selectedResultStorageStaticNode.value = nodeId
  selectedResultStorageStaticAttribute.value = ''
}

// 处理结果存储静态属性变化
const handleResultStorageStaticAttributeChange = (attribute) => {
  selectedResultStorageStaticAttribute.value = attribute
}

// 处理结果存储动态属性节点变化
const handleResultStorageDynamicNodeChange = (nodeId) => {
  selectedResultStorageDynamicNode.value = nodeId
  selectedResultStorageDynamicAttribute.value = ''
}

// 处理结果存储动态属性变化
const handleResultStorageDynamicAttributeChange = (attribute) => {
  selectedResultStorageDynamicAttribute.value = attribute
}

// 处理结果存储变量变化
const handleResultStorageVariableChange = (variableId) => {
  selectedResultStorageVariable.value = variableId
}

// 确认结果存储选择
const confirmResultStorageSelection = () => {
  if (!selectedResultStorage.value) return
  
  localParams.value.resultStorage = selectedResultStorage.value
  updateParams()
  
  showResultStorageDialog.value = false
  // 重置选择状态
  selectedResultStorageStaticNode.value = ''
  selectedResultStorageStaticAttribute.value = ''
  selectedResultStorageDynamicNode.value = ''
  selectedResultStorageDynamicAttribute.value = ''
  selectedResultStorageVariable.value = ''
  activeResultStorageTab.value = 'static'
}

// 插入变量到公式
const insertVariable = (variable, field = 'value') => {
  // 如果是属性变量，打开选择对话框
  if (variable === '${attr.}') {
    // 检查BOM ID是否为空
    if (!props.bomId) {
      ElMessage.warning('BOM ID为空，无法加载节点数据')
      return
    }
    // 存储当前的字段类型
    currentInsertField.value = field
    showAttributeDialog.value = true
    getBomStructureTree()
    // 加载变量列表
    loadBomVariableList()
    return
  }
  
  if (field === 'formula') {
    // 参数计算的formula字段
    if (!localParams.value.formula) {
      localParams.value.formula = variable
    } else {
      localParams.value.formula += variable
    }
  } else {
    // 设置单价的value字段
    if (!localParams.value.value) {
      localParams.value.value = variable
    } else {
      localParams.value.value += variable
    }
  }
  updateParams()
}

// 验证公式语法
const validateFormula = () => {
  formulaError.value = ''
  const formula = localParams.value.formula
  
  if (!formula) {
    updateParams()
    return true
  }
  
  // 基础语法检查 - 括号匹配
  const brackets = formula.match(/[\(\)]/g) || []
  const openCount = brackets.filter(b => b === '(').length
  const closeCount = brackets.filter(b => b === ')').length
  
  if (openCount !== closeCount) {
    formulaError.value = '括号不匹配'
    return false
  }
  
  // 检查是否包含变量引用（可选）
  if (!formula.includes('${') && !formula.match(/^\d+$/)) {
    formulaError.value = '公式中应包含至少一个变量引用（如 ${price}）或为纯数字'
    return false
  }
  
  updateParams()
  return true
}

// 测试公式
const testFormula = () => {
  try {
    if (!localParams.value.formula) return '请输入公式'
    
    // 替换变量为测试值
    let testFormula = localParams.value.formula
      .replace(/\$\{price\}/g, '100')
      .replace(/\$\{quantity\}/g, '5')
      .replace(/\$\{attr\.\w+\}/g, '10')
      .replace(/\$\{var\.\w+\}/g, '20')
      .replace(/\$\{cost\}/g, '80')
      .replace(/\$\{costPrice\}/g, '80')
    
    // 使用Function构造器安全执行
    const result = new Function('return ' + testFormula)()
    return typeof result === 'number' ? result.toFixed(2) : '计算错误'
  } catch (e) {
    return '公式语法错误: ' + e.message
  }
}

// 监听动作类型变化,初始化默认参数
watch(() => [props.actionType, props.targetType], ([newActionType, newTargetType], oldValue) => {
  // 为oldValue提供默认值，避免首次执行时解构失败
  const [oldActionType, oldTargetType] = oldValue || []
  
  // 首次加载时，检查modelValue是否有实际内容
  if (isFirstLoad.value) {
    // 解析当前modelValue
    const parsedParams = parseParams()
    // 如果modelValue有值，使用它，否则使用默认参数
    if (Object.keys(parsedParams).length > 0) {
      localParams.value = parsedParams
    } else {
      const defaultParams = getDefaultActionParams(newActionType, newTargetType)
      localParams.value = { ...defaultParams }
    }
    updateParams()
    isFirstLoad.value = false
  }
  // 动作类型变化时，重新初始化参数
  else if (newActionType !== oldActionType) {
    const defaultParams = getDefaultActionParams(newActionType, newTargetType)
    localParams.value = { ...defaultParams }
    updateParams()
  }
  // 仅目标类型变化时，不重置参数（保留用户配置）
  // 但如果参数为空，则初始化默认值
  else if (newTargetType !== oldTargetType) {
    const currentParamsStr = JSON.stringify(localParams.value)
    if (currentParamsStr === '{}' || !localParams.value || Object.keys(localParams.value).length === 0) {
      const defaultParams = getDefaultActionParams(newActionType, newTargetType)
      localParams.value = { ...defaultParams }
      updateParams()
    }
  }
}, { immediate: true })

// 监听折扣类型变化，重置折扣值
watch(() => localParams.value.type, (newType) => {
  if (props.actionType === ACTION_TYPES.APPLY_DISCOUNT) {
    if (newType === 'percentage') {
      localParams.value.value = 0.9 // 默认90%，即9折
    } else {
      localParams.value.value = 0
    }
    validateDiscountValue()
  }
})

// 监听外部参数变化
watch(() => props.modelValue, (newVal) => {
  localParams.value = parseParams()
})
</script>

<style scoped>
.action-params-config {
  width: 100%;
}

.no-params-hint {
  text-align: center;
  padding: 20px;
  color: #909399;
}

/* 插入属性对话框样式 */
.attribute-dialog-content {
  display: flex;
  gap: 20px;
  height: 500px;
}

.attribute-dialog-left {
  flex: 1;
  overflow: hidden;
}

.attribute-dialog-right {
  flex: 1;
  overflow: hidden;
}

.node-tree-card,
.attribute-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.node-tree-card .el-card__body,
.attribute-list-card .el-card__body {
  flex: 1;
  overflow: auto;
  padding: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
}

.selected-node-info {
  font-size: 12px;
  color: #606266;
  font-weight: normal;
}

.no-selection-hint {
  text-align: center;
  padding: 20px;
  color: #909399;
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 确保表单项目在卡片内正常显示 */
.attribute-dialog-content .el-form-item {
  margin-bottom: 15px;
}

.attribute-dialog-content .el-form-item__label {
  font-weight: normal;
  font-size: 13px;
}

/* 确保选择器在卡片内正常显示 */
.attribute-dialog-content .el-tree-select,
.attribute-dialog-content .attribute-selector {
  width: 100%;
}

/* 变量选项样式 */
.variable-option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variable-option-code {
  font-size: 12px;
  color: #606266;
  font-family: monospace;
}

.variable-option-desc {
  font-size: 11px;
  color: #909399;
  word-break: break-all;
}
</style>
