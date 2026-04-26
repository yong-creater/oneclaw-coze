'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bot, Compass, Sparkles, Star, BookOpen,
  ChevronDown, Menu, X, LogIn, LogOut, User,
  Layers, ListOrdered, Tags, MessageSquare,
  Settings, LayoutDashboard
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

// 主导航
const MAIN_NAV: NavItem[] = [
  { label: '首页', href: '/', icon: Compass },
  { label: 'AI工具库', href: '/ai-tools', icon: Layers },
  { label: '自建工具', href: '/own-tools', icon: Sparkles },
  { label: '提示词库', href: '/prompts', icon: Sparkles },
  { label: '教程库', href: '/tutorials', icon: BookOpen },
  { label: '榜单中心', href: '/rankings', icon: Star },
];

// 用户导航
const USER_NAV: NavItem[] = [
  { label: '我的收藏', href: '/workspace?tab=favorites', icon: Star },
  { label: '浏览历史', href: '/workspace?tab=history', icon: Clock },
  { label: '我的评分', href: '/workspace?tab=ratings', icon: Star },
];

// 后台导航
const ADMIN_NAV: NavItem[] = [
  { label: '工作台', href: '/admin', icon: LayoutDashboard },
  { label: '工具管理', href: '/admin/tools', icon: Layers },
  { label: '分类管理', href: '/admin/categories', icon: ListOrdered },
  { label: '标签管理', href: '/admin/tags', icon: Tags },
  { label: '评论审核', href: '/admin/reviews', icon: MessageSquare },
];

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
  }, [userMenuOpen]);

  // 监听路由变化关闭移动端菜单
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const NavSection = ({ title, items }: { title?: string; items: NavItem[] }) => (
    <div className="space-y-1">
      {title && (
        <p className="px-3 text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              active
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {item.badge && !collapsed && (
              <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  // 移动端遮罩
  const MobileOverlay = () => (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && <MobileOverlay />}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-background border-r border-border flex flex-col z-50 transition-all duration-200",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo区域 - 极简风格 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-background" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground tracking-tight">
                OneClaw
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent lg:hidden"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 导航区域 */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <NavSection items={MAIN_NAV} />
          
          {user && <NavSection title="工作台" items={USER_NAV} />}
          
          <NavSection title="系统" items={ADMIN_NAV} />
        </nav>

        {/* 底部用户区域 */}
        <div className="p-3 border-t border-border">
          {user ? (
            <div className={cn(
              "flex items-center gap-3 px-3 py-2",
              collapsed && "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.nickname}</p>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                collapsed && "justify-center"
              )}
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>登录</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
