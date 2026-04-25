'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, User, Crown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  showRightArea?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ 
  title, 
  subtitle, 
  badge,
  showRightArea = true,
  rightContent 
}: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <span className="text-sm text-slate-400">{subtitle}</span>}
        {badge && (
          <Link
            href="/membership"
            className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full text-xs font-medium text-amber-600 flex items-center gap-1.5"
          >
            <Crown className="w-3 h-3" />
            {badge}
          </Link>
        )}
      </div>
      
      {showRightArea && (
        rightContent || (
          <div className="flex items-center gap-3">
            <Link 
              href="/vip"
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full"
            >
              开通会员
            </Link>
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <Link href="/login" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <User className="w-4 h-4 text-orange-500" />
              </div>
            </Link>
          </div>
        )
      )}
    </header>
  );
}

export default Header;
