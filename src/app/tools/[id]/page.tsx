'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ExternalLink, Star, Heart, Check, X, MessageSquare, ThumbsUp,
  ChevronLeft, Share2, Copy, Clock, Shield, Zap, Video, Users,
  Calendar, Globe, Award, TrendingUp, BarChart3, Bookmark, BookOpen,
  HelpCircle, ArrowRight, Sparkles, Wand2, Layers, Settings, Eye
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
  
  // 评分和评论
  const [ratings, setRatings] = useState<Rating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState({ effect_score: 0, usability_score: 0, quota_score: 0, stability_score: 0 });
  const [submitting, setSubmitting] = useState(false);
  
  // 收藏状态
  const [isFavorited, setIsFavorited] = useState(false);
  const userId = typeof window !== 'undefined' ? getUserId() : '';

  // 加载工具数据
  useEffect(() => {
    async function loadTool() {
      try {
        const res = await fetch(`/api/tools/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setTool(data.data);
          // 增加浏览量
          fetch(`/api/tools/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'view' }) });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('加载工具失败:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadTool();
  }, [id]);

  // 加载评分和评论
  useEffect(() => {
    if (tool && userId) {
      fetchRatingsAndReviews();
      checkFavorite();
    } else if (tool) {
      fetchRatingsAndReviews();
    }
  }, [tool, userId]);

  const fetchRatingsAndReviews = async () => {
    if (!tool) return;
    try {
      const [ratingsRes, reviewsRes] = await Promise.all([
        fetch(`/api/ratings?tool_id=${tool.id}`),
        fetch(`/api/reviews?tool_id=${tool.id}&page=1&limit=5`)
      ]);
      const ratingsData = await ratingsRes.json();
      const reviewsData = await reviewsRes.json();
      if (ratingsData.success) setRatings(ratingsData.data);
      if (reviewsData.success) {
        setReviews(reviewsData.data);
        setReviewsPagination(reviewsData.pagination);
      }
    } catch (err) {
      console.error('加载评分评论失败:', err);
    }
  };

  const checkFavorite = async () => {
    if (!userId || !tool) return;
    try {
      const res = await fetch(`/api/favorites?user_id=${userId}&tool_id=${tool.id}`);
      const data = await res.json();
      if (data.success) setIsFavorited(data.is_favorited);
    } catch (err) {
      console.error('检查收藏失败:', err);
    }
  };

  const handleVisit = () => {
    if (!tool) return;
    const url = tool.promotion_url || tool.official_url;
    window.open(url, '_blank', 'noopener,noreferrer');
    // 记录点击
    fetch(`/api/tools/${tool.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'click' }) });
  };

  const toggleFavorite = async () => {
    if (!userId || !tool) return;
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?user_id=${userId}&tool_id=${tool.id}`, { method: 'DELETE' });
        setIsFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, tool_id: tool.id })
        });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tool?.name, text: tool?.highlight, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板');
    }
  };

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
        body: JSON.stringify({ user_id: userId, tool_id: tool.id, ...newRating })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRatingsAndReviews();
        alert('评分成功！');
      }
    } catch (err) {
      console.error('提交评分失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
        body: JSON.stringify({ user_id: userId, tool_id: tool.id, content: newReview })
      });
      const data = await res.json();
      if (data.success) {
        setNewReview('');
        await fetchRatingsAndReviews();
        alert(data.message);
      }
    } catch (err) {
      console.error('提交评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误
  if (error || !tool) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero区域 */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-white hover:bg-white/20">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Logo */}
            <div className="w-28 h-28 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={tool.logo}
                alt={tool.name}
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect fill="%23f97316" width="112" height="112"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="48" font-weight="bold">${tool.name[0]}</text></svg>`;
                }}
              />
            </div>
            
            {/* 工具信息 */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{tool.name}</h1>
                {tool.is_official && (
                  <Badge className="bg-blue-500 text-white">官方认证</Badge>
                )}
                {tool.is_featured && (
                  <Badge className="bg-yellow-500 text-white">精选</Badge>
                )}
              </div>
              <p className="text-white/80 mb-2">{tool.producer}</p>
              <p className="text-xl font-medium mb-4">{tool.highlight}</p>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-white/20`}>
                  {tool.free_type}
                </span>
                {tool.feature_tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* CTA按钮 */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleVisit}
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                立即访问
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleFavorite}
                className="border-white text-white hover:bg-white/20"
              >
                <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'text-red-400 fill-red-400' : ''}`} />
                {isFavorited ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 快速统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{tool.view_count.toLocaleString()}</p>
              <p className="text-sm text-slate-500">浏览量</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                <ExternalLink className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{tool.click_count.toLocaleString()}</p>
              <p className="text-sm text-slate-500">访问量</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{ratings?.overall_score || '4.5'}</p>
              <p className="text-sm text-slate-500">综合评分</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{reviewsPagination.total}</p>
              <p className="text-sm text-slate-500">用户评论</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 核心功能 */}
            {tool.feature_tags.length > 0 && (
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    核心功能
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tool.feature_tags.map((tag, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                          {i % 4 === 0 && <Wand2 className="w-5 h-5 text-white" />}
                          {i % 4 === 1 && <Layers className="w-5 h-5 text-white" />}
                          {i % 4 === 2 && <Settings className="w-5 h-5 text-white" />}
                          {i % 4 === 3 && <Zap className="w-5 h-5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tag}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 核心优势 */}
            {tool.advantages.length > 0 && (
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" />
                    核心优势
                  </h2>
                  <ul className="space-y-4">
                    {tool.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 pt-1">{adv}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 局限性 */}
            {tool.limitations.length > 0 && (
              <Card className="bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                    注意事项
                  </h2>
                  <ul className="space-y-4">
                    {tool.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-500 font-bold text-sm">{i + 1}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 pt-1">{lim}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 评分和评论 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <Tabs defaultValue="rating">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="rating">用户评分</TabsTrigger>
                    <TabsTrigger value="reviews">用户评论 ({reviewsPagination.total})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rating">
                    {/* 评分概览 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <p className="text-3xl font-bold text-orange-500">{ratings?.overall_score || '-'}</p>
                        <div className="flex justify-center mt-1">
                          <StarRating value={Math.round(Number(ratings?.overall_score) || 0)} readonly />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">综合评分</p>
                      </div>
                      {[
                        { key: 'effect_score', label: '效果', icon: Wand2 },
                        { key: 'usability_score', label: '易用性', icon: Settings },
                        { key: 'quota_score', label: '额度', icon: Zap },
                        { key: 'stability_score', label: '稳定性', icon: Shield },
                      ].map(item => (
                        <div key={item.key} className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                            {ratings ? (ratings[item.key as keyof Rating] || '-') : '-'}
                          </p>
                          <div className="flex justify-center mt-1">
                            <StarRating value={Number(ratings ? (ratings[item.key as keyof Rating] || 0) : 0)} readonly />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* 提交评分 */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">我要评分</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'effect_score', label: '效果' },
                          { key: 'usability_score', label: '易用性' },
                          { key: 'quota_score', label: '额度' },
                          { key: 'stability_score', label: '稳定性' },
                        ].map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                            <StarRating
                              value={newRating[item.key as keyof typeof newRating]}
                              onChange={(v) => setNewRating(prev => ({ ...prev, [item.key]: v }))}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={submitRating}
                        disabled={submitting || Object.values(newRating).some(v => v === 0)}
                        className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500"
                      >
                        {submitting ? '提交中...' : '提交评分'}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    {/* 提交评论 */}
                    <div className="mb-6">
                      <Textarea
                        placeholder="分享你的使用体验... (10-500字)"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="mb-3"
                        rows={4}
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
                          <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-medium">
                                {review.user_id.slice(-2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  用户_{review.user_id.slice(-4)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(review.created_at).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                              {review.user_ratings && (
                                <div className="ml-auto flex items-center gap-1">
                                  <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {review.user_ratings.overall_score}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm pl-10">{review.content}</p>
                            <div className="flex items-center gap-4 mt-2 pl-10">
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

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  基本信息
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Video className="w-4 h-4" /> 分类
                    </span>
                    <Link href={`/?category=${tool.categories?.slug}`} className="text-orange-500 hover:underline font-medium">
                      {tool.categories?.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> 生成时长
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{tool.max_duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> 商用授权
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{tool.commercial_license}</span>
                  </div>
                  {tool.launch_date && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> 上线时间
                      </span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {new Date(tool.launch_date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 免费额度 */}
            {tool.free_quota_desc && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <h3 className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    免费额度
                  </h3>
                  <p className="text-green-600 dark:text-green-400">{tool.free_quota_desc}</p>
                </CardContent>
              </Card>
            )}

            {/* 快捷入口 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-orange-500" />
                  快捷入口
                </h3>
                <div className="space-y-3">
                  <Button onClick={handleVisit} className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    访问官网
                  </Button>
                  <Link href="/tutorials">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      相关教程
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/prompts">
                    <Button variant="outline" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      提示词模板
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 功能标签 */}
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">功能标签</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.feature_tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/lobster-logo.png" 
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
