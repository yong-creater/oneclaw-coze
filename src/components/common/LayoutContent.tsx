'use client';

import { ReactNode } from 'react';
import { Sidebar, SidebarProvider, useSidebar, Footer } from '@/components/common';
import { cn } from '@/lib/utils';

interface LayoutContentProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * 统一布局组件
 * 包含侧边栏、头部插槽和内容区域
 * 自动响应侧边栏折叠状态
 */
export function LayoutContent({ children, showFooter = true }: LayoutContentProps) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* 左侧统一导航 */}
      <Sidebar />
      
      {/* 主内容区 - 响应侧边栏折叠状态 */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-[72px]" : "ml-56"
      )}>
        {/* 页面内容 */}
        <div className="p-8">
          {children}
        </div>
      </main>
      
      {/* 底部 - 响应侧边栏折叠状态 */}
      {showFooter && (
        <div className={cn("transition-all duration-300", collapsed ? "ml-[72px]" : "ml-56")}>
          <Footer />
        </div>
      )}
    </div>
  );
}

/**
 * 带 SidebarProvider 的布局包装器
 * 用于页面组件
 */
export function PageLayout(props: LayoutContentProps) {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
}

export { SidebarProvider };
