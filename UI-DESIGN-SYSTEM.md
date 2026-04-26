# OneClaw UI Design System
# 设计规范 - 对标苹果、特斯拉、谷歌

## 设计哲学

参考苹果(Apple)、特斯拉(Tesla)、谷歌(Google)的设计语言：
- **极简主义**：Less is More，减少视觉噪音
- **内容优先**：让内容成为焦点，UI退居幕后
- **精致细节**：每个像素都经过推敲
- **一致性**：全站统一的视觉语言

---

## 1. 色彩系统

### 主色调 (Primary)
```
--primary:       #2563EB  /* 谷歌蓝 - 主品牌色 */
--primary-light: #3B82F6  /* 浅蓝 - hover状态 */
--primary-dark:  #1D4ED8  /* 深蓝 - 按下状态 */
```

###  нейтральные 色调 (Neutral)
```
--foreground:    #0A0A0A  /* 纯黑 - 主文字 */
--muted:         #71717A  /* 灰色 - 次要文字 */
--muted-light:   #A1A1AA  /* 浅灰 - 占位符 */
--border:        #E4E4E7  /* 边框线 */
--border-light:  #F4F4F5  /* 浅边框 */
--background:    #FFFFFF  /* 纯白背景 */
--card:          #FAFAFA  /* 卡片背景 */
```

### 功能色 (Functional)
```
--success:       #16A34A  /* 成功绿 */
--warning:       #CA8A04  /* 警告黄 */
--error:         #DC2626  /* 错误红 */
--info:          #0284C7  /* 信息蓝 */
```

### 深色模式
```
--foreground-dark:  #FAFAFA  /* 浅色文字 */
--background-dark:  #09090B  /* 深色背景 */
--card-dark:        #18181B  /* 深色卡片 */
--border-dark:     #27272A  /* 深色边框 */
```

---

## 2. 字体系统

### 字体家族
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 字号规范
| 元素 | 大小 | 字重 | 行高 |
|------|------|------|------|
| H1 | 32px | 600 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| H3 | 18px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.5 |
| Caption | 11px | 500 | 1.4 |

---

## 3. 间距系统

### 基础单位：4px

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 紧凑元素 |
| sm | 8px | 小间距 |
| md | 12px | 默认间距 |
| lg | 16px | 大间距 |
| xl | 24px | 区块间距 |
| 2xl | 32px | 区块间距 |
| 3xl | 48px | 大区块 |

---

## 4. 圆角系统

### 统一圆角 - 简洁精致

| 组件 | 圆角 |
|------|------|
| 按钮 | 8px |
| 卡片 | 12px |
| 输入框 | 8px |
| 弹窗 | 16px |
| 头像 | 9999px (圆形) |
| Logo容器 | 10px |

**原则**：避免过大圆角，保持精致感

---

## 5. 阴影系统

### 柔和阴影 - 苹果风格

```css
/* 浅阴影 - 默认卡片 */
shadow-sm: 0 1px 2px rgba(0,0,0,0.04);

/* 中阴影 - 悬浮卡片 */
shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03);

/* 深阴影 - 弹窗 */
shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);

/* 悬浮阴影 - 交互反馈 */
shadow-hover: 0 8px 25px -5px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
```

---

## 6. 动效规范

### 微交互 - 精致流畅

| 动效类型 | 时长 | 缓动函数 |
|----------|------|----------|
| Hover | 150ms | ease-out |
| 展开 | 200ms | ease-out |
| 弹窗 | 250ms | ease-out |
| 页面切换 | 300ms | ease-in-out |

### 动效原则
- 动效应增强用户体验，不应分散注意力
- 使用 `transform` 和 `opacity` 实现性能优化
- 尊重用户偏好设置 `prefers-reduced-motion`

---

## 7. 组件规范

### 按钮

```tsx
// 主要按钮
<Button className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-medium text-sm shadow-sm">
  按钮文字
</Button>

// 次要按钮
<Button variant="outline" className="h-10 px-4 border-border hover:bg-muted rounded-lg font-medium text-sm">
  按钮文字
</Button>

// 危险按钮
<Button variant="destructive" className="h-10 px-4 rounded-lg font-medium text-sm">
  删除
</Button>
```

### 输入框

```tsx
<Input className="h-10 px-3 bg-white border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
```

### 卡片

```tsx
<Card className="bg-white border border-border rounded-xl p-5 hover:shadow-hover transition-shadow duration-200">
  {/* 内容 */}
</Card>
```

### 标签

```tsx
<Badge variant="secondary" className="px-2.5 py-0.5 text-xs rounded-md font-medium">
  标签
</Badge>
```

---

## 8. 前台页面规范

### 布局
- 最大宽度: `max-w-7xl`
- 页面内边距: `px-6`
- 区块间距: `space-y-8`

### 详情页
- 最大宽度: `max-w-4xl mx-auto`
- 内容居中对齐

### 列表页
- 网格布局: `grid grid-cols-6 gap-3` (AI工具库)
- 列表布局: 垂直堆叠

---

## 9. 后台页面规范

### 布局
- 侧边栏固定宽度: `w-64`
- 主内容区无最大宽度限制

### 页面结构
```tsx
<div className="space-y-6">
  <div>
    <h2 className="text-2xl font-semibold">页面标题</h2>
    <p className="text-sm text-muted-foreground">页面描述</p>
  </div>
  {/* 内容 */}
</div>
```

---

## 10. 设计检查清单

### 视觉质量
- [ ] 无表情符号作为图标
- [ ] 所有图标来自统一图标库 (Lucide)
- [ ] 悬浮状态不导致布局偏移
- [ ] 使用主题色而非硬编码颜色

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 悬浮状态有清晰的视觉反馈
- [ ] 过渡动画流畅 (150-300ms)

### 深色模式
- [ ] 浅色模式文字对比度 ≥ 4.5:1
- [ ] 两种模式边框都可见
- [ ] 两种模式都经过测试

### 响应式
- [ ] 375px (手机)
- [ ] 768px (平板)
- [ ] 1024px (桌面)
- [ ] 1440px (大屏)
