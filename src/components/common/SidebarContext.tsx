'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

// 侧边栏宽度常量
export const SIDEBAR_EXPANDED_WIDTH = 268; // w-[268px]
export const SIDEBAR_COLLAPSED_WIDTH = 72; // w-[72px]
export const SIDEBAR_EXPANDED_ML = 'ml-56'; // 14rem = 224px
export const SIDEBAR_COLLAPSED_ML = 'ml-[72px]';
