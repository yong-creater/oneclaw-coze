'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SponsorBadge from '@/components/common/SponsorBadge';
import { cn } from '@/lib/utils';
import {
  Search, Star, ExternalLink,
  Video, Users, Play, Image as ImageIcon, MessageSquare,
  Mic, FileText, Code2, Music, Briefcase, Globe, GraduationCap,
  Grid3X3, TrendingUp, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: Grid3X3 },
  { id: '视频生成', name: '视频生成', icon: Video },
  { id: '数字人', name: '数字人', icon: Users },
  { id: 'AI绘画', name: 'AI绘画', icon: ImageIcon },
  { id: 'AI聊天', name: 'AI聊天', icon: MessageSquare },
  { id: 'AI配音', name: 'AI配音', icon: Mic },
  { id: 'AI写作', name: 'AI写作', icon: FileText },
  { id: 'AI编程', name: 'AI编程', icon: Code2 },
  { id: 'AI音频', name: 'AI音频', icon: Music },
  { id: 'AI办公', name: 'AI办公', icon: Briefcase },
];

const FREE_TYPES: Record<string, { label: string; color: string }> = {
  '完全免费': { label: '免费', color: 'text-emerald-600' },
  '免费额度': { label: '免费', color: 'text-blue-600' },
  '限时免费': { label: '限免', color: 'text-amber-600' },
  '付费工具': { label: '付费', color: 'text-slate-400' },
};

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  free_type: string;
  is_featured: boolean;
  sponsor_type: string | null;
  sponsor_expires_at: string | null;
  categories?: { name: string };
}

export default function AIToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, page, searchQuery]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
      });

      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
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

  const handleToolClick = (tool: Tool) => {
    window.open(`/tools/${tool.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI工具库
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                精选238+款优质AI工具
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>持续更新</span>
            </div>
          </div>

          {/* 搜索和分类 */}
          <div className="mb-6 space-y-4">
            {/* 搜索框 */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索AI工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 工具网格 - 紧凑卡片风格 */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-muted rounded w-20 mb-2" />
                        <div className="h-3 bg-muted rounded w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tools.map(tool => (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group bg-white dark:bg-slate-800/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-primary/10 transition-colors">
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </span>
                            {tool.is_featured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            {tool.sponsor_type && (
                              <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate leading-relaxed">
                            {tool.highlight}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "text-[10px] font-medium",
                              FREE_TYPES[tool.free_type]?.color || 'text-slate-400'
                            )}>
                              {FREE_TYPES[tool.free_type]?.label || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-muted-foreground px-4">
                    第 {page} / {totalPages} 页
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">未找到相关工具</p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
