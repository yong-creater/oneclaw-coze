'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Star, ExternalLink, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  is_active: boolean;
  official_url: string;
  promotion_url: string | null;
  created_at: string;
  categories: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export default function ToolsAdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    free_type: '',
    is_featured: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.category_id) params.set('category_id', filters.category_id);
      if (filters.free_type) params.set('free_type', filters.free_type);
      if (filters.is_featured) params.set('is_featured', filters.is_featured);
      
      const res = await fetch(`/api/admin/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTools(data.data);
        setPagination(prev => ({ ...prev, total: data.pagination.total, total_pages: data.pagination.total_pages }));
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/init-data');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: 'search' | 'category_id' | 'free_type' | 'is_featured', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除工具「${name}」吗？`)) return;
    
    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleToggleFeatured = async (id: number, is_featured: boolean) => {
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured: !is_featured }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('更新失败: ' + data.error);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败');
    }
  };

  const handleToggleActive = async (id: number, is_active: boolean) => {
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !is_active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('更新失败: ' + data.error);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* 搜索框 */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索工具名称、出品方..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', filters.search)}
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 
                bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => handleFilterChange('search', filters.search)}
              className="ml-2 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
            >
              搜索
            </button>
          </div>
          
          {/* 分类筛选 */}
          <select
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
              bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">全部分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          {/* 免费类型筛选 */}
          <select
            value={filters.free_type}
            onChange={(e) => handleFilterChange('free_type', e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
              bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">全部类型</option>
            <option value="完全免费">完全免费</option>
            <option value="免费额度">免费额度</option>
            <option value="限时免费">限时免费</option>
            <option value="付费工具">付费工具</option>
          </select>
          
          {/* 推荐筛选 */}
          <select
            value={filters.is_featured}
            onChange={(e) => handleFilterChange('is_featured', e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
              bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">全部状态</option>
            <option value="true">首页推荐</option>
            <option value="false">非推荐</option>
          </select>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tools/import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
              text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            批量导入
          </Link>
          <Link
            href="/admin/tools/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white 
              text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加工具
          </Link>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : tools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">工具</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">分类</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">免费类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={tool.logo} 
                          alt={tool.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">' + tool.name[0] + '</text></svg>';
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tool.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{tool.producer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {tool.categories?.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${FREE_TYPE_COLORS[tool.free_type] || ''}`}>
                        {tool.free_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFeatured(tool.id, tool.is_featured)}
                          className={`p-1 rounded transition-colors ${
                            tool.is_featured 
                              ? 'text-orange-500 hover:text-orange-600' 
                              : 'text-slate-300 hover:text-orange-500'
                          }`}
                          title={tool.is_featured ? '取消推荐' : '设为推荐'}
                        >
                          <Star className="w-4 h-4" fill={tool.is_featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(tool.id, tool.is_active)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            tool.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {tool.is_active ? '上架' : '下架'}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={tool.promotion_url || tool.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="访问官网"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/tools/${tool.id}/edit`}
                          className="p-1.5 rounded text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tool.id, tool.name)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">暂无工具数据</p>
            <Link
              href="/admin/tools/import"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white 
                text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              批量导入工具
            </Link>
          </div>
        )}

        {/* 分页 */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              共 {pagination.total} 条记录
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.total_pages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
