'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search, Filter, Grid3X3, LayoutGrid, ExternalLink, Star,
  Crown, Zap, Shield, Sparkles
} from 'lucide-react';

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category: string;
  category_id: number;
  free_type: string;
  official_url: string;
  is_featured: boolean;
  is_official: boolean;
  rating: number;
  rating_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AIToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 从URL同步筛选状态
  useEffect(() => {
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    
    if (category) {
      setActiveCategory(decodeURIComponent(category));
    } else {
      setActiveCategory('');
    }
    
    if (searchQuery) {
      setSearch(decodeURIComponent(searchQuery));
    }
  }, [searchParams]);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [toolsRes, catsRes] = await Promise.all([
        fetch('/api/tools?limit=100'),
        fetch('/api/categories'),
      ]);
      
      const toolsData = await toolsRes.json();
      const catsData = await catsRes.json();
      
      // 兼容多种数据格式
      const toolsList = toolsData.tools || toolsData.data || toolsData || [];
      setTools(toolsList);
      setCategories(catsData.categories || catsData.data || catsData || []);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 筛选工具
  const filteredTools = tools.filter(tool => {
    const matchCategory = !activeCategory || tool.category === activeCategory;
    const matchSearch = !search || 
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.producer.toLowerCase().includes(search.toLowerCase()) ||
      tool.highlight.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 搜索处理
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);
    
    const query = params.toString();
    router.push(`/ai-tools${query ? `?${query}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 分类点击
  const handleCategoryClick = (catName: string) => {
    if (activeCategory === catName) {
      setActiveCategory('');
      router.push('/ai-tools');
    } else {
      setActiveCategory(catName);
      router.push(`/ai-tools?category=${encodeURIComponent(catName)}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              AI工具库
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              精选238款优质AI工具，发现最适合自己的AI助手
            </p>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up stagger-1">
            {/* 搜索框 */}
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索工具名称、出品方..."
                  className="pl-11 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'list' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 分类筛选 - 精致胶囊 */}
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up stagger-2">
            <button
              onClick={() => {
                setActiveCategory('');
                router.push('/ai-tools');
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                !activeCategory
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
              )}
            >
              全部
            </button>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeCategory === cat.name
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-200 dark:bg-zinc-700 skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded skeleton" />
                      <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded skeleton mb-3" />
                  <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                </div>
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && filteredTools.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                未找到相关工具
              </h3>
              <p className="text-sm text-zinc-500 mb-4">
                试试其他关键词或分类
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('');
                  router.push('/ai-tools');
                }}
                className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                清除筛选
              </Button>
            </div>
          )}

          {/* 工具列表 - 网格视图 */}
          {!loading && filteredTools.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool, i) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  {/* 顶部渐变条 */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* 装饰光晕 */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Logo和名称 */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-11 h-11 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.is_featured && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {tool.producer || '官方'}
                      </p>
                    </div>
                  </div>

                  {/* 亮点 */}
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-4 min-h-[2rem]">
                    {tool.highlight}
                  </p>

                  {/* 底部标签 */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                      tool.free_type.includes('免费') || tool.free_type.includes('完全')
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : tool.free_type.includes('付费')
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    )}>
                      {tool.free_type}
                    </span>
                    {tool.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{tool.rating.toFixed(1)}</span>
                        <span className="text-zinc-400">({tool.rating_count})</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* 工具列表 - 列表视图 */}
          {!loading && filteredTools.length > 0 && viewMode === 'list' && (
            <div className="space-y-2">
              {filteredTools.map((tool, i) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${i * 15}ms` }}
                >
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-11 h-11 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tool.name}
                      </h3>
                      {tool.is_featured && (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {tool.is_official && (
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      {tool.producer || '官方'}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500 hidden sm:block flex-1 truncate">
                    {tool.highlight}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                      tool.free_type.includes('免费') || tool.free_type.includes('完全')
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : tool.free_type.includes('付费')
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    )}>
                      {tool.free_type}
                    </span>
                    {tool.rating > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{tool.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <ExternalLink className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* 统计信息 */}
          {!loading && filteredTools.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-400">
                共找到 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredTools.length}</span> 个工具
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
