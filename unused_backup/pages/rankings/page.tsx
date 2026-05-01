'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Flame, Sparkles, Star, Clock, 
  ChevronRight, Search, Loader2, Crown, Zap
} from 'lucide-react';
import BackToHome from '@/components/common/BackToHome';

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  click_count?: number;
  rating_avg?: number;
}

interface Ranking {
  type: 'hot' | 'free' | 'new' | 'top';
  title: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  tools: Tool[];
}

// 模拟榜单数据（实际应从API获取）
const mockRankings: Ranking[] = [
  {
    type: 'hot',
    title: '热门工具',
    icon: <Flame className="w-5 h-5" />,
    badge: '热门',
    badgeColor: 'bg-red-100 text-red-600',
    tools: []
  },
  {
    type: 'free',
    title: '免费神器',
    icon: <Star className="w-5 h-5" />,
    badge: '免费',
    badgeColor: 'bg-green-100 text-green-600',
    tools: []
  },
  {
    type: 'new',
    title: '新品上线',
    icon: <Sparkles className="w-5 h-5" />,
    badge: '新品',
    badgeColor: 'bg-purple-100 text-purple-600',
    tools: []
  },
  {
    type: 'top',
    title: '评分最高',
    icon: <Crown className="w-5 h-5" />,
    badge: '高分',
    badgeColor: 'bg-amber-100 text-amber-600',
    tools: []
  }
];

export default function RankingsPage() {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<Ranking[]>(mockRankings);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) {
        const data = await res.json();
        // 处理数据
        console.log('Rankings data:', data);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = rankings.map(ranking => ({
    ...ranking,
    tools: ranking.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.highlight.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <BackToHome />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            <Zap className="w-8 h-8 inline mr-2 text-orange-500" />
            AI工具榜单
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            发现最受欢迎的AI工具，紧跟最新趋势
          </p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* 榜单标签页 */}
        <Tabs defaultValue="hot" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {filteredRankings.map(ranking => (
              <TabsTrigger
                key={ranking.type}
                value={ranking.type}
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
              >
                {ranking.icon}
                <span className="hidden sm:inline">{ranking.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredRankings.map(ranking => (
            <TabsContent key={ranking.type} value={ranking.type}>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : ranking.tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ranking.tools.map((tool, index) => (
                    <Link key={tool.id} href={`/tools/${tool.id}`}>
                      <Card className="hover:shadow-lg hover:border-orange-400 transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* 排名 */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-amber-100 text-amber-600' :
                              index === 1 ? 'bg-slate-100 text-slate-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-slate-50 text-slate-400'
                            }`}>
                              {index + 1}
                            </div>
                            
                            {/* Logo */}
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                              {tool.logo && (
                                <img
                                  src={tool.logo}
                                  alt={tool.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            
                            {/* 信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                                  {tool.name}
                                </h3>
                                <Badge variant="outline" className={ranking.badgeColor}>
                                  {ranking.badge}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                                {tool.producer}
                              </p>
                              <p className="text-xs text-orange-500 mt-1 truncate">
                                {tool.highlight}
                              </p>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">
                    {searchQuery ? '没有找到匹配的工具' : '暂无数据'}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* 提示信息 */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>榜单每日更新，统计数据来源于用户真实使用行为</p>
        </div>
      </main>
    </div>
  );
}
