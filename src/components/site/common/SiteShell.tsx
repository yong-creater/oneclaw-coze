'use client';

import { usePathname } from 'next/navigation';
import { MenuProvider } from '@/components/site/common/MenuProvider';
import SiteSidebar from '@/components/site/common/SiteSidebar';
import SiteFooter from '@/components/site/common/SiteFooter';

// 不显示 Footer 的页面路径
const FOOTLESS_PATHS = ['/create'];

function PageSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = FOOTLESS_PATHS.some(p => pathname.startsWith(p));

  return (
    <>
      <SiteSidebar />
      <main className="os-dock-page">
        {/* 全局 AI 氛围背景层 — fixed 定位覆盖整个右侧内容区 */}
        <div className="os-global-bg" aria-hidden="true">
          <div className="os-global-orb os-global-orb-top" />
          <div className="os-global-orb os-global-orb-right" />
          <div className="os-global-orb os-global-orb-mid" />
          <div className="os-light-band os-light-band-primary os-atmo-band-top" />
          <div className="os-light-band os-light-band-secondary os-atmo-band-mid" />
          <div className="os-mote os-mote-purple os-mote-1" />
          <div className="os-mote os-mote-cyan os-mote-2" />
          <div className="os-mote os-mote-blue os-mote-3" />
          <div className="os-mote os-mote-purple os-mote-4" />
        </div>
        <div className="os-dock-page-inner">
          <div style={{ flex: 1 }}>
            {children}
          </div>
          {!hideFooter && <SiteFooter />}
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
