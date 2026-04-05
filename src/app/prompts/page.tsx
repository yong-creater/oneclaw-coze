'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, ChevronRight, ArrowLeft, Copy, FileText, ChevronLeft
} from 'lucide-react';
import { AnimatedLobster } from '@/components/AnimatedLobster';

interface Prompt {
  id: number;
  title: string;
  content: string;
  tool_id: number | null;
  category: string;
  tags: string[];
  author: string | null;
  status: string;
  uses: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  '视频生成': '🎬',
  '数字人': '👤',
  '视频编辑': '✂️',
  'AI绘画': '🎨',
  'AI聊天': '💬',
  'AI配音': '🎙️',
  'AI写作': '✍️',
  'AI编程': '💻',
  'AI音频': '🎵',
  'AI办公': '📊',
  'AI搜索': '🔍',
  'AI营销': '📢',
  'AI学习': '📚',
  '其他': '📝',
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 12, total: 0, total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());
      if (selectedCategory) params.set('category', selectedCategory);
      
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setPrompts(data.data);
        setPagination(prev => ({ ...prev, page, total: data.pagination.total, total_pages: data.pagination.total_pages }));
        
        // 提取所有分类
        const cats = new Set<string>();
        data.data.forEach((p: Prompt) => cats.add(p.category));
        setCategories(Array.from(cats));
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [selectedCategory]);

  // 搜索过滤
  const filteredPrompts = searchQuery
    ? prompts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : prompts;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">返回首页</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
              <Link href="/" className="flex items-center gap-2">
                <AnimatedLobster size={24} />
                <span className="font-bold text-lg text-slate-900 dark:text-white">OneClaw</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="h-4 w-4" />
            专业提示词库
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            AI创作提示词库
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            精选 {pagination.total} 个专业提示词模板，涵盖视频生成、数字人、AI绘画等场景，
            助你高效创作优质AI内容
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="搜索提示词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-base shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {CATEGORY_ICONS[category] || '📝'} {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            找到 <span className="font-semibold text-slate-900 dark:text-white">{filteredPrompts.length}</span> 个提示词
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : filteredPrompts.length > 0 ? (
          <>
            {/* Prompt Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {CATEGORY_ICONS[prompt.category] || '📝'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate mb-1.5">
                            {prompt.title}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600">
                              {prompt.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                            {prompt.content.slice(0, 80)}...
                          </p>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {prompt.tags?.slice(0, 2).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags?.length > 2 && (
                                <span className="text-xs text-slate-500">+{prompt.tags.length - 2}</span>
                              )}
                            </div>
                            
                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-0.5 flex-shrink-0 font-medium">
                              查看
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchData(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-500">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => fetchData(pagination.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-500 dark:text-slate-400">
              没有找到匹配的提示词，试试其他关键词？
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AnimatedLobster size={20} />
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
