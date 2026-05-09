'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Wrench,
  ShoppingBag,
  Heart,
  PenTool,
} from 'lucide-react';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Scissors,
  Camera,
  ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Heart,
  PenTool,
};

// 默认渐变色 — 按工具类型分配
const DEFAULT_GRADIENTS = [
  'from-orange-500 to-amber-500',
  'from-violet-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
];

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
    // 优先读缓存
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

  // 点击工具 → 进入统一生成工作台，带入 toolId
  const handleUseTool = (tool: UtilityTool) => {
    const params = new URLSearchParams({ toolId: String(tool.id), type: tool.slug });
    if (tool.description) {
      params.set('prompt', tool.description);
    }
    router.push(`/create?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="os-page">
        <div className="page-container">
          <div className="mb-8">
            <h1 className="os-h1">工具库</h1>
            <p className="os-section-desc">选择工具，快速生成内容</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="os-card p-0 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
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
        {/* 标题区 */}
        <div className="mb-8 animate-fade-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#5B8CFF] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="os-h1">工具库</h1>
              <p className="os-section-desc">选择工具，快速生成内容</p>
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-8 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工具..."
            className="os-search-input"
          />
        </div>

        {/* 工具网格 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tool, index) => {
              const Icon = (tool.icon && ICON_MAP[tool.icon]) || Package;
              const gradient = tool.color || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
              const hasCover = !!tool.cover_image;
              const useCases = (tool.use_cases || []).slice(0, 3);

              return (
                <div
                  key={tool.id}
                  className="os-card p-0 overflow-hidden animate-fade-slide-up group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* 封面图区域 */}
                  {hasCover ? (
                    <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                      <img
                        src={tool.cover_image!}
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon className="w-12 h-12 text-white/80" />
                    </div>
                  )}

                  {/* 文字区域 */}
                  <div className="p-5">
                    {/* 工具名称 */}
                    <h3 className="os-h3">{tool.name}</h3>

                    {/* 一句话说明 */}
                    <p className="os-caption mt-1.5 line-clamp-2">
                      {tool.description || 'AI智能创作工具'}
                    </p>

                    {/* 适用人群标签 */}
                    {useCases.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {useCases.map((uc) => (
                          <span
                            key={uc.title}
                            className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium
                                       bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {uc.title}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 使用按钮 */}
                    <button
                      onClick={() => handleUseTool(tool)}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 h-10
                                 rounded-xl text-sm font-medium text-white
                                 bg-gradient-to-r from-[#7B61FF] to-[#5B8CFF]
                                 hover:from-[#6B51EF] hover:to-[#4B7CEF]
                                 transition-all duration-200
                                 shadow-sm hover:shadow-md"
                    >
                      使用
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
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
