'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Grid3X3, List, Menu,
  Clock, Star, Download, Heart, TrendingUp,
  ChevronRight, Crown, X, Check, Sparkles
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<string | null>(null);
  const { collapsed } = useSidebar();

  // 过滤和排序模板
  const filteredTemplates = TEMPLATES
    .filter(t => activeCategory === 'all' || t.category === activeCategory)
    .filter(t => !showFavorites || t.favorite)
    .sort((a, b) => {
      if (sortBy === 'popular') return b.uses - a.uses;
      if (sortBy === 'newest') return 0;
      return b.uses - a.uses;
    });

  const handleFavorite = (id: number) => {
    setToast('已添加到收藏夹');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* 左侧统一导航 - md 以上显示 */}
      <Sidebar />

      {/* 主内容区 - 响应式布局 */}
      <main className={`
        flex-1 transition-all duration-300 
        md:${collapsed ? 'ml-[72px]' : 'ml-[268px]'}
      `}>
        {/* 移动端顶部导航栏 */}
        <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">设计模板</span>
          </div>
        </div>

        {/* 页面内容 */}
        <div className="p-4 md:p-8">
          {/* 筛选栏 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              {/* 分类切换 */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* 排序 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">排序：</span>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        sortBy === opt.id ? 'bg-white text-orange-600 shadow' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 收藏筛选 */}
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showFavorites 
                    ? 'bg-red-50 text-red-500 border border-red-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                我的收藏
              </button>

              {/* 视图切换 */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 模板网格 */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:shadow-xl hover:shadow-orange-100/30 hover:border-orange-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* 缩略图 */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                      <span className="text-6xl opacity-30">{template.name[0]}</span>
                    </div>
                    {template.hot && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          热门
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => handleFavorite(template.id)}
                        className="p-3 bg-white/90 rounded-full hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Heart className={`w-5 h-5 ${template.favorite ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
                      </button>
                      <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }}>
                        <Download className="w-5 h-5 text-slate-600" />
                      </button>
                      <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '100ms' }}>
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  {/* 信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-orange-500 transition-colors">
                      {template.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {template.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{template.uses.toLocaleString()} 使用</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-4">
              {filteredTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:shadow-lg hover:border-orange-200 transition-all duration-300 p-4 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-24 h-32 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-4xl opacity-30">{template.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      分类：{CATEGORIES.find(c => c.id === template.category)?.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-md">
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-slate-400">{template.uses.toLocaleString()} 使用</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleFavorite(template.id)}
                      className="p-3 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-500 transition-all"
                    >
                      <Heart className={`w-5 h-5 ${template.favorite ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-200/50 transition-all">
                      使用模板
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 底部 - 响应侧边栏折叠状态 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Footer />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
