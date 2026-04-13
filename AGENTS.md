# OneClaw (钳爪) - 全品类AI工具导航站

## 项目概述

**OneClaw** - 全品类AI工具导航站，精选238款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作、AI编程、AI音频、AI办公、AI营销、AI学习、AI聊天、AI搜索等全品类。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **品牌元素**: 龙虾 🦞，红橙渐变配色

### 分类体系

| 分类 | 工具数 | 代表工具 |
|------|--------|----------|
| 视频生成 | 119 | Sora, Runway, 可灵AI, 即梦AI |
| 数字人 | 31 | HeyGen, Synthesia, D-ID |
| 视频编辑 | 29 | 剪映, CapCut, Runway ML |
| AI绘画 | 9 | Midjourney, DALL·E 3, Stable Diffusion |
| AI聊天 | 8 | ChatGPT, Claude, Kimi, 豆包 |
| AI配音 | 8 | ElevenLabs, 讯飞配音 |
| AI写作 | 7 | Notion AI, Jasper, 秘塔写作猫 |
| AI编程 | 5 | GitHub Copilot, Cursor, 通义灵码 |
| AI音频 | 4 | Suno, Udio, Mubert |
| AI办公 | 4 | Gamma, 飞书妙记, Beautiful.ai |
| AI搜索 | 3 | Perplexity, 秘塔AI搜索 |
| AI营销 | 3 | Jasper Marketing, Copy.ai |
| AI学习 | 3 | Duolingo, Speak |

### 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **认证**: jose (JWT), bcryptjs (密码加密)

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 前台首页
│   │   ├── layout.tsx      # 根布局
│   │   ├── globals.css     # 全局样式
│   │   ├── tools/[id]/     # 工具详情页(SEO优化)
│   │   ├── admin/          # 后台管理系统
│   │   │   ├── layout.tsx  # 后台布局
│   │   │   ├── page.tsx    # 仪表盘
│   │   │   ├── tools/      # 工具管理
│   │   │   ├── categories/ # 分类管理
│   │   │   ├── tags/       # 标签管理
│   │   │   └── reviews/    # 评论审核
│   │   ├── workspace/      # 用户工作台
│   │   ├── rankings/       # 榜单中心
│   │   ├── prompts/        # 提示词库(一级入口)
│   │   ├── tutorials/      # 教程库(一级入口)
│   │   ├── membership/     # 会员中心
│   │   └── api/            # API路由
│   │       ├── tools/      # 前台工具API (含[id]详情)
│   │       ├── categories/ # 分类API
│   │       ├── tags/       # 标签API
│   │       ├── ratings/    # 评分API
│   │       ├── reviews/    # 评论API
│   │       ├── favorites/  # 收藏API
│   │       ├── history/    # 浏览历史API
│   │       ├── rankings/   # 榜单API
│   │       ├── tutorials/  # 教程API
│   │       ├── prompts/    # Prompt模板API
│   │       ├── members/    # 会员API
│   │       ├── ads/        # 广告API
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
| `admin_users` | 管理员用户 | id, username, password_hash, email, role, is_active |
| `admin_sessions` | 管理员会话 | id, user_id, token, expires_at |
| `users` | 用户表 | id, user_id, openid, nickname, avatar_url, phone |
| `user_sessions` | 用户会话 | id, user_id, token, expires_at |
| `skill_categories` | 技能分类表 | id, name, slug, icon, color, sort_order |
| `skills` | 技能表 | id, name, slug, description, logo, category_id, official_url, tags |

### 技能库

技能库是从 [SkillHub](https://skillhub.cn/skills) 爬取的真实 AI 技能数据，涵盖 Agent、代码开发、效率工具等多个领域。

| 分类 | 说明 |
|------|------|
| AI | Agent、自我优化、知识图谱等 |
| 智能开发 | 代码审查、API、浏览器自动化等 |
| 工具效率 | 搜索、总结、文件处理等 |
| 数据分析 | SQL、数据可视化等 |
| 内容创作 | 写作、SEO等 |
| 安全合规 | 安全检测、隐私保护等 |
| 通讯协作 | 团队协作、客服等 |

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
| `/api/ratings` | GET/POST | 工具评分统计与提交 |
| `/api/reviews` | GET/POST | 评论列表与发布 |
| `/api/favorites` | GET/POST/DELETE | 用户收藏管理 |
| `/api/history` | GET/POST/DELETE | 浏览历史管理 |
| `/api/rankings` | GET | 榜单数据(热门、免费、新品) |
| `/api/tutorials` | GET/POST | 教程库 |
| `/api/prompts` | GET/POST | Prompt模板库 |
| `/api/members` | GET/POST | 会员信息管理 |
| `/api/ads` | GET/POST | 广告位管理 |

### 后台管理API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/tools` | GET/POST/PUT/DELETE | 工具CRUD |
| `/api/admin/tools/import` | POST | 批量导入工具 |
| `/api/admin/tools/migrate` | POST | 从静态数据迁移 |
| `/api/admin/init-data` | GET/POST | 初始化基础数据 |
| `/api/admin/health-check` | GET | 链接健康检查 |

## 前台功能模块

### 核心功能
1. **用户评分与短评** - 四维评分(效果、易用性、额度、稳定性) + 文字评论
2. **用户收藏与工作台** (`/workspace`) - 收藏管理、浏览历史、评分记录
3. **榜单中心** (`/rankings`) - 热门榜单、免费神器、新品上线、场景化榜单
4. **提示词库** (`/prompts`) - AI视频创作提示词模板库
5. **教程库** (`/tutorials`) - AI工具使用教程

### 增值功能
1. **会员体系** - 月度/年度/终身三级会员
2. **付费收录** - sponsor_type字段支持basic/premium/diamond
3. **广告系统** - 多位置广告位管理

## UI 设计规范 (CRITICAL)

为保证全站 UI 风格统一，所有详情页面必须遵循以下规范：

### 详情页统一结构

所有详情页（工具/提示词/技能/教程）必须保持一致的页面结构：

```
┌─────────────────────────────────────────┐
│  BackToHome 组件（返回首页按钮）         │
├─────────────────────────────────────────┤
│  主内容区（max-w-4xl）                   │
│  ├── 面包屑/标题区                       │
│  ├── 核心信息卡片                        │
│  ├── 数据平铺区（无Tab，按重要程度排序）  │
│  └── 相关推荐                            │
├─────────────────────────────────────────┤
│  WechatPromo 组件（公众号推广）          │
└─────────────────────────────────────────┘
```

### 页面宽度规范

| 页面类型 | 宽度 | 备注 |
|----------|------|------|
| 详情页 | `max-w-4xl` | 工具、提示词、技能、教程详情页 |
| 列表页 | `max-w-7xl` | 工具列表、提示词库等 |
| 弹窗/表单 | `max-w-md` ~ `max-w-2xl` | Dialog、Form等 |
| 特殊页面 | 按需调整 | 如 about、membership |

### 禁止使用的组件

**详情页严禁使用 Tabs 组件！** 数据必须平铺展示，按重要程度排序。

- ❌ 禁止：`Tabs` + `TabsContent` + `TabsTrigger`
- ✅ 使用：平铺的 `section` 区块，按顺序展示

### 统一组件使用

| 组件 | 用途 | 导入路径 |
|------|------|----------|
| `BackToHome` | 返回首页按钮 | `@/components/BackToHome` |
| `WechatPromo` | 公众号推广 | `@/components/WechatPromo` |
| `LobsterLoading` | 加载状态 | `@/components/LobsterLoading` |

### 卡片样式规范

```tsx
// 标准卡片
<Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors">
  <CardContent className="p-4">
    {/* 内容 */}
  </CardContent>
</Card>
```

### 按钮样式规范

```tsx
// 主要按钮（橙色调）
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
  操作
</Button>

// 次要按钮（slate色调）
<Button variant="outline" className="border-slate-300 hover:bg-slate-50">
  取消
</Button>
```

### 主题色彩

| 用途 | 颜色 | Tailwind 类 |
|------|------|-------------|
| 主题主色 | 橙色 | `orange-500` / `orange-600` |
| 成功/免费 | 绿色 | `green-500` / `emerald-500` |
| 警告 | 黄色 | `amber-500` / `yellow-500` |
| 错误/付费 | 红色 | `red-500` / `rose-500` |
| 信息 | 蓝色 | `blue-500` / `sky-500` |
| 边框 | 灰色 | `slate-200` / `slate-700` |

## 后台管理系统

访问地址: `/admin`

### 管理员账号安全

**重要**：生产环境初始化时，系统会自动创建管理员账号：
- 用户名：`admin`
- 密码：优先使用环境变量 `ADMIN_PASSWORD`，若未设置则生成随机高强度密码
- 密码仅在初始化时返回一次，请妥善保存
- **切勿在代码或日志中明文存储密码**

### 功能模块

1. **仪表盘** (`/admin`) 
   - 统计概览（工具数、浏览量、点击量、评分数等）
   - 快捷操作入口
   - 最近添加工具
   - 热门工具 TOP 5
   - 链接健康检查

2. **工具管理** (`/admin/tools`)
   - 工具列表(搜索、筛选、分页)
   - 添加/编辑工具
   - 批量导入
   - 推荐设置
   - 上下架管理

3. **分类管理** (`/admin/categories`) 
   - 一级分类CRUD
   - 二级分类展示
   - 排序设置
   
4. **标签管理** (`/admin/tags`)
   - 标签分类展示
   - 标签CRUD
   - 按类型筛选

5. **评论审核** (`/admin/reviews`)
   - 待审核评论列表
   - 通过/拒绝操作
   - 评论详情查看

6. **微信配置** (`/admin/wechat`)
   - 公众号AppID/AppSecret配置
   - 登录二维码URL配置
   - 消息服务器配置

## 用户登录系统

### 微信扫码登录

C端用户通过微信扫码登录，登录后可进行评分、收藏、评论等互动操作。

**登录流程：**
1. 用户点击登录按钮，打开登录弹窗
2. 前端请求 `/api/auth?action=qrcode` 获取二维码
3. 前端轮询 `/api/auth?action=check&sceneId=xxx` 检查扫码状态
4. 用户扫码后状态变为 `scanned`，确认后变为 `confirmed`
5. 登录成功，设置 `user_token` Cookie（有效期30天）

**开发环境：**
- 支持模拟登录按钮，方便开发调试
- 模拟登录会创建测试用户并返回token

**生产环境配置：**
1. 在微信公众平台获取 AppID 和 AppSecret
2. 配置服务器URL：`https://oneclaw.shop/api/wechat/callback`
3. 生成带参数的二维码，将URL配置到后台
4. 实现微信消息回调处理（需单独开发）

### 用户数据表

| 表名 | 说明 |
|------|------|
| `users` | 用户信息表 |
| `user_sessions` | 用户会话表 |
| `login_requests` | 登录请求表（扫码状态跟踪） |
| `wechat_config` | 微信公众号配置表 |

4. **标签管理** (`/admin/tags`)
   - 标签分类展示
   - 标签CRUD
   - 按类型筛选

5. **评论审核** (`/admin/reviews`)
   - 待审核评论列表
   - 通过/拒绝操作
   - 评论详情查看

## SEO优化

### Favicon配置
- 使用Next.js的icon约定，动态生成favicon
- `/icon` - 32x32 PNG格式favicon
- `/apple-icon` - 180x180 PNG格式Apple Touch Icon
- 使用龙虾emoji(🦞)配合红橙渐变背景

### 元数据配置
- 完整的title、description、keywords
- Open Graph标签（Facebook、微信分享）
- Twitter Card标签
- 百度站长验证meta标签
- 结构化数据（JSON-LD）：WebSite、Organization、ItemList

### 百度SEO优化
1. **百度站长验证**：在`layout.tsx`中添加验证meta标签
2. **百度自动推送**：自动向百度提交新页面
3. **百度统计**：需替换`YOUR_BAIDU_ANALYTICS_ID`
4. **robots.txt**：配置Baiduspider、Baiduspider-image爬虫规则
5. **sitemap.xml**：包含所有主要页面，每日更新

### 百度收录步骤
1. 访问 [百度搜索资源平台](https://ziyuan.baidu.com/)
2. 添加网站并选择验证方式（推荐HTML标签验证）
3. 将验证码替换到`layout.tsx`中的`baidu-site-verification` meta标签
4. 提交sitemap：`https://oneclaw.shop/sitemap.xml`
5. 等待百度爬虫收录（通常需要1-2周）

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

# 生产环境数据初始化
curl -X POST https://oneclaw.shop/api/admin/init-production

# 导入工具数据
curl -X POST https://oneclaw.shop/api/admin/tools/import \
  -H "Content-Type: application/json" \
  -d '{"tools": [...]}'

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
