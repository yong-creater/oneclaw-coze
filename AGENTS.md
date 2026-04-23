# OneClaw (钳爪) - 精选AI工具导航站

## 项目概述

**OneClaw** - 精选AI工具导航站，让AI真正提升效率。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **备案**: 京ICP备XXXXXXXX号-1

## 核心功能

### 前台功能
1. **首页** (`/`) - AI应用、技能、教程、提示词、案例入口
2. **AI应用** (`/tools`) - AI工具列表、搜索、筛选
3. **工具详情** (`/tools/[id]`) - 工具详细信息
4. **技能** (`/skills`) - AI技能和提示词库
5. **教程** (`/tutorials`) - AI工具使用教程
6. **提示词** (`/prompts`) - AI提示词库
7. **案例** (`/cases`) - AI应用案例
8. **简历优化** (`/resume`) - AI智能优化简历
9. **关于** (`/about`) - 关于OneClaw、备案信息

### 后台管理
1. **仪表盘** - 数据统计概览
2. **AI应用管理** - 工具列表CRUD
3. **技能管理** - 技能/提示词CRUD
4. **教程管理** - 教程内容CRUD
5. **提示词管理** - 提示词CRUD
6. **案例管理** - 案例内容CRUD
7. **广告管理** - 广告位管理
8. **用户管理** - 用户列表查看
9. **微信配置** - 公众号配置

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
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页
│   │   ├── layout.tsx         # 根布局
│   │   ├── globals.css        # 全局样式
│   │   ├── tools/             # 工具列表页
│   │   ├── tools/[id]/       # 工具详情页
│   │   ├── skills/            # 技能页面
│   │   ├── tutorials/         # 教程页面
│   │   ├── prompts/           # 提示词页面
│   │   ├── cases/             # 案例页面
│   │   ├── resume/            # 简历优化页
│   │   ├── about/             # 关于页面
│   │   ├── admin/             # 后台管理
│   │   └── api/               # API路由
│   ├── components/
│   │   ├── ui/                # Shadcn UI 组件
│   │   └── common/            # 通用组件
│   └── lib/                   # 工具库
```

## 数据库表

| 表名 | 说明 |
|------|------|
| `categories` | 工具分类 |
| `tools` | AI工具库 |
| `skill_categories` | 技能分类 |
| `skills` | AI技能 |
| `tutorials` | 教程 |
| `prompts` | 提示词 |
| `cases` | 案例 |
| `user_favorites` | 用户收藏 |
| `user_ratings` | 用户评分 |
| `users` | 用户 |
| `members` | 会员 |
| `orders` | 订单 |
| `advertisements` | 广告位 |
| `admin_users` | 管理员用户 |
| `wechat_config` | 微信配置 |

## API接口

### 前台API
- `GET /api/tools` - 获取工具列表
- `GET /api/tools/[id]` - 获取工具详情
- `GET /api/categories` - 获取分类列表
- `GET /api/skills` - 获取技能列表
- `GET /api/tutorials` - 获取教程列表
- `GET /api/prompts` - 获取提示词列表
- `GET /api/cases` - 获取案例列表
- `POST /api/ratings` - 提交评分
- `POST /api/favorites` - 添加收藏
- `GET /api/ads` - 获取广告
- `POST /api/resume` - 简历优化
- `POST /api/auth` - 认证
- `POST /api/auth/code` - 发送验证码

### 后台API
- `GET/POST /api/admin/tools` - 工具CRUD
- `GET/POST /api/admin/skills` - 技能CRUD
- `GET/POST /api/admin/tutorials` - 教程CRUD
- `GET/POST /api/admin/prompts` - 提示词CRUD
- `GET/POST /api/admin/ads` - 广告管理
- `POST /api/admin/auth` - 管理员认证
- `POST /api/admin/init-data` - 初始化数据

## 设计规范

### 颜色系统（简洁风格）
```css
/* 亮色模式 */
--background: #ffffff
--foreground: #1a1a1a
--muted: #f5f5f5
--muted-foreground: #666666
--border: #e5e5e5
--accent: #f5f5f5

/* 暗色模式 */
--background: #0a0a0a
--foreground: #fafafa
--muted: #1f1f1f
--muted-foreground: #a3a3a3
--border: #262626
--accent: #1f1f1f
```

### 设计原则
- 简洁干净的国际化风格
- 大量留白，清晰层次
- 扁平化元素，极简边框
- 微妙的hover效果
- 无渐变背景，简洁配色

## 开发命令

```bash
pnpm dev     # 开发
pnpm build   # 构建
pnpm start   # 生产
```

## 注意事项

1. **禁止渐变色**: 使用纯色或透明度变化
2. **简洁优先**: 宁可少元素，不要多余装饰
3. **留白**: 充足的padding和margin
4. **组件复用**: 优先使用shadcn/ui组件
