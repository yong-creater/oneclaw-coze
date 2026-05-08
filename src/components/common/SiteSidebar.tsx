'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenu, type MenuId } from '@/components/common/MenuProvider';
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
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

// ========== 菜单数据结构 ==========
const menuList: Array<{
  id: MenuId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  desc: string;
  href?: string;
}> = [
  { id: 'home', name: '首页', icon: Home, gradient: 'from-violet-500 to-purple-600', desc: 'AI创作工作台', href: '/' },
  { id: 'tools', name: '小工具', icon: Wand2, gradient: 'from-fuchsia-500 to-pink-500', desc: '商品图、详情页等' },
  { id: 'template', name: '模板', icon: LayoutTemplate, gradient: 'from-emerald-400 to-teal-500', desc: '海量模板一键用' },
  { id: 'prompt', name: '提示库', icon: Lightbulb, gradient: 'from-amber-400 to-orange-500', desc: '优质提示词灵感' },
  { id: 'project', name: '项目', icon: FolderOpen, gradient: 'from-blue-400 to-indigo-500', desc: '管理生成内容' },
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
  const { currentMenu, setCurrentMenu, sidebarExpanded, toggleSidebar } = useMenu();
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

  const sidebarWidth = sidebarExpanded ? 240 : 68;

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-100/80 flex flex-col z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ width: sidebarWidth }}
    >
      {/* Logo + 折叠按钮 */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-100/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <SiteLogo size={22} showText={sidebarExpanded} />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0"
          title={sidebarExpanded ? '收起侧栏' : '展开侧栏'}
        >
          {sidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 py-2 px-2.5 overflow-y-auto scrollbar-hide">
        <div className="space-y-0.5">
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
                  className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item-active' : ''} ${!sidebarExpanded ? 'justify-center' : ''}`}
                  title={!sidebarExpanded ? menu.name : undefined}
                >
                  <div className={`os-icon-bg bg-gradient-to-br ${menu.gradient} text-white shrink-0`}
                       style={{ width: 36, height: 36, borderRadius: 10 }}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {sidebarExpanded && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className={`font-medium truncate text-sm ${isActive ? 'text-purple-700' : 'text-slate-700'}`}>
                        {menu.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                        {menu.desc}
                      </div>
                    </div>
                  )}
                </Link>
              );
            }

            // 带子菜单的导航项
            return (
              <div key={menu.id}>
                <button
                  onClick={() => {
                    setCurrentMenu(menu.id);
                    if (isTools) setToolsExpanded(!toolsExpanded);
                  }}
                  className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item-active' : ''} ${!sidebarExpanded ? 'justify-center' : ''}`}
                  title={!sidebarExpanded ? menu.name : undefined}
                >
                  <div className={`os-icon-bg bg-gradient-to-br ${menu.gradient} text-white shrink-0`}
                       style={{ width: 36, height: 36, borderRadius: 10 }}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {sidebarExpanded && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className={`font-medium truncate text-sm ${isActive ? 'text-purple-700' : 'text-slate-700'}`}>
                        {menu.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                        {menu.desc}
                      </div>
                    </div>
                  )}
                  {sidebarExpanded && isTools && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                        toolsExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </button>

                {/* 小工具子菜单 */}
                {isTools && toolsExpanded && sidebarExpanded && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
                    {toolSubItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isToolSubActive(sub.href)
                            ? 'text-purple-600 font-medium bg-purple-50'
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
        </div>
      </nav>

      {/* 底部区域 */}
      {sidebarExpanded && (
        <div className="px-3 pb-2 shrink-0 animate-fade-slide-up">
          {/* 会员升级卡片 */}
          <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-3 border border-purple-100/50">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">解锁全部高级功能</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">无限生成、高清导出等特权</div>
              </div>
            </div>
            <Link
              href="/membership"
              className="mt-2.5 block w-full text-center py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D2FF)' }}
            >
              立即升级
            </Link>
          </div>
        </div>
      )}

      {/* 底部功能图标 */}
      <div className={`px-3 py-2 flex items-center gap-1 border-t border-slate-100/80 shrink-0 ${sidebarExpanded ? '' : 'justify-center'}`}>
        {sidebarExpanded ? (
          <>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 用户信息 */}
      <div className={`px-3 py-3 border-t border-slate-100/80 shrink-0 ${sidebarExpanded ? '' : 'flex justify-center'}`}>
        {sidebarExpanded ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-700 truncate">OneClaw 用户</div>
              <div className="text-[10px] text-slate-400">免费版</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </aside>
  );
}
