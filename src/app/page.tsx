'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, Video, Search, Film, Wand2, Palette, Music, 
  Mic, Users, ChevronRight, Sparkles, Star, X, Check,
  ChevronLeft, ChevronRight as ChevronRightIcon, Heart, MessageSquare,
  ThumbsUp, History, User, Flame, Gift, Trophy, ArrowLeftRight, Crown
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import { SkeletonGrid } from '@/components/LobsterSkeleton';
import CompareBar, { getCompareTools, saveCompareTools, type CompareTool } from '@/components/CompareBar';
import SponsorBadge, { isSponsorActive } from '@/components/SponsorBadge';
import AdBanner from '@/components/AdBanner';
import Link from 'next/link';

// 类型定义
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  type: string;
}

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  feature_tags: string[];
  official_url: string;
  promotion_url: string | null;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  max_duration: string;
  free_quota_desc: string | null;
  sponsor_type: string | null;
  sponsor_expires_at: string | null;
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

// 分类图标
const CATEGORY_ICONS: Record<string, typeof Video> = {
  'video-generation': Wand2,
  'digital-human': Users,
  'video-editing': Film,
  'ai-dubbing': Mic,
  'anime-creation': Palette,
};

// 获取或创建用户ID
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

export default function HomePage() {
  // 状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureTags, setFeatureTags] = useState<Tag[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreeTypes, setSelectedFreeTypes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // 详情弹窗
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
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

  // 对比状态
  const [compareTools, setCompareTools] = useState<CompareTool[]>([]);
  const [isMember, setIsMember] = useState(false);
  const maxCompare = isMember ? 3 : 2;

  // 初始化用户ID和会员状态
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // 加载对比工具
    setCompareTools(getCompareTools());
    // 监听对比变化
    const handleCompareChange = () => setCompareTools(getCompareTools());
    window.addEventListener('compareToolsChanged', handleCompareChange);
    
    // 检查会员状态
    const checkMemberStatus = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/members?user_id=${id}`);
          const data = await res.json();
          if (data.success && data.data?.is_active) {
            setIsMember(true);
          }
        } catch (error) {
          console.error('检查会员状态失败:', error);
        }
      }
    };
    checkMemberStatus();
    
    return () => window.removeEventListener('compareToolsChanged', handleCompareChange);
  }, []);

  // 切换对比
  const toggleCompare = (tool: Tool, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isSelected = compareTools.some(t => t.id === tool.id);
    
    if (isSelected) {
      // 移除
      const newTools = compareTools.filter(t => t.id !== tool.id);
      saveCompareTools(newTools);
      setCompareTools(newTools);
    } else {
      // 添加
      if (compareTools.length >= maxCompare) {
        return; // 已达上限
      }
      if (compareTools.length > 0 && compareTools[0].category_id !== tool.category_id) {
        return; // 不同分类
      }
      
      const newTool: CompareTool = {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        category_id: tool.category_id,
        category_name: tool.categories?.name || '',
      };
      
      const newTools = [...compareTools, newTool];
      saveCompareTools(newTools);
      setCompareTools(newTools);
    }
  };

  // 检查是否可对比
  const canCompare = (tool: Tool): { canAdd: boolean; reason: string } => {
    const isSelected = compareTools.some(t => t.id === tool.id);
    if (isSelected) return { canAdd: true, reason: '' };
    
    if (compareTools.length >= maxCompare) {
      return { canAdd: false, reason: '已达上限' };
    }
    if (compareTools.length > 0 && compareTools[0].category_id !== tool.category_id) {
      return { canAdd: false, reason: '需同分类' };
    }
    
    return { canAdd: true, reason: '' };
  };

  // 从对比列表移除
  const removeFromCompare = (toolId: number) => {
    const newTools = compareTools.filter(t => t.id !== toolId);
    saveCompareTools(newTools);
    setCompareTools(newTools);
  };

  // 清空对比列表
  const clearCompare = () => {
    saveCompareTools([]);
    setCompareTools([]);
  };

  // 获取分类
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  // 获取标签
  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags?type=feature');
      const data = await res.json();
      if (data.success) {
        setFeatureTags(data.data);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  // 获取工具列表
  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      
      if (activeCategory !== 'all') {
        params.set('category', activeCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      if (selectedFreeTypes.length > 0) {
        params.set('free_types', selectedFreeTypes.join(','));
      }
      if (selectedFeatures.length > 0) {
        params.set('features', selectedFeatures.join(','));
      }

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTools(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, activeCategory, searchQuery, selectedFreeTypes, selectedFeatures]);

  // 获取工具评分和评论
  const fetchToolRatingsAndReviews = async (toolId: number) => {
    try {
      // 获取评分统计
      const ratingRes = await fetch(`/api/ratings?tool_id=${toolId}&user_id=${userId}`);
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
      const reviewsRes = await fetch(`/api/reviews?tool_id=${toolId}&page=1&limit=5`);
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) {
        setReviews(reviewsData.data);
        setReviewsPagination(reviewsData.pagination);
      }

      // 检查是否收藏
      const favRes = await fetch(`/api/favorites?tool_id=${toolId}&check_user_id=${userId}`);
      const favData = await favRes.json();
      if (favData.success) {
        setIsFavorited(favData.data.is_favorited);
      }
    } catch (error) {
      console.error('获取工具数据失败:', error);
    }
  };

  // 初始化
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // 筛选变化时重新获取
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTools();
  }, [activeCategory, selectedFreeTypes, selectedFeatures]);

  // 搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 分页变化
  useEffect(() => {
    fetchTools();
  }, [pagination.page]);

  // 切换筛选
  const toggleFilter = (type: 'freeType' | 'feature', value: string) => {
    if (type === 'freeType') {
      setSelectedFreeTypes(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else {
      setSelectedFeatures(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    }
  };

  // 清除筛选
  const clearFilters = () => {
    setSelectedFreeTypes([]);
    setSelectedFeatures([]);
    setSearchQuery('');
    setActiveCategory('all');
  };

  // 打开详情
  const openDetail = async (tool: Tool) => {
    setSelectedTool(tool);
    setDetailOpen(true);
    
    // 记录浏览历史
    if (userId) {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tool_id: tool.id })
      });
    }
    
    // 获取评分和评论
    await fetchToolRatingsAndReviews(tool.id);
  };

  // 获取跳转链接
  const getRedirectUrl = (tool: Tool) => {
    return tool.promotion_url || tool.official_url;
  };

  // 收藏/取消收藏
  const toggleFavorite = async () => {
    if (!userId || !selectedTool) return;
    
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?user_id=${userId}&tool_id=${selectedTool.id}`, {
          method: 'DELETE'
        });
        setIsFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, tool_id: selectedTool.id })
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  // 提交评分
  const submitRating = async () => {
    if (!userId || !selectedTool) return;
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
          tool_id: selectedTool.id,
          ...newRating
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchToolRatingsAndReviews(selectedTool.id);
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
    if (!userId || !selectedTool) return;
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
          tool_id: selectedTool.id,
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

  const hasFilters = selectedFreeTypes.length > 0 || selectedFeatures.length > 0 || searchQuery;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI视频工具导航</p>
              </div>
            </Link>

            {/* 搜索框 */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索AI视频工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 bg-slate-100 dark:bg-slate-700 border-0 focus-visible:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Video className="w-4 h-4" />
                <span>共 {pagination.total} 款工具</span>
              </div>
              <Link href="/compare">
                <Button variant="ghost" size="sm" className="gap-1 hidden lg:flex">
                  <ArrowLeftRight className="w-4 h-4" />
                  对比
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">资源</span>
                </Button>
              </Link>
              <Link href="/workspace">
                <Button variant="outline" size="sm" className="gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">工作台</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 分类导航 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            全部
          </button>
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] || Video;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 榜单入口 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/rankings?type=hot" className="group">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800/50 hover:border-orange-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">热门榜单</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">TOP 10</p>
              </div>
            </div>
          </Link>
          <Link href="/rankings?type=free" className="group">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50 hover:border-green-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">免费神器</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">省钱必备</p>
              </div>
            </div>
          </Link>
          <Link href="/rankings?type=new" className="group">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50 hover:border-purple-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">新品上线</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">抢先体验</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 筛选区 */}
        <div className="mb-6 space-y-4">
          {/* 免费类型 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">免费类型</h3>
            <div className="flex flex-wrap gap-2">
              {['完全免费', '免费额度', '限时免费', '付费工具'].map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilter('freeType', type)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFreeTypes.includes(type)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 功能标签 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">核心功能</h3>
            <div className="flex flex-wrap gap-2">
              {featureTags.slice(0, 8).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleFilter('feature', tag.name)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFeatures.includes(tag.name)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 清除筛选 */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>

        {/* 推荐工具区域 */}
        {!hasFilters && activeCategory === 'all' && tools.filter(t => t.is_featured).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                编辑精选
              </h2>
              <Link href="/rankings?type=hot" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                查看更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tools.filter(t => t.is_featured).slice(0, 4).map(tool => (
                <Card
                  key={tool.id}
                  className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => openDetail(tool)}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-2 shadow-sm">
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23f97316" width="48" height="48"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${tool.name[0]}</text></svg>`;
                          }}
                        />
                      </div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-1">{tool.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{tool.highlight}</p>
                      <span className={`mt-2 text-xs px-2 py-0.5 rounded-full ${FREE_TYPE_COLORS[tool.free_type]}`}>
                        {tool.free_type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 工具列表 */}
        {/* 首页横幅广告 */}
        <AdBanner position="home_banner" className="mb-6" />
        
        {loading ? (
          <SkeletonGrid count={8} />
        ) : tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map(tool => {
                const isCompareSelected = compareTools.some(t => t.id === tool.id);
                const { canAdd, reason } = canCompare(tool);
                
                return (
                  <Card
                    key={tool.id}
                    className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => openDetail(tool)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                {tool.name}
                              </h3>
                              {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                                <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                              )}
                              {tool.is_featured && !tool.sponsor_type && (
                                <Star className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            {/* 对比按钮 */}
                            <Button
                              variant={isCompareSelected ? 'default' : 'outline'}
                              size="sm"
                              className={`h-7 text-xs gap-1 flex-shrink-0 ${
                                isCompareSelected 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                  : !canAdd && !isCompareSelected
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                              }`}
                              disabled={!canAdd && !isCompareSelected}
                              onClick={(e) => toggleCompare(tool, e)}
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              {isCompareSelected ? '已选' : reason || '对比'}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                            {tool.highlight}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${FREE_TYPE_COLORS[tool.free_type]}`}>
                              {tool.free_type}
                            </span>
                            {tool.feature_tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 分页 */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无符合条件的工具</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">试试更换筛选条件</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              清除筛选
            </Button>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">功能导航</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/rankings" className="hover:text-orange-500">榜单中心</Link></li>
                <li><Link href="/resources" className="hover:text-orange-500">资源中心</Link></li>
                <li><Link href="/compare" className="hover:text-orange-500">工具对比</Link></li>
                <li><Link href="/workspace" className="hover:text-orange-500">我的工作台</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">工具分类</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/?category=video-generation" className="hover:text-orange-500">视频生成</Link></li>
                <li><Link href="/?category=digital-human" className="hover:text-orange-500">数字人</Link></li>
                <li><Link href="/?category=video-editing" className="hover:text-orange-500">视频编辑</Link></li>
                <li><Link href="/?category=ai-dubbing" className="hover:text-orange-500">AI配音</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">关于我们</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><span className="hover:text-orange-500 cursor-pointer">关于OneClaw</span></li>
                <li><span className="hover:text-orange-500 cursor-pointer">收录标准</span></li>
                <li><span className="hover:text-orange-500 cursor-pointer">商务合作</span></li>
                <li><span className="hover:text-orange-500 cursor-pointer">联系我们</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">联系方式</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>邮箱: 1017760688@qq.com</li>
                <li>域名: oneclaw.shop</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AnimatedLobster size={24} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                © 2024 OneClaw. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="hover:text-orange-500 cursor-pointer">用户协议</span>
              <span className="hover:text-orange-500 cursor-pointer">隐私政策</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 对比栏 */}
      <CompareBar />

      {/* 工具详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedTool.logo}
                    alt={selectedTool.name}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-100 dark:bg-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect fill="%23f97316" width="56" height="56"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${selectedTool.name[0]}</text></svg>`;
                    }}
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedTool.name}
                      <button onClick={toggleFavorite} className="ml-2">
                        <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
                      </button>
                    </DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTool.producer}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 核心亮点 */}
                <p className="text-slate-600 dark:text-slate-300">{selectedTool.highlight}</p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${FREE_TYPE_COLORS[selectedTool.free_type]}`}>
                    {selectedTool.free_type}
                  </span>
                  {selectedTool.feature_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 免费额度说明 */}
                {selectedTool.free_quota_desc && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💰 {selectedTool.free_quota_desc}
                    </p>
                  </div>
                )}

                {/* 核心优势 */}
                {selectedTool.advantages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">核心优势</h4>
                    <ul className="space-y-1">
                      {selectedTool.advantages.map((adv, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500" />
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 局限性 */}
                {selectedTool.limitations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">局限性</h4>
                    <ul className="space-y-1">
                      {selectedTool.limitations.map((lim, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <X className="w-4 h-4 text-red-500" />
                          {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 其他信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">生成时长：</span>
                    <span className="text-slate-700 dark:text-slate-200">{selectedTool.max_duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">商用授权：</span>
                    <span className="text-slate-700 dark:text-slate-200">{selectedTool.commercial_license}</span>
                  </div>
                </div>

                {/* 评分统计 */}
                {ratingStats.count > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100">用户评分</h4>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_overall}</span>
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

                {/* 评分和评论区域 */}
                <Tabs defaultValue="rating" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rating">评分</TabsTrigger>
                    <TabsTrigger value="reviews">评论 ({reviewsPagination.total})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="rating" className="mt-4">
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

                  <TabsContent value="reviews" className="mt-4">
                    <div className="space-y-4">
                      {/* 评论输入 */}
                      <div>
                        <Textarea
                          placeholder="分享您对这个工具的使用体验（10-500字）..."
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-500">{newReview.length}/500</span>
                          <Button 
                            size="sm" 
                            onClick={submitReview}
                            disabled={submitting || newReview.length < 10 || newReview.length > 500}
                          >
                            {submitting ? '提交中...' : '发布评论'}
                          </Button>
                        </div>
                      </div>

                      {/* 评论列表 */}
                      {reviews.length > 0 ? (
                        <div className="space-y-3">
                          {reviews.map(review => (
                            <div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-medium">
                                  {review.user_id.slice(-2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    用户{review.user_id.slice(-4)}
                                  </span>
                                  {review.user_ratings && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                      <span className="text-xs text-slate-500">{review.user_ratings.overall_score}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{review.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                <button className="flex items-center gap-1 hover:text-orange-500">
                                  <ThumbsUp className="w-3 h-3" />
                                  {review.likes}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-slate-500 py-4">暂无评论，来抢沙发吧！</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => {
                      window.open(getRedirectUrl(selectedTool), '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    官网直达
                  </Button>
                  <Link href={`/tools/${selectedTool.id}`} target="_blank">
                    <Button variant="outline">
                      查看详情页
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
