'use client';

import { usePathname } from 'next/navigation';
import { MenuProvider, useMenu, type MenuId } from '@/components/common/MenuProvider';
import SiteSidebar from '@/components/common/SiteSidebar';
import HomePage from '@/components/pages/HomePage';
import ToolsPage from '@/components/pages/ToolsPage';
import TemplatePage from '@/components/pages/TemplatePage';
import PromptPage from '@/components/pages/PromptPage';
import ProjectPage from '@/components/pages/ProjectPage';

// 页面组件映射（create 复用 HomePage）
const PAGE_MAP: Record<MenuId, React.ComponentType> = {
  home: HomePage,
  create: HomePage,
  tools: ToolsPage,
  template: TemplatePage,
  prompt: PromptPage,
  project: ProjectPage,
};

// 工具子路由前缀
const TOOL_PATHS = [
  '/product-generator',
  '/background-removal',
  '/ai-photo',
  '/product-poster',
  '/xiaohongshu-generator',
  '/novel',
  '/resume',
  '/productpage',
];

function PageSwitcher({ children }: { children: React.ReactNode }) {
  const { currentMenu, sidebarExpanded } = useMenu();
  const pathname = usePathname();

  // 判断当前是否在工具子路由上
  const isOnToolSubRoute = TOOL_PATHS.some((p) => pathname.startsWith(p));

  // 动态计算主区域偏移
  const marginLeft = sidebarExpanded ? 240 : 68;

  // 工具菜单下：如果正在某个工具子路由，渲染 children（Next.js 路由页面）
  if (currentMenu === 'tools' && isOnToolSubRoute) {
    return (
      <>
        <SiteSidebar />
        <main
          className="min-h-screen bg-[#F7F8FA] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ marginLeft }}
        >
          <div className="p-8">
            {children}
          </div>
        </main>
      </>
    );
  }

  // 其他菜单：渲染对应页面组件
  const ActivePage = PAGE_MAP[currentMenu];

  return (
    <>
      <SiteSidebar />
      <main
        className="min-h-screen bg-[#F7F8FA] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto"
        style={{ marginLeft }}
      >
        <ActivePage />
      </main>
    </>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <PageSwitcher>{children}</PageSwitcher>
    </MenuProvider>
  );
}
