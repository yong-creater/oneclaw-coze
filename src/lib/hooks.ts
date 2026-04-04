'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// 获取或创建用户ID
export function useUserId(): string {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let id = localStorage.getItem('oneclaw_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('oneclaw_user_id', id);
    }
    // 使用 setTimeout 避免同步 setState 警告
    setTimeout(() => setUserId(id), 0);
  }, []);

  return userId;
}

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// API请求Hook（带缓存和取消）
export function useFetch<T>(
  url: string | null,
  options?: {
    enabled?: boolean;
    cache?: boolean;
    cacheKey?: string;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async () => {
    if (!url || options?.enabled === false) return;

    // 检查缓存
    if (options?.cache !== false && options?.cacheKey) {
      const cached = cacheRef.current.get(options.cacheKey);
      if (cached && Date.now() - cached.timestamp < 60000) {
        setData(cached.data);
        return;
      }
    }

    // 取消之前的请求
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        // 存入缓存
        if (options?.cacheKey) {
          cacheRef.current.set(options.cacheKey, {
            data: json.data,
            timestamp: Date.now(),
          });
        }
      } else {
        throw new Error(json.error || '请求失败');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options?.enabled, options?.cache, options?.cacheKey]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

// 分页状态Hook
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const nextPage = useCallback(() => {
    setPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    reset,
    offset: (page - 1) * limit,
  };
}

// LocalStorage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// 网络状态Hook
export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 使用 setTimeout 避免同步 setState 警告
    setTimeout(() => setIsOnline(navigator.onLine), 0);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
