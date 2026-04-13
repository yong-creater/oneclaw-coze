# OneClaw 开发规范

## 一、组件目录结构

```
src/
├── components/                    # 前台 & 共用组件
│   ├── ui/                        # shadcn/ui 通用组件库
│   ├── admin/                     # 后台专用组件
│   ├── ads/                       # 广告组件（前后台共用）
│   ├── sbti/                      # 前台专用
│   ├── AnimatedLobster.tsx         # 前台专用 - 龙虾动画
│   ├── BackToHome.tsx             # 前台专用 - 返回首页
│   ├── WechatPromo.tsx            # 前台专用 - 公众号推广
│   ├── LobsterLoading.tsx         # 前台专用 - 加载状态
│   ├── ImageUploader.tsx          # 前后台共用 - 图片上传
│   └── ...
├── app/                           # 页面路由
│   ├── page.tsx                   # 前台首页
│   ├── tools/[id]/page.tsx        # 前台工具详情
│   ├── admin/                     # 后台页面
│   │   ├── page.tsx               # 仪表盘
│   │   ├── tools/                 # 工具管理
│   │   ├── categories/            # 分类管理
│   │   └── ...
│   └── api/                       # API 路由
│       ├── tools/                 # 前台 API
│       └── admin/                 # 后台 API
└── lib/                           # 工具库
```

## 二、组件归属规则

### 前台专用组件 (`/components/`)
| 组件 | 用途 | 页面类型 |
|------|------|----------|
| `AnimatedLobster` | 龙虾动画 Logo | 前台 |
| `BackToHome` | 返回首页按钮 | 前台详情页 |
| `WechatPromo` | 公众号推广 | 前台 |
| `LobsterLoading` | 加载状态 | 前台 |
| `LoginModal` | 登录弹窗 | 前台 |
| `SponsorBadge` | 赞助商标识 | 前台 |
| `sbti/*` | SBTI 相关 | 前台 |

### 后台专用组件 (`/components/admin/`)
| 组件 | 用途 |
|------|------|
| `AdminTable` | 后台数据表格 |
| `AdminForm` | 后台表单 |
| `AdminSidebar` | 后台侧边栏扩展 |

### 前后台共用组件 (`/components/`)
| 组件 | 用途 |
|------|------|
| `ImageUploader` | 图片上传 |
| `ads/*` | 广告组件 |
| `ui/*` | shadcn/ui 组件库 |

### shadcn/ui 通用组件 (`/components/ui/`)
所有 shadcn/ui 组件前后台通用，直接导入使用。

## 三、UI 规范

### 前台页面 (`/app/` 及子目录)
| 规范项 | 要求 |
|--------|------|
| 页面宽度 | `max-w-7xl` (列表) / `max-w-4xl` (详情) |
| 布局 | 使用 layout.tsx 全局布局 |
| 详情页 | **禁止** Tabs 组件，数据平铺 |
| 组件 | 前台专用组件 |

**前台禁止**：
- 独立 `<header>` 导航
- `<Tabs>` 组件
- 后台组件

### 后台页面 (`/app/admin/`)
| 规范项 | 要求 |
|--------|------|
| 页面宽度 | 无限制或 `max-w-7xl` |
| 布局 | 基于 admin/layout.tsx 侧边栏 |
| 根元素 | `<div className="space-y-6">` |
| 组件 | shadcn/ui 组件 + 后台专用组件 |

**后台禁止**：
- `AnimatedLobster`
- `BackToHome`
- `WechatPromo`
- 独立 `<header>`
- `min-h-screen`

## 四、API 路由结构

```
src/app/api/
├── tools/                         # 前台工具 API
│   ├── route.ts                   # GET - 工具列表
│   └── [id]/route.ts              # GET - 工具详情
├── categories/                   # 前台分类 API
├── skills/                       # 前台技能 API
├── prompts/                      # 前台提示词 API
├── tutorials/                    # 前台教程 API
├── rankings/                     # 前台榜单 API
├── ads/                          # 前台广告 API
├── favorites/                    # 用户收藏 API
├── history/                      # 浏览历史 API
├── ratings/                      # 评分 API
├── reviews/                      # 评论 API
├── members/                      # 会员 API
├── auth/                         # 认证 API
└── admin/                        # 后台管理 API
    ├── tools/                    # 工具 CRUD
    ├── categories/              # 分类管理
    ├── skills/                  # 技能管理
    ├── ads/                     # 广告管理
    ├── members/                 # 会员管理
    ├── orders/                  # 订单管理
    ├── users/                   # 用户管理
    ├── reviews/                # 评论审核
    ├── rankings/               # 榜单管理
    ├── tutorials/              # 教程管理
    ├── tags/                   # 标签管理
    ├── health-check/          # 链接检查
    ├── init-data/             # 初始化数据
    └── upload/                 # 文件上传
```

## 五、数据库表结构

| 表名 | 用途 | 类型 |
|------|------|------|
| `tools` | AI 工具库 | 业务 |
| `categories` | 一级分类 | 业务 |
| `sub_categories` | 二级分类 | 业务 |
| `skills` | 技能库 | 业务 |
| `skill_categories` | 技能分类 | 业务 |
| `prompts` | 提示词库 | 业务 |
| `tutorials` | 教程库 | 业务 |
| `advertisements` | 广告管理 | 业务 |
| `members` | 会员 | 业务 |
| `orders` | 订单 | 业务 |
| `users` | 用户 | 业务 |
| `user_favorites` | 用户收藏 | 业务 |
| `user_history` | 浏览历史 | 业务 |
| `user_ratings` | 用户评分 | 业务 |
| `user_reviews` | 用户评论 | 业务 |
| `admin_users` | 管理员 | 系统 |
| `admin_sessions` | 管理员会话 | 系统 |
| `login_requests` | 扫码登录 | 系统 |
| `wechat_config` | 微信配置 | 系统 |

## 六、命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `BackToHome.tsx` |
| 工具函数 | camelCase.ts | `formatDate.ts` |
| API 路由 | route.ts | `route.ts` |
| 动态路由 | `[id]/route.ts` | `tools/[id]/page.tsx` |
| CSS 类名 | Tailwind | `className="p-4"` |
| 数据库字段 | snake_case | `created_at` |

## 七、导入路径规范

```typescript
// 前台组件
import BackToHome from '@/components/BackToHome';

// 后台组件
import { AdminTable } from '@/components/admin/AdminTable';

// shadcn/ui 组件
import { Button } from '@/components/ui/button';

// 图片上传（前后台共用）
import { ImageUploader } from '@/components/ImageUploader';
```

## 八、Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 九、测试规范

每次开发完成后必须执行：

```bash
# 1. 代码静态检查
pnpm lint
pnpm ts-check

# 2. 构建检查
pnpm build

# 3. API 接口测试（100% 覆盖）
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/tools
# ...

# 4. 服务存活探测
curl -I http://localhost:5000
curl -I http://localhost:5000/admin

# 5. 日志健康检查
tail -n 50 /app/work/logs/bypass/app.log
```
