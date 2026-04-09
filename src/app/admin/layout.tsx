'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wrench, 
  FolderTree, 
  Tags, 
  MessageSquare,
  Menu,
  X,
  ExternalLink,
  Megaphone,
  Users,
  CreditCard,
  LogOut,
  Loader2,
  Smartphone,
  BookOpen,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { name: '工具管理', href: '/admin/tools', icon: Wrench },
  { name: '分类管理', href: '/admin/categories', icon: FolderTree },
  { name: '标签管理', href: '/admin/tags', icon: Tags },
  { name: '榜单管理', href: '/admin/rankings', icon: TrendingUp },
  { name: '教程管理', href: '/admin/tutorials', icon: BookOpen },
  { name: 'Prompt管理', href: '/admin/prompts', icon: FileText },
  { name: '评论审核', href: '/admin/reviews', icon: MessageSquare },
  { name: '会员管理', href: '/admin/members', icon: Users },
  { name: '订单管理', href: '/admin/orders', icon: CreditCard },
  { name: '广告管理', href: '/admin/ads', icon: Megaphone },
  { name: '微信配置', href: '/admin/wechat', icon: Smartphone },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // 检查登录状态
  useEffect(() => {
    // 登录页面和修改密码页面不需要检查
    if (pathname === '/admin/login' || pathname === '/admin/change-password') {
      setChecking(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        
        if (data.success && data.authenticated && data.data) {
          setUser(data.data);
          
          // 检查是否需要修改密码
          if (data.data.must_change_password) {
            router.push('/admin/change-password');
            return;
          }
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 登录页面和修改密码页面不显示布局
  if (pathname === '/admin/login' || pathname === '/admin/change-password') {
    return <>{children}</>;
  }

  // 检查中显示加载
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 
        border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              OneClaw
            </span>
            <span className="text-sm text-slate-500">管理后台</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 返回前台 */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg 
              text-sm font-medium text-slate-600 hover:bg-slate-100 
              dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            查看前台
          </Link>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="lg:pl-64">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center justify-between h-full px-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {navigation.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.name || '管理后台'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{user?.username || '管理员'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 dark:text-slate-300"
              >
                <LogOut className="w-4 h-4 mr-1" />
                退出
              </Button>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
