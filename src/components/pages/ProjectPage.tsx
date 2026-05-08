'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useMenu } from '@/components/common/MenuProvider';

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
}

// ========== 工具类型映射 ==========
const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; gradient: string }> = {
  product_generator: { label: 'AI商品图', icon: Package, gradient: 'from-violet-500 to-purple-600' },
  background_removal: { label: '智能抠图', icon: Scissors, gradient: 'from-blue-400 to-cyan-500' },
  ai_photo: { label: 'AI写真', icon: Camera, gradient: 'from-pink-400 to-rose-500' },
  product_poster: { label: '商品海报', icon: ImageIcon, gradient: 'from-fuchsia-500 to-pink-500' },
  xiaohongshu: { label: '小红书', icon: FileText, gradient: 'from-red-400 to-orange-500' },
  novel: { label: '小说创作', icon: BookOpen, gradient: 'from-emerald-400 to-teal-500' },
  resume: { label: '简历优化', icon: Sparkles, gradient: 'from-amber-400 to-yellow-500' },
  productpage: { label: '详情页', icon: FileText, gradient: 'from-blue-400 to-indigo-500' },
  cover: { label: '封面设计', icon: ImageIcon, gradient: 'from-teal-400 to-emerald-500' },
  video: { label: '视频脚本', icon: FileText, gradient: 'from-rose-400 to-red-500' },
};

export default function ProjectPage() {
  const { setPendingInput } = useMenu();
  const router = useRouter();
  const [projects, setProjects] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 获取生成记录
  useEffect(() => {
    fetch('/api/generations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // 删除记录
  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  // 重新生成
  const handleRegenerate = (project: Generation) => {
    setPendingInput(`重新生成：${project.title || project.tool_name}`);
    router.push('/');
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

  return (
    <div className="os-page">
      {/* 标题区 */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-section-title text-2xl">我的项目</h1>
        <p className="os-section-desc">查看和管理生成记录</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-5 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索项目..."
          className="os-search-input"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => setActiveType('all')}
          className={`os-filter-tag ${activeType === 'all' ? 'os-filter-tag-active' : 'os-filter-tag-inactive'}`}
        >
          全部 {projects.length}
        </button>
        {Object.entries(TOOL_META)
          .filter(([key]) => typeCounts[key])
          .map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`os-filter-tag ${activeType === key ? 'os-filter-tag-active' : 'os-filter-tag-inactive'}`}
            >
              {meta.label} {typeCounts[key]}
            </button>
          ))}
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((project, index) => {
            const meta = TOOL_META[project.tool_type] || {
              label: project.tool_type,
              icon: FolderOpen,
              gradient: 'from-slate-400 to-slate-500',
            };
            const Icon = meta.icon;
            const isExpanded = expandedId === project.id;

            return (
              <div
                key={project.id}
                className="os-card-static rounded-2xl overflow-hidden animate-stagger-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* 主行 */}
                <div className="p-4 flex items-center gap-4">
                  {/* 图标 */}
                  <div className={`os-icon-bg bg-gradient-to-br ${meta.gradient} text-white shrink-0`}>
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                      {project.title || project.tool_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400">
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-200">|</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  {/* 状态 */}
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    完成
                  </span>
                  {/* 操作 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="os-btn-ghost px-2 py-1.5"
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="os-btn-ghost px-2 py-1.5 text-slate-400 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRegenerate(project)}
                      className="os-btn-ghost px-2 py-1.5 text-slate-400 hover:text-purple-500"
                      title="重新生成"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                      <div>
                        <span className="text-slate-400">ID：</span>
                        <span className="text-slate-600">{project.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">类型：</span>
                        <span className="text-slate-600">{meta.label}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">时间：</span>
                        <span className="text-slate-600">
                          {new Date(project.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">状态：</span>
                        <span className="text-emerald-500 font-medium">已完成</span>
                      </div>
                      {project.thumbnail && (
                        <div className="col-span-2 mt-1">
                          <img
                            src={project.thumbnail}
                            alt=""
                            className="w-full max-w-[200px] rounded-xl border border-slate-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">暂无生成记录</p>
        </div>
      )}
    </div>
  );
}
