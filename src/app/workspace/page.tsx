'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, History, Star, Trash2, ExternalLink, Video, User,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import Link from 'next/link';

// 类型定义
interface ToolInfo {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  free_type: string;
  feature_tags: string[];
  categories?: { name: string };
}

interface Favorite {
  id: number;
  tool_id: number;
  created_at: string;
  tools: ToolInfo;
}

interface HistoryItem {
  id: number;
  tool_id: number;
  viewed_at: string;
  tools: ToolInfo;
}

interface RatingItem {
  id: number;
  tool_id: number;
  effect_score: number;
  usability_score: number;
  quota_score: number;
  stability_score: number;
  overall_score: string;
  created_at: string;
  tools: ToolInfo;
}

// 免费类型颜色
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// 获取用户ID
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('oneclaw_user_id') || '';
};

export default function WorkspacePage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 收藏
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesPagination, setFavoritesPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 浏览历史
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 评分记录
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [ratingsPagination, setRatingsPagination] = useState({ page: 1, total: 0, total_pages: 0 });

  // 初始化
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    if (id) {
      fetchAllData(id);
    }
  }, []);

  // 获取所有数据
  const fetchAllData = async (uid: string) => {
    setLoading(true);
    await Promise.all([
      fetchFavorites(uid, 1),
      fetchHistory(uid, 1),
      fetchRatings(uid, 1)
    ]);
    setLoading(false);
  };

  // 获取收藏
  const fetchFavorites = async (uid: string, page: number) => {
    try {
      const res = await fetch(`/api/favorites?user_id=${uid}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
        setFavoritesPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取收藏失败:', error);
    }
  };

  // 获取浏览历史
  const fetchHistory = async (uid: string, page: number) => {
    try {
      const res = await fetch(`/api/history?user_id=${uid}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        setHistoryPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取历史失败:', error);
    }
  };

  // 获取评分记录
  const fetchRatings = async (uid: string, page: number) => {
    try {
      const res = await fetch(`/api/user-ratings?user_id=${uid}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setRatings(data.data);
        setRatingsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取评分失败:', error);
    }
  };

  // 取消收藏
  const removeFavorite = async (toolId: number) => {
    try {
      await fetch(`/api/favorites?user_id=${userId}&tool_id=${toolId}`, {
        method: 'DELETE'
      });
      fetchFavorites(userId, 1);
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 清除历史
  const clearHistory = async () => {
    if (!confirm('确定要清除所有浏览历史吗？')) return;
    try {
      await fetch(`/api/history?user_id=${userId}`, {
        method: 'DELETE'
      });
      setHistory([]);
      setHistoryPagination({ page: 1, total: 0, total_pages: 0 });
    } catch (error) {
      console.error('清除历史失败:', error);
    }
  };

  // 工具卡片
  const ToolCard = ({ tool, extra }: { tool: ToolInfo; extra?: React.ReactNode }) => (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
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
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">{tool.highlight}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${FREE_TYPE_COLORS[tool.free_type]}`}>
                {tool.free_type}
              </span>
            </div>
          </div>
          {extra}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">我的工作台</p>
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

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <Tabs defaultValue="favorites" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                收藏 ({favoritesPagination.total})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                历史 ({historyPagination.total})
              </TabsTrigger>
              <TabsTrigger value="ratings" className="gap-2">
                <Star className="w-4 h-4" />
                评分 ({ratingsPagination.total})
              </TabsTrigger>
            </TabsList>

            {/* 收藏列表 */}
            <TabsContent value="favorites">
              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map(fav => (
                    <div key={fav.id} className="relative group">
                      <ToolCard 
                        tool={fav.tools} 
                        extra={
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/?tool=${fav.tool_id}`} target="_blank">
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => removeFavorite(fav.tool_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        }
                      />
                      <p className="text-xs text-slate-400 mt-1 px-1">
                        收藏于 {new Date(fav.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  
                  {favoritesPagination.total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={favoritesPagination.page === 1}
                        onClick={() => fetchFavorites(userId, favoritesPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-500">
                        {favoritesPagination.page} / {favoritesPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={favoritesPagination.page === favoritesPagination.total_pages}
                        onClick={() => fetchFavorites(userId, favoritesPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">还没有收藏</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">浏览工具时点击❤️即可收藏</p>
                  <Link href="/">
                    <Button>去发现工具</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* 浏览历史 */}
            <TabsContent value="history">
              {history.length > 0 ? (
                <div>
                  <div className="flex justify-end mb-3">
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      清除历史
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} className="relative">
                        <ToolCard tool={item.tools} />
                        <p className="text-xs text-slate-400 mt-1 px-1">
                          浏览于 {new Date(item.viewed_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {historyPagination.total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPagination.page === 1}
                        onClick={() => fetchHistory(userId, historyPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-500">
                        {historyPagination.page} / {historyPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPagination.page === historyPagination.total_pages}
                        onClick={() => fetchHistory(userId, historyPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无浏览记录</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">浏览过的工具会记录在这里</p>
                  <Link href="/">
                    <Button>去发现工具</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* 评分记录 */}
            <TabsContent value="ratings">
              {ratings.length > 0 ? (
                <div className="space-y-3">
                  {ratings.map(rating => (
                    <Card key={rating.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={rating.tools.logo}
                              alt={rating.tools.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${rating.tools.name[0]}</text></svg>`;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100">{rating.tools.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{rating.tools.highlight}</p>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                              <span className="font-bold text-slate-800 dark:text-slate-100">{rating.overall_score}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">效果:</span>
                                <span className="font-medium">{rating.effect_score}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">易用:</span>
                                <span className="font-medium">{rating.usability_score}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">额度:</span>
                                <span className="font-medium">{rating.quota_score}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">稳定:</span>
                                <span className="font-medium">{rating.stability_score}</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-400 mt-2">
                              评分于 {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {ratingsPagination.total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ratingsPagination.page === 1}
                        onClick={() => fetchRatings(userId, ratingsPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-500">
                        {ratingsPagination.page} / {ratingsPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ratingsPagination.page === ratingsPagination.total_pages}
                        onClick={() => fetchRatings(userId, ratingsPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Star className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">还没有评分</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">为使用过的工具打分吧</p>
                  <Link href="/">
                    <Button>去发现工具</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
