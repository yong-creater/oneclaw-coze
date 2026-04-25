'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  showRightArea?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  badge,
  showRightArea = true,
  rightContent,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Title */}
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          )}
          {badge && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full shadow-sm">
              {badge}
            </span>
          )}
        </div>

        {/* Right - Actions */}
        {showRightArea && (
          <div className="flex items-center gap-3">
            {rightContent ? (
              rightContent
            ) : (
              <>
                {/* Search */}
                <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
                  <Search className="w-4 h-4" />
                </button>
                {/* Notifications */}
                <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
