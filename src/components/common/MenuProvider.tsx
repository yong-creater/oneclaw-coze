'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ========== 类型 ==========
export type MenuId = 'home' | 'tools' | 'template' | 'prompt' | 'project';

interface MenuContextType {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
  pendingInput: string | null;
  setPendingInput: (input: string | null) => void;
  consumePendingInput: () => string | null;
  activeToolRoute: string | null;
  setActiveToolRoute: (route: string | null) => void;
}

// ========== Context ==========
const MenuContext = createContext<MenuContextType | null>(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}

// ========== Provider ==========
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [activeToolRoute, setActiveToolRouteState] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  const setSidebarExpandedCB = useCallback((v: boolean) => {
    setSidebarExpanded(v);
  }, []);

  const consumePendingInput = useCallback(() => {
    const input = pendingInput;
    setPendingInput(null);
    return input;
  }, [pendingInput]);

  const setActiveToolRoute = useCallback((route: string | null) => {
    setActiveToolRouteState(route);
  }, []);

  return (
    <MenuContext.Provider value={{
      sidebarExpanded,
      toggleSidebar,
      setSidebarExpanded: setSidebarExpandedCB,
      pendingInput,
      setPendingInput,
      consumePendingInput,
      activeToolRoute,
      setActiveToolRoute,
    }}>
      {children}
    </MenuContext.Provider>
  );
}
