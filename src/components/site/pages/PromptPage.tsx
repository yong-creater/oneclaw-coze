'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Star, Eye, Heart, Sparkles, X, Copy, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PromptItem {
  id: number;
  title: string;
  description: string;
  category: string;
  style: string;
  tags: string[];
  prompt_text: string;
  image: string | null;
  tool_slug: string;
  views: number;
  likes: number;
}

/* ------------------------------------------------------------------ */
/*  Pill — extracted outside render to avoid react-hooks rule          */
/* ------------------------------------------------------------------ */
function Pill({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`os-btn-capsule ${active ? 'os-btn-capsule-active' : ''}`}
    >
      {label}
      {count !== undefined && <span className="os-btn-capsule-count">{count}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Random aspect ratios for masonry feel                              */
/* ------------------------------------------------------------------ */
const ASPECT_RATIOS = ['4/3', '3/4', '4/5', '16/9', '1/1'];

function getCardAspect(id: number): string {
  return ASPECT_RATIOS[id % ASPECT_RATIOS.length];
}

/* ------------------------------------------------------------------ */
/*  Tool label map                                                     */
/* ------------------------------------------------------------------ */
const TOOL_LABELS: Record<string, string> = {
  'product-generator': 'AI商品图',
  'ai-photo': 'AI写真',
  'xiaohongshu-generator': '小红书封面',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function PromptPage() {
  const router = useRouter();
  const [items, setItems] = useState<PromptItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [filterStyle, setFilterStyle] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  /* ---- Data ---- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== '全部') params.set('category', activeCategory);
    if (filterStyle) params.set('style', filterStyle);

    fetch(`/api/prompts?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.prompts)) setItems(data.prompts);
        else if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  }, [activeCategory, filterStyle]);

  /* ---- Favorites from localStorage ---- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oneclaw_fav_prompts');
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const toggleFav = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('oneclaw_fav_prompts', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  /* ---- Derived ---- */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(it => { if (it.category) map.set(it.category, (map.get(it.category) || 0) + 1); });
    return [...map.entries()].map(([label, count]) => ({ label, count }));
  }, [items]);

  const uniqueStyles = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => { if (it.style) s.add(it.style); });
    return [...s];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(it => {
      if (search) {
        const q = search.toLowerCase();
        if (!it.title?.toLowerCase().includes(q) && !it.description?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, search]);

  /* ---- Generate same ---- */
  const handleGenerate = useCallback((item: PromptItem) => {
    router.push(`/create?tool=${item.tool_slug || 'product-generator'}`);
  }, [router]);

  /* ---- Copy prompt ---- */
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  /* ---- Render ---- */
  return (
    <div className="os-page">
      <div className="os-content">
        {/* Page Title */}
        <div className="os-page-header">
          <h1 className="os-page-title">灵感案例库</h1>
          <p className="os-page-subtitle">从优质案例中获取灵感，一键生成同款内容</p>
        </div>

        {/* Search */}
        <div className="max-w-lg mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索灵感，比如：高级质感、极简风格…"
            className="os-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 scrollbar-hide">
          <Pill label="全部" count={items.length} active={activeCategory === '全部'} onClick={() => setActiveCategory('全部')} />
          {categories.map(cat => (
            <Pill key={cat.label} label={cat.label} count={cat.count} active={activeCategory === cat.label} onClick={() => setActiveCategory(cat.label)} />
          ))}
        </div>

        {/* Style Filters */}
        {uniqueStyles.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
            <Pill label="全部" active={!filterStyle} onClick={() => setFilterStyle('')} />
            {uniqueStyles.map(style => (
              <Pill key={style} label={style} active={filterStyle === style} onClick={() => setFilterStyle(style)} />
            ))}
          </div>
        )}

        {/* Masonry Grid */}
        <div className="os-masonry">
          {filtered.map(item => {
            const hasImg = !!item.image;
            const aspect = hasImg ? undefined : getCardAspect(item.id);

            return (
              <div key={item.id} className="os-masonry-item">
                <div className="os-masonry-card">
                  {/* Image */}
                  <div className="os-masonry-img-wrap" style={aspect ? { aspectRatio: aspect } : undefined}>
                    {hasImg ? (
                      <img src={item.image!} alt={item.title} loading="lazy" className="os-masonry-img" />
                    ) : (
                      <div className="os-masonry-img-fallback">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="os-masonry-hover">
                      <button className="os-masonry-hover-btn" onClick={() => handleGenerate(item)}>
                        <Wand2 className="w-4 h-4" />生成同款
                      </button>
                      <button className="os-masonry-hover-btn" onClick={() => handleCopy(item.prompt_text || item.description)}>
                        <Copy className="w-4 h-4" />查看 Prompt
                      </button>
                      <button className="os-masonry-hover-btn" onClick={() => toggleFav(item.id)}>
                        <Heart className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-red-400 text-red-400' : ''}`} />
                        {favorites.has(item.id) ? '已收藏' : '收藏'}
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="os-masonry-info">
                    {/* Tool type tag */}
                    {item.tool_slug && (
                      <span className="os-card-tag">{TOOL_LABELS[item.tool_slug] || item.tool_slug}</span>
                    )}
                    <h3 className="os-masonry-title">{item.title}</h3>
                    {/* Always-visible generate button */}
                    <button className="os-masonry-gen-btn" onClick={() => handleGenerate(item)}>
                      <Wand2 className="w-3.5 h-3.5" />生成同款
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty */}
        {filtered.length === 0 && items.length > 0 && (
          <div className="os-empty">
            <div className="os-empty-icon"><Search className="w-8 h-8" /></div>
            <div className="os-empty-title">没有找到匹配的灵感</div>
            <div className="os-empty-desc">换个关键词试试？</div>
          </div>
        )}
        {items.length === 0 && (
          <div className="os-empty">
            <div className="os-empty-icon"><Sparkles className="w-8 h-8" /></div>
            <div className="os-empty-title">灵感库正在建设中</div>
            <div className="os-empty-desc">稍后再来看看</div>
          </div>
        )}
      </div>
    </div>
  );
}
