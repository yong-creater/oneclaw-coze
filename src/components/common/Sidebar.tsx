'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Grid3X3, FileText, Clock, Star, 
  MoreHorizontal, Search, Bell, User, Menu, X,
  Sparkles, ChevronRight, PanelLeftClose, PanelLeft
} from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  showUserArea?: boolean;
  showCollapseButton?: boolean;
  className?: string;
}

// 导航配置 - 主要菜单
const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: '首页', href: '/' },
  { icon: Grid3X3, label: '工具', href: '/tools' },
  { icon: FileText, label: '模板', href: '/templates' },
];

// 导航配置 - 次要菜单
const SECONDARY_NAV_ITEMS: NavItem[] = [
  { icon: Clock, label: '最近打开', href: '/recent' },
  { icon: Star, label: '资产库', href: '/assets' },
];

// 底部菜单
const BOTTOM_NAV_ITEMS: NavItem[] = [
  { icon: MoreHorizontal, label: '更多', href: '/more' },
];

export function Sidebar({ 
  showSearch = false, 
  searchPlaceholder = '搜索模板、功能...',
  showUserArea = true,
  showCollapseButton = true,
  className = ''
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside 
      className={`bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[268px]'} ${className}`}
    >
      {/* Logo 区域 - 展开时包含折叠按钮 */}
      <div className="p-4 border-b border-slate-100/60">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="relative flex-shrink-0"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
          >
            {/* 折叠状态下：hover 显示展开按钮，否则显示 Logo */}
            {collapsed ? (
              isHoveringLogo ? (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center hover:from-orange-200 hover:to-amber-200 transition-all cursor-pointer">
                  <PanelLeft className="w-5 h-5 text-orange-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <AnimatedLobster size={22} />
                </div>
              )
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                <AnimatedLobster size={22} />
              </div>
            )}
          </Link>

          {/* 展开时显示 Logo 文字和名称 */}
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">OneClaw</span>
                <p className="text-[11px] text-slate-400">AI 智能工具箱</p>
              </div>
              
              {/* 折叠按钮 - 展开时在 logo 旁边 */}
              {showCollapseButton && (
                <button 
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0"
                  title="收起侧边栏"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 搜索框 */}
      {showSearch && !collapsed && (
        <div className="p-3 border-b border-slate-100/60">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 rounded-xl border border-transparent text-sm focus:outline-none focus:border-orange-300 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* 主要菜单 */}
        <div className="space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl -z-10" />
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  active 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 group-hover:bg-orange-100'
                }`}>
                  <Icon className={`w-[18px] h-[18px] ${active ? '' : 'text-slate-500 group-hover:text-orange-500'}`} />
                </div>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && active && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 分隔线 + 次要菜单 */}
        <div className="pt-3 mt-3 border-t border-slate-100/60 space-y-1">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  active 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 group-hover:bg-orange-100'
                }`}>
                  <Icon className={`w-[18px] h-[18px] ${active ? '' : 'text-slate-400 group-hover:text-orange-500'}`} />
                </div>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 底部菜单 - 无分隔线 */}
        <div className="pt-3 space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  active 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 group-hover:bg-orange-100'
                }`}>
                  <Icon className={`w-[18px] h-[18px] ${active ? '' : 'text-slate-400 group-hover:text-orange-500'}`} />
                </div>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 用户区域 */}
      {showUserArea && (
        <div className="p-3 border-t border-slate-100/60">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/vip"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200/50 hover:from-orange-600 hover:to-amber-600 transition-all text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                开通会员
              </Link>
              <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link href="/login" className="p-0.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center hover:from-orange-200 hover:to-amber-200 transition-all">
                  <User className="w-[18px] h-[18px] text-orange-500" />
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link 
                href="/vip"
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all"
              >
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </Link>
              <Link href="/login" className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center hover:from-orange-200 hover:to-amber-200 transition-all">
                <User className="w-[18px] h-[18px] text-orange-500" />
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
