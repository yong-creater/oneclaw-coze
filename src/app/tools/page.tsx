'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Search, Sparkles, Zap, Star, Clock } from 'lucide-react';
import { Header, Sidebar, Footer, useSidebar } from '@/components/common';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { collapsed } = useSidebar();

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
        className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:shadow-xl hover:shadow-orange-100/30 hover:border-orange-200 transition-all duration-300"
      >
        {/* 封面图 */}
        <div className="relative h-40 overflow-hidden">
          {cover ? (
            <img 
              src={cover.image} 
              alt={tool.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${tool.color.gradient}`} />
          )}
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* 工具图标 */}
          <div className="absolute bottom-3 left-3">
            <div className={`w-11 h-11 rounded-xl ${tool.color.bg} flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20`}>
              <span className="text-2xl">{tool.icon}</span>
            </div>
          </div>
          {/* 标签 */}
          {tool.quota?.daily && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 text-xs bg-white/90 backdrop-blur-sm rounded-full text-slate-600 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                每日{tool.quota.daily}次
              </span>
            </div>
          )}
        </div>
        
        {/* 文字内容 */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 mb-1.5 group-hover:text-orange-500 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {tool.description}
          </p>
          {/* 使用提示 */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            {tool.guide}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* 左侧统一导航 */}
      <Sidebar />

      {/* 主内容区 - 响应侧边栏折叠状态 */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        {/* 统一顶部 */}
        <Header title="AI工具箱" subtitle={`共 ${TOOLS_CONFIG.length} 个工具`} showRightArea={false} />

        {/* 页面内容 */}
        <div className="p-8">
          {filteredTools ? (
            // 搜索结果
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-slate-800">
                  搜索结果 <span className="text-orange-500">{filteredTools.length}</span> 个
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredTools.map(renderToolCard)}
              </div>
            </div>
          ) : activeCategory ? (
            // 分类视图
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveCategory(null)} 
                  className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TOOL_CATEGORIES[activeCategory as ToolCategory]?.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {TOOL_CATEGORIES[activeCategory as ToolCategory]?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {TOOL_CATEGORIES[activeCategory as ToolCategory]?.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {TOOL_CATEGORIES[activeCategory as ToolCategory]?.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {(toolsByCategory[activeCategory as ToolCategory] || []).map(renderToolCard)}
              </div>
            </div>
          ) : (
            // 全部分类
            <div className="space-y-10">
              {Object.entries(TOOL_CATEGORIES).map(([key, category], catIdx) => {
                const categoryTools = toolsByCategory[key as ToolCategory] || [];
                if (categoryTools.length === 0) return null;
                
                return (
                  <div 
                    key={key} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${catIdx * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {category.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">{category.name}</h2>
                          <p className="text-sm text-slate-500">{category.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveCategory(key)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        查看全部 <span className="text-orange-400">{categoryTools.length}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {categoryTools.slice(0, 4).map(renderToolCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 底部 - 响应侧边栏折叠状态 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Footer />
      </div>
    </div>
  );
}
