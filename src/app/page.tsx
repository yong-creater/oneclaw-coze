'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, LayoutDashboard, Clock, FolderOpen, 
  Database, MoreHorizontal, Grid3X3, 
  Crown, Settings, User, LogIn,
  ChevronRight, Plus, ImageIcon, Sparkles,
  PartyPopper, Coffee
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

// ==================== 类型定义 ====================
type MainTab = 'home' | 'tools' | 'templates' | 'recent' | 'projects' | 'assets';

// ==================== 常量 ====================
// 主导航
const MAIN_NAV_ITEMS = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'tools', label: '工具', icon: Grid3X3 },
  { key: 'templates', label: '模板', icon: LayoutDashboard },
] as const;

// 个人导航
const PERSONAL_NAV_ITEMS = [
  { key: 'recent', label: '最近打开', icon: Clock },
  { key: 'projects', label: '项目', icon: FolderOpen },
  { key: 'assets', label: '资产库', icon: Database },
] as const;

// 底部导航
const BOTTOM_NAV_ITEMS = [
  { key: 'more', label: '更多', icon: MoreHorizontal },
  { key: 'settings', label: '设置', icon: Settings },
] as const;

// 7个AI生图工具
const AI_IMAGE_TOOLS = [
  { name: 'AI头像表情包', desc: '上传照片，一键生成精美头像和表情包', tag: '热门', color: 'from-pink-100 to-rose-100', key: 'avatar-emoji' },
  { name: '形象照生成', desc: 'AI生成专业简历形象照', tag: '推荐', color: 'from-sky-100 to-blue-100', key: 'resume-photo' },
  { name: '小红书配图', desc: '爆款小红书封面图一键生成', tag: '热门', color: 'from-pink-50 to-red-50', key: 'xiaohongshu' },
  { name: '抖音封面生成', desc: '视频封面一键生成，支持多种风格', tag: '新版', color: 'from-purple-100 to-pink-100', key: 'douyin' },
  { name: '餐饮菜单设计', desc: '上传菜品图片，智能生成精美菜单', tag: '实用', color: 'from-amber-100 to-orange-100', key: 'restaurant-menu' },
  { name: '节日营销海报', desc: '端午、中秋等节日海报一键生成', tag: '限时', color: 'from-red-100 to-orange-100', key: 'festival-poster' },
  { name: '商品详情页', desc: '电商主图和详情页设计', tag: '新版', color: 'from-emerald-100 to-teal-100', key: 'productpage' },
];

// 工具页面网格数据
const TOOLS_DATA = [
  { name: 'AI头像表情包', desc: '上传照片，一键生成精美头像和表情包', tag: '热门', color: 'from-pink-100 to-rose-100', key: 'avatar-emoji' },
  { name: '形象照生成', desc: 'AI生成专业简历形象照', tag: '推荐', color: 'from-sky-100 to-blue-100', key: 'resume-photo' },
  { name: '小红书配图', desc: '爆款小红书封面图一键生成', tag: '热门', color: 'from-pink-50 to-red-50', key: 'xiaohongshu' },
  { name: '抖音封面生成', desc: '视频封面一键生成，支持多种风格', tag: '新版', color: 'from-purple-100 to-pink-100', key: 'douyin' },
  { name: '餐饮菜单设计', desc: '上传菜品图片，智能生成精美菜单', tag: '实用', color: 'from-amber-100 to-orange-100', key: 'restaurant-menu' },
  { name: '节日营销海报', desc: '端午、中秋等节日海报一键生成', tag: '限时', color: 'from-red-100 to-orange-100', key: 'festival-poster' },
  { name: '商品详情页', desc: '电商主图和详情页设计', tag: '新版', color: 'from-emerald-100 to-teal-100', key: 'productpage' },
];

const TOOL_URLS: Record<string, string> = {
  'avatar-emoji': '/avatar-emoji',
  'resume-photo': '/resume-photo',
  'restaurant-menu': '/restaurant-menu',
  'xiaohongshu': '/xiaohongshu',
  'douyin': '/douyin',
  'festival-poster': '/festival-poster',
  'productpage': '/productpage',
};

// ==================== 首页内容 ====================
function HomeContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [inputValue, setInputValue] = useState('');
  
  // AI Agent分类
  const agents = [
    { name: '头像生成', icon: '👤', desc: 'AI头像' },
    { name: '封面设计', icon: '📄', desc: '小红书/抖音' },
    { name: '营销海报', icon: '🎨', desc: '节日促销' },
    { name: '商品展示', icon: '🛍️', desc: '电商主图' },
  ];

  // 主推功能卡片
  const featuredTools = [
    { name: 'AI头像表情包', desc: '一键生成精美头像', color: 'from-pink-100 to-rose-100', key: 'avatar-emoji' },
    { name: '形象照生成', desc: '专业简历形象照', color: 'from-sky-100 to-blue-100', key: 'resume-photo' },
    { name: '小红书配图', desc: '爆款封面图', color: 'from-pink-50 to-red-50', key: 'xiaohongshu' },
    { name: '抖音封面', desc: '视频封面生成', color: 'from-purple-100 to-pink-100', key: 'douyin' },
  ];

  // 基础工具网格
  const basicTools = [
    { name: '餐饮菜单', icon: Coffee, key: 'restaurant-menu' },
    { name: '节日海报', icon: PartyPopper, key: 'festival-poster' },
    { name: '商品详情', icon: ImageIcon, key: 'productpage' },
    { name: '更多工具', icon: MoreHorizontal, key: '' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* AI对话引导区 */}
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          和我聊聊，你想要什么设计
        </h1>
        
        {/* Agent分类标签 */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {agents.map((agent, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(`我想生成${agent.name}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm transition-all text-sm"
            >
              <span>{agent.icon}</span>
              <span className="text-slate-700 dark:text-slate-200">{agent.name}</span>
            </button>
          ))}
        </div>

        {/* 对话输入框 - 美图风格 */}
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="和我聊聊，你想要什么设计..."
              className="w-full px-5 py-4 bg-transparent resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-sm"
              rows={2}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5">
                发送
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主推功能卡片 - 美图风格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {featuredTools.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => window.open(TOOL_URLS[tool.key as keyof typeof TOOL_URLS] || '/', '_blank')}
            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-left"
          >
            <div className={`h-28 bg-gradient-to-br ${tool.color} relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-600 dark:text-slate-300">{tool.name.slice(0, 2)}</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 dark:bg-slate-700/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{tool.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 基础工具区 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 左侧两个大卡片 */}
        <button
          onClick={() => setActiveTab('tools')}
          className="row-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
            <LayoutDashboard className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">图片编辑</h3>
          <p className="text-xs text-slate-400">导入图片，即刻编辑</p>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-slate-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">创建设计</h3>
            <p className="text-xs text-slate-400">从空白画布开始</p>
          </div>
        </button>

        <button className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">开通会员</h3>
            <p className="text-xs text-amber-500">1.1元起</p>
          </div>
        </button>

        {/* 右侧工具网格 */}
        <div className="col-span-2 grid grid-cols-4 gap-3">
          {basicTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => tool.name === '更多工具' ? setActiveTab('tools') : window.open(TOOL_URLS[tool.key as keyof typeof TOOL_URLS] || '/', '_blank')}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-1.5">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{tool.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="pt-4">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">快捷入口</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '最近打开', icon: Clock, count: 3, key: 'recent' },
            { label: '我的项目', icon: FolderOpen, count: 0, key: 'projects' },
            { label: '资产库', icon: Database, count: 0, key: 'assets' },
            { label: '会员中心', icon: Crown, count: 0, key: 'more' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(item.key)}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 工具页面 ====================
function ToolsContent() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">AI生图工具</h1>
        <p className="text-sm text-slate-500">精选7款高效AI生图工具</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TOOLS_DATA.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => window.open(TOOL_URLS[tool.key as keyof typeof TOOL_URLS] || '/', '_blank')}
            className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all text-left"
          >
            {/* 图片预览 */}
            <div className={`w-full aspect-square bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{tool.name.slice(0, 2)}</span>
                </div>
              </div>
              {/* 右上角箭头 */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 dark:bg-slate-700/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="p-3">
              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                {tool.tag}
              </span>
              <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-0.5">{tool.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 模板页面 ====================
function TemplatesContent() {
  const templates = [
    { name: '头像模板', count: 120 },
    { name: '小红书封面', count: 85 },
    { name: '抖音封面', count: 72 },
    { name: '节日海报', count: 156 },
    { name: '餐饮菜单', count: 45 },
    { name: '简历模板', count: 38 },
    { name: '形象照', count: 92 },
    { name: '详情页', count: 64 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">设计模板</h1>
        <p className="text-sm text-slate-500">海量设计模板，一键使用</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        {templates.map((t, idx) => (
          <button
            key={idx}
            className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all text-left"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">{t.name.slice(0, 1)}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-slate-800 dark:text-white">{t.name}</h3>
              <p className="text-xs text-slate-400">{t.count}套模板</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 最近打开页面 ====================
function RecentContent() {
  const recentItems = [
    { name: '头像表情包设计', time: '10分钟前' },
    { name: '端午海报制作', time: '1小时前' },
    { name: '小红书封面', time: '昨天' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">最近打开</h1>
        <p className="text-sm text-slate-500">快速访问最近编辑的项目</p>
      </div>

      <div className="space-y-3">
        {recentItems.map((item, idx) => (
          <button
            key={idx}
            className="w-full flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-500">设计</span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-medium text-slate-800 dark:text-white">{item.name}</h3>
              <p className="text-xs text-slate-400">{item.time}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 项目页面 ====================
function ProjectsContent() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">我的项目</h1>
        <p className="text-sm text-slate-500">管理你创建的所有设计项目</p>
      </div>

      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无项目</h3>
        <p className="text-sm text-slate-400 mt-1">使用工具后会在这里显示</p>
      </div>
    </div>
  );
}

// ==================== 资产库页面 ====================
function AssetsContent() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">资产库</h1>
        <p className="text-sm text-slate-500">管理你的设计素材和模板</p>
      </div>

      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无素材</h3>
        <p className="text-sm text-slate-400 mt-1">上传素材后会在这里显示</p>
      </div>
    </div>
  );
}

// ==================== 主页面组件 ====================
export default function MainPage() {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* 左侧固定导航栏 - 美图风格 */}
      <aside className="w-56 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0">
        {/* Logo区域 */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white">OneClaw</span>
          </div>
        </div>

        {/* 主导航 */}
        <nav className="flex-1 p-3 space-y-0.5">
          {MAIN_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* 分割线 */}
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-3" />

          {/* 个人导航 */}
          {PERSONAL_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 底部导航 */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-0.5">
          {BOTTOM_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* 会员入口 */}
          <Link
            href="/membership"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <Crown className="w-5 h-5" />
            <span>会员中心</span>
          </Link>

          {/* 登录入口 - 低调样式 */}
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300 transition-all mt-1"
          >
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </Link>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 ml-56">
        {/* 顶部栏 */}
        <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="text-sm text-slate-500">
            {activeTab === 'home' && '首页'}
            {activeTab === 'tools' && '工具'}
            {activeTab === 'templates' && '模板'}
            {activeTab === 'recent' && '最近打开'}
            {activeTab === 'projects' && '我的项目'}
            {activeTab === 'assets' && '资产库'}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              登录
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">
          {activeTab === 'home' && <HomeContent setActiveTab={setActiveTab} />}
          {activeTab === 'tools' && <ToolsContent />}
          {activeTab === 'templates' && <TemplatesContent />}
          {activeTab === 'recent' && <RecentContent />}
          {activeTab === 'projects' && <ProjectsContent />}
          {activeTab === 'assets' && <AssetsContent />}
        </div>
      </main>
    </div>
  );
}
