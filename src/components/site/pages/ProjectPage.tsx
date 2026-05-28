'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/ModalContext';
import {
  Sparkles, Download, ZoomIn, Trash2, FolderOpen,
  Image as ImageIcon, Loader2, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ---------- 数据类型 ---------- */
interface Generation {
  id: number;
  tool_type: string;
  tool_name?: string;
  title?: string;
  style: string;
  ratio: string;
  prompt: string;
  thumbnail: string;
  output_content: string | Record<string, unknown>;
  created_at: string;
  model_name?: string;
  count?: number;
}

/* ---------- 工具名映射 ---------- */
const TOOL_NAMES: Record<string, string> = {
  'product-generator': 'AI商品图',
  'product_generator': 'AI商品图',
  'product': 'AI商品图',
  'xiaohongshu-generator': '小红书封面',
  'ai-photo': 'AI写真',
  'background_removal': 'AI智能抠图',
  'poster-design': '海报设计',
  'detail-page': '商品详情页',
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

/* ---------- 提取所有图片 ---------- */
function allImages(gen: Generation): string[] {
  const imgs: string[] = [];
  try {
    const oc = typeof gen.output_content === 'string'
      ? JSON.parse(gen.output_content)
      : gen.output_content;
    if (oc?.image_urls && Array.isArray(oc.image_urls)) {
      imgs.push(...(oc.image_urls as string[]));
    }
  } catch {
    /* empty */
  }
  /* 兜底：thumbnail 不在 image_urls 里时补上 */
  if (imgs.length === 0 && gen.thumbnail) {
    imgs.push(gen.thumbnail);
  }
  /* 如果 image_urls 为空但 thumbnail 不在首位，用 thumbnail 作首图 */
  if (gen.thumbnail && imgs.length > 0 && imgs[0] !== gen.thumbnail) {
    imgs.unshift(gen.thumbnail);
  }
  return imgs;
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
  const tool = gen.tool_name || TOOL_NAMES[gen.tool_type] || 'AI创作';
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

/* ==================== 多图预览弹窗 ==================== */
function GalleryModal({
  images,
  initialIndex,
  onContinue,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onContinue: () => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const isMulti = images.length > 1;

  /* ESC / 左右键 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && isMulti) setCurrent((c) => Math.max(0, c - 1));
      if (e.key === 'ArrowRight' && isMulti) setCurrent((c) => Math.min(images.length - 1, c + 1));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, isMulti, images.length]);

  /* 下载当前图 */
  const downloadCurrent = useCallback(async () => {
    const url = images[current];
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
  }, [images, current]);

  /* 下载全部 */
  const downloadAll = useCallback(async () => {
    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `oneclaw-${i + 1}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(blobUrl);
        /* 间隔避免浏览器拦截 */
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        window.open(url, '_blank');
      }
    }
  }, [images]);

  return (
    <div className="os-gallery-overlay" onClick={onClose}>
      <div className="os-gallery-modal" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button className="os-gallery-close" onClick={onClose} type="button" aria-label="关闭">
          <X style={{ width: 20, height: 20 }} />
        </button>

        {/* 主图区 */}
        <div className="os-gallery-main">
          {/* 上一张 */}
          {isMulti && current > 0 && (
            <button
              className="os-gallery-nav os-gallery-prev"
              onClick={() => setCurrent((c) => c - 1)}
              type="button"
              aria-label="上一张"
            >
              <ChevronLeft style={{ width: 24, height: 24 }} />
            </button>
          )}

          <img src={images[current]} alt={`第 ${current + 1} 张`} className="os-gallery-img" />

          {/* 下一张 */}
          {isMulti && current < images.length - 1 && (
            <button
              className="os-gallery-nav os-gallery-next"
              onClick={() => setCurrent((c) => c + 1)}
              type="button"
              aria-label="下一张"
            >
              <ChevronRight style={{ width: 24, height: 24 }} />
            </button>
          )}
        </div>

        {/* 底部工具栏 */}
        <div className="os-gallery-toolbar">
          {/* 左侧：页码 */}
          <div className="os-gallery-info">
            {isMulti && <span className="os-gallery-page">{current + 1} / {images.length}</span>}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="os-gallery-actions">
            <button className="os-gallery-action-btn" onClick={downloadCurrent} type="button">
              <Download style={{ width: 16, height: 16 }} /> 下载当前
            </button>
            {isMulti && (
              <button className="os-gallery-action-btn" onClick={downloadAll} type="button">
                <Download style={{ width: 16, height: 16 }} /> 下载全部
              </button>
            )}
            <button className="os-gallery-action-btn os-gallery-action-primary" onClick={onContinue} type="button">
              <Sparkles style={{ width: 16, height: 16 }} /> 继续优化
            </button>
          </div>
        </div>

        {/* 缩略图列表（多图才显示） */}
        {isMulti && (
          <div className="os-gallery-thumbs">
            <div className="os-gallery-thumbs-inner">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  className={`os-gallery-thumb ${idx === current ? 'os-gallery-thumb-active' : ''}`}
                  onClick={() => setCurrent(idx)}
                  type="button"
                >
                  <img src={url} alt={`缩略图 ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== 作品页面 ==================== */
export default function ProjectPage() {
  const router = useRouter();
  const { confirm, alert } = useModal();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);


  /* 多图预览状态 */
  const [gallery, setGallery] = useState<{
    images: string[];
    index: number;
    gen: Generation;
  } | null>(null);

  /* ---- 加载 ---- */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/generations', { signal: ac.signal });
        const d = await res.json();
        setGenerations(d.generations || d.data || []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
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
  const handleDeleteClick = useCallback(async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const ok = await confirm({
      title: '确认删除作品？',
      description: '删除后不可恢复。',
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/generations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert({ title: '删除失败', description: data.error || '请重试', variant: 'danger' });
        return;
      }
      setGenerations((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert({ title: '网络错误', description: '请检查网络后重试', variant: 'danger' });
    }
  }, [confirm, alert]);

  /* ---- 继续优化（跳转新创作工作台） ---- */
  const handleContinue = useCallback(
    (e: React.MouseEvent, gen: Generation) => {
      e.stopPropagation();
      const params = new URLSearchParams({
        prompt: gen.prompt || '',
        sourceType: 'work',
      });
      if (gen.style) params.set('style', gen.style);
      if (gen.ratio) params.set('ratio', gen.ratio);
      // 带入参考图
      const refImg = firstImage(gen);
      if (refImg) params.set('imageUrl', refImg);
      router.push(`/?${params.toString()}`);
    },
    [router],
  );

  /* ---- 查看大图（打开多图预览） ---- */
  const handleView = useCallback((e: React.MouseEvent, gen: Generation) => {
    e.stopPropagation();
    const imgs = allImages(gen);
    if (imgs.length > 0) {
      setGallery({ images: imgs, index: 0, gen });
    }
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#7B61FF]" /></div>;

  /* ==================== 渲染 ==================== */
  return (
    <div className="os-page">
      <div className="os-page-inner">
        <h1 className="os-page-title">我的作品</h1>
        <p className="os-page-subtitle">管理你的 AI 创作作品</p>

        {generations.length === 0 ? (
          <div className="os-project-empty-hero">
            <div className="os-project-empty-icon">
              <FolderOpen />
            </div>
            <h3>还没有作品</h3>
            <p>去创作页面生成你的第一个作品吧</p>
          </div>
        ) : (
          <div className="os-project-grid">
            {generations.map((gen) => {
              const img = firstImage(gen);
              const meta = genMeta(gen);
              const imgs = allImages(gen);
              const imgCount = imgs.length;

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

                    {/* 多图数量标识 */}
                    {imgCount > 1 && (
                      <span className="os-project-count-badge">{imgCount} 张</span>
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

                    {/* hover 操作栏 */}
                    <div className="os-project-hover">
                      <button className="os-project-hover-btn" onClick={(e) => handleContinue(e, gen)} type="button">
                        <Sparkles style={{ width: 14, height: 14 }} /> 继续优化
                      </button>
                      <button className="os-project-hover-btn" onClick={(e) => img && handleDownload(e, img)} type="button">
                        <Download style={{ width: 14, height: 14 }} /> 下载
                      </button>
                      <button className="os-project-hover-btn" onClick={(e) => handleView(e, gen)} type="button">
                        <ZoomIn style={{ width: 14, height: 14 }} /> 大图
                      </button>
                    </div>
                  </div>

                  {/* 信息区 */}
                  <div className="os-project-info">
                    <div className="os-project-info-title">
                      {(() => {
                        const t = gen.title || '';
                        const isJunk = /^(测试|test|demo|订单|AI.*结果)$/i.test(t) || t.length <= 2;
                        return (isJunk ? (gen.prompt || meta.tool || 'AI 创作') : t) || 'AI 创作';
                      })()}
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

        {/* 多图预览弹窗 */}
        {gallery && (
          <GalleryModal
            images={gallery.images}
            initialIndex={gallery.index}
            onContinue={() => {
              const gen = gallery.gen;
              const params = new URLSearchParams({
                prompt: gen.prompt || '',
                sourceType: 'work',
              });
              if (gen.style) params.set('style', gen.style);
              if (gen.ratio) params.set('ratio', gen.ratio);
              const refImg = firstImage(gen);
              if (refImg) params.set('imageUrl', refImg);
              setGallery(null);
              router.push(`/?${params.toString()}`);
            }}
            onClose={() => setGallery(null)}
          />
        )}


      </div>
    </div>
  );
}
