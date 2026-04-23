'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';

const navigation = [
  { name: '仪表盘', href: '/admin' },
  { name: 'AI应用', href: '/admin/tools' },
  { name: '技能管理', href: '/admin/skills' },
  { name: '教程管理', href: '/admin/tutorials' },
  { name: '提示词管理', href: '/admin/prompts' },
  { name: '案例管理', href: '/admin/cases' },
  { name: '广告管理', href: '/admin/ads' },
  { name: '用户管理', href: '/admin/users' },
  { name: '微信配置', href: '/admin/wechat' },
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-56 bg-[var(--card)] border-r border-[var(--border)] 
        transform transition-transform duration-200
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-base font-semibold">OneClaw</span>
            <span className="text-xs text-[var(--muted-foreground)]">Admin</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-[var(--accent)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm
                  ${isActive 
                    ? 'bg-[var(--foreground)] text-[var(--background)]' 
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[var(--border)]">
          <Link
            href="/"
            className="flex items-center px-3 py-2 rounded-md text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] mb-2"
          >
            返回前台
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 移动端菜单按钮 */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-30 lg:hidden p-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 主内容 */}
      <main className="flex-1 lg:ml-56">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
