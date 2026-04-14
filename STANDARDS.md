# OneClaw 开发规范

## 铁律 (CRITICAL)

> **每次开发必须严格遵守，违反将导致严重质量问题**

---

### 铁律一：前后台代码必须分离

```
src/
├── components/                    # 前台 & 共用组件
│   ├── ui/                        # shadcn/ui 通用组件库
│   ├── admin/                     # 后台专用组件
│   ├── ads/                       # 广告组件（前后台共用）
│   ├── sbti/                      # 前台专用
│   ├── AnimatedLobster.tsx        # 前台专用
│   ├── BackToHome.tsx             # 前台专用
│   ├── WechatPromo.tsx            # 前台专用
│   ├── ImageUploader.tsx           # 前后台共用
│   └── ...
├── app/                           # 页面路由
│   ├── page.tsx                   # 前台首页
│   ├── tools/[id]/page.tsx        # 前台工具详情
│   ├── admin/                     # 后台页面
│   └── api/                       # API 路由
```

| 规范项 | 前台 (`/`) | 后台 (`/admin`) |
|--------|------------|-----------------|
| 页面宽度 | `max-w-7xl` / `max-w-4xl` | 无限制 |
| 布局 | layout.tsx 全局布局 | admin/layout.tsx 侧边栏 |
| 组件 | 前台专用组件 | shadcn/ui + admin/ |
| 详情页 | **禁止** Tabs，数据平铺 | 按需使用 |

**前台禁止**：`<header>`、`<Tabs>`、后台组件、`AnimatedLobster`、`BackToHome`
**后台禁止**：前台组件、`min-h-screen`、独立导航

---

### 铁律二：开发完成必须全面回归测试

```
1. pnpm lint           # ESLint 代码质量
2. pnpm ts-check       # TypeScript 类型检查
3. pnpm build          # 构建测试
4. API 100% 覆盖测试   # 所有接口验证
5. curl -I 存活探测    # 页面健康检查
6. tail 日志检查       # 错误日志扫描
```

---

## 一、代码组织规范

### 1.1 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 前台首页
│   ├── layout.tsx                 # 根布局
│   ├── globals.css               # 全局样式
│   ├── tools/[id]/page.tsx       # 工具详情 (SEO优化)
│   ├── skills/[id]/page.tsx      # 技能详情
│   ├── prompts/[id]/page.tsx     # 提示词详情
│   ├── tutorials/[id]/page.tsx   # 教程详情
│   ├── workspace/                # 用户工作台
│   ├── rankings/                 # 榜单中心
│   ├── admin/                   # 后台管理
│   │   ├── layout.tsx           # 侧边栏布局
│   │   ├── page.tsx            # 仪表盘
│   │   ├── tools/              # 工具管理
│   │   ├── categories/         # 分类管理
│   │   ├── skills/             # 技能管理
│   │   ├── ads/                # 广告管理
│   │   ├── members/           # 会员管理
│   │   ├── orders/            # 订单管理
│   │   ├── users/             # 用户管理
│   │   ├── reviews/           # 评论审核
│   │   ├── rankings/         # 榜单管理
│   │   ├── tutorials/        # 教程管理
│   │   ├── tags/             # 标签管理
│   │   ├── login/            # 登录页
│   │   └── change-password/   # 修改密码
│   └── api/                    # API 路由
│       ├── tools/              # 前台工具 API
│       ├── skills/             # 前台技能 API
│       ├── prompts/           # 前台提示词 API
│       ├── tutorials/        # 前台教程 API
│       ├── rankings/         # 前台榜单 API
│       ├── ads/              # 前台广告 API
│       ├── favorites/       # 收藏 API
│       ├── history/         # 历史 API
│       ├── ratings/        # 评分 API
│       ├── reviews/        # 评论 API
│       ├── members/       # 会员 API
│       ├── auth/         # 认证 API
│       └── admin/        # 后台管理 API
├── components/                  # 组件库
│   ├── ui/                    # shadcn/ui 通用组件
│   ├── admin/                # 后台专用组件
│   ├── ads/                  # 广告组件
│   └── *.tsx                 # 前台专用组件
├── lib/                        # 工具库
│   ├── utils.ts               # 通用工具
│   ├── auth.ts               # 认证工具
│   └── supabase.ts           # 数据库客户端
└── storage/                   # 存储层
    └── database/             # 数据库相关
```

### 1.2 组件归属

| 组件 | 路径 | 用途 | 使用范围 |
|------|------|------|----------|
| `AnimatedLobster` | `/components/` | 龙虾动画 Logo | 前台 |
| `BackToHome` | `/components/` | 返回首页按钮 | 前台详情页 |
| `WechatPromo` | `/components/` | 公众号推广 | 前台 |
| `LobsterLoading` | `/components/` | 加载状态 | 前台 |
| `LoginModal` | `/components/` | 登录弹窗 | 前台 |
| `ImageUploader` | `/components/` | 图片上传 | 前后台共用 |
| `AdminTable` | `/components/admin/` | 后台表格 | 后台 |
| `*` (shadcn) | `/components/ui/` | UI 组件 | 通用 |

### 1.3 导入路径规范

```typescript
// 前台组件
import BackToHome from '@/components/BackToHome';

// 后台组件
import { AdminTable } from '@/components/admin/AdminTable';

// shadcn/ui 组件
import { Button } from '@/components/ui/button';

// 前后台共用组件
import { ImageUploader } from '@/components/ImageUploader';
```

---

## 二、UI 设计规范

### 2.1 前台页面

```tsx
// 列表页
export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 内容 */}
    </div>
  );
}

// 详情页 (禁止 Tabs)
export default function ToolDetailPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <BackToHome />
      {/* 数据平铺展示 */}
      {/* 无 Tabs 组件 */}
      <WechatPromo />
    </div>
  );
}
```

**前台禁止**：
- `<header>` 独立导航
- `<Tabs>` 组件
- 后台组件
- `min-h-screen`

### 2.2 后台页面

```tsx
export default function AdminToolsPage() {
  return (
    <div className="space-y-6">  {/* 禁止 min-h-screen */}
      <div>
        <h2 className="text-2xl font-bold">工具管理</h2>
        <p className="text-sm text-slate-500">管理所有AI工具</p>
      </div>
      {/* 内容 */}
    </div>
  );
}
```

**后台禁止**：
- `AnimatedLobster`
- `BackToHome`
- `WechatPromo`
- 独立 `<header>`
- `min-h-screen`

### 2.3 主题色彩

| 用途 | 颜色 | Tailwind |
|------|------|----------|
| 主题主色 | 橙色 | `orange-500` / `orange-600` |
| 成功/免费 | 绿色 | `green-500` / `emerald-500` |
| 警告 | 黄色 | `amber-500` |
| 错误/付费 | 红色 | `red-500` / `rose-500` |
| 信息 | 蓝色 | `blue-500` / `sky-500` |
| 边框 | 灰色 | `slate-200` / `slate-700` |

---

## 三、安全规范 (CRITICAL)

### 3.1 认证与授权

```typescript
// API 路由必须验证会话
import { validateSession } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await validateSession(request);
  if (!auth) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }
  // 处理请求
}
```

### 3.2 输入验证

```typescript
// 所有用户输入必须验证
const { searchParams } = new URL(request.url);
const id = searchParams.get('id');
if (!id || !Number.isInteger(Number(id))) {
  return Response.json({ error: '无效参数' }, { status: 400 });
}
```

### 3.3 SQL 注入防护

```typescript
// 使用 Supabase SDK 自动防护
const { data } = await client
  .from('tools')
  .select('*')
  .eq('id', toolId);  // 参数化查询

// 禁止字符串拼接 SQL
// ❌ client.from('tools').select(`* FROM tools WHERE id = ${id}`)
// ✅ client.from('tools').select('*').eq('id', id)
```

### 3.4 XSS 防护

```tsx
// React 自动转义，但需注意 dangerouslySetInnerHTML
// ❌ <div dangerouslySetInnerHTML={{ __html: userInput }} />
// ✅ <div>{userInput}</div>

// 富文本必须使用 DOMPurify 净化
import DOMPurify from 'dompurify';
const safeHtml = DOMPurify.sanitize(dirtyHtml);
```

### 3.5 敏感信息保护

```bash
# 禁止硬编码敏感信息
# ✅ 使用环境变量
const apiKey = process.env.API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ❌ 禁止
const apiKey = 'sk-xxx';
```

### 3.6 CORS 配置

```typescript
// API 路由限制来源
export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return Response.json({ error: '禁止访问' }, { status: 403 });
  }
}
```

### 3.7 速率限制

```typescript
// 敏感接口添加速率限制
const rateLimit = new Map<string, number[]>();
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1分钟
  
  const requests = rateLimit.get(ip) || [];
  rateLimit.set(ip, [...requests.filter(t => now - t < windowMs), now]);
  
  if (requests.length > 100) {
    return Response.json({ error: '请求过于频繁' }, { status: 429 });
  }
}
```

---

## 四、API 设计规范

### 4.1 RESTful 规范

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/tools` | 获取列表 |
| GET | `/api/tools/[id]` | 获取详情 |
| POST | `/api/tools` | 创建资源 |
| PUT | `/api/tools/[id]` | 更新资源 |
| DELETE | `/api/tools/[id]` | 删除资源 |

### 4.2 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... }
}

// 错误响应
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}

// 分页响应
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### 4.3 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

## 五、数据库规范

### 5.1 表命名

- 使用 snake_case：`user_favorites`
- 复数形式：`tools` 而非 `tool`
- 有序前缀：`monthly_rankings`

### 5.2 字段命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 通用字段 | snake_case | `created_at`, `updated_at` |
| 主键 | `id` | 自动递增整数 |
| 外键 | `[table]_id` | `category_id` |
| 布尔值 | `is_` 前缀 | `is_active`, `is_deleted` |
| 时间戳 | `_at` 后缀 | `created_at`, `expires_at` |

### 5.3 索引规范

```sql
-- 高频查询字段添加索引
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_ads_position ON advertisements(position);

-- 唯一约束
UNIQUE INDEX idx_users_email ON users(email);
```

---

## 六、命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `BackToHome.tsx` |
| 工具函数 | camelCase.ts | `formatDate.ts` |
| API 路由 | route.ts | `route.ts` |
| 动态路由 | `[id]/` | `tools/[id]/page.tsx` |
| CSS 类名 | Tailwind | `className="p-4"` |
| 数据库字段 | snake_case | `created_at` |
| TypeScript 类型 | PascalCase | `interface ToolData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |

---

## 七、Git 提交规范

```
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构（不影响功能）
perf:     性能优化
test:     测试相关
chore:    构建/工具/依赖
```

**提交示例**：
```
feat: 添加工具详情页评分功能
fix: 修复广告位删除后显示异常
docs: 更新 API 文档
refactor: 重构后台组件结构
```

---

## 八、测试规范

### 8.1 单元测试

```bash
# 工具函数测试
pnpm test:unit
```

### 8.2 集成测试

```bash
# API 接口测试
pnpm test:api
```

### 8.3 回归测试流程

```bash
# 1. 代码静态检查
pnpm lint
pnpm ts-check

# 2. 构建测试
pnpm build

# 3. API 接口测试
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/tools
curl http://localhost:5000/api/skills
curl http://localhost:5000/api/prompts
curl http://localhost:5000/api/tutorials
curl http://localhost:5000/api/rankings
curl http://localhost:5000/api/tags
curl http://localhost:5000/api/ads

# 4. 服务存活探测
curl -I http://localhost:5000
curl -I http://localhost:5000/admin
curl -I http://localhost:5000/admin/tools
curl -I http://localhost:5000/admin/ads
curl -I http://localhost:5000/admin/members

# 5. 日志健康检查
tail -n 50 /app/work/logs/bypass/app.log
tail -n 50 /app/work/logs/bypass/console.log
```

---

## 九、性能规范

### 9.1 首屏加载

- LCP 图片添加 `fetchpriority="high"`
- 非首屏图片添加 `loading="lazy"`
- CSS/JS 使用 `defer`/`async`
- 使用 `next/image` 优化图片

### 9.2 API 缓存

```typescript
// 静态数据缓存
export async function GET() {
  const data = await fetchData();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

### 9.3 数据库查询

```typescript
// 只查询需要的字段
const { data } = await client
  .from('tools')
  .select('id, name, logo, highlight');  // 不要 select('*')

// 分页限制
.limit(100);
```

---

## 十、环境规范

### 10.1 环境变量

```bash
# .env.local (本地开发)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# .env.production (生产环境)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
ADMIN_PASSWORD=xxx
```

### 10.2 端口规范

| 环境 | 端口 | 用途 |
|------|------|------|
| 开发 | 5000 | 本地预览 |
| 生产 | 5000 | 服务监听 |

---

## 十一、可访问性规范 (A11Y)

### 11.1 语义化标签

```tsx
// ❌
<div className="button" onClick={handleClick}>点击</div>

// ✅
<button onClick={handleClick}>点击</button>
```

### 11.2 键盘导航

```tsx
// 对话框支持 ESC 关闭
<Dialog onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <button>打开</button>
  </DialogTrigger>
</Dialog>
```

### 11.3 ARIA 属性

```tsx
<button
  aria-label="关闭"
  aria-expanded={isOpen}
>
  <span aria-hidden="true">×</span>
</button>
```

---

## 十二、错误处理规范

### 12.1 API 错误处理

```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
```

### 12.2 前端错误边界

```tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}
```

### 12.3 日志记录

```typescript
// 错误日志
console.error('Error:', {
  message: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
  path: request.url
});
```
