'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ========== 类型 ==========
export type MenuId = 'create' | 'inspire' | 'projects';

interface MenuContextType {
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
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [activeToolRoute, setActiveToolRouteState] = useState<string | null>(null);

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
