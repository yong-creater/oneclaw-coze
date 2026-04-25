'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, BookOpen, FileText, Image as ImageIcon, Briefcase,
  Wand2, ChevronRight, Heart, Copy, Check, ExternalLink, Search
} from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// 自建工具列表
const OWN_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    icon: FileText,
    desc: 'AI 智能优化简历，提升求职竞争力',
    href: '/resume',
    badge: '热门',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    id: 'novel',
    name: '小说创作',
    icon: BookOpen,
    desc: 'AI 辅助小说创作，激发无限灵感',
    href: '/novel',
    badge: '新功能',
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    icon: ImageIcon,
    desc: '一键生成跨境电商产品详情页',
    href: '/productpage',
    badge: null,
    color: 'bg-emerald-500/10 text-emerald-600'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    icon: ImageIcon,
    desc: '上传照片 · 智能抠图 · 一键生成合规证件照',
    href: '/photo-id',
    badge: '新功能',
    color: 'bg-orange-500/10 text-orange-600'
  },
];

// 提示词分类
const PROMPT_CATEGORIES = [
  { name: '全部', key: 'all', count: 0 },
  { name: '视频创作', key: 'video', count: 0 },
  { name: '图像生成', key: 'image', count: 0 },
  { name: '对话优化', key: 'chat', count: 0 },
];

// 教程分类
const TUTORIAL_CATEGORIES = [
  { name: '全部', key: 'all' },
  { name: '视频教程', key: 'video' },
  { name: '图文教程', key: 'article' },
  { name: '实战案例', key: 'case' },
];

interface Prompt {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  is_featured: boolean;
}

interface Tutorial {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  type: string;
  is_featured: boolean;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'tools' | 'prompts' | 'tutorials'>('tools');
  
  // 提示词相关状态
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [promptCategory, setPromptCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // 教程相关状态
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [tutorialSearch, setTutorialSearch] = useState('');
  const [tutorialCategory, setTutorialCategory] = useState('all');
  const [expandedTutorial, setExpandedTutorial] = useState<number | null>(null);

  // 加载提示词
  useEffect(() => {
    if (activeSection === 'prompts' && prompts.length === 0) {
      fetchPrompts();
    }
  }, [activeSection]);

  // 加载教程
  useEffect(() => {
    if (activeSection === 'tutorials' && tutorials.length === 0) {
      fetchTutorials();
    }
  }, [activeSection]);

  const fetchPrompts = async () => {
    setPromptsLoading(true);
    try {
      const res = await fetch('/api/prompts?limit=50');
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  const fetchTutorials = async () => {
    setTutorialsLoading(true);
    try {
      const res = await fetch('/api/tutorials?limit=50');
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tutorials:', error);
    } finally {
      setTutorialsLoading(false);
    }
  };

  // 复制提示词
  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 过滤提示词
  const filteredPrompts = prompts.filter(p => {
    const matchSearch = !promptSearch || 
      p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(promptSearch.toLowerCase());
    const matchCategory = promptCategory === 'all' || p.category === promptCategory;
    return matchSearch && matchCategory;
  });

  // 过滤教程
  const filteredTutorials = tutorials.filter(t => {
    const matchSearch = !tutorialSearch || 
      t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(tutorialSearch.toLowerCase());
    const matchCategory = tutorialCategory === 'all' || t.type === tutorialCategory || t.category === tutorialCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 侧边栏导航 */}
      <Sidebar />

      <main className="lg:pl-[var(--sidebar-width)] transition-all duration-300">
        {/* 顶部工具栏 - 仅移动端显示 */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border lg:hidden">
          <div className="h-14 flex items-center justify-between px-4">
            <span className="text-lg font-bold text-foreground">OneClaw</span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workspace">
                <Heart className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero 区域 */}
          <section className="text-center py-8 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              发现优质
              <span className="text-primary"> AI 工具</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              自建 AI 工具 + 精选提示词 + 实用教程，一站式 AI 创作平台
            </p>
          </section>

          {/* Tab 切换 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center bg-muted rounded-xl p-1">
              {[
                { key: 'tools', label: 'AI工具', icon: Wand2 },
                { key: 'prompts', label: '提示词', icon: Sparkles },
                { key: 'tutorials', label: '教程', icon: BookOpen },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key as typeof activeSection)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI 工具 */}
          {activeSection === 'tools' && (
            <section>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">自建 AI 工具</h2>
                <p className="text-sm text-muted-foreground">精心打造的实用工具，助力您的创作</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OWN_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={tool.href}>
                      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              tool.color
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                                {tool.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {tool.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{tool.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 提示词库 - 当前页面展示 */}
          {activeSection === 'prompts' && (
            <section>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">AI 提示词库</h2>
                <p className="text-sm text-muted-foreground">精选优质提示词模板，助力 AI 创作</p>
              </div>

              {/* 搜索和筛选 */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索提示词..."
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setPromptCategory(cat.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        promptCategory === cat.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提示词列表 */}
              {promptsLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : filteredPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">暂无提示词</p>
                  <p className="text-sm text-muted-foreground">在后台添加提示词内容</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrompts.map(prompt => (
                    <Card key={prompt.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{prompt.title}</h3>
                              {prompt.is_featured && (
                                <Badge variant="default" className="text-xs">精选</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{prompt.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPrompt(prompt)}
                              className="h-8 px-2"
                            >
                              {copiedId === prompt.id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                              <a href={`/prompts/${prompt.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                        {/* 提示词内容预览 */}
                        <div className="mt-3 p-3 bg-slate-900 dark:bg-slate-950 rounded-lg">
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono line-clamp-3">
                            {prompt.content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 教程库 - 当前页面展示 */}
          {activeSection === 'tutorials' && (
            <section>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">AI 教程中心</h2>
                <p className="text-sm text-muted-foreground">从入门到精通，掌握 AI 工具使用技巧</p>
              </div>

              {/* 搜索和筛选 */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索教程..."
                    value={tutorialSearch}
                    onChange={(e) => setTutorialSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {TUTORIAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setTutorialCategory(cat.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        tutorialCategory === cat.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 教程列表 */}
              {tutorialsLoading ? (
                <div className="text-center py-12 text-muted-foreground">加载中...</div>
              ) : filteredTutorials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">暂无教程</p>
                  <p className="text-sm text-muted-foreground">在后台添加教程内容</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTutorials.map(tutorial => (
                    <Card key={tutorial.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                              {tutorial.is_featured && (
                                <Badge variant="default" className="text-xs">精选</Badge>
                              )}
                              {tutorial.type && (
                                <Badge variant="secondary" className="text-xs">{tutorial.type}</Badge>
                              )}
                              {tutorial.category && (
                                <Badge variant="outline" className="text-xs">{tutorial.category}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id)}
                              className="h-8 px-2"
                            >
                              <ChevronRight className={cn(
                                "w-4 h-4 transition-transform",
                                expandedTutorial === tutorial.id && "rotate-90"
                              )} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                              <a href={`/tutorials/${tutorial.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                        {/* 展开的教程内容 */}
                        {expandedTutorial === tutorial.id && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-foreground whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                              {tutorial.content}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 底部 */}
        <footer className="border-t border-border mt-12">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <span className="font-semibold text-foreground text-sm">OneClaw</span>
              <p className="text-xs text-muted-foreground">
                自建 AI 工具 + 精选提示词 + 实用教程
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Link href="/about" className="hover:text-foreground transition-colors">关于我们</Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">联系我们</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
