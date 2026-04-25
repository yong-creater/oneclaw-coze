'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SponsorBadge from '@/components/common/SponsorBadge';
import { cn } from '@/lib/utils';
import {
  Search, Star, ExternalLink,
  Video, Users, Play, Image as ImageIcon, MessageSquare,
  Mic, FileText, Code2, Music, Briefcase, Globe, GraduationCap,
  ChevronRight, Filter, TrendingUp, Grid3X3, List
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: Grid3X3 },
  { id: '视频生成', name: '视频生成', icon: Video },
  { id: '数字人', name: '数字人', icon: Users },
  { id: '视频编辑', name: '视频编辑', icon: Play },
  { id: 'AI绘画', name: 'AI绘画', icon: ImageIcon },
  { id: 'AI聊天', name: 'AI聊天', icon: MessageSquare },
  { id: 'AI配音', name: 'AI配音', icon: Mic },
  { id: 'AI写作', name: 'AI写作', icon: FileText },
  { id: 'AI编程', name: 'AI编程', icon: Code2 },
  { id: 'AI音频', name: 'AI音频', icon: Music },
  { id: 'AI办公', name: 'AI办公', icon: Briefcase },
  { id: 'AI搜索', name: 'AI搜索', icon: Globe },
];

const FREE_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  '完全免费': { label: '免费', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  '免费额度': { label: '额度', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  '限时免费': { label: '限免', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  '付费工具': { label: '付费', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
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
        limit: '20',
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
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              AI工具库
            </h1>
            <p className="text-sm text-muted-foreground">
              精选第三方AI工具，快速找到你需要的产品
            </p>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索工具名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-5 scrollbar-hide">
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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* 工具列表 - 紧凑列表风格 */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
              <div className="space-y-2">
                {tools.map(tool => (
                  <Card
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group py-0"
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {tool.name}
                          </span>
                          {tool.is_featured && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          {tool.sponsor_type && (
                            <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {tool.highlight}
                        </p>
                      </div>

                      {/* 标签 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {tool.categories && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {tool.categories.name}
                          </Badge>
                        )}
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded",
                          FREE_TYPES[tool.free_type]?.bg,
                          FREE_TYPES[tool.free_type]?.color
                        )}>
                          {FREE_TYPES[tool.free_type]?.label || tool.free_type}
                        </span>
                      </div>

                      {/* 箭头 */}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs"
                  >
                    上一页
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs"
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">未找到相关工具</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
