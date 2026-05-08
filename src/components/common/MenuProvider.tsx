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
  // Sidebar 展开/收缩
  sidebarExpanded: boolean;
  setSidebarExpanded: (v: boolean) => void;
  toggleSidebar: () => void;
  // 工具子路由：点击工具卡片时设为true，点击小工具菜单时重置
  activeToolRoute: string | null;
  setActiveToolRoute: (route: string | null) => void;
}

// ========== Context ==========
const MenuContext = createContext<MenuContextValue | null>(null);

// ========== Provider ==========
export function MenuProvider({ children }: { children: ReactNode }) {
  const [currentMenu, setCurrentMenuState] = useState<MenuId>('home');
  const [pendingInput, setPendingInputState] = useState('');
  const [sidebarExpanded, setSidebarExpandedRaw] = useState(true);
  const [activeToolRoute, setActiveToolRoute] = useState<string | null>(null);

  const setCurrentMenu = useCallback((id: MenuId) => {
    setCurrentMenuState(id);
    // 切换菜单时重置工具子路由
    if (id !== 'tools') {
      setActiveToolRoute(null);
    }
  }, []);

  const setPendingInput = useCallback((text: string) => {
    setPendingInputState(text);
  }, []);

  const setSidebarExpanded = useCallback((v: boolean) => {
    setSidebarExpandedRaw(v);
  }, []);

  // 消费 pendingInput：读取后清空，确保只被消费一次
  const consumePendingInput = useCallback(() => {
    const text = pendingInput;
    setPendingInputState('');
    return text;
  }, [pendingInput]);

  const toggleSidebar = useCallback(() => {
    setSidebarExpandedRaw((prev: boolean) => !prev);
  }, []);

  return (
    <MenuContext.Provider
      value={{
        currentMenu,
        setCurrentMenu,
        pendingInput,
        setPendingInput,
        consumePendingInput,
        sidebarExpanded,
        setSidebarExpanded,
        toggleSidebar,
        activeToolRoute,
        setActiveToolRoute,
      }}
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
