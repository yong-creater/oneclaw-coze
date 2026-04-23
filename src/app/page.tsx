'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, ExternalLink, FileText, Sparkles, ArrowRight } from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { SkeletonGrid } from '@/components/common/LobsterSkeleton';
import { ToolLogo } from '@/components/common/ToolLogo';

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  category_id: number;
  free_type: string;
  feature_tags: string[];
  official_url: string;
  promotion_url: string | null;
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
        fetch('/api/tools?limit=50'),
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AnimatedLobster size={36} />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              OneClaw
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="sm">精选工具</Button>
            </Link>
            <Link href="/resume">
              <Button variant="ghost" size="sm" className="text-orange-500">
                <FileText className="w-4 h-4 mr-1" />
                简历优化
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            发现最好的 <span className="text-orange-500">AI 工具</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            精选热门AI工具，助力你的工作和创作
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="搜索AI工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/resume">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">简历优化</h3>
                    <p className="text-white/80 text-sm">AI智能优化简历，提升面试机会</p>
                  </div>
                  <ArrowRight className="ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/tools">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">浏览全部工具</h3>
                    <p className="text-slate-500 text-sm">查看所有精选AI工具</p>
                  </div>
                  <ArrowRight className="ml-auto text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                selectedCategory === null 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              全部
            </Badge>
            {categories.slice(0, 8).map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1 ${
                  selectedCategory === cat.id 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">精选工具</h2>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-orange-500">
                查看更多 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTools.slice(0, 20).map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <ToolLogo 
                          src={tool.logo} 
                          name={tool.name} 
                          url={tool.promotion_url || tool.official_url}
                          size={48}
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate mb-1">{tool.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                            {tool.highlight || '暂无描述'}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${FREE_TYPE_COLORS[tool.free_type] || 'bg-slate-100 text-slate-600'}`}
                            >
                              {tool.free_type}
                            </Badge>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>OneClaw - 精选AI工具导航</p>
          <p className="mt-2">© 2024 OneClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
