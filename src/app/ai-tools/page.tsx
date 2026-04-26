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
  Crown, Zap, Shield
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
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
      >
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">AI工具库</h1>
            <p className="text-sm text-muted-foreground mt-1">
              精选238款优质AI工具
            </p>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索工具名称、出品方..."
                className="pl-9 h-10"
              />
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-accent'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-accent'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => {
                setActiveCategory('');
                router.push('/ai-tools');
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                !activeCategory
                  ? 'bg-black text-white'
                  : 'bg-secondary hover:bg-accent'
              )}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  activeCategory === cat.name
                    ? 'bg-black text-white'
                    : 'bg-secondary hover:bg-accent'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 工具列表 */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              加载中...
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">未找到相关工具</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearch('');
                  setActiveCategory('');
                  router.push('/ai-tools');
                }}
              >
                清除筛选
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            /* 网格视图 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group block p-5 rounded-xl bg-secondary hover:bg-accent transition-colors"
                >
                  {/* Logo和名称 */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-10 h-10 rounded-lg object-cover bg-background"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        {tool.is_featured && (
                          <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.producer}
                      </p>
                    </div>
                  </div>

                  {/* 亮点 */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {tool.highlight}
                  </p>

                  {/* 底部标签 */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tool.free_type}
                    </Badge>
                    {tool.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {tool.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-2">
              {filteredTools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-accent transition-colors"
                >
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-10 h-10 rounded-lg object-cover bg-background"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      {tool.is_featured && (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {tool.is_official && (
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tool.producer}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground hidden sm:block flex-1 truncate">
                    {tool.highlight}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {tool.free_type}
                    </Badge>
                    {tool.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{tool.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* 统计信息 */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            共 {filteredTools.length} 个工具
          </div>
        </div>
      </main>
    </div>
  );
}
