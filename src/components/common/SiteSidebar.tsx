'use client';

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
  Settings,
  User,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Crown,
} from 'lucide-react';

// ========== 菜单数据结构 ==========
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
  { id: 'settings', name: '设置', subtitle: '账号与偏好', icon: Settings, path: '/settings' },
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

export default function SiteSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarExpanded, toggleSidebar } = useMenu();
  const { user, authenticated, setShowLoginModal, logout } = useUser();

  const currentMenu = getMenuIdFromPath(pathname);
  const sidebarWidth = sidebarExpanded ? 240 : 68;

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

      {/* 菜单列表 */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-hide">
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} space-y-1`}>
          {menuList.map((menu) => {
            const Icon = menu.icon;
            const isActive = currentMenu === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => {
                  router.push(menu.path);
                }}
                className={`
                  group flex items-center gap-3 w-full text-left overflow-hidden
                  transition-all duration-200 rounded-xl
                  ${!sidebarExpanded ? 'justify-center !px-0 !gap-0' : 'px-3'}
                  ${sidebarExpanded ? 'h-[52px]' : 'h-[44px]'}
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-50/80 to-indigo-50/40 text-purple-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
                title={!sidebarExpanded ? `${menu.name} · ${menu.subtitle}` : undefined}
              >
                {/* 图标 - 统一 20px */}
                <div className={`shrink-0 flex items-center justify-center ${!sidebarExpanded ? 'w-full' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
                {/* 文字区 */}
                {sidebarExpanded && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className={`font-medium truncate text-[13px] leading-tight ${isActive ? 'text-purple-700' : 'text-slate-700'}`}>
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
          authenticated ? (
            <div className="flex items-center gap-2.5">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0 ring-2 ring-slate-100" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-purple-600 text-xs font-semibold">
                    {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-700 truncate">{user?.nickname || '用户'}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] text-slate-400">免费版</span>
                  <button
                    onClick={() => router.push('/membership')}
                    className="text-[11px] text-purple-500 hover:text-purple-600 font-medium ml-0.5"
                  >
                    升级
                  </button>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                title="退出登录"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
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
          // 收缩模式
          authenticated ? (
            <button
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center"
              title={user?.nickname || '用户'}
            >
              <span className="text-purple-600 text-xs font-semibold">
                {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center hover:bg-purple-50 transition-colors"
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
