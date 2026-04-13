'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ExternalLink, Star, Heart, Check, X, MessageSquare, ThumbsUp,
  Share2, Copy, Clock, Shield, Zap, Video,
  Calendar, Globe, Award, TrendingUp, BarChart3, Bookmark, BookOpen,
  HelpCircle, ArrowRight, Sparkles, Wand2, Layers, Settings, Eye,
  Search, Filter, Phone, Mail, Link2, ChevronDown,
  Globe2, Smartphone, Laptop, FileText, Download, Code, Share,
  BarChart, PieChart, MapPin, User, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import BackToHome from '@/components/BackToHome';
import { ToolDetailAd } from '@/components/AdBanner';
import WechatPromo from '@/components/WechatPromo';

// ==================== 类型定义 ====================
interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  short_desc?: string;
  full_desc?: string;
  use_guide?: string;
  scenes?: ToolScene[];
  functions?: ToolFunction[];
  faqs?: ToolFAQ[];
  category_id: number;
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
  customer_email?: string;
  feedback_link?: string;
  rating_stats?: {
    total_score: number;
    rating_counts: Record<string, number>;
  };
}

interface ToolScene {
  scene_no: string;
  user_group: string;
  scene_desc: string;
}

interface ToolFunction {
  func_icon?: string;
  func_name: string;
  func_desc: string;
}

interface ToolFAQ {
  question: string;
  answer: string;
}

interface Rating {
  count?: number;
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
  official_reply?: string;
}

// ==================== 常量 ====================

// 星级评分组件
function StarRating({ value, onChange, readonly = false, size = 'md' }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizeClass} ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

// 主页面组件
export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  
  // 评分和评论
  const [ratings, setRatings] = useState<Rating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState({ effect_score: 0, usability_score: 0, quota_score: 0, stability_score: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [showRatingDetail, setShowRatingDetail] = useState(false);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('oneclaw_user_id') || '' : '';

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 加载工具数据
  useEffect(() => {
    async function loadTool() {
      try {
        const res = await fetch(`/api/tools/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setTool(data.data);
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
      checkFavorite();
    }
    if (tool) {
      fetchRatingsAndReviews();
    }
  }, [tool, userId]);

  const fetchRatingsAndReviews = async () => {
    if (!tool) return;
    try {
      const [ratingsRes, reviewsRes] = await Promise.all([
        fetch(`/api/ratings?tool_id=${tool.id}`),
        fetch(`/api/reviews?tool_id=${tool.id}&page=1&limit=10`)
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

  // 保存返回路径，防止被其他操作覆盖

  const handleVisit = () => {
    if (!tool) return;
    const url = tool.promotion_url || tool.official_url;
    window.location.href = url;
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
    if (!tool) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tool.name, text: tool.highlight, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板');
    }
  };

  const copyEmbedCode = () => {
    if (!tool) return;
    const embedCode = `<a href="${window.location.origin}/tools/${tool.id}" target="_blank">${tool.name} - OneClaw</a>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  // 计算评分
  const hasRatings = ratings && (ratings.count ?? 0) > 0;
  const overallScore = hasRatings ? ratings.overall_score : (tool.rating_stats?.total_score?.toString() || null);
  const featureTags = tool.feature_tags || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <BackToHome label="AI 工具详情" />
        </div>
      </header>

      {/* 工具信息头部 - 高级质感设计 */}
      <div className="relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-4 py-6 sm:py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Logo - 精致圆形设计 */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-orange-100">
                {tool.logo ? (
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-2xl sm:text-3xl font-bold text-slate-300 ${tool.logo ? 'hidden' : ''}`}>
                  {tool.name[0]}
                </span>
              </div>
              {/* 精选徽章 */}
              {tool.is_featured && (
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  精选
                </div>
              )}
            </div>
            
            {/* 工具信息 */}
            <div className="flex-1 min-w-0 w-full">
              {/* 标题行 */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {tool.name}
                </h1>
                {tool.is_official && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200">
                    <Award className="w-3 h-3" />
                    官方认证
                  </span>
                )}
              </div>
              
              {/* 出品方 */}
              <p className="text-slate-500 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-6 sm:w-8 h-px bg-slate-200" />
                {tool.producer}
              </p>
              
              {/* 一句话亮点 */}
              <p className="text-base sm:text-lg text-slate-700 mb-3 sm:mb-4 font-medium">{tool.highlight}</p>
              
              {/* 评分标签 */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-0 sm:mb-5">
                {overallScore ? (
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                    <StarRating value={Math.round(Number(overallScore))} readonly size="sm" />
                    <span className="font-semibold text-slate-800">{overallScore}</span>
                    <span className="text-xs text-slate-400">({reviewsPagination.total}条)</span>
                  </div>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-sm">暂无评分</span>
                )}
              </div>
            </div>
            
            {/* CTA按钮组 - 移动端水平排列 */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <Button
                onClick={handleVisit}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                立即使用
              </Button>
              <Button
                variant="outline"
                onClick={toggleFavorite}
                className={`px-4 py-2.5 sm:py-3 border-2 transition-all ${
                  isFavorited 
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 广告位 */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <ToolDetailAd toolId={tool.id} />
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-8 pb-8">
        {/* 1. 核心功能 - 最重要 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-orange-500" />
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tool.functions && tool.functions.length > 0) ? tool.functions.map((func, i) => (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{func.func_name}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{func.func_desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : [
              { title: '智能处理', desc: '基于先进AI技术，精准理解用户需求，提供高质量处理结果。' },
              { title: '高效便捷', desc: '操作简单直观，响应速度快，大幅提升工作和学习效率。' },
              { title: '多场景适用', desc: '支持多种使用场景，满足学生、职场、创作者等不同人群需求。' },
              { title: '安全可靠', desc: '数据安全有保障，服务稳定可靠，使用过程安全放心。' },
            ].map((func, i) => (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{func.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{func.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. 价格与权益 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            价格与权益
          </h2>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-green-700">免费版</h3>
                  <Badge className="bg-green-500 text-white text-xs">当前使用</Badge>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">¥0</span>
                  <span className="text-sm text-slate-500 ml-1">/永久</span>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {[
                  '无使用次数限制',
                  '核心功能完全开放',
                  '支持多终端使用',
                  tool.commercial_license || '基础结果可商用',
                ].map((right, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {right}
                  </li>
                ))}
              </ul>
              <Button onClick={handleVisit} className="w-full bg-green-500 hover:bg-green-600">
                立即开始使用
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* 3. 适用场景 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            适用场景
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(tool.scenes && tool.scenes.length > 0) ? tool.scenes.map((scene, i) => (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center">
                      {scene.scene_no.replace('#', '')}
                    </span>
                    <span className="text-sm font-medium text-orange-600">{scene.user_group}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{scene.scene_desc}</p>
                </CardContent>
              </Card>
            )) : [
              { no: '1', user_group: '学生/科研人群', scene_desc: '用于学术资料检索、文献整理、课题调研，结构化输出大幅提升效率。' },
              { no: '2', user_group: '职场办公人群', scene_desc: '用于行业调研、竞品分析、文案素材搜集，一键整合核心信息。' },
              { no: '3', user_group: '内容创作人群', scene_desc: '用于素材搜集、信息溯源、多语言查询，支持来源标注保障准确性。' },
            ].map((scene, i) => (
              <Card key={i} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center">
                      {scene.no}
                    </span>
                    <span className="text-sm font-medium text-orange-600">{scene.user_group}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{scene.scene_desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. 关于工具 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            关于{tool.name}
          </h2>
          <Card className="bg-white">
            <CardContent className="p-5">
              <p className="text-slate-600 leading-relaxed">
                {tool.full_desc || `${tool.name}是由${tool.producer}推出的智能工具，${tool.highlight}。平台提供稳定、高效的服务，适用于多种使用场景。`}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 5. 快速上手 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            快速上手
          </h2>
          <Card className="bg-white">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {[
                  { step: '1', title: '进入工具', desc: '点击「立即使用」按钮' },
                  { step: '2', title: '开始使用', desc: '输入需求或选择功能' },
                  { step: '3', title: '获取结果', desc: '等待处理完成' },
                  { step: '4', title: '查看详情', desc: '浏览结果内容' },
                  { step: '5', title: '进阶操作', desc: '使用高级功能' },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm mb-2">
                      {item.step}
                    </div>
                    <h3 className="font-medium text-slate-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Globe2 className="w-4 h-4 text-slate-400" />
                  网页端
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  移动端H5
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  小程序
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. 常见问题 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            常见问题
          </h2>
          <Card className="bg-white">
            <CardContent className="p-4">
              <Accordion type="multiple" className="w-full">
                {(tool.faqs && tool.faqs.length > 0) ? tool.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-slate-700 text-sm py-3">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm pb-3">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                )) : [
                  { question: `${tool.name}是否免费？有没有使用限制？`, answer: `${tool.name}${tool.free_type === '完全免费' ? '基础功能完全免费，无使用次数限制' : `提供${tool.free_quota_desc || '免费额度供用户体验'}`}。` },
                  { question: `如何联系客服或反馈问题？`, answer: `您可以通过官网联系页面提交反馈，或发送邮件至官方邮箱，我们会尽快处理您的问题。` },
                  { question: `结果是否支持商用？`, answer: `关于商用授权，请参阅页面「价格权益」模块的详细说明。` },
                  { question: `支持哪些使用终端？`, answer: `支持网页端、移动端H5、微信小程序等多终端使用，数据同步互通。` },
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-slate-700 text-sm py-3">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm pb-3">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* 7. 用户评价 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            用户评价
          </h2>
          
          {/* 评分概览 */}
          <Card className="bg-white mb-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-1">
                    {overallScore || '-'}
                  </div>
                  {overallScore && <StarRating value={Math.round(Number(overallScore))} readonly size="lg" />}
                  <p className="text-sm text-slate-500 mt-1">{reviewsPagination.total}条评价</p>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  {[
                    { label: '效果', value: ratings?.effect_score },
                    { label: '易用性', value: ratings?.usability_score },
                    { label: '额度', value: ratings?.quota_score },
                    { label: '稳定性', value: ratings?.stability_score },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-lg font-bold text-slate-700">{item.value || '-'}</p>
                      <p className="text-xs text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 发表评价 */}
          <Card className="bg-white mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-800 mb-3">发表评价</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: 'effect_score', label: '效果' },
                    { key: 'usability_score', label: '易用性' },
                    { key: 'quota_score', label: '额度' },
                    { key: 'stability_score', label: '稳定性' },
                  ].map((item) => (
                    <div key={item.key} className="flex flex-col items-center">
                      <span className="text-xs text-slate-500 mb-1">{item.label}</span>
                      <StarRating
                        value={newRating[item.key as keyof typeof newRating]}
                        onChange={(v) => setNewRating(prev => ({ ...prev, [item.key]: v }))}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
                <Textarea
                  placeholder="分享你的使用体验... (10-500字)"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <Button
                  onClick={submitReview}
                  disabled={submitting || newReview.length < 10}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {submitting ? '提交中...' : '发表评论'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 评论列表 */}
          <Card className="bg-white">
            <CardContent className="p-5">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                          {review.user_id.slice(-2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700 text-sm">
                              用户_{review.user_id.slice(-4)}
                            </span>
                            {review.user_ratings && (
                              <StarRating value={Number(review.user_ratings.overall_score)} readonly size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 pl-11">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>暂无评价，期待你的分享</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* 底部运营区 */}
      <div className="bg-slate-100 border-t border-slate-200 py-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* 同类推荐 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-500" />
              相关推荐
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Perplexity', score: '4.6', tags: 'AI搜索', desc: 'AI驱动的答案引擎' },
                { name: 'Phind', score: '4.4', tags: '开发者搜索', desc: '开发者专属工具' },
                { name: 'You.com', score: '4.3', tags: 'AI助手', desc: '智能助手搜索' },
                { name: 'Andi', score: '4.2', tags: '可视化搜索', desc: '新一代搜索引擎' },
              ].map((item) => (
                <Link key={item.name} href={`/tools/${tool.id + 1}`}>
                  <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                          {item.name[0]}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 text-sm">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-slate-500">{item.score}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{item.desc}</p>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">{item.tags}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* 分享 */}
          <section>
            <Card className="bg-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-800 mb-3">分享与嵌入</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleShare} className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    复制链接
                  </Button>
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`<a href="/tools/${tool.id}" target="_blank">${tool.name}</a>`}
                      className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                    />
                    <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                      {copiedEmbed ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        {/* 公众号推广 */}
        <WechatPromo />
        
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/oneclaw-logo.png" alt="OneClaw" width={24} height={24} className="object-contain" />
              <span className="font-bold text-slate-700">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
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
