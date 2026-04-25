'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Wand2, Sparkles, BookOpen, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ADMIN_MENU = [
  { id: 'dashboard', label: '仪表盘', icon: Home, href: '/admin' },
  { id: 'tools', label: 'AI工具管理', icon: Wand2, href: '/admin/tools' },
  { id: 'prompts', label: '提示词管理', icon: Sparkles, href: '/admin/prompts' },
  { id: 'tutorials', label: '教程管理', icon: BookOpen, href: '/admin/tutorials' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 检查登录状态
    const adminToken = document.cookie.includes('admin_token=');
    setIsAuthenticated(adminToken);
    if (!adminToken) {
      router.push('/admin/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 侧边栏 */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-slate-900 text-white z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!collapsed && (
            <Link href="/admin" className="font-bold text-lg">管理后台</Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {ADMIN_MENU.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* 底部 */}
        <div className="border-t border-slate-700 py-4 px-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Home className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">返回前台</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 主内容 */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
      )}>
        {/* 顶部栏 */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">OneClaw 管理后台</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            返回前台
          </Link>
        </header>

        {/* 内容区 */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
