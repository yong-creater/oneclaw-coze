'use client';

import { usePathname } from 'next/navigation';
import { MenuProvider } from '@/components/site/common/MenuProvider';
import SiteSidebar from '@/components/site/common/SiteSidebar';
import SiteFooter from '@/components/site/common/SiteFooter';

// 全屏工作台页面（紧贴侧边栏，无间距）
const WORKBENCH_PATHS = ['/', '/create'];

function PageSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkbench = WORKBENCH_PATHS.some(p => pathname.startsWith(p));

  if (isWorkbench) {
    return (
      <>
        <SiteSidebar />
        <main className="os-dock-page os-dock-page-workbench">
          <div className="os-dock-page-inner os-dock-page-inner-workbench">
            {children}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteSidebar />
      <main className="os-dock-page os-main-canvas">
        {/* 全局 AI 氛围背景层 — fixed 定位覆盖整个右侧内容区 */}
        <div className="os-global-bg" aria-hidden="true">
          <div className="os-global-orb os-global-orb-top" />
          <div className="os-global-orb os-global-orb-bl" />
          <div className="os-global-orb os-global-orb-br" />
        </div>
        <div className="os-dock-page-inner">
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <SiteFooter />
        </div>
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
