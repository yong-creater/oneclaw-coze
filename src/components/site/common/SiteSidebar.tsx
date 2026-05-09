'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import {
  Sparkles,
  Flame,
  FolderOpen,
  Wrench,
  LogOut,
  Crown,
  Settings,
  UserCircle,
  CreditCard,
} from 'lucide-react';

// ========== 导航菜单 — 4 项 ==========
const menuList: Array<{
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}> = [
  { id: 'create', name: '创作', icon: Sparkles, path: '/' },
  { id: 'inspire', name: '灵感', icon: Flame, path: '/prompts' },
  { id: 'projects', name: '作品', icon: FolderOpen, path: '/projects' },
  { id: 'tools', name: '工具库', icon: Wrench, path: '/tools' },
];

// ========== 从 pathname 推导当前菜单 ID ==========
function getMenuIdFromPath(pathname: string): string {
  if (
    pathname.startsWith('/create') ||
    pathname.startsWith('/product-generator') ||
    pathname.startsWith('/background-removal') ||
    pathname.startsWith('/ai-photo') ||
    pathname.startsWith('/product-poster') ||
    pathname.startsWith('/xiaohongshu-generator') ||
    pathname.startsWith('/novel') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/productpage')) {
    return 'create';
  }
  if (pathname.startsWith('/tools')) {
    return 'tools';
  }
  if (pathname.startsWith('/prompts')) {
    return 'inspire';
  }
  if (pathname.startsWith('/projects') || pathname.startsWith('/workspace')) {
    return 'projects';
  }
  return 'create';
}

// ========== 用户浮层菜单项 ==========
const userMenuItems: Array<{
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: string;
}> = [
  { id: 'profile', name: '个人中心', icon: UserCircle, path: '/workspace' },
  { id: 'membership', name: '会员中心', icon: CreditCard, path: '/membership' },
  { id: 'settings', name: '设置', icon: Settings, path: '/settings' },
  { id: 'logout', name: '退出登录', icon: LogOut, action: 'logout' },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authenticated, setShowLoginModal, logout } = useUser();

  const currentMenu = getMenuIdFromPath(pathname);

  // 用户菜单浮层
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleUserMenuAction = (item: typeof userMenuItems[number]) => {
    setUserMenuOpen(false);
    if (item.action === 'logout') {
      logout();
    } else if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30 os-rail"
    >
      {/* ===== Logo — 紫蓝渐变 AI 品牌图标 ===== */}
      <div className="flex items-center justify-center pt-6 pb-4 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="os-rail-logo"
          title="OneClaw"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="railLogoGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#7C6CFB" />
                <stop offset="100%" stopColor="#5B5CF6" />
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="10" fill="url(#railLogoGrad)" />
            <path d="M10 18C10 13.58 13.58 10 18 10C22.42 10 26 13.58 26 18C26 22.42 22.42 26 18 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="18" cy="18" r="3" fill="white" fillOpacity="0.9" />
          </svg>
        </button>
      </div>

      {/* ===== 主导航 — 图标 + 小文字(上下结构) ===== */}
      <nav className="flex-1 flex flex-col items-center gap-2 pt-2">
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentMenu === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => router.push(menu.path)}
              className={`os-rail-item ${isActive ? 'os-rail-item-active' : ''}`}
              title={menu.name}
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="os-rail-item-text">{menu.name}</span>
            </button>
          );
        })}
      </nav>

      {/* ===== 底部用户区 — 圆形头像 ===== */}
      <div className="shrink-0 flex flex-col items-center pb-5 pt-2">
        {authenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="os-rail-avatar"
              title={user?.nickname || '用户'}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-[#6D5EF6] text-[13px] font-semibold">
                  {user?.nickname?.slice(0, 1).toUpperCase() || '用'}
                </span>
              )}
            </button>

            {/* 用户浮层菜单 */}
            {userMenuOpen && (
              <div className="absolute left-full bottom-0 ml-3 w-44 os-rail-user-menu">
                <div className="px-4 py-2.5 border-b border-slate-100/60">
                  <div className="text-[13px] font-medium text-slate-600 truncate">{user?.nickname || '用户'}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Crown className="w-2.5 h-2.5 text-amber-400/70" />
                    <span className="text-[10.5px] text-slate-400">免费版</span>
                  </div>
                </div>
                {userMenuItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isLogout = item.action === 'logout';
                  return (
                    <div key={item.id}>
                      {idx === userMenuItems.length - 1 && (
                        <div className="my-1 border-t border-slate-100/60" />
                      )}
                      <button
                        onClick={() => handleUserMenuAction(item)}
                        className={`
                          flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-left transition-colors
                          ${isLogout
                            ? 'text-red-400 hover:bg-red-50/50'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }
                        `}
                      >
                        <ItemIcon className={`w-4 h-4 shrink-0 ${isLogout ? 'text-red-300' : 'text-slate-300'}`} />
                        <span>{item.name}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="os-rail-avatar"
            title="登录"
          >
            <span className="text-slate-400 text-[14px]">
              <UserCircle className="w-5 h-5" />
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
