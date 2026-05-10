'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Wand2, Star, Eye, Heart,
  ShoppingBag, BookOpen, Camera, Image as ImageIcon, LayoutTemplate, Layers,
  Sparkles, SlidersHorizontal, FolderOpen
} from 'lucide-react';
import { getInspirations, getInspirationCategories, type InspirationItem } from '@/lib/tool-workflow-config';

// 展示分类配置
const DISPLAY_CATEGORIES = [
  { key: 'all', label: '全部', icon: Sparkles, color: '#7C6CFF' },
  { key: '商品图', label: '商品图', icon: ShoppingBag, color: '#FF6B6B' },
  { key: '小红书', label: '小红书', icon: BookOpen, color: '#FF6B9D' },
  { key: 'AI写真', label: 'AI写真', icon: Camera, color: '#7B61FF' },
  { key: '海报', label: '海报', icon: ImageIcon, color: '#5B8CFF' },
  { key: '抠图', label: '抠图', icon: Layers, color: '#8B5CF6' },
  { key: '详情页', label: '详情页', icon: LayoutTemplate, color: '#5B8CFF' },
];

export default function PromptPage() {
  const router = useRouter();
  const [allInspirations, setAllInspirations] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);

  // 加载收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oneclaw_inspiration_favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  // 保存收藏
  useEffect(() => {
    try {
      localStorage.setItem('oneclaw_inspiration_favorites', JSON.stringify([...favorites]));
    } catch { /* ignore */ }
  }, [favorites]);

  // 加载灵感数据
  useEffect(() => {
    const data = getInspirations();
    setAllInspirations(data);
    setLoading(false);
  }, []);

  const getCategoryCount = useCallback((catKey: string): number => {
    if (catKey === 'all') return allInspirations.length;
    return allInspirations.filter(item => item.categoryLabel === catKey).length;
  }, [allInspirations]);

  const filtered = allInspirations.filter(item => {
    if (activeCategory !== 'all' && item.categoryLabel !== activeCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(s) ||
        item.desc.toLowerCase().includes(s) ||
        item.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = (item: InspirationItem) => {
    const params = new URLSearchParams({
      prompt: item.title + ' ' + item.desc,
      type: item.toolSlug,
    });
    if (item.style) params.set('style', item.style);
    if (item.ratio) params.set('ratio', item.ratio);
    router.push(`/create?${params.toString()}`);
  };

  const favoriteCount = favorites.size;

  // 获取分类颜色
  const getCatColor = (catLabel: string): string => {
    const cat = DISPLAY_CATEGORIES.find(c => c.key === catLabel);
    return cat?.color || '#7C6CFF';
  };

  return (
    <div className="os-page">
      <div className="os-content os-insp-page">

        {/* ===== Header ===== */}
        <div className="os-insp-header animate-fade-slide-up">
          <div className="flex items-center gap-3">
            <div className="os-insp-header-icon">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="os-h1 !mb-0">灵感案例库</h1>
              <p className="os-section-desc !mt-1">从优质案例中获取灵感，一键生成同款内容</p>
            </div>
          </div>
          <button
            className="os-insp-fav-btn"
            onClick={() => {
              if (favoriteCount > 0) setActiveCategory('all');
            }}
          >
            <FolderOpen className={`w-4 h-4 ${favoriteCount > 0 ? 'text-amber-500' : ''}`} />
            <span>我的收藏</span>
            {favoriteCount > 0 && <span className="os-insp-fav-badge">{favoriteCount}</span>}
          </button>
        </div>

        {/* ===== Search + Filter ===== */}
        <div className="os-insp-search-row animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="os-insp-search-box">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索你想生成的内容，例如: 小红书封面、节日海报、AI写真..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="os-insp-search-input"
            />
          </div>
          <button
            className={`os-insp-filter-btn ${showFilter ? 'os-insp-filter-btn-active' : ''}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>筛选</span>
          </button>
        </div>

        {/* ===== Category Tabs ===== */}
        <div className="os-insp-tabs-row animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="os-insp-tabs-scroll">
            {DISPLAY_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key;
              const count = getCategoryCount(cat.key);
              if (count === 0 && cat.key !== 'all') return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`os-insp-tab ${isActive ? 'os-insp-tab-active' : ''}`}
                >
                  {isActive && <cat.icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                  <span className="os-insp-tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Loading ===== */}
        {loading && (
          <div className="os-insp-loading">
            <div className="os-insp-spinner" />
            <p>加载灵感中...</p>
          </div>
        )}

        {/* ===== Empty ===== */}
        {!loading && filtered.length === 0 && (
          <div className="os-insp-empty">
            <div className="os-insp-empty-icon">
              <Sparkles className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">未找到匹配的灵感案例</p>
          </div>
        )}

        {/* ===== Cards Grid ===== */}
        {!loading && filtered.length > 0 && (
          <div className="os-insp-grid">
            {filtered.map((item, index) => {
              const catColor = getCatColor(item.categoryLabel);
              const isFav = favorites.has(item.id);
              const views = item.views || 0;
              const likes = item.likes || 0;

              return (
                <div
                  key={item.id}
                  className="os-insp-card-v2 animate-fade-slide-up"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                >
                  {/* Cover Image */}
                  <div className="os-insp-card-cover">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="os-insp-card-img"
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    <span className="os-insp-card-badge" style={{ background: catColor }}>
                      {item.categoryLabel}
                    </span>

                    {/* Favorite Star */}
                    <button
                      className={`os-insp-card-star ${isFav ? 'os-insp-card-star-active' : ''}`}
                      onClick={(e) => toggleFavorite(item.id, e)}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Hover Overlay */}
                    <div className="os-insp-card-hover-overlay">
                      <button className="os-insp-card-cta" onClick={() => handleGenerate(item)}>
                        <Wand2 className="w-4 h-4" />
                        <span>生成同款</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="os-insp-card-body">
                    <h3 className="os-insp-card-title">{item.title}</h3>
                    <p className="os-insp-card-desc">{item.desc}</p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="os-insp-card-tags">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="os-insp-card-tag">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="os-insp-card-stats">
                      <span className="os-insp-card-stat">
                        <Eye className="w-3.5 h-3.5" />
                        {views}
                      </span>
                      <span className="os-insp-card-stat">
                        <Heart className="w-3.5 h-3.5" />
                        {likes}
                      </span>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={() => handleGenerate(item)}
                      className="os-insp-card-gen-btn"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>生成同款</span>
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
