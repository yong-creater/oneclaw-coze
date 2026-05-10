'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Eye, Heart, Copy } from 'lucide-react';

/* ---------- types ---------- */
interface Inspiration {
  id: number;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  style?: string;
  tool_slug?: string;
  tags?: string[];
  views?: number;
  likes?: number;
}

/* ---------- Pill (outside render) ---------- */
function Pill({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`os-btn-capsule ${active ? 'os-btn-capsule-active' : ''}`}>
      {label}
      {count !== undefined && <span className="os-btn-capsule-count">{count}</span>}
    </button>
  );
}

/* ---------- TOOL_MAP for button routing ---------- */
const TOOL_MAP: Record<string, string> = {
  'AI商品图': 'product-generator',
  '商品图': 'product-generator',
  '小红书': 'xiaohongshu-generator',
  '小红书封面': 'xiaohongshu-generator',
  'AI写真': 'ai-photo',
  '写真': 'ai-photo',
};

/* ---------- component ---------- */
export default function PromptPage() {
  const router = useRouter();
  const [items, setItems] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [filterStyle, setFilterStyle] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  /* load favorites from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('insp-fav');
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  /* save favorites */
  const toggleFav = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem('insp-fav', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  /* fetch data */
  useEffect(() => {
    setLoading(true);
    fetch('/api/prompts')
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* categories & styles from data */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(it => {
      const cat = it.category || '未分类';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [items]);

  const uniqueStyles = useMemo(() => {
    const s = new Set<string>();
    items.forEach(it => { if (it.style) s.add(it.style); });
    return Array.from(s);
  }, [items]);

  /* filtered */
  const filtered = useMemo(() => {
    return items.filter(it => {
      if (activeCategory !== '全部' && it.category !== activeCategory) return false;
      if (filterStyle && it.style !== filterStyle) return false;
      if (search) {
        const q = search.toLowerCase();
        return (it.title || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, activeCategory, filterStyle, search]);

  /* handle generate same */
  const handleGenSame = useCallback((it: Inspiration) => {
    const slug = it.tool_slug || TOOL_MAP[it.category || ''] || 'product-generator';
    router.push(`/create?tool=${slug}`);
  }, [router]);

  /* copy prompt */
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  /* ---------- render ---------- */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        <h1 className="os-page-title">灵感案例库</h1>
        <p className="os-page-subtitle">从优质案例中获取灵感，一键生成同款内容</p>

        {/* search */}
        <div className="os-page-search-wrap">
          <Search className="os-page-search-icon" />
          <input
            type="text"
            placeholder="搜索灵感案例..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="os-page-search"
          />
        </div>

        {/* type pills */}
        <div className="os-page-pills">
          <Pill label="全部" count={items.length} active={activeCategory === '全部'} onClick={() => setActiveCategory('全部')} />
          {categories.map(cat => (
            <Pill key={cat.label} label={cat.label} count={cat.count} active={activeCategory === cat.label} onClick={() => setActiveCategory(cat.label)} />
          ))}
        </div>

        {/* style pills */}
        {uniqueStyles.length > 0 && (
          <div className="os-page-pills" style={{ marginBottom: 32 }}>
            <Pill label="全部风格" active={!filterStyle} onClick={() => setFilterStyle('')} />
            {uniqueStyles.map(style => (
              <Pill key={style} label={style} active={filterStyle === style} onClick={() => setFilterStyle(style)} />
            ))}
          </div>
        )}

        {/* masonry grid */}
        <div className="os-insp-masonry">
          {filtered.map(it => (
            <div key={it.id} className="os-insp-card">
              {/* image */}
              <div className="os-insp-card-img-wrap">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="os-insp-card-img" />
                ) : (
                  <div className="os-insp-card-placeholder" />
                )}
                {/* hover overlay: bottom gradient */}
                <div className="os-insp-card-overlay">
                  <div className="os-insp-card-overlay-inner">
                    <span className="os-insp-card-overlay-tag">
                      {it.category || '灵感'}
                    </span>
                    <span className="os-insp-card-overlay-title">{it.title}</span>
                    <div className="os-insp-card-overlay-stats">
                      {typeof it.views === 'number' && <span>{it.views} 浏览</span>}
                      {typeof it.likes === 'number' && <span>{it.likes} 喜欢</span>}
                    </div>
                    <div className="os-insp-card-overlay-actions">
                      <button className="os-insp-gen-btn" onClick={() => handleGenSame(it)}>
                        <Sparkles style={{ width: 14, height: 14 }} />
                        一键生成同款
                      </button>
                      {it.content && (
                        <button className="os-insp-action-btn" onClick={() => handleCopy(it.content!)}>
                          <Copy style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      <button className="os-insp-action-btn" onClick={() => toggleFav(it.id)}>
                        <Heart style={{ width: 14, height: 14 }} fill={favorites.has(it.id) ? '#ff5a7e' : 'none'} stroke={favorites.has(it.id) ? '#ff5a7e' : 'currentColor'} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#A0A8B8' }}>
            {search ? '没有找到匹配的灵感案例' : '暂无灵感案例'}
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E6E8F0', borderTopColor: '#7B61FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
      </div>
    </div>
  );
}
