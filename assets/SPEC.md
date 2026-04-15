# TestCraft - AI 测试用例生成平台

## 一、项目概述

**项目名称**: TestCraft
**项目类型**: AI 驱动的测试用例自动生成与管理平台
**核心功能**: 从需求文档、链接、附件生成标准化测试用例，支持需求管理、用例管理、数据导出

---

## 二、页面布局结构

### 整体布局
```
┌─────────────────────────────────────────────────────────────────────┐
│  Header（固定顶部）                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Logo  │ 拆分需求按钮 │ 生成测试用例按钮 │ 统计 │ 导出下拉 │ 清除 ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│  Main Content（flex 布局，PC端左右分栏）                              │
│  ┌──────────────────┬──────────────────────────────────────────────┐│
│  │  Left Column     │  Right Column                                ││
│  │  (固定宽度380px) │  (flex-1)                                    ││
│  │                  │  ┌────────────────┬─────────────────────────┐││
│  │  ┌────────────┐  │  │ 需求点列表    │  用例详情（固定宽度520px）│││
│  │  │ 需求标题   │  │  │ (可切换视图)  │                         │││
│  │  ├────────────┤  │  │               │  ┌─────────────────────┐│││
│  │  │ 所属模块   │  │  │ 视图模式切换  │  │ 场景标题 + 优先级    │││
│  │  ├────────────┤  │  │ [列表] [导图]  │  ├─────────────────────┤││
│  │  │ AI 模型    │  │  │               │  │ Given (前置条件)     │││
│  │  ├────────────┤  │  │ 需求点1       │  ├─────────────────────┤││
│  │  │ 需求描述   │  │  │   用例1       │  │ When (操作步骤)      │││
│  │  ├────────────┤  │  │   用例2       │  ├─────────────────────┤││
│  │  │ 已解析内容 │  │  │ 需求点2       │  │ Then (预期结果)      │││
│  │  ├────────────┤  │  │   用例3       │  ├─────────────────────┤││
│  │  │ 上传文件   │  │  │               │  │ 执行要点提示         │││
│  │  ├────────────┤  │  └────────────────┴─────────────────────────┘││
│  │  │ 粘贴链接   │  │                                              ││
│  │  └────────────┘  │                                              ││
│  └──────────────────┴──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 移动端布局
- 单列布局，左侧表单区域堆叠在右侧内容区上方
- Header 按钮在移动端简化显示（隐藏文字只显示图标）
- 用例详情在移动端为全宽卡片

---

## 三、Header 区域设计

### 布局说明
```jsx
// 整体结构
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
  <div className="px-4 py-4">
    <div className="flex items-center justify-between gap-4">
      // 左侧：Logo + 标题
      // 右侧：功能按钮组
    </div>
  </div>
</header>
```

### 左侧 Logo 区域
```jsx
<div className="flex items-center gap-3">
  <div className="relative">
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 
                    flex items-center justify-center shadow-lg shadow-purple-500/20">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 
                    rounded-2xl blur opacity-30 -z-10" />
  </div>
  <div>
    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">TestCraft</h1>
    <p className="text-xs text-gray-500">AI 生成测试用例</p>
  </div>
</div>
```

### 右侧按钮组
```jsx
<div className="flex items-center gap-3">
  {/* 拆分需求按钮 */}
  <Button className="h-10 px-4 bg-gradient-to-r from-violet-600 to-purple-600 
                     hover:from-violet-700 hover:to-purple-700 text-white rounded-xl 
                     gap-2 shadow-lg shadow-purple-500/25">
    <Sparkles className="w-4 h-4" />
    <span>拆分需求</span>
  </Button>
  
  {/* 生成测试用例按钮 */}
  <Button className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
    <Zap className="w-4 h-4" />
    <span>生成测试用例</span>
  </Button>
  
  {/* 统计信息（仅桌面端） */}
  <div className="hidden md:flex items-center gap-4 text-sm">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-violet-500" />
      <span>3 需求点</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span>15 测试用例</span>
    </div>
  </div>
  
  {/* 导出下拉菜单 */}
  <Select>
    <SelectTrigger className="h-10 px-4 gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border-0">
      <Download className="w-4 h-4" />
      <span>导出</span>
      <ChevronDown className="w-3 h-3" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="xmind">导出为 XMind</SelectItem>
      <SelectItem value="excel">导出为 Excel</SelectItem>
      <SelectItem value="csv">导出为 CSV</SelectItem>
    </SelectContent>
  </Select>
  
  {/* 清除按钮 */}
  <Button variant="outline" className="h-10 px-4 gap-2 border-gray-200 rounded-xl 
                                        text-gray-600 hover:text-red-600 
                                        hover:border-red-200 hover:bg-red-50">
    <Trash2 className="w-4 h-4" />
    <span>清除</span>
  </Button>
</div>
```

### 按钮设计规范
| 按钮 | 样式 | 禁用条件 |
|------|------|----------|
| 拆分需求 | 渐变紫 from-violet-600 to-purple-600 | 未填写标题或内容 |
| 生成测试用例 | 绿色 bg-emerald-600 | 全部已生成或无需求点 |
| 导出 | 深灰 bg-gray-900 | 无数据时隐藏 |
| 清除 | outline | 无数据时隐藏 |

---

## 四、左侧表单区域（输入区）

### 卡片容器
```jsx
<Card className="bg-white border border-gray-200/80 rounded-2xl 
                 shadow-sm shadow-gray-200/50 overflow-hidden 
                 lg:sticky lg:top-28">
  <div className="p-4 md:p-6">
    {/* 表单内容 */}
  </div>
</Card>
```

### 表单项详细设计

#### 1. 需求标题（必填）
```jsx
<div className="mb-6">
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
    需求标题
  </label>
  <Input 
    type="text"
    placeholder="输入需求标题"
    className="h-11 bg-gray-50/50 border-gray-200 rounded-xl 
               focus:bg-white transition-colors 
               text-lg font-medium text-gray-900"
  />
</div>
```

#### 2. 所属模块 & AI 模型
```jsx
<div className="space-y-4 mb-6">
  {/* 所属模块 */}
  <div>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
      所属模块
    </label>
    <Select value={module} onValueChange={setModule}>
      <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-xl">
        <SelectValue placeholder="请选择模块" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="星链">星链</SelectItem>
        <SelectItem value="C端APP">C端APP</SelectItem>
        <SelectItem value="工作手机">工作手机</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  {/* AI 模型 */}
  <div>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
      AI 模型
    </label>
    <Select value={aiModel} onValueChange={setAiModel}>
      <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-xl">
        <SelectValue placeholder="请选择AI模型" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="doubao-seed-2-0-pro-260215">豆包 Seed 2.0 Pro（推荐）</SelectItem>
        <SelectItem value="doubao-seed-2-0-lite">豆包 Seed 2.0 Lite</SelectItem>
        <SelectItem value="doubao-pro-4k">豆包 Pro 4K</SelectItem>
        <SelectItem value="doubao-lite-4k">豆包 Lite 4K</SelectItem>
        <SelectItem value="deepseek-v3.2">DeepSeek V3.2</SelectItem>
        <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
        <SelectItem value="glm-4.7">GLM-4.7</SelectItem>
        <SelectItem value="glm-4">GLM-4</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

#### 3. 需求描述
```jsx
<div className="mb-4">
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
    需求描述
  </label>
  <Textarea 
    placeholder="详细描述你的需求，或上传文件/粘贴链接自动解析..."
    className="min-h-[120px] bg-gray-50/50 border-gray-200 rounded-xl 
               focus:bg-white resize-none transition-colors"
    value={requirementContent}
    onChange={(e) => setRequirementContent(e.target.value)}
  />
</div>
```

#### 4. 已解析内容预览区（条件显示）
```jsx
{parsedContent.length > 0 && (
  <div className="mb-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 
                  border border-violet-100 rounded-xl">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <label className="text-xs font-medium text-violet-700 uppercase tracking-wider">
          已解析内容
        </label>
        <Badge variant="secondary" className="rounded-full bg-violet-100 text-violet-700 text-xs">
          {parsedContent.length} 个来源
        </Badge>
      </div>
      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-violet-600 
                                                   hover:text-violet-700 hover:bg-violet-100">
        <Merge className="w-3 h-3" />
        合并到需求描述
      </Button>
    </div>
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {parsedContent.map((p) => (
        <div key={p.id} className="bg-white/60 rounded-lg p-3 border border-violet-100/50">
          <div className="flex items-center gap-2 mb-2">
            {p.source === 'file' ? (
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700 truncate flex-1">{p.name}</span>
            <span className="text-xs text-gray-400">{p.content.length} 字</span>
            <button onClick={() => removeParsedContent(p.id)}>
              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>
          </div>
          <p className="text-xs text-gray-600 line-clamp-4 whitespace-pre-wrap">
            {p.content.slice(0, 500)}{p.content.length > 500 && '...'}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

#### 5. 上传文件
```jsx
<div className="mb-6">
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
    上传文件
  </label>
  <input ref={fileInputRef} type="file" className="hidden" 
         accept=".pdf,.doc,.docx,.html,.htm,.txt,.md,image/*" 
         onChange={handleFileSelect} />
  <Button variant="outline" className="gap-2 border-gray-200 rounded-xl h-10 px-4 
                                       bg-gray-50/30 hover:bg-gray-100 w-full justify-start"
          onClick={() => fileInputRef.current?.click()}>
    <Paperclip className="w-4 h-4 text-gray-400" />
    <span className="text-sm text-gray-600">添加文件（PDF/Word/HTML）</span>
  </Button>
  {attachments.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map(a => (
        <span key={a.id} className="inline-flex items-center gap-2 px-3 py-1.5 
                                     bg-gray-100 rounded-full text-sm text-gray-700">
          {a.parsing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /> : 
           a.parsed ? <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> : 
           <FileX className="w-3.5 h-3.5 text-gray-400" />}
          <span className="max-w-[150px] truncate">{a.name}</span>
          {a.parsed && <span className="text-xs text-emerald-600">(已解析)</span>}
          {a.parsing && <span className="text-xs text-amber-600">(解析中...)</span>}
          <button onClick={() => removeAttachment(a.id)}>
            <X className="w-3.5 h-3.5 hover:text-red-500" />
          </button>
        </span>
      ))}
    </div>
  )}
</div>
```

#### 6. 粘贴链接
```jsx
<div className="mb-6">
  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
    粘贴链接
  </label>
  <div className="flex gap-2">
    <Input 
      placeholder="输入需求文档链接地址..."
      className="h-10 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white flex-1"
      value={linkInput}
      onChange={(e) => setLinkInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
    />
    <Button variant="outline" className="h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-100"
            onClick={handleFetchUrl} disabled={!linkInput.trim() || isFetchingUrl}>
      {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : '抓取'}
    </Button>
  </div>
  {links.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map(link => (
        <span key={link.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm 
                                        ${link.warning ? 'bg-amber-50 border border-amber-200' : 'bg-gray-100'}`}>
          {link.fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /> : 
           link.warning ? <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> :
           link.fetched && !link.error ? <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> : 
           link.error ? <FileX className="w-3.5 h-3.5 text-red-500" /> :
           <LinkIcon className="w-3.5 h-3.5 text-gray-400" />}
          <span className="max-w-[150px] truncate">{link.title || link.url}</span>
          {link.warning ? <span className="text-xs text-amber-600">(内容较少)</span> :
            link.fetched && <span className="text-xs text-emerald-600">(已抓取)</span> :
            link.fetching && <span className="text-xs text-amber-600">(抓取中...)</span> :
            link.error && <span className="text-xs text-red-500">(失败)</span>}
          <button onClick={() => removeLink(link.id)}>
            <X className="w-3.5 h-3.5 hover:text-red-500" />
          </button>
        </span>
      ))}
    </div>
  )}
  {/* 警告提示 */}
  {links.some(l => l.warning) && (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800">
          <p className="font-medium mb-1">部分链接无法自动抓取</p>
          <p>飞书、Notion 等在线文档平台需要登录或通过导出方式获取内容。建议：</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>将文档导出为 PDF/Word 后上传</li>
            <li>直接复制文档内容粘贴到需求描述中</li>
          </ul>
        </div>
      </div>
    </div>
  )}
</div>
```

---

## 五、右侧内容区域

### 整体结构
```jsx
<div className="flex-1 min-w-0">
  {isAnalyzing ? (
    /* 加载状态 */
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-3" />
      <p className="text-gray-500">正在分析需求...</p>
    </div>
  ) : mindMapRoot ? (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左侧：需求点列表 / 思维导图 */}
      <div className="flex-1 min-w-0">
        <Card>...</Card>
      </div>
      {/* 右侧：用例详情 */}
      <div className="xl:w-[520px] shrink-0">
        <Card>...</Card>
      </div>
    </div>
  ) : (
    /* 空状态 */
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Hourglass className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">待输入需求</h3>
      <p className="text-gray-400">左侧填写需求后自动展示</p>
    </div>
  )}
</div>
```

### 视图切换标签页
```jsx
<div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
  <button
    onClick={() => setViewMode('tree')}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      viewMode === 'tree'
        ? 'bg-white text-violet-700 shadow-sm'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <LayoutList className="w-4 h-4" />
    列表视图
  </button>
  <button
    onClick={() => setViewMode('mindmap')}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      viewMode === 'mindmap'
        ? 'bg-white text-violet-700 shadow-sm'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Network className="w-4 h-4" />
    思维导图
  </button>
</div>
```

---

## 六、列表视图（Tree View）

### 数据结构
```typescript
interface MindMapNode {
  id: string;
  type: 'root' | 'requirement' | 'testcase';
  title: string;
  description?: string;
  priority: '高' | '中' | '低' | 'P0' | 'P1' | 'P2';
  children: MindMapNode[];
  collapsed?: boolean;
  // 用例详情
  given?: string;
  when?: string;
  then?: string;
}
```

### 树节点渲染
```jsx
const renderTreeNode = (node: MindMapNode, level: number = 0, testCaseIndex: number = 0, requirementIndex: number = 0) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const isRoot = node.type === 'root';
  const isRequirement = node.type === 'requirement';
  const isTestCase = node.type === 'testcase';
  const isEditing = editingNodeId === node.id;
  const isGeneratingThis = generatingPointId === node.id;

  return (
    <div key={node.id} className="mb-2 group">
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer
          ${isTestCase ? 'hover:bg-gray-100' : ''}
          ${selectedTestCase?.id === node.id && isTestCase ? 'bg-violet-50 border border-violet-200' : ''}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => isTestCase && setSelectedTestCase(node)}
      >
        {/* 展开/折叠按钮 */}
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* 图标 */}
        {isRoot && <Sparkles className="w-4 h-4 text-violet-600" />}
        {isRequirement && <GitBranch className="w-4 h-4 text-blue-500" />}
        {isTestCase && <FileText className="w-4 h-4 text-gray-400" />}

        {/* 序号 */}
        {(isRequirement || isTestCase) && (
          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded min-w-[28px] text-center">
            {isTestCase ? testCaseIndex : requirementIndex}
          </span>
        )}

        {/* 标题 */}
        {isEditing ? (
          <input
            type="text"
            value={editingNodeTitle}
            onChange={(e) => setEditingNodeTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className={`flex-1 text-sm ${isRoot ? 'font-semibold text-gray-900' : isRequirement ? 'font-medium text-gray-700' : 'text-gray-600'}`}
            onDoubleClick={() => startEdit(node.id, node.title)}
          >
            {node.title}
          </span>
        )}

        {/* 优先级标签 */}
        {!isRoot && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(node.priority)}`}>
            {node.priority}
          </span>
        )}

        {/* 操作按钮 */}
        {!isRoot && (
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {isRequirement && (
              <>
                <button title="从知识库添加"><Library className="w-3 h-3" /></button>
                <button title="生成用例" onClick={(e) => { e.stopPropagation(); handleGenerate(node.id); }}>
                  {isGeneratingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                </button>
                <button title="编辑"><Edit2 className="w-3 h-3" /></button>
                <button title="删除" onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
            {isTestCase && (
              <>
                <button title="编辑"><Edit2 className="w-3 h-3" /></button>
                <button title="删除"><Trash2 className="w-3 h-3" /></button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 子节点 */}
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {node.children.map(child => renderTreeNode(child, level + 1))}
        </div>
      )}
    </div>
  );
};
```

### 列表样式示意
```
需求点1                                    [高]              [🔍] [⚡] [✏️] [🗑️]
├─ [1] 用例标题A                          [P0]
│   Given: 前置条件...
│   When: 操作步骤...
│   Then: 预期结果...
├─ [2] 用例标题B                          [P1]
└─ [3] 用例标题C                          [P2]

需求点2                                    [中]
├─ [4] 用例标题D                          [P0]
└─ ...
```

---

## 七、思维导图视图（MindMap View）

### 布局结构
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   需求标题   │────▶│   需求点1    │────▶│   用例1      │
│   (渐变背景) │     │   [高]       │     │   [P0]       │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                    │
                           │                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   需求点2    │────▶│   用例2      │
                     │   [中]       │     │   [P1]       │
                     └──────────────┘     └──────────────┘
```

### 节点尺寸配置
```typescript
const SIZES = {
  root: { width: 160, height: 52 },
  requirement: { width: 180, height: 48 },
  testcase: { width: 160, height: 40 },
};
const GAP_X = 60;  // 列间距
const GAP_Y = 12;  // 行间距
```

### 节点颜色样式
```typescript
// 根节点
{ bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500', text: 'text-white' }

// 需求点 - 高优先级
{ bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
// 需求点 - 中优先级
{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
// 需求点 - 低优先级
{ bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
```

### 思维导图组件实现
```tsx
function MindMapCanvas({ rootNode, initialExpandedNodes, selectedTestCase, onSelectCase, onSwitchView }) {
  const [expandedNodes, setExpandedNodes] = useState(() => new Set(initialExpandedNodes));
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // 切换展开状态
  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };
  
  // 计算布局
  const layout = useMemo(() => {
    // 计算每个节点的位置...
    // 返回 { nodes, totalWidth, totalHeight }
  }, [rootNode, expandedNodes]);
  
  // 生成连接线
  const connections = useMemo(() => {
    // 生成 SVG 路径...
  }, [layout]);
  
  // 滚轮缩放
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(s => Math.min(Math.max(s + delta, 0.3), 3));
  };
  
  // 拖拽平移
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 缩放控制栏 */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 
                      bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-1 border border-gray-100">
        <button onClick={() => setScale(s => Math.min(s + 0.1, 3))}>+</button>
        <span className="text-sm min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.max(s - 0.1, 0.3))}>−</button>
        <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}>重置</button>
      </div>
      
      {/* 画布 */}
      <div 
        className="w-full h-full overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg className="w-full h-full" style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }}>
          {/* 连接线 */}
          {connections.map(conn => (
            <path
              key={conn.key}
              d={generatePath(conn.from, conn.to)}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={2}
            />
          ))}
          
          {/* 节点 */}
          {layout.nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                width={node.width}
                height={node.height}
                rx={8}
                className={`${getNodeColors(node).bg} ${getNodeColors(node).border || ''} cursor-pointer`}
                onClick={() => node.node.type === 'testcase' ? onSelectCase(node.node) : toggleExpand(node.id)}
              />
              <text
                x={node.width / 2}
                y={node.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={getNodeColors(node).text}
                fontSize={12}
              >
                {node.node.title.slice(0, 15)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
```

---

## 八、用例详情面板

### 卡片容器
```jsx
<Card className="bg-white border border-gray-200/80 rounded-2xl p-4 lg:sticky lg:top-28">
  {selectedTestCase ? (
    <>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">用例详情</span>
        <button onClick={() => setSelectedTestCase(null)}>
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {renderTestCaseDetail()}
    </>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <FileText className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">点击左侧用例查看详情</p>
    </div>
  )}
</Card>
```

### BDD 格式详情渲染
```jsx
const renderTestCaseDetail = () => {
  const formatContent = (text) => {
    if (!text || text === '未提供前置条件') {
      return <span className="text-gray-400 italic">{text || '未提供'}</span>;
    }
    return text;
  };

  return (
    <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* 场景标题 */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 px-3 py-1">
            测试场景
          </Badge>
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(selectedTestCase.priority)}`}>
            {selectedTestCase.priority}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 leading-relaxed pr-2">
          {selectedTestCase.title}
        </h3>
      </div>

      {/* 分割线 */}
      <div className="border-t border-gray-100 shrink-0" />

      {/* Given - 前置条件 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 shrink-0">前置条件</Badge>
          <span className="text-xs text-gray-400">Given</span>
        </div>
        <div className="bg-emerald-50/70 rounded-xl px-4 py-3">
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
            {formatContent(selectedTestCase.given)}
          </pre>
        </div>
      </div>

      {/* When - 操作步骤 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-700 px-3 py-1 shrink-0">操作步骤</Badge>
          <span className="text-xs text-gray-400">When</span>
        </div>
        <div className="bg-amber-50/70 rounded-xl px-4 py-3">
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
            {formatContent(selectedTestCase.when)}
          </pre>
        </div>
      </div>

      {/* Then - 预期结果 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-rose-100 text-rose-700 px-3 py-1 shrink-0">预期结果</Badge>
          <span className="text-xs text-gray-400">Then</span>
        </div>
        <div className="bg-rose-50/70 rounded-xl px-4 py-3">
          <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
            {formatContent(selectedTestCase.then)}
          </pre>
        </div>
      </div>

      {/* 执行要点提示 */}
      <div className="bg-violet-50/50 rounded-xl px-4 py-3 border border-violet-100 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-violet-600">ℹ️</span>
          <span className="text-xs font-medium text-violet-700">执行要点</span>
        </div>
        <ul className="text-xs text-violet-600/80 space-y-1 pl-6 list-disc">
          <li>按 Given 准备好测试数据和环境</li>
          <li>严格按 When 步骤执行操作</li>
          <li>逐项验证 Then 中的预期结果</li>
        </ul>
      </div>
    </div>
  );
};
```

### BDD 格式颜色规范
| 字段 | Badge颜色 | 背景色 |
|------|----------|--------|
| 测试场景 | bg-orange-100 text-orange-700 | - |
| Given (前置条件) | bg-emerald-100 text-emerald-700 | bg-emerald-50/70 |
| When (操作步骤) | bg-amber-100 text-amber-700 | bg-amber-50/70 |
| Then (预期结果) | bg-rose-100 text-rose-700 | bg-rose-50/70 |

---

## 九、优先级显示规则

### 颜色对应关系
| 优先级 | 背景色 | 文字色 | 适用场景 |
|--------|--------|--------|----------|
| P0 / 高 | bg-red-500 | text-white | 最高优先级 |
| P1 / 中 | bg-amber-500 | text-white | 中等优先级 |
| P2 / 低 | bg-gray-400 | text-white | 最低优先级 |

### 实现代码
```typescript
// 获取优先级颜色（需求点用高/中/低，用例用P0/P1/P2）
const getPriorityColor = (priority: string) => {
  // P0/高 = 红色（最高优先级）
  if (priority === 'P0' || priority === '高') {
    return 'bg-red-500 text-white';
  }
  // P1/中 = 琥珀色（中优先级）
  if (priority === 'P1' || priority === '中') {
    return 'bg-amber-500 text-white';
  }
  // P2/低 = 灰色（最低优先级）
  if (priority === 'P2' || priority === '低') {
    return 'bg-gray-400 text-white';
  }
  return 'bg-gray-400 text-white';
};
```

---

## 十、知识库搜索弹窗

### 布局结构
```
┌──────────────────────────────────────────────────────┐
│  从知识库添加用例                              [X]    │
├──────────────────────────────────────────────────────┤
│  [🔍 输入关键词搜索...                    ] [搜索]   │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐ │
│  │ 找到 30 个相关用例，选择要添加的用例：            │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ [☑] 用例标题 A                                   │ │
│  │     前提：... 操作：... 预期：...                │ │
│  │     相似度: 95%                                  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ [ ] 用例标题 B                                   │ │
│  │     ...                                          │ │
│  └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│  已选择 1 个用例              [取消] [添加选中用例]   │
└──────────────────────────────────────────────────────┘
```

### 弹窗组件实现
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] flex flex-col">
    {/* 弹窗头部 */}
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Library className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">从知识库添加用例</h3>
          <p className="text-xs text-gray-500">搜索并选择已有的测试用例</p>
        </div>
      </div>
      <button onClick={() => setKnowledgeSearchOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100">
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>

    {/* 搜索区域 */}
    <div className="p-4 border-b border-gray-100">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="输入关键词搜索测试用例..."
            value={knowledgeSearchQuery}
            onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleKnowledgeSearch()}
            className="pl-10 h-10"
          />
        </div>
        <Button onClick={handleKnowledgeSearch} disabled={!knowledgeSearchQuery.trim()}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700">
          {knowledgeSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
        </Button>
      </div>
    </div>

    {/* 搜索结果 */}
    <div className="flex-1 overflow-y-auto p-4">
      {knowledgeSearchResults.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-500 mb-3">
            找到 {knowledgeSearchResults.length} 个相关用例：
          </div>
          {knowledgeSearchResults.map((result) => (
            <div 
              key={result.id}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedKnowledgeCases.has(result.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => toggleKnowledgeCaseSelection(result.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  selectedKnowledgeCases.has(result.id) 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedKnowledgeCases.has(result.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{result.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{result.content}</div>
                  {result.similarity !== undefined && (
                    <div className="text-xs text-blue-600 mt-1">
                      相似度: {(result.similarity * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">输入关键词搜索知识库</p>
          <p className="text-xs text-gray-400 mt-1">输入测试用例相关的关键词进行搜索</p>
        </div>
      )}
    </div>

    {/* 底部操作 */}
    <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
      <div className="text-sm text-gray-500">
        已选择 <span className="font-semibold text-blue-600">{selectedKnowledgeCases.size}</span> 个用例
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="h-10 rounded-xl" onClick={() => setKnowledgeSearchOpen(false)}>
          取消
        </Button>
        <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700" 
                disabled={selectedKnowledgeCases.size === 0} onClick={handleAddFromKnowledge}>
          <Check className="w-4 h-4 mr-1" />
          添加选中用例
        </Button>
      </div>
    </div>
  </div>
</div>
```

---

## 十一、确认对话框

### 删除确认对话框
```jsx
{deletingNodeId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
          <p className="text-sm text-gray-500">
            {deletingNodeType === 'requirement' ? '需求点' : '测试用例'}
          </p>
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        确定要删除「<span className="font-medium text-gray-900">{deletingNodeTitle}</span>」吗？
        {deletingNodeType === 'requirement' && (
          <span className="block mt-1 text-amber-600 text-sm">
            提示：删除需求点将同时删除其下所有测试用例
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={cancelDelete}>
          取消
        </Button>
        <Button className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
          确认删除
        </Button>
      </div>
    </div>
  </div>
)}
```

### 清除所有数据确认对话框
```jsx
{clearingData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">清除所有数据</h3>
          <p className="text-sm text-gray-500">不可逆操作</p>
        </div>
      </div>
      <p className="text-gray-600 mb-6">确定要清除所有数据吗？此操作将删除：</p>
      <ul className="text-sm text-gray-600 mb-6 space-y-1">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          所有需求点和测试用例
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          左侧输入的表单内容
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          页面缓存数据
        </li>
      </ul>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={() => setClearingData(false)}>
          取消
        </Button>
        <Button className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmClearAllData}>
          确认清除
        </Button>
      </div>
    </div>
  </div>
)}
```

---

## 十二、数据导出功能

### 支持格式
| 格式 | 扩展名 | 库 | 特点 |
|------|--------|-----|------|
| CSV | .csv | 内置 | 纯文本，通用性强 |
| Excel | .xlsx | xlsx | 带格式、样式 |
| XMind | .xmind | jszip | 标准XML格式 |

### 导出数据结构
```typescript
interface ExportData {
  requirements: {
    title: string;
    priority: string;
    children: {
      title: string;
      priority: string;
      given: string;
      when: string;
      then: string;
    }[];
  }[];
}
```

### CSV 导出示例
```javascript
const exportToCSV = (mindMapRoot) => {
  const rows = [['需求点', '用例标题', '优先级', 'Given', 'When', 'Then']];
   
  mindMapRoot.children.forEach(req => {
    if (req.children.length === 0) {
      rows.push([req.title, '', req.priority, '', '', '']);
    } else {
      req.children.forEach(tc => {
        rows.push([req.title, tc.title, tc.priority, tc.given, tc.when, tc.then]);
      });
    }
  });
   
  const csv = rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile(csv, 'testcases.csv', 'text/csv');
};
```

### Excel 导出示例
```javascript
const exportToExcel = (mindMapRoot) => {
  const wb = XLSX.utils.book_new();
  const wsData = [['需求点', '用例标题', '优先级', 'Given', 'When', 'Then']];
   
  mindMapRoot.children.forEach(req => {
    req.children.forEach(tc => {
      wsData.push([req.title, tc.title, tc.priority, tc.given, tc.when, tc.then]);
    });
  });
   
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, '测试用例');
  XLSX.writeFile(wb, 'testcases.xlsx');
};
```

### XMind 导出示例
```javascript
const exportToXMind = (mindMapRoot) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="${mindMapRoot.title}">
    ${mindMapRoot.children.map(req => `
    <node TEXT="${req.title}">
      ${req.children.map(tc => `
      <node TEXT="${tc.title}">
        <node TEXT="优先级: ${tc.priority}" />
        <node TEXT="Given: ${tc.given}" />
        <node TEXT="When: ${tc.when}" />
        <node TEXT="Then: ${tc.then}" />
      </node>`).join('')}
    </node>`).join('')}
  </node>
</map>`;
   
  const zip = new JSZip();
  zip.file('content.json', JSON.stringify({ /* xmind content */ }));
  zip.file('testcases.xml', xml);
  zip.generateAsync({ type: 'blob' }).then(content => {
    downloadFile(content, 'testcases.xmind', 'application/xmind');
  });
};
```

---

## 十三、知识库模拟数据（30条）

```typescript
const mockKnowledgeCases = [
  // 用户相关
  { id: 'case-001', title: '用户登录功能测试', 
    content: '前提：用户已注册账号\n操作：输入正确的用户名和密码点击登录\n预期：成功登录并跳转到首页' },
  { id: 'case-002', title: '用户登出功能测试', 
    content: '前提：用户已登录\n操作：点击退出登录按钮\n预期：成功退出并跳转到登录页' },
  { id: 'case-003', title: '密码修改功能测试', 
    content: '前提：用户已登录\n操作：进入设置-修改密码，输入原密码和新密码\n预期：密码修改成功，下次登录需使用新密码' },
  { id: 'case-004', title: '用户注册功能测试', 
    content: '前提：无\n操作：填写注册信息并提交\n预期：注册成功并自动登录' },
  { id: 'case-005', title: '忘记密码功能测试', 
    content: '前提：无\n操作：点击忘记密码，输入注册邮箱\n预期：收到重置密码邮件' },
  
  // 订单相关
  { id: 'case-006', title: '订单创建功能测试', 
    content: '前提：购物车中有商品\n操作：选择商品，点击结算，填写收货信息\n预期：订单创建成功，库存相应减少' },
  { id: 'case-007', title: '订单取消功能测试', 
    content: '前提：存在已创建但未支付的订单\n操作：进入订单列表，点击取消订单\n预期：订单状态变为已取消，库存恢复' },
  { id: 'case-008', title: '订单支付功能测试', 
    content: '前提：存在待支付订单\n操作：选择支付方式并完成支付\n预期：订单状态变为已支付，收到支付成功通知' },
  { id: 'case-022', title: '订单列表查询测试', 
    content: '前提：用户有订单记录\n操作：进入订单列表，筛选不同状态\n预期：显示对应状态的订单，支持分页' },
  { id: 'case-023', title: '订单物流跟踪测试', 
    content: '前提：存在已发货订单\n操作：查看订单详情中的物流信息\n预期：显示物流进度和当前位置' },
  { id: 'case-024', title: '商品售后申请测试', 
    content: '前提：存在已收货订单\n操作：申请退款/退货/换货\n预期：售后申请提交成功，状态更新' },
  
  // 商品相关
  { id: 'case-009', title: '商品搜索功能测试', 
    content: '前提：无\n操作：在搜索框输入关键词点击搜索\n预期：显示包含关键词的商品列表' },
  { id: 'case-010', title: '商品收藏功能测试', 
    content: '前提：用户已登录\n操作：点击商品详情页的收藏按钮\n预期：收藏成功，可在个人中心查看收藏列表' },
  { id: 'case-018', title: '商品详情页测试', 
    content: '前提：无\n操作：点击商品进入详情页\n预期：显示商品图片、价格、库存、评价等信息' },
  { id: 'case-019', title: '商品分类浏览测试', 
    content: '前提：无\n操作：选择商品分类进入列表页\n预期：显示该分类下的所有商品，支持分页' },
  { id: 'case-020', title: '商品规格选择测试', 
    content: '前提：商品有多种规格\n操作：选择不同规格组合\n预期：价格和库存随规格变化实时更新' },
  { id: 'case-014', title: '商品评论功能测试', 
    content: '前提：用户已完成订单\n操作：进入已购买订单，对商品进行评论\n预期：评论提交成功，显示在商品详情页' },
  { id: 'case-027', title: '商品分享功能测试', 
    content: '前提：商品详情页\n操作：点击分享按钮\n预期：生成分享链接或打开分享面板' },
  
  // 购物车相关
  { id: 'case-011', title: '购物车添加商品测试', 
    content: '前提：商品有库存\n操作：点击商品详情页的加入购物车按钮\n预期：商品成功添加到购物车，购物车数量增加' },
  { id: 'case-012', title: '购物车删除商品测试', 
    content: '前提：购物车中有商品\n操作：点击删除按钮移除商品\n预期：商品从购物车中移除，购物车数量减少' },
  
  // 其他功能
  { id: 'case-013', title: '收货地址管理测试', 
    content: '前提：用户已登录\n操作：进入地址管理，新增/编辑/删除收货地址\n预期：地址信息正确保存' },
  { id: 'case-015', title: '消息通知功能测试', 
    content: '前提：用户已登录\n操作：查看消息中心\n预期：显示所有系统消息和订单通知' },
  { id: 'case-016', title: '用户头像上传测试', 
    content: '前提：用户已登录\n操作：进入个人资料页，点击上传头像\n预期：头像上传成功并显示在页面各位置' },
  { id: 'case-017', title: '个人信息修改测试', 
    content: '前提：用户已登录\n操作：修改昵称、简介等个人信息\n预期：信息保存成功，页面显示更新后的内容' },
  { id: 'case-021', title: '优惠券领取测试', 
    content: '前提：无\n操作：进入优惠券中心，点击领取\n预期：优惠券领取成功，可在订单结算时使用' },
  { id: 'case-025', title: '首页轮播图点击测试', 
    content: '前提：无\n操作：点击首页轮播图\n预期：跳转到对应的活动或商品页面' },
  { id: 'case-026', title: '搜索历史记录测试', 
    content: '前提：用户有搜索历史\n操作：点击搜索框查看历史\n预期：显示最近的搜索关键词，支持一键搜索' },
  { id: 'case-028', title: '密码强度校验测试', 
    content: '前提：无\n操作：注册时输入不同强度的密码\n预期：实时提示密码强度，引导用户设置强密码' },
  { id: 'case-029', title: '表单输入校验测试', 
    content: '前提：各种表单页面\n操作：输入非法字符或格式错误\n预期：实时显示错误提示，阻止提交' },
  { id: 'case-030', title: '移动端适配测试', 
    content: '前提：在手机或平板设备\n操作：访问各功能页面\n预期：页面布局适配良好，操作便捷' },
];
```

---

## 十四、API 接口清单

| 接口 | 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| 需求拆分 | POST | `/api/analyze-requirements` | 将需求拆分为需求点 | `{requirement, attachments, links, module}` | `{requirementPointsText}` |
| 用例生成 | POST | `/api/generate` | 流式生成测试用例（SSE） | `{requirement, module, aiModel}` | SSE stream |
| 文件上传 | POST | `/api/upload` | 上传附件到对象存储 | FormData | `{success, key, url}` |
| 文件解析 | POST | `/api/parse-file` | 解析文档内容 | `{key, fileType}` | `{content}` |
| 链接抓取 | POST | `/api/fetch-url` | 抓取网页内容 | `{url}` | `{success, data}` |
| 知识库搜索 | POST | `/api/knowledge-search` | 搜索知识库用例 | `{query}` | `{success, data[]}` |

### 需求拆分 API 响应格式
```json
{
  "requirementPointsText": "需求点1\n需求点2\n需求点3\n..."
}
```

### 用例生成 API（SSE格式）
```
data: {"content": "【用例标题】：...\n"}
data: {"content": "【优先级】：P0\n"}
data: {"content": "【Given】：...\n"}
data: {"content": "===CASE_SEPARATOR===\n"}
data: [DONE]
```

### 知识库搜索 API 响应格式
```json
{
  "success": true,
  "data": [
    {
      "id": "case-001",
      "title": "用户登录功能测试",
      "content": "前提：...\n操作：...\n预期：...",
      "similarity": 0.95
    }
  ]
}
```

---

## 十五、技术栈

| 技术 | 说明 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Core | React 19 |
| Language | TypeScript 5 |
| UI | shadcn/ui (基于 Radix UI) |
| Styling | Tailwind CSS 4 |
| AI | 豆包 Seed 2.0 Pro 模型 |
| 存储 | S3 兼容存储 (coze-coding-dev-sdk) |
| 文档解析 | pdf-parse, mammoth, cheerio |
| 导出 | xlsx, jszip |
| 包管理 | pnpm |

---

## 十六、组件清单

### UI 组件（shadcn/ui）
| 组件 | 用途 |
|------|------|
| Card | 卡片容器 |
| Button | 按钮 |
| Input | 输入框 |
| Textarea | 文本域 |
| Select | 下拉选择 |
| Badge | 标签/徽章 |
| Toaster | 提示消息 |

### 自定义组件
| 组件 | 用途 |
|------|------|
| MindMapCanvas | 思维导图画布组件 |
| TreeNode | 树形节点渲染逻辑 |

### 图标（Lucide React）
| 图标 | 用途 |
|------|------|
| Sparkles | AI/魔法 |
| Zap | 快速生成 |
| Download | 导出 |
| Trash2 | 删除 |
| Plus | 新增 |
| GitBranch | 需求点 |
| FileText | 测试用例 |
| Paperclip | 附件 |
| Link | 链接 |
| Search | 搜索 |
| Library | 知识库 |
| ChevronDown/Right | 展开/折叠 |
| Edit2 | 编辑 |
| Loader2 | 加载中 |
| X | 关闭 |
| Check | 选中 |
| BookOpen | 空状态 |
| LayoutList | 列表视图 |
| Network | 思维导图视图 |
| FileCheck | 文件已解析 |
| FileX | 文件失败 |
| Merge | 合并 |
| AlertCircle | 警告 |

---

## 十七、状态管理

### 主要状态
```typescript
// 需求输入状态
const [aiGenerate, setAiGenerate] = useState({
  requirementTitle: '',
  requirementContent: '',
  module: '',
  aiModel: 'doubao-seed-2-0-pro-260215',
  attachments: [],
  links: [],
});

// 已解析内容
const [parsedContent, setParsedContent] = useState([]);

// 思维导图数据
const [mindMapRoot, setMindMapRoot] = useState<MindMapNode | null>(null);

// 展开/折叠状态
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

// 选中用例
const [selectedTestCase, setSelectedTestCase] = useState<MindMapNode | null>(null);

// 编辑状态
const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

// 视图模式
const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree');

// 知识库
const [knowledgeSearchOpen, setKnowledgeSearchOpen] = useState(false);
const [knowledgeSearchResults, setKnowledgeSearchResults] = useState([]);
const [selectedKnowledgeCases, setSelectedKnowledgeCases] = useState<Set<string>>(new Set());
```

### localStorage 持久化
```typescript
// 保存思维导图数据
useEffect(() => {
  if (mindMapRoot) {
    localStorage.setItem('testcraft-mindmap', JSON.stringify(mindMapRoot));
  }
}, [mindMapRoot]);

// 保存展开状态
useEffect(() => {
  localStorage.setItem('testcraft-expanded', JSON.stringify([...expandedNodes]));
}, [expandedNodes]);
```

---

## 十八、目录结构规范

```
/workspace/projects/
├── public/                          # 静态资源
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-requirements/route.ts   # 需求拆分 API
│   │   │   ├── generate/route.ts                # 用例生成 API（流式）
│   │   │   ├── upload/route.ts                  # 文件上传 API
│   │   │   ├── parse-file/route.ts              # 文件解析 API
│   │   │   ├── fetch-url/route.ts               # 链接抓取 API
│   │   │   └── knowledge-search/route.ts        # 知识库搜索 API
│   │   ├── globals.css                          # 全局样式
│   │   ├── layout.tsx                          # 根布局
│   │   └── page.tsx                            # 主页面
│   ├── components/ui/                           # shadcn/ui 组件库
│   ├── hooks/
│   │   └── use-toast.ts                        # Toast Hook
│   └── lib/
│       └── utils.ts                            # 工具函数
├── next.config.ts
├── package.json
└── .coze                               # Coze 配置文件
```

---

## 十九、关键实现说明

### 1. 文档解析
- **PDF**: 使用 Python + PyPDF2 库提取文本
- **Word (docx)**: 使用 mammoth 库提取文本
- **HTML**: 使用 cheerio 库解析并提取文本
- **纯文本**: 直接读取

### 2. 链接抓取
- 使用 fetch-url 技能抓取网页内容
- 自动提取正文文本
- 支持编码检测
- 飞书、Notion 等平台返回友好警告

### 3. 流式输出
- AI 生成采用 SSE (Server-Sent Events) 流式输出
- 前端使用 fetch + ReadableStream 逐步读取
- 实现打字机式渲染效果

### 4. 对象存储
- 文件上传到 S3 兼容存储
- 生成签名 URL 用于访问
- 使用 coze-coding-dev-sdk 集成

### 5. 视图切换
- 列表视图和思维导图视图的展开状态**独立管理**
- 思维导图内部维护自己的展开状态
- 切换视图时保持各自的展开状态

---

## 二十、开发与构建命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 生产构建
pnpm build

# 生产启动
pnpm start

# TypeScript 检查
pnpm ts-check

# ESLint 检查
pnpm lint
```

---

## 二十一、环境变量

| 变量名 | 说明 |
|--------|------|
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 |
| `COZE_BUCKET_NAME` | 存储桶名称 |
| `DEPLOY_RUN_PORT` | 服务端口 (5000) |

---

## 二十二、注意事项

1. **包管理器**：必须使用 pnpm，禁用 npm 或 yarn
2. **动态内容**：避免在 JSX 中直接使用 Date.now()、Math.random()
3. **Hydration 错误**：严禁在服务端渲染时使用 window 对象
4. **对象存储**：必须使用返回的 key 而非自行拼接
5. **跨域下载**：导出功能需使用 fetch + blob 模式处理跨域下载
