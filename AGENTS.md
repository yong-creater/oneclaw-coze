# OneClaw (钳爪) - 实用AI工具导航站

## 项目概述

**OneClaw** - 精选实用AI工具导航站，让AI真正提升效率。

- **域名**: oneclaw.shop
- **联系邮箱**: 1017760688@qq.com

## 设计风格

采用简洁干净的国际化设计风格，参考国外优秀工具网站：
- **配色**: 纯黑白灰 + 单一强调色
- **排版**: 大量留白，清晰层次
- **元素**: 扁平化，极简边框
- **交互**: 微妙的hover效果

## 核心功能

### 前台功能
1. **首页** (`/`) - 实用工具入口
2. **工具页** (`/utilities`) - 工具列表
3. **简历优化** (`/resume`) - AI智能优化简历
4. **关于** (`/about`) - 关于OneClaw

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
├── src/
│   ├── app/
│   │   ├── page.tsx        # 首页
│   │   ├── layout.tsx      # 根布局
│   │   ├── utilities/       # 工具页
│   │   ├── resume/         # 简历优化页
│   │   ├── about/          # 关于页
│   │   ├── admin/          # 后台管理
│   │   └── api/            # API路由
│   ├── components/
│   │   ├── ui/             # Shadcn UI 组件
│   │   ├── tools/          # 工具组件
│   │   └── common/         # 通用组件
│   └── lib/                # 工具库
```

## 设计规范

### 颜色系统
```css
/* 亮色模式 */
--background: #ffffff
--foreground: #1a1a1a
--muted-foreground: #666666
--border: #e5e5e5
--accent: #f5f5f5

/* 暗色模式 */
--background: #0a0a0a
--foreground: #fafafa
--muted-foreground: #a3a3a3
--border: #262626
--accent: #1f1f1f
```

### 页面宽度
- 内容区: `max-w-5xl mx-auto px-6`

### 组件规范
- 卡片: 简洁边框，无阴影或轻微阴影
- 按钮: 扁平化，hover状态变化
- 禁止: 渐变背景、花哨动画

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
