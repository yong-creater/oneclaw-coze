'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Wand2, Star, X,
  ChevronLeft, ChevronRight, Eye, ThumbsUp,
  Sparkles, UserCircle, ImageIcon, Mountain,
  FileText, Globe, Briefcase, MapPin, Palette, Layers,
  ShoppingCart, Shirt, Video, Smile, Coffee, Camera, PartyPopper, Smartphone,
  LayoutDashboard, Box, BookOpen, Lightbulb, Copy, Check, ArrowRight,
  Feather, TrendingUp, GraduationCap, ChevronDown, Menu, Home, Plus
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { SkeletonGrid } from '@/components/common/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/common/SponsorBadge';
import AdBanner, { HomeBanner, HomeInlineAd } from '@/components/common/AdBanner';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';

// ==================== 类型定义 ====================
type MainTab = 'home' | 'tools' | 'templates';

// ==================== 常量 ====================
const MAIN_TABS = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'tools', label: '工具', icon: Wand2 },
  { key: 'templates', label: '模板', icon: LayoutDashboard },
] as const;

const CATEGORIES = [
  { id: 1, name: '全部', slug: 'all' },
  { id: 2, name: '视频生成', slug: 'video-generation' },
  { id: 3, name: '数字人', slug: 'digital-human' },
  { id: 4, name: 'AI绘画', slug: 'ai-drawing' },
  { id: 5, name: 'AI聊天', slug: 'ai-chat' },
  { id: 6, name: 'AI配音', slug: 'ai-voice' },
  { id: 7, name: 'AI写作', slug: 'ai-writing' },
  { id: 8, name: 'AI编程', slug: 'ai-coding' },
] as const;

const TEMPLATE_CATEGORIES = ['全部', '头像', '封面', '海报', '菜单', '简历', '详情页', '营销'] as const;

// ==================== 精选工具列表 ====================
const FEATURED_TOOLS = [
  { 
    name: 'AI头像表情包', 
    desc: '一键生成精美头像',
    image: 'https://picsum.photos/seed/feature1/600/400',
    gradient: 'from-pink-100 to-rose-100',
    key: 'avatar-emoji'
  },
  { 
    name: '形象照生成', 
    desc: '专业简历形象照',
    image: 'https://picsum.photos/seed/feature2/600/400',
    gradient: 'from-sky-100 to-blue-100',
    key: 'resume-photo'
  },
  { 
    name: '小红书配图', 
    desc: '爆款封面图生成',
    image: 'https://picsum.photos/seed/feature3/600/400',
    gradient: 'from-amber-100 to-orange-100',
    key: 'xiaohongshu'
  },
  { 
    name: '抖音封面', 
    desc: '视频封面一键生成',
    image: 'https://picsum.photos/seed/feature4/600/400',
    gradient: 'from-cyan-100 to-sky-100',
    key: 'douyin'
  },
];

// 基础工具矩阵
const BASIC_TOOLS = [
  { name: 'AI头像', icon: Sparkles, desc: '智能头像生成', color: 'bg-gradient-to-br from-amber-50 to-orange-50', key: 'avatar-emoji' },
  { name: '形象照', icon: UserCircle, desc: '专业形象照', color: 'bg-gradient-to-br from-sky-50 to-blue-50', key: 'resume-photo' },
  { name: '封面图', icon: BookOpen, desc: '爆款封面', color: 'bg-gradient-to-br from-pink-50 to-rose-50', key: 'xiaohongshu' },
  { name: '抖音封面', icon: Smartphone, desc: '视频封面', color: 'bg-gradient-to-br from-cyan-50 to-sky-50', key: 'douyin' },
  { name: '海报生成', icon: PartyPopper, desc: '节日海报', color: 'bg-gradient-to-br from-red-50 to-orange-50', key: 'festival-poster' },
  { name: '菜单设计', icon: Coffee, desc: '餐饮菜单', color: 'bg-gradient-to-br from-amber-50 to-yellow-50', key: 'restaurant-menu' },
  { name: '简历优化', icon: FileText, desc: 'STAR法则', color: 'bg-gradient-to-br from-indigo-50 to-blue-50', key: 'resume' },
  { name: '更多', icon: ChevronDown, desc: '更多工具', color: 'bg-slate-50', key: '' },
];

const TOOL_URLS: Record<string, string> = {
  'avatar-emoji': '/avatar-emoji',
  'resume-photo': '/resume-photo',
  'restaurant-menu': '/restaurant-menu',
  'xiaohongshu': '/xiaohongshu',
  'douyin': '/douyin',
  'festival-poster': '/festival-poster',
  'kids-creative': '/kids-creative',
  'resume': '/resume',
  'novel': '/novel',
  'productpage': '/productpage',
};

const getToolUrl = (key: string) => TOOL_URLS[key] || '/';

// ==================== 首页组件 ====================
function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const QUICK_AGENTS = [
    { icon: '🛒', name: '头像生成Agent', desc: '上传照片生成头像' },
    { icon: '👚', name: '形象照Agent', desc: '生成职业形象照' },
    { icon: '📄', name: '封面图Agent', desc: '小红书抖音封面' },
    { icon: '🎬', name: '海报Agent', desc: '节日营销海报' },
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 核心对话框区域 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          和我聊聊，你想要什么设计
        </h1>
        
        {/* 快捷Agent按钮 */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          {QUICK_AGENTS.map((agent, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(`我想生成${agent.name.replace('Agent', '')}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all"
            >
              <span className="text-lg">{agent.icon}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{agent.name}</span>
            </button>
          ))}
        </div>
        
        {/* 对话输入框 */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="和我聊聊，你想要什么设计..."
              className="w-full px-6 py-5 pr-24 bg-transparent resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-base"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            {/* 辅助功能按钮 */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <ImageIcon className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Lightbulb className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-4 bottom-4 px-5 py-2 bg-slate-800 dark:bg-slate-600 text-white rounded-xl font-medium text-sm hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  发送
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 特色功能卡片 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">精选AI能力</h2>
          <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => window.open(getToolUrl(tool.key), '_blank')}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
            >
              <div className="relative h-36 overflow-hidden">
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${tool.gradient} opacity-60`} />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">{tool.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部工具矩阵 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">基础工具</h2>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {BASIC_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (tool.key) window.open(getToolUrl(tool.key), '_blank');
                }}
                className="group flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center">{tool.name}</span>
                <span className="text-[10px] text-slate-400 text-center mt-0.5 line-clamp-1">{tool.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 工具页面组件 ====================
function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '20');
      
      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      setTools(data.tools || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTools(); }, [activeCategory]);

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索AI工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 工具数量 */}
      <p className="text-sm text-slate-500">
        共 <span className="font-semibold">{tools.length}</span> 款工具
      </p>

      {/* 工具列表 */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="block cursor-pointer"
              onClick={() => window.open(`/tools/${tool.id}`, '_blank')}
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
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
        </div>
      )}
    </div>
  );
}

// ==================== 模板页面组件 ====================
function TemplatesPage() {
  const [templateCategory, setTemplateCategory] = useState('全部');
  
  const templates = [
    { id: 1, name: '头像模板', count: 120, image: 'https://picsum.photos/seed/t1/400/300', key: 'avatar-emoji' },
    { id: 2, name: '小红书封面', count: 85, image: 'https://picsum.photos/seed/t2/400/300', key: 'xiaohongshu' },
    { id: 3, name: '抖音封面', count: 72, image: 'https://picsum.photos/seed/t3/400/300', key: 'douyin' },
    { id: 4, name: '节日海报', count: 156, image: 'https://picsum.photos/seed/t4/400/300', key: 'festival-poster' },
    { id: 5, name: '餐饮菜单', count: 45, image: 'https://picsum.photos/seed/t5/400/300', key: 'restaurant-menu' },
    { id: 6, name: '简历模板', count: 38, image: 'https://picsum.photos/seed/t6/400/300', key: 'resume' },
    { id: 7, name: '形象照', count: 92, image: 'https://picsum.photos/seed/t7/400/300', key: 'resume-photo' },
    { id: 8, name: '详情页', count: 64, image: 'https://picsum.photos/seed/t8/400/300', key: 'productpage' },
  ];

  return (
    <div className="space-y-4">
      {/* 分类筛选 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setTemplateCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              templateCategory === cat
                ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => window.open(getToolUrl(template.key), '_blank')}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700"
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={template.image} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-800/90 rounded-full px-2 py-0.5 text-xs">
                {template.count}套
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm">{template.name}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 主页面组件 ====================
export default function MainPage() {
  const [mainTab, setMainTab] = useState<MainTab>('home');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end">
          <LoginButton />
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧导航 - designkit简洁风格 */}
          <aside className="hidden lg:block w-16 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm sticky top-20 p-2 space-y-1">
              {/* Logo */}
              <div className="flex justify-center mb-3 pt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                  <AnimatedLobster size={22} />
                </div>
              </div>
              
              {/* 导航列表 */}
              <nav className="space-y-1">
                {MAIN_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = mainTab === tab.key;
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMainTab(tab.key)}
                      title={tab.label}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-md'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </nav>
              
              {/* 底部快捷入口 */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
                <Link href="/membership" title="会员中心" className="w-full aspect-square rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-500 transition-colors">
                  <Star className="w-5 h-5" />
                </Link>
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
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white'
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

            {/* 页面内容 */}
            {mainTab === 'home' && <HomePage />}
            {mainTab === 'tools' && <ToolsPage />}
            {mainTab === 'templates' && <TemplatesPage />}
          </main>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={18} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Link href="/about" className="hover:text-orange-500">关于</Link>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
