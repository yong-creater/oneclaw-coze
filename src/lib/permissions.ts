/**
 * 权限管理框架
 * 基于 RBAC (Role-Based Access Control) 模型
 */

// 权限定义
export const Permissions = {
  // 工具管理
  TOOLS_VIEW: 'tools:view',
  TOOLS_CREATE: 'tools:create',
  TOOLS_EDIT: 'tools:edit',
  TOOLS_DELETE: 'tools:delete',
  
  // 精选工具管理
  UTILITY_VIEW: 'utility:view',
  UTILITY_CREATE: 'utility:create',
  UTILITY_EDIT: 'utility:edit',
  UTILITY_DELETE: 'utility:delete',
  UTILITY_UPLOAD: 'utility:upload',
  
  // 模板管理
  TEMPLATE_VIEW: 'template:view',
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_EDIT: 'template:edit',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_INIT: 'template:init',
  
  // 分类管理
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_EDIT: 'category:edit',
  CATEGORY_DELETE: 'category:delete',
  
  // 教程管理
  TUTORIAL_VIEW: 'tutorial:view',
  TUTORIAL_CREATE: 'tutorial:create',
  TUTORIAL_EDIT: 'tutorial:edit',
  TUTORIAL_DELETE: 'tutorial:delete',
  
  // 提示词管理
  PROMPT_VIEW: 'prompt:view',
  PROMPT_CREATE: 'prompt:create',
  PROMPT_EDIT: 'prompt:edit',
  PROMPT_DELETE: 'prompt:delete',
  
  // 会员管理
  MEMBER_VIEW: 'member:view',
  MEMBER_EDIT: 'member:edit',
  
  // 评论管理
  REVIEW_VIEW: 'review:view',
  REVIEW_APPROVE: 'review:approve',
  REVIEW_DELETE: 'review:delete',
  
  // 订单管理
  ORDER_VIEW: 'order:view',
  ORDER_EDIT: 'order:edit',
  
  // 广告管理
  AD_VIEW: 'ad:view',
  AD_CREATE: 'ad:create',
  AD_EDIT: 'ad:edit',
  AD_DELETE: 'ad:delete',
  
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // 系统管理
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_CONFIG: 'system:config',
  
  // 分组管理
  GROUP_VIEW: 'group:view',
  GROUP_CREATE: 'group:create',
  GROUP_EDIT: 'group:edit',
  GROUP_DELETE: 'group:delete',
  
  // ========== 别名（兼容旧的命名方式）==========
  // 分类别名（单数/复数兼容）
  CATEGORIES_VIEW: 'category:view',
  CATEGORIES_CREATE: 'category:create',
  CATEGORIES_EDIT: 'category:edit',
  CATEGORIES_DELETE: 'category:delete',
  
  // 模板别名
  TEMPLATES_VIEW: 'template:view',
  TEMPLATES_CREATE: 'template:create',
  TEMPLATES_EDIT: 'template:edit',
  TEMPLATES_DELETE: 'template:delete',
  TEMPLATES_INIT: 'template:init',
  
  // 教程别名
  TUTORIALS_VIEW: 'tutorial:view',
  TUTORIALS_CREATE: 'tutorial:create',
  TUTORIALS_EDIT: 'tutorial:edit',
  TUTORIALS_DELETE: 'tutorial:delete',
  
  // 提示词别名
  PROMPTS_VIEW: 'prompt:view',
  PROMPTS_CREATE: 'prompt:create',
  PROMPTS_EDIT: 'prompt:edit',
  PROMPTS_DELETE: 'prompt:delete',
  
  // 会员别名
  MEMBERS_VIEW: 'member:view',
  MEMBERS_MANAGE: 'member:edit',
  
  // 评论别名
  REVIEWS_VIEW: 'review:view',
  REVIEWS_MODERATE: 'review:approve',
  REVIEWS_DELETE: 'review:delete',
  
  // 广告别名
  ADS_VIEW: 'ad:view',
  ADS_CREATE: 'ad:create',
  ADS_EDIT: 'ad:edit',
  ADS_DELETE: 'ad:delete',
  
  // 精选工具别名
  UTILITIES_VIEW: 'utility:view',
  UTILITIES_CREATE: 'utility:create',
  UTILITIES_EDIT: 'utility:edit',
  UTILITIES_DELETE: 'utility:delete',
  
  // 用户别名
  USERS_VIEW: 'user:view',
  USERS_CREATE: 'user:create',
  USERS_EDIT: 'user:edit',
  USERS_DELETE: 'user:delete',
  
  // 系统别名
  SETTINGS_MANAGE: 'system:settings',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

// 角色定义
export const Roles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

// 角色权限映射
export const RolePermissions: Record<Role, Permission[]> = {
  [Roles.SUPER_ADMIN]: Object.values(Permissions), // 超级管理员拥有所有权限
  [Roles.ADMIN]: [
    // 工具管理
    Permissions.TOOLS_VIEW,
    Permissions.TOOLS_CREATE,
    Permissions.TOOLS_EDIT,
    Permissions.TOOLS_DELETE,
    // 精选工具
    Permissions.UTILITY_VIEW,
    Permissions.UTILITY_CREATE,
    Permissions.UTILITY_EDIT,
    Permissions.UTILITY_DELETE,
    Permissions.UTILITY_UPLOAD,
    // 模板管理
    Permissions.TEMPLATE_VIEW,
    Permissions.TEMPLATE_CREATE,
    Permissions.TEMPLATE_EDIT,
    Permissions.TEMPLATE_DELETE,
    Permissions.TEMPLATE_INIT,
    // 分类管理
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_EDIT,
    Permissions.CATEGORY_DELETE,
    // 教程管理
    Permissions.TUTORIAL_VIEW,
    Permissions.TUTORIAL_CREATE,
    Permissions.TUTORIAL_EDIT,
    Permissions.TUTORIAL_DELETE,
    // 提示词管理
    Permissions.PROMPT_VIEW,
    Permissions.PROMPT_CREATE,
    Permissions.PROMPT_EDIT,
    Permissions.PROMPT_DELETE,
    // 会员管理
    Permissions.MEMBER_VIEW,
    Permissions.MEMBER_EDIT,
    // 评论管理
    Permissions.REVIEW_VIEW,
    Permissions.REVIEW_APPROVE,
    Permissions.REVIEW_DELETE,
    // 订单管理
    Permissions.ORDER_VIEW,
    Permissions.ORDER_EDIT,
    // 广告管理
    Permissions.AD_VIEW,
    Permissions.AD_CREATE,
    Permissions.AD_EDIT,
    Permissions.AD_DELETE,
    // 用户管理
    Permissions.USER_VIEW,
    Permissions.USER_EDIT,
    // 系统管理
    Permissions.SYSTEM_LOGS,
  ],
  [Roles.EDITOR]: [
    // 工具管理
    Permissions.TOOLS_VIEW,
    Permissions.TOOLS_CREATE,
    Permissions.TOOLS_EDIT,
    // 精选工具
    Permissions.UTILITY_VIEW,
    Permissions.UTILITY_CREATE,
    Permissions.UTILITY_EDIT,
    Permissions.UTILITY_UPLOAD,
    // 模板管理
    Permissions.TEMPLATE_VIEW,
    Permissions.TEMPLATE_CREATE,
    Permissions.TEMPLATE_EDIT,
    // 分类管理
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_EDIT,
    // 教程管理
    Permissions.TUTORIAL_VIEW,
    Permissions.TUTORIAL_CREATE,
    Permissions.TUTORIAL_EDIT,
    // 提示词管理
    Permissions.PROMPT_VIEW,
    Permissions.PROMPT_CREATE,
    Permissions.PROMPT_EDIT,
    // 评论管理
    Permissions.REVIEW_VIEW,
    // 广告管理
    Permissions.AD_VIEW,
  ],
  [Roles.VIEWER]: [
    // 只能查看
    Permissions.TOOLS_VIEW,
    Permissions.UTILITY_VIEW,
    Permissions.TEMPLATE_VIEW,
    Permissions.CATEGORY_VIEW,
    Permissions.TUTORIAL_VIEW,
    Permissions.PROMPT_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.REVIEW_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.AD_VIEW,
    Permissions.USER_VIEW,
  ],
};

// 权限检查工具函数
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = RolePermissions[userRole];
  return rolePermissions?.includes(permission) ?? false;
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// 获取用户的所有权限
export function getUserPermissions(userRole: Role): Permission[] {
  return RolePermissions[userRole] || [];
}

// 权限描述映射
export const PermissionDescriptions: Record<Permission, string> = {
  [Permissions.TOOLS_VIEW]: '查看工具',
  [Permissions.TOOLS_CREATE]: '创建工具',
  [Permissions.TOOLS_EDIT]: '编辑工具',
  [Permissions.TOOLS_DELETE]: '删除工具',
  [Permissions.UTILITY_VIEW]: '查看精选工具',
  [Permissions.UTILITY_CREATE]: '创建精选工具',
  [Permissions.UTILITY_EDIT]: '编辑精选工具',
  [Permissions.UTILITY_DELETE]: '删除精选工具',
  [Permissions.UTILITY_UPLOAD]: '上传精选工具封面',
  [Permissions.TEMPLATE_VIEW]: '查看模板',
  [Permissions.TEMPLATE_CREATE]: '创建模板',
  [Permissions.TEMPLATE_EDIT]: '编辑模板',
  [Permissions.TEMPLATE_DELETE]: '删除模板',
  [Permissions.TEMPLATE_INIT]: '初始化模板',
  [Permissions.CATEGORY_VIEW]: '查看分类',
  [Permissions.CATEGORY_CREATE]: '创建分类',
  [Permissions.CATEGORY_EDIT]: '编辑分类',
  [Permissions.CATEGORY_DELETE]: '删除分类',
  [Permissions.TUTORIAL_VIEW]: '查看教程',
  [Permissions.TUTORIAL_CREATE]: '创建教程',
  [Permissions.TUTORIAL_EDIT]: '编辑教程',
  [Permissions.TUTORIAL_DELETE]: '删除教程',
  [Permissions.PROMPT_VIEW]: '查看提示词',
  [Permissions.PROMPT_CREATE]: '创建提示词',
  [Permissions.PROMPT_EDIT]: '编辑提示词',
  [Permissions.PROMPT_DELETE]: '删除提示词',
  [Permissions.MEMBER_VIEW]: '查看会员',
  [Permissions.MEMBER_EDIT]: '编辑会员',
  [Permissions.REVIEW_VIEW]: '查看评论',
  [Permissions.REVIEW_APPROVE]: '审核评论',
  [Permissions.REVIEW_DELETE]: '删除评论',
  [Permissions.ORDER_VIEW]: '查看订单',
  [Permissions.ORDER_EDIT]: '编辑订单',
  [Permissions.AD_VIEW]: '查看广告',
  [Permissions.AD_CREATE]: '创建广告',
  [Permissions.AD_EDIT]: '编辑广告',
  [Permissions.AD_DELETE]: '删除广告',
  [Permissions.USER_VIEW]: '查看用户',
  [Permissions.USER_CREATE]: '创建用户',
  [Permissions.USER_EDIT]: '编辑用户',
  [Permissions.USER_DELETE]: '删除用户',
  [Permissions.SYSTEM_SETTINGS]: '系统设置',
  [Permissions.SYSTEM_LOGS]: '查看日志',
  [Permissions.SYSTEM_CONFIG]: '系统配置',
  [Permissions.GROUP_VIEW]: '查看分组',
  [Permissions.GROUP_CREATE]: '创建分组',
  [Permissions.GROUP_EDIT]: '编辑分组',
  [Permissions.GROUP_DELETE]: '删除分组',
};

// 角色描述映射
export const RoleDescriptions: Record<Role, string> = {
  [Roles.SUPER_ADMIN]: '超级管理员 - 拥有所有权限',
  [Roles.ADMIN]: '管理员 - 拥有大部分管理权限',
  [Roles.EDITOR]: '编辑 - 可以创建和编辑内容',
  [Roles.VIEWER]: '访客 - 只能查看内容',
};

// 根据角色获取权限列表
export function getPermissionsByRole(role: string): string[] {
  const userRole = role as Role;
  const permissions = RolePermissions[userRole];
  if (!permissions) {
    // 如果角色不在定义中，返回空数组
    return [];
  }
  return permissions as string[];
}


