'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flame, Gift, Sparkles, Zap, ExternalLink, Star, TrendingUp,
  Video, ChevronRight, Crown
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import Link from 'next/link';

// 类型定义
interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  free_type: string;
  feature_tags: string[];
  official_url: string;
  promotion_url: string;
  view_count: number;
  click_count: number;
  avg_rating: number;
  rating_count: number;
  categories: { name: string; slug: string };
}

// 免费类型颜色
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// 榜单类型配置
const RANKING_TYPES = [
  { id: 'hot', name: '热门榜单', icon: Flame, color: 'text-red-500', desc: '最受欢迎的AI工具' },
  { id: 'free', name: '免费神器', icon: Gift, color: 'text-green-500', desc: '完全免费或提供免费额度' },
  { id: 'new', name: '新品上线', icon: Sparkles, color: 'text-purple-500', desc: '最近30天上架的新工具' },
];

// 场景化榜单
const SCENES = [
  { name: '口播视频', icon: Video },
  { name: '电商带货', icon: TrendingUp },
  { name: '动漫制作', icon: Zap },
];

export default function RankingsPage() {
  const [loading, setLoading] = useState(true);
  const [hotTools, setHotTools] = useState<Tool[]>([]);
  const [freeTools, setFreeTools] = useState<Tool[]>([]);
  const [newTools, setNewTools] = useState<Tool[]>([]);
  const [activeTab, setActiveTab] = useState('hot');

  useEffect(() => {
    fetchAllRankings();
  }, []);

  const fetchAllRankings = async () => {
    setLoading(true);
    try {
      const [hotRes, freeRes, newRes] = await Promise.all([
        fetch('/api/rankings?type=hot&limit=20'),
        fetch('/api/rankings?type=free&limit=20'),
        fetch('/api/rankings?type=new&limit=20')
      ]);

      const [hotData, freeData, newData] = await Promise.all([
        hotRes.json(),
        freeRes.json(),
        newRes.json()
      ]);

      if (hotData.success) setHotTools(hotData.data);
      if (freeData.success) setFreeTools(freeData.data);
      if (newData.success) setNewTools(newData.data);
    } catch (error) {
      console.error('获取榜单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRedirectUrl = (tool: Tool) => {
    return tool.promotion_url || tool.official_url;
  };

  // 榜单卡片
  const RankingCard = ({ tool, rank }: { tool: Tool; rank: number }) => (
    <Card className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* 排名 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
            rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-white' :
            rank === 3 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white' :
            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {rank <= 3 ? <Crown className="w-4 h-4" /> : rank}
          </div>

          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
              }}
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                {tool.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${FREE_TYPE_COLORS[tool.free_type]}`}>
                {tool.free_type}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
              {tool.highlight}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {tool.avg_rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span>{tool.avg_rating}</span>
                  <span className="text-slate-400">({tool.rating_count})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{tool.click_count} 次访问</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-shrink-0"
            onClick={() => window.open(getRedirectUrl(tool), '_blank')}
          >
            访问
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
                <p className="text-xs text-slate-500 dark:text-slate-400">榜单中心</p>
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

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 榜单标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            {RANKING_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <span>{type.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 热门榜单 */}
          <TabsContent value="hot">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                热门榜单 TOP 20
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                根据用户访问量实时排序
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : hotTools.length > 0 ? (
              <div className="space-y-3">
                {hotTools.map((tool, index) => (
                  <RankingCard key={tool.id} tool={tool} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500">暂无数据</p>
              </div>
            )}
          </TabsContent>

          {/* 免费神器 */}
          <TabsContent value="free">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-500" />
                免费神器 TOP 20
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                完全免费或提供免费额度的优质工具
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : freeTools.length > 0 ? (
              <div className="space-y-3">
                {freeTools.map((tool, index) => (
                  <RankingCard key={tool.id} tool={tool} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500">暂无数据</p>
              </div>
            )}
          </TabsContent>

          {/* 新品上线 */}
          <TabsContent value="new">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                新品上线 TOP 20
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                最近30天内上架的新工具
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : newTools.length > 0 ? (
              <div className="space-y-3">
                {newTools.map((tool, index) => (
                  <RankingCard key={tool.id} tool={tool} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500">最近30天暂无新工具上线</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 场景化榜单入口 */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            场景化榜单
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENES.map(scene => {
              const Icon = scene.icon;
              return (
                <Link 
                  key={scene.name} 
                  href={`/?scene=${encodeURIComponent(scene.name)}`}
                  className="group"
                >
                  <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-all h-full">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-100">
                            {scene.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            查看推荐工具
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦞</span>
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
