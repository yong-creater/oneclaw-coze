'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Grid3X3, FileText, Clock, FolderOpen, 
  MoreHorizontal, ChevronDown, Search, Bell, User,
  Star, Sparkles, Settings, LogOut, Menu, X
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

// 导航配置
const NAV_ITEMS = [
  { icon: Home, label: '首页', href: '/' },
  { icon: Grid3X3, label: '工具', href: '/tools' },
  { icon: FileText, label: '模板', href: '/templates' },
  { icon: Clock, label: '最近打开', href: '/recent' },
  { icon: FolderOpen, label: '项目', href: '/projects' },
  { icon: Star, label: '资产库', href: '/assets' },
];

export default function HomePage() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧导航 */}
      <aside className={`bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <AnimatedLobster size={20} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-slate-800">OneClaw</span>
                <p className="text-xs text-slate-400">AI工具箱</p>
              </div>
            )}
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}

          {/* 更多 */}
          <div className="pt-3 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
              <MoreHorizontal className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">更多</span>}
            </button>
          </div>
        </nav>

        {/* 折叠按钮 */}
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={`flex-1 transition-all ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        {/* 顶部栏 */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="h-14 px-6 flex items-center justify-between">
            {/* 搜索 */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索模板、功能..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center gap-4">
              {/* 会员按钮 */}
              <Link 
                href="/vip"
                className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-shadow"
              >
                开通会员
              </Link>

              {/* 消息 */}
              <button className="relative p-2 text-slate-400 hover:text-slate-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* 用户 */}
              <Link href="/login" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-500" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">
          {/* 欢迎区域 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">欢迎回来 👋</h1>
            <p className="text-slate-500">今天想创作什么？</p>
          </div>

          {/* 快捷工具 */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷工具</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'AI抠图', icon: '✂️', color: 'from-blue-400 to-cyan-500', href: '/tools/remove-bg' },
                { name: '变清晰', icon: '🔍', color: 'from-purple-400 to-violet-500', href: '/tools/enhance' },
                { name: '改尺寸', icon: '📐', color: 'from-green-400 to-emerald-500', href: '/tools/resize' },
                { name: '小红书封面', icon: '📕', color: 'from-red-400 to-orange-500', href: '/tools/xiaohongshu' },
                { name: '视频封面', icon: '🎬', color: 'from-violet-400 to-purple-500', href: '/tools/douyin' },
                { name: '节日海报', icon: '🎊', color: 'from-rose-400 to-pink-500', href: '/tools/festival-poster' },
              ].map((tool, idx) => (
                <Link
                  key={idx}
                  href={tool.href}
                  className="group bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-center"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{tool.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 全部工具入口 */}
          <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">探索全部工具</h2>
                <p className="text-white/80 text-sm">发现更多AI创作能力</p>
              </div>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-white text-orange-600 font-medium rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                查看全部 <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
