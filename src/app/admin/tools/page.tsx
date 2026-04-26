'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, Edit, Trash2, Star, ExternalLink, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

function ToolsAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get('category') || 'all';
  
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (search) params.set('search', search);
      if (currentCategoryId && currentCategoryId !== 'all') {
        params.set('category_id', currentCategoryId);
      }
      // 添加时间戳防止缓存
      params.set('_t', Date.now().toString());
      
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
  }, [pagination.page, pagination.limit, search, currentCategoryId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/admin/init-data?_t=${Date.now()}`);
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
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [currentCategoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
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

  const getCurrentCategoryName = () => {
    if (currentCategoryId === 'all') return '全部工具';
    const cat = categories.find(c => c.id.toString() === currentCategoryId.toString());
    return cat?.name || '全部工具';
  };

  const handleCategoryClick = (catId: string) => {
    if (catId === 'all') {
      router.push('/admin/tools');
    } else {
      router.push(`/admin/tools?category=${catId}`);
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* 左侧分类导航 */}
      <aside className="w-56 flex-shrink-0">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-4">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white">分类筛选</h2>
          </div>
          <nav className="p-2">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentCategoryId === 'all'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>全部工具</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {pagination.total}
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id.toString())}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentCategoryId?.toString() === cat.id.toString()
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <div className="flex-1 space-y-4">
        {/* 工具栏 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{getCurrentCategoryName()}</h1>
            <span className="text-sm text-slate-500">({pagination.total})</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索工具..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 w-56 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
            >
              搜索
            </button>
            
            <Link
              href="/admin/tools/import"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              导入
            </Link>
            <Link
              href="/admin/tools/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white 
                text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加
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
    </div>
  );
}

export default function ToolsAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    }>
      <ToolsAdminContent />
    </Suspense>
  );
}
