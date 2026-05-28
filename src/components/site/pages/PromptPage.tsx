'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Bookmark, Search, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

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

/* ---------- 固定分类标签（用户需求：只保留3+全部） ---------- */
const FIXED_CATEGORIES = ['全部', 'AI商品图', 'AI写真', '小红书封面'] as const;

/* 分类对应的默认生成参数 */
const CATEGORY_DEFAULTS: Record<string, { style: string; ratio: string; count: number }> = {
  'AI商品图': { style: 'premium', ratio: '1:1', count: 4 },
  'AI写真': { style: 'korean', ratio: '3:4', count: 4 },
  '小红书封面': { style: 'fresh', ratio: '3:4', count: 4 },
};

/* ---------- 混合比例高度 — 瀑布流节奏 ---------- */
const RATIO_HEIGHTS = [
  280,   // ~16:9 宽卡
  340,   // ~4:5 短卡
  400,   // ~3:4 中卡
  460,   // ~1:1 方卡
  540,   // ~4:5 大卡（视觉冲击）
  360,   // ~4:5 中短卡
  480,   // ~3:4 高卡
  320,   // ~16:9 短宽卡
  520,   // ~4:5 大图（节奏重音）
  380,   // ~3:4 中卡
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
      {count !== undefined && count > 0 && <span className="os-pill-count">{count}</span>}
    </button>
  );
}

/* ==================== 灵感库页面 ==================== */
export default function PromptPage() {
  const router = useRouter();
  const { requireAuth, dailyQuota } = useUser();
  const { showAlert } = useModal();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const masonryRef = useRef<HTMLDivElement>(null);

  /* ---- 加载数据 ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/prompts');
        const d = await res.json();
        const allPrompts = d.prompts || d.data || [];
        // 只保留3个核心工具的灵感数据
        const filtered = allPrompts.filter(
          (p: Prompt) => p.category === 'AI商品图' || p.category === 'AI写真' || p.category === '小红书封面'
        );
        setPrompts(filtered);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- 分类计数 ---- */
const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FIXED_CATEGORIES.forEach((cat) => {
      if (cat === '全部') {
        counts[cat] = prompts.length;
      } else {
        counts[cat] = prompts.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, [prompts]);

  /* ---- 过滤 + 排序 ---- */
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
    // 排序：AI商品图 > AI写真 > 小红书封面，同分类内按 is_featured > uses > likes
    const categoryOrder = { 'AI商品图': 0, 'AI写真': 1, '小红书封面': 2 };
    return [...list].sort((a, b) => {
      const ca = categoryOrder[a.category as keyof typeof categoryOrder] ?? 9;
      const cb = categoryOrder[b.category as keyof typeof categoryOrder] ?? 9;
      if (ca !== cb) return ca - cb;
      return (b.uses + b.likes) - (a.uses + a.likes);
    });
  }, [prompts, activeCategory, searchQuery]);

  /* ---- 生成同款（跳转新创作工作台 + 自动填充参数） ---- */
  const handleGen = useCallback(
    (e: React.MouseEvent, p: Prompt) => {
      e.stopPropagation();

      // 每日额度检查（-2=无限制跳过，-1=未登录不阻止，null=加载中不阻止）
      if (dailyQuota !== null && dailyQuota !== -2 && dailyQuota !== -1 && dailyQuota <= 0) {
        showAlert('今日免费额度已用完', '注册登录后可继续生成作品，并同步保存你的创作记录。', 'quota-exhausted');
        return;
      }

      const defaults = CATEGORY_DEFAULTS[p.category] || CATEGORY_DEFAULTS['AI商品图'];

      // 构建跳转参数：跳转新创作工作台（首页），带入 prompt + 参数
      const params = new URLSearchParams({
        prompt: p.content || p.title,
        style: p.style || defaults.style,
        ratio: defaults.ratio,
        sourceType: 'inspiration',
      });
      if (p.image) params.set('imageUrl', p.image);

      const targetUrl = `/?${params.toString()}`;

      // 登录拦截：未登录时弹出登录弹窗，登录后继续执行跳转
      if (!requireAuth(() => { router.push(targetUrl); })) return;
      // 已登录时 requireAuth 返回 true，需要手动执行跳转
      router.push(targetUrl);
    },
    [router, requireAuth, dailyQuota, showAlert]
  );

  /* ---- 加载中 ---- */
  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#7B61FF]" /></div>;

  /* ==================== 渲染 ==================== */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        {/* 顶部 */}
        <h1 className="os-page-title">创作灵感</h1>
        <p className="os-page-subtitle">探索灵感，生成你的创意</p>

        {/* 分类 + 搜索 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div className="os-page-pills" style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
            {FIXED_CATEGORIES.map((cat) => (
              <Pill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                count={categoryCounts[cat]}
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
                    <div className="os-insp-card-overlay-title">{p.title}</div>
                    <div className="os-insp-card-overlay-actions">
                      <button
                        className="os-insp-card-gen"
                        onClick={(e) => handleGen(e, p)}
                        type="button"
                      >
                        <Sparkles style={{ width: 13, height: 13 }} />
                        应用灵感
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
