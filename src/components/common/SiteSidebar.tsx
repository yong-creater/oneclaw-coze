'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import {
  Home,
  Sparkles,
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

// ========== 主导航菜单 ==========
const menuList: Array<{
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}> = [
  { id: 'home', name: '首页', subtitle: 'AI 创作工作台', icon: Home, path: '/' },
  { id: 'tools', name: '创作中心', subtitle: '商品图、详情页、小红书', icon: Sparkles, path: '/tools' },
  { id: 'template', name: '模板库', subtitle: '可复用创作模板', icon: LayoutTemplate, path: '/templates' },
  { id: 'prompt', name: '灵感库', subtitle: '高质量提示词与灵感', icon: Lightbulb, path: '/prompts' },
  { id: 'project', name: '项目', subtitle: '历史生成与作品', icon: FolderOpen, path: '/projects' },
];

// ========== 从 pathname 推导当前菜单 ID ==========
function getMenuIdFromPath(pathname: string): string {
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
  const match = menuList.find(m => m.path !== '/' && pathname.startsWith(m.path));
  if (match) return match.id;
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
      className="fixed left-0 top-0 h-screen bg-white/90 backdrop-blur-xl border-r border-slate-100/60 flex flex-col z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* ===== Logo 区 — 更简洁 ===== */}
      <div className="h-[56px] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <SiteLogo size={26} showText={sidebarExpanded} />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50/80 transition-all shrink-0"
          title={sidebarExpanded ? '收起侧栏' : '展开侧栏'}
        >
          {sidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ===== 主导航菜单 — 56px 高 / 18px 圆角 / 更大留白 ===== */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2.5'} space-y-1.5`}>
          {menuList.map((menu) => {
            const Icon = menu.icon;
            const isActive = currentMenu === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => router.push(menu.path)}
                className={`
                  group flex items-center gap-3 w-full text-left overflow-hidden
                  transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${!sidebarExpanded ? 'justify-center !px-0 !gap-0' : 'px-4'}
                  h-[56px] rounded-[18px]
                  ${isActive
                    ? 'bg-[#7B61FF]/[0.06] text-[#6948E8] relative'
                    : 'text-slate-400 hover:bg-slate-50/80 hover:text-slate-600'
                  }
                `}
                title={!sidebarExpanded ? `${menu.name} · ${menu.subtitle}` : undefined}
              >
                {/* 选中项左侧 glow 光条 */}
                {isActive && sidebarExpanded && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-[#7B61FF] to-[#5B8CFF] shadow-[0_0_8px_rgba(123,97,255,0.4)]" />
                )}
                <div className={`shrink-0 flex items-center justify-center ${!sidebarExpanded ? 'w-full' : ''}`}>
                  <Icon
                    className={`w-[20px] h-[20px] transition-all duration-250 ${
                      isActive
                        ? 'text-[#7B61FF]'
                        : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </div>
                {sidebarExpanded && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className={`font-medium truncate text-[13.5px] leading-tight ${isActive ? 'text-[#6948E8]' : 'text-slate-700'}`}>
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

      {/* ===== 底部用户区 — 更简洁 ===== */}
      <div className={`shrink-0 ${sidebarExpanded ? 'px-3 pb-4 pt-2' : 'px-2.5 pb-4 pt-2 flex justify-center'}`}>
        {sidebarExpanded ? (
          // ========== 展开模式 ==========
          authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 w-full rounded-2xl px-2 py-2 hover:bg-slate-50/80 transition-colors text-left"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0 ring-1 ring-slate-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B61FF]/8 to-[#5B8CFF]/6 flex items-center justify-center shrink-0">
                    <span className="text-[#7B61FF] text-[11px] font-semibold">
                      {user?.nickname?.slice(0, 1).toUpperCase() || '用'}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-600 truncate">{user?.nickname || '用户'}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Crown className="w-2.5 h-2.5 text-amber-400/70" />
                    <span className="text-[10.5px] text-slate-400">免费版</span>
                  </div>
                </div>
              </button>

              {/* 升级会员 — 轻量文字链接，不要大按钮 */}
              <button
                onClick={() => router.push('/membership')}
                className="w-full mt-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11.5px] font-medium text-[#7B61FF]/70 hover:text-[#7B61FF] hover:bg-[#7B61FF]/[0.04] transition-all"
              >
                <Crown className="w-3 h-3" />
                升级会员
              </button>

              {/* 用户浮层菜单 */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-1.5 z-50">
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
            // 未登录
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-50/80 flex items-center justify-center shrink-0">
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
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B61FF]/8 to-[#5B8CFF]/6 flex items-center justify-center hover:ring-2 hover:ring-[#7B61FF]/15 transition-all"
                title={user?.nickname || '用户'}
              >
                <span className="text-[#7B61FF] text-[11px] font-semibold">
                  {user?.nickname?.slice(0, 1).toUpperCase() || '用'}
                </span>
              </button>

              {/* 收缩模式浮层 */}
              {userMenuOpen && (
                <div className="absolute left-full bottom-0 ml-3 w-44 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-1.5 z-50">
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
              className="w-9 h-9 rounded-full bg-slate-50/80 flex items-center justify-center hover:bg-[#7B61FF]/[0.04] transition-colors"
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
