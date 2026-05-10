'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Eye,
  Trash2,
  Download,
  Pencil,
  Search,
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  Wand2,
  X,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';

// ========== 类型定义 ==========
interface Generation {
  id: number;
  tool_name: string;
  tool_type: string;
  title: string;
  thumbnail: string | null;
  usage_type: string;
  created_at: string;
  model: string;
  is_free: boolean;
  input_params?: string | Record<string, unknown>;
  output_content?: string | Record<string, unknown>;
}

// ========== 工具类型映射 ==========
const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; gradient: string }> = {
  product_generator: { label: '商品图', icon: Package, gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
  background_removal: { label: '智能抠图', icon: Scissors, gradient: 'from-[#5B8CFF] to-[#6EE7FF]' },
  ai_photo: { label: 'AI写真', icon: Camera, gradient: 'from-[#7B61FF] to-[#A78BFA]' },
  product_poster: { label: '商品海报', icon: ImageIcon, gradient: 'from-[#5B8CFF] to-[#7B61FF]' },
  xiaohongshu: { label: '小红书', icon: FileText, gradient: 'from-[#7B61FF] to-[#FFB84D]' },
  productpage: { label: '详情页', icon: FileText, gradient: 'from-[#5B8CFF] to-[#7B61FF]' },
  cover: { label: '封面设计', icon: ImageIcon, gradient: 'from-[#6EE7FF] to-[#5B8CFF]' },
  video: { label: '视频脚本', icon: FileText, gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
};

// ========== Toast 通知 ==========
interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastIdCounter = 0;

export default function ProjectPage() {
  const { setPendingInput } = useMenu();
  const router = useRouter();
  const [projects, setProjects] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [previewId, setPreviewId] = useState<number | null>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // 获取生成记录
  useEffect(() => {
    fetch('/api/generations', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // API 返回 data.generations，不是 data.data
          setProjects(data.generations || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 删除记录
  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  // 继续编辑 — 跳转到工作台
  const handleEdit = (project: Generation) => {
    const params = new URLSearchParams({
      toolId: String(project.id),
      type: project.tool_type,
      prompt: project.title || project.tool_name,
    });
    router.push(`/create?${params.toString()}`);
  };

  // 下载
  const handleDownload = async (project: Generation) => {
    if (!project.thumbnail) {
      showToast('暂无图片可下载', 'info');
      return;
    }
    try {
      const response = await fetch(project.thumbnail);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${project.title || 'oneclaw-result'}.png`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      showToast('开始下载');
    } catch {
      showToast('下载失败', 'error');
    }
  };

  // 筛选
  const filtered = projects.filter((p) => {
    const matchType = activeType === 'all' || p.tool_type === activeType;
    const matchSearch =
      search === '' ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.tool_name?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // 统计各类型数量
  const typeCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.tool_type] = (acc[p.tool_type] || 0) + 1;
    return acc;
  }, {});

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}小时前`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}天前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="os-page">
      <div className="os-content">
      {/* Toast 通知 */}
      {toasts.length > 0 && (
        <div className="os-wb-toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`os-wb-toast os-wb-toast-${t.type}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* ===== 空状态 ===== */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B61FF]/10 to-[#5B8CFF]/10 flex items-center justify-center mb-6">
            <FolderOpen className="w-9 h-9 text-[#7B61FF]/40" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">还没有作品</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xs text-center leading-relaxed">
            从创作页输入需求，生成你的第一个 AI 内容。
          </p>
          <button
            onClick={() => {
              setPendingInput('');
              router.push('/');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7C6CFF] to-[#5B5CF6] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C6CFF]/20 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            立即创作
          </button>
        </div>
      )}

      {/* ===== 有作品时 ===== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7B61FF] rounded-full animate-spin mb-3" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : projects.length > 0 ? (
        <>
          {/* 标题区 */}
          <div className="mb-6">
            <h1 className="os-h1">我的作品</h1>
            <p className="os-section-desc">查看、下载和继续编辑你生成的内容。</p>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索作品..."
              className="os-search-input"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveType('all')}
              className={`os-btn-capsule ${activeType === 'all' ? 'os-btn-capsule-active' : ''}`}
            >
              全部 {projects.length}
            </button>
            {Object.entries(TOOL_META)
              .filter(([key]) => typeCounts[key])
              .map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`os-btn-capsule ${activeType === key ? 'os-btn-capsule-active' : ''}`}
                >
                  {meta.label} {typeCounts[key]}
                </button>
              ))}
          </div>

          {/* 作品网格 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((project) => {
                const meta = TOOL_META[project.tool_type] || {
                  label: project.tool_type,
                  icon: FolderOpen,
                  gradient: 'from-slate-400 to-slate-500',
                };
                const Icon = meta.icon;
                const isPreview = previewId === project.id;

                return (
                  <div
                    key={project.id}
                    className="os-card-static rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-[#7B61FF]/06 transition-all duration-200"
                  >
                    {/* 缩略图区 */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title || ''}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${meta.gradient} opacity-15`}>
                          <Icon className="w-10 h-10 text-[#7B61FF]/30" />
                        </div>
                      )}
                      {/* 类型标签 */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm text-[11px] font-medium text-slate-600 shadow-sm">
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </div>
                      {/* Hover 操作浮层 */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setPreviewId(isPreview ? null : project.id)}
                          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-[#7B61FF] transition-colors shadow-sm"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(project)}
                          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-[#7B61FF] transition-colors shadow-sm"
                          title="下载"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-[#7B61FF] transition-colors shadow-sm"
                          title="继续编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 文字区 */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {project.title || project.tool_name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-slate-400">
                          {formatTime(project.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#7B61FF] hover:bg-[#7B61FF]/6 transition-colors"
                            title="继续编辑"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm">没有找到匹配的作品</p>
            </div>
          )}
        </>
      ) : null}

      {/* ===== 大图预览 Lightbox ===== */}
      {previewId !== null && (() => {
        const project = projects.find((p) => p.id === previewId);
        if (!project || !project.thumbnail) return null;
        const meta = TOOL_META[project.tool_type] || { label: project.tool_type, icon: FolderOpen, gradient: '' };
        const Icon = meta.icon;
        return (
          <div
            className="os-wb-lightbox-overlay"
            onClick={() => setPreviewId(null)}
          >
            <div
              className="os-wb-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部栏 */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7B61FF]" />
                  <span className="text-sm font-medium text-slate-700">{project.title || project.tool_name}</span>
                  <span className="text-xs text-slate-400 ml-1">{meta.label}</span>
                </div>
                <button
                  onClick={() => setPreviewId(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              {/* 图片 */}
              <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
                <img
                  src={project.thumbnail}
                  alt={project.title || ''}
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
                />
              </div>
              {/* 底部操作 */}
              <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-100">
                <button
                  onClick={() => { handleDownload(project); setPreviewId(null); }}
                  className="os-wb-action-btn"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
                <button
                  onClick={() => { handleEdit(project); setPreviewId(null); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C6CFF] to-[#5B5CF6] text-white text-sm rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C6CFF]/20 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  继续编辑
                </button>
                <button
                  onClick={() => { handleDelete(project.id); setPreviewId(null); }}
                  className="os-wb-action-btn text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>{/* end os-content */}
    </div>
  );
}
