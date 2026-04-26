'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SponsorBadge from '@/components/common/SponsorBadge';
import { cn } from '@/lib/utils';
import {
  Search, Star, ExternalLink,
  Video, Users, Image as ImageIcon, MessageSquare,
  Mic, FileText, Code2, Music, Briefcase, Grid3X3,
  Sparkles, ChevronLeft, ChevronRight, Loader2
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
        limit: '30',
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* 页面标题 */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">
                AI工具库
              </h1>
              <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  238+ 工具
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              发现最优质的AI工具，覆盖视频、图像、写作、编程等全场景
            </p>
          </div>

          {/* 搜索框 - 优化设计 */}
          <div className="mb-6 animate-fade-in-up stagger-1">
            <div className="relative max-w-md group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="搜索工具名称..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-11 h-12 rounded-xl bg-card border-border/60 shadow-sm focus:shadow-md transition-all"
                />
              </div>
            </div>
          </div>

          {/* 分类标签 - 横向滚动 */}
          <div className="mb-8 animate-fade-in-up stagger-2">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
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
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                        : "bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-sm"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 工具网格 */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-muted rounded w-16" />
                        <div className="h-3 bg-muted rounded w-full" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tools.map((tool, index) => (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={cn(
                      "cursor-pointer group overflow-hidden transition-all duration-200",
                      "bg-card border-border/40 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1",
                      `animate-fade-in-up stagger-${Math.min(index % 6 + 1, 6)}`
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-primary/10 transition-colors">
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="w-7 h-7 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </span>
                            {tool.is_featured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {tool.highlight || tool.categories?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/50",
                              FREE_TYPES[tool.free_type]?.color || 'text-slate-400'
                            )}>
                              {FREE_TYPES[tool.free_type]?.label || ''}
                            </span>
                            {tool.sponsor_type && (
                              <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-border/40 bg-card hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      const isCurrentPage = pageNum === page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                            isCurrentPage
                              ? "bg-primary text-white shadow-md"
                              : "bg-card border border-border/40 hover:bg-muted/50"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-border/40 bg-card hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">未找到相关工具</p>
              <p className="text-sm text-muted-foreground/60 mt-1">试试其他关键词或分类</p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
