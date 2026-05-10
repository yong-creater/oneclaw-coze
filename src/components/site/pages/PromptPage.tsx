'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Star, Eye, Heart, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { getInspirations, getInspirationCategories } from '@/lib/tool-workflow-config';
import type { InspirationItem } from '@/lib/tool-workflow-config';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PromptItem {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  uses: number;
  likes: number;
  views: number;
  image: string | null;
  style: string | null;
  tool_slug: string | null;
  is_featured: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  '商品图': { bg: 'from-orange-400 to-amber-500', text: 'text-orange-600', badge: 'bg-orange-500' },
  '小红书': { bg: 'from-rose-400 to-pink-500', text: 'text-rose-600', badge: 'bg-rose-500' },
  'AI写真': { bg: 'from-violet-400 to-purple-500', text: 'text-violet-600', badge: 'bg-violet-500' },
  '海报设计': { bg: 'from-blue-400 to-indigo-500', text: 'text-blue-600', badge: 'bg-blue-500' },
  '详情页': { bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-600', badge: 'bg-emerald-500' },
  '抠图': { bg: 'from-purple-400 to-fuchsia-500', text: 'text-purple-600', badge: 'bg-purple-500' },
  '视频': { bg: 'from-cyan-400 to-sky-500', text: 'text-cyan-600', badge: 'bg-cyan-500' },
};

const DEFAULT_VISUAL = { bg: 'from-slate-400 to-slate-500', text: 'text-slate-600', badge: 'bg-slate-500' };

const TOOL_SLUG_MAP: Record<string, string> = {
  'product-generator': '商品图',
  'xiaohongshu-generator': '小红书',
  'ai-photo': 'AI写真',
  'poster-design': '海报设计',
  'background-removal': '抠图',
  'product-page': '详情页',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function InspirationPage() {
  const router = useRouter();
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [filterStyle, setFilterStyle] = useState('');

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('insp_favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  // Save favorites
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('insp_favorites', JSON.stringify([...next]));
      return next;
    });
  };

  /* ---- Fetch from API ---- */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== '全部') params.set('category', activeCategory);
      if (search) params.set('search', search);
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.prompts || []);
      }
    } catch (err) {
      console.error('Failed to fetch inspirations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ---- Derived categories from static config ---- */
  const categories = getInspirationCategories();

  /* ---- Filter items ---- */
  const filteredItems = items.filter(item => {
    if (filterStyle && item.style !== filterStyle) return false;
    return true;
  });

  /* ---- Generate similar ---- */
  const handleGenerate = (item: PromptItem) => {
    const params = new URLSearchParams();
    if (item.tool_slug) params.set('toolId', item.tool_slug);
    if (item.content) params.set('prompt', item.content);
    if (item.style) params.set('style', item.style);
    router.push(`/create?${params.toString()}`);
  };

  /* ---- Extract unique styles ---- */
  const uniqueStyles = [...new Set(items.map(i => i.style).filter(Boolean) as string[])];

  /* ---- Favorite count ---- */
  const favoriteCount = favorites.size;

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">灵感案例库</h1>
              <p className="text-sm text-slate-500">看看别人正在生成什么内容，一键生成同款</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 transition-colors shadow-sm">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-700">我的收藏</span>
            {favoriteCount > 0 && (
              <span className="text-xs bg-purple-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{favoriteCount}</span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索你想生成的内容，例如: 商品图、小红书、AI写真..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm hover:border-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm transition-colors ${showFilter ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
          </button>
        </div>

        {/* Category Tags */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('全部')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === '全部'
                ? 'bg-gradient-to-r from-[#7C6CFF] to-[#9B87FF] text-white shadow-md shadow-purple-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
            }`}
          >
            全部 {items.length > 0 ? items.length : ''}
          </button>
          {categories.map(cat => {
            const count = cat.count;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.label
                    ? 'bg-gradient-to-r from-[#7C6CFF] to-[#9B87FF] text-white shadow-md shadow-purple-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
                }`}
              >
                {cat.label} {count}
              </button>
            );
          })}
        </div>

        {/* Style filter bar */}
        {showFilter && uniqueStyles.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <span className="text-xs text-slate-400 flex-shrink-0">风格:</span>
            <button
              onClick={() => setFilterStyle('')}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                !filterStyle ? 'bg-purple-100 text-purple-600' : 'bg-slate-50 text-slate-500 hover:bg-purple-50'
              }`}
            >
              全部
            </button>
            {uniqueStyles.map(style => (
              <button
                key={style}
                onClick={() => setFilterStyle(style)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                  filterStyle === style ? 'bg-purple-100 text-purple-600' : 'bg-slate-50 text-slate-500 hover:bg-purple-50'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        )}

        {/* Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无灵感内容</p>
            <p className="text-sm text-slate-400">换个关键词或分类试试？</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const visual = CATEGORY_COLORS[item.category] || DEFAULT_VISUAL;
              const isFav = favorites.has(item.id);

              return (
                <div
                  key={item.id}
                  className="os-insp-card bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${visual.bg} flex items-center justify-center`}>
                        <Sparkles className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                    {/* Category badge */}
                    <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-xs font-medium text-white ${visual.badge}`}>
                      {item.category}
                    </span>
                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-slate-800 line-clamp-1 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">{item.content}</p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye className="w-3 h-3" /> {item.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Heart className="w-3 h-3" /> {item.likes || 0}
                      </span>
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={() => handleGenerate(item)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#7C6CFF] to-[#9B87FF] text-white text-sm font-medium hover:shadow-md hover:shadow-purple-200 transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      生成同款
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
