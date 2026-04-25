'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Star, ExternalLink, TrendingUp, Sparkles, Grid3X3,
  Clock, Heart, ChevronRight, Filter, X, Zap, ArrowRight,
  Play, BookOpen, Wand2, Layers, Palette, Code2, MessageSquare,
  Music, Video, Image, FileText, Mic, Briefcase, GraduationCap, Globe,
  Crown, Shield, Award, Users, BarChart3, Lock, Unlock, Check, Loader2
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import BackToHome from '@/components/common/BackToHome';
import SponsorBadge from '@/components/common/SponsorBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ==================== 常量 ====================

const CATEGORIES = [
  { id: 'all', name: '全部', icon: Grid3X3, count: 238 },
  { id: 'video', name: '视频生成', icon: Video, count: 119 },
  { id: 'digital-human', name: '数字人', icon: Users, count: 31 },
  { id: 'video-edit', name: '视频编辑', icon: Play, count: 29 },
  { id: 'image', name: 'AI绘画', icon: Image, count: 9 },
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
  { key: 'tools', label: 'AI工具', icon: Grid3X3 },
  { key: 'prompts', label: '提示词', icon: Sparkles },
  { key: 'tutorials', label: '教程', icon: BookOpen },
];

const TOOLS_TABS = [
  { key: 'featured', label: '精选推荐', icon: Star },
  { key: 'hot', label: '热门工具', icon: TrendingUp },
  { key: 'free', label: '免费工具', icon: Unlock },
  { key: 'new', label: '新上榜', icon: Zap },
];

const TOOL_STATUS = {
  hot: { label: '热门', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  new: { label: '新上', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  free: { label: '免费', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const FREE_TYPES = {
  '完全免费': { label: '免费', color: 'text-emerald-600 dark:text-emerald-400' },
  '免费额度': { label: '免费额度', color: 'text-blue-600 dark:text-blue-400' },
  '限时免费': { label: '限时免费', color: 'text-amber-600 dark:text-amber-400' },
  '付费工具': { label: '付费', color: 'text-slate-500' },
};

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
  onClick?: () => void;
  showCategory?: boolean;
  userId?: string;
}

function ToolCard({ tool, onClick, showCategory = false, userId }: ToolCardProps) {
  const router = useRouter();
  
  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (typeof window !== 'undefined') {
      const backState = { 
        path: window.location.pathname + window.location.search || '/',
        tab: 'tools'
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
              {showCategory && tool.categories && (
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
  category: typeof CATEGORIES[0];
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

// ==================== 主组件 ====================
export default function HomePage() {
  const router = useRouter();
  
  // 状态
  const [userId, setUserId] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mainTab, setMainTab] = useState('tools');
  const [toolsTab, setToolsTab] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
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

  // 获取工具列表
  useEffect(() => {
    fetchTools();
  }, [activeCategory, toolsTab, page, searchQuery]);

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

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setPage(1);
  };

  // 热门工具
  const featuredTools = useMemo(() => {
    return tools.filter(t => t.is_featured).slice(0, 6);
  }, [tools]);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <AnimatedLobster size={28} />
            </div>
            <span className="text-xl font-bold text-foreground">OneClaw</span>
          </Link>

          {/* 主导航 Tab */}
          <div className="hidden md:flex items-center bg-muted rounded-xl p-1">
            {MAIN_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = mainTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setMainTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
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

          {/* 右侧操作 */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/workspace">
                <Heart className="w-4 h-4 mr-1.5" />
                我的收藏
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link href="/admin">
                <Lock className="w-4 h-4 mr-1.5" />
                管理
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {mainTab === 'tools' && (
          <>
            {/* Hero 区域 */}
            <section className="text-center py-12 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                发现全球顶级
                <span className="text-primary"> AI 工具</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                精选 238+ 款优质 AI 工具，覆盖视频生成、数字人、AI绘画、AI写作等全品类
              </p>
              
              {/* 搜索框 */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className={cn(
                  "relative flex items-center bg-card rounded-2xl border-2 shadow-md transition-all",
                  isSearchFocused ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/50"
                )}>
                  <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="搜索 AI 工具..."
                    className="flex-1 h-14 pl-14 pr-32 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <Button type="submit" className="absolute right-2 h-10 px-6 rounded-xl">
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>
              </form>
              
              {/* 热门搜索 */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">热门搜索:</span>
                {hotSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      setPage(1);
                      fetchTools();
                    }}
                    className="px-3 py-1 text-sm bg-muted hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* 工具 Tab 切换 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
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
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
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
              
              {/* 工具数量 */}
              <span className="text-sm text-muted-foreground">
                共 {tools.length} 款工具
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左侧分类导航 */}
              <aside className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-3 sticky top-24">
                  <h3 className="text-sm font-semibold text-foreground px-3 py-2 mb-2">分类</h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        isActive={activeCategory === cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              {/* 右侧工具列表 */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-muted" />
                          <div className="flex-1">
                            <div className="h-5 w-24 bg-muted rounded mb-2" />
                            <div className="h-4 w-32 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tools.length === 0 ? (
                  <div className="text-center py-16">
                    <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-lg text-muted-foreground">未找到相关工具</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                        setPage(1);
                      }}
                      className="mt-4"
                    >
                      清除筛选
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          showCategory={activeCategory === 'all'}
                          userId={userId || undefined}
                        />
                      ))}
                    </div>
                    
                    {/* 分页 */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="w-10 h-10 p-0"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </Button>
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                          第 {page} / {totalPages} 页
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="w-10 h-10 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {mainTab === 'prompts' && (
          <section className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">AI 提示词库</h2>
              <p className="text-muted-foreground">精选优质提示词模板，助力 AI 创作</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Video, title: '视频创作', desc: 'Sora、Runway 等视频生成提示词', count: 120 },
                { icon: Image, title: '图像生成', desc: 'Midjourney、DALL-E 提示词', count: 85 },
                { icon: MessageSquare, title: '对话优化', desc: 'ChatGPT、Claude 提示词', count: 200 },
              ].map((item, i) => (
                <Card key={i} className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                    <span className="text-sm text-primary font-medium">{item.count} 条提示词</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/prompts">
                  查看全部提示词
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {mainTab === 'tutorials' && (
          <section className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">AI 教程中心</h2>
              <p className="text-muted-foreground">从入门到精通，掌握 AI 工具使用技巧</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Video, title: '视频教程', count: 45 },
                { icon: FileText, title: '图文教程', count: 120 },
                { icon: Code2, title: '实战案例', count: 30 },
                { icon: Users, title: '社区讨论', count: 200 },
              ].map((item, i) => (
                <Card key={i} className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">{item.count} 篇内容</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href="/tutorials">
                  浏览全部教程
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* 底部 */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-semibold text-foreground">OneClaw</span>
            </div>
            <p className="text-sm text-muted-foreground">
              精选全球优质 AI 工具，助您提升工作效率
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">关于我们</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">联系我们</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">隐私政策</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
