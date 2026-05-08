'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ========== 菜单 ID 类型 ==========
export type MenuId = 'home' | 'tools' | 'template' | 'prompt' | 'project';

// ========== Context 值类型 ==========
interface MenuContextValue {
  currentMenu: MenuId;
  setCurrentMenu: (id: MenuId) => void;
  // 模板→首页 填充输入
  pendingInput: string;
  setPendingInput: (text: string) => void;
  consumePendingInput: () => string;
}

// ========== Context ==========
const MenuContext = createContext<MenuContextValue | null>(null);

// ========== Provider ==========
export function MenuProvider({ children }: { children: ReactNode }) {
  const [currentMenu, setCurrentMenuState] = useState<MenuId>('home');
  const [pendingInput, setPendingInputState] = useState('');

  const setCurrentMenu = useCallback((id: MenuId) => {
    setCurrentMenuState(id);
  }, []);

  const setPendingInput = useCallback((text: string) => {
    setPendingInputState(text);
  }, []);

  // 消费 pendingInput：读取后清空，确保只被消费一次
  const consumePendingInput = useCallback(() => {
    const text = pendingInput;
    setPendingInputState('');
    return text;
  }, [pendingInput]);

  return (
    <MenuContext.Provider
      value={{ currentMenu, setCurrentMenu, pendingInput, setPendingInput, consumePendingInput }}
    >
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
