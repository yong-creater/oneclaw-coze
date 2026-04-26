'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star, TrendingUp, Sparkles, Flame, Crown } from 'lucide-react';

interface Tool {
  id: number;
  name: string;
  logo: string;
  highlight: string;
  category: string;
  view_count?: number;
  click_count?: number;
  rating_avg?: number;
}

const RANKING_TYPES = [
  { id: 'hot', label: '热门榜', icon: Flame, desc: '访问量最高' },
  { id: 'rating', label: '评分榜', icon: Star, desc: '用户评价最高' },
  { id: 'new', label: '新品榜', icon: Sparkles, desc: '最新收录' },
  { id: 'free', label: '免费榜', icon: Crown, desc: '免费工具推荐' },
];

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState('hot');
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?type=${activeTab}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTools(data.data?.tools || []);
        } else {
          setTools([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setTools([]);
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">榜单中心</h1>
            <p className="text-sm text-muted-foreground mt-1">
              发现最受欢迎的AI工具
            </p>
          </div>

          {/* 榜单类型切换 */}
          <div className="flex gap-2 mb-8">
            {RANKING_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-accent text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* 榜单列表 */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool, index) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="block bg-card rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm",
                      index < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>

                    {/* Logo */}
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {tool.logo ? (
                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-medium">{tool.name[0]}</span>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{tool.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{tool.highlight}</p>
                    </div>

                    {/* 标签 */}
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
