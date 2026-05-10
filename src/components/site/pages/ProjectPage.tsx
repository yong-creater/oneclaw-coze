'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
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
  Sparkles,
  Eye,
  Trash2,
  Maximize2,
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

// ========== 工具类型映射 — 统一标签 ==========
const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  product_generator: { label: '商品图', icon: Package },
  background_removal: { label: '智能抠图', icon: Scissors },
  ai_photo: { label: 'AI写真', icon: Camera },
  product_poster: { label: '海报', icon: ImageIcon },
  xiaohongshu: { label: '小红书', icon: FileText },
  productpage: { label: '详情页', icon: FileText },
  cover: { label: '封面设计', icon: ImageIcon },
  video: { label: '视频脚本', icon: FileText },
};

// 筛选列表
const TYPE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'product_generator', label: '商品图' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'ai_photo', label: 'AI写真' },
  { key: 'product_poster', label: '海报' },
  { key: 'productpage', label: '详情页' },
];

// 作品卡片比例映射
const TOOL_ASPECT: Record<string, string> = {
  product_generator: '4/3',
  xiaohongshu: '3/4',
  ai_photo: '3/4',
  product_poster: '4/5',
  productpage: '1/2',
  background_removal: '1/1',
  cover: '3/4',
  video: '16/9',
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
    fetch('/api/generations', { cache: 'no-store', credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.generations || []);
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

  // 继续编辑
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

  // ===== 渲染 =====
  return (
    <div className="os-page">
      <div className="os-content">
        {/* Toast */}
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
          <div className="os-empty" style={{ minHeight: '50vh' }}>
            <div className="os-empty-icon"><FolderOpen className="w-8 h-8" /></div>
            <div className="os-empty-title">还没有作品</div>
            <div className="os-empty-desc">完成一次创作后，你的作品会自动保存在这里</div>
            <div className="os-empty-actions">
              <button
                onClick={() => { setPendingInput(''); router.push('/'); }}
                className="os-btn-primary"
              >
                <Wand2 className="w-4 h-4" />
                开始创作
              </button>
              <button
                onClick={() => router.push('/inspiration')}
                className="os-btn-secondary"
              >
                <Sparkles className="w-4 h-4" />
                查看灵感案例
              </button>
            </div>
          </div>
        )}

        {/* ===== 有作品时 ===== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7C6CFF] rounded-full animate-spin mb-3" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : projects.length > 0 ? (
          <>
            {/* Page Title */}
            <div className="os-page-header">
              <h1 className="os-page-title">我的作品</h1>
              <p className="os-page-subtitle">管理你生成过的内容，继续优化、下载和复用</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索作品..."
                className="os-search-input"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* 类型筛选 — 统一 pill */}
            <div className="flex gap-2 flex-wrap mb-8">
              {TYPE_FILTERS.map(f => {
                const count = f.key === 'all' ? projects.length : (typeCounts[f.key] || 0);
                if (f.key !== 'all' && !count) return null;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveType(f.key)}
                    className={`os-btn-capsule ${activeType === f.key ? 'os-btn-capsule-active' : ''}`}
                  >
                    {f.label}
                    <span className="os-btn-capsule-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* 作品网格 */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((project) => {
                  const meta = TOOL_META[project.tool_type] || { label: project.tool_type, icon: FolderOpen };
                  const Icon = meta.icon;
                  const aspect = TOOL_ASPECT[project.tool_type] || '4/3';

                  return (
                    <div
                      key={project.id}
                      className="os-card-static overflow-hidden group"
                      style={{ padding: 0 }}
                    >
                      {/* 缩略图区 — 按工具类型自适应比例 */}
                      <div className="relative overflow-hidden" style={{ aspectRatio: aspect, borderRadius: '20px 20px 0 0' }}>
                        {project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt={project.title || ''}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F4F0FF] to-[#EEF7FF]">
                            <Icon className="w-10 h-10 text-[#7C6CFF]/20" />
                          </div>
                        )}
                        {/* 类型标签 */}
                        <span className="os-tag absolute top-3 left-3">
                          {meta.label}
                        </span>
                        {/* Hover 操作层 — 毛玻璃 */}
                        <div className="os-work-hover">
                          <button onClick={() => handleEdit(project)} className="os-work-hover-btn">
                            <Pencil className="w-4 h-4" /> 继续优化
                          </button>
                          <button onClick={() => handleDownload(project)} className="os-work-hover-btn">
                            <Download className="w-4 h-4" /> 下载
                          </button>
                          <button onClick={() => setPreviewId(project.id)} className="os-work-hover-btn">
                            <Maximize2 className="w-4 h-4" /> 大图
                          </button>
                        </div>
                      </div>

                      {/* 文字区 */}
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-[#1F2937] truncate">
                          {project.title || project.tool_name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#A0A8B8]">
                            {formatTime(project.created_at)}
                          </span>
                          {/* 删除按钮 — 仅在 hover 文字区时显示 */}
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1.5 rounded-lg text-[#A0A8B8] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="os-empty">
                <div className="os-empty-icon"><Search className="w-8 h-8" /></div>
                <div className="os-empty-title">没有找到匹配的作品</div>
              </div>
            )}
          </>
        ) : null}

        {/* ===== 大图预览 Lightbox ===== */}
        {previewId !== null && (() => {
          const project = projects.find((p) => p.id === previewId);
          if (!project || !project.thumbnail) return null;
          const meta = TOOL_META[project.tool_type] || { label: project.tool_type, icon: FolderOpen };
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
                    <Icon className="w-4 h-4 text-[#7C6CFF]" />
                    <span className="text-sm font-medium text-slate-700">{project.title || project.tool_name}</span>
                    <span className="os-tag ml-1">{meta.label}</span>
                  </div>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                {/* 图片 */}
                <div className="flex-1 flex items-center justify-center p-6 bg-[#F7F7FB]">
                  <img
                    src={project.thumbnail}
                    alt={project.title || ''}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
                  />
                </div>
                {/* 底部操作 */}
                <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-100">
                  <button onClick={() => { handleDownload(project); setPreviewId(null); }} className="os-btn-secondary" style={{ height: 38 }}>
                    <Download className="w-4 h-4" /> 下载
                  </button>
                  <button onClick={() => { handleEdit(project); setPreviewId(null); }} className="os-btn-primary" style={{ height: 38 }}>
                    <Pencil className="w-4 h-4" /> 继续优化
                  </button>
                  <button onClick={() => { handleDelete(project.id); setPreviewId(null); }} className="os-btn-secondary" style={{ height: 38, color: '#ef4444', borderColor: '#fecaca' }}>
                    <Trash2 className="w-4 h-4" /> 删除
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
