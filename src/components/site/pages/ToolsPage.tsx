'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Camera, BookImage, Sparkles, X } from 'lucide-react';
import { getToolWorkflow } from '@/lib/tool-workflow-config';

interface UtilityTool {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  cover_image: string | null;
  color: string;
  sort_order: number;
  use_cases: { title: string; desc: string }[];
}

/* ---- 工具元数据 — 统一封面图 + 价值描述 + 标签 + lucide 图标 ---- */
const TOOL_META: Record<string, {
  cover: string;
  valueProp: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  sortOrder: number;
}> = {
  'product-generator': {
    cover: '/case-lipstick-main.png',
    valueProp: '上传商品图，秒变高级电商主图',
    tags: ['电商', '商品主图'],
    icon: Package,
    sortOrder: 1,
  },
  'ai-photo': {
    cover: '/demo-card-lifestyle.jpg',
    valueProp: '一键生成氛围感写真大片',
    tags: ['人像', '写真'],
    icon: Camera,
    sortOrder: 2,
  },
  'xiaohongshu-generator': {
    cover: '/demo-card-lifestyle.jpg',
    valueProp: '爆款小红书封面一键生成',
    tags: ['小红书', '种草'],
    icon: BookImage,
    sortOrder: 3,
  },
};

export default function ToolsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const CACHE_KEY = 'oneclaw_utility_tools_cache';
    const CACHE_TTL = 5 * 60 * 1000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setTools(data);
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
      .catch(() => {});
  }, []);

  const ALLOWED_SLUGS = new Set(Object.keys(TOOL_META));
  const sortedTools = [...tools].filter(t => ALLOWED_SLUGS.has(t.slug)).sort((a, b) => {
    const aOrder = TOOL_META[a.slug]?.sortOrder ?? 99;
    const bOrder = TOOL_META[b.slug]?.sortOrder ?? 99;
    return aOrder - bOrder;
  });

  const filtered = sortedTools.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (TOOL_META[t.slug]?.valueProp || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="os-page">
      <div className="os-content">
        {/* Page Title */}
        <div className="os-page-header">
          <h1 className="os-page-title">AI 创作工具</h1>
          <p className="os-page-subtitle">选择你想生成的内容，快速获得商业级结果</p>
        </div>

        {/* Search */}
        <div className="max-w-lg mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索工具，比如商品图、小红书、写真…"
            className="os-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Tool Cards Grid — 4 columns */}
        <div className="os-tl-grid">
          {filtered.map(tool => {
            const meta = TOOL_META[tool.slug];
            const coverSrc = tool.cover_image || meta?.cover || '';
            const LucideIcon = meta?.icon || Sparkles;

            return (
              <button
                key={tool.slug}
                onClick={() => {
                  try {
                    const toolConf = getToolWorkflow(tool.slug);
                    sessionStorage.setItem('oneclaw_create_context', JSON.stringify({
                      prompt: '',
                      type: tool.slug,
                      toolId: String(tool.id),
                      uploadedImages: [],
                      matchedTool: tool.slug,
                      analysisResult: {
                        tool: tool.slug,
                        confidence: 1.0,
                        style: meta?.valueProp || '',
                        ratio: toolConf?.defaultRatio || '',
                        count: toolConf?.defaultCount ? String(toolConf.defaultCount) : '',
                        industry: '',
                        output_type: tool.name,
                      },
                      autoGenerate: false,
                    }));
                  } catch {}
                  router.push('/create');
                }}
                className="os-tl-card"
              >
                {/* Cover Image */}
                <div className="os-tl-card-cover">
                  {coverSrc ? (
                    <img src={coverSrc} alt={tool.name} loading="lazy" />
                  ) : (
                    <div className="os-tl-card-fallback">
                      <div className="os-tl-card-fallback-icon">
                        <LucideIcon className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 文字区 */}
                <div className="os-tl-card-info">
                  <h3 className="os-tl-card-name">{tool.name}</h3>
                  <p className="os-tl-card-value">
                    {meta?.valueProp || tool.description || 'AI 帮你高效完成'}
                  </p>
                  {meta?.tags && meta.tags.length > 0 && (
                    <div className="os-tl-card-tags">
                      {meta.tags.map(tag => (
                        <span key={tag} className="os-tl-card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="os-tl-card-action">立即生成</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty search */}
        {filtered.length === 0 && tools.length > 0 && (
          <div className="os-empty">
            <div className="os-empty-icon"><Search className="w-8 h-8" /></div>
            <div className="os-empty-title">没有找到匹配的工具</div>
            <div className="os-empty-desc">换个关键词试试？</div>
          </div>
        )}
      </div>
    </div>
  );
}
