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
import { 
  ExternalLink, Video, Search, Film, Wand2, Palette, Music, 
  Mic, Users, ChevronRight, Sparkles, Star, X, Check,
  ChevronLeft, ChevronRight as ChevronRightIcon, Heart, MessageSquare,
  ThumbsUp, Flame, Gift, BookOpen, Lightbulb, Copy, Eye
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import { SkeletonGrid } from '@/components/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/SponsorBadge';
import AdBanner from '@/components/AdBanner';
import UserButton from '@/components/UserButton';
import Link from 'next/link';

// ==================== 类型定义 ====================
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

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  uses: number;
  likes: number;
}

interface Tutorial {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  cover_image: string;
  author: string;
  views: number;
  likes: number;
  created_at: string;
}

// ==================== 常量 ====================
const FREE_TYPE_COLORS: Record<string, string> = {
  '完全免费': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '免费额度': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '限时免费': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '付费工具': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const CATEGORY_ICONS: Record<string, typeof Video> = {
  'video-generation': Wand2,
  'digital-human': Users,
  'video-editing': Film,
  'ai-dubbing': Mic,
  'anime-creation': Palette,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};

const MAIN_TABS = [
  { key: 'tools', label: '工具导航', icon: Video },
  { key: 'prompts', label: '提示词库', icon: Lightbulb },
  { key: 'tutorials', label: '教程库', icon: BookOpen },
] as const;

type MainTab = typeof MAIN_TABS[number]['key'];

// ==================== 工具函数 ====================
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('oneclaw_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('oneclaw_user_id', userId);
  }
  return userId;
};

// ==================== 星级评分组件 ====================
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
          <Star className={`w-5 h-5 ${star <= value ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
        </button>
      ))}
    </div>
  );
}

// ==================== 主组件 ====================
export default function HomePage() {
  // 主Tab状态
  const [mainTab, setMainTab] = useState<MainTab>('tools');

  // ==================== 工具导航状态 ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureTags, setFeatureTags] = useState<Tag[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolsPagination, setToolsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
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

  // ==================== 提示词库状态 ====================
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsPagination, setPromptsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [promptCategory, setPromptCategory] = useState('全部');
  const [promptSearch, setPromptSearch] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  // ==================== 教程库状态 ====================
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [tutorialsPagination, setTutorialsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [tutorialCategory, setTutorialCategory] = useState('全部');
  const [tutorialSearch, setTutorialSearch] = useState('');

  // 分类选项
  const PROMPT_CATEGORIES = ['全部', '角色扮演', '场景描述', '风格迁移', '人物生成', '特效制作'];
  const TUTORIAL_CATEGORIES = ['全部', '入门教程', '进阶技巧', '案例分享', 'API对接'];

  // ==================== 初始化 ====================
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // ==================== 工具相关方法 ====================
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags?type=feature');
      const data = await res.json();
      if (data.success) setFeatureTags(data.data);
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  const fetchTools = useCallback(async () => {
    setToolsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', toolsPagination.page.toString());
      params.set('limit', '20');
      
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedFreeTypes.length > 0) params.set('free_types', selectedFreeTypes.join(','));
      if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(','));

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTools(data.data);
        setToolsPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setToolsLoading(false);
    }
  }, [toolsPagination.page, activeCategory, searchQuery, selectedFreeTypes, selectedFeatures]);

  const fetchToolRatingsAndReviews = async (toolId: number) => {
    try {
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

      const reviewsRes = await fetch(`/api/reviews?tool_id=${toolId}&page=1&limit=5`);
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) {
        setReviews(reviewsData.data);
        setReviewsPagination(reviewsData.pagination);
      }

      const favRes = await fetch(`/api/favorites?tool_id=${toolId}&check_user_id=${userId}`);
      const favData = await favRes.json();
      if (favData.success) setIsFavorited(favData.data.is_favorited);
    } catch (error) {
      console.error('获取工具数据失败:', error);
    }
  };

  useEffect(() => {
    if (mainTab === 'tools') {
      setToolsPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }
  }, [activeCategory, selectedFreeTypes, selectedFeatures]);

  useEffect(() => {
    if (mainTab === 'tools') {
      const timer = setTimeout(() => {
        setToolsPagination(prev => ({ ...prev, page: 1 }));
        fetchTools();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [toolsPagination.page]);

  // ==================== 提示词相关方法 ====================
  const fetchPrompts = async (page: number) => {
    setPromptsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (promptCategory !== '全部') params.set('category', promptCategory);
      if (promptSearch) params.set('search', promptSearch);

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
        setPromptsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取Prompt失败:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'prompts') fetchPrompts(1);
  }, [mainTab, promptCategory]);

  const copyPrompt = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedPromptId(prompt.id);
    await fetch('/api/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prompt.id })
    });
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // ==================== 教程相关方法 ====================
  const fetchTutorials = async (page: number) => {
    setTutorialsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (tutorialCategory !== '全部') params.set('category', tutorialCategory);
      if (tutorialSearch) params.set('search', tutorialSearch);

      const res = await fetch(`/api/tutorials?${params}`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
        setTutorialsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setTutorialsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'tutorials') fetchTutorials(1);
  }, [mainTab, tutorialCategory]);

  // ==================== 筛选操作 ====================
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

  const clearFilters = () => {
    setSelectedFreeTypes([]);
    setSelectedFeatures([]);
    setSearchQuery('');
    setActiveCategory('all');
  };

  // ==================== 工具操作 ====================
  const openDetail = async (tool: Tool) => {
    setSelectedTool(tool);
    setDetailOpen(true);
    
    if (userId) {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tool_id: tool.id })
      });
    }
    
    await fetchToolRatingsAndReviews(tool.id);
  };

  const toggleFavorite = async () => {
    if (!userId || !selectedTool) return;
    
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?user_id=${userId}&tool_id=${selectedTool.id}`, { method: 'DELETE' });
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
        body: JSON.stringify({ user_id: userId, tool_id: selectedTool.id, ...newRating })
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
        body: JSON.stringify({ user_id: userId, tool_id: selectedTool.id, content: newReview })
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

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={36} />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>

            {/* 主导航Tab */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== 工具导航 ==================== */}
        {mainTab === 'tools' && (
          <>
            {/* 搜索框 */}
            <div className="mb-4">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索AI工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 分类导航 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === 'all'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  全部
                </button>
                {categories.map(cat => {
                  const Icon = CATEGORY_ICONS[cat.slug] || Video;
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
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
                    <p className="text-xs text-slate-500">TOP 10</p>
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
                    <p className="text-xs text-slate-500">省钱必备</p>
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
                    <p className="text-xs text-slate-500">抢先体验</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* 筛选区 */}
            <div className="mb-6 space-y-3">
              {/* 免费类型 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">免费类型</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['完全免费', '免费额度', '限时免费', '付费工具'].map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('freeType', type)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedFreeTypes.includes(type)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 核心功能 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">核心功能</span>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-orange-500 hover:text-orange-600">
                      清除筛选
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {featureTags.slice(0, 12).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleFilter('feature', tag.name)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedFeatures.includes(tag.name)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 广告位 */}
            <AdBanner position="home_banner" className="mb-6" />

            {/* 工具数量 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                共 <span className="font-semibold text-slate-900 dark:text-white">{toolsPagination.total}</span> 款工具
              </p>
            </div>

            {/* 工具列表 */}
            {toolsLoading ? (
              <SkeletonGrid count={8} />
            ) : tools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map(tool => (
                    <Card
                      key={tool.id}
                      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => openDetail(tool)}
                    >
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
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</h3>
                              {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                                <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                              )}
                              {tool.is_featured && !tool.sponsor_type && (
                                <Star className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{tool.highlight}</p>
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
                  ))}
                </div>

                {/* 分页 */}
                {toolsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === 1}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {toolsPagination.page} / {toolsPagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === toolsPagination.total_pages}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
                <p className="text-sm text-slate-500 mb-4">尝试调整筛选条件</p>
                <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
          </>
        )}

        {/* ==================== 提示词库 ==================== */}
        {mainTab === 'prompts' && (
          <>
            {/* 搜索 */}
            <div className="mb-6">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索提示词..."
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPrompts(1)}
                  className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {PROMPT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setPromptCategory(cat); setPromptsPagination(prev => ({ ...prev, page: 1 })); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    promptCategory === cat
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompt列表 */}
            {promptsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : prompts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map(prompt => (
                    <Card key={prompt.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{prompt.title}</h3>
                          <Badge variant="outline" className="text-xs">{prompt.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">{prompt.content}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prompt.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{prompt.uses}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{prompt.likes}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => copyPrompt(prompt)}>
                            {copiedPromptId === prompt.id ? <><Check className="w-3 h-3 mr-1" />已复制</> : <><Copy className="w-3 h-3 mr-1" />复制</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {promptsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={promptsPagination.page === 1} onClick={() => fetchPrompts(promptsPagination.page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{promptsPagination.page} / {promptsPagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={promptsPagination.page === promptsPagination.total_pages} onClick={() => fetchPrompts(promptsPagination.page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无提示词</h3>
                <p className="text-sm text-slate-500">提示词模板正在整理中，敬请期待</p>
              </div>
            )}
          </>
        )}

        {/* ==================== 教程库 ==================== */}
        {mainTab === 'tutorials' && (
          <>
            {/* 搜索 */}
            <div className="mb-6">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索教程..."
                  value={tutorialSearch}
                  onChange={(e) => setTutorialSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTutorials(1)}
                  className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {TUTORIAL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setTutorialCategory(cat); setTutorialsPagination(prev => ({ ...prev, page: 1 })); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    tutorialCategory === cat
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 教程列表 */}
            {tutorialsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : tutorials.length > 0 ? (
              <>
                <div className="space-y-4">
                  {tutorials.map(tutorial => (
                    <Card key={tutorial.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {tutorial.cover_image ? (
                            <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                              <img src={tutorial.cover_image} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex-shrink-0 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-orange-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100">{tutorial.title}</h3>
                              <Badge variant="outline" className="text-xs">{tutorial.category}</Badge>
                              <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                                {tutorial.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                              {tutorial.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {tutorial.author && <span>作者: {tutorial.author}</span>}
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tutorial.views}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{tutorial.likes}</span>
                              <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {tutorialsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={tutorialsPagination.page === 1} onClick={() => fetchTutorials(tutorialsPagination.page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{tutorialsPagination.page} / {tutorialsPagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={tutorialsPagination.page === tutorialsPagination.total_pages} onClick={() => fetchTutorials(tutorialsPagination.page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无教程</h3>
                <p className="text-sm text-slate-500">教程内容正在编写中，敬请期待</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <AnimatedLobster size={28} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">全品类AI工具导航</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <a href="mailto:1017760688@qq.com" className="hover:text-orange-500 transition-colors">邮箱: 1017760688@qq.com</a>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>© 2024 OneClaw</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>

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
                <p className="text-slate-600 dark:text-slate-300">{selectedTool.highlight}</p>

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

                {selectedTool.advantages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">核心优势</h4>
                    <ul className="space-y-1">
                      {selectedTool.advantages.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTool.limitations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">局限性</h4>
                    <ul className="space-y-1">
                      {selectedTool.limitations.map((l, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    onClick={() => window.open(selectedTool.promotion_url || selectedTool.official_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    访问官网
                  </Button>
                </div>

                {/* 评分统计 */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100">用户评分</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span className="font-bold text-lg">{ratingStats.avg_overall.toFixed(1)}</span>
                      <span className="text-sm text-slate-500">({ratingStats.count}人评分)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_effect.toFixed(1)}</div>
                      <div className="text-xs text-slate-500">效果</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_usability.toFixed(1)}</div>
                      <div className="text-xs text-slate-500">易用性</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_quota.toFixed(1)}</div>
                      <div className="text-xs text-slate-500">免费额度</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats.avg_stability.toFixed(1)}</div>
                      <div className="text-xs text-slate-500">稳定性</div>
                    </div>
                  </div>

                  {/* 我的评分 */}
                  <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h5 className="font-medium text-slate-800 dark:text-slate-100">我的评分</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">效果</span>
                        <StarRating value={newRating.effect_score} onChange={(v) => setNewRating(prev => ({ ...prev, effect_score: v }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">易用性</span>
                        <StarRating value={newRating.usability_score} onChange={(v) => setNewRating(prev => ({ ...prev, usability_score: v }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">免费额度</span>
                        <StarRating value={newRating.quota_score} onChange={(v) => setNewRating(prev => ({ ...prev, quota_score: v }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">稳定性</span>
                        <StarRating value={newRating.stability_score} onChange={(v) => setNewRating(prev => ({ ...prev, stability_score: v }))} />
                      </div>
                    </div>
                    <Button onClick={submitRating} disabled={submitting} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {submitting ? '提交中...' : '提交评分'}
                    </Button>
                  </div>
                </div>

                {/* 评论区 */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-4">用户评论</h4>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {reviews.map(review => (
                        <div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-300">{review.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{review.likes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">暂无评论</p>
                  )}

                  <div className="space-y-3">
                    <Textarea
                      placeholder="写下你的使用体验（10-500字）..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button onClick={submitReview} disabled={submitting} variant="outline" className="w-full">
                      {submitting ? '提交中...' : '发表评论'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
