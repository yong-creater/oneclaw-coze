'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Grid3X3, FileText, Clock, FolderOpen, 
  MoreHorizontal, Search, Bell, User, Star, Settings, LogOut,
  ChevronDown, Menu, X, Sparkles
} from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
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

// 导航配置 - 次要菜单（带分隔线）
const SECONDARY_NAV_ITEMS: NavItem[] = [
  { icon: Clock, label: '最近打开', href: '/recent' },
  { icon: Star, label: '资产库', href: '/assets' },
];

// 底部菜单
const BOTTOM_NAV_ITEMS: NavItem[] = [
  { icon: MoreHorizontal, label: '更多', href: '/more' },
];

export function Sidebar({ 
  showSearch = true, 
  searchPlaceholder = '搜索模板、功能...',
  showUserArea = true,
  showCollapseButton = true,
  className = ''
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all ${collapsed ? 'w-16' : 'w-56'} ${className}`}>
      {/* Logo 区域 */}
      <div className="p-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <AnimatedLobster size={20} />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-slate-800">OneClaw</span>
              <p className="text-xs text-slate-400">AI工具箱</p>
            </div>
          )}
        </Link>
      </div>

      {/* 搜索框 */}
      {showSearch && !collapsed && (
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* 主要菜单 */}
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.href) 
                  ? 'bg-orange-50 text-orange-600 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}

        {/* 分隔线 + 次要菜单 */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.href) 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* 底部菜单 */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.href) 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 用户区域 */}
      {showUserArea && (
        <div className="p-3 border-t border-slate-100">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/vip"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-shadow text-center"
              >
                开通会员
              </Link>
              <button className="relative p-2 text-slate-400 hover:text-slate-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link href="/login" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-500" />
                </div>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <User className="w-4 h-4 text-orange-500" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* 折叠按钮 */}
      {showCollapseButton && (
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">收起</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
