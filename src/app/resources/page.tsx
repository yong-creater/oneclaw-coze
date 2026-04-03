'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Lightbulb, Copy, Check, Eye, ThumbsUp, Search,
  ChevronLeft, ChevronRight, FileText, Sparkles
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

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  uses: number;
  likes: number;
  created_at: string;
  tools?: { id: number; name: string; logo: string };
}

// 难度颜色
const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};

// Prompt分类
const PROMPT_CATEGORIES = [
  '全部', '角色扮演', '场景描述', '风格迁移', '人物生成', '特效制作'
];

// 教程分类
const TUTORIAL_CATEGORIES = [
  '全部', '入门教程', '进阶技巧', '案例分享', 'API对接'
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [loading, setLoading] = useState(true);
  
  // Prompt
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsPagination, setPromptsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [promptCategory, setPromptCategory] = useState('全部');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // 教程
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsPagination, setTutorialsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [tutorialCategory, setTutorialCategory] = useState('全部');

  useEffect(() => {
    if (activeTab === 'prompts') {
      fetchPrompts(1);
    } else {
      fetchTutorials(1);
    }
  }, [activeTab, promptCategory, tutorialCategory]);

  const fetchPrompts = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (promptCategory !== '全部') {
        params.set('category', promptCategory);
      }

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
        setPromptsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取Prompt失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorials = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (tutorialCategory !== '全部') {
        params.set('category', tutorialCategory);
      }

      const res = await fetch(`/api/tutorials?${params}`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
        setTutorialsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 复制Prompt
  const copyPrompt = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    
    // 增加使用次数
    await fetch('/api/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prompt.id })
    });

    setTimeout(() => setCopiedId(null), 2000);
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
                <p className="text-xs text-slate-500 dark:text-slate-400">资源中心</p>
              </div>
            </Link>

            <Link href="/">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="prompts" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Prompt库
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="gap-2">
              <BookOpen className="w-4 h-4" />
              教程库
            </TabsTrigger>
          </TabsList>

          {/* Prompt库 */}
          <TabsContent value="prompts">
            {/* 分类筛选 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {PROMPT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setPromptCategory(cat);
                    setPromptsPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    promptCategory === cat
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
            ) : prompts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map(prompt => (
                    <Card key={prompt.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                            {prompt.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                          {prompt.content}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {prompt.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {prompt.uses}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {prompt.likes}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyPrompt(prompt)}
                          >
                            {copiedId === prompt.id ? (
                              <><Check className="w-3 h-3 mr-1" />已复制</>
                            ) : (
                              <><Copy className="w-3 h-3 mr-1" />复制</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {promptsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={promptsPagination.page === 1}
                      onClick={() => fetchPrompts(promptsPagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {promptsPagination.page} / {promptsPagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={promptsPagination.page === promptsPagination.total_pages}
                      onClick={() => fetchPrompts(promptsPagination.page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无Prompt</h3>
                <p className="text-sm text-slate-500">Prompt模板正在整理中，敬请期待</p>
              </div>
            )}
          </TabsContent>

          {/* 教程库 */}
          <TabsContent value="tutorials">
            {/* 分类筛选 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {TUTORIAL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setTutorialCategory(cat);
                    setTutorialsPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    tutorialCategory === cat
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
                    <Card key={tutorial.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {tutorial.cover_image && (
                            <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                              <img src={tutorial.cover_image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                                {tutorial.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {tutorial.category}
                              </Badge>
                              <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tutorial.difficulty]}`}>
                                {tutorial.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                              {tutorial.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {tutorial.author && <span>作者: {tutorial.author}</span>}
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {tutorial.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {tutorial.likes}
                              </span>
                              <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {tutorialsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tutorialsPagination.page === 1}
                      onClick={() => fetchTutorials(tutorialsPagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {tutorialsPagination.page} / {tutorialsPagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tutorialsPagination.page === tutorialsPagination.total_pages}
                      onClick={() => fetchTutorials(tutorialsPagination.page + 1)}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
