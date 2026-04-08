'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ExternalLink, Star, Heart, Check, X, MessageSquare, ThumbsUp,
  ChevronLeft, Share2, Copy, Clock, Shield, Zap, Video, Users,
  Calendar, Globe, Award, TrendingUp, BarChart3, Bookmark, BookOpen,
  HelpCircle, ArrowRight, Sparkles, Wand2, Layers, Settings, Eye,
  Search, Filter, Menu, Phone, Mail, Link2, ChevronDown,
  Globe2, Smartphone, Laptop, FileText, Download, Code, Share,
  BarChart, PieChart, MapPin, User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

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
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

// 星级评分组件
function StarRating({ value, onChange, readonly = false, size = 'md' }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
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
            className={`${sizeClass} ${star <= value ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

// 数据卡片组件
function DataCard({ icon: Icon, label, value, unit }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
      <Icon className="w-5 h-5 text-white/80 mb-2" />
      <p className="text-xl font-bold text-white">{value}{unit}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

// 功能卡片组件
function FunctionCard({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

// 场景卡片组件
function SceneCard({ no, userGroup, description }: {
  no: string;
  userGroup: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-orange-300 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
          {no}
        </span>
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{userGroup}</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

// 主页面组件
export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
      setIsScrolled(window.scrollY > 300);
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

  const handleVisit = () => {
    if (!tool) return;
    const url = tool.promotion_url || tool.official_url;
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const overallScore = ratings?.overall_score || tool.rating_stats?.total_score || '4.5';
  const featureTags = tool.feature_tags || [];
  const capabilityTags = featureTags.slice(0, 4);
  const attributeTags = featureTags.slice(4, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 - 吸顶 */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-700' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-2 ${isScrolled ? 'text-slate-800 dark:text-white' : 'text-white'}`}>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">返回首页</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className={isScrolled ? '' : 'text-white hover:bg-white/20'}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFavorite}
                className={isScrolled ? '' : 'text-white hover:bg-white/20'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero区域 */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Logo */}
            <div className="w-32 h-32 rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={tool.logo}
                alt={tool.name}
                className="w-28 h-28 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect fill="%23f97316" width="128" height="128" rx="24"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="56" font-weight="bold">${tool.name[0]}</text></svg>`;
                }}
              />
            </div>
            
            {/* 工具信息 */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold">{tool.name}</h1>
                {tool.is_official && (
                  <Badge className="bg-blue-500 text-white">官方认证</Badge>
                )}
                {tool.is_featured && (
                  <Badge className="bg-yellow-500 text-white">精选</Badge>
                )}
              </div>
              
              {/* 综合评分 */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <div className="relative">
                  <div 
                    className="flex items-center gap-1 cursor-pointer"
                    onMouseEnter={() => setShowRatingDetail(true)}
                    onMouseLeave={() => setShowRatingDetail(false)}
                  >
                    <StarRating value={Math.round(Number(overallScore))} readonly size="lg" />
                    <span className="text-2xl font-bold ml-2">{overallScore}</span>
                  </div>
                  {showRatingDetail && (
                    <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-xl text-slate-800 z-10 min-w-[200px]">
                      <div className="text-sm font-medium mb-2">评分详情</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">搜索准确性</span>
                          <StarRating value={4} readonly size="sm" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">易用性</span>
                          <StarRating value={4} readonly size="sm" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">无广告体验</span>
                          <StarRating value={5} readonly size="sm" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">功能实用性</span>
                          <StarRating value={4} readonly size="sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-white/60 text-sm">({reviewsPagination.total}条评价)</span>
              </div>
              
              <p className="text-lg text-white/80 mb-4">{tool.highlight}</p>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                {capabilityTags.map((tag, i) => (
                  <Link 
                    key={i} 
                    href={`/?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {attributeTags.map((tag, i) => (
                  <Link 
                    key={i} 
                    href={`/?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* CTA按钮 */}
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <Button
                onClick={handleVisit}
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                立即免费使用
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(tool.official_url, '_blank')}
                className="border-white text-white hover:bg-white/20 font-medium px-8"
              >
                <Globe className="w-4 h-4 mr-2" />
                查看官方官网
              </Button>
            </div>
          </div>
          
          {/* 核心数据卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <DataCard icon={Users} label="累计用户" value="100万+" />
            <DataCard icon={Search} label="月搜索请求" value="5000万+" />
            <DataCard icon={Calendar} label="上线时间" value={tool.launch_date ? new Date(tool.launch_date).toLocaleDateString('zh-CN') : '2026-04-04'} />
            <DataCard icon={Zap} label="免费额度" value="无限制" />
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-[52px] z-40">
        <div className="max-w-6xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto bg-transparent p-0">
              <TabsTrigger 
                value="detail" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-3 text-slate-600 dark:text-slate-300"
              >
                工具详情
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-3 text-slate-600 dark:text-slate-300"
              >
                功能详解
              </TabsTrigger>
              <TabsTrigger 
                value="pricing" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-3 text-slate-600 dark:text-slate-300"
              >
                价格权益
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-3 text-slate-600 dark:text-slate-300"
              >
                用户评价
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none px-4 py-3 text-slate-600 dark:text-slate-300"
              >
                数据洞察
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab1: 工具详情 */}
        {activeTab === 'detail' && (
          <div className="space-y-10">
            {/* 核心定义 */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                什么是{tool.name}
              </h2>
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {tool.full_desc || `${tool.name}是由${tool.producer}研发推出的新一代人工智能工具，专注于为用户提供高效、精准的智能服务。工具基于先进的大语言模型技术，旨在解决传统方案的痛点，以用户友好的方式打造优质产品体验。适用人群广泛，包括学生、科研人员、职场办公人群、内容创作者等。`}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* 使用指南 */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                如何使用{tool.name}
              </h2>
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* 使用步骤 */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[
                        { step: '1', title: '进入工具', desc: '点击页面「立即免费使用」按钮' },
                        { step: '2', title: '开始使用', desc: '输入需求，支持多语言提问' },
                        { step: '3', title: '获取结果', desc: '等待处理，获得精准答案' },
                        { step: '4', title: '查看详情', desc: '查看信息来源，支持复制' },
                        { step: '5', title: '进阶功能', desc: '使用导出、多轮追问等功能' },
                      ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold mb-2">
                            {item.step}
                          </div>
                          <h3 className="font-medium text-slate-800 dark:text-white text-sm mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* 支持终端 */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h3 className="font-medium text-slate-800 dark:text-white mb-3">支持的终端</h3>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { icon: Globe2, label: '网页端' },
                          { icon: Smartphone, label: '移动端H5' },
                          { icon: Phone, label: '微信小程序' },
                        ].map((terminal) => (
                          <div key={terminal.label} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                            <terminal.icon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{terminal.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 核心使用场景 */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-orange-500" />
                核心使用场景
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(tool.scenes && tool.scenes.length > 0) ? tool.scenes.map((scene, i) => (
                  <SceneCard key={i} no={scene.scene_no} userGroup={scene.user_group} description={scene.scene_desc} />
                )) : [
                  { no: '#1', user_group: '学生/科研人群', scene_desc: '用于学术论文资料检索、文献核心观点梳理、课题背景调研，结构化输出大幅提升资料整理效率。' },
                  { no: '#2', user_group: '职场办公人群', scene_desc: '用于行业报告数据检索、竞品信息调研、办公文案素材搜集，一键整合核心信息，省去筛选时间。' },
                  { no: '#3', user_group: '内容创作人群', scene_desc: '用于写作素材搜集、热点事件信息溯源、多语言内容资料查询，支持信息来源溯源，保障内容准确性。' },
                ].map((scene, i) => (
                  <SceneCard key={i} no={scene.no} userGroup={scene.user_group} description={scene.scene_desc} />
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-orange-500" />
                常见问题
              </h2>
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <Accordion type="multiple" className="w-full">
                    {(tool.faqs && tool.faqs.length > 0) ? tool.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-white">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    )) : [
                      { question: `${tool.name}是否完全免费？有没有使用次数限制？`, answer: `${tool.name}基础功能完全免费，无单日/单月使用次数限制，所有用户均可无障碍使用。` },
                      { question: `${tool.name}的信息来源是什么？如何保障结果的准确性？`, answer: `${tool.name}基于全网合规公开信息进行检索，所有结果均标注信息来源，通过自研大模型进行信息交叉验证与虚假信息过滤。` },
                      { question: `${tool.name}支持哪些终端使用？是否有APP/小程序？`, answer: `目前${tool.name}支持网页端、微信小程序、移动端H5多终端使用，数据可同步，全终端均免费。` },
                      { question: `搜索结果是否可以商用？商用授权的边界是什么？`, answer: `${tool.name}的基础搜索结果可免费商用，商用过程中请遵守相关法律法规，尊重原内容的知识产权。` },
                      { question: `如何反馈问题或提交功能建议？`, answer: `您可以通过页面的「反馈入口」提交相关问题与建议，或通过官方客服邮箱联系我们，我们会在1-3个工作日内给您回复。` },
                    ].map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-white">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Tab2: 功能详解 */}
        {activeTab === 'features' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-orange-500" />
                核心功能详解
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(tool.functions && tool.functions.length > 0) ? tool.functions.map((func, i) => (
                  <FunctionCard 
                    key={i} 
                    icon={func.func_icon === 'search' ? Search : func.func_icon === 'filter' ? Filter : func.func_icon === 'globe' ? Globe : Wand2}
                    title={func.func_name} 
                    description={func.func_desc} 
                  />
                )) : [
                  { icon: Search, title: 'AI智能检索', desc: '基于自研大模型精准理解用户自然语言问题，实现全网深度信息爬取与无效信息过滤，精准匹配用户核心检索需求。' },
                  { icon: Layers, title: '结构化答案输出', desc: '自动梳理海量检索信息，以分点、表格等清晰层级输出核心结论与数据来源，省去用户手动整理信息的时间。' },
                  { icon: Globe, title: '多语言搜索支持', desc: '覆盖中文、英文、日文等主流语言，支持跨语言检索与内容自动翻译，满足跨境资料查询等多元需求。' },
                  { icon: Shield, title: '无广告纯净体验', desc: '全程无弹窗广告、无竞价排名广告、无信息流广告干扰，打造纯净的检索环境，让用户专注于信息获取。' },
                  { icon: FileText, title: '信息来源溯源', desc: '所有结果均标注信息来源，支持一键跳转原始页面，保障内容的权威性与可追溯性。' },
                  { icon: Download, title: '结果导出功能', desc: '支持将搜索结果导出为多种格式，方便用户整理、分享和后续查阅。' },
                ].map((func, i) => (
                  <FunctionCard key={i} icon={func.icon} title={func.title} description={func.desc} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab3: 价格权益 */}
        {activeTab === 'pricing' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-500" />
                价格与权益说明
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 免费版 */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-green-700 dark:text-green-300">免费版</h3>
                      <Badge className="bg-green-500 text-white">当前使用</Badge>
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                      0元<span className="text-sm font-normal text-slate-500">/永久</span>
                    </div>
                    <ul className="space-y-3">
                      {[
                        '无单日/单月使用次数限制',
                        '所有核心功能完全开放',
                        '无广告纯净使用体验',
                        '支持结构化答案输出',
                        '支持多语言搜索功能',
                        '搜索结果可免费商用',
                      ].map((right, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {right}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={handleVisit} 
                      className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white"
                    >
                      立即使用
                    </Button>
                  </CardContent>
                </Card>

                {/* 商用授权 */}
                <Card className="bg-white dark:bg-slate-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">商用授权说明</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="font-medium text-slate-800 dark:text-white mb-2">免费商用范围</div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {tool.commercial_license || '基础使用结果可免费商用，需遵守相关法律法规，尊重原内容知识产权。'}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="font-medium text-orange-700 dark:text-orange-300 mb-2">禁止场景</div>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            用于违法违规、虚假宣传等场景
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            未经授权转载受版权保护的内容
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}

        {/* Tab4: 用户评价 */}
        {activeTab === 'reviews' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-500" />
                用户评价
              </h2>
              
              {/* 评分概览 */}
              <Card className="bg-white dark:bg-slate-800 mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-orange-500 mb-2">{overallScore}</div>
                      <StarRating value={Math.round(Number(overallScore))} readonly />
                      <p className="text-sm text-slate-500 mt-1">{reviewsPagination.total}条评价</p>
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: '效果', value: ratings?.effect_score || 4 },
                        { label: '易用性', value: ratings?.usability_score || 4 },
                        { label: '额度', value: ratings?.quota_score || 4 },
                        { label: '稳定性', value: ratings?.stability_score || 4 },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-xl font-bold text-slate-800 dark:text-white">{item.value}</p>
                          <p className="text-xs text-slate-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 提交评论 */}
              <Card className="bg-white dark:bg-slate-800 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">发表评价</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'effect_score', label: '效果' },
                        { key: 'usability_score', label: '易用性' },
                        { key: 'quota_score', label: '额度' },
                        { key: 'stability_score', label: '稳定性' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                          <StarRating
                            value={newRating[item.key as keyof typeof newRating]}
                            onChange={(v) => setNewRating(prev => ({ ...prev, [item.key]: v }))}
                          />
                        </div>
                      ))}
                    </div>
                    <Textarea
                      placeholder="分享你的使用体验... (10-500字)"
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={submitReview}
                      disabled={submitting || Object.values(newRating).some(v => v === 0) || newReview.length < 10}
                      className="bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      {submitting ? '提交中...' : '发表评论'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 评论列表 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-medium">
                              {review.user_id.slice(-2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800 dark:text-white">
                                  用户_{review.user_id.slice(-4)}
                                </span>
                                {review.user_ratings && (
                                  <StarRating value={Number(review.user_ratings.overall_score)} readonly size="sm" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {new Date(review.created_at).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-500">
                              <ThumbsUp className="w-3 h-3" />
                              {review.likes}
                            </button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm pl-13">{review.content}</p>
                          {review.official_reply && (
                            <div className="mt-2 pl-13 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">官方回复</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{review.official_reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      暂无评论，快来抢沙发吧~
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Tab5: 数据洞察 */}
        {activeTab === 'insights' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-orange-500" />
                数据洞察
              </h2>
              
              {/* 核心数据 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Users, label: '月活跃用户', value: '100万+', color: 'from-orange-500 to-red-500' },
                  { icon: Search, label: '月搜索请求', value: '5000万+', color: 'from-blue-500 to-cyan-500' },
                  { icon: Clock, label: '平均使用时长', value: '2.5', unit: '分钟', color: 'from-green-500 to-emerald-500' },
                  { icon: Globe, label: '服务国家/地区', value: '50+', color: 'from-purple-500 to-pink-500' },
                ].map((item) => (
                  <Card key={item.label} className="bg-white dark:bg-slate-800 overflow-hidden">
                    <CardContent className="p-4 relative">
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`} />
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}{item.unit}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 用户分布 */}
              <Card className="bg-white dark:bg-slate-800 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    用户地域分布
                  </h3>
                  <div className="space-y-3">
                    {[
                      { region: '中国', percent: 65 },
                      { region: '美国', percent: 15 },
                      { region: '日本', percent: 8 },
                      { region: '其他', percent: 12 },
                    ].map((item) => (
                      <div key={item.region} className="flex items-center gap-3">
                        <span className="w-16 text-sm text-slate-600 dark:text-slate-300">{item.region}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-slate-600 dark:text-slate-300 text-right">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 热门关键词 */}
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    热门搜索关键词
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'AI搜索', '无广告搜索', '学术搜索', '论文检索', 
                      '多语言搜索', '结构化答案', '竞品分析', '行业报告',
                      '素材搜集', '内容创作'
                    ].map((keyword, i) => (
                      <span 
                        key={keyword}
                        className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>

      {/* 底部运营区 */}
      <div className="bg-slate-100 dark:bg-slate-800/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* 同类推荐 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-orange-500" />
              同类AI工具推荐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'Perplexity', score: '4.6', tags: 'AI搜索,多语言', desc: 'AI驱动的答案引擎' },
                { name: 'Phind', score: '4.4', tags: '开发者搜索,代码', desc: '开发者专属AI搜索' },
                { name: 'You.com', score: '4.3', tags: 'AI助手,效率', desc: 'AI助手与搜索引擎' },
                { name: 'Andi', score: '4.2', tags: 'AI搜索,可视化', desc: '可视化AI搜索引擎' },
              ].map((item) => (
                <Link key={item.name} href={`/tools/${tool.id + 1}`}>
                  <Card className="bg-white dark:bg-slate-800 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {item.name[0]}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 dark:text-white">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <span className="text-xs text-slate-500">{item.score}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.split(',').map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* 分享与嵌入 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Share className="w-6 h-6 text-orange-500" />
              分享与嵌入
            </h2>
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 分享 */}
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white mb-3">分享到</h3>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        复制链接
                      </Button>
                    </div>
                  </div>
                  {/* 嵌入 */}
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white mb-3">嵌入代码</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={`<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/tools/${tool.id}" target="_blank">${tool.name} - OneClaw</a>`}
                        className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300"
                      />
                      <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                        {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/lobster-logo.png" alt="OneClaw" width={28} height={28} className="object-contain" />
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
