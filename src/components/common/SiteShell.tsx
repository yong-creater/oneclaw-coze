'use client';

import { MenuProvider, useMenu } from '@/components/common/MenuProvider';
import SiteSidebar from '@/components/common/SiteSidebar';

function PageSwitcher({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useMenu();

  const marginLeft = sidebarExpanded ? 240 : 68;

  return (
    <>
      <SiteSidebar />
      <main
        className="min-h-screen bg-[#F7F8FA] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto"
        style={{ marginLeft }}
      >
        <div className="p-8">
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
