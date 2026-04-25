'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Grid3X3, List, 
  Clock, Star, Download, Heart, TrendingUp,
  ChevronRight, Crown, X, Check, Sparkles
} from 'lucide-react';
import { Sidebar, Header, Footer } from '@/components/common';

// 模板分类
const CATEGORIES = [
  { id: 'all', name: '全部', count: 128 },
  { id: 'avatar', name: '头像模板', count: 32 },
  { id: 'cover', name: '封面模板', count: 28 },
  { id: 'poster', name: '海报模板', count: 35 },
  { id: 'menu', name: '菜单模板', count: 15 },
  { id: 'resume', name: '简历模板', count: 18 },
  { id: 'product', name: '商品详情', count: 12 },
  { id: 'social', name: '社交媒体', count: 8 },
];

// 模板数据
const TEMPLATES = [
  { id: 1, name: '可爱头像模板', category: 'avatar', thumbnail: '/templates/avatar-1.svg', color: 'from-pink-100 to-rose-100', tags: ['热门', '可爱'], uses: 2847, favorite: true, hot: true },
  { id: 2, name: '商务简历形象照', category: 'resume', thumbnail: '/templates/resume-1.svg', color: 'from-sky-100 to-blue-100', tags: ['推荐'], uses: 1923, favorite: false },
  { id: 3, name: '小红书爆款封面', category: 'cover', thumbnail: '/templates/cover-1.svg', color: 'from-orange-100 to-amber-100', tags: ['热门'], uses: 3521, favorite: true, hot: true },
  { id: 4, name: '端午节日海报', category: 'poster', thumbnail: '/templates/poster-1.svg', color: 'from-green-100 to-emerald-100', tags: ['节日'], uses: 1456, favorite: false },
  { id: 5, name: '餐饮美食菜单', category: 'menu', thumbnail: '/templates/menu-1.svg', color: 'from-amber-100 to-orange-100', tags: ['实用'], uses: 987, favorite: false },
  { id: 6, name: '抖音视频封面', category: 'cover', thumbnail: '/templates/douyin-1.svg', color: 'from-purple-100 to-pink-100', tags: ['热门', '新版'], uses: 2109, favorite: false, hot: true },
  { id: 7, name: '商品展示详情页', category: 'product', thumbnail: '/templates/product-1.svg', color: 'from-cyan-100 to-sky-100', tags: ['电商'], uses: 876, favorite: false },
  { id: 8, name: '简约商务名片', category: 'resume', thumbnail: '/templates/vcard-1.svg', color: 'from-slate-100 to-gray-100', tags: ['商务'], uses: 654, favorite: false },
  { id: 9, name: '中秋节日海报', category: 'poster', thumbnail: '/templates/poster-2.svg', color: 'from-yellow-100 to-amber-100', tags: ['节日', '热门'], uses: 1876, favorite: true, hot: true },
  { id: 10, name: '时尚女生头像', category: 'avatar', thumbnail: '/templates/avatar-2.svg', color: 'from-rose-100 to-pink-100', tags: ['时尚'], uses: 2341, favorite: false },
  { id: 11, name: '电商主图模板', category: 'product', thumbnail: '/templates/product-2.svg', color: 'from-teal-100 to-cyan-100', tags: ['电商'], uses: 1123, favorite: false },
  { id: 12, name: '朋友圈海报', category: 'social', thumbnail: '/templates/social-1.svg', color: 'from-fuchsia-100 to-pink-100', tags: ['社交'], uses: 765, favorite: false },
];

// 排序选项
const SORT_OPTIONS = [
  { id: 'popular', name: '最热' },
  { id: 'newest', name: '最新' },
  { id: 'downloads', name: '最多使用' },
];

// Toast组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useState(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-400" />
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(
    new Set(TEMPLATES.filter(t => t.favorite).map(t => t.id))
  );
  const [toast, setToast] = useState<string | null>(null);

  // 筛选模板
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 排序
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.uses - a.uses;
      case 'newest': return b.id - a.id;
      case 'downloads': return b.uses - a.uses;
      default: return 0;
    }
  });

  // 收藏切换
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToast('已取消收藏');
      } else {
        next.add(id);
        setToast('已添加到收藏');
      }
      return next;
    });
  };

  // 使用模板
  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setToast(`正在打开「${template.name}」...`);
    const toolMap: Record<string, string> = {
      avatar: '/avatar-emoji',
      resume: '/resume-photo',
      cover: '/xiaohongshu',
      poster: '/festival-poster',
      menu: '/restaurant-menu',
      product: '/productpage',
    };
    setTimeout(() => {
      window.location.href = toolMap[template.category] || '/';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10 flex flex-col">
      {/* 左侧统一侧边栏 */}
      <Sidebar searchPlaceholder="搜索模板..." />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header title="设计模板" subtitle={`共 ${TEMPLATES.length} 个模板`} badge="1.1元开通会员" />

        <div className="p-8">
          {/* 搜索和筛选 */}
          <div className="mb-8 space-y-5">
            {/* 搜索框 */}
            <div className="relative max-w-lg group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索模板..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 分类标签 */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  {cat.name}
                  <span className={`ml-1.5 text-xs ${activeCategory === cat.id ? 'text-orange-200' : 'text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 排序和视图 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">排序：</span>
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortBy === option.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}>
                <Grid3X3 className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100' : ''}`}>
                <List className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* 模板列表 */}
          {sortedTemplates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-500">未找到相关模板</h3>
              <p className="text-sm text-slate-400 mt-1">试试其他搜索词或分类</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {sortedTemplates.map(template => (
                <div
                  key={template.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:shadow-xl hover:shadow-orange-100/30 hover:border-orange-200 transition-all duration-300"
                >
                  <div className={`aspect-square relative bg-gradient-to-br ${template.color}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/30">{template.name.slice(0, 2)}</span>
                    </div>
                    {/* 标签 */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {template.hot && (
                        <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-sm">
                          <TrendingUp className="w-3 h-3" />
                          热门
                        </span>
                      )}
                      {template.tags.filter(t => t !== '热门' && t !== '热门').map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-slate-600">{tag}</span>
                      ))}
                    </div>
                    {/* 收藏 */}
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(template.id); }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </button>
                    {/* 悬停操作 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-5 py-2.5 bg-white text-slate-800 font-medium rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
                      >
                        使用模板
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          {template.uses.toLocaleString()} 次使用
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTemplates.map(template => (
                <div
                  key={template.id}
                  className="group flex items-center gap-5 bg-white rounded-2xl p-4 border border-slate-200/60 hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                    <span className="text-2xl font-bold text-white/40">{template.name.slice(0, 2)}</span>
                    {template.hot && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-medium rounded-full">
                        热
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{template.name}</h3>
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{tag}</span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {template.uses.toLocaleString()} 次使用
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(template.id)} className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                      <Heart className={`w-5 h-5 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all flex items-center gap-2"
                    >
                      使用 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 底部 - 全宽 */}
      <div className="ml-56 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
