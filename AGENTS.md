# 项目上下文

## 项目概述

**OneClaw (钳爪)** - AI视频工具箱，精选117款优质AI视频创作工具，涵盖视频生成、数字人、视频编辑、AI字幕、AI音乐、动画制作等类别。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com
- **品牌元素**: 龙虾 🦞，红橙渐变配色

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 首页（工具列表、Tab切换、详情弹窗）
│   │   ├── layout.tsx      # 根布局（SEO、主题色）
│   │   └── globals.css     # 全局样式（龙虾动画）
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── data/               # 静态数据
│   │   ├── tools.ts        # 工具数据（117款工具）
│   │   └── prompts.ts      # 提示词库数据
│   └── lib/                # 工具库
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 核心功能

1. **工具列表**: 展示117款AI视频工具，支持分类筛选和搜索
2. **详情弹窗**: 点击工具卡片弹出详细信息
3. **Tab切换**: 首页支持"工具库"、"提示词库"、"关于我们"三个Tab
4. **真实Logo**: 使用真实工具logo URL (来自 ai-bot.cn)
5. **首字母图标**: 根据工具分类显示不同颜色的渐变首字母图标

## 数据结构

### ToolItem 接口
```typescript
interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  logo: string; // 真实logo URL
  tags: string[];
  featured?: boolean;
  features?: string[];
  pricing?: string;
  platform?: string;
}
```

### 分类
- 视频生成
- 数字人
- 视频编辑
- AI字幕
- AI音乐
- 动画制作

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- **Hydration 错误预防**: 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据
- **UI 设计**: 必须采用 shadcn/ui 组件、风格和规范
- **数据维护**: 工具数据位于 `src/data/tools.ts`，提示词数据位于 `src/data/prompts.ts`

## SEO优化

- 已配置完整的 metadata
- 支持 sitemap.xml 和 robots.txt
- 包含 JSON-LD 结构化数据


