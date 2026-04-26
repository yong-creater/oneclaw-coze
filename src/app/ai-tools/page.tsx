'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search, Grid3X3, List, X,
  Video, Users, Image, MessageSquare, Code, Mic, FileText, Music, Briefcase, Search as SearchIcon
} from 'lucide-react';

// 分类配置 - 简洁图标
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  '视频生成': Video,
  '数字人': Users,
  'AI绘画': Image,
  'AI聊天': MessageSquare,
  'AI编程': Code,
  'AI配音': Mic,
  'AI写作': FileText,
  'AI音频': Music,
  'AI办公': Briefcase,
  'AI搜索': SearchIcon,
};

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category: string;
  free_type: string;
  feature_tags: string[];
  official_url: string;
  is_featured: boolean;
}

interface Category {
  id: number;
  name: string;
  count?: number;
}

export default function AIToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载分类
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCategories(Array.isArray(data.data) ? data.data : (data.data.categories || []));
        }
      })
      .catch(() => {});
  }, []);

  // 加载工具
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    if (selectedCategory) params.set('category', selectedCategory);
    
    fetch(`/api/tools?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTools(Array.isArray(data.data) ? data.data : (data.data.tools || []));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchInput, selectedCategory]);

  // 搜索处理
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/ai-tools${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 分类点击
  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setSearchInput('');
  };

  // 清空筛选
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchInput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        {/* 顶部区域 - 简洁设计 */}
        <div className="bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI工具库</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedCategory || '全部工具'} · {tools.length} 个工具
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="cursor-pointer"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="cursor-pointer"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 搜索栏 */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索工具..."
                  className="h-9 pl-9 pr-4 rounded-lg bg-card border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {(selectedCategory || searchInput) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="cursor-pointer">
                  <X className="w-4 h-4 mr-1" />
                  清空
                </Button>
              )}
            </div>

            {/* 分类筛选 - 简洁横向滚动 */}
            <div className="flex items-center gap-2 mt-4 -mx-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleCategoryClick('')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors cursor-pointer font-medium",
                  !selectedCategory 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                全部
              </button>
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.name] || Grid3X3;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 font-medium",
                      selectedCategory === cat.name 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 工具列表 */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card-minimal p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-muted mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">未找到匹配的工具</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="card-minimal p-4 group block cursor-pointer"
                >
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 overflow-hidden">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium">{tool.name[0]}</span>
                    )}
                  </div>
                  
                  {/* 信息 */}
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {tool.highlight}
                  </p>
                  
                  {/* 标签 */}
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0 rounded font-medium">
                      {tool.free_type}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="card-minimal p-4 flex items-center gap-4 group cursor-pointer"
                >
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium">{tool.name[0]}</span>
                    )}
                  </div>
                  
                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tool.producer}
                    </p>
                  </div>
                  
                  {/* 亮点 */}
                  <p className="text-xs text-muted-foreground hidden md:block w-48 truncate">
                    {tool.highlight}
                  </p>
                  
                  {/* 标签 */}
                  <Badge variant="secondary" className="text-xs hidden sm:flex rounded font-medium">
                    {tool.free_type}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
