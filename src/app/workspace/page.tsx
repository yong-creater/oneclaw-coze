'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Star, Heart, Clock, Trash2, ExternalLink } from 'lucide-react';

interface FavoriteItem {
  id: number;
  tool_id: number;
  tool_name: string;
  tool_logo: string;
  tool_highlight: string;
  created_at: string;
}

interface HistoryItem {
  id: number;
  tool_id: number;
  tool_name: string;
  tool_logo: string;
  tool_highlight: string;
  visited_at: string;
}

interface RatingItem {
  id: number;
  tool_id: number;
  tool_name: string;
  tool_logo: string;
  effect_score: number;
  usability_score: number;
  quota_score: number;
  stability_score: number;
  created_at: string;
}

export default function WorkspacePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'favorites';
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ nickname: string } | null>(null);

  // 检查登录状态
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    if (!token) {
      setLoading(false);
      return;
    }

    const tokenValue = token.split('=')[1];
    fetch('/api/auth?action=check', {
      headers: { Cookie: `user_token=${tokenValue}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  // 加载数据
  useEffect(() => {
    setLoading(true);
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token.split('=')[1]}` } : {};

    Promise.all([
      fetch('/api/favorites', { headers }).then(r => r.json()),
      fetch('/api/history', { headers }).then(r => r.json()),
      fetch('/api/ratings', { headers }).then(r => r.json()),
    ]).then(([favData, hisData, ratData]) => {
      if (favData.success) setFavorites(favData.data || []);
      if (hisData.success) setHistory(hisData.data || []);
      if (ratData.success) setRatings(ratData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 删除收藏
  const handleDeleteFavorite = async (id: number) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    if (!token) return;

    await fetch(`/api/favorites?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.split('=')[1]}` }
    });
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  // 删除历史
  const handleDeleteHistory = async (id: number) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    if (!token) return;

    await fetch(`/api/history?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.split('=')[1]}` }
    });
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  // 渲染星级
  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3 h-3",
              star <= score ? "fill-primary text-primary" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const ItemCard = ({ 
    id, 
    tool_id, 
    tool_name, 
    tool_logo, 
    tool_highlight,
    time,
    onDelete,
    showStars,
    scores
  }: { 
    id: number; 
    tool_id: number; 
    tool_name: string; 
    tool_logo: string; 
    tool_highlight: string;
    time?: string;
    onDelete?: () => void;
    showStars?: boolean;
    scores?: { effect: number; usability: number; quota: number; stability: number };
  }) => (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {tool_logo ? (
          <img src={tool_logo} alt={tool_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-medium">{tool_name[0]}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <a href={`/tools/${tool_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
          {tool_name}
        </a>
        <p className="text-xs text-muted-foreground truncate">{tool_highlight}</p>
        {showStars && scores && (
          <div className="flex gap-3 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">效果</span>
              {renderStars(scores.effect)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">易用</span>
              {renderStars(scores.usability)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {time && <span className="text-xs text-muted-foreground">{time}</span>}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <a href={`/tools/${tool_id}`}>
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 240px)' }}>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-2">请先登录</h2>
              <p className="text-muted-foreground mb-4">登录后可使用工作台功能</p>
              <a href="/login">
                <Button className="cursor-pointer">去登录</Button>
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">工作台</h1>
            <p className="text-sm text-muted-foreground mt-1">
              欢迎回来，{user.nickname}
            </p>
          </div>

          <Tabs defaultValue={initialTab}>
            <TabsList>
              <TabsTrigger value="favorites" className="cursor-pointer">
                <Heart className="w-4 h-4 mr-2" />
                我的收藏
                {favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{favorites.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="cursor-pointer">
                <Clock className="w-4 h-4 mr-2" />
                浏览历史
              </TabsTrigger>
              <TabsTrigger value="ratings" className="cursor-pointer">
                <Star className="w-4 h-4 mr-2" />
                我的评分
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">暂无收藏</p>
                </div>
              ) : (
                favorites.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    tool_id={item.tool_id}
                    tool_name={item.tool_name}
                    tool_logo={item.tool_logo}
                    tool_highlight={item.tool_highlight}
                    time={new Date(item.created_at).toLocaleDateString()}
                    onDelete={() => handleDeleteFavorite(item.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">暂无浏览记录</p>
                </div>
              ) : (
                history.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    tool_id={item.tool_id}
                    tool_name={item.tool_name}
                    tool_logo={item.tool_logo}
                    tool_highlight={item.tool_highlight}
                    time={new Date(item.visited_at).toLocaleDateString()}
                    onDelete={() => handleDeleteHistory(item.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="ratings" className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : ratings.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">暂无评分记录</p>
                </div>
              ) : (
                ratings.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    tool_id={item.tool_id}
                    tool_name={item.tool_name}
                    tool_logo={item.tool_logo}
                    tool_highlight=""
                    showStars
                    scores={{
                      effect: item.effect_score,
                      usability: item.usability_score,
                      quota: item.quota_score,
                      stability: item.stability_score,
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
