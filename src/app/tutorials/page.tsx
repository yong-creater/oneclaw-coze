'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Eye, ThumbsUp, Search, ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import Link from 'next/link';

// 类型定义
interface Tutorial {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  cover_image: string;
  author: string;
  views: number;
  likes: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string };
}

// 难度颜色
const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '入门': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '中级': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  '进阶': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '高级': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// 教程分类
const TUTORIAL_CATEGORIES = [
  '全部', '入门教程', '进阶技巧', '案例分享', 'API对接', '最佳实践', '常见问题'
];

export default function TutorialsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 教程
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [category, setCategory] = useState('全部');

  // 保存当前分页状态并跳转
  const handleCardClick = (tutorialId: number) => {
    if (typeof window !== 'undefined') {
      const backState = {
        page: pagination.page,
        category: category,
        search: searchQuery,
        path: window.location.pathname + window.location.search
      };
      sessionStorage.setItem('backFrom', JSON.stringify(backState));
    }
    router.push(`/tutorials/${tutorialId}`);
  };

  useEffect(() => {
    fetchTutorials(1);
  }, [category, searchQuery]);

  const fetchTutorials = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (category !== '全部') {
        params.set('category', category);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const res = await fetch(`/api/tutorials?${params}`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTutorials(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">教程库</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/prompts">
                <Button variant="outline" size="sm" className="gap-1">
                  提示词库
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            专业教程库
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            AI工具使用教程
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            从入门到精通，掌握各类AI工具的使用技巧，助你高效创作
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索教程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 分类筛选 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {TUTORIAL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : tutorials.length > 0 ? (
          <>
            <div className="space-y-4">
              {tutorials.map(tutorial => (
                <div key={tutorial.id} onClick={() => handleCardClick(tutorial.id)}>
                  <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {tutorial.cover_image ? (
                          <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                            <img src={tutorial.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex-shrink-0 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-orange-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100">
                              {tutorial.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {tutorial.category}
                            </Badge>
                            <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                              {tutorial.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                            {tutorial.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {tutorial.author && <span>作者: {tutorial.author}</span>}
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {tutorial.views}
                            </span>
                            <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchTutorials(pagination.page - 1)}
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
                  onClick={() => fetchTutorials(pagination.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无教程</h3>
            <p className="text-sm text-slate-500">教程内容正在编写中，敬请期待</p>
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
