'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Star, ExternalLink, TrendingUp, Sparkles,
  Clock, Heart, ChevronRight, Filter, X, Zap, ArrowRight,
  Play, BookOpen, Wand2, Layers, Palette, Code2, MessageSquare,
  Music, Video, Image as ImageIcon, FileText, Mic, Briefcase, GraduationCap, Globe,
  Unlock, Check, Loader2, Lock, Grid3X3, Crown, Shield, Award, Users, BarChart3
} from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import SponsorBadge from '@/components/common/SponsorBadge';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ==================== 常量 ====================

const AI_TOOL_CATEGORIES = [
  { id: 'all', name: '全部', icon: Grid3X3, count: 238 },
  { id: 'video', name: '视频生成', icon: Video, count: 119 },
  { id: 'digital-human', name: '数字人', icon: Users, count: 31 },
  { id: 'video-edit', name: '视频编辑', icon: Play, count: 29 },
  { id: 'image', name: 'AI绘画', icon: ImageIcon, count: 9 },
  { id: 'chat', name: 'AI聊天', icon: MessageSquare, count: 8 },
  { id: 'voice', name: 'AI配音', icon: Mic, count: 8 },
  { id: 'writing', name: 'AI写作', icon: FileText, count: 7 },
  { id: 'coding', name: 'AI编程', icon: Code2, count: 5 },
  { id: 'audio', name: 'AI音频', icon: Music, count: 4 },
  { id: 'office', name: 'AI办公', icon: Briefcase, count: 4 },
  { id: 'search', name: 'AI搜索', icon: Globe, count: 3 },
  { id: 'marketing', name: 'AI营销', icon: TrendingUp, count: 3 },
  { id: 'learning', name: 'AI学习', icon: GraduationCap, count: 3 },
];

const MAIN_TABS = [
  { key: 'ai-tools', label: 'AI工具库', icon: Wand2 },
  { key: 'own-tools', label: '自建工具', icon: Star },
  { key: 'prompts', label: '提示词', icon: Sparkles },
  { key: 'tutorials', label: '教程', icon: BookOpen },
];

const TOOLS_TABS = [
  { key: 'featured', label: '精选推荐', icon: Star },
  { key: 'hot', label: '热门工具', icon: TrendingUp },
  { key: 'free', label: '免费工具', icon: Unlock },
  { key: 'new', label: '新上榜', icon: Zap },
];

const FREE_TYPES = {
  '完全免费': { label: '免费', color: 'text-emerald-600 dark:text-emerald-400' },
  '免费额度': { label: '免费额度', color: 'text-blue-600 dark:text-blue-400' },
  '限时免费': { label: '限时免费', color: 'text-amber-600 dark:text-amber-400' },
  '付费工具': { label: '付费', color: 'text-slate-500' },
};

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

// ==================== 工具卡片组件 ====================
interface ToolCardProps {
  tool: {
    id: number;
    name: string;
    logo: string;
    highlight: string;
    category_id: number;
    free_type: string;
    is_featured: boolean;
    sponsor_type: string | null;
    sponsor_expires_at: string | null;
    categories?: { name: string; slug: string };
  };
  userId?: string;
}

function ToolCard({ tool, userId }: ToolCardProps) {
  const handleClick = async () => {
    if (typeof window !== 'undefined') {
      const backState = {
        path: window.location.pathname + window.location.search || '/',
        tab: 'ai-tools'
      };
      sessionStorage.setItem('backFrom', JSON.stringify(backState));
    }

    if (userId) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tool_id: tool.id })
      }).catch(() => {});
    }

    window.open(`/tools/${tool.id}`, '_blank');
  };

  return (
    <Card
      onClick={handleClick}
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231E40AF" width="40" height="40" rx="8"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="600">${tool.name[0]}</text></svg>`;
              }}
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {tool.name}
              </h3>
              {tool.sponsor_type && (
                <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
              )}
              {tool.is_featured && !tool.sponsor_type && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{tool.highlight}</p>
            <div className="flex items-center gap-2 mt-3">
              {tool.categories && (
                <Badge variant="secondary" className="text-[10px]">
                  {tool.categories.name}
                </Badge>
              )}
              <span className={cn(
                "text-xs font-medium",
                FREE_TYPES[tool.free_type as keyof typeof FREE_TYPES]?.color || 'text-slate-500'
              )}>
                {FREE_TYPES[tool.free_type as keyof typeof FREE_TYPES]?.label || tool.free_type}
              </span>
            </div>
          </div>

          {/* 箭头 */}
          <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 分类卡片组件 ====================
interface CategoryCardProps {
  category: typeof AI_TOOL_CATEGORIES[0];
  isActive: boolean;
  onClick: () => void;
}

function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card hover:bg-accent/50 text-foreground"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        isActive
          ? "bg-primary-foreground/20"
          : "bg-primary/10 group-hover:bg-primary/20"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isActive ? "text-primary-foreground" : "text-primary"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm truncate",
          isActive ? "text-primary-foreground" : ""
        )}>
          {category.name}
        </p>
        <p className={cn(
          "text-xs",
          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {category.count} 款
        </p>
      </div>
    </button>
  );
}

// ==================== 自建工具卡片 ====================
interface OwnToolCardProps {
  tool: typeof OWN_TOOLS[0];
}

function OwnToolCard({ tool }: OwnToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href}>
      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
              tool.color
            )}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                {tool.badge && (
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
                    {tool.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ==================== 主组件 ====================
export default function HomePage() {
  // 状态
  const [userId, setUserId] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mainTab, setMainTab] = useState('ai-tools');
  const [toolsTab, setToolsTab] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 提示词相关状态
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [promptCategory, setPromptCategory] = useState('all');
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  // 教程相关状态
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [tutorialSearch, setTutorialSearch] = useState('');
  const [tutorialCategory, setTutorialCategory] = useState('all');
  const [expandedTutorial, setExpandedTutorial] = useState<number | null>(null);

  const pageSize = 12;

  // 获取用户ID
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('user_token='))?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.user_id);
      } catch {}
    }
  }, []);

  // 获取AI工具列表
  useEffect(() => {
    if (mainTab === 'ai-tools') {
      fetchTools();
    }
  }, [activeCategory, toolsTab, page, searchQuery, mainTab]);

  // 获取提示词列表
  useEffect(() => {
    if (mainTab === 'prompts') {
      fetchPrompts();
    }
  }, [mainTab, promptCategory, promptSearch]);

  // 获取教程列表
  useEffect(() => {
    if (mainTab === 'tutorials') {
      fetchTutorials();
    }
  }, [mainTab, tutorialCategory, tutorialSearch]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });

      if (activeCategory !== 'all') {
        const catMap: Record<string, string> = {
          video: '视频生成',
          'digital-human': '数字人',
          'video-edit': '视频编辑',
          image: 'AI绘画',
          chat: 'AI聊天',
          voice: 'AI配音',
          writing: 'AI写作',
          coding: 'AI编程',
          audio: 'AI音频',
          office: 'AI办公',
          search: 'AI搜索',
          marketing: 'AI营销',
          learning: 'AI学习',
        };
        params.set('category', catMap[activeCategory] || activeCategory);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      if (toolsTab === 'featured') {
        params.set('featured', 'true');
      } else if (toolsTab === 'free') {
        params.set('free_type', '完全免费');
      }

      const response = await fetch(`/api/tools?${params}`);
      const data = await response.json();

      setTools(data.tools || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    setPromptsLoading(true);
    try {
      const params = new URLSearchParams();
      if (promptSearch) params.set('search', promptSearch);
      if (promptCategory !== 'all') params.set('category', promptCategory);

      const response = await fetch(`/api/prompts?${params}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('获取提示词失败:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  const fetchTutorials = async () => {
    setTutorialsLoading(true);
    try {
      const params = new URLSearchParams();
      if (tutorialSearch) params.set('search', tutorialSearch);
      if (tutorialCategory !== 'all') params.set('category', tutorialCategory);

      const response = await fetch(`/api/tutorials?${params}`);
      const data = await response.json();
      setTutorials(data.tutorials || []);
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setTutorialsLoading(false);
    }
  };

  // 热门搜索
  const hotSearches = useMemo(() => [
    'Sora', 'Midjourney', 'ChatGPT', 'Claude', 'Kimi', 'Stable Diffusion', 'Runway', 'HeyGen'
  ], []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage(1);
      fetchTools();
    }
  };

  // 复制提示词
  const copyPrompt = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setExpandedPrompt(id);
      setTimeout(() => setExpandedPrompt(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 热门工具
  const featuredTools = useMemo(() => {
    return tools.filter(t => t.is_featured).slice(0, 6);
  }, [tools]);

  return (
    <div className="min-h-screen bg-background">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 顶部标签切换 */}
          <div className="flex items-center bg-muted/50 rounded-xl p-1 mb-8 max-w-2xl mx-auto">
            {MAIN_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = mainTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setMainTab(tab.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI工具库 */}
          {mainTab === 'ai-tools' && (
            <>
              {/* Hero 区域 */}
              <section className="text-center py-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  发现全球顶级
                  <span className="text-primary"> AI 工具</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
                  精选 238+ 款优质 AI 工具，覆盖视频生成、数字人、AI绘画、AI写作等全品类
                </p>

                {/* 搜索框 */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className={cn(
                    "relative flex items-center bg-card rounded-2xl border-2 shadow-sm transition-all",
                    isSearchFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}>
                    <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="搜索 AI 工具..."
                      className="border-0 bg-transparent pl-12 pr-4 py-4 text-base focus-visible:ring-0"
                    />
                    <Button type="submit" size="sm" className="mr-2 rounded-xl">
                      搜索
                    </Button>
                  </div>
                </form>

                {/* 热门搜索 */}
                {!isSearchFocused && (
                  <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
                    <span className="text-xs text-muted-foreground">热门:</span>
                    {hotSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setPage(1);
                          fetchTools();
                        }}
                        className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* 工具Tab和分类 */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* 左侧分类 */}
                <aside className="lg:w-64 shrink-0">
                  <div className="sticky top-24 space-y-2">
                    {AI_TOOL_CATEGORIES.map(category => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isActive={activeCategory === category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setPage(1);
                        }}
                      />
                    ))}
                  </div>
                </aside>

                {/* 右侧工具列表 */}
                <div className="flex-1">
                  {/* 工具Tab */}
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {TOOLS_TABS.map(tab => {
                      const Icon = tab.icon;
                      const isActive = toolsTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setToolsTab(tab.key);
                            setPage(1);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 工具列表 */}
                  {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-muted" />
                              <div className="flex-1 space-y-2">
                                <div className="h-5 bg-muted rounded w-1/3" />
                                <div className="h-4 bg-muted rounded w-2/3" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : tools.length > 0 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {tools.map(tool => (
                          <ToolCard key={tool.id} tool={tool} userId={userId || undefined} />
                        ))}
                      </div>

                      {/* 分页 */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            上一页
                          </Button>
                          <span className="text-sm text-muted-foreground px-4">
                            第 {page} / {totalPages} 页
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            下一页
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">未找到相关工具</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 自建工具 */}
          {mainTab === 'own-tools' && (
            <>
              <section className="text-center py-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  自建
                  <span className="text-primary"> AI 工具</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  精心打造的 AI 工具，助您提升工作效率
                </p>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                {OWN_TOOLS.map(tool => (
                  <OwnToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </>
          )}

          {/* 提示词 */}
          {mainTab === 'prompts' && (
            <>
              <section className="text-center py-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  精选
                  <span className="text-primary"> 提示词</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
                  高质量的 AI 提示词模板，帮助您更好地使用 AI 工具
                </p>

                {/* 搜索和筛选 */}
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={promptSearch}
                      onChange={(e) => setPromptSearch(e.target.value)}
                      placeholder="搜索提示词..."
                      className="pl-11"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {PROMPT_CATEGORIES.map(cat => (
                      <Button
                        key={cat.key}
                        variant={promptCategory === cat.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPromptCategory(cat.key)}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </section>

              {/* 提示词列表 */}
              {promptsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-5">
                        <div className="h-6 bg-muted rounded w-2/3 mb-3" />
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : prompts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {prompts.map(prompt => (
                    <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-foreground">{prompt.title}</h3>
                          {prompt.is_featured && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              精选
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {prompt.description}
                        </p>
                        {expandedPrompt === prompt.id ? (
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <p className="text-xs text-muted-foreground mb-2">已复制到剪贴板!</p>
                            <p className="text-sm font-mono line-clamp-3">{prompt.content}</p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => copyPrompt(prompt.content, prompt.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            复制提示词
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">暂无提示词</p>
                </div>
              )}
            </>
          )}

          {/* 教程 */}
          {mainTab === 'tutorials' && (
            <>
              <section className="text-center py-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  实用
                  <span className="text-primary"> AI教程</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
                  详细的 AI 工具使用教程，帮助您快速上手
                </p>

                {/* 搜索和筛选 */}
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={tutorialSearch}
                      onChange={(e) => setTutorialSearch(e.target.value)}
                      placeholder="搜索教程..."
                      className="pl-11"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {TUTORIAL_CATEGORIES.map(cat => (
                      <Button
                        key={cat.key}
                        variant={tutorialCategory === cat.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTutorialCategory(cat.key)}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </section>

              {/* 教程列表 */}
              {tutorialsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-5">
                        <div className="h-6 bg-muted rounded w-2/3 mb-3" />
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tutorials.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {tutorials.map(tutorial => (
                    <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                          {tutorial.is_featured && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              精选
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{tutorial.type}</Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/tutorials/${tutorial.slug}`} target="_blank">
                              查看详情
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">暂无教程</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部版权 */}
        <footer className="border-t border-border py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              OneClaw - 全品类AI工具导航站 · 精选238+款优质AI工具
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              联系邮箱: 1017760688@qq.com
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
