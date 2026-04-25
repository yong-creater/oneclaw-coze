'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search,
  Grid3X3,
  List,
  Filter,
  Sparkles,
  Star,
  ArrowRight,
  Copy,
  Eye,
  FolderOpen
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 分类
const categories = [
  { name: '全部', count: 128 },
  { name: '电商模板', count: 45 },
  { name: '社交媒体', count: 38 },
  { name: '海报', count: 28 },
  { name: 'Logo', count: 17 },
];

// 风格
const styles = ['全部', '简约', '活力', '高端', '可爱'];

// 模板数据
const templates = [
  { id: 1, name: '电商通用主图', category: '电商模板', style: '简约', thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop', isFeatured: true, usage: 8900 },
  { id: 2, name: '小红书封面', category: '社交媒体', style: '活力', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', isFeatured: true, usage: 15600 },
  { id: 3, name: '抖音视频封面', category: '社交媒体', style: '活力', thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop', isFeatured: false, usage: 7800 },
  { id: 4, name: '节日促销海报', category: '海报', style: '活力', thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop', isFeatured: true, usage: 12300 },
  { id: 5, name: '品牌Logo', category: 'Logo', style: '高端', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop', isFeatured: false, usage: 5600 },
  { id: 6, name: '淘宝详情页', category: '电商模板', style: '简约', thumbnail: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop', isFeatured: true, usage: 9800 },
  { id: 7, name: 'ins风配图', category: '社交媒体', style: '简约', thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop', isFeatured: false, usage: 6700 },
  { id: 8, name: '会员卡设计', category: '海报', style: '高端', thumbnail: 'https://images.unsplash.com/photo-1626785774625-0b1c2c4eabab?w=400&h=300&fit=crop', isFeatured: false, usage: 3400 },
];

// 风格颜色映射
const styleColors: Record<string, string> = {
  '简约': 'from-slate-100 to-gray-100',
  '活力': 'from-orange-100 to-amber-100',
  '高端': 'from-purple-100 to-violet-100',
  '可爱': 'from-pink-100 to-rose-100',
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeStyle, setActiveStyle] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { collapsed } = useSidebar();

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === '全部' || t.category === activeCategory;
    const matchStyle = activeStyle === '全部' || t.style === activeStyle;
    return matchSearch && matchCategory && matchStyle;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="设计模板" subtitle={`${filteredTemplates.length} 个模板`} />
        
        <div className="p-8">
          {/* 搜索框 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索模板..."
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
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
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

          {/* 风格标签 */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm text-slate-500 mr-2">风格:</span>
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                  activeStyle === style
                    ? 'bg-orange-100 text-orange-600 font-medium'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* 模板列表 */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无模板</h3>
              <p className="text-slate-500">换个筛选条件试试</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((tpl, idx) => (
                <div
                  key={tpl.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* 预览图 */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={tpl.thumbnail} 
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tpl.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        推荐
                      </div>
                    )}
                    {/* 悬浮操作 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                        <Eye className="w-4 h-4" />
                        预览
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
                        <Copy className="w-4 h-4" />
                        使用
                      </button>
                    </div>
                  </div>
                  {/* 信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{tpl.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 bg-gradient-to-br ${styleColors[tpl.style] || 'from-slate-100 to-gray-100'} text-slate-600 text-xs rounded-md`}>
                          {tpl.style}
                        </span>
                        <span className="text-xs text-slate-400">{tpl.category}</span>
                      </div>
                      <span className="text-xs text-slate-400">{tpl.usage.toLocaleString()} 次使用</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((tpl, idx) => (
                <div
                  key={tpl.id}
                  className="group flex items-center gap-5 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* 预览图 */}
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                  </div>
                  {/* 信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                      {tpl.isFeatured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                          推荐
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className={`px-2 py-0.5 bg-gradient-to-br ${styleColors[tpl.style] || 'from-slate-100 to-gray-100'} text-slate-600 rounded-md`}>
                        {tpl.style}
                      </span>
                      <span>{tpl.category}</span>
                      <span>{tpl.usage.toLocaleString()} 次使用</span>
                    </div>
                  </div>
                  {/* 操作 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer">
                      <Eye className="w-4 h-4" />
                      预览
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
                      <Copy className="w-4 h-4" />
                      使用
                    </button>
                  </div>
                </div>
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
