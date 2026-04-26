'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Sparkles, BookOpen, Heart, Crown,
  ChevronLeft, ChevronRight,
  FileText, Image as ImageIcon, Globe, Wand2,
  Video, Users, Play, Mic, MessageSquare, Code2, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-background border-r border-border z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2.5">
              {/* Logo图标 - 钳爪简化图形 */}
              <svg viewBox="0 0 36 36" className="w-8 h-8 flex-shrink-0">
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
              {/* 品牌名称 */}
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight">
                  <span className="text-[#ef4444]">One</span><span className="text-foreground">Claw</span>
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              {/* 折叠时只显示钳爪图标 */}
              <svg viewBox="0 0 36 36" className="w-9 h-9">
                <defs>
                  <linearGradient id="sidebarLogoGradCollapsed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="50%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#fb923c"/>
                  </linearGradient>
                </defs>
                <path d="M8 14 L4 8 Q2 4 6 3 Q10 2 11 6 L13 14" 
                      fill="none" stroke="url(#sidebarLogoGradCollapsed)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M28 14 L32 8 Q34 4 30 3 Q26 2 25 6 L23 14" 
                      fill="none" stroke="url(#sidebarLogoGradCollapsed)" strokeWidth="2" strokeLinecap="round"/>
                <ellipse cx="18" cy="22" rx="9" ry="8" fill="url(#sidebarLogoGradCollapsed)"/>
                <circle cx="14" cy="20" r="1.5" fill="white"/>
                <circle cx="22" cy="20" r="1.5" fill="white"/>
                <path d="M12 14 Q9 10 6 9" fill="none" stroke="url(#sidebarLogoGradCollapsed)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M24 14 Q27 10 30 9" fill="none" stroke="url(#sidebarLogoGradCollapsed)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {MENU_ITEMS.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* 用户菜单 */}
        <div className="border-t border-border py-4 px-3">
          <div className="space-y-1">
            {USER_MENU.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-30 md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Home className="w-5 h-5" />
      </button>
    </>
  );
}
