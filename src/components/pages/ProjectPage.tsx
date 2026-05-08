'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMenu } from '@/components/common/MenuProvider';
import { FolderOpen, Eye, Trash2, RefreshCw, Clock, Tag, Image as ImageIcon, FileText, Video, Sparkles } from 'lucide-react';

// ========== 数据结构 ==========
interface Project {
  id: number;
  name: string;
  type: string;
  tool_type: string;
  createdAt: string;
  status: string;
  thumbnail: string | null;
  tool_name: string;
}

// ========== 工具类型映射 ==========
const toolTypeMap: Record<string, { label: string; icon: typeof ImageIcon; color: string }> = {
  'product-generator': { label: 'AI商品图', icon: ImageIcon, color: 'bg-orange-100 text-orange-600' },
  'background-removal': { label: '智能抠图', icon: ImageIcon, color: 'bg-blue-100 text-blue-600' },
  'ai-photo': { label: 'AI写真', icon: ImageIcon, color: 'bg-pink-100 text-pink-600' },
  'product-poster': { label: '商品海报', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  'xiaohongshu-generator': { label: '小红书', icon: FileText, color: 'bg-red-100 text-red-600' },
  'novel': { label: '小说创作', icon: FileText, color: 'bg-green-100 text-green-600' },
  'resume': { label: '简历优化', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  'productpage': { label: '详情页', icon: FileText, color: 'bg-cyan-100 text-cyan-600' },
  'cover-generator': { label: '封面设计', icon: ImageIcon, color: 'bg-indigo-100 text-indigo-600' },
  'video-script': { label: '视频脚本', icon: Video, color: 'bg-rose-100 text-rose-600' },
};

const defaultTypeInfo = { label: '其他', icon: Sparkles, color: 'bg-slate-100 text-slate-600' };

// ========== 格式化时间 ==========
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateStr;
  }
}

// ========== 组件 ==========
export default function ProjectPage() {
  const { setCurrentMenu, setPendingInput } = useMenu();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [detailId, setDetailId] = useState<number | null>(null);

  // 加载项目列表
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generations?limit=50');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(
            (data.generations || []).map((g: Record<string, unknown>) => ({
              id: g.id as number,
              name: (g.title as string) || (g.tool_name as string) || '未命名项目',
              type: (g.usage_type as string) || 'other',
              tool_type: (g.tool_type as string) || '',
              createdAt: g.created_at as string,
              status: g.output_content ? '完成' : '生成中',
              thumbnail: (g.thumbnail as string) || null,
              tool_name: (g.tool_name as string) || '',
            }))
          );
        }
      }
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 删除项目
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/generations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // 静默处理
    }
  };

  // 重新生成 → 跳转首页
  const handleRegenerate = (project: Project) => {
    const typeInfo = toolTypeMap[project.tool_type] || defaultTypeInfo;
    setPendingInput(`重新生成：${project.name}（${typeInfo.label}）`);
    setCurrentMenu('home');
  };

  // 查看详情
  const handleView = (id: number) => {
    setDetailId(detailId === id ? null : id);
  };

  // 按类型筛选
  const filteredProjects = filterType === 'all'
    ? projects
    : projects.filter((p) => p.tool_type === filterType);

  // 提取已有的类型
  const existingTypes = Array.from(new Set(projects.map((p) => p.tool_type)));

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">我的项目</h1>
        <p className="text-sm text-slate-500 mt-1">管理你的AI生成记录</p>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部 ({projects.length})
        </button>
        {existingTypes.map((type) => {
          const info = toolTypeMap[type] || defaultTypeInfo;
          const count = projects.filter((p) => p.tool_type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FolderOpen className="w-12 h-12 mb-3" />
          <p className="text-lg font-medium">暂无项目</p>
          <p className="text-sm mt-1">使用AI工具生成内容后，记录将在这里显示</p>
        </div>
      )}

      {/* 项目列表 */}
      {!loading && filteredProjects.length > 0 && (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const typeInfo = toolTypeMap[project.tool_type] || defaultTypeInfo;
            const TypeIcon = typeInfo.icon;
            const isCompleted = project.status === '完成';

            return (
              <div key={project.id} className="space-y-0">
                {/* 卡片 */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* 缩略图 */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TypeIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(project.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                        title="查看"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(project)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="重新生成"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 展开详情 */}
                {detailId === project.id && (
                  <div className="bg-slate-50 border-2 border-t-0 border-slate-200 rounded-b-2xl p-4 -mt-2 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">项目ID</span>
                        <p className="text-slate-700 font-medium mt-0.5">#{project.id}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">工具类型</span>
                        <p className="text-slate-700 font-medium mt-0.5">{typeInfo.label}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">创建时间</span>
                        <p className="text-slate-700 font-medium mt-0.5">{formatDate(project.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">状态</span>
                        <p className={`font-medium mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {project.status}
                        </p>
                      </div>
                    </div>
                    {project.thumbnail && (
                      <div className="mt-3">
                        <span className="text-slate-400 text-sm">预览</span>
                        <div className="mt-1 w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                          <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
