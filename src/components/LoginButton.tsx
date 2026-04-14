'use client';

import { useUser } from '@/contexts/UserContext';
import { LogOut } from 'lucide-react';

export default function LoginButton() {
  const { user, authenticated, logout, setShowLoginModal } = useUser();

  return (
    <>
      {authenticated ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.nickname?.slice(0, 2).toUpperCase() || '用'}
              </span>
            </div>
          )}
          <span className="text-sm text-slate-600 hidden sm:inline">
            {user?.nickname || '用户'}
          </span>
          <button
            onClick={logout}
            className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          登录
        </button>
      )}
    </>
  );
}
