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
  // 组件卸载时取消 pending 请求
  const abortRef = useRef<AbortController | null>(null);

  // 检查登录状态
  useEffect(() => {
    checkAuth();
    return () => { abortRef.current?.abort(); };
  }, []);

  const checkAuth = async () => {
    let authenticatedUser: User | null = null;
    try {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const res = await fetch('/api/auth', { signal: ac.signal });
      const data = await res.json();

      if (data.success && data.authenticated) {
        authenticatedUser = data.data;
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

      // loading 结束后，如果有暂存的回调且已登录，自动执行
      // （场景：loading 中点击"开始生成"，checkAuth 完成后发现已登录，应继续执行）
      const action = pendingActionRef.current;
      if (action && authenticatedUser) {
        pendingActionRef.current = null;
        setTimeout(() => action(), 100);
      } else if (action && !authenticatedUser) {
        // loading 结束后未登录，弹出登录弹窗
        setShowLoginModal(true);
      }
    }
  };

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota/daily-generations', { credentials: 'include', signal: abortRef.current?.signal });
      const data = await res.json();
      if (data.remaining !== undefined) {
        setDailyQuota(data.remaining);
      }
    } catch (err: unknown) {
      // AbortError is expected on unmount
      if (err instanceof DOMException && err.name === 'AbortError') return;
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
    // loading 中暂存回调，等 checkAuth 完成后自动执行
    if (loading) {
      if (callback) {
        pendingActionRef.current = callback;
      }
      return false;
    }
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
