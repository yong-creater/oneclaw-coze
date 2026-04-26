# OneClaw UI Design System v2
# 设计规范 - 对标苹果、特斯拉、谷歌

> 基于 ui-ux-pro-max 技能生成的专业设计系统

---

## 1. 设计哲学

### 核心原则
- **Minimal & Direct** (最小化直接)
- **Swiss Modernism 2.0** (瑞士现代主义)
- **AI-Native UI** (AI原生界面)

### 设计语言
- 大量留白，减少视觉噪音
- 纯黑文字 (#0A0A0A)，提高对比度
- 纯白背景 (#FFFFFF)，干净简洁
- 单一主色调作为点缀
- 使用间距和层次而非线条来分隔内容

---

## 2. 色彩系统

### 核心色板

| 角色 | 变量 | 色值 | 用途 |
|------|------|------|------|
| 主色 | `--primary` | `#2563EB` | 品牌色、按钮、链接 |
| 主色浅 | `--primary-foreground` | `#FFFFFF` | 主色上的文字 |
| 背景 | `--background` | `#FFFFFF` | 页面背景 |
| 卡片 | `--card` | `#FFFFFF` | 卡片背景 |
| 前景 | `--foreground` | `#0A0A0A` | 主要文字 |
| 次要文字 | `--muted-foreground` | `#71717A` | 次要文字、标签 |
| 占位符 | `--muted` | `#F4F4F5` | muted背景 |
| 强调 | `--accent` | `#F4F4F5` | 悬浮态背景 |
| 边框 | `--border` | `transparent` | **默认无边框** |
| 输入 | `--input` | `#E4E4E7` | 输入框边框(仅focus) |
| 破坏 | `--destructive` | `#DC2626` | 错误、删除 |

### 深色模式

| 角色 | 变量 | 色值 |
|------|------|------|
| 背景 | `--background` | `#09090B` |
| 卡片 | `--card` | `#18181B` |
| 前景 | `--foreground` | `#FAFAFA` |
| 次要文字 | `--muted-foreground` | `#A1A1AA` |
| 强调 | `--accent` | `#27272A` |
| 边框 | `--border` | `transparent` |

### 功能色

| 用途 | 色值 |
|------|------|
| 成功 | `#16A34A` |
| 警告 | `#CA8A04` |
| 错误 | `#DC2626` |
| 信息 | `#0284C7` |

---

## 3. 线条与分隔系统

### 核心原则 ⚠️ 重要

> **线条使用规范** - 这是本设计的核心决策

```
❌ 错误做法:
- 默认给所有卡片添加 border
- 使用线条分隔相关内容
- 用 border 区分元素

✅ 正确做法:
- 默认无边框 (border: transparent)
- 使用间距 (space-y, gap) 分隔内容
- 使用阴影层级区分元素
- 使用背景色区分区块
```

### 线条使用场景

| 场景 | 是否有线条 | 替代方案 |
|------|------------|----------|
| 侧边栏与内容区分 | ✅ 有 | 单一分隔线，右侧 |
| 页面顶部固定导航 | ❌ 无 | 使用阴影 `shadow-sm` |
| 卡片组件 | ❌ 无 | 仅 hover 时阴影 |
| 分类筛选区 | ❌ 无 | 背景色区分 |
| 表单输入框 | ❌ 无 | 仅 focus 时边框 |
| 按钮 | ❌ 无 | 使用背景色 |
| 表格行 | ❌ 无 | 使用斑马纹背景 |

### 分隔线样式（仅在必要时使用）

```css
/* 侧边栏与内容分隔线 */
border-right: 1px solid var(--border); /* 实际透明 */

/* 仅在需要可见边框时使用 */
.visible-border {
  border: 1px solid #E4E4E7;
}
```

---

## 4. 圆角系统

### 统一圆角规范

| 组件 | 圆角 | Tailwind |
|------|------|----------|
| 按钮 | 8px | `rounded-lg` |
| 输入框 | 8px | `rounded-lg` |
| 卡片 | 12px | `rounded-xl` |
| 弹窗 | 16px | `rounded-2xl` |
| 头像 | 9999px | `rounded-full` |
| Logo容器 | 8px | `rounded-lg` |
| 小标签 | 6px | `rounded-md` |
| 大卡片 | 12px | `rounded-xl` |

**原则**: 避免过小或过大的圆角，保持精致感

---

## 5. 间距系统

### 基础单位: 4px

| 名称 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| 0 | 0px | `space-0` | 紧密元素 |
| 1 | 4px | `space-1` | 微调 |
| 2 | 8px | `space-2` | 小间距 |
| 3 | 12px | `space-3` | 默认间距 |
| 4 | 16px | `space-4` | 元素间距 |
| 6 | 24px | `space-6` | 区块间距 |
| 8 | 32px | `space-8` | 大区块 |
| 12 | 48px | `space-12` | 页面间距 |
| 16 | 64px | `space-16` | 极大间距 |

### 页面布局间距

```tsx
// 页面容器
<div className="max-w-7xl mx-auto px-6 py-8">

// 区块间距
<div className="space-y-6">  // 区块内
<div className="gap-4">     // 网格

// 元素间距
<div className="gap-2">     // 紧密
<div className="gap-3">     // 默认
```

---

## 6. 阴影系统

### 阴影层级

| 名称 | CSS | 使用场景 |
|------|-----|----------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 页面顶部固定元素 |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.05)` | 卡片悬浮态 |
| `shadow-hover` | 自定义 | 交互反馈 |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | 弹窗 |

### 阴影使用原则

```
✅ 使用阴影:
- 页面顶部固定导航栏
- 悬浮态的卡片
- 弹窗、下拉菜单

❌ 不使用阴影:
- 默认状态的卡片
- 已在视觉上区分的元素
- 列表项
```

---

## 7. 组件规范

### 按钮

```tsx
// 主要按钮 - 使用背景色
<Button className="h-10 px-4 bg-primary text-primary-foreground 
                   hover:bg-primary/90 rounded-lg font-medium text-sm 
                   shadow-sm">
  按钮文字
</Button>

// 次要按钮 - 使用背景色
<Button variant="outline" className="h-10 px-4 bg-accent 
                                     hover:bg-muted rounded-lg 
                                     font-medium text-sm">
  按钮文字
</Button>

// 危险按钮
<Button variant="destructive" className="h-10 px-4 rounded-lg 
                                          font-medium text-sm">
  删除
</Button>
```

### 输入框

```tsx
// 默认无边框
<Input className="h-10 px-3 bg-background rounded-lg text-sm 
                  focus:ring-2 focus:ring-primary/20 focus:border-primary" />

// 带边框的输入框（仅在需要明确边界时）
<Input className="h-10 px-3 border border-input rounded-lg text-sm" />
```

### 卡片

```tsx
// 默认无边框、无阴影
<Card className="bg-card rounded-xl py-5">
  {/* 内容 */}
</Card>

// 悬浮态卡片
<Card className="bg-card rounded-xl py-5 hover:shadow-md transition-shadow">
  {/* 内容 */}
</Card>

// 无边框卡片
<Card className="bg-card rounded-xl py-5 shadow-sm">
  {/* 内容 */}
</Card>
```

### 标签

```tsx
<Badge className="px-2.5 py-0.5 text-xs rounded-md font-medium 
                  bg-muted text-muted-foreground">
  标签
</Badge>
```

---

## 8. 前台页面规范

### 布局原则

```
┌─────────────────────────────────────────────────────┐
│  侧边栏 (w-60, 右侧分隔线)                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  主内容区                                           │
│  ├── max-w-7xl (全宽展示)                          │
│  ├── max-w-4xl (详情页居中)                         │
│  └── px-6 py-8 (页面内边距)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 页面结构

```tsx
// 列表页
<div className="space-y-6">
  {/* 页面标题 */}
  <div>
    <h1 className="text-2xl font-semibold">标题</h1>
    <p className="text-sm text-muted-foreground">描述</p>
  </div>
  
  {/* 内容区 - 使用间距而非线条 */}
  <div className="grid grid-cols-2 gap-4">
    {/* 卡片 - 默认无边框 */}
  </div>
</div>
```

### 详情页

```tsx
// 详情页居中
<div className="max-w-4xl mx-auto px-6 py-8">
  {/* 内容 */}
</div>
```

---

## 9. 后台页面规范

### 布局

```
┌──────────┬────────────────────────────────────────┐
│          │  页面标题                               │
│  侧边栏  │─────────────────────────────────────────│
│  (固定)  │                                         │
│          │  主内容区                               │
│          │                                         │
└──────────┴────────────────────────────────────────┘
```

### 页面结构

```tsx
<div className="space-y-6">
  <div>
    <h2 className="text-2xl font-semibold">页面标题</h2>
    <p className="text-sm text-muted-foreground">页面描述</p>
  </div>
  
  <Card>
    <CardContent className="p-6">
      {/* 内容 */}
    </CardContent>
  </Card>
</div>
```

---

## 10. 动效规范

### 时长

| 类型 | 时长 | 用途 |
|------|------|------|
| 微交互 | 150ms | hover、点击反馈 |
| 展开 | 200ms | 下拉、展开 |
| 弹窗 | 250ms | 弹窗动画 |
| 页面 | 300ms | 页面切换 |

### 缓动函数

```css
transition: all 150ms ease-out;
transition: all 200ms ease-out;
```

### 动效原则

```
✅ 使用动效:
- hover 状态反馈
- 加载状态
- 弹窗出现

❌ 不使用动效:
- 页面布局变化
- 频繁更新的数据
- 静态内容
```

---

## 11. 字体系统

### 字体家族

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 字号

| 元素 | 大小 | 字重 | 行高 |
|------|------|------|------|
| H1 | 32px | 600 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| H3 | 18px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.5 |
| Caption | 11px | 500 | 1.4 |

---

## 12. 检查清单

### 视觉质量
- [x] 无边框的卡片（默认状态）
- [x] 仅在必要时使用线条分隔
- [x] 使用间距而非线条分隔内容
- [x] 悬浮态使用阴影而非边框
- [x] 侧边栏仅右侧有分隔线

### 交互
- [x] 所有可点击元素有 `cursor-pointer`
- [x] hover 状态有视觉反馈
- [x] 过渡动画 150-300ms

### 一致性
- [x] 圆角统一 (8px/12px/16px)
- [x] 间距使用 4px 倍数
- [x] 阴影层级清晰

---

## 13. 核心决策总结

### 线条决策

| 元素 | 决策 | 原因 |
|------|------|------|
| 卡片边框 | ❌ 无 | 减少视觉噪音 |
| 页面分隔 | ❌ 无 | 使用间距 |
| 侧边栏分隔 | ✅ 有 | 明确区分区域 |
| 输入框边框 | ❌ 无(默认) | 仅 focus 时显示 |
| 按钮边框 | ❌ 无 | 使用背景色 |
| 表格边框 | ❌ 无 | 使用背景色区分 |

### 设计目标

> **像苹果、特斯拉、谷歌一样：**
> - 大量留白
> - 极简线条
> - 精致的阴影
> - 统一的设计语言
