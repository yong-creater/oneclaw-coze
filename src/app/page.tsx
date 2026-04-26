'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Wand2, Star, X,
  ChevronLeft, ChevronRight, Eye, ThumbsUp,
  BookOpen, Lightbulb, Copy, Check, ArrowRight,
  Sparkles, Feather, UserCircle, ImageIcon, Mountain,
  FileText, Globe, TrendingUp, Scissors, Layout,
  Camera, Palette, Sparkle, LayoutTemplate
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { SkeletonGrid } from '@/components/common/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/common/SponsorBadge';
import AdBanner, { HomeBanner, HomeInlineAd } from '@/components/common/AdBanner';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';
import NovelCreator from '@/components/tools/NovelCreator';
import { ToolLogo } from '@/components/common/ToolLogo';
import WechatPromo from '@/components/common/WechatPromo';

// ==================== 类型定义 ====================
interface Category {
  id: number;
  name: string;
  slug: string;
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

// ==================== 精选工具页面 ====================
function UtilityToolsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取精选工具数据
  useEffect(() => {
    async function fetchUtilityTools() {
      try {
        const res = await fetch('/api/utility-tools');
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
          setTools(data.tools || []);
        }
      } catch (error) {
        console.error('Failed to fetch utility tools:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUtilityTools();
  }, []);

  const getToolUrl = (slug: string) => {
    const urls: Record<string, string> = {
      resume: '/resume',
      novel: '/novel',
      productpage: '/productpage',
      'background-removal': '/background-removal',
      'xiaohongshu-generator': '/xiaohongshu-generator',
      'product-poster': '/product-poster',
      'ai-photo': '/ai-photo',
      'shangpai-ai': '/tools/shangpai-ai',
    };
    return urls[slug] || '/';
  };

  // 工具卡片组件
  const ToolCard = ({ tool }: { tool: any }) => (
    <button
      onClick={() => window.open(getToolUrl(tool.slug), '_blank')}
      className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 text-left"
    >
      {/* 封面图或渐变背景 */}
      <div className={`h-28 relative ${tool.cover_image ? '' : `bg-gradient-to-br ${tool.color || 'from-orange-500 to-amber-500'}`}`}>
        {tool.cover_image ? (
          <img 
            src={tool.cover_image} 
            alt={tool.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/30">
              {tool.name[0]}
            </span>
          </div>
        )}
      </div>
      
      {/* 内容区 */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white text-base group-hover:text-orange-500 transition-colors mb-1">
          {tool.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {tool.description}
        </p>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">精选工具</h1>
          <p className="text-slate-500 dark:text-slate-400">AI驱动的精选工具，提升您的工作效率</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-200 dark:bg-slate-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 如果有分组，按分组展示
  if (groups.length > 0) {
    return (
      <div className="space-y-8">
        {groups.map(group => {
          const groupTools = tools.filter(t => t.group_id === group.id);
          if (groupTools.length === 0) return null;
          
          return (
            <div key={group.id} className="space-y-4">
              {/* 分组标题 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${group.color || 'from-orange-500 to-amber-500'} flex items-center justify-center`}>
                  <span className="text-white font-bold">{group.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{group.name}</h2>
                  {group.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{group.description}</p>
                  )}
                </div>
              </div>
              
              {/* 工具网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 无分组时的展示
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          精选工具
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          AI驱动的精选工具，提升您的工作效率
        </p>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
        
        {/* 敬请期待卡片 */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-400 dark:text-slate-500 mb-1">
            更多工具
          </h3>
          <p className="text-sm text-slate-400">
            敬请期待...
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== 常量 ====================
const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};



const MAIN_TABS = [
  { key: 'utilities', label: '精选工具', icon: Star },
  { key: 'templates', label: '模板库', icon: LayoutTemplate },
  { key: 'tools', label: 'AI应用', icon: Wand2 },
  { key: 'prompts', label: '提示词', icon: Lightbulb },
  { key: 'tutorials', label: '教程', icon: BookOpen },
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

// 缓存管理器
const CACHE_DURATION = 5 * 60 * 1000;
const cache = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(`oneclaw_cache_${key}`);
    if (!item) return null;
    try {
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`oneclaw_cache_${key}`);
        return null;
      }
      return data;
    } catch { return null; }
  },
  set: (key: string, data: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`oneclaw_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  },
  clear: (key?: string) => {
    if (typeof window === 'undefined') return;
    if (key) {
      localStorage.removeItem(`oneclaw_cache_${key}`);
    } else {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('oneclaw_cache_'));
      keys.forEach(k => localStorage.removeItem(k));
    }
  },
  cleanup: () => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith('oneclaw_cache_'));
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const { timestamp } = JSON.parse(item);
          if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    });
  }
};

	// ==================== 主组件 ====================
export default function HomePage() {
  const router = useRouter();
  
  // 主Tab状态 - 默认精选工具
  const [mainTab, setMainTab] = useState<MainTab>('utilities');

  // 页面加载时，从 sessionStorage 读取返回的 tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 优先从 URL 查询参数读取 tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && MAIN_TABS.some(t => t.key === tabParam)) {
      setMainTab(tabParam as MainTab);
      // 清除 URL 参数
      window.history.replaceState({}, '', '/');
      return;
    }
    
    // 其次读取 homeTab（从详情页返回时设置）
    const homeTab = sessionStorage.getItem('homeTab');
    if (homeTab) {
      setMainTab(homeTab as MainTab);
      sessionStorage.removeItem('homeTab');
      return;
    }
    
    // 最后读取 backFrom
    const backFrom = sessionStorage.getItem('backFrom');
    if (backFrom) {
      try {
        const state = JSON.parse(backFrom);
        if (state && state.tab) {
          setMainTab(state.tab);
        }
      } catch {}
      // 读取完后清除
      sessionStorage.removeItem('backFrom');
    }
  }, []);

  // ==================== 工具导航状态 ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolsPagination, setToolsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  
  // 用户相关
  const [userId, setUserId] = useState('');

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

  // ==================== 模板状态 ====================
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateType, setTemplateType] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<any[]>([]);

  // 模板类型配置
  const TEMPLATE_TYPES = [
    { key: 'xhs_post', label: '小红书', icon: '📕' },
    { key: 'goods_poster', label: '商品海报', icon: '🛒' },
    { key: 'portrait', label: 'AI写真', icon: '📷' },
    { key: 'background_removal', label: '抠图', icon: '✂️' },
    { key: 'resume', label: '简历', icon: '📄' },
    { key: 'novel', label: '小说', icon: '📚' },
    { key: 'script', label: '脚本', icon: '⚡' },
  ];

  // 加载模板
  useEffect(() => {
    if (mainTab === 'templates') {
      const loadTemplates = async () => {
        setTemplatesLoading(true);
        try {
          const res = await fetch('/api/templates');
          const data = await res.json();
          if (data.success) {
            setAllTemplates(data.templates || []);
          }
        } catch (error) {
          console.error('加载模板失败:', error);
        } finally {
          setTemplatesLoading(false);
        }
      };
      loadTemplates();
    }
  }, [mainTab]);

  // 过滤模板
  const filteredTemplates = allTemplates.filter(t => {
    const matchSearch = !templateSearch || 
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchType = !templateType || t.template_type === templateType;
    return matchSearch && matchType;
  });

  // 使用模板
  const handleTemplateUse = (template: any) => {
    window.location.href = template.tool_url;
  };

  // 分类选项
  const PROMPT_CATEGORIES = ['全部', '角色扮演', '场景描述', '风格迁移', '人物生成', '特效制作'];
  const TUTORIAL_CATEGORIES = ['全部', '入门教程', '进阶技巧', '案例分享', 'API对接'];

  // slug到中文名称的映射
  const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
    'video-generation': '视频生成',
    'digital-human': '数字人',
    'video-editing': '视频编辑',
    'ai-dubbing': 'AI配音',
    'anime-creation': '动漫创作',
    'ai-image': 'AI绘画',
    'ai-writing': 'AI写作',
    'ai-coding': 'AI编程',
    'ai-audio': 'AI音频',
    'ai-office': 'AI办公',
    'ai-marketing': 'AI营销',
    'ai-learning': 'AI学习',
    'ai-chat': 'AI聊天',
    'ai-search': 'AI搜索',
  };

  // ==================== 初始化 ====================
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // 清理过期缓存
    cache.cleanup();
    // 获取分类列表
    fetchCategories();
  }, []);

  // ==================== 工具相关方法 ====================
  const fetchCategories = async () => {
    // 跳过缓存，直接获取最新数据
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchTools = useCallback(async () => {
    const cacheKey = `tools_${activeCategory}_${toolsPagination.page}`;
    const cached = cache.get(cacheKey);
    if (cached && !searchQuery) {
      setTools(cached.data || []);
      setToolsPagination(prev => ({ ...prev, total: cached.total, total_pages: cached.total_pages }));
      setToolsLoading(false);
      return;
    }
    
    setToolsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', toolsPagination.page.toString());
      params.set('limit', '20');
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        const toolsData = data.data;
        setTools(toolsData);
        setToolsPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
        if (!searchQuery) {
          cache.set(cacheKey, { data: toolsData, total: data.pagination.total, total_pages: data.pagination.total_pages });
        }
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setToolsLoading(false);
    }
  }, [toolsPagination.page, activeCategory, searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'tools') {
      setToolsPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }
  }, [activeCategory]);

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

  // ==================== 清除筛选 ====================
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  // ==================== 提示词相关方法 ====================
  const fetchPrompts = async (page: number) => {
    const cacheKey = `prompts_${promptCategory}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached && !promptSearch) {
      setPrompts(cached.data || []);
      setPromptsPagination(cached.pagination);
      setPromptsLoading(false);
      return;
    }
    
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
        if (!promptSearch) {
          cache.set(cacheKey, { data: data.data, pagination: data.pagination });
        }
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

  // 提示词搜索
  useEffect(() => {
    if (mainTab === 'prompts') {
      const timer = setTimeout(() => fetchPrompts(1), 300);
      return () => clearTimeout(timer);
    }
  }, [promptSearch]);

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
    const cacheKey = `tutorials_${tutorialCategory}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached && !tutorialSearch) {
      setTutorials(cached.data || []);
      setTutorialsPagination(cached.pagination);
      setTutorialsLoading(false);
      return;
    }
    
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
        if (!tutorialSearch) {
          cache.set(cacheKey, { data: data.data, pagination: data.pagination });
        }
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

  // 教程搜索
  useEffect(() => {
    if (mainTab === 'tutorials') {
      const timer = setTimeout(() => fetchTutorials(1), 300);
      return () => clearTimeout(timer);
    }
  }, [tutorialSearch]);

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo - 防止被压缩 */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <AnimatedLobster size={32} className="sm:size-9" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                OneClaw
              </span>
            </Link>

            {/* 主导航Tab - 移动端隐藏文字 */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.key;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key)}
                    className={`flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== 工具导航 ==================== */}
        {mainTab === 'tools' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 - 桌面端侧边栏，移动端可折叠 */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm sticky top-24">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="truncate flex-1 text-left">全部</span>
                  </button>
                  {categories.map(cat => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
            
            {/* 移动端分类筛选 - 可折叠 */}
            <div className="md:hidden w-full">
              {/* 移动端分类选择器 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800 dark:text-white">选择分类</h2>
                  <span className="text-sm text-orange-500">
                    {activeCategory === 'all' ? '全部' : categories.find(c => c.slug === activeCategory)?.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    全部
                  </button>
                  {categories.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === cat.slug
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {categories.length > 8 && (
                  <button
                    onClick={() => setShowMoreCategories(!showMoreCategories)}
                    className="mt-2 text-sm text-orange-500 hover:text-orange-600"
                  >
                    {showMoreCategories ? '收起' : `更多分类 (${categories.length - 8})`}
                  </button>
                )}
                {showMoreCategories && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.slice(8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeCategory === cat.slug
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
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

            {/* 广告位 */}
            <HomeBanner className="mb-6" />

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
                  {tools.map((tool, index) => (
                    <>
                      <div
                        key={tool.id}
                        className="block cursor-pointer"
                        onClick={() => {
                          // 记录来源页面到 sessionStorage
                          if (typeof window !== 'undefined') {
                            const backState = { 
                              path: window.location.pathname + window.location.search || '/',
                              tab: 'tools'
                            };
                            sessionStorage.setItem('backFrom', JSON.stringify(backState));
                          }
                          // 异步记录浏览历史
                          if (userId) {
                            fetch('/api/history', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ user_id: userId, tool_id: tool.id })
                            }).catch(console.error);
                          }
                          // 在新标签页打开
                          window.open(`/tools/${tool.id}`, '_blank');
                        }}
                      >
                        <Card
                          className="h-full bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={tool.logo}
                                alt={tool.name}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
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

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </div>
                      {/* 在第8个位置后插入内嵌广告 */}
                      {index === 7 && (
                        <div key="inline-ad" className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                          <HomeInlineAd className="mt-2" />
                        </div>
                      )}
                    </>
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
                <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
                <p className="text-sm text-slate-500 mb-4">尝试调整筛选条件</p>
                <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ==================== 提示词库 ==================== */}
        {mainTab === 'prompts' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  {PROMPT_CATEGORIES.map(cat => {
                    const isActive = promptCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setPromptCategory(cat); setPromptsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
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

            {/* Prompt列表 */}
            {promptsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : prompts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map(prompt => (
                    <Card 
                      key={prompt.id} 
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => {
                        // 记录来源页面
                        if (typeof window !== 'undefined') {
                          const backState = {
                            page: promptsPagination.page,
                            category: promptCategory,
                            search: promptSearch,
                            path: window.location.pathname + window.location.search,
                            tab: 'prompts'
                          };
                          sessionStorage.setItem('backFrom', JSON.stringify(backState));
                        }
                        window.open(`/prompts/${prompt.id}`, '_blank');
                      }}
                    >
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
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyPrompt(prompt); }}>
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
            </div>
          </div>
        )}

        {/* ==================== 教程库 ==================== */}
        {mainTab === 'tutorials' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  {TUTORIAL_CATEGORIES.map(cat => {
                    const isActive = tutorialCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setTutorialCategory(cat); setTutorialsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
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

            {/* 教程列表 */}
            {tutorialsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : tutorials.length > 0 ? (
              <>
                <div className="space-y-4">
                  {tutorials.map(tutorial => (
                    <Card 
                      key={tutorial.id} 
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => {
                        // 记录来源页面
                        if (typeof window !== 'undefined') {
                          const backState = {
                            page: tutorialsPagination.page,
                            category: tutorialCategory,
                            search: tutorialSearch,
                            path: window.location.pathname + window.location.search,
                            tab: 'tutorials'
                          };
                          sessionStorage.setItem('backFrom', JSON.stringify(backState));
                        }
                        window.open(`/tutorials/${tutorial.id}`, '_blank');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {tutorial.cover_image ? (
                            <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                              <img src={tutorial.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
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
            </div>
          </div>
        )}

        {/* ==================== 精选工具 ==================== */}
        {mainTab === 'utilities' && (
          <UtilityToolsPage />
        )}

        {/* ==================== 模板库 ==================== */}
        {mainTab === 'templates' && (
          <div className="space-y-6">
            {/* 搜索和筛选 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 
                             bg-white dark:bg-slate-800 focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* 类型筛选 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTemplateType(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !templateType
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                全部
              </button>
              {TEMPLATE_TYPES.map(type => (
                <button
                  key={type.key}
                  onClick={() => setTemplateType(templateType === type.key ? null : type.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    templateType === type.key
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>

            {/* 加载状态 */}
            {templatesLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-20">
                <LayoutTemplate className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">暂无模板</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleTemplateUse(template)}
                  >
                    {/* 缩略图 */}
                    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                      {template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <LayoutTemplate className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      {/* 工具来源标签 */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-medium text-slate-700 dark:text-slate-200">
                        {template.tool_name}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {template.description || '暂无描述'}
                      </p>

                      {/* 标签 */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {template.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          已使用 {template.usage_count || 0} 次
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        >
                          复刻使用
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 页脚 - 公众号 + 底部信息 */}
      <footer className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        {/* 公众号推广 + 底部链接 */}
        <WechatPromo />
        
        {/* 版权信息 */}
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={12} />
              </div>
              <span>OneClaw</span>
              <span>·</span>
              <span>AI工具导航</span>
            </div>
            <span>© {new Date().getFullYear()} All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
