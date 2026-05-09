'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  PenTool,
  BookOpen,
  Scissors,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/* ── 工具元数据（精简版） ── */
interface ToolMeta {
  badge?: string;
  desc: string;
  gradient: string;
}

const TOOL_META: Record<string, ToolMeta> = {
  'product-generator': {
    badge: '🔥 热门',
    desc: '3秒生成高级电商商品图',
    gradient: 'linear-gradient(135deg, #7B61FF 0%, #9D8FFF 50%, #C4B5FD 100%)',
  },
  'ai-photo': {
    badge: '🔥 热门',
    desc: '一键生成氛围感写真大片',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)',
  },
  'resume': {
    badge: 'NEW',
    desc: 'AI优化简历，HR直接约面试',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
  },
  'xiaohongshu-generator': {
    badge: 'NEW',
    desc: '生成涨粉小红书爆款封面',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FBCFE8 100%)',
  },
  'novel': {
    desc: 'AI辅助小说创作，大纲到成稿',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
  },
  'background-removal': {
    badge: '🔥 热门',
    desc: '一键智能抠图，秒出白底图',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)',
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Heart,
  PenTool,
  BookOpen,
  Scissors,
  Sparkles,
};

interface UtilityTool {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  cover_image: string | null;
  color: string | null;
  sort_order: number;
  use_cases: { title: string; desc: string }[] | null;
}

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const CACHE_KEY = 'oneclaw_utility_tools_cache';
    const CACHE_TTL = 5 * 60 * 1000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setTools(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch('/api/utility-tools')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tools)) {
          setTools(data.tools);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.tools, timestamp: Date.now() }));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (tool: UtilityTool) => {
    const meta = TOOL_META[tool.slug];
    const params = new URLSearchParams({ toolId: String(tool.id), type: tool.slug });
    if (meta) {
      params.set('prompt', meta.desc);
    } else if (tool.description) {
      params.set('prompt', tool.description);
    }
    router.push(`/create?${params.toString()}`);
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="os-page">
        <div className="page-container">
          <div className="mb-10">
            <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-72 bg-slate-50 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="os-page">
      <div className="page-container">
        {/* ── 标题区 ── */}
        <div className="mb-10">
          <h1 className="os-h1">AI 创作工具</h1>
          <p className="os-section-desc mt-1">选择你想生成的内容，快速获得商业级结果</p>
        </div>

        {/* ── 搜索栏 ── */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索你想生成的内容，比如商品图、小红书、AI写真"
            className="os-search-input"
          />
        </div>

        {/* ── 工具网格 ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((tool) => {
              const meta = TOOL_META[tool.slug];
              const Icon = (tool.icon && ICON_MAP[tool.icon]) || Sparkles;
              const hasCover = !!tool.cover_image;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleCreate(tool)}
                  className="os-tl-card group"
                >
                  {/* ── 视觉区 (70%) ── */}
                  <div className="os-tl-visual">
                    {hasCover ? (
                      <img
                        src={tool.cover_image!}
                        alt={tool.name}
                        className="os-tl-img"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="os-tl-placeholder"
                        style={{ background: meta?.gradient || 'linear-gradient(135deg, #7B61FF, #5B8CFF)' }}
                      >
                        <Icon className="w-12 h-12 text-white/60" />
                      </div>
                    )}

                    {/* Hover CTA */}
                    <div className="os-tl-cta">
                      <span>立即创作</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* 徽章 (最多一个) */}
                    {meta?.badge && (
                      <span className="os-tl-badge">{meta.badge}</span>
                    )}
                  </div>

                  {/* ── 信息区 (30%) ── */}
                  <div className="os-tl-info">
                    <h3 className="os-tl-name">{tool.name}</h3>
                    <p className="os-tl-desc">{meta?.desc || tool.description || 'AI智能创作工具'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm">未找到匹配的工具</p>
          </div>
        )}
      </div>
    </div>
  );
}
