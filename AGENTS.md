# OneClaw (钳爪) - 全品类AI工具导航站

## 项目概述

**OneClaw** - 精选AI工具导航站，聚焦实用工具，降低使用难度。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **品牌元素**: 龙虾 🦞，红橙渐变配色

## 核心功能

### 前台功能
1. **精选工具** (`/tools`) - AI工具列表、搜索、筛选
2. **简历优化** (`/resume`) - AI智能优化简历
3. **用户工作台** (`/workspace`) - 收藏管理、浏览历史

### 后台管理
1. **工具管理** - 工具列表、添加/编辑、批量导入
2. **分类管理** - 一级/二级分类CRUD
3. **标签管理** - 标签分类展示、CRUD
4. **评论审核** - 待审核评论管理
5. **广告管理** - 广告位管理
6. **会员管理** - 会员列表查看
7. **用户管理** - 用户列表查看

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 前台首页
│   │   ├── layout.tsx      # 根布局
│   │   ├── globals.css     # 全局样式
│   │   ├── tools/          # 工具详情页
│   │   ├── resume/         # 简历优化页
│   │   ├── workspace/      # 用户工作台
│   │   ├── admin/          # 后台管理系统
│   │   └── api/            # API路由
│   ├── components/
│   │   ├── ui/             # Shadcn UI 组件库
│   │   ├── tools/          # 工具组件 (ResumeOptimizer等)
│   │   ├── common/         # 通用组件
│   │   └── ads/            # 广告组件
│   ├── data/               # 静态数据
│   └── lib/                # 工具库
├── next.config.ts          # Next.js 配置
└── package.json            # 项目依赖管理
```

## 数据库表

| 表名 | 说明 |
|------|------|
| `categories` | 一级分类 |
| `tools` | 工具库 |
| `tags` | 标签 |
| `user_favorites` | 用户收藏 |
| `user_ratings` | 用户评分 |
| `reviews` | 用户评论 |
| `ads` | 广告位 |
| `admin_users` | 管理员用户 |

## API接口

### 前台API
- `GET /api/tools` - 获取工具列表
- `GET /api/tools/[id]` - 获取工具详情
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表
- `POST /api/ratings` - 提交评分
- `POST /api/reviews` - 提交评论
- `GET/POST/DELETE /api/favorites` - 收藏管理
- `GET/POST/DELETE /api/history` - 浏览历史
- `GET /api/ads` - 获取广告
- `POST /api/resume` - 简历优化

### 后台API
- `GET/POST /api/admin/tools` - 工具CRUD
- `POST /api/admin/tools/import` - 批量导入
- `GET/POST /api/admin/categories` - 分类CRUD
- `GET/POST /api/admin/tags` - 标签CRUD
- `GET/POST /api/admin/reviews` - 评论管理
- `GET/POST /api/admin/ads` - 广告管理
- `POST /api/admin/init-data` - 初始化数据

## UI 设计规范

### 前台规范
- 首页宽度: `max-w-7xl`
- 详情页宽度: `max-w-4xl mx-auto`
- 卡片: `hover:shadow-lg hover:border-orange-300`
- 输入框: `border-2 border-slate-200 rounded-xl hover:border-orange-400 focus:border-orange-500`

### 后台规范
- 布局: 基于 `admin/layout.tsx` 侧边栏
- 禁止: 独立 header/footer、`min-h-screen`
- 页面根元素: `<div className="space-y-6">`

## 组件说明

### 工具组件 (`/components/tools`)
- `ResumeOptimizer` - 简历优化组件
- `ResumeTemplates` - 简历模板
- `ImageUploader` - 图片上传

### 通用组件 (`/components/common`)
- `AnimatedLobster` - 龙虾动画Logo
- `ToolLogo` - 工具Logo组件
- `BackToHome` - 返回首页
- `LoginButton` - 登录按钮
- `LoginModal` - 登录弹窗
- `WechatPromo` - 公众号推广
- `SkeletonGrid` - 加载骨架屏
- `UtilityHeader` - 工具页头部
- `UtilityComponents` - 工具页通用组件

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 生产环境
pnpm start
```

## 注意事项

1. **禁止硬编码颜色**: 使用 Tailwind 语义化变量
2. **Hydration 错误预防**: 动态数据需用 `useEffect`
3. **组件导入规范**: 前台组件与后台组件分离
4. **API 调用规范**: 使用 Supabase SDK，每次检查 `{ data, error }`
