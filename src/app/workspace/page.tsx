'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, History, Star, Trash2, ExternalLink, Video, User,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import LoginModal from '@/components/LoginModal';
import { useUser } from '@/contexts/UserContext';
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

export default function WorkspacePage() {
  const { user, authenticated, loading: authLoading, setShowLoginModal } = useUser();
  
  // 收藏
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesPagination, setFavoritesPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  
  // 浏览历史
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // 评分记录
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [ratingsPagination, setRatingsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // 获取收藏
  const fetchFavorites = async (page: number) => {
    setFavoritesLoading(true);
    try {
      const res = await fetch(`/api/favorites?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
        setFavoritesPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取收藏失败:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // 获取浏览历史
  const fetchHistory = async (page: number) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/history?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        setHistoryPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取历史失败:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 获取评分记录
  const fetchRatings = async (page: number) => {
    setRatingsLoading(true);
    try {
      const res = await fetch(`/api/user-ratings?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setRatings(data.data);
        setRatingsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取评分失败:', error);
    } finally {
      setRatingsLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    if (authenticated && user) {
      fetchFavorites(1);
      fetchHistory(1);
      fetchRatings(1);
    }
  }, [authenticated, user]);

  // 取消收藏
  const removeFavorite = async (toolId: number) => {
    try {
      await fetch(`/api/favorites?tool_id=${toolId}`, {
        method: 'DELETE'
      });
      fetchFavorites(1);
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 清除历史
  const clearHistory = async () => {
    if (!confirm('确定要清除所有浏览历史吗？')) return;
    try {
      await fetch('/api/history', {
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
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.highlight}</p>
          </div>
          {extra}
        </div>
      </CardContent>
    </Card>
  );

  // 加载中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // 未登录
  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <AnimatedLobster size={80} />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-2">
              登录后查看工作台
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              登录后可以管理收藏、查看浏览历史和评分记录
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <User className="w-4 h-4 mr-2" />
              微信扫码登录
            </Button>
          </div>
        </div>
        <LoginModal
          open={false}
          onClose={() => {}}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={36} />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">我的工作台</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {(user.nickname || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span>{user.nickname || '用户'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              我的收藏
              {favoritesPagination.total > 0 && (
                <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 rounded-full">
                  {favoritesPagination.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              浏览历史
              {historyPagination.total > 0 && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 rounded-full">
                  {historyPagination.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-2">
              <Star className="w-4 h-4" />
              评分记录
              {ratingsPagination.total > 0 && (
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-600 px-1.5 rounded-full">
                  {ratingsPagination.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 收藏 */}
          <TabsContent value="favorites">
            <div className="space-y-4">
              {favoritesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : favorites.length > 0 ? (
                <>
                  {favorites.map((fav) => (
                    <ToolCard
                      key={fav.id}
                      tool={fav.tools}
                      extra={
                        <div className="flex items-center gap-2">
                          <Link href={`/?tool=${fav.tool_id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeFavorite(fav.tool_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      }
                    />
                  ))}
                  
                  {favoritesPagination.total_pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={favoritesPagination.page === 1}
                        onClick={() => fetchFavorites(favoritesPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="flex items-center text-sm text-slate-500">
                        {favoritesPagination.page} / {favoritesPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={favoritesPagination.page === favoritesPagination.total_pages}
                        onClick={() => fetchFavorites(favoritesPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">还没有收藏任何工具</p>
                  <Link href="/">
                    <Button variant="link" className="text-orange-500 mt-2">
                      去发现工具
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 浏览历史 */}
          <TabsContent value="history">
            <div className="space-y-4">
              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : history.length > 0 ? (
                <>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={clearHistory}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      清除历史
                    </Button>
                  </div>
                  
                  {history.map((item) => (
                    <ToolCard
                      key={item.id}
                      tool={item.tools}
                      extra={
                        <Link href={`/?tool=${item.tool_id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      }
                    />
                  ))}
                  
                  {historyPagination.total_pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPagination.page === 1}
                        onClick={() => fetchHistory(historyPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="flex items-center text-sm text-slate-500">
                        {historyPagination.page} / {historyPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPagination.page === historyPagination.total_pages}
                        onClick={() => fetchHistory(historyPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">暂无浏览记录</p>
                  <Link href="/">
                    <Button variant="link" className="text-orange-500 mt-2">
                      去探索工具
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 评分记录 */}
          <TabsContent value="ratings">
            <div className="space-y-4">
              {ratingsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : ratings.length > 0 ? (
                <>
                  {ratings.map((item) => (
                    <Card key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={item.tools.logo}
                              alt={item.tools.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${item.tools.name[0]}</text></svg>`;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100">{item.tools.name}</h3>
                              <Link href={`/?tool=${item.tool_id}`} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{item.overall_score}</span>
                              </div>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-500">效果 {item.effect_score}</span>
                              <span className="text-slate-500">易用 {item.usability_score}</span>
                              <span className="text-slate-500">额度 {item.quota_score}</span>
                              <span className="text-slate-500">稳定 {item.stability_score}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {ratingsPagination.total_pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ratingsPagination.page === 1}
                        onClick={() => fetchRatings(ratingsPagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="flex items-center text-sm text-slate-500">
                        {ratingsPagination.page} / {ratingsPagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ratingsPagination.page === ratingsPagination.total_pages}
                        onClick={() => fetchRatings(ratingsPagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">还没有评分记录</p>
                  <Link href="/">
                    <Button variant="link" className="text-orange-500 mt-2">
                      去评价工具
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/oneclaw-logo.jpg" 
                alt="OneClaw" 
                width={28} 
                height={28}
                className="object-contain"
              />
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
