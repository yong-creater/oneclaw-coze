'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Grid3X3, 
  List,
  Star,
  ExternalLink,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';
import { 
  OUR_TOOLS, 
  getCategoriesWithCount, 
  ToolConfig,
  formatUsageCount 
} from '@/config/tools';

// 分类筛选（包含"全部"）
const CATEGORIES = [
  { name: '全部', slug: 'all', count: OUR_TOOLS.length },
  ...getCategoriesWithCount().filter(c => c.slug !== 'all'),
];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { collapsed } = useSidebar();

  // 筛选工具
  const filteredTools = useMemo(() => {
    return OUR_TOOLS.filter(tool => {
      const matchSearch = 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchCategory = 
        activeCategory === '全部' || 
        tool.categoryName === activeCategory;
      
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  // 分类统计
  const categories = useMemo(() => {
    return CATEGORIES.map(cat => {
      if (cat.name === '全部') {
        return { ...cat, count: OUR_TOOLS.length };
      }
      const count = OUR_TOOLS.filter(t => t.categoryName === cat.name).length;
      return { ...cat, count };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="AI 工具" subtitle={`${filteredTools.length} 个工具`} />
        
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
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
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
                        {tool.isFeatured && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            推荐
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          tool.freeType === 'free' ? 'bg-green-100 text-green-600' :
                          tool.freeType === 'limited' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {tool.freeType === 'free' ? '免费' : tool.freeType === 'limited' ? '限免' : '付费'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        {tool.categoryName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {formatUsageCount(tool.usageCount)}
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
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {tool.name}
                      </h3>
                      {tool.isFeatured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          推荐
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                        tool.freeType === 'free' ? 'bg-green-100 text-green-600' :
                        tool.freeType === 'limited' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tool.freeType === 'free' ? '免费' : tool.freeType === 'limited' ? '限免' : '付费'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                      {tool.categoryName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {formatUsageCount(tool.usageCount)}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={`${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Footer />
        </div>
      </main>
    </div>
  );
}
