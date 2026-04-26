'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bot, Compass, Sparkles, Star, BookOpen,
  Menu, X, LogIn, User,
  Layers
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// 前台导航 - 精简
const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/', icon: Compass },
  { label: 'AI工具库', href: '/ai-tools', icon: Layers },
  { label: '自建工具', href: '/own-tools', icon: Sparkles },
  { label: '提示词库', href: '/prompts', icon: Sparkles },
  { label: '教程库', href: '/tutorials', icon: BookOpen },
  { label: '榜单中心', href: '/rankings', icon: Star },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ nickname: string; avatar: string } | null>(null);

  // 检查登录状态
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='));
    
    if (token) {
      const tokenValue = token.split('=')[1];
      fetch('/api/auth?action=check', {
        headers: { Cookie: `user_token=${tokenValue}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setUser(data.data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  // 监听路由变化
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border cursor-pointer lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 - 苹果风格 */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-background/80 backdrop-blur-xl border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: 'var(--sidebar-width, 220px)' }}
      >
        {/* Logo区域 - 居中对齐 */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              OneClaw
            </span>
          </Link>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent cursor-pointer ml-auto lg:hidden"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 导航区域 */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 底部用户区域 */}
        <div className="p-3 border-t border-border">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nickname}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogIn className="w-[18px] h-[18px] flex-shrink-0" />
              <span>登录</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
