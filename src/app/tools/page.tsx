'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, Grid3X3, Sparkles, LogIn,
  ChevronRight, ArrowLeft, Search
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';
import { 
  TOOLS_CONFIG, 
  TOOL_CATEGORIES, 
  ToolCategory,
  ToolConfig
} from '@/components/tools/config';

// 简化工具组件
import RemoveBgTool from './tools/RemoveBgTool';
import EnhanceTool from './tools/EnhanceTool';
import ResizeTool from './tools/ResizeTool';
import XiaohongshuTool from './tools/XiaohongshuTool';
import DouyinTool from './tools/DouyinTool';
import FestivalPosterTool from './tools/FestivalPosterTool';

// 工具组件映射
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'remove-bg': RemoveBgTool,
  'enhance': EnhanceTool,
  'resize': ResizeTool,
  'xiaohongshu': XiaohongshuTool,
  'douyin': DouyinTool,
  'festival-poster': FestivalPosterTool,
};

// 主页面组件
export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['image-processing', 'marketing', 'ai-design']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const currentTool = TOOLS_CONFIG.find(t => t.key === activeTool);

  // 按分类分组工具
  const toolsByCategory = TOOLS_CONFIG.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, ToolConfig[]>);

  // 过滤工具（搜索）
  const filteredTools = searchQuery 
    ? TOOLS_CONFIG.filter(t => 
        t.name.includes(searchQuery) || 
        t.description.includes(searchQuery) ||
        t.key.includes(searchQuery)
      )
    : null;

  // 渲染工具
  const renderTool = () => {
    const Component = activeTool ? TOOL_COMPONENTS[activeTool] : null;
    if (!Component) return null;
    return <Component />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧导航 */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20">
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-sm text-slate-800">OneClaw</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50">
            <Home className="w-5 h-5" />
            <span>首页</span>
          </Link>
          <Link href="/tools" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-slate-100 text-slate-800 font-medium">
            <Grid3X3 className="w-5 h-5" />
            <span>工具</span>
          </Link>

          <div className="h-px bg-slate-100 my-3" />

          {/* 搜索 */}
          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索工具..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 分类列表 */}
          {filteredTools ? (
            // 搜索结果
            <div className="space-y-0.5">
              <div className="px-3 py-2 text-xs text-slate-400 font-medium">
                搜索结果 ({filteredTools.length})
              </div>
              {filteredTools.map(tool => (
                <button
                  key={tool.key}
                  onClick={() => setActiveTool(tool.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTool === tool.key ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>
          ) : (
            // 分类列表
            Object.entries(TOOL_CATEGORIES).map(([key, category]) => {
              const isExpanded = expandedCategories.includes(key);
              const categoryTools = toolsByCategory[key as ToolCategory] || [];
              if (categoryTools.length === 0) return null;
              
              return (
                <div key={key}>
                  <button
                    onClick={() => toggleCategory(key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${isExpanded ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {categoryTools.map(tool => (
                        <button
                          key={tool.key}
                          onClick={() => setActiveTool(tool.key)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTool === tool.key ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <span>{tool.icon}</span>
                          <span>{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <Link href="/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50">
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </Link>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 ml-64">
        <div className="p-6 pb-24 max-w-4xl">
          {activeTool ? (
            <>
              <div className="mb-6 flex items-center gap-2 text-sm">
                <button onClick={() => setActiveTool(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  返回工具列表
                </button>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{currentTool?.name}</h1>
              <p className="text-sm text-slate-500 mb-6">{currentTool?.description}</p>
              {renderTool()}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">AI工具箱</h1>
              <p className="text-sm text-slate-500 mb-6">点击下方工具开始使用，AI自动处理，无需设计基础</p>
              
              {filteredTools ? (
                // 搜索结果视图
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTools.map(tool => (
                    <button
                      key={tool.key}
                      onClick={() => setActiveTool(tool.key)}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
                    >
                      <div className={`h-24 bg-gradient-to-br ${tool.color.gradient} relative flex items-center justify-center`}>
                        <div className={`w-12 h-12 rounded-xl ${tool.color.bg} flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl">{tool.icon}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-800">{tool.name}</h3>
                        <p className="text-sm text-slate-500">{tool.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // 分类视图
                Object.entries(TOOL_CATEGORIES).map(([key, category]) => {
                  const categoryTools = toolsByCategory[key as ToolCategory] || [];
                  if (categoryTools.length === 0) return null;
                  
                  return (
                    <div key={key} className="mb-8">
                      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                        <span className="text-sm text-slate-400 font-normal">({categoryTools.length})</span>
                      </h2>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {categoryTools.map(tool => (
                          <button
                            key={tool.key}
                            onClick={() => setActiveTool(tool.key)}
                            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
                          >
                            <div className={`h-24 bg-gradient-to-br ${tool.color.gradient} relative flex items-center justify-center`}>
                              <div className={`w-12 h-12 rounded-xl ${tool.color.bg} flex items-center justify-center shadow-lg`}>
                                <span className="text-2xl">{tool.icon}</span>
                              </div>
                              <div className="absolute top-2 right-2">
                                {tool.requiresAuth ? (
                                  <span className="px-1.5 py-0.5 text-xs bg-white/80 rounded text-slate-600">需登录</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 text-xs bg-green-100 rounded text-green-600">免费</span>
                                )}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-slate-800">{tool.name}</h3>
                              <p className="text-sm text-slate-500 line-clamp-1">{tool.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
