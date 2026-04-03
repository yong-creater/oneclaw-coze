'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ExternalLink, Star, Heart, Check, X, MessageSquare, ThumbsUp,
  ChevronLeft, Share2, Copy, Clock, Shield, Zap, Video, Users
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 类型定义
interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  sub_category_ids: number[];
  free_type: string;
  free_quota_desc: string | null;
  feature_tags: string[];
  max_duration: string;
  official_url: string;
  promotion_url: string | null;
  is_official: boolean;
  is_featured: boolean;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  view_count: number;
  click_count: number;
  launch_date: string | null;
  categories: { name: string; slug: string };
}

interface Rating {
  effect_score: number;
  usability_score: number;
  quota_score: number;
  stability_score: number;
  overall_score: string;
}

interface Review {
  id: number;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  user_ratings?: Rating;
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
  let userId = localStorage.getItem('oneclaw_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('oneclaw_user_id', userId);
  }
  return userId;
};

// 星级评分组件
function StarRating({ value, onChange, readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${star <= value ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // 用户相关
  const [userId, setUserId] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    count: 0,
    avg_overall: 0,
    avg_effect: 0,
    avg_usability: 0,
    avg_quota: 0,
    avg_stability: 0,
    user_rating: null as { effect_score: number; usability_score: number; quota_score: number; stability_score: number } | null
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 评分状态
  const [newRating, setNewRating] = useState({
    effect_score: 0,
    usability_score: 0,
    quota_score: 0,
    stability_score: 0
  });
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 初始化用户ID
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // 获取工具详情
  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await fetch(`/api/tools/${id}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setTool(data.data);
          // 记录浏览历史
          if (userId) {
            await fetch('/api/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, tool_id: data.data.id })
            });
          }
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTool();
  }, [id, userId]);

  // 获取评分和评论
  useEffect(() => {
    if (tool && userId) {
      fetchToolRatingsAndReviews();
    }
  }, [tool, userId]);

  const fetchToolRatingsAndReviews = async () => {
    if (!tool) return;
    try {
      // 获取评分统计
      const ratingRes = await fetch(`/api/ratings?tool_id=${tool.id}&user_id=${userId}`);
      const ratingData = await ratingRes.json();
      if (ratingData.success) {
        setRatingStats(ratingData.data);
        if (ratingData.data.user_rating) {
          setNewRating({
            effect_score: ratingData.data.user_rating.effect_score,
            usability_score: ratingData.data.user_rating.usability_score,
            quota_score: ratingData.data.user_rating.quota_score,
            stability_score: ratingData.data.user_rating.stability_score
          });
        }
      }

      // 获取评论列表
      const reviewsRes = await fetch(`/api/reviews?tool_id=${tool.id}&page=1&limit=10`);
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) {
        setReviews(reviewsData.data);
        setReviewsPagination(reviewsData.pagination);
      }

      // 检查是否收藏
      const favRes = await fetch(`/api/favorites?tool_id=${tool.id}&check_user_id=${userId}`);
      const favData = await favRes.json();
      if (favData.success) {
        setIsFavorited(favData.data.is_favorited);
      }
    } catch (error) {
      console.error('获取工具数据失败:', error);
    }
  };

  // 获取跳转链接
  const getRedirectUrl = () => {
    return tool?.promotion_url || tool?.official_url;
  };

  // 跳转到官网
  const handleVisit = async () => {
    if (!tool) return;
    const url = getRedirectUrl();
    if (url) {
      // 记录点击
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tool_id: tool.id, action: 'click' })
      });
      window.open(url, '_blank');
    }
  };

  // 收藏/取消收藏
  const toggleFavorite = async () => {
    if (!userId || !tool) return;
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?user_id=${userId}&tool_id=${tool.id}`, {
          method: 'DELETE'
        });
        setIsFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, tool_id: tool.id })
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  // 提交评分
  const submitRating = async () => {
    if (!userId || !tool) return;
    if (Object.values(newRating).some(v => v === 0)) {
      alert('请完成所有评分项');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tool_id: tool.id,
          ...newRating
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchToolRatingsAndReviews();
        alert('评分成功！');
      }
    } catch (error) {
      console.error('提交评分失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 提交评论
  const submitReview = async () => {
    if (!userId || !tool) return;
    if (newReview.length < 10 || newReview.length > 500) {
      alert('评论长度需在10-500字之间');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tool_id: tool.id,
          content: newReview
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewReview('');
        alert(data.message);
      }
    } catch (error) {
      console.error('提交评论失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 分享
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: tool?.name,
        text: tool?.highlight,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板');
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  // 错误
  if (error || !tool) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500">
              <ChevronLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 工具头部信息 */}
        <Card className="bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23f97316" width="96" height="96"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="40" font-weight="bold">${tool.name[0]}</text></svg>`;
                  }}
                />
              </div>

              {/* 基本信息 */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tool.name}</h1>
                  {tool.is_official && (
                    <Badge className="bg-blue-500 text-white">官方认证</Badge>
                  )}
                  {tool.is_featured && (
                    <Badge className="bg-orange-500 text-white">推荐</Badge>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-3">{tool.producer}</p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">{tool.highlight}</p>
                
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${FREE_TYPE_COLORS[tool.free_type]}`}>
                    {tool.free_type}
                  </span>
                  {tool.feature_tags.slice(0, 4).map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Button
                    onClick={handleVisit}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    立即访问
                  </Button>
                  <Button variant="outline" onClick={toggleFavorite}>
                    <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'text-red-500 fill-red-500' : ''}`} />
                    {isFavorited ? '已收藏' : '收藏'}
                  </Button>
                </div>
              </div>
            </div>

            {/* 免费额度说明 */}
            {tool.free_quota_desc && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">免费额度</span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 mt-1">{tool.free_quota_desc}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 详细信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 左侧：优势和局限 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 核心优势 */}
            {tool.advantages.length > 0 && (
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    核心优势
                  </h2>
                  <ul className="space-y-3">
                    {tool.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 局限性 */}
            {tool.limitations.length > 0 && (
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-500" />
                    局限性
                  </h2>
                  <ul className="space-y-3">
                    {tool.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        {lim}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 用户评分和评论 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <Tabs defaultValue="rating">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="rating">评分</TabsTrigger>
                    <TabsTrigger value="reviews">评论 ({reviewsPagination.total})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="rating">
                    {/* 评分统计 */}
                    {ratingStats.count > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100">用户评分</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_overall}</span>
                            <span className="text-sm text-slate-500">({ratingStats.count}人评价)</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">生成效果</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span className="font-medium">{ratingStats.avg_effect}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">易用性</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span className="font-medium">{ratingStats.avg_usability}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">免费额度</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span className="font-medium">{ratingStats.avg_quota}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">稳定性</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span className="font-medium">{ratingStats.avg_stability}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 提交评分 */}
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {ratingStats.user_rating ? '修改您的评分：' : '为这个工具打分：'}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">生成效果</span>
                          <StarRating value={newRating.effect_score} onChange={(v) => setNewRating(prev => ({ ...prev, effect_score: v }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">易用性</span>
                          <StarRating value={newRating.usability_score} onChange={(v) => setNewRating(prev => ({ ...prev, usability_score: v }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">免费额度</span>
                          <StarRating value={newRating.quota_score} onChange={(v) => setNewRating(prev => ({ ...prev, quota_score: v }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">稳定性</span>
                          <StarRating value={newRating.stability_score} onChange={(v) => setNewRating(prev => ({ ...prev, stability_score: v }))} />
                        </div>
                      </div>

                      <Button
                        onClick={submitRating}
                        disabled={submitting || Object.values(newRating).some(v => v === 0)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        {submitting ? '提交中...' : '提交评分'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    {/* 发表评论 */}
                    <div className="mb-6">
                      <Textarea
                        placeholder="分享您对这个工具的使用体验（10-500字）..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{newReview.length}/500</span>
                        <Button
                          onClick={submitReview}
                          disabled={submitting || newReview.length < 10 || newReview.length > 500}
                          size="sm"
                        >
                          {submitting ? '提交中...' : '发表评论'}
                        </Button>
                      </div>
                    </div>

                    {/* 评论列表 */}
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                用户***{review.user_id.slice(-4)}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.user_ratings && (
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">{review.user_ratings.overall_score}</span>
                              </div>
                            )}
                            <p className="text-slate-600 dark:text-slate-300 text-sm">{review.content}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-500">
                                <ThumbsUp className="w-3 h-3" />
                                {review.likes}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        暂无评论，快来抢沙发吧~
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：基本信息 */}
          <div className="space-y-6">
            {/* 基本信息卡片 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">基本信息</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Video className="w-4 h-4" /> 分类
                    </span>
                    <Link href={`/?category=${tool.categories?.slug}`} className="text-orange-500 hover:underline">
                      {tool.categories?.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> 生成时长
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{tool.max_duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> 商用授权
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{tool.commercial_license}</span>
                  </div>
                  {tool.launch_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> 上线时间
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {new Date(tool.launch_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 数据统计 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">数据统计</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-500">{tool.view_count}</p>
                    <p className="text-xs text-slate-500">浏览量</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-green-500">{tool.click_count}</p>
                    <p className="text-xs text-slate-500">访问量</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 功能标签 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">功能标签</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.feature_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
