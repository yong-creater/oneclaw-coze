'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ========== 菜单 ID 类型 ==========
export type MenuId = 'home' | 'tools' | 'template' | 'prompt' | 'project';

// ========== Context 值类型 ==========
interface MenuContextValue {
  currentMenu: MenuId;
  setCurrentMenu: (id: MenuId) => void;
}

// ========== Context ==========
const MenuContext = createContext<MenuContextValue | null>(null);

// ========== Provider ==========
export function MenuProvider({ children }: { children: ReactNode }) {
  const [currentMenu, setCurrentMenuState] = useState<MenuId>('home');

  const setCurrentMenu = useCallback((id: MenuId) => {
    setCurrentMenuState(id);
  }, []);

  return (
    <MenuContext.Provider value={{ currentMenu, setCurrentMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

// ========== Hook ==========
export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
