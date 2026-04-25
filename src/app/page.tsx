'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, LayoutDashboard, Clock, FolderOpen, 
  Database, MoreHorizontal, Grid3X3, 
  Crown, Settings, User, LogIn,
  ChevronRight
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
function HomeContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">欢迎使用 OneClaw</h1>
        <p className="text-sm text-slate-500">精选7款高效AI生图工具，一键生成精美设计</p>
      </div>

      {/* AI生图工具 - 美图风格网格 */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-slate-700 dark:text-slate-200 mb-4">AI生图工具</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AI_IMAGE_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => window.open(TOOL_URLS[tool.key as keyof typeof TOOL_URLS] || '/', '_blank')}
              className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all text-left"
            >
              {/* 图片预览 */}
              <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${tool.color} mb-3 overflow-hidden relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{tool.name.slice(0, 2)}</span>
                  </div>
                </div>
              </div>
              {/* 标签 */}
              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 mb-2">
                {tool.tag}
              </span>
              {/* 名称 */}
              <h3 className="text-sm font-medium text-slate-800 dark:text-white">{tool.name}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* 快捷入口 */}
      <div>
        <h2 className="text-base font-medium text-slate-700 dark:text-slate-200 mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '最近打开', icon: Clock, count: 3 },
            { label: '我的项目', icon: FolderOpen, count: 0 },
            { label: '资产库', icon: Database, count: 0 },
            { label: '会员中心', icon: Crown, count: 0 },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(item.label === '最近打开' ? 'recent' : item.label === '我的项目' ? 'projects' : item.label === '资产库' ? 'assets' : 'more')}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-slate-800 dark:text-white">{item.label}</h3>
                {item.count > 0 && <p className="text-xs text-slate-400">{item.count}个项目</p>}
              </div>
            </button>
          ))}
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
          {activeTab === 'home' && <HomeContent activeTab={activeTab} setActiveTab={setActiveTab} />}
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
