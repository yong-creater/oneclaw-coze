'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import { SiteLogo } from '@/components/common/SiteLogo';
import {
  Home,
  Wand2,
  LayoutTemplate,
  Lightbulb,
  FolderOpen,
  ChevronRight,
  Crown,
  Moon,
  Bell,
  Settings,
  User,
} from 'lucide-react';

// ========== 菜单数据结构（带图标颜色和副标题） ==========
const menuList = [
  { id: 'home' as const, name: '首页', icon: Home, color: 'text-emerald-500', href: '/' },
  { id: 'tools' as const, name: '小工具', icon: Wand2, color: 'text-purple-500', desc: '商品图、详情页、视频等' },
  { id: 'template' as const, name: '模板', icon: LayoutTemplate, color: 'text-emerald-500', desc: '海量模板，一键使用' },
  { id: 'prompt' as const, name: '提示库', icon: Lightbulb, color: 'text-amber-500', desc: '优质提示词，激发灵感' },
  { id: 'project' as const, name: '我的项目', icon: FolderOpen, color: 'text-blue-500', desc: '管理您的生成内容' },
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
    <aside className="fixed left-0 top-0 w-[240px] h-screen bg-white border-r border-slate-100 flex flex-col z-30">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-slate-100 shrink-0">
        <SiteLogo size={22} showText />
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-emerald-600' : menu.color}`} />
                <span className="truncate font-medium">{menu.name}</span>
              </Link>
            );
          }

          // 带副标题的导航项
          return (
            <div key={menu.id}>
              <button
                onClick={() => {
                  setCurrentMenu(menu.id);
                  if (isTools) setToolsExpanded(!toolsExpanded);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all ${
                  isActive
                    ? 'bg-slate-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${menu.color}`} />
                <div className="flex-1 text-left min-w-0">
                  <div className={`font-medium truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {menu.name}
                  </div>
                  {menu.desc && (
                    <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                      {menu.desc}
                    </div>
                  )}
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                    isTools && toolsExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* 小工具子菜单 */}
              {isTools && toolsExpanded && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
                  {toolSubItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isToolSubActive(sub.href)
                          ? 'text-emerald-600 font-medium bg-emerald-50'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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

      {/* 会员升级卡片 */}
      <div className="px-3 pb-2 shrink-0">
        <div className="bg-slate-50 rounded-[10px] p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800">解锁全部高级功能</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">升级会员，享无限生成、高清导出等特权</div>
            </div>
          </div>
          <Link
            href="/membership"
            className="mt-2.5 block w-full text-center py-1.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}
          >
            立即升级
          </Link>
        </div>
      </div>

      {/* 底部功能图标 */}
      <div className="px-5 py-2 flex items-center gap-1 border-t border-slate-100 shrink-0">
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <Moon className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 用户信息 */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-700 truncate">OneClaw 用户</div>
            <div className="text-[10px] text-slate-400">免费版</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
