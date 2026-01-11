/**
 * 动作配置系统常量和枚举
 * 基于主流CPQ系统设计
 */

// ==================== 动作类型定义 ====================
export const ACTION_CATEGORIES = {
  BASIC: 'basic',        // 基础动作
  MUTUAL: 'mutual',      // 相互联动
  PRICE: 'price',        // 价格动作
  MESSAGE: 'message',    // 消息通知
  DATA: 'data'          // 数据处理
}

// 动作类型配置
export const ACTION_TYPES = {
  // 基础动作
  IS_ENABLE: 'isEnable',          // 是否启用
  IS_RECOMMEND: 'isRecommend',    // 是否推荐
  IS_SHOW: 'isShow',              // 是否显示
  IS_REQUIRED: 'isRequired',      // 是否必选
  RESET: 'reset',                 // 是否重置
  
  // 相互联动
  LINK_SELECT: 'linkSelect',      // 联动选中
  EXCLUDE: 'exclude',             // 联动排除
  MUTUAL_SELECT: 'mutualSelect',  // 相互选中
  MUTUAL_EXCLUDE: 'mutualExclude', // 相互排斥
  MULTIPLE_SELECT: 'multipleSelect', // 多选
  
  // 价格动作
  APPLY_DISCOUNT: 'applyDiscount', // 应用折扣
  APPLY_FULL_REDUCTION: 'applyFullReduction', // 应用满减
  SET_PRICE: 'setPrice',          // 设置单价
  
  // 消息通知
  SHOW_MESSAGE: 'showMessage',    // 显示消息
  SEND_NOTIFICATION: 'sendNotification', // 发送通知
  TRIGGER_WARNING: 'triggerWarning', // 触发警告
  
  // 数据处理
  CALCULATION: 'calculation',     // 参数计算
  CALL_API: 'callApi',           // 调用API
  TRIGGER_RULE: 'triggerRule',   // 触发规则
}

// 动作类型分组配置
export const ACTION_TYPE_GROUPS = [
  {
    label: '基础动作',
    category: ACTION_CATEGORIES.BASIC,
    options: [
      { label: '是否启用', value: ACTION_TYPES.IS_ENABLE },
      { label: '是否推荐', value: ACTION_TYPES.IS_RECOMMEND },
      { label: '是否显示', value: ACTION_TYPES.IS_SHOW },
      { label: '是否必选', value: ACTION_TYPES.IS_REQUIRED },
      { label: '是否重置', value: ACTION_TYPES.RESET }
    ]
  },
  {
    label: '相互联动',
    category: ACTION_CATEGORIES.MUTUAL,
    options: [
      { label: '联动选中', value: ACTION_TYPES.LINK_SELECT },
      { label: '联动排除', value: ACTION_TYPES.EXCLUDE },
      { label: '相互选中', value: ACTION_TYPES.MUTUAL_SELECT },
      { label: '相互排斥', value: ACTION_TYPES.MUTUAL_EXCLUDE },
      { label: '多选', value: ACTION_TYPES.MULTIPLE_SELECT }
    ]
  },
  {
    label: '价格动作',
    category: ACTION_CATEGORIES.PRICE,
    options: [
      { label: '应用折扣', value: ACTION_TYPES.APPLY_DISCOUNT },
      { label: '应用满减', value: ACTION_TYPES.APPLY_FULL_REDUCTION },
      { label: '设置单价', value: ACTION_TYPES.SET_PRICE }
    ]
  },
  {
    label: '消息通知',
    category: ACTION_CATEGORIES.MESSAGE,
    options: [
      { label: '显示消息', value: ACTION_TYPES.SHOW_MESSAGE },
      { label: '发送通知', value: ACTION_TYPES.SEND_NOTIFICATION },
      { label: '触发警告', value: ACTION_TYPES.TRIGGER_WARNING }
    ]
  },
  {
    label: '数据处理',
    category: ACTION_CATEGORIES.DATA,
    options: [
      { label: '参数计算', value: ACTION_TYPES.CALCULATION },
      { label: '调用API', value: ACTION_TYPES.CALL_API },
      { label: '触发规则', value: ACTION_TYPES.TRIGGER_RULE }
    ]
  }
]

// ==================== 目标类型定义 ====================
export const TARGET_TYPES = {
  NODE: 'node',                             // 节点
  NODE_STATIC_ATTR: 'nodeStaticAttr',      // 节点静态属性
  NODE_STATIC_ATTR_VALUE: 'nodeStaticAttrValue', // 节点静态属性值
  NODE_DYNAMIC_ATTR: 'nodeDynamicAttr',    // 节点动态属性
  NODE_DYNAMIC_ATTR_VALUE: 'nodeDynamicAttrValue', // 节点动态属性值
  NODE_PRODUCT: 'nodeProduct',             // 节点产品
  DYNAMIC_ATTR: 'dynamicAttr',             // 动态属性
  DYNAMIC_ATTR_VALUE: 'dynamicAttrValue',   // 动态属性值
  RULE: 'rule',                            // 规则
  VARIABLE: 'variable'                     // 变量信息
}

// 目标类型标签
export const TARGET_TYPE_LABELS = {
  [TARGET_TYPES.NODE]: '节点',
  [TARGET_TYPES.NODE_STATIC_ATTR]: '节点静态属性',
  [TARGET_TYPES.NODE_STATIC_ATTR_VALUE]: '节点静态属性值',
  [TARGET_TYPES.NODE_DYNAMIC_ATTR]: '节点动态属性',
  [TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE]: '节点动态属性值',
  [TARGET_TYPES.NODE_PRODUCT]: '节点产品',
  [TARGET_TYPES.DYNAMIC_ATTR]: '动态属性',
  [TARGET_TYPES.DYNAMIC_ATTR_VALUE]: '动态属性值',
  [TARGET_TYPES.RULE]: '规则',
  [TARGET_TYPES.VARIABLE]: '变量信息'
}

// 目标类型说明
export const TARGET_TYPE_DESCRIPTIONS = {
  [TARGET_TYPES.NODE]: '选择BOM树中的节点，动作将应用于整个节点',
  [TARGET_TYPES.NODE_STATIC_ATTR]: '选择节点的静态属性，如颜色、尺寸等固定属性',
  [TARGET_TYPES.NODE_STATIC_ATTR_VALUE]: '选择节点静态属性的具体值，如颜色中的"红色"',
  [TARGET_TYPES.NODE_DYNAMIC_ATTR]: '选择节点的动态属性，如用户可配置的参数',
  [TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE]: '选择节点动态属性的具体值',
  [TARGET_TYPES.NODE_PRODUCT]: '选择节点关联的产品，如某个SKU',
  [TARGET_TYPES.DYNAMIC_ATTR]: '选择动态属性（全局）',
  [TARGET_TYPES.DYNAMIC_ATTR_VALUE]: '选择动态属性的具体值',
  [TARGET_TYPES.RULE]: '选择其他规则，可以触发规则执行',
  [TARGET_TYPES.VARIABLE]: '选择变量，用于存储计算结果'
}

// ==================== 动作类型与目标类型映射关系 ====================
export const ACTION_TARGET_MAP = {
  // 基础动作 - 是否启用
  [ACTION_TYPES.IS_ENABLE]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT,
    TARGET_TYPES.RULE
  ],
  
  // 基础动作 - 是否推荐
  [ACTION_TYPES.IS_RECOMMEND]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 基础动作 - 是否显示
  [ACTION_TYPES.IS_SHOW]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT,
    TARGET_TYPES.RULE
  ],
  
  // 基础动作 - 是否必选
  [ACTION_TYPES.IS_REQUIRED]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR
  ],
  
  // 基础动作 - 是否重置
  [ACTION_TYPES.RESET]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR
  ],
  
  // 相互联动 - 联动选中
  [ACTION_TYPES.LINK_SELECT]: [
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 相互联动 - 联动排除
  [ACTION_TYPES.EXCLUDE]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE
  ],
  
  // 相互联动 - 相互选中
  [ACTION_TYPES.MUTUAL_SELECT]: [
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 相互联动 - 相互排斥
  [ACTION_TYPES.MUTUAL_EXCLUDE]: [
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 相互联动 - 多选
  [ACTION_TYPES.MULTIPLE_SELECT]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 价格动作 - 应用折扣
  [ACTION_TYPES.APPLY_DISCOUNT]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 价格动作 - 应用满减
  [ACTION_TYPES.APPLY_FULL_REDUCTION]: [
    TARGET_TYPES.NODE
  ],
  
  // 价格动作 - 设置单价
  [ACTION_TYPES.SET_PRICE]: [
    TARGET_TYPES.NODE,
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT
  ],
  
  // 数据处理 - 参数计算
  [ACTION_TYPES.CALCULATION]: [
    TARGET_TYPES.VARIABLE,
    TARGET_TYPES.NODE_STATIC_ATTR
  ],
  
  // 数据处理 - 触发规则
  [ACTION_TYPES.TRIGGER_RULE]: [
    TARGET_TYPES.RULE
  ],
  
  // 数据处理 - 调用API (不需要目标类型)
  [ACTION_TYPES.CALL_API]: []
}

// ==================== 目标选择配置 ====================
// 判断目标类型是否需要层级选择（节点 -> 属性 -> 属性值）
export const needsHierarchicalSelection = (actionType, targetType) => {
  // 需要层级选择的情况：
  // 1. 节点静态属性：需要先选节点，再选属性
  // 2. 节点静态属性值：需要先选节点，再选属性，最后选属性值
  // 3. 节点动态属性：需要先选节点，再选属性
  // 4. 节点动态属性值：需要先选节点，再选属性，最后选属性值
  // 5. 节点产品：需要先选节点，再选产品
  // 6. 动态属性：需要先选节点，再选属性
  // 7. 动态属性值：需要先选节点，再选属性，最后选属性值
  
  const hierarchicalTargets = [
    TARGET_TYPES.NODE_STATIC_ATTR,
    TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
    TARGET_TYPES.NODE_DYNAMIC_ATTR,
    TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
    TARGET_TYPES.NODE_PRODUCT,
    TARGET_TYPES.DYNAMIC_ATTR,
    TARGET_TYPES.DYNAMIC_ATTR_VALUE
  ]
  
  return hierarchicalTargets.includes(targetType)
}

// 判断是否需要显示目标类型选择
export const shouldShowTargetType = (actionType) => {
  // 消息通知和调用API不需要显示目标类型
  const hideTargetTypes = [
    ACTION_TYPES.SHOW_MESSAGE,
    ACTION_TYPES.SEND_NOTIFICATION,
    ACTION_TYPES.TRIGGER_WARNING,
    ACTION_TYPES.CALL_API
  ]
  
  return !hideTargetTypes.includes(actionType)
}

// 判断是否需要显示目标对象选择
export const shouldShowTargetObject = (actionType, targetType) => {
  // 消息通知和调用API不需要目标对象
  const hideTargetObjectActions = [
    ACTION_TYPES.SHOW_MESSAGE,
    ACTION_TYPES.SEND_NOTIFICATION,
    ACTION_TYPES.TRIGGER_WARNING,
    ACTION_TYPES.CALL_API
  ]
  
  if (hideTargetObjectActions.includes(actionType)) {
    return false
  }
  
  // 联动排除-节点 不需要目标对象
  if (actionType === ACTION_TYPES.EXCLUDE && targetType === TARGET_TYPES.NODE) {
    return false
  }
  
  return true
}

// 判断目标对象是否支持多选
export const isMultipleSelection = (actionType, targetType) => {
  // 特殊情况：单选
  // 1. 应用满减-节点：单选
  // 2. 设置单价-节点：单选
  // 3. 参数计算-变量信息：单选
  // 4. 节点静态属性：始终单选
  // 5. 节点动态属性：始终单选
  // 6. 联动选中-节点静态属性值：单选
  // 7. 联动选中-节点动态属性值：单选
  
  if (actionType === ACTION_TYPES.APPLY_FULL_REDUCTION && targetType === TARGET_TYPES.NODE) {
    return false
  }
  
  if (actionType === ACTION_TYPES.SET_PRICE && targetType === TARGET_TYPES.NODE) {
    return false
  }
  
  if (actionType === ACTION_TYPES.CALCULATION && targetType === TARGET_TYPES.VARIABLE) {
    return false
  }
  
  // 节点静态属性和节点动态属性始终单选
  if ([TARGET_TYPES.NODE_STATIC_ATTR, TARGET_TYPES.NODE_DYNAMIC_ATTR].includes(targetType)) {
    return false
  }
  
  if (actionType === ACTION_TYPES.LINK_SELECT && 
      (targetType === TARGET_TYPES.NODE_STATIC_ATTR_VALUE || targetType === TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE)) {
    return false
  }
  
  // 其他情况默认多选
  return true
}

// ==================== 动作参数配置 ====================
// 判断是否需要隐藏动作参数
export const shouldHideActionParams = (actionType, targetType) => {
  // 隐藏动作参数的情况：
  // 1. 联动排除（所有目标类型）
  // 2. 相互选中（所有目标类型）
  // 3. 相互排斥（所有目标类型）
  // 4. 触发规则
  // 5. 联动选中
  
  const hideParamsActions = [
    ACTION_TYPES.EXCLUDE,
    ACTION_TYPES.MUTUAL_SELECT,
    ACTION_TYPES.MUTUAL_EXCLUDE,
    ACTION_TYPES.TRIGGER_RULE,
    ACTION_TYPES.LINK_SELECT
  ]
  
  return hideParamsActions.includes(actionType)
}

// 默认动作参数配置
export const getDefaultActionParams = (actionType, targetType) => {
  const defaultParams = {
    // 基础动作 - 开关类型
    [ACTION_TYPES.IS_ENABLE]: { value: true },
    [ACTION_TYPES.IS_RECOMMEND]: { value: true },
    [ACTION_TYPES.IS_SHOW]: { value: true },
    [ACTION_TYPES.IS_REQUIRED]: { value: true },
    [ACTION_TYPES.RESET]: { value: true },
    
    // 联动选中 - 根据目标类型不同
    [ACTION_TYPES.LINK_SELECT]: 
      targetType === TARGET_TYPES.NODE_PRODUCT 
        ? { value: true } 
        : { value: [] }, // 属性值下拉选择
    
    // 多选
    [ACTION_TYPES.MULTIPLE_SELECT]: { minSelect: 1, maxSelect: 10 },
    
    // 价格动作
    [ACTION_TYPES.APPLY_DISCOUNT]: { 
      type: 'percentage', 
      value: 0.9, 
      isStackable: false 
    },
    [ACTION_TYPES.APPLY_FULL_REDUCTION]: { 
      conditionType: 'amount', 
      conditionValue: 1000, 
      reduceType: 'fixed', 
      reduceValue: 100, 
      isLoop: false 
    },
    [ACTION_TYPES.SET_PRICE]: { 
      settingType: 'fixed', 
      value: 0 
    },
    
    // 消息通知
    [ACTION_TYPES.SHOW_MESSAGE]: { 
      level: 'info', 
      title: '提示', 
      content: '' 
    },
    [ACTION_TYPES.SEND_NOTIFICATION]: { 
      type: 'email', 
      recipient: '', 
      content: '' 
    },
    [ACTION_TYPES.TRIGGER_WARNING]: { 
      level: 'warning', 
      message: '' 
    },
    
    // 数据处理
    [ACTION_TYPES.CALCULATION]: { 
      formula: '', 
      resultStorage: '' 
    },
    [ACTION_TYPES.CALL_API]: { 
      apiParams: '' 
    }
  }
  
  return defaultParams[actionType] || {}
}

// ==================== 辅助函数 ====================
// 获取动作分类
export const getActionCategory = (actionType) => {
  const basicActions = [
    ACTION_TYPES.IS_ENABLE,
    ACTION_TYPES.IS_RECOMMEND,
    ACTION_TYPES.IS_SHOW,
    ACTION_TYPES.IS_REQUIRED,
    ACTION_TYPES.RESET
  ]
  
  const mutualActions = [
    ACTION_TYPES.LINK_SELECT,
    ACTION_TYPES.EXCLUDE,
    ACTION_TYPES.MUTUAL_SELECT,
    ACTION_TYPES.MUTUAL_EXCLUDE,
    ACTION_TYPES.MULTIPLE_SELECT
  ]
  
  const priceActions = [
    ACTION_TYPES.APPLY_DISCOUNT,
    ACTION_TYPES.APPLY_FULL_REDUCTION,
    ACTION_TYPES.SET_PRICE
  ]
  
  const messageActions = [
    ACTION_TYPES.SHOW_MESSAGE,
    ACTION_TYPES.SEND_NOTIFICATION,
    ACTION_TYPES.TRIGGER_WARNING
  ]
  
  const dataActions = [
    ACTION_TYPES.CALCULATION,
    ACTION_TYPES.CALL_API,
    ACTION_TYPES.TRIGGER_RULE
  ]
  
  if (basicActions.includes(actionType)) return ACTION_CATEGORIES.BASIC
  if (mutualActions.includes(actionType)) return ACTION_CATEGORIES.MUTUAL
  if (priceActions.includes(actionType)) return ACTION_CATEGORIES.PRICE
  if (messageActions.includes(actionType)) return ACTION_CATEGORIES.MESSAGE
  if (dataActions.includes(actionType)) return ACTION_CATEGORIES.DATA
  
  return null
}

// 获取目标类型选项
export const getTargetTypeOptions = (actionType) => {
  const targetTypes = ACTION_TARGET_MAP[actionType] || []
  return targetTypes.map(type => ({
    label: TARGET_TYPE_LABELS[type],
    value: type
  }))
}

// 验证动作配置
export const validateActionConfig = (actionData) => {
  const errors = []
  
  // 验证动作类型
  if (!actionData.actionType) {
    errors.push('请选择动作类型')
  }
  
  // 验证目标类型
  if (shouldShowTargetType(actionData.actionType) && !actionData.targetType) {
    errors.push('请选择目标类型')
  }
  
  // 验证节点选择
  if (actionData.targetType) {
    const needsNode = [
      TARGET_TYPES.NODE_STATIC_ATTR,
      TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
      TARGET_TYPES.NODE_DYNAMIC_ATTR,
      TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE,
      TARGET_TYPES.NODE_PRODUCT
    ].includes(actionData.targetType)
    
    if (needsNode && !actionData.structureId) {
      errors.push('请选择节点')
    }
    
    // 验证属性选择
    const needsAttribute = [
      TARGET_TYPES.NODE_STATIC_ATTR_VALUE,
      TARGET_TYPES.NODE_DYNAMIC_ATTR_VALUE
    ].includes(actionData.targetType)
    
    if (needsAttribute && !actionData.attributeId) {
      errors.push('请选择属性')
    }
  }
  
  // 验证目标对象
  if (shouldShowTargetObject(actionData.actionType, actionData.targetType) && !actionData.targetId) {
    errors.push('请选择目标对象')
  }
  
  // 验证动作参数
  if (!shouldHideActionParams(actionData.actionType, actionData.targetType)) {
    if (!actionData.actionParams) {
      errors.push('请配置动作参数')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// ==================== 冲突检测 ====================
/**
 * 检测动作列表中的冲突
 * @param {Array} actionList - 动作列表
 * @returns {Array} - 冲突列表
 */
export const detectActionConflicts = (actionList) => {
  const conflicts = []
  
  // 按目标对象分组
  const targetGroups = {}
  actionList.forEach((action, index) => {
    const key = `${action.targetType}_${action.targetId}`
    if (!targetGroups[key]) {
      targetGroups[key] = []
    }
    targetGroups[key].push({ action, index })
  })
  
  // 检测每组中的冲突
  Object.entries(targetGroups).forEach(([key, group]) => {
    if (group.length < 2) return
    
    // 冲突类型1: 同一目标对象的is_enable冲突（一个启用一个禁用）
    const enableActions = group.filter(item => 
      item.action.actionType === ACTION_TYPES.IS_ENABLE
    )
    if (enableActions.length > 1) {
      const values = enableActions.map(item => {
        try {
          return JSON.parse(item.action.actionParams).value
        } catch {
          return null
        }
      })
      if (values.includes(true) && values.includes(false)) {
        conflicts.push({
          type: 'enable_conflict',
          message: '同一目标对象存在冲突的启用/禁用动作',
          actions: enableActions.map(item => item.index),
          level: 'error'
        })
      }
    }
    
    // 冲突类型2: 同一目标对象的is_show冲突
    const showActions = group.filter(item => 
      item.action.actionType === ACTION_TYPES.IS_SHOW
    )
    if (showActions.length > 1) {
      const values = showActions.map(item => {
        try {
          return JSON.parse(item.action.actionParams).value
        } catch {
          return null
        }
      })
      if (values.includes(true) && values.includes(false)) {
        conflicts.push({
          type: 'show_conflict',
          message: '同一目标对象存在冲突的显示/隐藏动作',
          actions: showActions.map(item => item.index),
          level: 'error'
        })
      }
    }
    
    // 冲突类型3: 同一目标对象的多个价格设置动作
    const priceActions = group.filter(item => 
      [ACTION_TYPES.APPLY_DISCOUNT, ACTION_TYPES.SET_PRICE].includes(item.action.actionType)
    )
    if (priceActions.length > 1) {
      // 检查是否有不可叠加的折扣
      const nonStackable = priceActions.some(item => {
        try {
          const params = JSON.parse(item.action.actionParams)
          return params.isStackable === false
        } catch {
          return false
        }
      })
      
      if (nonStackable) {
        conflicts.push({
          type: 'price_conflict',
          message: '同一目标对象存在多个价格动作，且包含不可叠加的折扣',
          actions: priceActions.map(item => item.index),
          level: 'warning'
        })
      }
    }
    
    // 冲突类型4: 互斥动作检测
    const mutualExcludeActions = group.filter(item =>
      item.action.actionType === ACTION_TYPES.MUTUAL_EXCLUDE
    )
    const mutualSelectActions = group.filter(item =>
      item.action.actionType === ACTION_TYPES.MUTUAL_SELECT
    )
    
    if (mutualExcludeActions.length > 0 && mutualSelectActions.length > 0) {
      conflicts.push({
        type: 'mutual_conflict',
        message: '同一目标对象同时存在相互排斥和相互选中动作',
        actions: [...mutualExcludeActions, ...mutualSelectActions].map(item => item.index),
        level: 'error'
      })
    }
  })
  
  // 冲突类型5: 优先级冲突（同优先级的冲突动作）
  const priorityGroups = {}
  actionList.forEach((action, index) => {
    const priority = action.actionPriority || 1
    if (!priorityGroups[priority]) {
      priorityGroups[priority] = []
    }
    priorityGroups[priority].push({ action, index })
  })
  
  Object.entries(priorityGroups).forEach(([priority, group]) => {
    if (group.length < 2) return
    
    // 检查同优先级是否有冲突的动作类型
    const hasEnable = group.some(item => item.action.actionType === ACTION_TYPES.IS_ENABLE)
    const hasShow = group.some(item => item.action.actionType === ACTION_TYPES.IS_SHOW)
    const hasPrice = group.some(item => 
      [ACTION_TYPES.APPLY_DISCOUNT, ACTION_TYPES.APPLY_FULL_REDUCTION, ACTION_TYPES.SET_PRICE]
        .includes(item.action.actionType)
    )
    
    if ((hasEnable || hasShow || hasPrice) && group.length > 3) {
      conflicts.push({
        type: 'priority_conflict',
        message: `优先级${priority}包含过多动作(${group.length}个)，可能影响执行顺序`,
        actions: group.map(item => item.index),
        level: 'info'
      })
    }
  })
  
  return conflicts
}

/**
 * 获取冲突级别对应的标签类型
 */
export const getConflictTagType = (level) => {
  const typeMap = {
    error: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return typeMap[level] || 'info'
}
