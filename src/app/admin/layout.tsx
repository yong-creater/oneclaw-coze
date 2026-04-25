'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  X,
  Menu,
  ExternalLink,
  LogOut,
  Loader2,
  LayoutDashboard,
  Grid3X3,
  FolderTree,
  Tags,
  Users,
  Settings,
  FileText
} from 'lucide-react';

// 简化的导航菜单
const navigation = [
  { name: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { name: '工具管理', href: '/admin/tools', icon: Grid3X3 },
  { name: '模板管理', href: '/admin/templates', icon: FileText },
  { name: '分类管理', href: '/admin/categories', icon: FolderTree },
  { name: '标签管理', href: '/admin/tags', icon: Tags },
  { name: '用户管理', href: '/admin/users', icon: Users },
  { name: '系统设置', href: '/admin/settings', icon: Settings },
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 - 简洁国际风 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-slate-200
        transform transition-all duration-300 ease-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-base font-bold">O</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900">OneClaw</span>
              <span className="text-xs text-slate-400 block">Admin</span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-3 space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="absolute bottom-6 left-4 right-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl 
              text-sm font-medium text-slate-500 hover:bg-slate-100 
              hover:text-slate-900 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            <span>返回前台</span>
          </Link>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="lg:pl-[260px]">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between h-full px-8">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">欢迎回来</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.username || '管理员'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
