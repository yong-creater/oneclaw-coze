'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Wand2, Home, LayoutDashboard,
  Sparkles, ImageIcon, Star, Plus, Sparkle,
  PartyPopper, Coffee, FileText, Smartphone,
  ChevronRight, Crown, Shirt, Video, Smile,
  ChevronLeft, PanelLeftClose, PanelLeft
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { SkeletonGrid } from '@/components/common/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/common/SponsorBadge';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';

// ==================== 类型定义 ====================
type MainTab = 'home' | 'tools' | 'templates';

// ==================== 常量 ====================
const NAV_ITEMS = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'tools', label: '工具', icon: Wand2 },
  { key: 'templates', label: '模板', icon: LayoutDashboard },
] as const;

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'video-generation', name: '视频生成' },
  { id: 'digital-human', name: '数字人' },
  { id: 'ai-drawing', name: 'AI绘画' },
  { id: 'ai-chat', name: 'AI聊天' },
  { id: 'ai-voice', name: 'AI配音' },
  { id: 'ai-writing', name: 'AI写作' },
  { id: 'ai-coding', name: 'AI编程' },
] as const;

const TEMPLATE_CATEGORIES = ['全部', '头像', '封面', '海报', '菜单', '简历', '详情页', '营销'] as const;

// ==================== 精选工具列表 ====================
const FEATURED_TOOLS = [
  { 
    name: 'AI头像表情包', 
    desc: '一键生成精美头像',
    image: 'https://picsum.photos/seed/feature1/400/300',
    color: 'bg-gradient-to-br from-pink-50 to-rose-50',
    border: 'hover:border-pink-200',
    key: 'avatar-emoji'
  },
  { 
    name: '形象照生成', 
    desc: '专业简历形象照',
    image: 'https://picsum.photos/seed/feature2/400/300',
    color: 'bg-gradient-to-br from-sky-50 to-blue-50',
    border: 'hover:border-sky-200',
    key: 'resume-photo'
  },
  { 
    name: '小红书配图', 
    desc: '爆款封面图生成',
    image: 'https://picsum.photos/seed/feature3/400/300',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'hover:border-amber-200',
    key: 'xiaohongshu'
  },
  { 
    name: '抖音封面', 
    desc: '视频封面一键生成',
    image: 'https://picsum.photos/seed/feature4/400/300',
    color: 'bg-gradient-to-br from-cyan-50 to-sky-50',
    border: 'hover:border-cyan-200',
    key: 'douyin'
  },
];

// 基础工具矩阵
const BASIC_TOOLS = [
  { name: 'AI头像', icon: Sparkles, color: 'bg-amber-50 hover:bg-amber-100', key: 'avatar-emoji' },
  { name: '形象照', icon: Smile, color: 'bg-sky-50 hover:bg-sky-100', key: 'resume-photo' },
  { name: '封面图', icon: FileText, color: 'bg-pink-50 hover:bg-pink-100', key: 'xiaohongshu' },
  { name: '抖音封面', icon: Video, color: 'bg-cyan-50 hover:bg-cyan-100', key: 'douyin' },
  { name: '海报生成', icon: PartyPopper, color: 'bg-red-50 hover:bg-red-100', key: 'festival-poster' },
  { name: '菜单设计', icon: Coffee, color: 'bg-amber-50 hover:bg-amber-100', key: 'restaurant-menu' },
  { name: '简历优化', icon: Shirt, color: 'bg-indigo-50 hover:bg-indigo-100', key: 'resume' },
  { name: '商品图', icon: ImageIcon, color: 'bg-purple-50 hover:bg-purple-100', key: 'productpage' },
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
    { icon: Sparkles, name: '头像生成', desc: '上传照片生成头像' },
    { icon: Smile, name: '形象照', desc: '生成职业形象照' },
    { icon: FileText, name: '封面图', desc: '小红书抖音封面' },
    { icon: PartyPopper, name: '海报', desc: '节日营销海报' },
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 对话框区域 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          和我聊聊，你想要什么设计
        </h1>
        <p className="text-sm text-slate-500 mb-6">描述你的需求，AI帮你实现</p>
        
        {/* 快捷入口按钮 */}
        <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
          {QUICK_AGENTS.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <button
                key={idx}
                onClick={() => setInputValue(`我想生成${agent.name}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm transition-all text-sm"
              >
                <Icon className="w-4 h-4 text-orange-500" />
                <span className="text-slate-700 dark:text-slate-200">{agent.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* 对话输入框 - DesignKit 风格 */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow focus-within:shadow-md">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="描述你想要的设计..."
              className="w-full px-5 py-4 pr-24 bg-transparent resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-sm"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            {/* 辅助功能按钮 */}
            <div className="absolute left-4 bottom-4 flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <ImageIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-4 bottom-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
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

      {/* 精选工具卡片 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">精选工具</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => window.open(getToolUrl(tool.key), '_blank')}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 dark:border-slate-700"
            >
              <div className="relative h-28 overflow-hidden">
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">{tool.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 工具矩阵 - DesignKit 网格风格 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">快速工具</h2>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {BASIC_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (tool.key) window.open(getToolUrl(tool.key), '_blank');
                }}
                className="group flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center">{tool.name}</span>
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
      {/* 搜索框 - DesignKit 风格 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索AI工具..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-designkit pl-12"
        />
      </div>

      {/* 分类标签 - 胶囊样式 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`tag-pill whitespace-nowrap ${
              activeCategory === cat.id
                ? 'tag-pill-active'
                : 'tag-pill-inactive'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 工具数量 */}
      <p className="text-sm text-slate-500">
        共 <span className="font-semibold text-slate-700 dark:text-slate-300">{tools.length}</span> 款工具
      </p>

      {/* 工具列表 - DesignKit 卡片网格 */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => window.open(`/tools/${tool.id}`, '_blank')}
              className="card-designkit p-4 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm">{tool.name}</h3>
                    {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                      <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.highlight}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无匹配工具</h3>
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
      {/* 分类标签 - 胶囊样式 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setTemplateCategory(cat)}
            className={`tag-pill whitespace-nowrap ${
              templateCategory === cat
                ? 'tag-pill-active'
                : 'tag-pill-inactive'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 模板网格 - DesignKit 卡片风格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => window.open(getToolUrl(template.key), '_blank')}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700"
          >
            <div className="relative h-36 overflow-hidden">
              <img 
                src={template.image} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-800/90 rounded-full px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-end">
          <LoginButton />
        </div>
      </header>

      {/* 主内容区 - DesignKit 布局 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧导航 - DesignKit 可折叠侧边栏 */}
          <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-48' : 'w-16'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm sticky top-20 border border-slate-100 dark:border-slate-700 overflow-hidden h-fit">
              {/* Logo 区域 - 可点击展开/收起 */}
              <button 
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  <AnimatedLobster size={22} />
                </div>
                <span className={`font-bold text-sm text-slate-800 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  OneClaw
                </span>
                <div className={`ml-auto transition-transform duration-300 ${sidebarExpanded ? 'rotate-0' : 'rotate-180'}`}>
                  {sidebarExpanded ? (
                    <PanelLeftClose className="w-4 h-4 text-slate-400" />
                  ) : (
                    <PanelLeft className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
              
              {/* 导航列表 */}
              <nav className="px-2 pb-2 space-y-1">
                {NAV_ITEMS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = mainTab === tab.key;
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMainTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
              
              {/* 底部会员入口 */}
              <div className="px-2 pb-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Link 
                  href="/membership" 
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500 transition-colors ${
                    sidebarExpanded ? '' : 'justify-center'
                  }`}
                >
                  <Crown className="w-5 h-5 flex-shrink-0" />
                  <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    会员中心
                  </span>
                </Link>
              </div>
            </div>
          </aside>

          {/* 右侧主内容 */}
          <main className="flex-1 min-w-0">
            {/* 移动端Tab切换 - 胶囊样式 */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl overflow-x-auto border border-slate-100 dark:border-slate-700">
                {NAV_ITEMS.map(tab => {
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

      {/* 页脚 - 简洁风格 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={16} />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">OneClaw</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
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
