'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Sparkles, Search, ArrowRight, ExternalLink, Star, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  category?: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '付费工具': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toolsRes, catsRes] = await Promise.all([
        fetch('/api/tools?featured=true&limit=12'),
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
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.highlight?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tool.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--foreground)] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="text-xl font-semibold tracking-tight">OneClaw</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/tools" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              AI应用
            </Link>
            <Link href="/resume" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              简历优化
            </Link>
            <Link href="/about" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              关于
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight mb-4">
              发现最好的 AI 工具
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              精选热门AI工具，帮你找到最合适的效率工具
            </p>
            
            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <Input
                type="text"
                placeholder="搜索AI工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-[var(--secondary)] border-0 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/resume">
              <div className="group border border-[var(--border)] rounded-xl p-6 hover:border-[var(--foreground)] transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">简历优化</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">AI智能优化简历，提升面试机会</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            <Link href="/tools">
              <div className="group border border-[var(--border)] rounded-xl p-6 hover:border-[var(--foreground)] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--secondary)] rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">AI应用</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">浏览所有AI工具</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              全部
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">精选AI应用</h2>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl p-4 animate-pulse">
                  <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg mb-3" />
                  <div className="h-4 bg-[var(--secondary)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--secondary)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTools.slice(0, 8).map((tool) => (
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <span>© 2024 OneClaw</span>
              <span className="hidden md:inline">·</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">
                京ICP备XXXXXXXX号
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-[var(--foreground)]">关于</Link>
              <Link href="/prompts" className="hover:text-[var(--foreground)]">提示词</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
