'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Grid3X3, 
  List,
  Star,
  Sparkles,
  Zap,
  Coins
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';
import { 
  getToolCards, 
  getCategoryStats, 
  TOOL_CATEGORIES,
  ToolCategory,
  formatUsageCount
} from '@/config/tools';

// 分类类型（包含全部）
type FilterCategory = 'all' | ToolCategory;

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { collapsed } = useSidebar();

  // 获取分类统计数据
  const categoryStats = useMemo(() => getCategoryStats(), []);
  const allTools = useMemo(() => getToolCards(), []);

  // 筛选工具
  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      // 只显示启用的工具
      if (!tool.enabled) return false;

      const matchSearch = 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchCategory = 
        activeCategory === 'all' || 
        tool.category === activeCategory;
      
      return matchSearch && matchCategory;
    });
  }, [allTools, search, activeCategory]);

  // 分类统计（包含全部）
  const categories = useMemo(() => {
    const totalEnabled = allTools.filter(t => t.enabled).length;
    return [
      { id: 'all' as const, name: '全部', icon: '🎯', count: totalEnabled },
      ...categoryStats.map(cat => ({
        id: cat.category,
        name: cat.name,
        icon: cat.icon,
        count: cat.enabledCount,
      })),
    ];
  }, [categoryStats, allTools]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="AI 工具" subtitle={`${filteredTools.length} 个可用工具`} />
        
        <div className="p-8">
          {/* 搜索框 */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索工具名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 分类标签 - 简化版 */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`text-xs ${activeCategory === cat.id ? 'text-white/60' : 'text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* 工具列表 */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">未找到工具</h3>
              <p className="text-slate-500">换个关键词试试</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool, idx) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl`}>
                        {tool.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.featured && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            推荐
                          </span>
                        )}
                        {!tool.isFree && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-md flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {tool.credits}积分
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{tool.categoryName}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {formatUsageCount(tool.totalUsage)} 次使用
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTools.map((tool, idx) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl shrink-0`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {tool.name}
                      </h3>
                      {tool.featured && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded flex items-center gap-0.5">
                          <Star className="w-3 h-3" />
                        </span>
                      )}
                      {!tool.isFree && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded flex items-center gap-0.5">
                          <Coins className="w-3 h-3" />
                          {tool.credits}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-400">{tool.categoryName}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {formatUsageCount(tool.totalUsage)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
