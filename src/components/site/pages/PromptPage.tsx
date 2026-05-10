'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, Heart, Bookmark, Copy, Search, Loader2 } from 'lucide-react';
import BackToHome from '@/components/site/common/BackToHome';

/* ---------- 数据类型 ---------- */
interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  uses: number;
  likes: number;
  views: number;
  image: string;
  style: string;
  tool_slug: string;
  created_at: string;
}

/* ---------- 混合比例高度 — 瀑布流节奏 ---------- */
const RATIO_HEIGHTS = [
  320,   // ~4:5 短卡
  380,   // ~3:4 中卡
  420,   // ~1:1 方卡
  480,   // ~4:5 高卡
  360,   // ~16:9 宽卡
];

/* 确定性伪随机 — 基于 id 分配高度，避免每次渲染闪烁 */
function cardHeight(id: number): number {
  const idx = (id * 7 + 3) % RATIO_HEIGHTS.length;
  return RATIO_HEIGHTS[idx];
}

/* ---------- Pill 组件 — 渲染外定义 ---------- */
function Pill({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`os-pill ${active ? 'os-pill-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
      {count !== undefined && <span className="os-pill-count">{count}</span>}
    </button>
  );
}

/* ==================== 灵感库页面 ==================== */
export default function PromptPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  /* ---- 加载数据 ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/prompts');
        const d = await res.json();
        setPrompts(d.prompts || d.data || []);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- 分类列表 ---- */
  const categories = useMemo(() => {
    const cats = new Set(prompts.map((p) => p.category));
    return ['全部', ...Array.from(cats)];
  }, [prompts]);

  /* ---- 过滤 ---- */
  const filtered = useMemo(() => {
    let list = prompts;
    if (activeCategory !== '全部') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.content?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [prompts, activeCategory, searchQuery]);

  /* ---- 复制 Prompt ---- */
  const handleCopy = useCallback(
    async (e: React.MouseEvent, p: Prompt) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(p.content || p.title);
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 1500);
      } catch {
        /* empty */
      }
    },
    []
  );

  /* ---- 生成同款 ---- */
  const handleGen = useCallback(
    (e: React.MouseEvent, p: Prompt) => {
      e.stopPropagation();
      const slug = p.tool_slug || 'product-generator';
      router.push(`/create?tool=${slug}&prompt=${encodeURIComponent(p.content || p.title)}`);
    },
    [router]
  );

  /* ---- 加载中 ---- */
  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#7B61FF]" /></div>;

  /* ==================== 渲染 ==================== */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        {/* 顶部 */}
        <BackToHome />
        <h1 className="os-page-title">灵感库</h1>
        <p className="os-page-subtitle">探索 AI 创意灵感，一键生成同款</p>

        {/* 分类 + 搜索 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div className="os-page-pills" style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
            {categories.map((cat) => (
              <Pill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
          <div className="os-page-search-wrap" style={{ marginBottom: 0 }}>
            <Search className="os-page-search-icon" />
            <input
              className="os-page-search"
              placeholder="搜索灵感…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 瀑布流 */}
        {filtered.length === 0 ? (
          <div className="os-project-empty-hero">
            <div className="os-project-empty-icon">
              <Sparkles />
            </div>
            <h3>暂无灵感</h3>
            <p>换个分类或关键词试试</p>
          </div>
        ) : (
          <div className="os-insp-masonry" ref={masonryRef}>
            {filtered.map((p) => {
              const h = cardHeight(p.id);
              return (
                <div
                  key={p.id}
                  className="os-insp-card"
                  onClick={() => handleGen({ stopPropagation: () => {} } as React.MouseEvent, p)}
                >
                  {/* 图片 */}
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="os-insp-card-img"
                      style={{ height: h }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="os-insp-card-img-fallback" style={{ height: h }}>
                      <Sparkles style={{ width: 32, height: 32 }} />
                    </div>
                  )}

                  {/* hover 渐变浮层 */}
                  <div className="os-insp-card-overlay">
                    {/* 左下信息 */}
                    {p.category && (
                      <span className="os-insp-card-overlay-tag">{p.category}</span>
                    )}
                    <div className="os-insp-card-overlay-title">{p.title}</div>
                    <div className="os-insp-card-overlay-stats">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Eye /> {p.views || p.uses || 0}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Heart /> {p.likes || 0}
                      </span>
                    </div>

                    {/* 右下操作 */}
                    <div className="os-insp-card-overlay-actions">
                      <button
                        className="os-insp-card-gen"
                        onClick={(e) => handleGen(e, p)}
                        type="button"
                      >
                        <Sparkles style={{ width: 14, height: 14 }} />
                        生成同款
                      </button>
                      <button
                        className="os-insp-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        title="收藏"
                        type="button"
                      >
                        <Bookmark />
                      </button>
                      <button
                        className="os-insp-card-action"
                        onClick={(e) => handleCopy(e, p)}
                        title={copiedId === p.id ? '已复制' : '复制 Prompt'}
                        type="button"
                      >
                        <Copy />
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
