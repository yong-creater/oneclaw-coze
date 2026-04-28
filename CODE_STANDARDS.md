# OneClaw 代码规范

> 本规范旨在保持项目结构清晰、代码可维护、团队协作高效。

---

## 一、目录结构

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 前台首页
│   ├── [slug]/              # 动态路由（工具详情页等）
│   ├── admin/               # 后台管理
│   │   ├── page.tsx        # 仪表盘
│   │   ├── [module]/       # 各功能模块
│   │   └── layout.tsx      # 后台布局（侧边栏）
│   ├── api/                # 前台 API
│   │   ├── tools/
│   │   ├── auth/
│   │   └── utility-tools/
│   └── [功能页面]/         # 独立功能页（如 ai-photo, resume）
│
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── admin/               # 后台专用组件
│   ├── common/              # 前台通用组件
│   ├── tools/               # 工具组件（大型复杂组件）
│   └── ads/                 # 广告组件
│
├── hooks/                   # React Hooks（useXxx 命名）
├── lib/                     # 工具函数
│   ├── auth.ts             # 后台管理员认证
│   ├── user-auth.ts        # 前台用户认证
│   ├── utils.ts            # 通用工具函数
│   └── supabase/           # Supabase 客户端
│
└── storage/
    └── database/            # 数据库相关
```

### 规范

| 规则 | 说明 |
|------|------|
| ✅ 页面放 `app/` | 所有页面使用 App Router |
| ✅ 组件放 `components/` | 页面不直接写大量 JSX |
| ✅ Hooks 放 `hooks/` | 复用逻辑抽取为 Hook |
| ❌ 禁止 `pages/` | 不使用 Pages Router |
| ❌ 禁止 `src/components/` 外的组件 | 组件必须统一管理 |

---

## 二、API 命名规范

### 2.1 URL 命名

```
# 前台 API
/api/tools                    # 工具列表
/api/utility-tools           # 精选工具
/api/tool-models            # 模型配置
/api/auth/*                  # 认证
/api/images/generate         # 图片生成
/api/llm/*                   # LLM 调用

# 后台 API
/api/admin/tools             # 工具管理
/api/admin/utility-tools    # 精选工具管理
/api/admin/model-providers   # 模型提供商
/api/admin/categories        # 分类管理
/api/admin/members           # 会员管理
```

### 2.2 命名原则

| 原则 | ✅ 正确 | ❌ 错误 |
|------|---------|---------|
| 使用名词复数 | `/api/tools` | `/api/getTool` |
| 语义清晰 | `/api/utility-tools` | `/api/utilities` |
| 前后台分离 | `/api/admin/*` | `/api/v1/admin/*` |
| RESTful | GET/POST/PUT/DELETE | 混合使用 |

### 2.3 API 返回格式

```typescript
// 成功
{ success: true, data: [...] }

// 错误
{ error: '错误信息', code: 'ERROR_CODE' }

// 分页
{ success: true, data: [...], total: 100, page: 1 }
```

---

## 三、组件规范

### 3.1 组件分类

| 目录 | 用途 | 示例 |
|------|------|------|
| `components/ui/` | shadcn/ui 基础组件 | Button, Card, Dialog |
| `components/admin/` | 后台专用组件 | DataTable, ModelSelector |
| `components/common/` | 前台通用组件 | SiteLogo, BackToHome, WechatPromo |
| `components/tools/` | 工具页面组件 | NovelCreator, ProductPageGenerator |

### 3.2 组件命名

```typescript
// React 组件：PascalCase
ProductPageGenerator.tsx
ModelSelector.tsx

// Hooks：camelCase + use 前缀
useToolModelConfig.ts
useAuth.ts

// 工具函数：camelCase
formatDate.ts
getImageUrl.ts
```

### 3.3 组件拆分原则

| 文件大小 | 建议 |
|----------|------|
| < 200 行 | 可接受 |
| 200-500 行 | 考虑拆分子组件 |
| > 500 行 | **必须拆分** |

### 3.4 前台 vs 后台组件

| 前台禁止 | 后台禁止 |
|----------|----------|
| 后台组件 (admin/*) | 前台组件 (common/*, tools/*) |
| shadcn 的复杂 Table | AnimatedLobster |
| 独立 Header/Footer | min-h-screen 布局 |

---

## 四、认证规范

### 4.1 认证分离

| 文件 | 用途 | 说明 |
|------|------|------|
| `lib/auth.ts` | 后台管理员认证 | JWT Cookie |
| `lib/user-auth.ts` | 前台用户认证 | 微信登录 |

### 4.2 认证流程

```typescript
// 后台：JWT Cookie
const auth = await requireAdminAuth(request);
if (auth.error || !auth.user) {
  return NextResponse.json({ error: '未授权' }, { status: 401 });
}

// 前台：User Token
const session = await requireUserAuth(request);
```

---

## 五、类型定义规范

### 5.1 内联类型

```typescript
// 简单类型内联
interface Props { name: string; age: number }

// 复杂类型放在文件顶部或单独文件
```

### 5.2 类型命名

```typescript
// 接口：PascalCase
interface ToolConfig { ... }
interface ModelProvider { ... }

// 类型别名：PascalCase
type ApiResponse<T> = { success: boolean; data: T };
```

### 5.3 数据库字段

```typescript
// 数据库字段：snake_case
interface Tool {
  id: number;
  tool_name: string;        // snake_case
  model_provider_id: number;
  created_at: string;
}

// 前端展示：camelCase（转换后）
interface ToolUI {
  id: number;
  toolName: string;
  modelProviderId: number;
}
```

---

## 六、禁止事项

### ❌ 严格禁止

| 禁止项 | 说明 | 正确做法 |
|--------|------|----------|
| 重复页面 | 两个 URL 渲染同一组件 | 删除重复 |
| 孤立代码 | API/组件无人使用 | 删除或保留但标注 |
| 硬编码 | 域名、Key 等写死 | 使用环境变量 |
| 魔法数字 | `if (status === 1)` | 使用枚举或常量 |
| 隐式 any | `function fn(x)` 无类型 | 显式标注类型 |

### ❌ 前台禁止

- Tabs 组件（详情页数据平铺）
- 独立 Header/Footer（使用 layout.tsx）
- 后台组件（admin/*）
- 硬编码颜色（#000000）

### ❌ 后台禁止

- AnimatedLobster
- BackToHome / WechatPromo
- min-h-screen 布局
- 前台组件（common/*, tools/*）

---

## 七、Git 提交规范

```bash
# 格式
<type>: <subject>

# 类型
feat:     新功能
fix:      修复 bug
refactor: 重构
docs:     文档
chore:    构建/工具

# 示例
feat: 新增模型提供商配置页面
fix: 修复工具列表分组显示
refactor: 清理重复的 product-page
```

---

## 八、代码审查清单

### 提交前自检

- [ ] `pnpm build` 通过
- [ ] 无重复代码
- [ ] API 命名符合规范
- [ ] 类型定义完整
- [ ] 前后台组件不混用
- [ ] 无硬编码值
- [ ] 提交信息规范

### PR/合并检查

- [ ] 功能测试通过
- [ ] 不影响其他功能
- [ ] 代码注释完整（复杂逻辑）
- [ ] 更新相关文档

---

## 九、数据库规范

### 9.1 表命名

- 使用 snake_case：`utility_tools`, `model_providers`
- 复数形式：`tools` 而非 `tool`

### 9.2 关联查询

```typescript
// ✅ 正确：显式指定关联字段
supabase
  .from('utility_tools')
  .select('*, utility_groups(name, slug)')

// ❌ 错误：依赖隐式关联
supabase.from('utility_tools').select('*')
```

### 9.3 外键命名

- 单数 ID：`model_provider_id`（指向 model_providers.id）
- 关联表：使用 snake_case

---

## 十、日志规范

### 10.1 日志文件

| 文件 | 用途 |
|------|------|
| `app.log` | 主流程 + 关键错误 |
| `dev.log` | 补充调试信息 |
| `console.log` | 浏览器端 |

### 10.2 日志等级

```typescript
console.log('[INFO] 用户登录成功');
console.log('[WARN] API 请求超时');
console.error('[ERROR] 数据库连接失败');
```

### 10.3 禁止

- ❌ 生产环境 console.log
- ❌ 日志中打印密码/Token
- ❌ 创建日志目录（已有 `/app/work/logs/bypass/`）

---

## 附录：常见问题

### Q: 什么时候创建新页面？

A: 当需要独立的路由和布局时。新建 `app/[功能]/page.tsx`。

### Q: 什么时候创建新组件？

A: 当多个页面复用同一 UI 逻辑时，或单个页面代码超过 500 行需要拆分时。

### Q: 什么时候创建新 API？

A: 当需要后台数据操作时。新建 `app/api/[分类]/route.ts`。

### Q: 遇到硬编码怎么办？

A: 提取为常量或环境变量：
```typescript
// ❌ 硬编码
const URL = 'https://api.example.com';

// ✅ 常量
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
```

---

> 本规范将持续更新。如有疑问，请提 Issue。
