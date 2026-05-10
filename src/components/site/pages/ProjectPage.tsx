'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Download, Eye, Sparkles, Trash2, Loader2, X, ImageIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

/* ---------- helpers ---------- */
const TOOL_LABEL: Record<string, string> = {
  'product-generator': 'AI 商品图',
  product: 'AI 商品图',
  'xiaohongshu-generator': '小红书封面',
  xiaohongshu: '小红书封面',
  'ai-photo': 'AI 写真',
  photo: 'AI 写真',
};

function genImage(gen: Record<string, unknown>): string {
  if (gen.thumbnail && typeof gen.thumbnail === 'string') return gen.thumbnail;
  const oc = gen.output_content;
  if (oc) {
    try {
      const parsed = typeof oc === 'string' ? JSON.parse(oc) : oc;
      if (parsed?.image_urls?.[0]) return parsed.image_urls[0];
      if (parsed?.imageUrl) return parsed.imageUrl;
    } catch { /* ignore */ }
  }
  return '';
}

function genAllImages(gen: Record<string, unknown>): string[] {
  const oc = gen.output_content;
  if (oc) {
    try {
      const parsed = typeof oc === 'string' ? JSON.parse(oc) : oc;
      if (Array.isArray(parsed?.image_urls)) return parsed.image_urls;
      if (parsed?.imageUrl) return [parsed.imageUrl];
    } catch { /* ignore */ }
  }
  const thumb = genImage(gen);
  return thumb ? [thumb] : [];
}

function toolTypeSlug(gen: Record<string, unknown>): string {
  return (gen.tool_type as string) || '';
}

function formatDate(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

/* ---------- component ---------- */
export default function ProjectPage() {
  const router = useRouter();
  const { authenticated, setShowLoginModal } = useUser();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTool, setFilterTool] = useState('all');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!authenticated) { setLoading(false); return; }
    setLoading(true);
    fetch('/api/generations', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.generations || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authenticated]);

  const filtered = filterTool === 'all' ? items : items.filter(g => toolTypeSlug(g) === filterTool);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确定删除此作品？')) return;
    await fetch(`/api/generations?id=${id}`, { method: 'DELETE', credentials: 'include' });
    setItems(prev => prev.filter(g => g.id !== id));
  }, []);

  const handleDownload = useCallback((url: string, name?: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || 'oneclaw-work.png';
    a.target = '_blank';
    a.click();
  }, []);

  /* ---------- not logged in ---------- */
  if (!authenticated) {
    return (
      <div className="os-page">
        <div className="os-page-inner">
          <h1 className="os-page-title">我的作品</h1>
          <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>
          <div className="os-project-empty-hero" style={{ marginTop: 80 }}>
            <div className="os-project-empty-icon"><ImagePlus /></div>
            <h3>登录后查看你的作品</h3>
            <p>完成创作后，你的作品会自动保存在这里</p>
            <button className="os-btn-primary" onClick={() => setShowLoginModal(true)} style={{ marginTop: 8 }}>
              登录查看作品
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="os-page">
        <div className="os-page-inner">
          <h1 className="os-page-title">我的作品</h1>
          <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7B61FF' }} />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- empty ---------- */
  if (items.length === 0) {
    return (
      <div className="os-page">
        <div className="os-page-inner">
          <h1 className="os-page-title">我的作品</h1>
          <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>
          <div className="os-project-empty-hero" style={{ marginTop: 80 }}>
            <div className="os-project-empty-icon"><ImagePlus /></div>
            <h3>还没有作品</h3>
            <p>完成一次创作后，你的作品会自动保存在这里</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="os-btn-primary" onClick={() => router.push('/tools')}>
                开始创作
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

  /* ---------- filter pills ---------- */
  const toolFilters = [
    { key: 'all', label: '全部' },
    { key: 'product-generator', label: 'AI 商品图' },
    { key: 'product', label: 'AI 商品图' },
    { key: 'xiaohongshu-generator', label: '小红书' },
    { key: 'xiaohongshu', label: '小红书' },
    { key: 'ai-photo', label: 'AI 写真' },
    { key: 'photo', label: 'AI 写真' },
  ];
  const uniqueFilters = toolFilters.reduce<Array<{ key: string; label: string }>>((acc, f) => {
    if (!acc.find(x => x.label === f.label)) acc.push(f);
    return acc;
  }, []);

  /* ---------- main ---------- */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        <h1 className="os-page-title">我的作品</h1>
        <p className="os-page-subtitle">管理你生成过的内容，继续优化与下载</p>

        {/* 筛选胶囊 */}
        <div className="os-page-pills">
          {uniqueFilters.map(f => (
            <button
              key={f.key}
              className={`os-btn-capsule ${filterTool === f.key ? 'os-btn-capsule-active' : ''}`}
              onClick={() => setFilterTool(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 作品网格 */}
        <div className="os-project-grid">
          {filtered.map((gen) => {
            const img = genImage(gen);
            const slug = toolTypeSlug(gen);
            const title = (gen.title as string) || TOOL_LABEL[slug] || '未命名作品';
            const date = formatDate(gen.created_at as string);
            return (
              <div key={gen.id as number} className="os-project-card">
                {/* 图片区 — 1:1 */}
                <div className="os-project-img-wrap">
                  {img ? (
                    <img src={img} alt={title} className="os-project-img" />
                  ) : (
                    <div className="os-project-img-fallback">
                      <ImageIcon style={{ width: 40, height: 40, color: '#C4B5FD' }} />
                    </div>
                  )}
                  {/* hover 底部操作栏 */}
                  <div className="os-project-hover">
                    <button onClick={() => router.push(`/create?tool=${slug}`)} className="os-project-hover-btn">
                      <Sparkles style={{ width: 14, height: 14 }} />
                      继续优化
                    </button>
                    <button onClick={() => handleDownload(img)} className="os-project-hover-btn">
                      <Download style={{ width: 14, height: 14 }} />
                      下载
                    </button>
                    <button onClick={() => setPreviewIdx(gen.id as number)} className="os-project-hover-btn">
                      <Eye style={{ width: 14, height: 14 }} />
                      大图
                    </button>
                  </div>
                </div>
                {/* 底部信息 */}
                <div className="os-project-info">
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2937', display: 'block' }}>{title}</span>
                  <span className="os-project-time">
                    <span className="os-card-tag">{TOOL_LABEL[slug] || slug}</span>
                    <span>{date}</span>
                    <span className="os-project-del-btn" style={{ marginLeft: 'auto' }}>
                      <Trash2 style={{ width: 14, height: 14 }} onClick={() => handleDelete(gen.id as number)} />
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#A0A8B8' }}>
            该分类下暂无作品
          </div>
        )}
      </div>

      {/* lightbox */}
      {previewIdx !== null && (() => {
        const gen = items.find(g => g.id === previewIdx);
        if (!gen) return null;
        const allImgs = genAllImages(gen);
        return (
          <div className="os-lightbox-overlay" onClick={() => setPreviewIdx(null)}>
            <div className="os-lightbox-content" onClick={e => e.stopPropagation()}>
              <button className="os-lightbox-close" onClick={() => setPreviewIdx(null)}>
                <X style={{ width: 20, height: 20 }} />
              </button>
              {allImgs.length > 0 ? (
                <img src={allImgs[0]} alt="" className="os-lightbox-img" />
              ) : (
                <div style={{ width: 480, height: 480, borderRadius: 12, background: 'var(--oc-grad-placeholder)' }} />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
