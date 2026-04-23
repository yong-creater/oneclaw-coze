# OneClaw (钳爪) - 实用AI工具导航站

## 项目概述

**OneClaw** - 精选实用AI工具导航站，让AI真正提升效率。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **品牌元素**: 龙虾，橙红渐变配色

## 核心功能

### 前台功能
1. **实用工具** (`/utilities`) - 实用AI工具入口
2. **简历优化** (`/resume`) - AI智能优化简历
3. **关于我们** (`/about`) - 关于OneClaw

### 后台管理
1. **广告管理** - 广告位管理
2. **用户管理** - 用户列表查看
3. **微信配置** - 公众号配置

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
│   │   ├── page.tsx        # 首页（实用工具入口）
│   │   ├── layout.tsx      # 根布局
│   │   ├── globals.css     # 全局样式
│   │   ├── utilities/       # 实用工具页面
│   │   ├── resume/         # 简历优化页
│   │   ├── about/          # 关于我们
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
| `users` | 用户 |
| `members` | 会员 |
| `orders` | 订单 |
| `prompts` | 提示词 |
| `advertisements` | 广告位 |
| `admin_users` | 管理员用户 |
| `wechat_config` | 微信配置 |

## API接口

### 前台API
- `GET /api/ads` - 获取广告
- `POST /api/resume` - 简历优化
- `POST /api/auth` - 认证
- `POST /api/auth/code` - 发送验证码

### 后台API
- `GET/POST /api/admin/ads` - 广告管理
- `POST /api/admin/auth` - 管理员认证
- `POST /api/admin/init-data` - 初始化数据

## 组件说明

### 工具组件 (`/components/tools`)
- `ResumeOptimizer` - 简历优化组件
- `ResumeTemplates` - 简历模板
- `ImageUploader` - 图片上传

### 通用组件 (`/components/common`)
- `AnimatedLobster` - 龙虾动画Logo
- `BackToHome` - 返回首页
- `LoginButton` - 登录按钮
- `LoginModal` - 登录弹窗
- `WechatPromo` - 公众号推广
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
