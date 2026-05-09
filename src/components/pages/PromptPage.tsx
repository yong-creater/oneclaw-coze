'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Search, Wand2, Eye, Copy, Check, ChevronDown, ChevronUp,
  ShoppingBag, BookOpen, Camera, Image, LayoutTemplate, Video,
  Sparkles
} from 'lucide-react';

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  author: string | null;
  uses: number | null;
  created_at: string;
  tools?: { id: number; name: string; logo: string | null } | null;
}

// 用户可见的分类（映射到后台 category）
const DISPLAY_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '商品图', label: '商品图', icon: ShoppingBag, gradient: 'from-[#FF6B6B] to-[#FF8E53]' },
  { key: '小红书', label: '小红书', icon: BookOpen, gradient: 'from-[#FF6B9D] to-[#C44DFF]' },
  { key: 'AI写真', label: 'AI写真', icon: Camera, gradient: 'from-[#7B61FF] to-[#6EE7FF]' },
  { key: '海报', label: '海报', icon: Image, gradient: 'from-[#5B8CFF] to-[#7B61FF]' },
  { key: '封面图', label: '封面图', icon: LayoutTemplate, gradient: 'from-[#6EE7FF] to-[#5B8CFF]' },
  { key: '详情页', label: '详情页', icon: LayoutTemplate, gradient: 'from-[#5B8CFF] to-[#6EE7FF]' },
  { key: '视频封面', label: '视频封面', icon: Video, gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
];

// 后台 category 到展示分类的映射
const CATEGORY_MAP: Record<string, string> = {
  '场景描述': '封面图',
  '特效制作': '海报',
  '角色扮演': 'AI写真',
  '风格迁移': '商品图',
};

// 每个后台分类的占位图渐变和图标
const CATEGORY_VISUAL: Record<string, { gradient: string; icon: typeof ShoppingBag }> = {
  '场景描述': { gradient: 'from-[#5B8CFF] to-[#6EE7FF]', icon: LayoutTemplate },
  '特效制作': { gradient: 'from-[#7B61FF] to-[#5B8CFF]', icon: Image },
  '角色扮演': { gradient: 'from-[#7B61FF] to-[#6EE7FF]', icon: Camera },
  '风格迁移': { gradient: 'from-[#5B8CFF] to-[#7B61FF]', icon: ShoppingBag },
};

export default function PromptPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const CACHE_KEY = 'oneclaw_prompts_cache';
    const CACHE_TTL = 5 * 60 * 1000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setPrompts(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch('/api/prompts')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data?.prompts) ? data.prompts : [];
        setPrompts(items);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: items, timestamp: Date.now() }));
        } catch {}
      })
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  // Map backend category to display category
  const getDisplayCategory = useCallback((backendCat: string): string => {
    return CATEGORY_MAP[backendCat] || backendCat;
  }, []);

  const filtered = prompts.filter(p => {
    const displayCat = getDisplayCategory(p.category);
    if (activeCategory !== 'all' && displayCat !== activeCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (p.title || '').toLowerCase().includes(s) ||
        (p.content || '').toLowerCase().includes(s) ||
        (p.tags || []).some(t => t.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const handleGenerate = (prompt: Prompt) => {
    const type = getDisplayCategory(prompt.category);
    const typeSlugMap: Record<string, string> = {
      '商品图': 'product-generator',
      '小红书': 'xiaohongshu-generator',
      'AI写真': 'ai-photo',
      '海报': 'product-generator',
      '封面图': 'product-generator',
      '详情页': 'product-page',
      '视频封面': 'product-generator',
    };
    const typeSlug = typeSlugMap[type] || 'product-generator';
    const params = new URLSearchParams({
      prompt: prompt.content,
      type: typeSlug,
    });
    router.push(`/create?${params.toString()}`);
  };

  const getCategoryCount = (catKey: string): number => {
    if (catKey === 'all') return prompts.length;
    return prompts.filter(p => getDisplayCategory(p.category) === catKey).length;
  };

  return (
    <div className="os-page">
      {/* Header */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-h1">灵感案例库</h1>
        <p className="os-section-desc">看看别人正在生成什么内容，一键生成同款。</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索你想生成的内容，比如商品图、小红书、AI写真"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="os-search-input"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        {DISPLAY_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.key;
          const count = getCategoryCount(cat.key);
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`os-btn-capsule ${isActive ? 'os-btn-capsule-active' : ''}`}
            >
              {cat.label}
              <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7B61FF] rounded-full animate-spin mb-3" />
          <p className="text-sm">加载灵感中...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">未找到匹配的灵感案例</p>
        </div>
      )}

      {/* Visual Case Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((prompt, index) => {
            const catVisual = CATEGORY_VISUAL[prompt.category] || { gradient: 'from-slate-400 to-slate-500', icon: Sparkles };
            const CatIcon = catVisual.icon;
            const displayCat = getDisplayCategory(prompt.category);
            const isExpanded = expandedId === prompt.id;
            const isCopied = copiedId === prompt.id;

            return (
              <div
                key={prompt.id}
                className="os-inspire-card group animate-fade-slide-up"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
              >
                {/* Cover Image Area */}
                <div className="os-inspire-cover">
                  {/* Gradient placeholder (no real images in data) */}
                  <div className={`w-full h-full bg-gradient-to-br ${catVisual.gradient} flex flex-col items-center justify-center gap-2`}>
                    <CatIcon className="w-10 h-10 text-white/80" />
                    <span className="text-white/90 text-sm font-medium">{displayCat}</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="os-inspire-cover-overlay">
                    <button
                      onClick={() => handleGenerate(prompt)}
                      className="os-inspire-cta"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>生成同款</span>
                    </button>
                  </div>
                  {/* Category badge */}
                  <span className="os-inspire-badge">{displayCat}</span>
                </div>

                {/* Card Body */}
                <div className="os-inspire-body">
                  {/* Title */}
                  <h3 className="os-inspire-title">{prompt.title}</h3>

                  {/* Description - first 60 chars of content */}
                  <p className="os-inspire-desc">
                    {prompt.content.length > 60 ? prompt.content.slice(0, 60) + '...' : prompt.content}
                  </p>

                  {/* Tags */}
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {prompt.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="os-inspire-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Primary Action */}
                  <button
                    onClick={() => handleGenerate(prompt)}
                    className="os-inspire-generate-btn"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>生成同款</span>
                  </button>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                      className="os-inspire-secondary-btn"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>查看 Prompt</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleCopy(prompt)}
                      className="os-inspire-secondary-btn"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? '已复制' : '复制'}</span>
                    </button>
                  </div>

                  {/* Expanded Prompt */}
                  {isExpanded && (
                    <div className="os-inspire-prompt-panel">
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{prompt.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
