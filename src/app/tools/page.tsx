'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Sidebar, Header, Footer } from '@/components/common';
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
      {/* 统一侧边栏 */}
      <Sidebar searchPlaceholder="搜索工具..." />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header title="AI工具箱" subtitle={`共 ${TOOLS_CONFIG.length} 个工具`} />

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

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
