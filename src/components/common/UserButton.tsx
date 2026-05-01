'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Crown, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function UserButton() {
  const { user, authenticated, loading, logout, setShowLoginModal } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  // 加载中
  if (loading) {
    return (
      <Button variant="outline" size="sm" className="gap-1" disabled>
        <div className="w-4 h-4 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
      </Button>
    );
  }

  // 未登录
  if (!authenticated || !user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1"
        onClick={() => setShowLoginModal(true)}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">登录</span>
      </Button>
    );
  }

  // 已登录
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.nickname || '用户'} 
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {(user.nickname?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden sm:inline text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
          {user.nickname || user.email || '用户'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
          <Link
            href="/membership"
            onClick={() => setShowDropdown(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Settings className="w-4 h-4" />
            会员中心
          </Link>
          <Link
            href="/membership"
            onClick={() => setShowDropdown(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Crown className="w-4 h-4 text-orange-500" />
            会员中心
          </Link>
          <hr className="my-1 border-slate-200 dark:border-slate-700" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
