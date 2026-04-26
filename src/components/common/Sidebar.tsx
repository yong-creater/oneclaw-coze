'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Sparkles, BookOpen, Heart, Crown,
  ChevronLeft, ChevronRight,
  Wand2, Star, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const MENU_ITEMS = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'own-tools', label: '自建工具', icon: Star, href: '/own-tools' },
  { id: 'ai-tools', label: 'AI工具库', icon: Wand2, href: '/ai-tools' },
  { id: 'prompts', label: '提示词', icon: Sparkles, href: '/prompts' },
  { id: 'tutorials', label: '教程', icon: BookOpen, href: '/tutorials' },
];

const USER_MENU = [
  { id: 'workspace', label: '我的收藏', icon: Heart, href: '/workspace' },
  { id: 'membership', label: '会员中心', icon: Crown, href: '/membership' },
];

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 从 localStorage 读取折叠状态
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
    // 设置初始CSS变量
    document.documentElement.style.setProperty('--sidebar-width', saved === 'true' ? '72px' : '240px');
  }, []);

  // 保存折叠状态
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // 切换折叠状态
  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    document.documentElement.style.setProperty('--sidebar-width', newCollapsed ? '72px' : '240px');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-card/80 backdrop-blur-xl border-r border-border/60 z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {/* Logo图标 - 钳爪简化图形 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 rounded-xl blur-md opacity-30" />
              <svg viewBox="0 0 36 36" className="w-9 h-9 relative">
                <defs>
                  <linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="50%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#fb923c"/>
                  </linearGradient>
                </defs>
                {/* 左钳臂 */}
                <path d="M8 14 L4 8 Q2 4 6 3 Q10 2 11 6 L13 14" 
                      fill="none" stroke="url(#sidebarLogoGrad)" strokeWidth="2" strokeLinecap="round"/>
                {/* 右钳臂 */}
                <path d="M28 14 L32 8 Q34 4 30 3 Q26 2 25 6 L23 14" 
                      fill="none" stroke="url(#sidebarLogoGrad)" strokeWidth="2" strokeLinecap="round"/>
                {/* 身体 */}
                <ellipse cx="18" cy="22" rx="9" ry="8" fill="url(#sidebarLogoGrad)"/>
                {/* 眼睛 */}
                <circle cx="14" cy="20" r="1.5" fill="white"/>
                <circle cx="22" cy="20" r="1.5" fill="white"/>
                {/* 触须 */}
                <path d="M12 14 Q9 10 6 9" fill="none" stroke="url(#sidebarLogoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M24 14 Q27 10 30 9" fill="none" stroke="url(#sidebarLogoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            
            {/* 品牌名称 - 折叠时隐藏 */}
            {!collapsed && (
              <span className="text-base font-bold tracking-tight">
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  OneClaw
                </span>
              </span>
            )}
          </Link>
          
          {/* 折叠按钮 */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          
          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted/50 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500/10 to-blue-600/5 text-blue-600 border-l-2 border-blue-500 ml-0 pl-[10px]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  !isActive(item.href) && "group-hover:scale-110"
                )} />
                {!collapsed && (
                  <span className="transition-colors">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* 用户菜单 */}
        <div className="border-t border-border/40 py-4 px-3">
          <div className="space-y-1">
            {USER_MENU.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500/10 to-blue-600/5 text-blue-600"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  !isActive(item.href) && "group-hover:scale-110"
                )} />
                {!collapsed && (
                  <span className="transition-colors">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-6 z-30 md:hidden flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 animate-float"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
