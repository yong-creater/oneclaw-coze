'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Search,
  ArrowRight,
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
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
    async function fetchTools() {
      try {
        const res = await fetch('/api/utility-tools', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.tools)) {
          setTools(data.tools);
        }
      } catch (e) {
        console.error('Failed to fetch tools:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
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
        <div className="mb-6">
          <h1 className="os-section-title text-2xl">小工具</h1>
          <p className="os-section-desc">选择工具，快速生成内容</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
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
    );
  }

  return (
    <div className="os-page">
      {/* 标题区 */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-section-title text-2xl">小工具</h1>
        <p className="os-section-desc">选择工具，快速生成内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
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
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((tool, index) => {
            const Icon = (tool.icon && ICON_MAP[tool.icon]) || Package;
            const gradient = DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
            const hasCover = !!tool.cover_image;

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="os-card p-0 overflow-hidden animate-stagger-in cursor-pointer group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 封面图区域 */}
                {hasCover ? (
                  <div className="relative h-36 bg-slate-50 overflow-hidden">
                    <img
                      src={tool.cover_image!}
                      alt={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* 底部渐变遮罩 */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/90 to-transparent" />
                  </div>
                ) : (
                  <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-10 h-10 text-white/80" />
                  </div>
                )}
                {/* 文字区域 */}
                <div className="p-5 pt-3">
                  <div className="flex items-center gap-2.5">
                    {!hasCover && (
                      <div className={`os-icon-bg-sm bg-gradient-to-br ${gradient} text-white`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <h3 className="text-sm font-semibold text-slate-800">{tool.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {tool.description || 'AI智能创作工具'}
                  </p>
                  {/* 进入按钮 */}
                  <div className="flex items-center text-xs text-slate-400 mt-3 group-hover:text-[#7B61FF] transition-colors">
                    进入工具
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
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
  );
}
