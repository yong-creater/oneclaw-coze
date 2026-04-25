'use client';

import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Grid3X3, 
  Clock, 
  FolderOpen, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  LogIn
} from 'lucide-react';

// Sidebar Context
const SidebarContext = createContext<{ collapsed: boolean; setCollapsed: (v: boolean) => void }>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// Sidebar Provider
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Navigation items
const mainNav = [
  { name: '首页', href: '/', icon: Home },
  { name: 'AI 工具', href: '/tools', icon: Grid3X3 },
  { name: '模板', href: '/templates', icon: Sparkles },
];

const secondaryNav = [
  { name: '最近使用', href: '/recent', icon: Clock },
  { name: '资产库', href: '/assets', icon: FolderOpen },
];

const bottomNav = [
  { name: '设置', href: '/more', icon: MoreHorizontal },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [hovered, setHovered] = useState(false);

  const isCollapsed = collapsed && !hovered;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/60 flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[268px]'} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-5'} border-b border-slate-100`}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              One<span className="text-orange-500">Claw</span>
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4" />

        {/* Secondary Navigation */}
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="py-4 px-3 border-t border-slate-100 space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* VIP Button */}
        <Link
          href="/settings/vip"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Crown className="w-5 h-5" />
          {!isCollapsed && (
            <div className="flex-1">
              <span>开通会员</span>
            </div>
          )}
        </Link>

        {/* Login Button */}
        <Link
          href="/login"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogIn className="w-5 h-5" />
          {!isCollapsed && <span>登录</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        )}
      </button>
    </aside>
  );
}
