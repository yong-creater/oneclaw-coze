'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Star,
  ExternalLink,
  TrendingUp,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 分类
const categories = [
  { name: '全部', slug: 'all', count: 238 },
  { name: '商品图', slug: 'product', count: 45 },
  { name: '模特图', slug: 'model', count: 89 },
  { name: '人像图', slug: 'portrait', count: 67 },
  { name: '海报', slug: 'poster', count: 34 },
  { name: '视频', slug: 'video', count: 28 },
  { name: '图片编辑', slug: 'edit', count: 52 },
  { name: '批量处理', slug: 'batch', count: 23 },
];

// 工具数据 - 我们自己的工具
const tools = [
  { id: 1, name: '智能抠图', desc: 'AI 一键移除背景，精准识别主体', category: '图片编辑', freeType: 'free', isFeatured: true, usage: 12500, color: 'from-blue-100 to-cyan-100' },
  { id: 2, name: '商品主图生成', desc: '上传商品，自动生成淘宝/京东主图', category: '商品图', freeType: 'limited', isFeatured: true, usage: 8900, color: 'from-orange-100 to-amber-100' },
  { id: 3, name: '模特试衣', desc: '服装上身效果，AI 虚拟试穿', category: '模特图', freeType: 'limited', isFeatured: true, usage: 7800, color: 'from-pink-100 to-rose-100' },
  { id: 4, name: 'A+详情页', desc: '自动生成亚马逊 A+ 详情页面', category: '商品图', freeType: 'paid', isFeatured: false, usage: 5600, color: 'from-purple-100 to-violet-100' },
  { id: 5, name: '证件照', desc: '一键生成各尺寸证件照', category: '人像图', freeType: 'free', isFeatured: true, usage: 23400, color: 'from-emerald-100 to-teal-100' },
  { id: 6, name: '图片变清晰', desc: '模糊图片 AI 增强，一键高清修复', category: '图片编辑', freeType: 'free', isFeatured: true, usage: 45000, color: 'from-amber-100 to-orange-100' },
  { id: 7, name: '海报设计', desc: '输入描述词，AI 生成创意海报', category: '海报', freeType: 'limited', isFeatured: false, usage: 8900, color: 'from-red-100 to-pink-100' },
  { id: 8, name: '视频封面', desc: '自动截取视频精彩片段作为封面', category: '视频', freeType: 'free', isFeatured: true, usage: 34000, color: 'from-indigo-100 to-blue-100' },
  { id: 9, name: '批量处理', desc: '一次处理多张图片，提高效率', category: '批量处理', freeType: 'paid', isFeatured: false, usage: 5600, color: 'from-slate-100 to-gray-100' },
  { id: 10, name: '背景替换', desc: '智能识别并替换图片背景', category: '图片编辑', freeType: 'limited', isFeatured: false, usage: 4200, color: 'from-sky-100 to-cyan-100' },
  { id: 11, name: '商品图增强', desc: '提升商品图的视觉效果', category: '商品图', freeType: 'free', isFeatured: true, usage: 12300, color: 'from-lime-100 to-green-100' },
  { id: 12, name: 'AI 消除', desc: '去除图片中不需要的元素', category: '图片编辑', freeType: 'limited', isFeatured: true, usage: 28000, color: 'from-fuchsia-100 to-pink-100' },
];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { collapsed } = useSidebar();

  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                        tool.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === '全部' || tool.category.includes(activeCategory) || activeCategory === '商品图' && tool.category === '商品图';
    return matchSearch && (activeCategory === '全部' || tool.category === activeCategory);
  });

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
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool, idx) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                        <Sparkles className="w-6 h-6 text-slate-600" />
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
                    
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-orange-500 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{tool.desc}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{tool.category}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <TrendingUp className="w-3 h-3" />
                        {tool.usage.toLocaleString()} 次
                      </div>
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
                  href={`/tools/${tool.id}`}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    <Sparkles className="w-6 h-6 text-slate-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-500 transition-colors">{tool.name}</h3>
                      {tool.isFeatured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-md">
                          推荐
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{tool.desc}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">{tool.category}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                      tool.freeType === 'free' ? 'bg-green-100 text-green-600' :
                      tool.freeType === 'limited' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {tool.freeType === 'free' ? '免费' : tool.freeType === 'limited' ? '限免' : '付费'}
                    </span>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
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
