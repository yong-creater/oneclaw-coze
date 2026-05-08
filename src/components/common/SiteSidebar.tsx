'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import { SiteLogo } from '@/components/common/SiteLogo';
import {
  Home,
  Wrench,
  LayoutTemplate,
  BookOpen,
  FolderOpen,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';

// ========== 菜单数据结构 ==========
const menuList = [
  { id: 'home' as const, name: '首页', icon: Home, href: '/' },
  { id: 'tools' as const, name: '小工具', icon: Wrench },
  { id: 'template' as const, name: '模板', icon: LayoutTemplate },
  { id: 'prompt' as const, name: '提示库', icon: BookOpen },
  { id: 'project' as const, name: '我的项目', icon: FolderOpen },
];

// ========== 小工具子菜单 ==========
const toolSubItems = [
  { name: '商品图生成', href: '/product-generator' },
  { name: '智能抠图', href: '/background-removal' },
  { name: 'AI写真', href: '/ai-photo' },
  { name: '商品海报', href: '/product-poster' },
  { name: '小红书图文', href: '/xiaohongshu-generator' },
  { name: '小说创作', href: '/novel' },
  { name: '简历优化', href: '/resume' },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const { currentMenu, setCurrentMenu } = useMenu();
  const [toolsExpanded, setToolsExpanded] = useState(false);

  // 根据路径推断当前菜单
  useEffect(() => {
    if (pathname === '/') {
      setCurrentMenu('home');
    } else if (pathname.startsWith('/product-generator') ||
               pathname.startsWith('/background-removal') ||
               pathname.startsWith('/ai-photo') ||
               pathname.startsWith('/product-poster') ||
               pathname.startsWith('/xiaohongshu-generator') ||
               pathname.startsWith('/novel') ||
               pathname.startsWith('/resume') ||
               pathname.startsWith('/productpage')) {
      setCurrentMenu('tools');
      setToolsExpanded(true);
    }
  }, [pathname, setCurrentMenu]);

  // 判断小工具子项是否激活
  const isToolSubActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="fixed left-0 top-0 w-[240px] h-screen bg-white border-r border-slate-200 flex flex-col z-30">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0">
        <SiteLogo size={24} showText />
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentMenu === menu.id;
          const isTools = menu.id === 'tools';

          // 首页用 Link 导航
          if (menu.href) {
            return (
              <Link
                key={menu.id}
                href={menu.href}
                onClick={() => setCurrentMenu(menu.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{menu.name}</span>
              </Link>
            );
          }

          // 小工具（可展开）
          return (
            <div key={menu.id}>
              <button
                onClick={() => {
                  setCurrentMenu(menu.id);
                  setToolsExpanded(!toolsExpanded);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{menu.name}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    toolsExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* 子菜单 */}
              {isTools && toolsExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {toolSubItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block px-3 py-1.5 rounded-[10px] text-xs transition-colors ${
                        isToolSubActive(sub.href)
                          ? 'text-brand font-medium bg-brand/5'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 底部登录 */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <LoginButton />
      </div>
    </aside>
  );
}
