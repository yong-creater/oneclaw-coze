'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  FolderTree,
  Lightbulb,
  BookOpen,
  Users,
  MessageSquare,
  ShoppingCart,
  Settings,
  Shield,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { name: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { name: '精选工具', href: '/admin/utility-tools', icon: Wrench },
  { name: '模板库', href: '/admin/templates', icon: FileText },
  { name: 'AI应用', href: '/admin/tools', icon: FolderTree },
  { name: '分类管理', href: '/admin/categories', icon: LayoutDashboard },
  { name: '提示词库', href: '/admin/prompts', icon: Lightbulb },
  { name: '教程库', href: '/admin/tutorials', icon: BookOpen },
  { name: '会员管理', href: '/admin/members', icon: Users },
  { name: '评论审核', href: '/admin/reviews', icon: MessageSquare },
  { name: '订单管理', href: '/admin/orders', icon: ShoppingCart },
  { name: '广告管理', href: '/admin/ads', icon: Settings },
  { name: 'API Key', href: '/admin/api-keys', icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setAdminUser(data.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include'
      });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* 左侧：Logo 和 移动端菜单按钮 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold text-orange-500">🦞</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                OneClaw 管理后台
              </span>
            </Link>
          </div>

          {/* 右侧：用户信息 */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : adminUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                      {adminUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-slate-700 dark:text-slate-200">
                      {adminUser.username}
                    </span>
                    <Badge variant="outline" className="hidden sm:inline text-xs">
                      {adminUser.role === 'super_admin' ? '超级管理员' : '管理员'}
                    </Badge>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{adminUser.username}</p>
                      <p className="text-xs text-slate-500">{adminUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" target="_blank">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      访问前台
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 左侧边栏 */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-200 ease-in-out z-40
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col h-full py-4">
          <div className="px-4 mb-4">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              导航菜单
            </h2>
          </div>
          <div className="flex-1 px-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      active
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active
                        ? 'text-orange-500'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-orange-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 底部：返回前台 */}
          <div className="px-2 mt-auto border-t border-slate-200 dark:border-slate-700 pt-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              <span>返回前台</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
