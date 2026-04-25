# OneClaw (钳爪) - 全品类AI工具导航站

## 目录

1. [铁律](#铁律-critical---必须严格遵守)
2. [项目概述](#项目概述)
3. [技术架构](#技术架构)
4. [UI设计规范](#ui设计规范)
5. [工具扩展架构](#工具扩展架构)
6. [安全设计](#安全设计)
7. [性能优化](#性能优化)
8. [开发规范](#开发规范)
9. [测试规范](#测试规范)

---

## 铁律 (CRITICAL - 必须严格遵守)

### 铁律一：前后台 UI 规范必须分离

| 规范项 | 前台 (/) | 后台 (/admin) |
|--------|----------|---------------|
| 宽度 | `max-w-7xl` 或 `max-w-4xl` | 无限制或 `max-w-7xl` |
| 布局 | 基于 layout.tsx 全局布局 | 基于 admin/layout.tsx 侧边栏 |
| 组件 | `BackToHome`, `WechatPromo`, `LobsterLoading` | shadcn/ui 标准组件 |
| 禁止 | 独立 header/footer | 独立 header/min-h-screen |
| 详情页 | 无 Tabs，数据平铺 | 按需使用 |

**前台禁止**：Tabs 组件、独立 header/footer、后台组件
**后台禁止**：AnimatedLobster、BackToHome、WechatPromo、独立 header/min-h-screen

### 铁律二：每次开发完成后必须执行全面回归测试

**测试流程（必须完整执行）**：

1. **代码静态检查** - `pnpm lint` + `pnpm ts-check`
2. **构建检查** - `pnpm build`
3. **API 接口测试** - 100% 覆盖所有接口
4. **服务存活探测** - 验证 5000 端口
5. **日志健康检查** - 检查 error/exception 日志

**禁止跳过任何测试步骤！**

---

## 项目概述

**OneClaw** - 全品类AI工具导航站，精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程、AI音频、AI办公、AI营销、AI学习、AI聊天、AI搜索等全品类。

### 品牌元素
- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **吉祥物**: 龙虾 🦞
- **主色调**: 红橙渐变 (orange-400 → amber-500)

---

## 技术架构

### 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 16 | 服务端渲染、App Router |
| 核心 | React | 19 | UI 渲染 |
| 语言 | TypeScript | 5 | 类型安全 |
| 数据库 | Supabase | - | PostgreSQL + Auth |
| UI组件 | shadcn/ui | - | 基于 Radix UI |
| 样式 | Tailwind CSS | 4 | 原子化CSS |
| 图标 | Lucide React | - | 一致的图标系统 |
| 认证 | jose + bcryptjs | - | JWT + 密码加密 |

### 目录结构

```
├── public/                     # 静态资源
│   ├── images/                # 图片资源
│   └── icons/                 # 图标资源
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (frontend)/        # 前台页面组
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── tools/         # 工具相关页面
│   │   │   ├── rankings/      # 榜单中心
│   │   │   ├── prompts/       # 提示词库
│   │   │   └── tutorials/     # 教程库
│   │   ├── admin/             # 后台管理组
│   │   │   ├── layout.tsx    # 侧边栏布局
│   │   │   ├── tools/        # 工具管理
│   │   │   ├── categories/   # 分类管理
│   │   │   └── users/        # 用户管理
│   │   ├── api/               # API Routes
│   │   │   ├── tools/        # 工具API
│   │   │   ├── admin/        # 管理API
│   │   │   └── upload/       # 上传API
│   │   ├── layout.tsx        # 根布局
│   │   └── globals.css       # 全局样式
│   ├── components/
│   │   ├── ui/               # Shadcn UI 组件
│   │   ├── frontend/        # 前台专用组件
│   │   ├── admin/            # 后台专用组件
│   │   └── tools/            # 工具组件（可扩展）
│   │       ├── ToolRenderer.tsx   # 动态工具渲染器
│   │       └── registry.ts        # 工具注册表
│   ├── lib/                   # 工具库
│   │   ├── supabase.ts       # Supabase 客户端
│   │   ├── auth.ts           # 认证工具
│   │   ├── utils.ts          # 通用工具函数
│   │   └── validators.ts     # 数据验证
│   ├── hooks/                 # React Hooks
│   │   ├── useAuth.ts        # 认证状态
│   │   ├── useTool.ts        # 工具操作
│   │   └── useUpload.ts      # 文件上传
│   ├── types/                 # TypeScript 类型定义
│   │   ├── tool.ts           # 工具相关类型
│   │   ├── user.ts           # 用户相关类型
│   │   └── api.ts            # API 响应类型
│   └── storage/database/      # 数据库配置
├── .env.local                 # 环境变量
├── next.config.ts             # Next.js 配置
└── package.json
```

---

## UI设计规范

### 设计理念

**核心理念**：简洁高效、专业可信、轻松愉悦

- **目标用户**：普通用户、小白用户为主，需要极简操作路径
- **使用场景**：快速找到工具、一键完成AI处理
- **设计风格**：现代简约、功能导向、避免过度装饰

### 色彩系统

```css
/* 主色调 - 龙虾红橙渐变 */
--color-primary: #f97316;        /* orange-500 */
--color-primary-hover: #ea580c;  /* orange-600 */
--color-primary-light: #fed7aa;  /* orange-200 */

/* 语义色 */
--color-success: #22c55e;        /* green-500 - 免费/成功 */
--color-warning: #f59e0b;        /* amber-500 - 警告/热门 */
--color-danger: #ef4444;         /* red-500 - 错误/付费 */
--color-info: #3b82f6;           /* blue-500 - 信息/链接 */

/* 中性色 */
--color-bg: #ffffff;             /* 背景色 */
--color-bg-muted: #f8fafc;       /* 次级背景 */
--color-border: #e2e8f0;         /* 边框色 */
--color-text: #0f172a;           /* 主文字 */
--color-text-muted: #64748b;     /* 次级文字 */
```

### 字体规范

| 用途 | 字体 | 备选 | 字号 |
|------|------|------|------|
| 标题 | Inter | system-ui | 24-32px |
| 副标题 | Inter | system-ui | 18-20px |
| 正文 | Inter | system-ui | 14-16px |
| 辅助文字 | Inter | system-ui | 12-13px |

### 间距系统

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 紧凑元素间距 |
| sm | 8px | 小组件内间距 |
| md | 16px | 常规间距 |
| lg | 24px | 区块间距 |
| xl | 32px | 大区块间距 |
| 2xl | 48px | 页面内大区块 |

### 圆角规范

| 用途 | 圆角 | Tailwind |
|------|------|----------|
| 按钮 | 12px | `rounded-xl` |
| 卡片 | 16px | `rounded-2xl` |
| 输入框 | 12px | `rounded-xl` |
| 头像 | 50% | `rounded-full` |
| 徽章 | 6px | `rounded-md` |

### 阴影规范

| 用途 | 阴影 | Tailwind |
|------|------|----------|
| 卡片 | 0 1px 3px rgba(0,0,0,0.1) | `shadow-sm` |
| 悬浮 | 0 4px 6px rgba(0,0,0,0.1) | `shadow-md` |
| 弹窗 | 0 20px 25px rgba(0,0,0,0.1) | `shadow-xl` |
| 主按钮 | 0 4px 14px rgba(249,115,22,0.3) | 自定义 |

---

## 工具扩展架构

### 工具注册系统

```typescript
// src/components/tools/registry.ts

// 工具配置接口
export interface ToolConfig {
  key: string;                    // 唯一标识
  name: string;                   // 显示名称
  description: string;            // 简短描述
  category: ToolCategory;         // 所属分类
  icon: string;                   // Emoji 或图标
  color: string;                  // 渐变色类
  component: React.ComponentType;  // 工具组件
  requiresAuth: boolean;          // 是否需要登录
  credits: number;                // 消耗积分
  quota?: {                        // 免费额度
    daily?: number;
    total?: number;
  };
}

// 工具分类
export type ToolCategory = 
  | 'image-processing'  // 图片处理
  | 'marketing'         // 营销图
  | 'ai-design'         // AI设计
  | 'video'             // 视频处理
  | 'document';         // 文档处理

// 已注册工具
export const TOOL_REGISTRY: Record<string, ToolConfig> = {};

// 注册工具装饰器
export function registerTool(config: ToolConfig) {
  return (Component: React.ComponentType) => {
    TOOL_REGISTRY[config.key] = { ...config, component: Component };
    return Component;
  };
}
```

### 工具组件规范

```typescript
// src/components/tools/templates/BasicTool.tsx

/**
 * 基础工具模板
 * 所有工具组件应继承此模板
 */
export interface BaseToolProps {
  onComplete?: (result: ToolResult) => void;  // 完成回调
  onError?: (error: Error) => void;           // 错误回调
}

export function BasicToolTemplate({ 
  config, 
  onComplete, 
  onError 
}: BaseToolProps & { config: ToolConfig }) {
  // 统一的状态管理
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [result, setResult] = useState<string | null>(null);
  
  // 统一的上传处理
  const handleUpload = async (file: File) => {
    setStep('processing');
    try {
      const res = await processTool(config.key, file);
      setResult(res.url);
      setStep('result');
      onComplete?.(res);
    } catch (err) {
      onError?.(err as Error);
      setStep('input');
    }
  };
  
  // 统一的操作提示
  const renderGuide = () => (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
      <p className="text-sm text-slate-600">
        <span className="font-semibold text-orange-600">使用提示：</span>
        {config.guide}
      </p>
    </div>
  );
  
  // ... 具体实现
}
```

### 工具路由映射

```
/tools
├── page.tsx                    # 工具列表页
├── [toolKey]/                  # 动态工具页
│   └── page.tsx               # 独立工具页
└── api/
    └── process/               # 工具处理API
        └── route.ts          # 统一处理入口
```

### 新增工具流程

```
1. 定义工具配置 → src/components/tools/registry.ts
2. 创建工具组件 → src/components/tools/tools/{toolName}.tsx
3. 注册工具 → 在 registry 中添加
4. 添加国际化（可选）→ src/locales/
5. 更新数据库分类（如需要）
6. 测试验证
```

---

## 安全设计

### 认证与授权

#### JWT Token 管理

```typescript
// src/lib/auth.ts

interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
  exp: number;
  iat: number;
}

// Token 有效期
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

// 安全的 Token 存储
function setAuthCookie(token: string) {
  // HttpOnly: 防止 XSS
  // Secure: 仅 HTTPS
  // SameSite: 防止 CSRF
  document.cookie = `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`;
}
```

#### 权限层级

| 角色 | 权限 |
|------|------|
| 游客 | 浏览、搜索、使用基础工具 |
| 注册用户 | 评分、收藏、评论、使用高级工具 |
| 会员 | 无限使用、优先通道 |
| 管理员 | 内容管理、用户管理、系统配置 |

### 输入安全

#### 文件上传验证

```typescript
// src/lib/validators.ts

interface UploadValidation {
  maxSize: number;           // 最大文件大小 (MB)
  allowedTypes: string[];    // 允许的类型
  allowedExtensions: string[]; // 允许的扩展名
}

const IMAGE_UPLOAD_RULES: UploadValidation = {
  maxSize: 10,               // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
};

function validateUpload(file: File, rules: UploadValidation): ValidationResult {
  // 1. 检查文件大小
  if (file.size > rules.maxSize * 1024 * 1024) {
    return { valid: false, error: `文件大小不能超过 ${rules.maxSize}MB` };
  }
  
  // 2. 检查 MIME 类型
  if (!rules.allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' };
  }
  
  // 3. 检查扩展名
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!rules.allowedExtensions.includes(ext)) {
    return { valid: false, error: '不支持的文件扩展名' };
  }
  
  // 4. 检查文件名（防止路径遍历）
  if (/[<>:"/\\|?*]/.test(file.name)) {
    return { valid: false, error: '文件名包含非法字符' };
  }
  
  return { valid: true };
}
```

#### API 请求验证

```typescript
// src/lib/validators.ts

// 速率限制配置
const RATE_LIMITS = {
  anonymous: { requests: 30, window: '1m' },
  user: { requests: 100, window: '1m' },
  admin: { requests: 1000, window: '1m' }
};

// 参数验证 Schema
const toolProcessSchema = z.object({
  toolKey: z.string().min(1).max(50),
  params: z.record(z.any()).optional(),
  fileId: z.string().uuid().optional()
});
```

### 数据安全

#### 敏感信息处理

```typescript
// 禁止在以下场景暴露敏感信息
// ❌ console.log(user.password)
// ❌ API 响应包含 password_hash
// ❌ URL 参数传递敏感 ID
// ❌ localStorage 存储 Token

// ✅ 正确做法
// - 密码仅用于验证，不返回前端
// - 使用 UUID 代替自增 ID
// - Token 存储在 HttpOnly Cookie
```

#### 数据库安全

```sql
-- 敏感字段加密
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_encrypted text;

-- 审计日志
CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 定期清理敏感数据
DELETE FROM sessions WHERE expires_at < now();
```

---

## 性能优化

### 首屏加载优化

#### 关键指标目标

| 指标 | 目标值 | 优化策略 |
|------|--------|----------|
| FCP | < 1.8s | SSR + 关键CSS内联 |
| LCP | < 2.5s | 预加载首图 |
| FID | < 100ms | 代码分割 |
| CLS | < 0.1 | 固定尺寸 |

#### 资源加载策略

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    domains: ['cdn.example.com']
  },
  async headers() {
    return [{
      source: '/:all*(svg|jpg|png|webp|avif)',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }]
    }];
  }
};
```

### 运行时性能

#### 工具组件优化

```typescript
// src/components/tools/ImageProcessor.tsx

'use client';

// 1. 使用 useMemo 缓存计算结果
const processedImage = useMemo(() => {
  return applyFilters(imageData, filters);
}, [imageData, filters]);

// 2. 使用 useCallback 缓存回调
const handleProcess = useCallback(async () => {
  await processImage(uploadedImage);
}, [uploadedImage]);

// 3. 使用 useTransition 处理长时间操作
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setProcessingState('processing');
});

// 4. 图片懒加载
<img 
  src={src} 
  loading="lazy" 
  decoding="async"
  fetchpriority="high"  // LCP 图片高优先级
/>

// 5. 组件懒加载
const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

#### 状态管理优化

```typescript
// 1. 使用 Context 分离频繁变化的状态
const ImageContext = createContext<{
  image: string | null;
  setImage: (img: string) => void;
}>();

// 2. 使用 Zustand 管理工具状态（比 Redux 更轻量）
import { create } from 'zustand';

interface ToolState {
  activeTool: string | null;
  processingQueue: string[];
  results: Record<string, ToolResult>;
  setActiveTool: (key: string) => void;
  addToQueue: (id: string) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: null,
  processingQueue: [],
  results: {},
  setActiveTool: (key) => set({ activeTool: key }),
  addToQueue: (id) => set((state) => ({
    processingQueue: [...state.processingQueue, id]
  })),
}));
```

### API 性能

#### 缓存策略

```typescript
// src/app/api/tools/route.ts

// 1. 数据缓存（5分钟）
export const revalidate = 300;

// 2. 静态生成
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

// 3. On-Demand Revalidation
// 当数据库更新时触发
// await revalidatePath('/tools');
```

#### 分页与无限滚动

```typescript
// src/lib/pagination.ts

interface PaginationParams {
  page: number;
  pageSize: number;
  cursor?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// 使用 cursor  pagination 优化大数据量
async function getTools({ cursor, pageSize = 20 }: PaginationParams) {
  const query = supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(pageSize);
  
  if (cursor) {
    query.gt('id', cursor);
  }
  
  const { data, count } = await query;
  return {
    items: data,
    nextCursor: data?.[data.length - 1]?.id,
    hasMore: data?.length === pageSize,
    total: count || 0
  };
}
```

---

## 开发规范

### TypeScript 规范

```typescript
// 1. 严格模式
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}

// 2. 类型定义位置
// - 组件 Props → 组件文件内
// - API 类型 → src/types/api.ts
// - 数据库模型 → src/types/models.ts
// - 工具配置 → src/types/tool.ts

// 3. 禁止使用 any
// ❌ function process(data: any)
// ✅ function process(data: ToolInput)

// 4. 显式返回类型
function getToolByKey(key: string): ToolConfig | null {
  return TOOL_REGISTRY[key] ?? null;
}
```

### React 组件规范

```typescript
// 1. 组件文件结构
// src/components/tools/ExampleTool.tsx

/**
 * 示例工具组件
 * 
 * @description 工具的详细说明
 * @requires auth - 是否需要登录
 * @credits 10 - 消耗积分
 */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Props 类型定义
interface ExampleToolProps {
  onComplete?: (result: string) => void;
}

// 组件实现
export function ExampleTool({ onComplete }: ExampleToolProps) {
  // Hooks
  const [value, setValue] = useState('');
  
  // 回调使用 useCallback
  const handleSubmit = useCallback(() => {
    onComplete?.(value);
  }, [value, onComplete]);
  
  // 渲染
  return (
    <Card>
      <CardContent>
        {/* 内容 */}
      </CardContent>
    </Card>
  );
}

// 默认导出（支持动态导入）
export default ExampleTool;
```

### CSS / Tailwind 规范

```tsx
// 1. 使用语义化类名
// ❌ <div className="mt-4 p-4 bg-white rounded-lg shadow">
// ✅ <div className="mt-6 p-6 bg-card rounded-xl shadow-sm">

// 2. 使用 CSS 变量
<div className="text-primary hover:bg-primary/10" />

// 3. 响应式断点
// 手机优先：默认 → md: → lg: → xl:
// ❌ lg:grid lg:grid-cols-4
// ✅ grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// 4. 动画优先使用 CSS
<div className="transition-all duration-300 hover:scale-105" />
```

### Git 提交规范

```bash
# 格式
<type>(<scope>): <subject>

# 示例
feat(tools): add image background removal tool
fix(ui): correct button hover state
docs(readme): update installation guide
refactor(auth): simplify token refresh logic
perf(api): optimize database queries
test(tools): add unit tests for image processor

# Type
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式（不影响功能）
- refactor: 重构
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具相关
```

---

## 测试规范

### 单元测试

```typescript
// src/lib/__tests__/validators.test.ts

import { validateUpload } from '../validators';
import { IMAGE_UPLOAD_RULES } from '../constants';

describe('validateUpload', () => {
  it('should reject oversized files', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 }); // 20MB
    
    const result = validateUpload(file, IMAGE_UPLOAD_RULES);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });
  
  it('should accept valid image types', () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    const result = validateUpload(file, IMAGE_UPLOAD_RULES);
    expect(result.valid).toBe(true);
  });
});
```

### 集成测试

```typescript
// src/app/api/tools/__tests__/route.test.ts

describe('GET /api/tools', () => {
  it('should return paginated tools', async () => {
    const response = await fetch('/api/tools?page=1&pageSize=10');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.items).toBeInstanceOf(Array);
    expect(data.total).toBeGreaterThan(0);
  });
  
  it('should filter by category', async () => {
    const response = await fetch('/api/tools?category=image-processing');
    const data = await response.json();
    
    expect(data.items.every((t: any) => t.category === 'image-processing')).toBe(true);
  });
});
```

### E2E 测试（Playwright）

```typescript
// e2e/tools.spec.ts

import { test, expect } from '@playwright/test';

test.describe('工具页面', () => {
  test('should load tool list', async ({ page }) => {
    await page.goto('/tools');
    
    // 验证标题
    await expect(page.locator('h1')).toContainText('AI工具箱');
    
    // 验证工具卡片
    const cards = page.locator('[data-testid="tool-card"]');
    await expect(cards.first()).toBeVisible();
  });
  
  test('should process image tool', async ({ page }) => {
    await page.goto('/tools/remove-bg');
    
    // 上传图片
    const input = page.locator('input[type="file"]');
    await input.setInputFiles('test-image.png');
    
    // 验证处理按钮
    const processBtn = page.locator('button:has-text("一键抠图")');
    await expect(processBtn).toBeEnabled();
    
    // 点击处理
    await processBtn.click();
    
    // 验证结果
    await expect(page.locator('text=抠图完成')).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 附录

### 环境变量

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 认证
JWT_SECRET=xxx
ADMIN_PASSWORD=xxx

# API Keys
BAIDU_ANALYTICS_ID=xxx

# 文件存储
NEXT_PUBLIC_CDN_URL=https://cdn.oneclaw.shop
```

### 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm lint             # 代码检查
pnpm ts-check         # 类型检查

# 构建
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 数据库
pnpm db:generate      # 生成类型
pnpm db:migrate        # 执行迁移

# 测试
pnpm test             # 单元测试
pnpm test:e2e         # E2E 测试
```

### 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/docs)
