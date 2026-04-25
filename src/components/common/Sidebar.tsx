'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Grid3X3, FileText, Clock, Star, 
  MoreHorizontal, Bell, User, Sparkles, ChevronRight, 
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';
import { useSidebar } from './SidebarContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  showUserArea?: boolean;
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
  showUserArea = true,
  className = ''
}: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleToggle = () => {
    toggleCollapsed();
  };

  return (
    <aside 
      className={`bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[268px]'} ${className}`}
    >
      {/* Logo 区域 */}
      <div className="p-4 border-b border-slate-100/60">
        {/* 展开状态 */}
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50 cursor-pointer">
                <AnimatedLobster size={22} />
              </div>
            </Link>
            <div className="flex items-center justify-between flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
              <Link href="/" className="flex-1 min-w-0">
                <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">OneClaw</span>
                <p className="text-[11px] text-slate-400">AI 智能工具箱</p>
              </Link>
              {/* 折叠按钮 */}
              <button 
                onClick={handleToggle}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0"
                title="收起侧边栏"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 折叠状态 - hover 时 Logo 切换为展开图标 */}
        {collapsed && (
          <div 
            className="flex items-center justify-center"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
          >
            <button 
              onClick={handleToggle}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50 transition-all duration-200 cursor-pointer"
              title={isHoveringLogo ? "展开侧边栏" : "点击展开"}
            >
              {/* Logo 和展开图标切换 */}
              <div className="relative w-5 h-5">
                {/* Logo 图标 - 默认显示 */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isHoveringLogo ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                  <AnimatedLobster size={18} />
                </div>
                {/* 展开图标 - hover 时显示 */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isHoveringLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                  <PanelLeft className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

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
        <div className="p-3 border-t border-slate-100/60 mt-auto">
          {!collapsed ? (
            <div className="space-y-2">
              {/* 开通会员按钮 - 在上 */}
              <Link 
                href="/vip"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                开通会员
              </Link>
              {/* 登录按钮 - 在下 */}
              <Link 
                href="/login"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <User className="w-4 h-4" />
                登录
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* 开通会员 - 在上 */}
              <Link 
                href="/vip"
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all"
                title="开通会员"
              >
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </Link>
              {/* 登录 - 在下 */}
              <Link 
                href="/login"
                className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                title="登录"
              >
                <User className="w-[18px] h-[18px] text-slate-500" />
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
