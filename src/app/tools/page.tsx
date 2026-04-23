'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ExternalLink, Star, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  producer: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  feature_tags: string[];
  official_url: string;
  category?: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '付费工具': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [toolsRes, catsRes] = await Promise.all([
        fetch(`/api/tools${selectedCategory ? `?category=${selectedCategory}` : ''}`),
        fetch('/api/categories'),
      ]);
      const toolsData = await toolsRes.json();
      const catsData = await catsRes.json();
      if (toolsData.success) setTools(toolsData.data);
      if (catsData.success) setCategories(catsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.highlight?.toLowerCase().includes(query) ||
      tool.producer?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--background)]/95 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </Link>
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-[var(--secondary)] border-0 rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-[var(--secondary)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === null
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-[var(--muted-foreground)]">
          共 {filteredTools.length} 个工具
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border border-[var(--border)] rounded-xl p-4 animate-pulse">
                <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg mb-3" />
                <div className="h-4 bg-[var(--secondary)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[var(--secondary)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)]">没有找到相关工具</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`}>
                <div className="group border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {tool.logo ? (
                        <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg font-semibold">{tool.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{tool.name}</h3>
                      {tool.is_featured && (
                        <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">精选</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
                    {tool.highlight || '暂无描述'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${FREE_TYPE_COLORS[tool.free_type] || 'bg-[var(--secondary)]'}`}>
                      {tool.free_type}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`}>
                <div className="group flex items-center gap-4 border border-[var(--border)] rounded-xl p-4 hover:border-[var(--foreground)] transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-lg font-semibold">{tool.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{tool.name}</h3>
                      {tool.is_featured && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {tool.highlight || '暂无描述'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${FREE_TYPE_COLORS[tool.free_type] || 'bg-[var(--secondary)]'}`}>
                      {tool.free_type}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2024 OneClaw
          </div>
        </div>
      </footer>
    </div>
  );
}
