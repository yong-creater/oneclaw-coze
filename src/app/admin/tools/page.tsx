'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Zap, 
  Settings,
  Search,
  Eye,
  EyeOff,
  Star,
  Coins,
  RefreshCw,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

interface ToolData {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  enabled: boolean;
  credits: number;
  featured: boolean;
  totalUsage: number;
  todayUsage: number;
  uniqueUsers: number;
}

interface StatsData {
  totalUsage: number;
  todayUsage: number;
  uniqueUsers: number;
  enabledCount: number;
  totalCount: number;
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ credits: 0, enabled: true, featured: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 获取工具列表
  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tools', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setTools(data.data.tools);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('获取工具列表失败:', error);
      showToast('获取工具列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // 显示提示
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 更新工具配置
  const handleUpdateTool = async (toolId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          toolId,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('配置已更新', 'success');
        setEditingTool(null);
        fetchTools();
      } else {
        showToast(data.error || '更新失败', 'error');
      }
    } catch {
      showToast('更新失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 开始编辑
  const handleEdit = (tool: ToolData) => {
    setEditingTool(tool.id);
    setEditForm({
      credits: tool.credits,
      enabled: tool.enabled,
      featured: tool.featured,
    });
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingTool(null);
    setEditForm({ credits: 0, enabled: true, featured: false });
  };

  // 筛选工具
  const filteredTools = tools.filter(tool => {
    const matchSearch = 
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || tool.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // 获取分类列表
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast 提示 */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">工具管理</h1>
            <p className="text-sm text-slate-500 mt-1">管理 AI 工具的使用统计和配置</p>
          </div>
          <button
            onClick={fetchTools}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">总使用次数</span>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatNumber(stats.totalUsage)}</div>
              <p className="text-xs text-slate-400 mt-1">累计使用次数</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">今日使用</span>
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatNumber(stats.todayUsage)}</div>
              <p className="text-xs text-slate-400 mt-1">今日使用次数</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">独立用户</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatNumber(stats.uniqueUsers)}</div>
              <p className="text-xs text-slate-400 mt-1">使用过的用户数</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">启用状态</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.enabledCount}/{stats.totalCount}</div>
              <p className="text-xs text-slate-400 mt-1">已启用/总工具数</p>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索工具名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
              <option value="all">全部分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 工具列表 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">工具</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">分类</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">使用统计</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">积分</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">状态</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">推荐</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      加载中...
                    </td>
                  </tr>
                ) : filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      未找到工具
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool) => (
                    <tr key={tool.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      {/* 工具信息 */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl`}>
                            {tool.icon}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{tool.name}</div>
                            <div className="text-xs text-slate-400">ID: {tool.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* 分类 */}
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                          {tool.category}
                        </span>
                      </td>

                      {/* 使用统计 */}
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-slate-900">
                            <span className="text-slate-500">总:</span> {formatNumber(tool.totalUsage)}
                          </div>
                          <div className="text-slate-500">
                            <span className="text-slate-400">今日:</span> {formatNumber(tool.todayUsage)}
                          </div>
                          <div className="text-slate-500">
                            <span className="text-slate-400">用户:</span> {formatNumber(tool.uniqueUsers)}
                          </div>
                        </div>
                      </td>

                      {/* 积分 */}
                      <td className="px-4 py-4">
                        {editingTool === tool.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editForm.credits}
                              onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                              className="w-20 h-8 px-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            />
                            <Coins className="w-4 h-4 text-orange-500" />
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                            tool.credits === 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            <Coins className="w-3 h-3" />
                            {tool.credits === 0 ? '免费' : `${tool.credits}积分`}
                          </span>
                        )}
                      </td>

                      {/* 启用状态 */}
                      <td className="px-4 py-4">
                        {editingTool === tool.id ? (
                          <button
                            onClick={() => setEditForm({ ...editForm, enabled: !editForm.enabled })}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer ${
                              editForm.enabled 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {editForm.enabled ? (
                              <>
                                <Eye className="w-3 h-3" />
                                已启用
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                已禁用
                              </>
                            )}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                            tool.enabled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {tool.enabled ? (
                              <>
                                <Eye className="w-3 h-3" />
                                已启用
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                已禁用
                              </>
                            )}
                          </span>
                        )}
                      </td>

                      {/* 推荐 */}
                      <td className="px-4 py-4">
                        {editingTool === tool.id ? (
                          <button
                            onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer ${
                              editForm.featured 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${editForm.featured ? 'fill-amber-500' : ''}`} />
                            {editForm.featured ? '已推荐' : '未推荐'}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                            tool.featured 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Star className={`w-3 h-3 ${tool.featured ? 'fill-amber-500' : ''}`} />
                            {tool.featured ? '已推荐' : '未推荐'}
                          </span>
                        )}
                      </td>

                      {/* 操作 */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingTool === tool.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateTool(tool.id)}
                                disabled={saving}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {saving ? '保存中...' : '保存'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(tool)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              设置
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 工具是代码内置的，不能增删</li>
            <li>• 点击「设置」可以修改工具的积分价格、启用状态和推荐标记</li>
            <li>• 禁用的工具不会在前台显示</li>
            <li>• 积分设置为 0 表示免费使用</li>
            <li>• 推荐的工具会显示在前台工具页的推荐标签</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
