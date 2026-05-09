'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';

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

/* ---- 工具元数据（封面图 fallback + 价值描述） ---- */
const TOOL_META: Record<string, {
  cover: string;
  valueProp: string;
}> = {
  'product-generator': {
    cover: '/case-lipstick-main.png',
    valueProp: '上传商品图，秒变高级电商主图',
  },
  'ai-photo': {
    cover: '/demo-card-lifestyle.jpg',
    valueProp: '一键生成氛围感写真大片',
  },
  'background-removal': {
    cover: '/case-ecommerce.jpg',
    valueProp: '一键智能抠图，3秒出白底图',
  },
  'product-page': {
    cover: '/case-lipstick-main.png',
    valueProp: '自动生成电商详情页长图',
  },
  'xiaohongshu-generator': {
    cover: '/demo-card-lifestyle.jpg',
    valueProp: '爆款小红书内容一键生成',
  },
  'resume-optimizer': {
    cover: '/cover-resume.png',
    valueProp: 'STAR法则优化简历，HR直接约面试',
  },
  'novel': {
    cover: '/cover-novel.png',
    valueProp: 'AI辅助小说创作，大纲到正文一键生成',
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

  const filtered = tools.filter(t => {
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
        {/* ---- 页面标题 ---- */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Wrench className="w-5 h-5 text-[#5B5CF6]" />
            <h1 className="text-2xl font-bold text-slate-800">AI 创作工具</h1>
          </div>
          <p className="text-sm text-slate-400">
            选择你想生成的内容，快速获得商业级结果。
          </p>
        </div>

        {/* ---- 搜索 ---- */}
        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索工具，比如商品图、小红书、写真…"
            className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 hover:border-orange-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* ---- 工具卡片网格 ---- */}
        <div className="os-tl-grid">
          {filtered.map(tool => {
            const meta = TOOL_META[tool.slug];
            const coverSrc = tool.cover_image || meta?.cover || '';

            return (
              <button
                key={tool.slug}
                onClick={() => {
                  // 使用 sessionStorage 传递上下文，避免 URL 过长被浏览器拦截
                  try {
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
                        industry: '',
                        output_type: tool.name,
                      },
                      autoGenerate: false,  // 工具库进入不自动生成，等用户完成引导
                    }));
                  } catch {}
                  router.push('/create');
                }}
                className="os-tl-card"
              >
                {/* 封面图 */}
                <div className="os-tl-card-cover">
                  {coverSrc ? (
                    <img src={coverSrc} alt={tool.name} loading="lazy" />
                  ) : (
                    <div className="os-tl-card-fallback">
                      <span className="text-3xl font-semibold text-white/60">{tool.name[0]}</span>
                    </div>
                  )}
                  {/* hover CTA */}
                  <div className="os-tl-card-hover">
                    <span className="os-tl-card-hover-btn">立即生成</span>
                  </div>
                </div>

                {/* 文字区 */}
                <div className="os-tl-card-info">
                  <h3 className="os-tl-card-name">{tool.name}</h3>
                  <p className="os-tl-card-value">
                    {meta?.valueProp || tool.description || 'AI 帮你高效完成'}
                  </p>
                  <span className="os-tl-card-action">立即生成</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ---- 空搜索 ---- */}
        {filtered.length === 0 && tools.length > 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            没有找到匹配的工具，换个关键词试试？
          </div>
        )}
      </div>
    </div>
  );
}
