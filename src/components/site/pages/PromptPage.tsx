'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Wand2, Star, Eye, Heart,
  ShoppingBag, BookOpen, Camera, Image as ImageIcon, LayoutTemplate, Video,
  Sparkles, SlidersHorizontal
} from 'lucide-react';

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  author: string | null;
  uses: number | null;
  created_at: string;
  tools?: { id: number; name: string; logo: string | null } | null;
}

// 用户可见的分类
const DISPLAY_CATEGORIES = [
  { key: 'all', label: '全部', icon: Sparkles },
  { key: '商品图', label: '商品图', icon: ShoppingBag, color: '#FF6B6B' },
  { key: '小红书', label: '小红书', icon: BookOpen, color: '#FF6B9D' },
  { key: 'AI写真', label: 'AI写真', icon: Camera, color: '#7B61FF' },
  { key: '海报', label: '海报', icon: ImageIcon, color: '#5B8CFF' },
  { key: '封面图', label: '封面图', icon: LayoutTemplate, color: '#6EE7FF' },
  { key: '详情页', label: '详情页', icon: LayoutTemplate, color: '#5B8CFF' },
  { key: '视频封面', label: '视频封面', icon: Video, color: '#7B61FF' },
];

// 后台分类到展示分类的映射
const CATEGORY_MAP: Record<string, string> = {
  '场景描述': '封面图',
  '特效制作': '海报',
  '角色扮演': 'AI写真',
  '风格迁移': '商品图',
};

// 每个分类的渐变和图标（用于占位图）
const CATEGORY_VISUAL: Record<string, { gradient: string; icon: typeof ShoppingBag }> = {
  '场景描述': { gradient: 'linear-gradient(135deg, #5B8CFF 0%, #6EE7FF 100%)', icon: LayoutTemplate },
  '特效制作': { gradient: 'linear-gradient(135deg, #7B61FF 0%, #5B8CFF 100%)', icon: ImageIcon },
  '角色扮演': { gradient: 'linear-gradient(135deg, #7B61FF 0%, #6EE7FF 100%)', icon: Camera },
  '风格迁移': { gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', icon: ShoppingBag },
};

// 每个展示分类的默认渐变
const DISPLAY_VISUAL: Record<string, { gradient: string; icon: typeof ShoppingBag; color: string }> = {
  '商品图': { gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', icon: ShoppingBag, color: '#FF6B6B' },
  '小红书': { gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44DFF 100%)', icon: BookOpen, color: '#FF6B9D' },
  'AI写真': { gradient: 'linear-gradient(135deg, #7B61FF 0%, #6EE7FF 100%)', icon: Camera, color: '#7B61FF' },
  '海报': { gradient: 'linear-gradient(135deg, #5B8CFF 0%, #7B61FF 100%)', icon: ImageIcon, color: '#5B8CFF' },
  '封面图': { gradient: 'linear-gradient(135deg, #6EE7FF 0%, #5B8CFF 100%)', icon: LayoutTemplate, color: '#5B8CFF' },
  '详情页': { gradient: 'linear-gradient(135deg, #5B8CFF 0%, #6EE7FF 100%)', icon: LayoutTemplate, color: '#5B8CFF' },
  '视频封面': { gradient: 'linear-gradient(135deg, #7B61FF 0%, #5B8CFF 100%)', icon: Video, color: '#7B61FF' },
};

export default function PromptPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilter, setShowFilter] = useState(false);

  // 加载收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oneclaw_inspiration_favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // 保存收藏
  useEffect(() => {
    try {
      localStorage.setItem('oneclaw_inspiration_favorites', JSON.stringify([...favorites]));
    } catch {}
  }, [favorites]);

  // 加载数据
  useEffect(() => {
    const CACHE_KEY = 'oneclaw_prompts_cache';
    const CACHE_TTL = 5 * 60 * 1000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setPrompts(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch('/api/prompts')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data?.prompts) ? data.prompts : [];
        setPrompts(items);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: items, timestamp: Date.now() }));
        } catch {}
      })
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  const getDisplayCategory = useCallback((backendCat: string): string => {
    return CATEGORY_MAP[backendCat] || backendCat;
  }, []);

  const filtered = prompts.filter(p => {
    const displayCat = getDisplayCategory(p.category);
    if (activeCategory !== 'all' && displayCat !== activeCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (p.title || '').toLowerCase().includes(s) ||
        (p.content || '').toLowerCase().includes(s) ||
        (p.tags || []).some(t => t.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = (prompt: Prompt) => {
    const type = getDisplayCategory(prompt.category);
    const typeSlugMap: Record<string, string> = {
      '商品图': 'product-generator',
      '小红书': 'xiaohongshu-generator',
      'AI写真': 'ai-photo',
      '海报': 'poster-design',
      '封面图': 'xiaohongshu-generator',
      '详情页': 'product-page',
      '视频封面': 'product-generator',
    };
    const typeSlug = typeSlugMap[type] || 'product-generator';

    const tags = (prompt.tags || []).map(t => t.toLowerCase());
    let recStyle = '';
    let recRatio = '';
    if (typeSlug === 'ai-photo') {
      if (tags.some(t => t.includes('韩系') || t.includes('清新') || t.includes('自然'))) recStyle = 'korean-fresh';
      else if (tags.some(t => t.includes('复古') || t.includes('胶片') || t.includes('怀旧'))) recStyle = 'retro-film';
      else if (tags.some(t => t.includes('质感') || t.includes('高级') || t.includes('杂志'))) recStyle = 'luxury';
      else recStyle = 'korean-fresh';
      recRatio = '3:4';
    } else if (typeSlug === 'product-generator') {
      if (tags.some(t => t.includes('场景') || t.includes('氛围') || t.includes('生活'))) recStyle = 'lifestyle';
      else if (tags.some(t => t.includes('白底') || t.includes('简洁') || t.includes('干净') || t.includes('极简'))) recStyle = 'minimal';
      else recStyle = 'premium';
      recRatio = '1:1';
    } else if (typeSlug === 'xiaohongshu-generator') {
      if (tags.some(t => t.includes('甜美') || t.includes('可爱') || t.includes('少女'))) recStyle = 'cute';
      else if (tags.some(t => t.includes('高级') || t.includes('质感'))) recStyle = 'premium';
      else recStyle = 'fresh';
      recRatio = '3:4';
    } else if (typeSlug === 'poster-design') {
      if (tags.some(t => t.includes('节日') || t.includes('圣诞') || t.includes('新年'))) recStyle = 'festive';
      else if (tags.some(t => t.includes('极简') || t.includes('简约'))) recStyle = 'minimal';
      else if (tags.some(t => t.includes('生活') || t.includes('场景'))) recStyle = 'lifestyle';
      else recStyle = 'premium';
      recRatio = '3:4';
    } else if (typeSlug === 'product-page') {
      if (tags.some(t => t.includes('科技') || t.includes('数码'))) recStyle = 'tech';
      else if (tags.some(t => t.includes('可爱') || t.includes('甜美'))) recStyle = 'cute';
      else recStyle = 'premium';
      recRatio = '2:3';
    }

    const params = new URLSearchParams({
      prompt: prompt.content,
      type: typeSlug,
    });
    if (recStyle) params.set('style', recStyle);
    if (recRatio) params.set('ratio', recRatio);
    router.push(`/create?${params.toString()}`);
  };

  const getCategoryCount = (catKey: string): number => {
    if (catKey === 'all') return prompts.length;
    return prompts.filter(p => getDisplayCategory(p.category) === catKey).length;
  };

  const favoriteCount = favorites.size;

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
              <p className="os-section-desc !mt-1">看看别人正在生成什么内容，一键生成同款。</p>
            </div>
          </div>
          <button
            className="os-insp-fav-btn"
            onClick={() => {
              if (favoriteCount > 0) setActiveCategory('all');
            }}
          >
            <Star className={`w-4 h-4 ${favoriteCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
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
            {filtered.map((prompt, index) => {
              const catVisual = CATEGORY_VISUAL[prompt.category];
              const displayVisual = DISPLAY_VISUAL[getDisplayCategory(prompt.category)] || DISPLAY_VISUAL['商品图'];
              const visual = catVisual
                ? { gradient: catVisual.gradient, icon: catVisual.icon }
                : { gradient: displayVisual.gradient, icon: displayVisual.icon };
              const CatIcon = visual.icon;
              const displayCat = getDisplayCategory(prompt.category);
              const catColor = displayVisual.color || '#7B61FF';
              const isFav = favorites.has(prompt.id);
              const uses = prompt.uses || 0;
              // 使用 id 作为确定性伪随机值
              const pseudoViews = ((prompt.id * 37 + 13) % 900) + 100;
              const pseudoLikes = ((prompt.id * 23 + 7) % 90) + 10;

              return (
                <div
                  key={prompt.id}
                  className="os-insp-card-v2 animate-fade-slide-up"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                >
                  {/* Cover Image */}
                  <div className="os-insp-card-cover" style={{ background: visual.gradient }}>
                    <CatIcon className="w-10 h-10 text-white/80" />
                    <span className="text-white/90 text-sm font-medium mt-1">{displayCat}</span>

                    {/* Category Badge */}
                    <span className="os-insp-card-badge" style={{ background: catColor }}>{displayCat}</span>

                    {/* Favorite Star */}
                    <button
                      className={`os-insp-card-star ${isFav ? 'os-insp-card-star-active' : ''}`}
                      onClick={(e) => toggleFavorite(prompt.id, e)}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Hover Overlay */}
                    <div className="os-insp-card-hover-overlay">
                      <button className="os-insp-card-cta" onClick={() => handleGenerate(prompt)}>
                        <Wand2 className="w-4 h-4" />
                        <span>生成同款</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="os-insp-card-body">
                    <h3 className="os-insp-card-title">{prompt.title}</h3>
                    <p className="os-insp-card-desc">
                      {prompt.content.length > 50 ? prompt.content.slice(0, 50) + '...' : prompt.content}
                    </p>

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="os-insp-card-tags">
                        {prompt.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="os-insp-card-tag">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="os-insp-card-stats">
                      <span className="os-insp-card-stat">
                        <Eye className="w-3.5 h-3.5" />
                        {pseudoViews}
                      </span>
                      <span className="os-insp-card-stat">
                        <Heart className="w-3.5 h-3.5" />
                        {pseudoLikes}
                      </span>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={() => handleGenerate(prompt)}
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
