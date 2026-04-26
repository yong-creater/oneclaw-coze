'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { LogOut, User, Crown, ChevronDown } from 'lucide-react';

export default function LoginButton() {
  const { user, authenticated, logout, setShowLoginModal } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!authenticated) {
    return (
      <button
        onClick={() => setShowLoginModal(true)}
        className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        登录
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
            </span>
          </div>
        )}
        <span className="text-sm text-slate-600 hidden sm:inline max-w-[80px] truncate">
          {user?.nickname || '用户'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
            <Link
              href="/workspace"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <User className="w-4 h-4" />
              我的工作台
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
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
