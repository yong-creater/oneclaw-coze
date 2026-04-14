# OneClaw 项目结构

## 整体架构

```
oneclaw/
├── src/
│   ├── app/                    # 所有页面和 API
│   │   │
│   │   ├── (main)/            # 主站应用（前台）
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── tools/         # 工具库
│   │   │   ├── rankings/       # 榜单
│   │   │   ├── prompts/        # 提示词库
│   │   │   ├── tutorials/      # 教程库
│   │   │   ├── skills/         # 技能库
│   │   │   ├── membership/     # 会员中心
│   │   │   └── workspace/      # 用户工作台
│   │   │
│   │   ├── admin/             # 管理后台
│   │   │   ├── page.tsx       # 仪表盘
│   │   │   ├── tools/          # 工具管理
│   │   │   ├── categories/     # 分类管理
│   │   │   ├── tags/           # 标签管理
│   │   │   ├── reviews/        # 评论审核
│   │   │   ├── members/        # 会员管理
│   │   │   ├── ads/            # 广告管理
│   │   │   └── login/          # 登录页
│   │   │
│   │   ├── api/                # 公共 API
│   │   │   ├── tools/          # 工具相关
│   │   │   ├── categories/     # 分类相关
│   │   │   ├── rankings/       # 榜单相关
│   │   │   └── ...
│   │   │
│   │   └── admin/api/          # 后台 API
│   │       ├── tools/          # 工具管理
│   │       ├── init-data/      # 初始化数据
│   │       └── ...
│   │
│   ├── components/             # 共享组件
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── admin/              # 后台专用组件
│   │   └── ads/                # 广告组件
│   │
│   ├── storage/                 # 数据层
│   │   └── database/           # 数据库连接
│   │       └── supabase-client.ts
│   │
│   ├── lib/                    # 工具函数
│   │   ├── utils.ts            # 通用工具
│   │   ├── constants.ts        # 常量定义
│   │   └── hooks.ts           # 自定义 Hooks
│   │
│   └── middleware.ts           # 中间件
│
├── public/                     # 静态资源
├── scripts/                    # 构建脚本
│   ├── build.sh
│   ├── dev.sh
│   └── start.sh
│
└── packages/
    └── shared/                 # 共享包（预留）
```

## 应用模块

### 1. 主站应用 `(main)`
面向普通用户，路由前缀 `/`

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/tools` | 工具库列表 |
| `/tools/[id]` | 工具详情 |
| `/rankings` | 榜单中心 |
| `/prompts` | 提示词库 |
| `/tutorials` | 教程库 |
| `/skills` | 技能库 |
| `/membership` | 会员中心 |
| `/workspace` | 用户工作台 |

### 2. 管理后台 `admin`
面向管理员，路由前缀 `/admin`

| 路由 | 说明 |
|------|------|
| `/admin` | 仪表盘 |
| `/admin/tools` | 工具管理 |
| `/admin/categories` | 分类管理 |
| `/admin/tags` | 标签管理 |
| `/admin/reviews` | 评论审核 |
| `/admin/members` | 会员管理 |
| `/admin/ads` | 广告管理 |
| `/admin/login` | 登录页 |

### 3. API 接口 `api`
公共 API 和管理 API

## 部署方式

### 单项目 + 多域名（推荐）
```
扣子平台
├── oneclaw.shop       → 主站 /
└── admin.oneclaw.shop → 后台 /admin
```

### 访问控制
- `/admin/*` 路由需要管理员登录
- 其他路由公开访问

## 数据库
使用扣子平台火山引擎 PostgreSQL，自动注入环境变量：
- `COZE_SUPABASE_URL`
- `COZE_SUPABASE_ANON_KEY`

## 扩展新应用

如需新增独立应用，创建新的路由组：

```
src/app/
├── app/
│   └── (new-app)/         # 新应用
│       ├── page.tsx
│       └── ...
├── api/
│   └── new-app/           # 新应用 API
│       └── ...
```

## 性能优化

1. 静态资源托管在 CDN
2. API 路由按需加载
3. 图片使用 Next.js Image 优化
4. 组件懒加载
