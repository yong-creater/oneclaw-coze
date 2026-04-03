# OneClaw (钳爪) - AI视频工具导航站

## 项目概述

**OneClaw** - AI视频工具导航站，精选117款优质AI视频创作工具，涵盖视频生成、数字人、视频编辑、AI配音、动漫创作等类别。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **品牌元素**: 龙虾 🦞，红橙渐变配色

### 技术栈

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
│   │   ├── admin/          # 后台管理系统
│   │   │   ├── layout.tsx  # 后台布局
│   │   │   ├── page.tsx    # 仪表盘
│   │   │   └── tools/      # 工具管理
│   │   └── api/            # API路由
│   │       ├── tools/      # 前台工具API
│   │       ├── categories/ # 分类API
│   │       ├── tags/       # 标签API
│   │       └── admin/      # 后台管理API
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── data/               # 静态数据（旧）
│   ├── storage/database/   # Supabase数据库
│   └── lib/                # 工具库
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 数据库结构

### 主要表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `categories` | 一级分类 | id, name, slug, sort_order |
| `sub_categories` | 二级分类 | id, name, parent_id |
| `tools` | 工具库 | id, name, logo, producer, highlight, category_id, free_type, feature_tags, official_url, promotion_url, is_featured, is_active |
| `tags` | 标签 | id, name, type |
| `user_favorites` | 用户收藏 | id, user_id, tool_id |
| `user_ratings` | 用户评分 | id, user_id, tool_id, effect_score, usability_score |

### 工具字段说明

```typescript
interface Tool {
  id: number;
  name: string;              // 工具名称
  logo: string;              // Logo URL
  producer: string;          // 出品方
  highlight: string;         // 一句话核心亮点(15字内)
  category_id: number;       // 一级分类ID
  sub_category_ids: number[]; // 二级分类ID数组
  free_type: string;         // 免费类型: 完全免费/免费额度/限时免费/付费工具
  free_quota_desc: string;   // 免费额度说明
  feature_tags: string[];    // 功能标签
  max_duration: string;      // 生成时长上限
  official_url: string;      // 官网链接
  promotion_url: string;     // 推广链接(优先)
  is_official: boolean;      // 官方认证
  is_featured: boolean;      // 首页推荐
  is_active: boolean;        // 是否上架
  advantages: string[];      // 核心优势(最多3条)
  limitations: string[];     // 局限性(最多2条)
  commercial_license: string; // 商用授权
}
```

## API接口

### 前台API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tools` | GET | 获取工具列表(支持分页、筛选、搜索) |
| `/api/categories` | GET | 获取分类列表 |
| `/api/tags` | GET | 获取标签列表 |

### 后台管理API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/tools` | GET/POST/PUT/DELETE | 工具CRUD |
| `/api/admin/tools/import` | POST | 批量导入工具 |
| `/api/admin/tools/migrate` | POST | 从静态数据迁移 |
| `/api/admin/init-data` | GET/POST | 初始化基础数据 |

## 后台管理系统

访问地址: `/admin`

### 功能模块

1. **仪表盘** (`/admin`) - 统计概览、快捷操作
2. **工具管理** (`/admin/tools`)
   - 工具列表(搜索、筛选、分页)
   - 添加工具
   - 编辑工具
   - 批量导入
   - 推荐设置
   - 上下架管理
3. **分类管理** (`/admin/categories`) - 分类配置
4. **标签管理** (`/admin/tags`) - 标签配置

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- **字段命名**: 使用 snake_case (数据库字段)
- **Hydration 错误预防**: 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等
- **UI 设计**: 采用 shadcn/ui 组件、风格和规范
- **数据操作**: 使用 Supabase SDK，每次调用检查 { data, error }

## 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 数据库迁移
coze-coding-ai db generate-models  # 同步模型
coze-coding-ai db upgrade          # 同步到数据库

# 初始化基础数据
curl -X POST http://localhost:5000/api/admin/init-data

# 迁移工具数据
curl -X POST http://localhost:5000/api/admin/tools/migrate
```

## SEO优化

- 已配置完整的 metadata
- 支持 sitemap.xml 和 robots.txt
- 包含 JSON-LD 结构化数据
