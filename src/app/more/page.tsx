'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Palette, Bell, Shield, 
  ChevronRight, Check, Moon, Sun, Monitor, Globe, Smartphone,
  Crown, User, LogIn, MoonStar, Key, CreditCard
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 账户设置项
const ACCOUNT_SETTINGS = [
  { id: 'profile', icon: User, label: '个人资料', desc: '头像、昵称、个人信息', href: '/settings/profile' },
  { id: 'password', icon: Key, label: '修改密码', desc: '登录密码设置', href: '/settings/password' },
  { id: 'vip', icon: Crown, label: '会员中心', desc: '套餐购买、特权管理', href: '/settings/vip', highlight: true },
  { id: 'credits', icon: CreditCard, label: '积分中心', desc: '积分余额、充值记录', href: '/settings/credits' },
];

// 系统设置项
const SYSTEM_SETTINGS = [
  { id: 'appearance', icon: Palette, label: '外观设置', desc: '主题、字体大小', href: '/settings/appearance' },
  { id: 'notifications', icon: Bell, label: '通知设置', desc: '消息推送、提醒', href: '/settings/notifications' },
  { id: 'privacy', icon: Shield, label: '隐私安全', desc: '数据保护、权限', href: '/settings/privacy' },
];

// Toast 组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-400" />
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function MorePage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [toast, setToast] = useState<string | null>(null);
  const { collapsed } = useSidebar();

  // 切换通知设置
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setToast(`${notifications[key] ? '已关闭' : '已开启'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10">
      {/* 左侧统一导航 - md 以上显示 */}
      <Sidebar />

      {/* 主内容区 - 响应式布局 */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        {/* 统一顶部 */}
        <Header title="设置" subtitle="账户与偏好" showRightArea={false} />

        <div className="p-4 md:p-8 max-w-2xl mx-auto">
          {/* 账户卡片 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">我的账户</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">未登录用户</h3>
                  <p className="text-sm text-slate-500 mt-0.5">登录后解锁更多功能</p>
                </div>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  登录
                </Link>
              </div>
            </div>
          </div>

          {/* 账户设置列表 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">账户设置</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {ACCOUNT_SETTINGS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.highlight ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-slate-100'}`}>
                        <Icon className={`w-5 h-5 ${item.highlight ? 'text-orange-500' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800 flex items-center gap-2">
                          {item.label}
                          {item.highlight && (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full">
                              推荐
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 系统设置列表 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">偏好设置</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {SYSTEM_SETTINGS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{item.label}</h3>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                );
              })}

              {/* 深色模式 - 内联切换 */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">深色模式</h3>
                    <p className="text-sm text-slate-500">
                      {theme === 'light' ? '浅色主题' : theme === 'dark' ? '深色主题' : '跟随系统'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTheme(t); setToast('主题已切换'); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* 底部 */}
        <div className="ml-[268px]">
          <Footer />
        </div>
      </main>

      {/* Toast 提示 */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
