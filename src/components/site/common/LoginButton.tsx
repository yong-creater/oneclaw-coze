'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { LogOut, User, FolderOpen } from 'lucide-react';

export default function LoginButton() {
  const { user, authenticated, logout, setShowLoginModal } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!authenticated) {
    return (
      <button
        onClick={() => setShowLoginModal(true)}
        className="os-btn-primary w-full !text-xs !h-9"
      >
        登录
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center gap-2.5 px-0 py-0 bg-transparent hover:bg-transparent rounded-none transition-colors"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#5B8CFF] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-medium">
              {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <div className="text-xs font-medium text-slate-700 truncate">{user?.nickname || '用户'}</div>
        </div>
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
            <Link
              href="/projects"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <FolderOpen className="w-4 h-4" />
              我的作品
            </Link>
            <Link
              href="/workspace"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User className="w-4 h-4" />
              个人中心
            </Link>
            <hr className="my-1 border-slate-100" />
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-slate-50"
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
