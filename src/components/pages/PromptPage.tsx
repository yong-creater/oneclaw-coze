'use client';

import { useState, useEffect } from 'react';
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

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  '场景描述': { label: '场景描述', color: 'bg-blue-50 text-blue-600' },
  '风格设定': { label: '风格设定', color: 'bg-purple-50 text-purple-600' },
  '技术参数': { label: '技术参数', color: 'bg-emerald-50 text-emerald-600' },
  '角色扮演': { label: '角色扮演', color: 'bg-orange-50 text-orange-600' },
};

export default function PromptPage() {
  const { setCurrentMenu, setPendingInput } = useMenu();
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

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];

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
    setCurrentMenu('home');
  };

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="ui-page-header">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <h2 className="ui-page-title">提示词库</h2>
        </div>
        <p className="ui-page-desc">{prompts.length} 条精选提示词，即用即走</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索提示词、标签..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ui-input pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const count = cat === 'all'
            ? prompts.length
            : prompts.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-[10px] text-sm transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? '全部' : CATEGORY_CONFIG[cat]?.label || cat}
              <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto mb-3" />
          加载中...
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>未找到匹配的提示词</p>
        </div>
      )}

      {/* Prompt Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(prompt => {
            const catConfig = CATEGORY_CONFIG[prompt.category] || { label: prompt.category, color: 'bg-slate-50 text-slate-600' };
            const isCopied = copiedId === prompt.id;

            return (
              <div key={prompt.id} className="ui-card p-4 flex flex-col gap-3">
                {/* Top: Category + Uses */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${catConfig.color}`}>
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
                      <span key={i} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded-[6px] text-[11px]">
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
                    className="ui-btn-secondary text-xs flex items-center gap-1 flex-1"
                  >
                    {isCopied ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-500" /> 已复制</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> 复制</>
                    )}
                  </button>
                  <button
                    onClick={() => handleUse(prompt)}
                    className="ui-btn-primary text-xs flex items-center gap-1 flex-1"
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
