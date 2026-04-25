'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Grid3X3, FileText, Clock, FolderOpen, 
  MoreHorizontal, Search, ArrowLeft, Filter,
  Star, Sparkles, Settings, ChevronRight, Menu, X
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { TOOLS_CONFIG, TOOL_CATEGORIES, ToolCategory, ToolConfig } from '@/components/tools/config';

// 工具封面图配置（使用真实场景图片）
const TOOL_COVERS: Record<string, { image: string; title: string }> = {
  'remove-bg': {
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    title: '智能抠图'
  },
  'enhance': {
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop',
    title: '变清晰'
  },
  'resize': {
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=300&fit=crop',
    title: '改尺寸'
  },
  'xiaohongshu': {
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    title: '小红书封面'
  },
  'douyin': {
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop',
    title: '视频封面'
  },
  'festival-poster': {
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop',
    title: '节日海报'
  },
  'productpage': {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    title: '商品主图'
  },
  'restaurant-menu': {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    title: '菜单设计'
  }
};

export default function ToolsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 按分类分组工具
  const toolsByCategory = TOOLS_CONFIG.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, ToolConfig[]>);

  // 过滤工具
  const filteredTools = searchQuery 
    ? TOOLS_CONFIG.filter(t => 
        t.name.includes(searchQuery) || 
        t.description.includes(searchQuery)
      )
    : null;

  // 渲染工具卡片
  const renderToolCard = (tool: ToolConfig) => {
    const cover = TOOL_COVERS[tool.key];
    return (
      <Link
        key={tool.key}
        href={`/tools/${tool.key}`}
        className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-orange-200 transition-all"
      >
        {/* 封面图 */}
        <div className="relative h-36 overflow-hidden">
          {cover ? (
            <img 
              src={cover.image} 
              alt={tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${tool.color.gradient}`} />
          )}
          {/* 工具图标覆盖 */}
          <div className="absolute bottom-3 left-3">
            <div className={`w-10 h-10 rounded-xl ${tool.color.bg} flex items-center justify-center shadow-lg backdrop-blur-sm`}>
              <span className="text-xl">{tool.icon}</span>
            </div>
          </div>
          {/* 标签 */}
          {tool.quota?.daily && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs bg-white/90 backdrop-blur-sm rounded-full text-slate-600">
                每日{tool.quota.daily}次
              </span>
            </div>
          )}
        </div>
        
        {/* 文字内容 */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {tool.description}
          </p>
          {/* 使用提示 */}
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-orange-400">→</span> {tool.guide}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧导航 */}
      <aside className={`bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <AnimatedLobster size={20} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-slate-800">OneClaw</span>
                <p className="text-xs text-slate-400">AI工具箱</p>
              </div>
            )}
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { icon: Home, label: '首页', href: '/' },
            { icon: Grid3X3, label: '工具', href: '/tools', active: true },
            { icon: FileText, label: '模板', href: '/templates' },
            { icon: Clock, label: '最近打开', href: '/recent' },
            { icon: FolderOpen, label: '项目', href: '/projects' },
            { icon: Star, label: '资产库', href: '/assets' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  item.active 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
              <MoreHorizontal className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">更多</span>}
            </button>
          </div>
        </nav>

        {/* 折叠按钮 */}
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={`flex-1 transition-all ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        {/* 顶部栏 */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="h-14 px-6 flex items-center justify-between">
            {/* 搜索 */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  !activeCategory ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              {Object.entries(TOOL_CATEGORIES).slice(0, 3).map(([key, cat]) => (
                <button 
                  key={key}
                  onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeCategory === key ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">
          {filteredTools ? (
            // 搜索结果
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                搜索结果 ({filteredTools.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTools.map(renderToolCard)}
              </div>
            </div>
          ) : activeCategory ? (
            // 分类视图
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setActiveCategory(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {TOOL_CATEGORIES[activeCategory as ToolCategory]?.icon} {TOOL_CATEGORIES[activeCategory as ToolCategory]?.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {TOOL_CATEGORIES[activeCategory as ToolCategory]?.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(toolsByCategory[activeCategory as ToolCategory] || []).map(renderToolCard)}
              </div>
            </div>
          ) : (
            // 全部分类
            Object.entries(TOOL_CATEGORIES).map(([key, category]) => {
              const categoryTools = toolsByCategory[key as ToolCategory] || [];
              if (categoryTools.length === 0) return null;
              
              return (
                <div key={key} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">{category.name}</h2>
                        <p className="text-sm text-slate-500">{category.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveCategory(key)}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      查看全部 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryTools.slice(0, 4).map(renderToolCard)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
