'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Download, ZoomIn, Trash2, FolderOpen, Image as ImageIcon, Loader2, X } from 'lucide-react';
import BackToHome from '@/components/site/common/BackToHome';

/* ---------- 数据类型 ---------- */
interface Generation {
  id: number;
  tool_type: string;
  style: string;
  ratio: string;
  prompt: string;
  thumbnail: string;
  output_content: string | Record<string, unknown>;
  created_at: string;
  model_name?: string;
  count?: number;
}

/* ---------- 删除确认弹窗 ---------- */
function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  /* ESC 关闭 */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="os-delete-overlay" onClick={onCancel}>
      <div
        className="os-delete-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="确认删除"
      >
        {/* 关闭按钮 */}
        <button className="os-delete-close" onClick={onCancel} type="button" aria-label="关闭">
          <X style={{ width: 18, height: 18 }} />
        </button>

        {/* 图标 */}
        <div className="os-delete-icon-wrap">
          <Trash2 style={{ width: 24, height: 24 }} />
        </div>

        {/* 文案 */}
        <h3 className="os-delete-title">删除这个作品？</h3>
        <p className="os-delete-desc">删除后将无法恢复。</p>

        {/* 按钮 */}
        <div className="os-delete-actions">
          <button className="os-delete-cancel" onClick={onCancel} type="button">
            取消
          </button>
          <button className="os-delete-confirm" onClick={onConfirm} type="button">
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 工具名映射 ---------- */
const TOOL_NAMES: Record<string, string> = {
  'product-generator': 'AI商品图',
  'xiaohongshu-generator': '小红书封面',
  'ai-photo': 'AI写真',
};

/* ---------- 提取首张图 ---------- */
function firstImage(gen: Generation): string {
  if (gen.thumbnail) return gen.thumbnail;
  try {
    const oc = typeof gen.output_content === 'string'
      ? JSON.parse(gen.output_content)
      : gen.output_content;
    if (oc?.image_urls && Array.isArray(oc.image_urls) && oc.image_urls.length > 0) {
      return oc.image_urls[0] as string;
    }
    if (oc?.imageUrl) return oc.imageUrl as string;
    if (oc?.url) return oc.url as string;
  } catch {
    /* empty */
  }
  return '';
}

/* ---------- 格式化日期 ---------- */
function fmtDate(d: string): string {
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

/* ---------- 提取生成元数据 ---------- */
function genMeta(gen: Generation) {
  const tool = TOOL_NAMES[gen.tool_type] || gen.tool_type || 'AI创作';
  const model = gen.model_name || '';
  const style = gen.style || '';
  const ratio = gen.ratio || '';
  let count = 0;
  try {
    const oc = typeof gen.output_content === 'string'
      ? JSON.parse(gen.output_content)
      : gen.output_content;
    if (oc?.image_urls && Array.isArray(oc.image_urls)) {
      count = oc.image_urls.length;
    }
  } catch {
    /* empty */
  }
  return { tool, model, style, ratio, count };
}

/* ==================== 作品页面 ==================== */
export default function ProjectPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* ---- 加载 ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/generations');
        const d = await res.json();
        setGenerations(d.generations || d.data || []);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- 下载 ---- */
  const handleDownload = useCallback(async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `oneclaw-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }, []);

  /* ---- 删除 ---- */
  const handleDeleteClick = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget == null) return;
    try {
      await fetch(`/api/generations?id=${deleteTarget}`, { method: 'DELETE' });
      setGenerations((prev) => prev.filter((g) => g.id !== deleteTarget));
    } catch {
      /* empty */
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  /* ---- 继续优化 ---- */
  const handleContinue = useCallback(
    (e: React.MouseEvent, gen: Generation) => {
      e.stopPropagation();
      const slug = gen.tool_type || 'product-generator';
      router.push(`/create?tool=${slug}&prompt=${encodeURIComponent(gen.prompt || '')}`);
    },
    [router]
  );

  /* ---- 查看大图 ---- */
  const handleView = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setLightbox(url);
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#7B61FF]" /></div>;

  /* ==================== 渲染 ==================== */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        <BackToHome />
        <h1 className="os-page-title">我的作品</h1>
        <p className="os-page-subtitle">管理你的 AI 创作作品</p>

        {generations.length === 0 ? (
          /* 空状态 */
          <div className="os-project-empty-hero">
            <div className="os-project-empty-icon">
              <FolderOpen />
            </div>
            <h3>还没有作品</h3>
            <p>去创作页面生成你的第一个作品吧</p>
          </div>
        ) : (
          /* 3列网格 */
          <div className="os-project-grid">
            {generations.map((gen) => {
              const img = firstImage(gen);
              const meta = genMeta(gen);
              return (
                <div key={gen.id} className="os-project-card">
                  {/* 图片区 */}
                  <div className="os-project-img-wrap">
                    {img ? (
                      <img src={img} alt={gen.prompt || '作品'} className="os-project-img" loading="lazy" />
                    ) : (
                      <div className="os-project-img-fallback">
                        <ImageIcon style={{ width: 40, height: 40 }} />
                      </div>
                    )}

                    {/* 删除按钮 */}
                    <button
                      className="os-project-del-btn"
                      onClick={(e) => handleDeleteClick(e, gen.id)}
                      type="button"
                      aria-label="删除"
                    >
                      <Trash2 />
                    </button>

                    {/* hover 操作栏 — glass bar */}
                    <div className="os-project-hover">
                      <button className="os-project-hover-btn" onClick={(e) => handleContinue(e, gen)} type="button">
                        <Sparkles style={{ width: 14, height: 14 }} /> 继续优化
                      </button>
                      <button className="os-project-hover-btn" onClick={(e) => img && handleDownload(e, img)} type="button">
                        <Download style={{ width: 14, height: 14 }} /> 下载
                      </button>
                      <button className="os-project-hover-btn" onClick={(e) => img && handleView(e, img)} type="button">
                        <ZoomIn style={{ width: 14, height: 14 }} /> 大图
                      </button>
                    </div>
                  </div>

                  {/* 信息区 */}
                  <div className="os-project-info">
                    <div className="os-project-info-title">
                      {gen.prompt || meta.tool || 'AI 创作'}
                    </div>
                    <div className="os-project-meta-row">
                      <span className="os-project-meta-tag">{meta.tool}</span>
                      {meta.model && <span className="os-project-meta-tag">{meta.model}</span>}
                      {meta.style && <span className="os-project-meta-tag-neutral os-project-meta-tag">{meta.style}</span>}
                      {meta.ratio && <span className="os-project-meta-tag-neutral os-project-meta-tag">{meta.ratio}</span>}
                      {meta.count > 1 && <span className="os-project-meta-tag-neutral os-project-meta-tag">{meta.count} 张</span>}
                    </div>
                    <div className="os-project-time">{fmtDate(gen.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="os-lightbox-overlay" onClick={() => setLightbox(null)}>
            <div className="os-lightbox-content">
              <button className="os-lightbox-close" onClick={() => setLightbox(null)} type="button">
                &times;
              </button>
              <img src={lightbox} alt="大图" className="os-lightbox-img" />
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        <DeleteConfirmModal
          open={deleteTarget !== null}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
}
