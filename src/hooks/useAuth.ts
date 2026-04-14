'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  user_id: string;
  nickname?: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // 检查登录状态
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.success && data.authenticated) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 登录
  const login = async () => {
    // 打开登录弹窗逻辑
    setShowLogin(true);
  };

  // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUser(null);
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  // 需要登录
  const requireAuth = useCallback((callback?: () => void): boolean => {
    if (!user) {
      login();
      return false;
    }
    callback?.();
    return true;
  }, [user]);

  return {
    user,
    loading,
    authenticated: !!user,
    login,
    logout,
    showLogin,
    setShowLogin,
    requireAuth,
    checkAuth,
  };
}
