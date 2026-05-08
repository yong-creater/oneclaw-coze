'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import { Search, Copy, ArrowRight, Check, Tag, Sparkles, BookOpen } from 'lucide-react';

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

const CATEGORY_CONFIG: Record<string, { label: string; gradient: string }> = {
  '场景描述': { label: '场景描述', gradient: 'from-blue-400 to-cyan-500' },
  '特效制作': { label: '特效制作', gradient: 'from-violet-500 to-purple-600' },
  '角色扮演': { label: '角色扮演', gradient: 'from-amber-400 to-orange-500' },
  '风格迁移': { label: '风格迁移', gradient: 'from-emerald-400 to-teal-500' },
};

export default function PromptPage() {
  const { setPendingInput } = useMenu();
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then(data => {
        setPrompts(Array.isArray(data?.prompts) ? data.prompts : []);
      })
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(prompts.map(p => p.category).filter(Boolean))];

  const filtered = (prompts || []).filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
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
    } catch {
      // fallback
    }
  };

  const handleUse = (prompt: Prompt) => {
    setPendingInput(`使用提示词「${prompt.title}」生成内容：\n\n${prompt.content}`);
    router.push('/');
  };

  return (
    <div className="os-page">
      {/* Header */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-section-title text-2xl">提示词库</h1>
        <p className="os-section-desc">{prompts.length} 条精选提示词，即用即走</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索提示词、标签..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="os-search-input"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const count = cat === 'all'
            ? prompts.length
            : prompts.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`os-filter-tag ${isActive ? 'os-filter-tag-active' : 'os-filter-tag-inactive'}`}
            >
              {cat === 'all' ? '全部' : CATEGORY_CONFIG[cat]?.label || cat}
              <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">加载中...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">未找到匹配的提示词</p>
        </div>
      )}

      {/* Prompt Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prompt, index) => {
            const catConfig = CATEGORY_CONFIG[prompt.category] || { label: prompt.category, gradient: 'from-slate-400 to-slate-500' };
            const isCopied = copiedId === prompt.id;

            return (
              <div
                key={prompt.id}
                className="os-card p-5 flex flex-col gap-3 animate-stagger-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Top: Category + Uses */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${catConfig.gradient}`}>
                    {catConfig.label}
                  </span>
                  {prompt.uses != null && (
                    <span className="text-xs text-slate-400">{prompt.uses} 次使用</span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                  {prompt.title}
                </h3>

                {/* Content Preview */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {prompt.content}
                </p>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {prompt.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-500 rounded-md text-[11px] font-medium">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <button
                    onClick={() => handleCopy(prompt)}
                    className="os-btn-secondary text-xs flex items-center gap-1.5 flex-1"
                  >
                    {isCopied ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-500" /> 已复制</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> 复制</>
                    )}
                  </button>
                  <button
                    onClick={() => handleUse(prompt)}
                    className="os-btn-primary text-xs flex items-center gap-1.5 flex-1"
                  >
                    使用 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
