'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import { useMenu, type MenuId } from '@/components/common/MenuProvider';
import {
  Home,
  Wrench,
  LayoutTemplate,
  MessageSquareText,
  FolderKanban,
  Package,
  Scissors,
  Camera,
  Image,
  FileText,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// ========== 菜单数据结构 ==========
const menuList = [
  { id: 'home' as MenuId, name: '首页', icon: Home },
  { id: 'tools' as MenuId, name: '小工具', icon: Wrench },
  { id: 'template' as MenuId, name: '模板', icon: LayoutTemplate },
  { id: 'prompt' as MenuId, name: '提示库', icon: MessageSquareText },
  { id: 'project' as MenuId, name: '我的项目', icon: FolderKanban },
];

// 子菜单映射
const SUB_MENUS: Record<string, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  tools: [
    { href: '/product-generator', label: '商品图生成', icon: Package },
    { href: '/background-removal', label: '智能抠图', icon: Scissors },
    { href: '/ai-photo', label: 'AI 写真', icon: Camera },
    { href: '/product-poster', label: '商品海报', icon: Image },
    { href: '/xiaohongshu-generator', label: '小红书图文', icon: FileText },
    { href: '/novel', label: '小说洗稿', icon: BookOpen },
    { href: '/resume', label: '简历优化', icon: Sparkles },
  ],
};

// 根据 pathname 推断当前菜单
function inferMenuFromPath(pathname: string): MenuId {
  if (pathname === '/') return 'home';
  const toolPaths = ['/product-generator', '/background-removal', '/ai-photo', '/product-poster', '/xiaohongshu-generator', '/novel', '/resume'];
  if (toolPaths.some((p) => pathname.startsWith(p))) return 'tools';
  if (pathname.startsWith('/template')) return 'template';
  if (pathname.startsWith('/prompt')) return 'prompt';
  if (pathname.startsWith('/project')) return 'project';
  return 'home';
}

export default function SiteSidebar() {
  const pathname = usePathname();
  const { currentMenu, setCurrentMenu } = useMenu();

  // pathname 变化时同步菜单状态
  const inferredMenu = inferMenuFromPath(pathname);
  if (currentMenu !== inferredMenu) {
    setCurrentMenu(inferredMenu);
  }

  const handleMenuClick = (id: MenuId) => {
    setCurrentMenu(id);
  };

  const isSubActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col">
      {/* Logo 区域 */}
      <div className="h-14 flex items-center px-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <SiteLogo size={28} showText />
      </div>

      {/* 菜单导航 */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentMenu === menu.id;
          const subItems = SUB_MENUS[menu.id];

          return (
            <div key={menu.id}>
              {/* 一级菜单项 */}
              {menu.id === 'home' ? (
                <Link
                  href="/"
                  onClick={() => handleMenuClick(menu.id)}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  {/* 左侧高亮条 */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
                  )}
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
                  <span>{menu.name}</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleMenuClick(menu.id)}
                  className={`
                    group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  {/* 左侧高亮条 */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
                  )}
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
                  <span className="flex-1 text-left">{menu.name}</span>
                  {subItems && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`}
                    />
                  )}
                </button>
              )}

              {/* 子菜单展开 */}
              {subItems && isActive && (
                <div className="mt-1 ml-3 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
                  {subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive = isSubActive(sub.href);

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`
                          flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors
                          ${subActive
                            ? 'text-orange-600 dark:text-orange-400 font-medium bg-orange-50/50 dark:bg-orange-500/5'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                      >
                        <SubIcon className={`w-[15px] h-[15px] shrink-0 ${subActive ? 'text-orange-400' : ''}`} />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 底部：登录按钮 */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <LoginButton />
      </div>
    </aside>
  );
}
