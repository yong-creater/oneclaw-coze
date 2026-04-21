'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  user_id: string;
  nickname?: string;
  email?: string;
  avatar_url?: string;
  openid?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  requireAuth: (callback?: () => void) => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      
      if (data.success && data.authenticated) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await checkAuth();
    setShowLoginModal(false);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUser(null);
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  // 检查是否需要登录
  const requireAuth = (callback?: () => void): boolean => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    callback?.();
    return true;
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      authenticated: !!user,
      login,
      logout,
      showLoginModal,
      setShowLoginModal,
      requireAuth
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
