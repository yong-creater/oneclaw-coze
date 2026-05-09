'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
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
};

// 默认渐变色 — 统一蓝紫体系
const DEFAULT_GRADIENTS = [
  'from-[#7B61FF] to-[#5B8CFF]',
  'from-[#5B8CFF] to-[#6EE7FF]',
  'from-[#7B61FF] to-[#A78BFA]',
  'from-[#5B8CFF] to-[#7B61FF]',
  'from-[#7B61FF] to-[#6EE7FF]',
  'from-[#6EE7FF] to-[#5B8CFF]',
  'from-[#A78BFA] to-[#5B8CFF]',
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
  tool_type: string | null;
  use_cases: { title: string; desc: string }[] | null;
}

// slug 到路由的映射
const SLUG_ROUTE_MAP: Record<string, string> = {
  'product-generator': '/product-generator',
  'background-removal': '/background-removal',
  'ai-photo': '/ai-photo',
  'product-poster': '/product-poster',
  'xiaohongshu-generator': '/xiaohongshu-generator',
  'novel': '/novel',
  'resume': '/resume',
  'productpage': '/productpage',
};

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setActiveToolRoute } = useMenu();

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

  const handleToolClick = (tool: UtilityTool) => {
    const route = SLUG_ROUTE_MAP[tool.slug] || `/${tool.slug}`;
    setActiveToolRoute(route);
    router.push(route);
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
                <div className="h-36 bg-slate-100 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
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
              const gradient = DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
              const hasCover = !!tool.cover_image;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="os-card p-0 overflow-hidden animate-fade-slide-up cursor-pointer group"
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
                    <h3 className="os-h3">{tool.name}</h3>
                    <p className="os-caption mt-1.5 line-clamp-2">
                      {tool.description || 'AI智能创作工具'}
                    </p>
                    {/* 标签 + 进入 */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-1.5">
                        {(tool.use_cases || []).slice(0, 2).map((uc: { title: string; desc: string }) => (
                          <span key={uc.title} className="os-btn-capsule !h-6 !text-xs !px-2.5 pointer-events-none">
                            {uc.title}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-[#7B61FF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        进入 <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
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
