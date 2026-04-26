# OneClaw UI 设计规范 v3.0

基于苹果/谷歌设计语言的极简国际化风格。

## 设计原则

1. **极简克制** - 少即是多，删除不必要的装饰
2. **留白呼吸** - 大量留白，内容聚焦
3. **统一一致** - 全站统一的设计系统
4. **功能优先** - 形式服务于功能

---

## 色彩系统

### 主色调
| 用途 | 色值 | Tailwind |
|------|------|----------|
| 主题色 | #1A1A1A | `black` |
| 次要背景 | #F5F5F7 | `secondary` (#F5F5F7) |
| 主文本 | #1D1D1F | `foreground` |
| 次要文本 | #86868B | `muted-foreground` |
| 分隔线 | #D2D2D7 | `border` (#D2D2D7) |
| 输入框边框 | #E5E5E5 | `input` (#E5E5E5) |

### 功能色
| 用途 | 颜色 | Tailwind |
|------|------|----------|
| 免费 | Emerald-500 | `emerald-500` |
| 付费 | Rose-500 | `rose-500` |
| 热门/推荐 | Amber-500 | `amber-500` |
| 官方认证 | Emerald-500 | `emerald-500` |

### 深色模式
| 用途 | 色值 | Tailwind |
|------|------|----------|
| 背景 | #000000 | `background` |
| 次要背景 | #1C1C1E | `secondary` (#1C1C1E) |
| 卡片背景 | #2C2C2E | `bg-slate-800` |
| 边框 | #38383A | `border` (#38383A) |

---

## 圆角系统

| 元素 | 圆角 | Tailwind |
|------|------|----------|
| 按钮 | 8px | `rounded-lg` |
| 卡片 | 12px | `rounded-xl` |
| 输入框 | 8px | `rounded-lg` |
| Logo容器 | 12px | `rounded-xl` |
| 头像 | 圆形 | `rounded-full` |

---

## 间距系统

| 用途 | 值 | Tailwind |
|------|------|----------|
| 页面大间距 | 32px | `space-y-8` |
| 卡片间距 | 16px | `gap-4` |
| 元素间距 | 8px | `gap-2` |
| 卡片内边距 | 20px | `p-5` |
| 页面内边距 | 24px | `px-6 py-8` |

---

## 阴影系统

### 卡片阴影
```tsx
// 基础卡片 - 无阴影，极简风格
<Card className="bg-secondary hover:bg-accent transition-colors" />

// Logo容器
<div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center" />
```

### 按钮阴影
```tsx
// 主按钮 - 轻微阴影
<Button className="shadow-sm">主要操作</Button>

// 次要按钮 - 无阴影
<Button variant="outline">次要操作</Button>
```

---

## 字体系统

| 用途 | 大小 | 字重 | Tailwind |
|------|------|------|----------|
| 页面标题 | 24px | 600 | `text-2xl font-semibold` |
| 卡片标题 | 16px | 600 | `font-semibold` |
| 正文 | 14px | 400 | `text-sm` |
| 辅助文字 | 12px | 400 | `text-xs text-muted-foreground` |
| 大标题 | 30px | 600 | `text-3xl font-semibold tracking-tight` |

---

## 组件规范

### 按钮样式
```tsx
// 主要按钮 - 黑色填充
<Button className="bg-black text-white hover:bg-black/90">
  确认
</Button>

// 次要按钮 - 灰色背景
<Button variant="outline">
  取消
</Button>

// 危险按钮
<Button variant="destructive">
  删除
</Button>
```

### 输入框样式
```tsx
// 标准输入框
<Input 
  className="h-10 pl-10"  // 带左侧图标
  placeholder="搜索..."
/>

// 搜索框 - 带图标
<div className="relative">
  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" />
  <Input className="pl-9" />
</div>
```

### 卡片样式
```tsx
// 工具卡片 - 网格视图
<a className="p-5 rounded-xl bg-secondary hover:bg-accent transition-colors">
  {/* Logo */}
  <img className="w-10 h-10 rounded-lg object-cover bg-background" />
  {/* 内容 */}
  <h3 className="font-semibold text-sm">工具名称</h3>
  <p className="text-xs text-muted-foreground">亮点描述</p>
  {/* 底部 */}
  <Badge variant="outline">{tool.free_type}</Badge>
</a>
```

### 分类筛选
```tsx
// 胶囊式筛选按钮
<button className={cn(
  'px-3 py-1.5 rounded-lg text-sm transition-colors',
  active 
    ? 'bg-black text-white'  // 选中状态
    : 'bg-secondary hover:bg-accent'  // 默认状态
)}>
  分类名称
</button>
```

---

## 布局规范

### 侧边栏 (Sidebar)
- 宽度: 220px
- 高度: 100vh 固定
- 背景: 白色 (深色模式: #1C1C1E)
- 边框: 右侧分隔线 `border-r border-border`
- 导航项: 居中对齐
- 选中状态: 背景色 `bg-primary/10` + 文字 `text-primary`

### 页面宽度
| 页面类型 | 宽度 | Tailwind |
|----------|------|----------|
| 首页搜索区 | max-w-lg | 居中展示 |
| 列表页 | max-w-7xl | 全宽展示 |
| 详情页 | max-w-4xl | 居中展示 |

### 网格布局
| 屏幕 | 列数 | Tailwind |
|------|------|----------|
| 手机 | 1列 | `grid-cols-1` |
| 小屏 | 2列 | `sm:grid-cols-2` |
| 中屏 | 3列 | `lg:grid-cols-3` |
| 大屏 | 4列 | `xl:grid-cols-4` |
| 超大屏 | 6列 | `2xl:grid-cols-6` |

---

## 线条使用规范

### 允许使用的场景
1. **侧边栏分隔** - 右侧边框 `border-r border-border`
2. **卡片边框** - 统一使用 `border-border`

### 禁止使用的场景
1. 页面内的水平分隔线
2. 内容区块之间的分隔线
3. 表单内部的线条

---

## 前台专用组件

| 组件 | 用途 |
|------|------|
| `Sidebar` | 侧边栏导航 |
| `BackToHome` | 返回首页按钮 |
| `WechatPromo` | 公众号推广 |

---

## 后台禁止事项

| 禁止项 | 说明 |
|--------|------|
| `AnimatedLobster` | 禁止前台组件 |
| `BackToHome` | 禁止前台组件 |
| `WechatPromo` | 禁止前台组件 |
| 独立 `<header>` | 禁止创建独立导航 |
| `min-h-screen` | 禁止全屏高度 |
| `<main>` 标签 | 禁止独立 main 标签 |

---

## 检查清单

### 开发自检
- [ ] 颜色使用 CSS 变量或 semantic tokens
- [ ] 圆角统一使用 `rounded-lg` (8px) 或 `rounded-xl` (12px)
- [ ] 卡片无阴影或仅 `shadow-sm`
- [ ] 按钮使用 `bg-black` 或 `bg-primary`
- [ ] 线条仅在侧边栏使用
- [ ] 间距使用 Tailwind 标准间距

### UI 测试
- [ ] 深色模式正常显示
- [ ] 移动端响应式布局正常
- [ ] 动画过渡流畅
- [ ] 无控制台错误

---

## 更新记录

### v3.0 (2026-04)
- 基于苹果/谷歌设计语言重写
- 极简风格，强调留白和克制
- 统一圆角为 8px/12px
- 黑色主题色替代蓝色
- 移除多余阴影和装饰线条
