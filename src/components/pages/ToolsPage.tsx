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
  Flame,
  Zap,
  Star,
} from 'lucide-react';

/* ── 工具元数据（结果导向 + 标签 + 徽章） ── */
interface ToolMeta {
  badge?: string;
  resultDesc: string;
  resultTags: string[];
  beforeLabel: string;
  afterLabel: string;
  gradient: string;
  iconBg: string;
}

const TOOL_META: Record<string, ToolMeta> = {
  'product-generator': {
    badge: '🔥 热门',
    resultDesc: '3秒生成可直接用于淘宝/小红书的高级商品图',
    resultTags: ['淘宝主图', '小红书种草', '高级场景图', '白底图'],
    beforeLabel: '普通商品图',
    afterLabel: '高级电商图',
    gradient: 'linear-gradient(135deg, #7B61FF 0%, #9D8FFF 50%, #C4B5FD 100%)',
    iconBg: 'from-violet-500 to-purple-400',
  },
  'ai-photo': {
    badge: '🔥 爆款',
    resultDesc: '一键生成氛围感大片，多种写真风格随心切换',
    resultTags: ['氛围感大片', '朋友圈封面', '个人写真', '风格切换'],
    beforeLabel: '普通自拍',
    afterLabel: '氛围感大片',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)',
    iconBg: 'from-orange-500 to-amber-400',
  },
  'resume': {
    badge: 'NEW',
    resultDesc: 'AI重写简历经历，HR一眼看中的STAR表达',
    resultTags: ['校招求职', '社招跳槽', '简历升级', 'STAR法则'],
    beforeLabel: '普通简历',
    afterLabel: 'STAR简历',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
    iconBg: 'from-blue-500 to-cyan-400',
  },
  'xiaohongshu-generator': {
    badge: '🔥 推荐',
    resultDesc: '生成涨粉小红书封面，种草爆款一键产出',
    resultTags: ['涨粉封面', '种草爆款', '标题生成', '标签推荐'],
    beforeLabel: '普通笔记',
    afterLabel: '爆款封面',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FBCFE8 100%)',
    iconBg: 'from-pink-500 to-rose-400',
  },
  'novel': {
    badge: 'NEW',
    resultDesc: 'AI辅助创作小说，从大纲到成稿一站完成',
    resultTags: ['小说改编', 'IP孵化', '短剧创作', '大纲生成'],
    beforeLabel: '空白文档',
    afterLabel: '完整小说',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
    iconBg: 'from-emerald-500 to-teal-400',
  },
  'background-removal': {
    badge: '🔥 热门',
    resultDesc: '一键精准抠图，电商白底图/证件照秒出',
    resultTags: ['电商白底图', '证件照处理', '多图批量', '透明底'],
    beforeLabel: '复杂背景',
    afterLabel: '精准抠图',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)',
    iconBg: 'from-indigo-500 to-violet-400',
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
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (TOOL_META[t.slug]?.resultTags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerate = (tool: UtilityTool) => {
    const params = new URLSearchParams({ toolId: String(tool.id), type: tool.slug });
    const meta = TOOL_META[tool.slug];
    if (meta) {
      params.set('prompt', meta.resultDesc);
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
                <div className="h-56 bg-slate-100" />
                <div className="p-5 space-y-3 bg-white">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-50 rounded w-full" />
                  <div className="h-10 bg-slate-50 rounded-xl mt-4" />
                </div>
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
          <p className="os-section-desc mt-1">选择你想生成的内容，一键产出商业级结果</p>
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
            {filtered.map((tool, index) => {
              const meta = TOOL_META[tool.slug];
              const Icon = (tool.icon && ICON_MAP[tool.icon]) || Sparkles;
              const hasCover = !!tool.cover_image;
              const resultTags = meta?.resultTags || ((tool.use_cases || []).slice(0, 3).map(uc => uc.title));

              return (
                <div
                  key={tool.id}
                  className="os-tool-card group"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  {/* ── 顶部视觉区 ── */}
                  <div className="os-tool-card-visual">
                    {hasCover ? (
                      <>
                        <img
                          src={tool.cover_image!}
                          alt={tool.name}
                          className="os-tool-card-img"
                          loading="lazy"
                        />
                        {/* Before→After 浮层 */}
                        <div className="os-tool-card-transform">
                          <span className="os-tool-card-transform-before">{meta?.beforeLabel || '原图'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                          <span className="os-tool-card-transform-after">{meta?.afterLabel || '生成'}</span>
                        </div>
                      </>
                    ) : (
                      <div
                        className="os-tool-card-placeholder"
                        style={{ background: meta?.gradient || 'linear-gradient(135deg, #7B61FF, #5B8CFF)' }}
                      >
                        <Icon className="w-14 h-14 text-white/70 mb-3" />
                        <span className="text-white/80 text-sm font-medium">{tool.name}</span>
                        {/* Before→After 浮层 */}
                        <div className="os-tool-card-transform">
                          <span className="os-tool-card-transform-before">{meta?.beforeLabel || '原图'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                          <span className="os-tool-card-transform-after">{meta?.afterLabel || '生成'}</span>
                        </div>
                      </div>
                    )}

                    {/* 徽章 */}
                    {meta?.badge && (
                      <span className="os-tool-card-badge">{meta.badge}</span>
                    )}

                    {/* Hover CTA */}
                    <button
                      onClick={() => handleGenerate(tool)}
                      className="os-tool-card-cta"
                    >
                      立即生成
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ── 信息区 ── */}
                  <div className="os-tool-card-info">
                    {/* 标题 */}
                    <h3 className="os-tool-card-name">{tool.name}</h3>

                    {/* 结果导向描述 */}
                    <p className="os-tool-card-desc">
                      {meta?.resultDesc || tool.description || 'AI智能创作工具'}
                    </p>

                    {/* 结果标签 */}
                    <div className="os-tool-card-tags">
                      {resultTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="os-tool-card-tag">{tag}</span>
                      ))}
                    </div>

                    {/* 主按钮 */}
                    <button
                      onClick={() => handleGenerate(tool)}
                      className="os-tool-card-btn"
                    >
                      <Zap className="w-4 h-4" />
                      立即生成
                    </button>
                  </div>
                </div>
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
