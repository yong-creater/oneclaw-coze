'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Star, Eye, Heart, Sparkles, X, Copy } from 'lucide-react';
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
/*  Shared pill button (outside render to avoid react-hooks/static)    */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function InspirationPage() {
  const router = useRouter();
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [filterStyle, setFilterStyle] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('insp_favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Save favorites
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('insp_favorites', JSON.stringify([...next]));
      return next;
    });
  };

  // Copy prompt content
  const handleCopy = (item: PromptItem) => {
    navigator.clipboard.writeText(item.content || item.title).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(() => {});
  };

  /* ---- Fetch ---- */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.prompts || []);
    } catch (err) {
      console.error('Failed to fetch inspirations:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ---- Derived categories ---- */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(item => {
      const c = item.category || '其他';
      map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  /* ---- Unique styles ---- */
  const uniqueStyles = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => { if (item.style) set.add(item.style); });
    return Array.from(set);
  }, [items]);

  /* ---- Filter ---- */
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeCategory !== '全部' && item.category !== activeCategory) return false;
      if (filterStyle && item.style !== filterStyle) return false;
      return true;
    });
  }, [items, activeCategory, filterStyle]);

  /* ---- Generate similar ---- */
  const handleGenerate = (item: PromptItem) => {
    const params = new URLSearchParams();
    if (item.tool_slug) params.set('toolId', item.tool_slug);
    if (item.content) params.set('prompt', item.content);
    if (item.style) params.set('style', item.style);
    router.push(`/create?${params.toString()}`);
  };

  /* ---- Render ---- */
  return (
    <div className="os-page">
      <div className="os-content">
        {/* Page Title */}
        <div className="os-page-header">
          <h1 className="os-page-title">灵感案例库</h1>
          <p className="os-page-subtitle">从优质案例中获取灵感，一键生成同款内容</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索你想生成的内容，例如: 商品图、小红书、AI写真..."
            className="os-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* 类型筛选 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 scrollbar-hide">
          <Pill label="全部" count={items.length} active={activeCategory === '全部'} onClick={() => setActiveCategory('全部')} />
          {categories.map(cat => (
            <Pill key={cat.label} label={cat.label} count={cat.count} active={activeCategory === cat.label} onClick={() => setActiveCategory(cat.label)} />
          ))}
        </div>

        {/* 风格筛选 */}
        {uniqueStyles.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            <Pill label="全部" active={!filterStyle} onClick={() => setFilterStyle('')} />
            {uniqueStyles.map(style => (
              <Pill key={style} label={style} active={filterStyle === style} onClick={() => setFilterStyle(style)} />
            ))}
          </div>
        )}

        {/* Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-[24px] overflow-hidden shadow-[0_18px_40px_rgba(31,41,55,0.06)] animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="os-empty">
            <div className="os-empty-icon"><Sparkles className="w-8 h-8" /></div>
            <div className="os-empty-title">暂无灵感内容</div>
            <div className="os-empty-desc">换个关键词或分类试试？</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => {
              const isFav = favorites.has(item.id);
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="os-card-static overflow-hidden group"
                  style={{ padding: 0 }}
                >
                  {/* Cover Image — 4:3 */}
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F4F0FF] to-[#EEF7FF] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-[#7C6CFF]/30" />
                      </div>
                    )}
                    {/* Category badge — unified tag */}
                    <span className="os-tag absolute top-3 left-3">
                      {item.category}
                    </span>
                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1F2937] line-clamp-1 mb-1">{item.title}</h3>
                    <p className="text-sm text-[#7B8496] line-clamp-2 mb-3 leading-relaxed">{item.content}</p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="os-tag">#{tag}</span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-[#A0A8B8]">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Stats — 弱化 */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="flex items-center gap-1 text-xs text-[#A0A8B8]">
                        <Eye className="w-3 h-3" /> {item.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#A0A8B8]">
                        <Heart className="w-3 h-3" /> {item.likes || 0}
                      </span>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerate(item)}
                        className="os-btn-primary flex-1 text-sm"
                        style={{ height: 38, fontSize: 13, borderRadius: 12 }}
                      >
                        <Sparkles className="w-4 h-4" />
                        生成同款
                      </button>
                      <button
                        onClick={() => handleCopy(item)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E6E8F0] text-[#6B7280] hover:text-[#7C6CFF] hover:border-[rgba(124,108,255,0.25)] transition-colors"
                        title="复制 Prompt"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
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
