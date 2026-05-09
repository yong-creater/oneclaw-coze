'use client';

import { MenuProvider } from '@/components/common/MenuProvider';
import SiteSidebar from '@/components/common/SiteSidebar';

function PageSwitcher({ children }: { children: React.ReactNode }) {
  const marginLeft = 88;

  return (
    <>
      <SiteSidebar />
      <main
        className="os-main-canvas min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto"
        style={{ marginLeft }}
      >
        {/* 全局 AI 氛围背景层 — fixed 定位覆盖整个右侧内容区 */}
        <div className="os-global-bg" aria-hidden="true">
          {/* 大面积模糊光斑 */}
          <div className="os-global-orb os-global-orb-top" />
          <div className="os-global-orb os-global-orb-right" />
          <div className="os-global-orb os-global-orb-mid" />
          {/* 柔和光带 */}
          <div className="os-light-band os-light-band-primary os-atmo-band-top" />
          <div className="os-light-band os-light-band-secondary os-atmo-band-mid" />
          {/* 漂浮微粒 */}
          <div className="os-mote os-mote-purple os-mote-1" />
          <div className="os-mote os-mote-cyan os-mote-2" />
          <div className="os-mote os-mote-blue os-mote-3" />
          <div className="os-mote os-mote-purple os-mote-4" />
          <div className="os-mote os-mote-cyan os-mote-5" />
          <div className="os-mote os-mote-blue os-mote-6" />
          <div className="os-mote os-mote-purple os-mote-7" />
          <div className="os-mote os-mote-cyan os-mote-8" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
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
