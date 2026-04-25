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
  FileText, Globe, TrendingUp, Briefcase, MapPin, Palette, Layers,
  ShoppingCart, Shirt, Video, Smile, Coffee, Camera, PartyPopper, Smartphone,
  LayoutDashboard, Box, WandSparkles, BookMarked, GraduationCap, ChevronDown, Menu, Home
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { SkeletonGrid } from '@/components/common/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/common/SponsorBadge';
import AdBanner, { HomeBanner, HomeInlineAd } from '@/components/common/AdBanner';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';
import { ToolLogo } from '@/components/common/ToolLogo';

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

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  logo: string | null;
  category_id: number | null;
  official_url: string | null;
  documentation_url: string | null;
  github_url: string | null;
  pricing: string;
  difficulty: string;
  tags: string[];
  feature_list: string[];
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  skill_categories: { id: number; name: string; slug: string; color: string } | null;
}

// ==================== 美图风格精选工具页面 ====================
function UtilityToolsPage() {
  const router = useRouter();
  
  // 马卡龙色系配置
  const MACARON_COLORS = [
    { bg: 'bg-gradient-to-br from-pink-100 to-rose-100', border: 'border-rose-200', accent: 'text-rose-500' },
    { bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', border: 'border-blue-200', accent: 'text-blue-500' },
    { bg: 'bg-gradient-to-br from-green-100 to-emerald-100', border: 'border-emerald-200', accent: 'text-emerald-500' },
    { bg: 'bg-gradient-to-br from-amber-100 to-orange-100', border: 'border-amber-200', accent: 'text-amber-500' },
    { bg: 'bg-gradient-to-br from-purple-100 to-violet-100', border: 'border-purple-200', accent: 'text-purple-500' },
    { bg: 'bg-gradient-to-br from-cyan-100 to-teal-100', border: 'border-cyan-200', accent: 'text-cyan-500' },
    { bg: 'bg-gradient-to-br from-rose-100 to-pink-100', border: 'border-rose-200', accent: 'text-pink-500' },
    { bg: 'bg-gradient-to-br from-orange-100 to-amber-100', border: 'border-orange-200', accent: 'text-orange-500' },
    { bg: 'bg-gradient-to-br from-lime-100 to-green-100', border: 'border-lime-200', accent: 'text-lime-600' },
    { bg: 'bg-gradient-to-br from-fuchsia-100 to-pink-100', border: 'border-fuchsia-200', accent: 'text-fuchsia-500' },
  ];

  const getToolUrl = (key: string) => {
    const urls: Record<string, string> = {
      resume: '/resume',
      novel: '/novel',
      productpage: '/productpage',
      'avatar-emoji': '/avatar-emoji',
      'resume-photo': '/resume-photo',
      'local-poster': '/local-poster',
      'kids-creative': '/kids-creative',
      'restaurant-menu': '/restaurant-menu',
      'xiaohongshu': '/xiaohongshu',
      'douyin': '/douyin',
      'festival-poster': '/festival-poster',
    };
    return urls[key] || '/';
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>精选工具 · 零门槛AI生图</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
          AI智能工具箱
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          上传照片或输入文字，一键生成精美头像、菜单、封面图、海报...无需设计基础，小白也能做出专业效果
        </p>
      </div>

      {/* 工具网格 - 美图风格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {UTILITY_TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          const colorScheme = MACARON_COLORS[index % MACARON_COLORS.length];
          const [primaryColor, secondaryColor] = tool.color.split(' ')[1]?.split('-') || ['orange', '500'];
          
          return (
            <button
              key={tool.key}
              onClick={() => {
                window.open(getToolUrl(tool.key), '_blank');
              }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:-translate-y-1 text-left"
            >
              {/* 预览图区域 - 左右分栏 */}
              <div className="h-28 flex relative overflow-hidden">
                {/* 左侧：输入示意 */}
                <div className={`flex-1 ${colorScheme.bg} flex items-center justify-center p-3`}>
                  <div className="text-center opacity-60">
                    <Icon className={`w-8 h-8 ${colorScheme.accent} mx-auto mb-1`} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">输入</span>
                  </div>
                </div>
                {/* 中间箭头 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center">
                    <ArrowRight className={`w-3 h-3 ${colorScheme.accent}`} />
                  </div>
                </div>
                {/* 右侧：输出示意 */}
                <div className="flex-1 bg-white dark:bg-slate-700 flex items-center justify-center p-3">
                  <div className="text-center">
                    <div className={`w-10 h-10 rounded-lg ${colorScheme.bg} flex items-center justify-center mx-auto mb-1 shadow-sm`}>
                      <Icon className={`w-5 h-5 ${colorScheme.accent}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">输出</span>
                  </div>
                </div>
              </div>
              
              {/* 信息区域 */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-orange-500 transition-colors text-sm">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
                
                {/* 功能标签 */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {tool.tags?.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className={`px-2 py-0.5 text-[10px] rounded-full ${colorScheme.bg} ${colorScheme.accent} border ${colorScheme.border}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
        
        {/* 敬请期待卡片 */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-3`}>
            <Sparkles className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            更多工具
          </h3>
          <p className="text-[10px] text-slate-400">
            敬请期待...
          </p>
        </div>
      </div>

      {/* 特色功能展示 */}
      <div className="bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50 dark:from-orange-900/20 dark:via-rose-900/20 dark:to-amber-900/20 rounded-3xl p-8 mt-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">为什么选择我们？</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">简单、快速、专业</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7 text-pink-500" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">上传即可生成</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">无需复杂设置，上传图片或输入文字，系统自动生成专业效果</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">秒级生成</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI智能算法，10秒内完成图片生成，即刻下载使用</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-3">
              <Download className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">高清无水印</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">生成高清图片，可直接商用，无任何水印限制</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 辅助组件
const Zap = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ==================== 常量 ====================
const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};

// 精选工具列表
const UTILITY_TOOLS = [
  {
    key: 'avatar-emoji',
    name: '头像表情包',
    icon: Sparkles,
    description: '上传照片，一键生成各种风格的精美头像和表情包',
    color: 'from-yellow-500 to-orange-500',
    tags: ['头像生成', '表情包', '个性定制'],
    useCases: [
      { title: '头像定制', desc: '真人照片转动漫/插画头像' },
      { title: '表情包', desc: '批量生成系列表情包' },
      { title: '节日专属', desc: '节日主题头像一键生成' },
    ]
  },
  {
    key: 'resume-photo',
    name: '形象照生成',
    icon: UserCircle,
    description: '上传照片，一键生成专业简历形象照/职业照',
    color: 'from-blue-500 to-cyan-500',
    tags: ['形象照', '职业照', '商务形象'],
    useCases: [
      { title: '简历照片', desc: '专业商务形象照' },
      { title: '职业头像', desc: 'LinkedIn/脉脉头像' },
      { title: '团队合影', desc: '公司团队统一形象照' },
    ]
  },
  {
    key: 'restaurant-menu',
    name: '餐饮菜单生成',
    icon: Coffee,
    description: '上传图片一键优化，或输入文字自动生成精美菜单',
    color: 'from-orange-500 to-amber-500',
    tags: ['餐饮模板', '菜单设计', '价目表'],
    useCases: [
      { title: '图片优化', desc: '上传现有菜单一键美化' },
      { title: '文字生成', desc: '输入菜品自动生成菜单' },
      { title: '多风格', desc: 'Ins风/国潮风/复古风' },
    ]
  },
  {
    key: 'xiaohongshu',
    name: '小红书配图',
    icon: BookOpen,
    description: '输入标题，一键生成小红书爆款封面图和配图',
    color: 'from-pink-500 to-rose-500',
    tags: ['小红书配图', '封面图', '自媒体工具'],
    useCases: [
      { title: '封面图', desc: '爆款笔记封面生成' },
      { title: '内页配图', desc: '干货内容配图' },
      { title: '热点模板', desc: '节日/话题热点模板' },
    ]
  },
  {
    key: 'douyin',
    name: '抖音封面生成',
    icon: Smartphone,
    description: '输入标题，一键生成抖音爆款视频封面图',
    color: 'from-cyan-500 to-blue-500',
    tags: ['抖音封面', '视频封面', '自媒体工具'],
    useCases: [
      { title: '视频封面', desc: '爆款视频封面生成' },
      { title: '文案配图', desc: '配合文案的配图' },
      { title: '热点模板', desc: '热点话题封面' },
    ]
  },
  {
    key: 'festival-poster',
    name: '节日营销海报',
    icon: PartyPopper,
    description: '选择节日/场景，输入主题，一键生成精美营销海报',
    color: 'from-red-500 to-orange-500',
    tags: ['节日海报', '营销物料', '促销宣传'],
    useCases: [
      { title: '春节', desc: '新春促销海报' },
      { title: '中秋', desc: '团圆节海报' },
      { title: '开业', desc: '新店开业海报' },
    ]
  },
  {
    key: 'kids-creative',
    name: '儿童创意工坊',
    icon: Palette,
    description: 'AI儿童手抄报/手账/涂色绘本一键生成，亲子必备',
    color: 'from-cyan-500 to-teal-500',
    tags: ['手抄报', '涂色绘本', '儿童手工'],
    useCases: [
      { title: '手抄报', desc: '节日/主题手抄报模板' },
      { title: '涂色绘本', desc: '儿童涂色绘本素材' },
      { title: '手账素材', desc: '亲子手账贴纸/素材' },
    ]
  },
  { 
    key: 'resume', 
    name: 'STAR简历优化', 
    icon: FileText,
    description: '上传简历+粘贴JD，一键生成STAR法则优化版简历，精准匹配岗位',
    color: 'from-indigo-500 to-blue-500',
    tags: ['PDF上传', 'JD精准匹配', '量化成果'],
    useCases: [
      { title: '校招求职', desc: '应届生简历优化，突出项目经验' },
      { title: '社招跳槽', desc: '量化工作成果，提升面试邀约率' },
      { title: '简历升级', desc: 'STAR法则重构，让经历更有说服力' },
    ]
  },
  { 
    key: 'novel', 
    name: '小说创作工坊', 
    icon: Feather,
    description: '小说→深度洗稿→漫画生图→推文脚本，全流程创作一键导出',
    color: 'from-purple-500 to-pink-500',
    tags: ['深度洗稿', '漫画生图', '推文脚本'],
    useCases: [
      { title: '小说改编', desc: '番茄小说爆款文改编为漫画脚本' },
      { title: 'IP孵化', desc: '原创故事快速生成多形式内容' },
      { title: '短剧创作', desc: '小说改短剧，批量产出推文素材' },
    ]
  },
  { 
    key: 'productpage', 
    name: '出海详情页', 
    icon: Globe,
    description: '一键生成符合海外法规、人文风情的商品详情页，适配多平台',
    color: 'from-emerald-500 to-teal-500',
    tags: ['多语言', '海外合规', '批量分发'],
    useCases: [
      { title: '亚马逊Listing', desc: '符合亚马逊规范的多语言详情页' },
      { title: '独立站详情', desc: 'Shopify/WooCommerce适配版本' },
      { title: '多平台分发', desc: '速卖通/eBay/Shopee统一模板' },
    ]
  },
] as const;

type UtilityTool = typeof UTILITY_TOOLS[number]['key'];

const MAIN_TABS = [
  { key: 'utilities', label: '精选工具', icon: Star },
  { key: 'tools', label: 'AI应用', icon: Wand2 },
  { key: 'prompts', label: '提示词', icon: Lightbulb },
  { key: 'skills', label: '技能', icon: Sparkles },
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

  // ==================== Skill 状态 ====================
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsPagination, setSkillsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [skillCategory, setSkillCategory] = useState<number | 'all'>('all');
  const [skillSearch, setSkillSearch] = useState('');

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

  // ==================== Skill 相关方法 ====================
  const fetchSkillCategories = async () => {
    try {
      const res = await fetch('/api/skills/categories');
      const data = await res.json();
      if (data.success) {
        setSkillCategories(data.data || []);
      }
    } catch (error) {
      console.error('获取技能分类失败:', error);
    }
  };

  const fetchSkills = async (page: number) => {
    setSkillsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '24');
      if (skillCategory !== 'all') params.set('category', skillCategory.toString());
      if (skillSearch) params.set('search', skillSearch);

      const res = await fetch(`/api/skills?${params}`);
      const data = await res.json();
      if (data.success) {
        setSkills(data.data || []);
        setSkillsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取技能列表失败:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'skills') {
      fetchSkillCategories();
    }
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'skills') fetchSkills(1);
  }, [mainTab, skillCategory]);

  // 技能搜索
  useEffect(() => {
    if (mainTab === 'skills') {
      const timer = setTimeout(() => fetchSkills(1), 300);
      return () => clearTimeout(timer);
    }
  }, [skillSearch]);

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 - 简化版 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={28} />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>

            {/* 搜索框 - 居中 */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索AI工具..."
                  className="w-full pl-9 pr-4 h-9 bg-slate-100 dark:bg-slate-700 border-0 text-sm rounded-full"
                />
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-3">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 - 左右布局 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧导航 - 竖排Tab */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm sticky top-20 overflow-hidden">
              {/* Logo区 */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                    <AnimatedLobster size={18} />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">导航菜单</span>
                </div>
              </div>
              
              {/* 导航列表 */}
              <nav className="p-2 space-y-1">
                {MAIN_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = mainTab === tab.key;
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMainTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              {/* 底部快捷入口 */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                <div className="space-y-1">
                  <Link href="/rankings" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
                    <TrendingUp className="w-3 h-3" />
                    榜单中心
                  </Link>
                  <Link href="/membership" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
                    <Star className="w-3 h-3" />
                    会员中心
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* 右侧主内容 */}
          <main className="flex-1 min-w-0">
            {/* 移动端Tab切换 */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl overflow-x-auto">
                {MAIN_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = mainTab === tab.key;
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMainTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 精选工具页 */}
            {mainTab === 'utilities' && <UtilityToolsPage />}

            {/* AI应用页 */}
            {mainTab === 'tools' && (
              <div className="space-y-4">
                {/* 移动端搜索 */}
                <div className="md:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="搜索AI工具..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
                
                {/* 分类筛选 */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeCategory === 'all'
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      全部
                    </button>
                    {categories.slice(0, 8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          activeCategory === cat.slug
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 工具数量 */}
                <div className="flex items-center justify-between">
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
                              if (typeof window !== 'undefined') {
                                const backState = { 
                                  path: window.location.pathname + window.location.search || '/',
                                  tab: 'tools'
                                };
                                sessionStorage.setItem('backFrom', JSON.stringify(backState));
                              }
                              if (userId) {
                                fetch('/api/history', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ user_id: userId, tool_id: tool.id })
                                }).catch(console.error);
                              }
                              window.open(`/tools/${tool.id}`, '_blank');
                            }}
                          >
                            <Card className="h-full bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all">
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
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.highlight}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
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
                        <Button variant="outline" size="sm" disabled={toolsPagination.page === 1} onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-slate-500">{toolsPagination.page} / {toolsPagination.total_pages}</span>
                        <Button variant="outline" size="sm" disabled={toolsPagination.page === toolsPagination.total_pages} onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
                    <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
                  </div>
                )}
              </div>
            )}

            {/* 提示词库 */}
            {mainTab === 'prompts' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {PROMPT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setPromptCategory(cat); setPromptsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          promptCategory === cat
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {promptsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : prompts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {prompts.map(prompt => (
                        <Card key={prompt.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer"
                          onClick={() => { window.open(`/prompts/${prompt.id}`, '_blank'); }}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{prompt.title}</h3>
                              <Badge variant="outline" className="text-xs">{prompt.category}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">{prompt.content}</p>
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
                  </div>
                )}
              </div>
            )}

            {/* 教程库 */}
            {mainTab === 'tutorials' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {TUTORIAL_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setTutorialCategory(cat); setTutorialsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          tutorialCategory === cat
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {tutorialsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : tutorials.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {tutorials.map(tutorial => (
                        <Card key={tutorial.id} className="bg-white dark:bg-slate-800 hover:border-orange-400 transition-colors cursor-pointer"
                          onClick={() => { window.open(`/tutorials/${tutorial.id}`, '_blank'); }}>
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
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                                  {tutorial.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tutorial.views}</span>
                                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{tutorial.likes}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                  </div>
                )}
              </div>
            )}

            {/* 技能库 */}
            {mainTab === 'skills' && (
              <div className="space-y-4">
                {/* 分类标签 */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    <button
                      onClick={() => { setSkillCategory('all'); setSkillsPagination(prev => ({ ...prev, page: 1 })); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        skillCategory === 'all'
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      全部
                    </button>
                    {skillCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSkillCategory(cat.id); setSkillsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          skillCategory === cat.id
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 技能列表 */}
                {skillsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : skills.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {skills.map(skill => {
                        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
                        const colorIndex = skill.name.charCodeAt(0) % colors.length;
                        const bgColor = colors[colorIndex];
                        const letter = skill.name.charAt(0).toUpperCase();
                        
                        return (
                          <div
                            key={skill.id}
                            className="flex items-center gap-4 py-4 px-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => { window.open(`/skills/${skill.slug}`, '_blank'); }}
                          >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ backgroundColor: bgColor + '20' }}>
                              <span style={{ color: bgColor }}>{letter}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-1 group-hover:text-orange-500 transition-colors">
                                {skill.name}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                {skill.description || '暂无描述'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                    {skillsPagination.total_pages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button variant="outline" size="sm" disabled={skillsPagination.page === 1} onClick={() => fetchSkills(skillsPagination.page - 1)}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-slate-500">{skillsPagination.page} / {skillsPagination.total_pages}</span>
                        <Button variant="outline" size="sm" disabled={skillsPagination.page === skillsPagination.total_pages} onClick={() => fetchSkills(skillsPagination.page + 1)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无技能</h3>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 页脚 - 简化版 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={18} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
              <span className="text-xs text-slate-400">AI工具导航</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于</Link>
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
