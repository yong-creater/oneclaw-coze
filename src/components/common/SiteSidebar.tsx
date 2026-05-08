'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import {
  Home,
  Wand2,
  LayoutTemplate,
  Lightbulb,
  FolderOpen,
  User,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Crown,
  Settings,
  UserCircle,
  CreditCard,
} from 'lucide-react';

// ========== 主导航菜单（不含设置） ==========
const menuList: Array<{
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}> = [
  { id: 'home', name: '首页', subtitle: 'AI 创作工作台', icon: Home, path: '/' },
  { id: 'tools', name: '小工具', subtitle: '商品图、详情页、小红书等', icon: Wand2, path: '/tools' },
  { id: 'template', name: '模板', subtitle: '可复用创作模板', icon: LayoutTemplate, path: '/templates' },
  { id: 'prompt', name: '提示库', subtitle: '高质量提示词', icon: Lightbulb, path: '/prompts' },
  { id: 'project', name: '项目', subtitle: '历史生成与作品', icon: FolderOpen, path: '/projects' },
];

// ========== 从 pathname 推导当前菜单 ID ==========
function getMenuIdFromPath(pathname: string): string {
  // 工具子路由
  if (
    pathname.startsWith('/product-generator') ||
    pathname.startsWith('/background-removal') ||
    pathname.startsWith('/ai-photo') ||
    pathname.startsWith('/product-poster') ||
    pathname.startsWith('/xiaohongshu-generator') ||
    pathname.startsWith('/novel') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/productpage')
  ) {
    return 'tools';
  }
  // 精确匹配菜单路径
  const match = menuList.find(m => m.path !== '/' && pathname.startsWith(m.path));
  if (match) return match.id;
  // 首页兜底
  return 'home';
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
  const { sidebarExpanded, toggleSidebar } = useMenu();
  const { user, authenticated, setShowLoginModal, logout } = useUser();

  const currentMenu = getMenuIdFromPath(pathname);
  const sidebarWidth = sidebarExpanded ? 240 : 68;

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
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-100/80 flex flex-col z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* Logo + 折叠按钮 */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-100/60 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <SiteLogo size={28} showText={sidebarExpanded} />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shrink-0"
          title={sidebarExpanded ? '收起侧栏' : '展开侧栏'}
        >
          {sidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 主导航菜单 */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-hide">
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} space-y-1`}>
          {menuList.map((menu) => {
            const Icon = menu.icon;
            const isActive = currentMenu === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => router.push(menu.path)}
                className={`
                  group flex items-center gap-3 w-full text-left overflow-hidden
                  transition-all duration-200 rounded-xl
                  ${!sidebarExpanded ? 'justify-center !px-0 !gap-0' : 'px-3'}
                  ${sidebarExpanded ? 'h-[52px]' : 'h-[44px]'}
                  ${isActive
                    ? 'bg-gradient-to-r from-[#7B61FF]/[0.08] to-[#5B8CFF]/[0.04] text-[#6948E8]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
                title={!sidebarExpanded ? `${menu.name} · ${menu.subtitle}` : undefined}
              >
                <div className={`shrink-0 flex items-center justify-center ${!sidebarExpanded ? 'w-full' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-[#7B61FF]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
                {sidebarExpanded && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className={`font-medium truncate text-[13px] leading-tight ${isActive ? 'text-[#6948E8]' : 'text-slate-700'}`}>
                      {menu.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                      {menu.subtitle}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 用户信息区 - 左下角 */}
      <div className={`shrink-0 border-t border-slate-100/60 ${sidebarExpanded ? 'px-3 py-3' : 'px-2 py-3 flex justify-center'}`}>
        {sidebarExpanded ? (
          // ========== 展开模式 ==========
          authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 w-full rounded-xl px-1 py-1.5 hover:bg-slate-50 transition-colors text-left"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0 ring-2 ring-slate-100" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B61FF]/10 to-[#5B8CFF]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#7B61FF] text-xs font-semibold">
                      {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-700 truncate">{user?.nickname || '用户'}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] text-slate-400">免费版</span>
                  </div>
                </div>
              </button>

              {/* 用户浮层菜单 */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50">
                  {userMenuItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    const isLogout = item.action === 'logout';
                    return (
                      <div key={item.id}>
                        {idx === userMenuItems.length - 1 && (
                          <div className="my-1.5 border-t border-slate-100/80" />
                        )}
                        <button
                          onClick={() => handleUserMenuAction(item)}
                          className={`
                            flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-left transition-colors
                            ${isLogout
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                            }
                          `}
                        >
                          <ItemIcon className={`w-4 h-4 shrink-0 ${isLogout ? 'text-red-400' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // 未登录
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <LoginButton />
              </div>
            </div>
          )
        ) : (
          // ========== 收缩模式 ==========
          authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B61FF]/10 to-[#5B8CFF]/10 flex items-center justify-center hover:ring-2 hover:ring-[#7B61FF]/20 transition-all"
                title={user?.nickname || '用户'}
              >
                <span className="text-[#7B61FF] text-xs font-semibold">
                  {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
                </span>
              </button>

              {/* 收缩模式浮层 - 向右展开 */}
              {userMenuOpen && (
                <div className="absolute left-full bottom-0 ml-3 w-44 bg-white rounded-xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-slate-100/80">
                    <div className="text-[13px] font-medium text-slate-700 truncate">{user?.nickname || '用户'}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="text-[11px] text-slate-400">免费版</span>
                    </div>
                  </div>
                  {userMenuItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    const isLogout = item.action === 'logout';
                    return (
                      <div key={item.id}>
                        {idx === userMenuItems.length - 1 && (
                          <div className="my-1.5 border-t border-slate-100/80" />
                        )}
                        <button
                          onClick={() => handleUserMenuAction(item)}
                          className={`
                            flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-left transition-colors
                            ${isLogout
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                            }
                          `}
                        >
                          <ItemIcon className={`w-4 h-4 shrink-0 ${isLogout ? 'text-red-400' : 'text-slate-400'}`} />
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
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center hover:bg-[#7B61FF]/[0.06] transition-colors"
              title="登录"
            >
              <User className="w-4 h-4 text-slate-300" />
            </button>
          )
        )}
      </div>
    </aside>
  );
}
