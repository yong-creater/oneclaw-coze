# OneClaw 设计规范

## 概述

本文档定义了 OneClaw 网站的前台和后台两套 UI 设计规范，确保每个元素之间的间距、配色、圆角、点击反馈、异常提示等都高度统一。

---

## 一、前台页面设计规范 (Frontend)

### 1.1 配色系统

| 用途 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| 主色 | 橙色 | #F97316 | orange-500 |
| 主色悬停 | 深橙 | #EA580C | orange-600 |
| 主色浅 | 浅橙 | #FED7AA | orange-100 |
| 背景色 | 极浅灰 | #FAFAFA | - |
| 次级背景 | 白 | #FFFFFF | white |
| 主文字 | 近黑 | #0F172A | slate-900 |
| 次级文字 | 灰 | #64748B | slate-500 |
| 边框色 | 浅灰 | #E2E8F0 | slate-200 |
| 成功色 | 绿 | #22C55E | green-500 |
| 警告色 | 琥珀 | #F59E0B | amber-500 |
| 错误色 | 红 | #EF4444 | red-500 |

### 1.2 间距系统

| 名称 | 值 | 用途 | Tailwind |
|------|-----|------|----------|
| xs | 4px | 紧凑元素间距 | `gap-1` |
| sm | 8px | 小组件内间距 | `gap-2` |
| md | 16px | 常规间距 | `gap-4` |
| lg | 24px | 区块间距 | `gap-6` |
| xl | 32px | 大区块间距 | `gap-8` |
| 2xl | 48px | 页面内大区块 | `gap-12` |

### 1.3 圆角系统

| 用途 | 圆角 | Tailwind |
|------|------|----------|
| 按钮 | 12px | `rounded-xl` |
| 输入框 | 12px | `rounded-xl` |
| 卡片 | 16px | `rounded-2xl` |
| 头像 | 50% | `rounded-full` |
| 徽章 | 8px | `rounded-lg` |
| 小组件 | 12px | `rounded-xl` |

### 1.4 阴影系统

| 用途 | 阴影 | Tailwind |
|------|------|----------|
| 卡片 | 0 1px 3px rgba(0,0,0,0.1) | `shadow-sm` |
| 悬浮 | 0 4px 6px rgba(0,0,0,0.1) | `shadow-md` |
| 弹窗 | 0 20px 25px rgba(0,0,0,0.1) | `shadow-xl` |
| 主按钮 | 0 4px 14px rgba(249,115,22,0.3) | 自定义 |

### 1.5 动画规范

| 类型 | 时长 | Easing | Tailwind |
|------|------|--------|----------|
| 微交互 | 150ms | ease-out | `duration-150` |
| 常规过渡 | 200ms | ease-out | `duration-200` |
| 悬浮效果 | 300ms | ease-out | `duration-300` |
| 页面过渡 | 300-400ms | ease-out | `duration-300` |

### 1.6 交互状态

#### 按钮状态
- **默认**: `bg-slate-900 text-white`
- **悬停**: `hover:bg-slate-800`
- **点击**: `active:scale-95`
- **禁用**: `opacity-50 cursor-not-allowed`
- **加载**: 显示 spinner + `disabled`

#### 卡片悬浮
```tsx
hover:shadow-lg hover:border-slate-300 transition-all duration-200
```

#### 输入框状态
- **默认**: `border-slate-200 bg-white`
- **聚焦**: `focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500`
- **错误**: `border-red-500 focus:ring-red-500/20`

### 1.7 空状态

```tsx
<div className="text-center py-20">
  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
    <Icon className="w-10 h-10 text-slate-400" />
  </div>
  <h3 className="text-xl font-semibold text-slate-900 mb-2">标题</h3>
  <p className="text-slate-500 mb-6">描述</p>
  <Button>操作按钮</Button>
</div>
```

### 1.8 加载状态

- 使用 `Loader2` 图标 + `animate-spin`
- 卡片网格: 显示 4-8 个 `Skeleton` 占位符
- 列表: 每行一个 `Skeleton` 占位符

### 1.9 异常提示

#### Toast 提示 (临时)
- 成功: `bg-green-500 text-white`
- 错误: `bg-red-500 text-white`
- 自动消失: 3-5秒

#### 内联错误
- 输入框下方: `text-sm text-red-500 mt-1`
- 表单错误: `p-3 bg-red-50 border border-red-200 rounded-xl text-red-600`

---

## 二、后台管理设计规范 (Admin)

### 2.1 配色系统

| 用途 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| 背景色 | 极浅灰 | #FAFAFA | - |
| 卡片背景 | 白 | #FFFFFF | white |
| 侧边栏 | 白 | #FFFFFF | white |
| 边框色 | 浅灰 | #E2E8F0 | slate-200 |
| 主文字 | 近黑 | #0F172A | slate-900 |
| 次级文字 | 灰 | #64748B | slate-500 |
| 主色调 | 橙色 | #F97316 | orange-500 |
| 悬停背景 | 浅灰 | #F8FAFC | slate-50 |
| 活跃项背景 | 近黑 | #0F172A | slate-900 |
| 活跃项文字 | 白 | #FFFFFF | white |

### 2.2 间距与布局

| 项目 | 值 |
|------|-----|
| 侧边栏宽度 | 260px |
| 侧边栏内边距 | 12px (p-3) |
| 菜单项间距 | 4px (space-y-0.5) |
| 顶部栏高度 | 64px (h-16) |
| 内容区内边距 | 32px (p-8) |
| 卡片间距 | 16px (gap-4) |

### 2.3 圆角

| 用途 | 圆角 | Tailwind |
|------|------|----------|
| 按钮 | 12px | `rounded-xl` |
| 卡片 | 12px | `rounded-xl` |
| 输入框 | 12px | `rounded-xl` |
| 图标容器 | 10px | `rounded-xl` |
| 小徽章 | 8px | `rounded-lg` |

### 2.4 侧边栏菜单规范

```tsx
{/* 菜单项结构 */}
<Link
  href={href}
  className={`
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
    transition-all duration-200
    ${isActive 
      ? 'bg-slate-900 text-white' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }
  `}
>
  <Icon className="w-5 h-5" />
  <span>{name}</span>
</Link>
```

### 2.5 卡片组件规范

```tsx
<Card className="bg-white border-slate-200">
  <CardContent className="p-6">
    {/* 内容 */}
  </CardContent>
</Card>
```

#### 卡片悬浮状态
```tsx
hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer
```

### 2.6 表格列表规范

```tsx
<Card className="bg-white border-slate-200 overflow-hidden">
  <CardContent className="p-0">
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
        >
          {/* 内容 */}
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### 2.7 分页组件规范

```tsx
<div className="flex items-center justify-center gap-4">
  <Button variant="outline" size="sm" disabled={page === 1}>
    上一页
  </Button>
  <span className="text-sm text-slate-500">
    第 {page} / {totalPages} 页
  </span>
  <Button variant="outline" size="sm" disabled={page >= totalPages}>
    下一页
  </Button>
</div>
```

### 2.8 对话框规范

```tsx
<Dialog open={!!item} onOpenChange={() => setItem(null)}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-slate-900">标题</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      {/* 表单内容 */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setItem(null)}>取消</Button>
      <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800">保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 2.9 按钮组件规范

| 类型 | 样式 | 用途 |
|------|------|------|
| 主要按钮 | `bg-slate-900 hover:bg-slate-800 text-white` | 保存、提交 |
| 次要按钮 | `bg-white border-slate-200 hover:bg-slate-50` | 取消、返回 |
| 危险按钮 | `bg-red-500 hover:bg-red-600 text-white` | 删除 |
| 幽灵按钮 | `text-slate-500 hover:text-slate-900 hover:bg-slate-100` | 操作按钮 |

### 2.10 统计卡片规范

```tsx
<Card className="bg-white border-slate-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 三、全局交互规范

### 3.1 按钮点击反馈

```tsx
// 禁用状态
<Button disabled={loading} className="opacity-50 cursor-not-allowed">
  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  按钮文字
</Button>
```

### 3.2 表单验证反馈

```tsx
// 输入框错误状态
<div className="space-y-1">
  <Input 
    className={errors.field ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'} 
  />
  {errors.field && (
    <p className="text-sm text-red-500">{errors.field}</p>
  )}
</div>
```

### 3.3 删除确认

```tsx
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除吗？此操作不可撤销。')) return;
  // 执行删除
};
```

### 3.4 Toast 通知

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "成功",
  description: "操作已完成",
  variant: "default", // 或 "destructive"
});
```

---

## 四、页面模板

### 4.1 前台页面结构

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="页面标题" subtitle="副标题" />
        <div className="p-8">
          {/* 页面内容 */}
        </div>
        <div className={`${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Footer />
        </div>
      </main>
    </div>
  );
}
```

### 4.2 后台页面结构

```tsx
export default function Page() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">标题</h1>
          <p className="text-sm text-slate-500 mt-1">描述</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加
        </Button>
      </div>

      {/* 搜索/筛选 */}
      <div className="flex items-center gap-4">
        <Input placeholder="搜索..." className="max-w-md bg-white border-slate-200" />
      </div>

      {/* 内容区域 */}
      {/* ... */}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {/* 分页组件 */}
        </div>
      )}
    </div>
  );
}
```

---

## 五、字体系统

| 用途 | 字体 | 字号 |
|------|------|------|
| 页面标题 | Plus Jakarta Sans | 24px (text-2xl) |
| 副标题 | Plus Jakarta Sans | 20px (text-xl) |
| 卡片标题 | Inter | 18px (text-lg) |
| 正文 | Inter | 16px (text-base) |
| 辅助文字 | Inter | 14px (text-sm) |
| 小标签 | Inter | 12px (text-xs) |

---

## 六、无障碍规范

1. **颜色对比度**: 文本与背景对比度 ≥ 4.5:1
2. **焦点状态**: 所有交互元素有可见焦点指示器 `focus:ring-2 focus:ring-orange-500`
3. **触摸目标**: 最小 44x44px
4. **ARIA 标签**: 图标按钮添加 `aria-label`
5. **跳过链接**: 主要内容区添加 skip link
