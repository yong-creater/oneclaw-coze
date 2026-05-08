'use client';

import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
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
const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  product_generator: { label: 'AI商品图', icon: Package, color: 'text-orange-600 bg-orange-50' },
  background_removal: { label: '智能抠图', icon: Scissors, color: 'text-blue-600 bg-blue-50' },
  ai_photo: { label: 'AI写真', icon: Camera, color: 'text-pink-600 bg-pink-50' },
  product_poster: { label: '商品海报', icon: ImageIcon, color: 'text-violet-600 bg-violet-50' },
  xiaohongshu: { label: '小红书', icon: FileText, color: 'text-red-600 bg-red-50' },
  novel: { label: '小说创作', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
  resume: { label: '简历优化', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
  productpage: { label: '详情页', icon: FileText, color: 'text-sky-600 bg-sky-50' },
  cover: { label: '封面设计', icon: ImageIcon, color: 'text-teal-600 bg-teal-50' },
  video: { label: '视频脚本', icon: FileText, color: 'text-rose-600 bg-rose-50' },
};

export default function ProjectPage() {
  const { setCurrentMenu, setPendingInput } = useMenu();
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

  // 重新生成 → 跳转首页
  const handleRegenerate = (project: Generation) => {
    setPendingInput(`重新生成：${project.title || project.tool_name}`);
    setCurrentMenu('home');
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
    <div className="ui-page">
      {/* 标题区 */}
      <div className="ui-page-header">
        <h1 className="ui-page-title">我的项目</h1>
        <p className="ui-page-desc">查看和管理生成记录</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索项目..."
          className="ui-input pl-10"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
            activeType === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部 {projects.length}
        </button>
        {Object.entries(TOOL_META)
          .filter(([key]) => typeCounts[key])
          .map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
                activeType === key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {meta.label} {typeCounts[key]}
            </button>
          ))}
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          加载中...
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((project) => {
            const meta = TOOL_META[project.tool_type] || {
              label: project.tool_type,
              icon: FolderOpen,
              color: 'text-slate-600 bg-slate-50',
            };
            const Icon = meta.icon;
            const isExpanded = expandedId === project.id;

            return (
              <div key={project.id} className="ui-card p-0 overflow-hidden">
                {/* 主行 */}
                <div className="p-4 flex items-center gap-3">
                  {/* 缩略图/图标 */}
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${meta.color}`}>
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt=""
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {project.title || project.tool_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-300">|</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  {/* 状态 */}
                  <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    完成
                  </span>
                  {/* 操作 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      className="ui-btn-icon"
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="ui-btn-icon text-slate-400 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRegenerate(project)}
                      className="ui-btn-icon text-slate-400 hover:text-brand"
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
                        <span className="text-emerald-600">已完成</span>
                      </div>
                      {project.thumbnail && (
                        <div className="col-span-2 mt-1">
                          <img
                            src={project.thumbnail}
                            alt=""
                            className="w-full max-w-[200px] rounded-[10px] border border-slate-200"
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
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FolderOpen className="w-8 h-8 mb-2" />
          <p className="text-sm">暂无生成记录</p>
        </div>
      )}
    </div>
  );
}
