-- CPQ系统菜单SQL
-- 菜单表结构假设包含：menu_id, menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark

-- 1. CPQ系统主菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('CPQ系统', 0, '/cpq', 'Layout', 0, 0, 'M', 0, 0, 'cpq:system:list', 'shopping', 100, 'admin', NOW(), 'admin', NOW(), 'CPQ系统主菜单');

-- 获取CPQ系统主菜单ID，用于子菜单关联
SET @cpq_menu_id = LAST_INSERT_ID();

-- 2. 产品管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('产品管理', @cpq_menu_id, 'product', 'cpq/product/index', 0, 0, 'C', 0, 0, 'cpq:product:list', 'example', 1, 'admin', NOW(), 'admin', NOW(), '产品管理');

-- 3. 产品目录菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('产品目录', @cpq_menu_id, 'product/catalog', 'cpq/product/catalog', 0, 0, 'C', 0, 0, 'cpq:product:catalog', 'nested', 2, 'admin', NOW(), 'admin', NOW(), '产品目录管理');

-- 4. 产品属性菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('产品属性', @cpq_menu_id, 'product/attribute', 'cpq/product/attribute', 0, 0, 'C', 0, 0, 'cpq:product:attribute', 'list', 3, 'admin', NOW(), 'admin', NOW(), '产品属性管理');

-- 5. 品牌管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('品牌管理', @cpq_menu_id, 'brand', 'cpq/brand/index', 0, 0, 'C', 0, 0, 'cpq:brand:list', 'list', 4, 'admin', NOW(), 'admin', NOW(), '品牌管理');

-- 6. 系列管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('系列管理', @cpq_menu_id, 'series', 'cpq/series/index', 0, 0, 'C', 0, 0, 'cpq:series:list', 'list', 5, 'admin', NOW(), 'admin', NOW(), '系列管理');

-- 7. BOM管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('BOM管理', @cpq_menu_id, 'bom', 'cpq/bom/index', 0, 0, 'C', 0, 0, 'cpq:bom:list', 'tree-table', 6, 'admin', NOW(), 'admin', NOW(), 'BOM管理');

-- 8. BOM管理详情菜单（隐藏）
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('BOM管理详情', @cpq_menu_id, 'bom/manage', 'cpq/bom/manage', 0, 0, 'C', 1, 0, 'cpq:bom:manage', 'settings', 7, 'admin', NOW(), 'admin', NOW(), 'BOM管理详情');

-- 9. 产品配置器菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('产品配置器', @cpq_menu_id, 'configurator', 'cpq/configurator/list', 0, 0, 'C', 0, 0, 'cpq:configurator:list', 'build', 8, 'admin', NOW(), 'admin', NOW(), '产品配置器');

-- 10. 配置详情菜单（隐藏）
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('配置详情', @cpq_menu_id, 'configurator/:bomId', 'cpq/configurator/index', 0, 0, 'C', 1, 0, 'cpq:configurator:detail', 'build', 9, 'admin', NOW(), 'admin', NOW(), '配置详情');

-- 11. 定价管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('定价管理', @cpq_menu_id, 'pricing', 'cpq/pricing/strategy', 0, 0, 'C', 0, 0, 'cpq:pricing:list', 'money', 10, 'admin', NOW(), 'admin', NOW(), '定价管理');

-- 12. 解决方案菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('解决方案', @cpq_menu_id, 'solution', 'cpq/solution/index', 0, 0, 'C', 0, 0, 'cpq:solution:list', 'money', 11, 'admin', NOW(), 'admin', NOW(), '解决方案');

-- 13. 方案组件菜单（隐藏）
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('方案组件', @cpq_menu_id, 'solution/component', 'cpq/solution/component', 0, 0, 'C', 1, 0, 'cpq:solution:component', 'component', 12, 'admin', NOW(), 'admin', NOW(), '方案组件');

-- 14. 报价管理菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('报价管理', @cpq_menu_id, 'quote', 'cpq/quote/index', 0, 0, 'C', 0, 0, 'cpq:quote:list', 'money', 13, 'admin', NOW(), 'admin', NOW(), '报价管理');

-- 15. 属性组属性菜单
INSERT INTO sys_menu (menu_name, parent_id, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, order_num, create_by, create_time, update_by, update_time, remark)
VALUES ('属性组属性', @cpq_menu_id, 'attributeGroupAttribute', 'cpq/attributeGroupAttribute/index', 0, 0, 'C', 0, 0, 'cpq:attributeGroupAttribute:list', 'component', 14, 'admin', NOW(), 'admin', NOW(), '属性组属性');

-- 2. 将CPQ系统路由从静态路由移除，移到动态路由
-- 需要修改router/index.js文件，将CPQ系统路由从constantRoutes移到dynamicRoutes

-- 3. 为角色分配CPQ系统菜单权限
-- 假设admin角色ID为1
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, menu_id FROM sys_menu WHERE menu_name LIKE 'CPQ%' OR parent_id IN (SELECT menu_id FROM sys_menu WHERE menu_name = 'CPQ系统');
