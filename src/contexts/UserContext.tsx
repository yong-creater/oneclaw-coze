'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

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
  /** 每日免费生成剩余次数（-1=未登录, null=加载中） */
  dailyQuota: number | null;
  /** 刷新每日配额 */
  refreshQuota: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dailyQuota, setDailyQuota] = useState<number | null>(null);

  // 存储：登录成功后需要自动执行的回调
  const pendingActionRef = useRef<(() => void) | null>(null);

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
        if (typeof window !== 'undefined' && data.data?.user_id) {
          localStorage.setItem('oneclaw_user_id', data.data.user_id);
        }
        // 登录状态确认后，获取配额
        fetchQuota();
      } else {
        setUser(null);
        setDailyQuota(-1); // 未登录
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oneclaw_user_id');
        }
      }
    } catch {
      setUser(null);
      setDailyQuota(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota/daily-generations', { credentials: 'include' });
      const data = await res.json();
      if (data.remaining !== undefined) {
        setDailyQuota(data.remaining);
      }
    } catch {
      // 静默失败
    }
  };

  const refreshQuota = async () => {
    if (user) {
      await fetchQuota();
    }
  };

  const login = async () => {
    await checkAuth();
    setShowLoginModal(false);

    // 登录成功后，执行暂存的回调
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) {
      // 使用 setTimeout 确保状态更新完成后再执行
      setTimeout(() => action(), 100);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUser(null);
      setDailyQuota(-1);
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  // 检查是否需要登录
  const requireAuth = (callback?: () => void): boolean => {
    if (!user) {
      // 暂存回调：登录成功后自动执行
      if (callback) {
        pendingActionRef.current = callback;
      }
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
      requireAuth,
      dailyQuota,
      refreshQuota,
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
