'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Download,
  Pencil,
  Search,
  Package,
  Camera,
  BookImage,
  Trash2,
  Eye,
  Sparkles,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Generation {
  id: number;
  tool_id: number | null;
  tool_slug: string;
  prompt: string;
  result_url: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const TOOL_LABELS: Record<string, string> = {
  'product-generator': 'AI商品图',
  'ai-photo': 'AI写真',
  'xiaohongshu-generator': '小红书封面',
};

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'product-generator': Package,
  'ai-photo': Camera,
  'xiaohongshu-generator': BookImage,
};

const TOOL_ASPECTS: Record<string, string> = {
  'product-generator': '4/3',
  'ai-photo': '3/4',
  'xiaohongshu-generator': '3/4',
};

const FILTER_OPTIONS = [
  { key: '', label: '全部' },
  { key: 'product-generator', label: '商品图' },
  { key: 'xiaohongshu-generator', label: '小红书' },
  { key: 'ai-photo', label: 'AI写真' },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return d.toLocaleDateString('zh-CN');
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ProjectPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  /* ---- Fetch ---- */
  const fetchGenerations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generations', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.generations)) {
        setGenerations(data.generations);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchGenerations(); }, [fetchGenerations]);

  /* ---- Delete ---- */
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确定要删除这个作品吗？')) return;
    setDeleting(id);
    try {
      await fetch(`/api/generations?id=${id}`, { method: 'DELETE', credentials: 'include' });
      setGenerations(prev => prev.filter(g => g.id !== id));
    } catch {}
    setDeleting(null);
  }, []);

  /* ---- Download ---- */
  const handleDownload = useCallback(async (url: string, name: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name || 'oneclaw-creation.png';
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {}
  }, []);

  /* ---- Filter ---- */
  const filtered = generations.filter(g => {
    if (filterTool && g.tool_slug !== filterTool) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(g.prompt || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* ---- Empty state ---- */
  if (!loading && generations.length === 0) {
    return (
      <div className="os-page">
        <div className="os-content">
          <div className="os-page-header">
            <h1 className="os-page-title">我的作品</h1>
            <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>
          </div>
          <div className="os-empty-lg">
            <div className="os-empty-lg-icon">
              <FolderOpen className="w-10 h-10" />
            </div>
            <h2 className="os-empty-lg-title">还没有作品</h2>
            <p className="os-empty-lg-desc">完成一次创作后，你的作品会自动保存在这里</p>
            <div className="flex items-center gap-3 mt-6">
              <button className="os-btn-primary" onClick={() => router.push('/tools')}>
                <Sparkles className="w-4 h-4" />开始创作
              </button>
              <button className="os-btn-secondary" onClick={() => router.push('/inspiration')}>
                查看灵感案例
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="os-page">
      <div className="os-content">
        {/* Page Title */}
        <div className="os-page-header">
          <h1 className="os-page-title">我的作品</h1>
          <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>
        </div>

        {/* Search + Filters */}
        <div className="max-w-lg mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索作品…"
            className="os-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterTool(opt.key)}
              className={`os-btn-capsule ${filterTool === opt.key ? 'os-btn-capsule-active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Works Grid */}
        <div className="os-project-grid">
          {filtered.map(gen => {
            const Icon = TOOL_ICONS[gen.tool_slug] || Package;
            const aspect = TOOL_ASPECTS[gen.tool_slug] || '4/3';

            return (
              <div key={gen.id} className="os-project-card">
                {/* Image */}
                <div className="os-project-img-wrap" style={{ aspectRatio: aspect }}>
                  {gen.result_url ? (
                    <img src={gen.result_url} alt="作品" loading="lazy" className="os-project-img" />
                  ) : (
                    <div className="os-project-img-fallback">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="os-project-hover">
                    <button className="os-project-hover-btn" onClick={() => router.push(`/create?tool=${gen.tool_slug}`)}>
                      <Pencil className="w-4 h-4" />继续优化
                    </button>
                    <button className="os-project-hover-btn" onClick={() => handleDownload(gen.result_url, `oneclaw-${gen.id}.png`)}>
                      <Download className="w-4 h-4" />下载
                    </button>
                    <button className="os-project-hover-btn" onClick={() => window.open(gen.result_url, '_blank')}>
                      <Eye className="w-4 h-4" />查看大图
                    </button>
                  </div>
                </div>

                {/* Card Info */}
                <div className="os-project-info">
                  <span className="os-card-tag">{TOOL_LABELS[gen.tool_slug] || '作品'}</span>
                  <p className="os-project-time">{formatDate(gen.created_at)}</p>
                  <div className="os-project-actions">
                    <button
                      className="os-project-del-btn"
                      onClick={() => handleDelete(gen.id)}
                      disabled={deleting === gen.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty filter result */}
        {filtered.length === 0 && generations.length > 0 && (
          <div className="os-empty">
            <div className="os-empty-icon"><Search className="w-8 h-8" /></div>
            <div className="os-empty-title">没有找到匹配的作品</div>
            <div className="os-empty-desc">换个条件试试？</div>
          </div>
        )}
      </div>
    </div>
  );
}
