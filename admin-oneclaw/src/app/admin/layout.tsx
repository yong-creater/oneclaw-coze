'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  Tags,
  FileText,
  Star,
  Users,
  MessageSquare,
  Shield,
  ShoppingCart,
  CreditCard,
  Settings,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: '仪表盘', href: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: '工具管理', href: '/tools', icon: <Wrench className="w-5 h-5" /> },
  { label: '分类管理', href: '/categories', icon: <FolderTree className="w-5 h-5" /> },
  { label: '技能管理', href: '/skills', icon: <Star className="w-5 h-5" /> },
  { label: '提示词库', href: '/prompts', icon: <FileText className="w-5 h-5" /> },
  { label: '教程管理', href: '/tutorials', icon: <FileText className="w-5 h-5" /> },
  { label: '标签管理', href: '/tags', icon: <Tags className="w-5 h-5" /> },
  { label: '广告管理', href: '/ads', icon: <QrCode className="w-5 h-5" /> },
  { label: '会员管理', href: '/members', icon: <CreditCard className="w-5 h-5" /> },
  { label: '订单管理', href: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: '用户管理', href: '/users', icon: <Users className="w-5 h-5" /> },
  { label: '评论审核', href: '/reviews', icon: <MessageSquare className="w-5 h-5" /> },
  { label: '榜单管理', href: '/rankings', icon: <Star className="w-5 h-5" /> },
  { label: '微信配置', href: '/wechat', icon: <QrCode className="w-5 h-5" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // 获取当前管理员信息
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAdmin(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-slate-900 text-white z-40 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-sm">
                O
              </div>
              <span className="font-bold">OneClaw</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 hover:bg-slate-700 rounded"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 导航 */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                {item.icon}
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          {admin ? (
            <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{admin.username}</p>
                  <p className="text-xs text-slate-400">{admin.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-slate-700 rounded"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors',
                collapsed && 'px-2'
              )}
            >
              <Shield className="w-4 h-4" />
              {!collapsed && <span className="text-sm">登录</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

// 主布局
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <AdminSidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
