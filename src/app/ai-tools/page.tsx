'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/common/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SponsorBadge from '@/components/common/SponsorBadge';
import { cn } from '@/lib/utils';
import {
  Search, ChevronRight, Star, TrendingUp, Unlock, Zap,
  Video, Users, Play, Image as ImageIcon, MessageSquare,
  Mic, FileText, Code2, Music, Briefcase, Globe, GraduationCap,
  Grid3X3
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: Grid3X3, count: 238 },
  { id: '视频生成', name: '视频生成', icon: Video, count: 119 },
  { id: '数字人', name: '数字人', icon: Users, count: 31 },
  { id: '视频编辑', name: '视频编辑', icon: Play, count: 29 },
  { id: 'AI绘画', name: 'AI绘画', icon: ImageIcon, count: 9 },
  { id: 'AI聊天', name: 'AI聊天', icon: MessageSquare, count: 8 },
  { id: 'AI配音', name: 'AI配音', icon: Mic, count: 8 },
  { id: 'AI写作', name: 'AI写作', icon: FileText, count: 7 },
  { id: 'AI编程', name: 'AI编程', icon: Code2, count: 5 },
  { id: 'AI音频', name: 'AI音频', icon: Music, count: 4 },
  { id: 'AI办公', name: 'AI办公', icon: Briefcase, count: 4 },
  { id: 'AI搜索', name: 'AI搜索', icon: Globe, count: 3 },
  { id: 'AI营销', name: 'AI营销', icon: TrendingUp, count: 3 },
  { id: 'AI学习', name: 'AI学习', icon: GraduationCap, count: 3 },
];

const TABS = [
  { key: 'featured', label: '精选推荐', icon: Star },
  { key: 'hot', label: '热门工具', icon: TrendingUp },
  { key: 'free', label: '免费工具', icon: Unlock },
  { key: 'new', label: '新上榜', icon: Zap },
];

const FREE_TYPES: Record<string, { label: string; color: string }> = {
  '完全免费': { label: '免费', color: 'text-emerald-600 dark:text-emerald-400' },
  '免费额度': { label: '免费额度', color: 'text-blue-600 dark:text-blue-400' },
  '限时免费': { label: '限时免费', color: 'text-amber-600 dark:text-amber-400' },
  '付费工具': { label: '付费', color: 'text-slate-500' },
};

interface Tool {
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
}

export default function AIToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 获取用户ID
    const token = document.cookie.split('; ').find(row => row.startsWith('user_token='))?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.user_id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, activeTab, page, searchQuery]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
      });

      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      if (activeTab === 'featured') {
        params.set('featured', 'true');
      } else if (activeTab === 'free') {
        params.set('free_type', '完全免费');
      }

      const response = await fetch(`/api/tools?${params}`);
      const data = await response.json();

      setTools(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = async (tool: Tool) => {
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
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI工具库
            </h1>
            <p className="text-muted-foreground">
              精选 238+ 款优质 AI 工具
            </p>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索 AI 工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* 横向分类筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Tab切换 */}
          <div className="flex gap-2 mb-6">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.key
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
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231E40AF" width="40" height="40" rx="8"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="600">${tool.name[0]}</text></svg>`;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-foreground truncate">{tool.name}</h3>
                            {tool.sponsor_type && (
                              <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                            )}
                            {tool.is_featured && !tool.sponsor_type && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
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
                              FREE_TYPES[tool.free_type]?.color || 'text-slate-500'
                            )}>
                              {FREE_TYPES[tool.free_type]?.label || tool.free_type}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
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
      </main>
    </div>
  );
}
