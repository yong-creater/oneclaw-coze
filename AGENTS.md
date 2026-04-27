# OneClaw (钳爪) - 全品类AI工具导航站

## 铁律 (CRITICAL - 必须严格遵守)

> **每次开发必须遵循以下铁律，违反将导致严重质量问题**

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

1. **代码静态检查**
   ```bash
   pnpm lint
   pnpm ts-check
   ```

2. **构建检查**
   ```bash
   pnpm build
   ```

3. **API 接口测试**（必须 100% 覆盖）
   - 使用 `test_run` 工具并行测试所有接口
   - 输出完整接口清单与测试结果

4. **服务存活探测**
   ```bash
   curl -I http://localhost:5000
   curl -I http://localhost:5000/admin
   ```

5. **日志健康检查**
   ```bash
   tail -n 50 /app/work/logs/bypass/app.log /app/work/logs/bypass/console.log | grep -iE "error|exception"
   ```

**禁止跳过任何测试步骤！**

### 铁律三：调试问题必须遵循数据流原则

> **问题反复修不好的根本原因是没有从数据流角度排查！**

#### 调试检查清单（每次必查）

| 步骤 | 检查内容 | 命令/方法 |
|------|----------|-----------|
| 1 | API 返回什么数据 | `curl http://localhost:5000/api/xxx` |
| 2 | 组件 props 是否接收 | 对照 interface 检查参数 |
| 3 | 数据是否正确传递 | 父组件是否传递了 prop |
| 4 | State 更新是否触发 | 添加 console.log 验证 |
| 5 | 构建是否通过 | `pnpm build` |

#### Props 检查技巧

```tsx
// ❌ 错误模式：定义了接口但参数没接收
interface Props { providers: Record<string, any> }
function Component({ name }: Props) {  // 漏了 providers！

// ✅ 正确模式：参数与接口完全一致
interface Props { providers: Record<string, any> }
function Component({ name, providers }: Props) { }

// ✅ 带默认值
function Component({ providers = {} }: Props) { }
```

#### 数据流追踪技巧

```
API 返回数据
    ↓
useEffect/fetch 获取
    ↓  
    ↓ 检查点：console.log(data) 验证数据
    ↓
setState 更新
    ↓
    ↓ 检查点：验证 state 已更新
    ↓
props 传递给子组件
    ↓
    ↓ 检查点：父组件是否传递了 prop？子组件是否接收？
    ↓
子组件渲染
```

### 铁律四：交付前必须完成多轮测试

> **必须自己验证没问题后才能交付，禁止直接说"刷新页面试试"**

#### 修复后测试流程

1. **构建验证**
   ```bash
   pnpm build
   # 必须通过才能继续
   ```

2. **API 数据验证**
   ```bash
   curl http://localhost:5000/api/admin/tool-models
   # 检查返回的数据结构是否正确
   ```

3. **功能验证**（至少 2 轮）
   - 打开页面测试基本功能
   - 测试关键交互（点击、切换等）
   - 测试边界情况（空数据、错误状态）

4. **回归测试**
   - 确认之前修复的问题不再出现
   - 确认不影响其他功能

#### 交付标准

| 检查项 | 标准 |
|--------|------|
| 构建 | `pnpm build` 通过 |
| API | 返回正确数据结构 |
| 功能 | 关键交互 100% 可用 |
| 无回归 | 不影响其他功能 |

**只有全部通过才能交付！**

### 铁律五：避免重复犯错的检查清单

#### Props 完整性检查
- [ ] 定义了 interface
- [ ] 组件函数参数包含所有属性
- [ ] 父组件传递了所有属性
- [ ] 有默认值的属性设置了默认值

#### 调试日志检查
- [ ] API 调用处添加数据验证
- [ ] 关键 state 更新处添加日志
- [ ] 子组件接收 props 处验证数据

#### 测试验证检查
- [ ] `pnpm build` 通过
- [ ] API 返回正确数据
- [ ] 功能正常可用
- [ ] 多轮测试确认稳定

#### API 数据结构验证 [NEW - CRITICAL]
- [ ] 确认 API 返回的实际数据结构（可能与文档/期望不同）
- [ ] 父组件正确提取 API 数据（检查 `data.success`、`data.data`、`data.providers` 等字段）
- [ ] 验证数据格式转换逻辑
- [ ] 使用 `console.log` 打印 API 返回数据确认格式

**常见坑**：API 返回 `{ success, data }` 包装，但父组件期望直接是 `{ providers }`

---

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

为保证全站 UI 风格统一，前台和后台必须遵循各自的规范，禁止混用。

---

# 一、前台网站规范

## 1.1 布局架构

```
┌─────────────────────────────────────────────┐
│  Header (固定顶部导航)                        │
├─────────────────────────────────────────────┤
│  主内容区                                    │
│  ├── 列表页: max-w-7xl                      │
│  ├── 详情页: max-w-4xl (居中)               │
│  └── 特殊页面: 按需调整                      │
├─────────────────────────────────────────────┤
│  Footer (底部信息)                           │
└─────────────────────────────────────────────┘
```

## 1.2 页面宽度规范

| 页面类型 | 宽度 | 备注 |
|----------|------|------|
| 首页 | `max-w-7xl` | 全宽展示 |
| 列表页 | `max-w-7xl` | 工具列表、提示词库等 |
| 详情页 | `max-w-4xl mx-auto` | 工具、提示词、技能、教程 |
| 弹窗/表单 | `max-w-md` ~ `max-w-2xl` | Dialog、Form等 |
| 落地页 | `max-w-6xl` | 专题页、活动页 |

## 1.3 详情页统一结构

所有详情页（工具/提示词/技能/教程）必须保持一致：

```
┌─────────────────────────────────────────┐
│  BackToHome 组件（返回首页按钮）         │
├─────────────────────────────────────────┤
│  主内容区（max-w-4xl mx-auto）           │
│  ├── 面包屑/标题区                       │
│  ├── 核心信息卡片                        │
│  ├── 数据平铺区（无Tab，按重要程度排序）  │
│  └── 相关推荐                            │
├─────────────────────────────────────────┤
│  WechatPromo 组件（公众号推广）          │
└─────────────────────────────────────────┘
```

## 1.4 前台禁止事项

| 禁止项 | 说明 |
|--------|------|
| Tabs 组件 | 详情页严禁使用 Tabs，数据必须平铺展示 |
| 独立布局 | 禁止创建独立 header/footer，必须使用 layout.tsx 的全局布局 |
| 后台组件 | 禁止使用 admin/ 目录下的组件 |

## 1.5 前台专用组件

| 组件 | 用途 | 导入路径 |
|------|------|----------|
| `SiteLogo` | 站点 Logo（含 fallback） | `@/components/common/SiteLogo` |
| `AnimatedLobster` | 龙虾动画（品牌标识） | `@/components/common/AnimatedLobster` |
| `BackButton` | 返回上一页按钮 | `@/components/common/BackButton` |
| `BackToHome` | 返回首页按钮（面包屑） | `@/components/common/BackToHome` |
| `WechatPromo` | 公众号推广 | `@/components/common/WechatPromo` |
| `LobsterLoading` | 龙虾加载动画 | `@/components/common/LobsterLoading` |
| `LobsterSkeleton` | 龙虾骨架屏 | `@/components/common/LobsterSkeleton` |
| `LoginButton` | 登录按钮 | `@/components/common/LoginButton` |
| `LoginModal` | 登录弹窗 | `@/components/common/LoginModal` |
| `UtilityHeader` | 工具页头部导航 | `@/components/common/UtilityHeader` |
| `ToolLogo` | 工具 Logo 组件 | `@/components/common/ToolLogo` |
| `SponsorBadge` | 赞助商徽章 | `@/components/common/SponsorBadge` |
| `AdBanner` | 广告横幅组件 | `@/components/common/AdBanner` |
| `CaseStudyFloatCard` | 案例浮窗卡片 | `@/components/common/CaseStudyFloatCard` |
| `TutorialLikeButton` | 教程点赞按钮 | `@/components/common/TutorialLikeButton` |

## 1.6 Logo 使用规范

**所有站点 Logo 必须使用 `SiteLogo` 组件**，禁止直接使用 `<img>` 标签加载 `/oneclaw-logo.png`。

```tsx
// ✅ 正确：使用 SiteLogo 组件（含 fallback）
import { SiteLogo } from '@/components/common/SiteLogo';
<SiteLogo size={32} showText />

// ❌ 错误：直接使用 img 标签（无 fallback）
<img src="/oneclaw-logo.png" />
```

**Fallback 机制**：当 `/oneclaw-logo.png` 加载失败时，自动显示橙红渐变圆形 + "OC" 字母

## 1.6 前台卡片样式

```tsx
// 标准卡片（统一使用 border-2）
<Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors">
  <CardContent className="p-4">
    {/* 内容 */}
  </CardContent>
</Card>

// 列表卡片（带hover效果）
<Card className="hover:shadow-lg hover:border-orange-400 transition-all duration-200">
  <CardContent className="p-5">
    {/* 内容 */}
  </CardContent>
</Card>
```

## 1.7 表单输入框交互规范 (CRITICAL)

**必须遵循的交互状态规范**：

| 状态 | 边框颜色 | 说明 |
|------|----------|------|
| 默认 | `border-2 border-slate-200 dark:border-slate-700` | 2px 灰色边框 |
| Hover | `hover:border-orange-400 dark:hover:border-orange-500` | 橙色边框 |
| Focus | `border-orange-500` | 橙色边框（Input 组件内置） |

### ⚠️ Input 组件全局样式修复 (必须执行)

shadcn/ui 的 Input 组件有默认的 focus 样式，会覆盖自定义样式。**必须修改 `src/components/ui/input.tsx`**：

```tsx
// ❌ 错误：默认的 focus 样式会覆盖自定义样式
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// ✅ 正确：使用橙色边框作为默认 focus 样式
"focus-visible:border-orange-500"
```

### ✅ 全局输入框样式规范

所有输入框必须保持一致的样式，包括圆角、padding、边框等细节：

```tsx
// ========== Input 输入框 ==========
<Input 
  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 
             border-2 border-slate-200 dark:border-slate-700 rounded-xl 
             hover:border-orange-400 dark:hover:border-orange-500 
             transition-colors text-sm text-slate-800 dark:text-slate-200"
/>

// ========== Textarea 多行文本框 ==========
<textarea
  className="w-full px-4 py-3 bg-white dark:bg-slate-800 
             border-2 border-slate-200 dark:border-slate-700 rounded-xl 
             hover:border-orange-400 dark:hover:border-orange-500 
             focus:outline-none focus:border-orange-500 
             transition-colors text-sm text-slate-800 dark:text-slate-200 
             resize-none placeholder:text-slate-400"
/>

// ========== Select 选择器 ==========
<SelectTrigger className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 
                         border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                         hover:border-orange-400 dark:hover:border-orange-500 
                         focus:outline-none focus:border-orange-500 
                         transition-colors text-sm text-slate-800 dark:text-slate-200">
  <SelectValue />
</SelectTrigger>

// ========== Outline 按钮 ==========
<Button variant="outline" className="px-4 py-2.5 
                                    border-2 border-slate-200 dark:border-slate-700 
                                    hover:border-orange-400 dark:hover:border-orange-500 
                                    transition-colors">
  按钮文字
</Button>
```

### 样式细节说明

| 元素 | 样式 | 值 |
|------|------|-----|
| 圆角 | `rounded-xl` | 12px |
| 边框宽度 | `border-2` | 2px |
| 内边距-单行 | `px-4 py-2.5` | 16px 10px |
| 内边距-多行 | `px-4 py-3` | 16px 12px |
| 背景色 | `bg-white dark:bg-slate-800` | 白色/深色 |
| 边框色-默认 | `border-slate-200 dark:border-slate-700` | 灰/深灰 |
| 边框色-Hover | `hover:border-orange-400` | 橙色 |
| 边框色-Focus | `focus:border-orange-500` | 深橙色 |
| 文字大小 | `text-sm` | 14px |
| 过渡动画 | `transition-colors` | 颜色过渡 |

### ❌ 禁止的错误写法

```tsx
// 错误1: 圆角不一致（用了 rounded-lg 而非 rounded-xl）
className="... rounded-lg ..."

// 错误2: padding 不一致
className="... px-3 py-2 ..." // 应该是 px-4 py-2.5

// 错误3: 边框宽度不一致
className="... border ..." // 应该是 border-2

// 错误4: 背景色不一致
className="... bg-slate-50 ..." // 应该是 bg-white

// 错误5: hover/focus 颜色不一致
className="... hover:border-slate-300 ..." // 应该是 hover:border-orange-400

// 错误6: focus 使用 ring（导致双层边框）
className="... focus:ring-2 focus:ring-orange-500 ..."

// 错误7: 缺少 transition
className="..." // 应该加上 transition-colors
```

### 规范要点

1. **Input 组件**：已内置 `focus-visible:border-orange-500`，只需添加 hover 样式
2. **Textarea/Select**：需要手动添加 `focus:outline-none focus:border-orange-500`
3. **圆角统一**：`rounded-xl`（12px）
4. **边框宽度**：统一使用 `border-2`
5. **背景色**：统一使用 `bg-white dark:bg-slate-800`
6. **Hover 颜色**：`hover:border-orange-400`
7. **禁止 ring**：Focus 时禁止使用 `focus:ring-*`

---

# 二、后台管理系统规范

## 2.1 布局架构

```
┌──────────┬─────────────────────────────────┐
│          │  Header (页面标题)              │
│  Sidebar │─────────────────────────────────│
│  (固定)  │                                 │
│          │  主内容区 (无固定宽度限制)        │
│          │                                 │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

**核心原则**：后台所有页面都基于 `/app/admin/layout.tsx` 的侧边栏布局，不允许创建独立布局。

## 2.2 页面结构规范

**✅ 正确的后台页面结构：**

```tsx
// src/app/admin/xxx/page.tsx
export default function AdminXxxPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold">页面标题</h2>
        <p className="text-sm text-slate-500">页面描述</p>
      </div>
      
      {/* 内容区域 */}
      <div className="space-y-4">
        {/* ... */}
      </div>
    </div>
  );
}
```

**❌ 后台禁止事项：**

| 禁止项 | 说明 | 正确做法 |
|--------|------|----------|
| `<header>` | 禁止创建独立导航 | 使用 layout 的 Header |
| `min-h-screen` | 禁止全屏高度 | 使用 `space-y-6` 间距 |
| `<main>` | 禁止独立 main 标签 | 使用 `<div>` 或 `<section>` |
| `AnimatedLobster` | 禁止前台组件 | 不导入 |
| `BackToHome` | 禁止前台组件 | 不导入 |
| `WechatPromo` | 禁止前台组件 | 不导入 |
| 独立 CSS | 禁止内联样式 | 使用 Tailwind 类 |

## 2.3 后台页面宽度规范

| 页面类型 | 宽度 | 备注 |
|----------|------|------|
| 列表页 | `max-w-7xl` | 数据表格、分页列表 |
| 表单页 | `max-w-5xl` | 添加/编辑表单 |
| 弹窗 | `max-w-md` ~ `max-w-2xl` | Dialog |
| 仪表盘 | 无限制 | 统计卡片自适应 |

## 2.4 后台卡片样式

```tsx
// 后台标准卡片
<Card className="bg-white dark:bg-slate-800">
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</Card>

// 后台紧凑卡片
<Card className="bg-white dark:bg-slate-800">
  <CardContent className="p-4">
    {/* 内容 */}
  </CardContent>
</Card>
```

## 2.5 后台常用组件

```tsx
// UI 组件
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Lucide 图标
import { IconName } from 'lucide-react';
```

---

# 三、通用规范（前后台共用）

## 3.1 按钮样式

```tsx
// 主要按钮（橙色调 - 用于重要操作）
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
  确认操作
</Button>

// 次要按钮（outline）
<Button variant="outline" className="border-slate-300 hover:bg-slate-50">
  取消
</Button>

// 危险按钮（删除等）
<Button variant="destructive">删除</Button>

// 幽灵按钮（图标按钮）
<Button variant="ghost" size="icon">
  <Icon className="w-4 h-4" />
</Button>
```

## 3.2 主题色彩

| 用途 | 颜色 | Tailwind 类 |
|------|------|-------------|
| 主题主色 | 橙色 | `orange-500` / `orange-600` |
| 成功/免费 | 绿色 | `green-500` / `emerald-500` |
| 警告 | 黄色 | `amber-500` / `yellow-500` |
| 错误/付费 | 红色 | `red-500` / `rose-500` |
| 信息 | 蓝色 | `blue-500` / `sky-500` |
| 边框 | 灰色 | `slate-200` / `slate-700` |

## 3.3 间距规范

| 用途 | Tailwind 类 |
|------|-------------|
| 页面内大间距 | `space-y-6` 或 `gap-6` |
| 卡片内间距 | `p-4` 或 `p-6` |
| 元素间距 | `gap-2` 或 `gap-4` |
| 标题与内容 | `mb-4` 或 `mt-6` |

## 3.4 响应式断点

| 断点 | Tailwind | 适用场景 |
|------|----------|----------|
| 手机 | 默认 | 移动端布局 |
| 平板 | `md:` | 2列布局 |
| 桌面 | `lg:` | 3-4列布局、侧边栏 |
| 大屏 | `xl:` 或 `2xl:` | 全宽展示 |

---

# 四、检查清单

## 前台开发检查

- [ ] 是否使用 `max-w-7xl` 或 `max-w-4xl`
- [ ] 详情页是否使用 `BackToHome` + `WechatPromo`
- [ ] 详情页是否**没有** Tabs 组件
- [ ] 是否**没有**导入后台组件

## 后台开发检查

- [ ] 是否**没有**独立 `<header>`
- [ ] 是否**没有** `min-h-screen`
- [ ] 是否**没有** `<main>` 标签
- [ ] 是否**没有** `AnimatedLobster`
- [ ] 是否**没有** `BackToHome`
- [ ] 是否**没有** `WechatPromo`
- [ ] 根元素是否使用 `<div className="space-y-6">`

#### 3.4 间距规范

| 用途 | Tailwind 类 |
|------|-------------|
| 页面内大间距 | `space-y-6` 或 `gap-6` |
| 卡片内间距 | `p-4` 或 `p-6` |
| 元素间距 | `gap-2` 或 `gap-4` |
| 标题与内容 | `mb-4` 或 `mt-6` |

#### 3.5 响应式断点

| 断点 | Tailwind | 适用场景 |
|------|----------|----------|
| 手机 | 默认 | 移动端布局 |
| 平板 | `md:` | 2列布局 |
| 桌面 | `lg:` | 3-4列布局、侧边栏 |
| 大屏 | `xl:` 或 `2xl:` | 全宽展示 |

---

### 四、组件导入规范

```tsx
// UI 组件
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// 前台专用组件
import AnimatedLobster from '@/components/common/AnimatedLobster';
import BackButton from '@/components/common/BackButton';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import LobsterLoading from '@/components/common/LobsterLoading';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { ToolLogo } from '@/components/common/ToolLogo';
import { SponsorBadge, isSponsorActive } from '@/components/common/SponsorBadge';
import { HomeBanner, HomeInlineAd, ToolDetailAd } from '@/components/common/AdBanner';

// Lucide 图标
import { IconName } from 'lucide-react';
```

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
