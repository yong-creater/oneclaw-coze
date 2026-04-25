'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  ChevronRight, 
  Check, 
  Moon, 
  Sun, 
  Monitor,
  Crown,
  User,
  LogIn,
  CreditCard,
  Key
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// Toast 组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <Check className="w-5 h-5 text-green-400" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function MorePage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [toast, setToast] = useState<string | null>(null);
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="Settings" subtitle="Account & Preferences" />
        
        <div className="px-8 py-8 max-w-3xl mx-auto">
          {/* Account Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Account</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Guest User</h3>
                  <p className="text-sm text-slate-500">Sign in to unlock more features</p>
                </div>
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Preferences</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Profile */}
              <Link
                href="/settings/profile"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Profile</h3>
                    <p className="text-sm text-slate-500">Avatar, name, info</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* Password */}
              <Link
                href="/settings/password"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Key className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Password</h3>
                    <p className="text-sm text-slate-500">Change your password</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* VIP */}
              <Link
                href="/settings/vip"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                      Membership
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full">
                        Popular
                      </span>
                    </h3>
                    <p className="text-sm text-slate-500">Upgrade to premium</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* Credits */}
              <Link
                href="/settings/credits"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Credits</h3>
                    <p className="text-sm text-slate-500">Balance & history</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">System</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Appearance */}
              <Link
                href="/settings/appearance"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Appearance</h3>
                    <p className="text-sm text-slate-500">Theme, font size</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* Notifications */}
              <Link
                href="/settings/notifications"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Notifications</h3>
                    <p className="text-sm text-slate-500">Push, email alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* Privacy */}
              <Link
                href="/settings/privacy"
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Privacy & Security</h3>
                    <p className="text-sm text-slate-500">Data, permissions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Dark Mode</h3>
                    <p className="text-sm text-slate-500">
                      {theme === 'light' ? 'Light theme' : theme === 'dark' ? 'Dark theme' : 'Follow system'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTheme(t); setToast('Theme updated'); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        theme === t 
                          ? 'bg-white text-orange-500 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t === 'light' ? <Sun className="w-4 h-4" /> : t === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Footer />
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
