<template>
  <div class="app-container">
    <div class="head-container">
      <div class="title-container">
        <el-page-header
          @back="goBack"
          :content="'属性组属性关联管理'
          + (attributeGroupName ? ' - ' + attributeGroupName : '')"
        />
      </div>
    </div>

    <!-- 左右布局 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧属性组列表 -->
      <el-col :span="6">
        <el-card shadow="never" class="left-panel">
          <template #header>
            <div class="card-header-content">
              <span class="card-title">属性组列表</span>
              <el-button
                type="primary"
                size="small"
                @click="handleAddAttributeGroup"
                v-hasPermi="['cpq:attributeGroup:add']"
              >
                <i class="el-icon-plus"></i> 新增
              </el-button>
            </div>
          </template>
          
          <el-input
            v-model="attributeGroupSearch" 
            placeholder="搜索属性组"
            clearable
            size="small"
            class="mb-2"
            @input="handleAttributeGroupSearch"
          />
          
          <el-tree
            v-loading="attributeGroupLoading"
            :data="attributeGroupList"
            :props="attributeGroupTreeProps"
            :default-expanded-keys="[attributeGroupId.value]"
            @node-click="handleAttributeGroupSelect"
            node-key="attributeGroupId"
          >
            <template #default="{ node, data }">
              <div class="tree-node-content">
                <span>{{ node.label }}</span>
                <div class="node-actions">
                  <el-button
                    size="small"
                    type="primary"
                    text
                    @click.stop="handleEditAttributeGroup(data)"
                    v-hasPermi="['cpq:attributeGroup:edit']"
                    class="node-action-btn"
                  >
                    <i class="el-icon-edit"></i>
                    <span>编辑</span>
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="handleDeleteAttributeGroup(data)"
                    v-hasPermi="['cpq:attributeGroup:delete']"
                    class="node-action-btn"
                  >
                    <i class="el-icon-delete"></i>
                    <span>删除</span>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      
      <!-- 右侧属性列表 -->
      <el-col :span="18">
        <el-card shadow="never" class="right-panel">
          <template #header>
            <div class="card-header-content">
              <span class="card-title">
                属性列表
                <span v-if="selectedAttributeGroup" class="attribute-group-name">({{ selectedAttributeGroup.attributeGroupName }})</span>
              </span>
              <div class="button-container">
                <el-button
                  type="primary"
                  plain
                  @click="handleAdd"
                  v-hasPermi="['cpq:attributeGroupAttribute:add']"
                  :disabled="!selectedAttributeGroup"
                >
                  <i class="el-icon-plus"></i> 关联属性
                </el-button>
                <el-button
                  type="danger"
                  plain
                  @click="handleDeleteAll"
                  :disabled="multipleSelection.length === 0 || !selectedAttributeGroup"
                  v-hasPermi="['cpq:attributeGroupAttribute:delete']"
                >
                  <i class="el-icon-delete"></i> 批量解绑
                </el-button>
              </div>
            </div>
          </template>
          
          <el-collapse-transition>
            <div v-show="showSearch" class="search-form">
              <el-form
                :inline="true"
                :model="queryParams"
                ref="queryFormRef"
                label-width="68px"
              >
                <el-form-item label="属性编码" prop="attributeCode">
                  <el-input
                    v-model="queryParams.attributeCode"
                    placeholder="请输入属性编码"
                    clearable
                    size="small"
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
                <el-form-item label="属性名称" prop="attributeName">
                  <el-input
                    v-model="queryParams.attributeName"
                    placeholder="请输入属性名称"
                    clearable
                    size="small"
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-search"
                    @click="handleQuery"
                  >
                    搜索
                  </el-button>
                  <el-button
                    size="small"
                    icon="el-icon-refresh"
                    @click="resetQuery"
                  >
                    重置
                  </el-button>
                  <el-button
                    size="small"
                    @click="toggleSearch"
                  >
                    {{ showSearch ? '收起' : '展开' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-transition>
          
          <el-table
            v-loading="loading"
            :data="attributeGroupAttributeList"
            @selection-change="handleSelectionChange"
            border
            stripe
            style="width: 100%"
            @row-click="handleRowClick"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="attributeId" label="属性ID" width="100" align="center" />
            <el-table-column label="属性编码" prop="attribute.attributeCode" min-width="120" />
            <el-table-column label="属性名称" prop="attribute.attributeName" min-width="150" />
<!--            <el-table-column label="排序" prop="displayOrder" width="80" align="center">-->
<!--              <template #default="scope">-->
<!--                <el-input-number-->
<!--                  v-model="scope.row.displayOrder"-->
<!--                  :min="1"-->
<!--                  @change="handleOrderChange(scope.row)"-->
<!--                />-->
<!--              </template>-->
<!--            </el-table-column>-->
            <el-table-column label="属性类型" prop="attributeType" width="100" align="center">
              <template #default="scope">
                <span v-if="scope.row.attributeType === 'text'">文本</span>
                <span v-else-if="scope.row.attributeType === 'number'">数字</span>
                <span v-else-if="scope.row.attributeType === 'select'">下拉选择</span>
                <span v-else-if="scope.row.attributeType === 'radio'">单选按钮组</span>
                <span v-else-if="scope.row.attributeType === 'checkbox'">复选框组</span>
                <span v-else-if="scope.row.attributeType === 'date'">日期时间</span>
                <span v-else-if="scope.row.attributeType === 'file'">文件上传</span>
                <span v-else-if="scope.row.attributeType === 'image'">图片上传</span>
                <span v-else>{{ scope.row.attributeType }}</span>
              </template>
            </el-table-column>
            <el-table-column label="组件类型" prop="componentType" width="100" align="center">
              <template #default="scope">
                <span v-if="scope.row.componentType === 'radio'">单选框</span>
                <span v-else-if="scope.row.componentType === 'checkbox'">复选框</span>
                <span v-else-if="scope.row.componentType === 'select_single'">下拉单选</span>
                <span v-else-if="scope.row.componentType === 'select_multi'">下拉多选</span>
                <span v-else-if="scope.row.componentType === 'slider'">滑块</span>
                <span v-else-if="scope.row.componentType === 'input'">单行文本</span>
                <span v-else-if="scope.row.componentType === 'textarea'">多行文本</span>
                <span v-else-if="scope.row.componentType === 'number'">数字输入框</span>
                <span v-else-if="scope.row.componentType === 'switch'">开关</span>
                <span v-else>{{ scope.row.componentType || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否必选" prop="isRequired" width="80" align="center">
              <template #default="scope">
                <span v-if="scope.row.isRequired === '1'">
                  <el-tag type="success">是</el-tag>
                </span>
                <span v-else>
                  <el-tag type="info">否</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="是否关键参数" prop="isKeyParam" width="100" align="center">
              <template #default="scope">
                <span v-if="scope.row.isKeyParam === '1'">
                  <el-tag type="danger">是</el-tag>
                </span>
                <span v-else>
                  <el-tag type="info">否</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="计量单位" prop="unit" width="100" align="center" />
            <el-table-column label="操作" width="180" fixed="right" align="center">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="openConfigDialog(scope.row)"
                >配置</el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="openAttributeValuesDrawer(scope.row.attributeGroupAttributeId, scope.row.attribute && scope.row.attribute.attributeName)"
                >属性值</el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                  v-hasPermi="['cpq:attributeGroupAttribute:delete']"
                >解绑</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 属性组表单对话框 -->
    <el-dialog
      v-model="attributeGroupFormVisible"
      :title="attributeGroupForm.attributeGroupId ? '修改属性组' : '新增属性组'"
      width="500px"
      append-to-body
    >
      <el-form ref="attributeGroupFormRef" :model="attributeGroupForm" :rules="attributeGroupFormRules" label-width="100px">
        <!-- <el-form-item label="属性组编码" prop="attributeGroupCode">
          <el-input v-model="attributeGroupForm.attributeGroupCode" placeholder="请输入属性组编码" />
        </el-form-item> -->
        <el-form-item label="属性组名称" prop="attributeGroupName">
          <el-input v-model="attributeGroupForm.attributeGroupName" placeholder="请输入属性组名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="attributeGroupForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="attributeGroupForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attributeGroupFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAttributeGroupForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 关联属性对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`关联属性${attributeGroupName ? ' - ' + attributeGroupName : ''}`"
      width="700px"
      append-to-body
    >
      <el-form :inline="true" :model="queryUnassociatedParams" class="mb-4">
        <el-form-item label="属性名称">
          <el-input
            v-model="queryUnassociatedParams.attributeName"
            placeholder="请输入属性名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="属性类型">
          <el-select
            v-model="queryUnassociatedParams.attributeType"
            placeholder="请选择属性类型"
            clearable
            style="width: 120px"
          >
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="下拉选择" value="select" />
            <el-option label="单选按钮组" value="radio" />
            <el-option label="复选框组" value="checkbox" />
            <el-option label="日期时间" value="date" />
            <el-option label="文件上传" value="file" />
            <el-option label="图片上传" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryUnassociatedAttributes">搜索</el-button>
          <el-button @click="resetUnassociatedQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="loadingUnassociated"
        :data="unassociatedAttributes"
        @selection-change="handleUnassociatedSelectionChange"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="属性编码" prop="attributeCode" min-width="120" />
        <el-table-column label="属性名称" prop="attributeName" min-width="150" />
        <el-table-column label="属性类型" prop="attributeType" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.attributeType === 'text'">文本</span>
            <span v-else-if="scope.row.attributeType === 'number'">数字</span>
            <span v-else-if="scope.row.attributeType === 'select'">下拉选择</span>
            <span v-else-if="scope.row.attributeType === 'radio'">单选按钮组</span>
            <span v-else-if="scope.row.attributeType === 'checkbox'">复选框组</span>
            <span v-else-if="scope.row.attributeType === 'date'">日期时间</span>
            <span v-else-if="scope.row.attributeType === 'file'">文件上传</span>
            <span v-else-if="scope.row.attributeType === 'image'">图片上传</span>
            <span v-else>{{ scope.row.attributeType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="组件类型" prop="componentType" width="100" align="center" />
        <!-- <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openConfigDialog(scope.row)"
            >配置</el-button>
          </template>
        </el-table-column> -->
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAddDialog">取消</el-button>
          <el-button
            type="primary"
            :disabled="selectedUnassociatedAttributes.length === 0"
            @click="confirmAddAssociation"
          >
            确定关联
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 属性配置编辑对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="属性配置"
      width="500px"
      top="15vh"
      destroy-on-close
      center
    >
      <el-form ref="configFormRef" :model="configForm" label-width="100px">
        <!-- 属性基本信息显示 -->
         <el-form-item label="属性编码">
          <el-input v-model="currentAttribute.attribute.attributeCode" disabled />
        </el-form-item>
        <el-form-item label="属性名称">
          <el-input v-model="currentAttribute.attribute.attributeName" disabled />
        </el-form-item>
        <el-form-item label="属性类型">
          <el-select v-model="configForm.attributeType" placeholder="请选择属性类型">
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="下拉选择" value="select" />
            <el-option label="单选按钮组" value="radio" />
            <el-option label="复选框组" value="checkbox" />
            <el-option label="日期时间" value="date" />
            <el-option label="文件上传" value="file" />
            <el-option label="图片上传" value="image" />
          </el-select>
        </el-form-item>
        <el-divider>属性配置</el-divider>
        
        <el-form-item label="组件类型">
          <el-select v-model="configForm.componentType" placeholder="请选择组件类型">
            <el-option label="单选框" value="radio" />
            <el-option label="复选框" value="checkbox" />
            <el-option label="下拉单选" value="select_single" />
            <el-option label="下拉多选" value="select_multi" />
            <el-option label="滑块" value="slider" />
            <el-option label="单行文本" value="input" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="数字输入框" value="number" />
            <el-option label="开关" value="switch" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="默认值">
          <el-input v-model="configForm.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        
        <el-form-item label="是否必选">
          <el-switch
            v-model="configForm.isRequired"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        
        <el-form-item label="是否关键参数">
          <el-switch
            v-model="configForm.isKeyParam"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        
        <el-form-item label="计量单位">
          <el-input v-model="configForm.unit" placeholder="请输入计量单位" />
        </el-form-item>
        
        <el-form-item label="说明">
          <el-input
            v-model="configForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入说明文本"
          />
        </el-form-item>
        
        <!-- 数值型属性配置 -->
        <el-form-item label="最小值">
          <el-input-number v-model="configForm.minValue" :step="0.1" />
        </el-form-item>
        
        <el-form-item label="最大值">
          <el-input-number v-model="configForm.maxValue" :step="0.1" />
        </el-form-item>
        
        <el-form-item label="步进值">
          <el-input-number v-model="configForm.step" :step="0.1" :min="0.01" />
        </el-form-item> 
        
        <el-form-item label="提示文本">
          <el-input v-model="configForm.tooltip" placeholder="请输入提示文本" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAttributeConfig">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 属性值管理右侧推窗 -->
    <el-drawer
      v-model="attributeValuesDrawerVisible"
      :title="'属性值管理 - ' + currentAttributeName"
      direction="rtl"
      size="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <!-- 属性值列表 -->
      <div class="drawer-content">
        <div class="drawer-header">
          <el-button
            type="primary"
            size="small"
            @click="handleAddAttributeValue"
            v-hasPermi="['cpq:attributeGroupAttributeValue:add']"
          >
            <i class="el-icon-plus"></i> 新增属性值
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDeleteAttributeValues"
            :disabled="selectedAttributeValues.length === 0"
            v-hasPermi="['cpq:attributeGroupAttributeValue:delete']"
          >
            <i class="el-icon-delete"></i> 批量删除
          </el-button>
        </div>
        
        <el-table
          v-loading="attributeValuesLoading"
          :data="attributeValuesList"
          @selection-change="handleAttributeValuesSelectionChange"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column prop="valueName" label="值名称" min-width="120" />
          <el-table-column prop="isDefault" label="是否默认" width="100" align="center">
            <template #default="scope">
              <el-tag type="success" v-if="scope.row.isDefault === '1'">是</el-tag>
              <el-tag type="info" v-else>否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.sortOrder"
                :min="0"
                @change="handleAttributeValueSortChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="imgUrl" label="图片" width="100" align="center">
            <template #default="scope">
              <el-image
                v-if="scope.row.imgUrl"
                :src="scope.row.imgUrl"
                :preview-src-list="[scope.row.imgUrl]"
                style="width: 40px; height: 40px; object-fit: cover;"
              />
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleEditAttributeValue(scope.row)"
                v-hasPermi="['cpq:attributeGroupAttributeValue:edit']"
              >编辑</el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteAttributeValue(scope.row)"
                v-hasPermi="['cpq:attributeGroupAttributeValue:delete']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="attributeValuesQueryParams.pageNum"
            v-model:page-size="attributeValuesQueryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="attributeValuesTotal"
            @size-change="handleAttributeValuesSizeChange"
            @current-change="handleAttributeValuesCurrentChange"
          />
        </div>
      </div>
    </el-drawer>
    
    <!-- 属性值表单对话框 -->
    <el-dialog
      v-model="attributeValueFormVisible"
      :title="attributeValueForm.id ? '修改属性值' : '新增属性值'"
      width="500px"
      append-to-body
    >
      
      <!-- 图标选择器弹窗 -->
      <el-dialog
        v-model="showIconPicker"
        title="选择图标"
        width="700px"
        append-to-body
      >
        <div class="icon-picker-container">
          <el-input
            v-model="iconSearchText"
            placeholder="搜索图标"
            clearable
            size="small"
            class="mb-4"
          />
          <div class="icon-grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon"
              class="icon-item"
              :class="{ selected: selectedIcon === icon }"
              @click="selectIcon(icon)"
            >
              <el-icon class="icon-preview"><component :is="ElementPlusIconsVue[icon]" /></el-icon>
              <span class="icon-name">{{ icon }}</span>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showIconPicker = false">取消</el-button>
            <el-button type="primary" @click="confirmIconSelection">确定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-form ref="attributeValueFormRef" :model="attributeValueForm" :rules="attributeValueFormRules" label-width="100px">
        <el-form-item label="值名称" prop="valueName">
          <el-input v-model="attributeValueForm.valueName" placeholder="请输入值名称" />
        </el-form-item>
        <el-form-item label="是否默认值">
          <el-switch
            v-model="attributeValueForm.isDefault"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="attributeValueForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="图片/图标">
          <div class="image-icon-container">
            <!-- 图片/图标预览 -->
            <div v-if="attributeValueForm.imgUrl" class="preview-container">
              <el-image
                v-if="isImageUrl(attributeValueForm.imgUrl)"
                :src="attributeValueForm.imgUrl"
                :preview-src-list="[attributeValueForm.imgUrl]"
                style="width: 60px; height: 60px; object-fit: cover; cursor: pointer;"
              />
              <el-icon v-else style="font-size: 40px; cursor: pointer;" @click="showIconPicker = true">
                <component :is="ElementPlusIconsVue[attributeValueForm.imgUrl]" />
              </el-icon>
              <el-button
                type="danger"
                size="mini"
                @click.stop="attributeValueForm.imgUrl = ''"
                class="clear-btn"
              >
                清除
              </el-button>
            </div>
            
            <!-- 选择方式 -->
            <div class="selection-methods">
              <el-button
                type="primary"
                size="small"
                @click="showIconPicker = true"
                class="method-btn"
              >
                <el-icon><component :is="ElementPlusIconsVue.Document" /></el-icon> 选择图标
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="$refs.uploadRef.click()"
                class="method-btn"
              >
                <el-icon><component :is="ElementPlusIconsVue.Upload" /></el-icon> 上传图片
              </el-button>
              <input
                ref="uploadRef"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="handleImageUpload"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAttributeValueForm">取消</el-button>
          <el-button type="primary" @click="submitAttributeValueForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { listAttributeGroupAttributes,
  addAttributeGroupAttributeBatch, batchUnbindAttributeGroupAttribute,
  batchUpdateAttributeGroupAttributeConfig } from '@/api/cpq/attributeGroupAttribute'
import { listAttributeGroup, addAttributeGroup, updateAttributeGroup, delAttributeGroup,
  checkAttributeGroupCodeUnique } from '@/api/cpq/attributeGroup'
import { listAttributeGroupAttributeValue,
  getAttributeGroupAttributeValueByAttributeGroupAttributeId,
  addAttributeGroupAttributeValue,
  batchInsertAttributeGroupAttributeValue,
  updateAttributeGroupAttributeValue,
  batchUpdateAttributeGroupAttributeValue,
  delAttributeGroupAttributeValue,
  delAttributeGroupAttributeValueByAttributeGroupAttributeId } from '@/api/cpq/attributeGroupAttributeValue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const loadingUnassociated = ref(false)
const showSearch = ref(true)
const total = ref(0)
// 从路由获取初始属性组ID和类目ID
const initialAttributeGroupId = ref(route.query.attributeGroupId || '')
const catalogId = ref(route.query.catalogId || '')
const attributeGroupName = ref(route.query.attributeGroupName || '')
const attributeGroupId = ref(initialAttributeGroupId.value)
const attributeGroupAttributeList = ref([])
const multipleSelection = ref([])
const queryFormRef = ref()
const dialogVisible = ref(false)
// 属性配置编辑对话框
const configDialogVisible = ref(false)
const configFormRef = ref()
const currentAttribute = ref({})
const configForm = reactive({
  attributeGroupAttributeId: '',
  attributeType: '',
  componentType: '',
  defaultValue: '',
  isRequired: '0',
  isKeyParam: '0',
  unit: '',
  description: '',
  minValue: null,
  maxValue: null,
  step: 1,
  options: '',
  tooltip: ''
})

// 属性值管理相关
const attributeValuesDrawerVisible = ref(false)
const currentAttributeGroupAttributeId = ref(null)
const currentAttributeName = ref('')
const attributeValuesLoading = ref(false)
const attributeValuesList = ref([])
const attributeValuesTotal = ref(0)
const selectedAttributeValues = ref([])

// 属性值查询参数
const attributeValuesQueryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 属性值表单相关
const attributeValueFormVisible = ref(false)
const attributeValueFormRef = ref()
const attributeValueForm = reactive({
  id: null,
  attributeGroupAttributeId: null,
  valueId: null,
  valueName: '',
  isDefault: '0',
  sortOrder: 0,
  imgUrl: ''
})

const attributeValueFormRules = reactive({
  valueName: [
    { required: true, message: '值名称不能为空', trigger: 'blur' }
  ]
})

// 图片/图标选择相关
const showIconPicker = ref(false)
const iconSearchText = ref('')
const selectedIcon = ref('')
const uploadRef = ref(null)

// Element Plus图标库列表（按功能分类，便于查找和使用）
const elementPlusIcons = [
  // 基础操作
  'Plus', 'PlusFilled', 'PlusCircle', 'Minus', 'MinusFilled', 'MinusCircle',
  'Edit', 'EditPen', 'EditCircle', 'Delete', 'DeleteFilled', 'DeleteDocument',
  'DeleteCircle', 'Search', 'SearchFilled', 'View', 'ViewFilled', 'Check',
  'CheckFilled', 'CheckTag', 'CheckCircle', 'CheckCircleFilled', 'Close',
  'CloseFilled', 'CloseCircle', 'CloseCircleFilled', 'Cancel', 'CancelFilled',
  
  // 状态与提示
  'Info', 'InfoFilled', 'InfoCircle', 'InfoCircleFilled', 'Warning',
  'WarningFilled', 'WarningCircle', 'WarningCircleFilled', 'Error', 'ErrorFilled',
  'ErrorCircle', 'ErrorCircleFilled', 'Success', 'SuccessFilled', 'SuccessCircle',
  'SuccessCircleFilled', 'Question', 'QuestionFilled', 'QuestionCircle',
  'QuestionCircleFilled',
  
  // 导航与方向
  'Home', 'HomeFilled', 'Menu', 'MenuFold', 'MenuUnfold', 'ArrowLeft', 'ArrowLeftBold',
  'ArrowLeftFilled', 'ArrowRight', 'ArrowRightBold', 'ArrowRightFilled',
  'ArrowUp', 'ArrowUpBold', 'ArrowUpFilled', 'ArrowDown', 'ArrowDownBold',
  'ArrowDownFilled', 'DoubleLeft', 'DoubleRight', 'DoubleUp', 'DoubleDown',
  'TurnLeft', 'TurnRight', 'TurnUp', 'TurnDown', 'Top', 'Bottom', 'TopFilled',
  'BottomFilled',
  
  // 用户与社交
  'User', 'UserFilled', 'Avatar', 'UserAdd', 'UserDelete', 'UserSearch', 'Users',
  'UserSettings', 'ChatDotRound', 'ChatDotSquare', 'ChatLineRound', 'ChatLineSquare',
  'ChatFilled', 'Comment', 'CommentFilled', 'Message', 'MessageFilled', 'Bell',
  'BellFilled', 'Notification', 'NotificationFilled', 'Service', 'Headset',
  'CustomerService',
  
  // 文件与媒体
  'Document', 'DocumentFilled', 'DocumentAdd', 'DocumentEdit', 'DocumentCopy',
  'DocumentChecked', 'DocumentDelete', 'CopyDocument', 'DeleteDocument', 'Folder',
  'FolderFilled', 'FolderOpened', 'FolderAdd', 'FolderDelete', 'Picture',
  'PictureFilled', 'Video', 'VideoFilled', 'VideoPlay', 'VideoPause', 'Music',
  'MusicFilled', 'Camera', 'CameraFilled', 'Film', 'FilmFilled', 'Collection',
  'CollectionTag', 'CollectionFilled',
  
  // 系统与工具
  'Setting', 'SettingFilled', 'Tools', 'ToolsFilled', 'Brush', 'BrushFilled',
  'Palette', 'PaletteFilled', 'MagicStick', 'MagicStickFilled', 'Filter',
  'FilterFilled', 'Sort', 'SortFilled', 'SortUp', 'SortDown', 'SortAscending',
  'SortDescending', 'Refresh', 'RefreshLeft', 'RefreshRight', 'Loading',
  'LoadingFilled', 'CircleLoading', 'Switch', 'SwitchButton',
  
  // 数据与图表
  'TrendCharts', 'DataAnalysis', 'PieChart', 'PieChartFilled', 'LineChart',
  'LineChartFilled', 'BarChart', 'BarChartFilled', 'Histogram', 'HistogramFilled',
  'Ranking', 'RankingFilled', 'Money', 'MoneyFilled', 'Wallet', 'WalletFilled',
  'CreditCard', 'BankCard', 'Coin', 'CoinFilled', 'Discount', 'DiscountFilled',
  'PriceTag', 'PriceTagFilled',
  
  // 多媒体与附件
  'Upload', 'UploadFilled', 'Download', 'DownloadFilled', 'Share', 'ShareFilled',
  'Link', 'LinkFilled', 'Paperclip', 'Attachment', 'Copy', 'CopyDocument',
  'Save', 'SaveFilled', 'Print', 'Printer',
  
  // 时间与日历
  'Clock', 'ClockFilled', 'Calendar', 'CalendarFilled', 'Date', 'DateFilled',
  'Time', 'TimeFilled', 'Timer', 'TimerFilled',
  
  // 位置与地图
  'Location', 'LocationFilled', 'MapLocation', 'MapLocationFilled', 'Position',
  'PositionFilled', 'Address', 'AddressBook',
  
  // 设备与屏幕
  'Monitor', 'Mobile', 'Tablet', 'Laptop', 'Cpu', 'CpuFilled', 'MemoryStick',
  'HardDrive', 'Usb', 'Keyboard', 'KeyboardFilled', 'Mouse', 'MouseFilled',
  'Earphones', 'Headset', 'Microphone', 'MicrophoneFilled', 'Speaker', 'SpeakerFilled',
  'Volume', 'VolumeFilled', 'VolumeMute', 'VolumeMuteFilled', 'VolumeLow',
  'VolumeLowFilled', 'VolumeMedium', 'VolumeMediumFilled', 'VolumeHigh',
  'VolumeHighFilled', 'FullScreen', 'FullScreenExit',
  
  // 安全与权限
  'Lock', 'LockFilled', 'Unlock', 'UnlockFilled', 'Key', 'KeyFilled',
  'Password', 'Eye', 'EyeFilled', 'EyeClosed', 'EyeClosedFilled', 'Shield',
  'ShieldFilled', 'ShieldCheck', 'ShieldCheckFilled', 'ShieldWarning',
  'ShieldWarningFilled', 'CircleLocked',
  
  // 其他
  'Star', 'StarFilled', 'StarHalf', 'StarHalfFilled', 'Favorite', 'FavoriteFilled',
  'Like', 'LikeFilled', 'Dislike', 'DislikeFilled', 'ThumbsUp', 'ThumbsUpFilled',
  'ThumbsDown', 'ThumbsDownFilled', 'Collect', 'CollectFilled', 'History',
  'HistoryFilled', 'Favorites', 'FavoritesFilled', 'Rank', 'RankFilled',
  'Ticket', 'TicketFilled', 'Gift', 'GiftFilled', 'Flag', 'FlagFilled',
  'More', 'MoreFilled', 'DArrowRight', 'DArrowDown',
  
  // 形状
  'Circle', 'CircleFilled', 'Square', 'SquareFilled', 'Rectangle',
  'RectangleFilled', 'Triangle', 'TriangleFilled', 'Diamond', 'DiamondFilled',
  'Odometer', 'Pointer', 'Grid', 'GridFilled', 'List', 'ListFilled',
  'Menu', 'MenuFilled', 'MenuFold', 'MenuUnfold', 'SwitchButton', 'Switch',
  
  // 办公与文档
  'Document', 'DocumentAdd', 'DocumentCopy', 'DocumentDelete', 'DocumentEdit',
  'DocumentChecked', 'DocumentRemove', 'DocumentSave', 'DocumentShare',
  'DocumentView', 'DocumentZip', 'Folder', 'FolderAdd', 'FolderDelete',
  'FolderOpen', 'FolderOpened', 'FolderRemove', 'FolderView', 'FolderZip',
  'PaperClip', 'Attachment', 'File', 'FileAdd', 'FileCopy', 'FileDelete',
  'FileEdit', 'FileDone', 'FileRemove', 'FileSave', 'FileShare', 'FileView',
  'FileZip', 'Files', 'Reading', 'ReadingFilled', 'Notebook', 'NotebookFilled',
  'Note', 'NoteFilled', 'Tickets', 'TicketsFilled', 'Printer', 'PrinterFilled'
]

// 过滤后的图标列表
const filteredIcons = computed(() => {
  let filtered = elementPlusIcons
  if (iconSearchText.value) {
    filtered = elementPlusIcons.filter(icon => 
      icon.toLowerCase().includes(iconSearchText.value.toLowerCase())
    )
  }
  // 只返回实际存在的图标名称
  return filtered.filter(icon => ElementPlusIconsVue[icon])
})

// 属性组相关
const attributeGroupLoading = ref(false)
const attributeGroupList = ref([])
const attributeGroupSearch = ref('')
const filteredAttributeGroupList = ref([])
const attributeGroupFormVisible = ref(false)
const attributeGroupForm = reactive({
  attributeGroupId: null,
  attributeGroupCode: '',
  attributeGroupName: '',
  description: '',
  sortOrder: 0
})
const attributeGroupFormRef = ref()
const attributeGroupFormRules = reactive({
 
  attributeGroupName: [
    { required: true, message: '属性组名称不能为空', trigger: 'blur' }
  ]
})

// 属性组树配置
const attributeGroupTreeProps = {
  label: 'attributeGroupName',
  children: 'children'
}

// 计算属性：当前选中的属性组
const selectedAttributeGroup = computed(() => {
  if (!attributeGroupId.value) return null
  return attributeGroupList.value.find(group => group.attributeGroupId === attributeGroupId.value) || null
})

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  attributeCode: '',
  attributeName: ''
})

// 未关联属性查询参数
const queryUnassociatedParams = reactive({
  attributeName: '',
  attributeType: ''
})

// 未关联的属性列表
const unassociatedAttributes = ref([])
const selectedUnassociatedAttributes = ref([])

// 初始化
onMounted(() => {
  getAttributeGroupList()
  getList()
})

// 获取属性组列表
const getAttributeGroupList = async () => {
  attributeGroupLoading.value = true
  try {
    let res;
    if (catalogId.value) {
      // 如果有类目ID，获取该类目下的属性组
      res = await import('@/api/cpq/attributeGroup').then(api => api.listAttributeGroupByCatalog(catalogId.value))
      attributeGroupList.value = res.data || []
    } else {
      // 否则获取所有属性组
      res = await listAttributeGroup()
      attributeGroupList.value = res.rows || []
    }
    filteredAttributeGroupList.value = [...attributeGroupList.value]
    attributeGroupLoading.value = false
    
    // 如果没有初始属性组ID，默认选中第一个属性组
    if (!attributeGroupId.value && attributeGroupList.value.length > 0) {
      attributeGroupId.value = attributeGroupList.value[0].attributeGroupId
      getList()
    }
  } catch (error) {
    attributeGroupList.value = []
    filteredAttributeGroupList.value = []
    attributeGroupLoading.value = false
    ElMessage.error('获取属性组列表失败')
  }
}

// 搜索属性组
const handleAttributeGroupSearch = () => {
  if (!attributeGroupSearch.value) {
    filteredAttributeGroupList.value = [...attributeGroupList.value]
    return
  }
  
  const searchText = attributeGroupSearch.value.toLowerCase()
  filteredAttributeGroupList.value = attributeGroupList.value.filter(group => {
    return group.attributeGroupName.toLowerCase().includes(searchText) ||
           group.attributeGroupCode.toLowerCase().includes(searchText)
  })
}

// 选择属性组
const handleAttributeGroupSelect = (data) => {
  attributeGroupId.value = data.attributeGroupId
  getList()
}

// 获取属性组关联的属性列表
const getList = async () => {
  if (!attributeGroupId.value) {
    attributeGroupAttributeList.value = []
    total.value = 0
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const res = await listAttributeGroupAttributes(attributeGroupId.value)
    attributeGroupAttributeList.value = res.data || []
    total.value = res.data ? res.data.length : 0 // 假设API返回的是全部数据，前端做分页
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error('获取属性列表失败')
    attributeGroupAttributeList.value = []
    total.value = 0
  }
}

// 新增属性组
const handleAddAttributeGroup = () => {
  resetAttributeGroupForm()
  // 如果有类目ID，将其添加到属性组表单中
  if (catalogId.value) {
    attributeGroupForm.catalogId = catalogId.value
  }
  attributeGroupFormVisible.value = true
}

// 修改属性组
const handleEditAttributeGroup = (row) => {
  Object.assign(attributeGroupForm, {
    attributeGroupId: row.attributeGroupId,
    attributeGroupCode: row.attributeGroupCode,
    attributeGroupName: row.attributeGroupName,
    description: row.description || '',
    sortOrder: row.sortOrder || 0,
    catalogId: row.catalogId || catalogId.value
  })
  attributeGroupFormVisible.value = true
}

// 删除属性组
const handleDeleteAttributeGroup = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该属性组吗？删除后该属性组下的所有属性关联也会被删除。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await delAttributeGroup(row.attributeGroupId)
    ElMessage.success('删除成功')
    getAttributeGroupList()
    // 如果删除的是当前选中的属性组，重置选中状态
    if (attributeGroupId.value === row.attributeGroupId) {
      attributeGroupId.value = ''
      attributeGroupAttributeList.value = []
      total.value = 0
    }
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 重置属性组表单
const resetAttributeGroupForm = () => {
  attributeGroupForm.attributeGroupId = null
  attributeGroupForm.attributeGroupCode = ''
  attributeGroupForm.attributeGroupName = ''
  attributeGroupForm.description = ''
  attributeGroupForm.sortOrder = 0
  if (attributeGroupFormRef.value) {
    attributeGroupFormRef.value.resetFields()
  }
}

// 提交属性组表单
const submitAttributeGroupForm = async () => {
  if (!attributeGroupFormRef.value) return
  await attributeGroupFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (attributeGroupForm.attributeGroupId) {
          await updateAttributeGroup(attributeGroupForm)
          ElMessage.success('修改成功')
        } else {
          await addAttributeGroup(attributeGroupForm)
          ElMessage.success('新增成功')
        }
        attributeGroupFormVisible.value = false
        getAttributeGroupList()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.attributeCode = ''
  queryParams.attributeName = ''
  handleQuery()
}

// 切换搜索条件展开/收起
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// 分页大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

// 当前页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getList()
}

// 选择行变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 行点击
const handleRowClick = (row) => {
  // 实现点击行选中效果
}

// 获取属性类型中文名称
const getAttributeTypeName = (type) => {
  const typeMap = {
    text: '文本',
    number: '数字',
    select: '下拉选择',
    radio: '单选按钮组',
    checkbox: '复选框组',
    date: '日期时间',
    file: '文件上传',
    image: '图片上传'
  }
  return typeMap[type] || type
}

// 打开属性配置编辑对话框
const openConfigDialog = (row) => {
  // 复制当前行数据到配置表单
  currentAttribute.value = { ...row }
  
  Object.assign(configForm, {
    attributeGroupAttributeId: row.attributeGroupAttributeId,
    attributeType: row.attributeType || '',
    componentType: row.componentType || '',
    defaultValue: row.defaultValue || '',
    isRequired: row.isRequired || '0',
    isKeyParam: row.isKeyParam || '0',
    unit: row.unit || '',
    description: row.description || '',
    minValue: row.minValue !== undefined ? row.minValue : null,
    maxValue: row.maxValue !== undefined ? row.maxValue : null,
    step: row.step || 1,
    options: row.options || '',
    tooltip: row.tooltip || ''
  })
  configDialogVisible.value = true
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 关联属性
const handleAdd = () => {
  dialogVisible.value = true
  queryUnassociatedAttributes()
}

// 查询未关联的属性
const queryUnassociatedAttributes = async () => {
  loadingUnassociated.value = true
  try {
    // 调用产品属性接口获取所有属性
    const res = await import('@/api/cpq/product').then(api => api.listAttribute({
      ...queryUnassociatedParams,
      pageNum: 1,
      pageSize: 100 // 获取足够多的属性
    }))
    
    // 过滤出符合搜索条件的属性
    let filteredAttributes = res.rows || []
    if (queryUnassociatedParams.attributeName) {
      filteredAttributes = filteredAttributes.filter(
        item => item.attributeName && item.attributeName.includes(queryUnassociatedParams.attributeName)
      )
    }
    if (queryUnassociatedParams.attributeType) {
      filteredAttributes = filteredAttributes.filter(
        item => item.attributeType === queryUnassociatedParams.attributeType
      )
    }
    unassociatedAttributes.value = filteredAttributes
    loadingUnassociated.value = false
  } catch (error) {
    loadingUnassociated.value = false
    ElMessage.error('获取属性列表失败')
    unassociatedAttributes.value = []
  }
}

// 重置未关联属性查询
const resetUnassociatedQuery = () => {
  queryUnassociatedParams.attributeName = ''
  queryUnassociatedParams.attributeType = ''
  queryUnassociatedAttributes()
}

// 选择未关联属性变化
const handleUnassociatedSelectionChange = (selection) => {
  selectedUnassociatedAttributes.value = selection
}

// 取消关联属性对话框
const closeAddDialog = () => {
  dialogVisible.value = false
  selectedUnassociatedAttributes.value = []
}

// 确认关联属性
const confirmAddAssociation = async () => {
  if (selectedUnassociatedAttributes.value.length === 0) {
    ElMessage.warning('请选择要关联的属性')
    return
  }
  
  try {
    // 构建批量关联数据（符合接口文档要求的格式）
    const attributeIds = selectedUnassociatedAttributes.value.map(item => item.attributeId)
    
    const associationData = {
      attributeGroupId: attributeGroupId.value,
      attributeIds: attributeIds
    }
    
    await addAttributeGroupAttributeBatch(associationData)
    ElMessage.success('关联成功')
    closeAddDialog()
    getList()
  } catch (error) {
    ElMessage.error('关联失败')
  }
}

// 删除单个属性关联
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要解绑该属性吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 使用接口文档支持的格式：直接传递ID列表
    const deleteData = [row.attributeGroupAttributeId]
    await batchUnbindAttributeGroupAttribute(deleteData)
    ElMessage.success('解绑成功')
    getList()
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 批量解绑
const handleDeleteAll = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要解绑的属性')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要解绑选中的 ${multipleSelection.value.length} 个属性吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 使用接口文档支持的格式：直接传递ID列表
    const deleteData = multipleSelection.value.map(item => item.attributeGroupAttributeId)
    await batchUnbindAttributeGroupAttribute(deleteData)
    ElMessage.success('解绑成功')
    getList()
    multipleSelection.value = []
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 修改排序
const handleOrderChange = async (row) => {
  try {
    // 创建更新配置数据
    const updateData = {
      attributeGroupAttributeId: row.attributeGroupAttributeId,
      displayOrder: row.displayOrder
    }
    // 使用批量更新配置函数
    await batchUpdateAttributeGroupAttributeConfig([updateData])
    // 不需要刷新列表，因为已经更新了当前行的排序值
  } catch (error) {
    ElMessage.error('更新排序失败')
  }
}

// 批量更新属性配置
const batchUpdateConfig = async (updates) => {
  try {
    await batchUpdateAttributeGroupAttributeConfig(updates)
    ElMessage.success('批量更新成功')
    getList()
    return true
  } catch (error) {
    ElMessage.error('批量更新失败：' + (error.message || '未知错误'))
    return false
  }
}

// 保存属性配置
const saveAttributeConfig = async () => {
  try {
    // 验证属性名称是否包含禁止的字符（"、'、<）
    const attributeName = currentAttribute.value.attributeName;
    if (attributeName) {
      const prohibitedChars = /["'<]/;
      if (prohibitedChars.test(attributeName)) {
        ElMessage.warning('属性名称不能包含引号("\'")或小于号(<)字符');
        return;
      }
    }
    
    // 表单验证
    if (configFormRef.value) {
      await configFormRef.value.validate().catch(() => {
        ElMessage.warning('请检查表单填写是否正确')
        return Promise.reject()
      })
    }
    
    // 验证选项配置是否为有效的JSON格式
    if (configForm.options && configForm.options.trim()) {
      try {
        JSON.parse(configForm.options.trim())
      } catch (e) {
        ElMessage.warning('选项配置必须是有效的JSON格式')
        return
      }
    }
    
    // 数值范围验证
    if (configForm.minValue !== null && configForm.maxValue !== null) {
      if (configForm.minValue > configForm.maxValue) {
        ElMessage.warning('最小值不能大于最大值')
        return
      }
    }
    
    // 准备保存的数据
    const saveData = { ...configForm }
    
    // 调用批量保存接口
    await batchUpdateAttributeGroupAttributeConfig([saveData])
    
    ElMessage.success('保存成功')
    configDialogVisible.value = false
    getList() // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 打开属性值管理抽屉
const openAttributeValuesDrawer = (attributeGroupAttributeId, attributeName) => {
  currentAttributeGroupAttributeId.value = attributeGroupAttributeId
  // 确保属性名称不为空
  currentAttributeName.value = attributeName || '未知属性'
  attributeValuesQueryParams.pageNum = 1
  getAttributeValuesList()
  attributeValuesDrawerVisible.value = true
}

// 判断是否为图片URL
const isImageUrl = (url) => {
  if (!url) return false
  // 简单判断：如果包含http/https、data:或.jpg/.jpeg/.png/.gif/.webp/.svg等图片扩展名，则认为是图片URL
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i
  return imageExtensions.test(url) || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')
}

// 选择图标
const selectIcon = (icon) => {
  selectedIcon.value = icon
}

// 确认选择图标
const confirmIconSelection = () => {
  if (selectedIcon.value) {
    attributeValueForm.imgUrl = selectedIcon.value
    selectedIcon.value = ''
    showIconPicker.value = false
  }
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 简单的本地预览实现，实际项目中应该上传到服务器获取URL
  const reader = new FileReader()
  reader.onload = (e) => {
    attributeValueForm.imgUrl = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 清空input值，以便下次能重新选择同一文件
  event.target.value = ''
}

// 获取属性值列表
const getAttributeValuesList = async () => {
  if (!currentAttributeGroupAttributeId.value) return
  
  attributeValuesLoading.value = true
  try {
    const res = await getAttributeGroupAttributeValueByAttributeGroupAttributeId(currentAttributeGroupAttributeId.value)
    attributeValuesList.value = res.data || []
    attributeValuesTotal.value = res.data ? res.data.length : 0
    attributeValuesLoading.value = false
  } catch (error) {
    ElMessage.error('获取属性值列表失败')
    attributeValuesList.value = []
    attributeValuesTotal.value = 0
    attributeValuesLoading.value = false
  }
}

// 属性值选择变化
const handleAttributeValuesSelectionChange = (selection) => {
  selectedAttributeValues.value = selection
}

// 新增属性值
const handleAddAttributeValue = () => {
  resetAttributeValueForm()
  attributeValueForm.attributeGroupAttributeId = currentAttributeGroupAttributeId.value
  attributeValueFormVisible.value = true
}

// 编辑属性值
const handleEditAttributeValue = (row) => {
  Object.assign(attributeValueForm, {
    id: row.id,
    attributeGroupAttributeId: row.attributeGroupAttributeId,
    valueId: row.valueId,
    valueName: row.valueName,
    isDefault: row.isDefault || '0',
    sortOrder: row.sortOrder || 0,
    imgUrl: row.imgUrl || ''
  })
  attributeValueFormVisible.value = true
}

// 删除单个属性值
const handleDeleteAttributeValue = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该属性值吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await delAttributeGroupAttributeValue(row.id)
    ElMessage.success('删除成功')
    getAttributeValuesList()
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 批量删除属性值
const handleDeleteAttributeValues = async () => {
  try {
    if (selectedAttributeValues.value.length === 0) {
      ElMessage.warning('请选择要删除的属性值')
      return
    }
    
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedAttributeValues.value.length} 个属性值吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedAttributeValues.value.map(item => item.id).join(',')
    await delAttributeGroupAttributeValue(ids)
    ElMessage.success('删除成功')
    getAttributeValuesList()
    selectedAttributeValues.value = []
  } catch (error) {
    // 用户取消操作或操作失败时不显示错误信息
  }
}

// 属性值排序变更
const handleAttributeValueSortChange = async (row) => {
  try {
    await updateAttributeGroupAttributeValue({
      id: row.id,
      sortOrder: row.sortOrder
    })
    ElMessage.success('排序更新成功')
    getAttributeValuesList()
  } catch (error) {
    ElMessage.error('排序更新失败')
    getAttributeValuesList() // 刷新列表恢复原有排序
  }
}

// 重置属性值表单
const resetAttributeValueForm = () => {
  attributeValueForm.id = null
  attributeValueForm.attributeGroupAttributeId = null
  attributeValueForm.valueId = null
  attributeValueForm.valueName = ''
  attributeValueForm.isDefault = '0'
  attributeValueForm.sortOrder = 0
  attributeValueForm.imgUrl = ''
  if (attributeValueFormRef.value) {
    attributeValueFormRef.value.resetFields()
  }
}

// 提交属性值表单
const submitAttributeValueForm = async () => {
  if (!attributeValueFormRef.value) return
  
  await attributeValueFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (attributeValueForm.id) {
          // 修改属性值
          await updateAttributeGroupAttributeValue(attributeValueForm)
          ElMessage.success('修改成功')
        } else {
          // 新增属性值
          await addAttributeGroupAttributeValue(attributeValueForm)
          ElMessage.success('新增成功')
        }
        attributeValueFormVisible.value = false
        getAttributeValuesList()
      } catch (error) {
        ElMessage.error('操作失败：' + (error.message || '未知错误'))
      }
    }
  })
}

// 关闭属性值表单
const closeAttributeValueForm = () => {
  attributeValueFormVisible.value = false
  resetAttributeValueForm()
}

// 属性值分页大小变化
const handleAttributeValuesSizeChange = (val) => {
  attributeValuesQueryParams.pageSize = val
  getAttributeValuesList()
}

// 属性值当前页码变化
const handleAttributeValuesCurrentChange = (val) => {
  attributeValuesQueryParams.pageNum = val
  getAttributeValuesList()
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.head-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-container {
  flex: 1;
}

.main-content {
  margin-top: 20px;
}

.left-panel {
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.right-panel {
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.attribute-group-name {
  color: #409eff;
  font-weight: normal;
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-content:hover .node-actions {
  opacity: 1;
}

:deep(.node-action-btn) {
  display: flex;
  align-items: center;
  gap: 2px;
}

:deep(.node-action-btn i) {
  margin-right: 2px;
}

:deep(.node-action-btn span) {
  font-size: 12px;
}

/* 确保文字可见 */
:deep(.el-button--text) {
  color: inherit;
}

:deep(.el-button--primary.el-button--text) {
  color: #409eff;
}

:deep(.el-button--danger.el-button--text) {
  color: #f56c6c;
}

/* 选中属性组的高亮样式 */
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #f0f9ff;
  color: #409eff;
}

:deep(.el-tree-node__content) {
  transition: all 0.3s;
}

.button-container {
  display: flex;
  gap: 10px;
}

/* 抽屉内容样式 */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 抽屉头部样式 */
.drawer-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

/* 确保抽屉内容不会溢出 */
:deep(.el-drawer__body) {
  overflow: auto;
}

/* 图片/图标选择容器样式 */
.image-icon-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 预览容器样式 */
.preview-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 清除按钮样式 */
.clear-btn {
  margin-left: auto;
}

/* 选择方式按钮样式 */
.selection-methods {
  display: flex;
  gap: 10px;
}

.method-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 图标选择器弹窗样式 */
.icon-picker-container {
  max-height: 400px;
  overflow: auto;
}

/* 图标网格样式 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
  padding: 10px;
}

/* 图标项样式 */
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.icon-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.icon-item.selected {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

/* 图标预览样式 */
.icon-preview {
  font-size: 24px;
  margin-bottom: 8px;
}

/* 图标名称样式 */
.icon-name {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}
</style>