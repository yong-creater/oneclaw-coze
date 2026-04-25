'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Palette, Bell, Shield, 
  FileText, ChevronRight, Check, Moon, Sun, Globe, Smartphone,
  Crown, User, MoonStar, Monitor, 
  HelpCircle, ExternalLink, Mail
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 设置分类
const SETTINGS_CATEGORIES = [
  { id: 'account', icon: User, label: '账户设置', desc: '个人信息、登录密码', color: 'from-blue-100 to-sky-100' },
  { id: 'appearance', icon: Palette, label: '外观设置', desc: '主题、字体大小', color: 'from-purple-100 to-violet-100' },
  { id: 'notifications', icon: Bell, label: '通知设置', desc: '消息推送、提醒', color: 'from-amber-100 to-orange-100' },
  { id: 'privacy', icon: Shield, label: '隐私安全', desc: '数据保护、权限', color: 'from-green-100 to-emerald-100' },
  { id: 'vip', icon: Crown, label: '会员中心', desc: '套餐购买、特权', color: 'from-orange-100 to-amber-100', highlight: true },
  { id: 'about', icon: FileText, label: '关于我们', desc: '使用协议、帮助', color: 'from-slate-100 to-gray-100' },
];

// 帮助与支持列表
const HELP_ITEMS = [
  { id: 'help', icon: HelpCircle, label: '使用帮助', desc: '常见问题解答', href: '/help' },
  { id: 'feedback', icon: Mail, label: '意见反馈', desc: '提交您的建议', href: '/feedback' },
  { id: 'docs', icon: ExternalLink, label: '使用文档', desc: '详细功能说明', href: '/docs' },
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

  // 切换设置项
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setToast(`${notifications[key] ? '已关闭' : '已开启'}通知`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10">
      {/* 左侧统一导航 - md 以上显示 */}
      <Sidebar />

      {/* 主内容区 - 响应式布局 */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        {/* 统一顶部 */}
        <Header title="更多" subtitle="设置与服务" showRightArea={false} />

        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          {/* 账户卡片 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">账户信息</h2>
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
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 transition-all"
                >
                  立即登录
                </Link>
              </div>
            </div>
          </div>

          {/* 设置分类 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {SETTINGS_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/more/${category.id}`}
                  className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-xl hover:border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 ${category.highlight ? 'ring-4 ring-orange-200' : ''}`}>
                    <Icon className={`w-6 h-6 ${category.highlight ? 'text-orange-500' : 'text-slate-600'}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">{category.label}</h3>
                  <p className="text-sm text-slate-500">{category.desc}</p>
                  {category.highlight && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" />
                      会员专属
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 偏好设置 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">偏好设置</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {/* 主题 */}
              <div className="flex items-center justify-between p-5">
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

              {/* 语言 */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">语言</h3>
                    <p className="text-sm text-slate-500">简体中文</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* 邮件通知 */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">邮件通知</h3>
                    <p className="text-sm text-slate-500">接收产品更新和活动通知</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('email')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.email ? 'bg-orange-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* 推送通知 */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">推送通知</h3>
                    <p className="text-sm text-slate-500">接收浏览器推送消息</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('push')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.push ? 'bg-orange-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* 帮助与支持 */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">帮助与支持</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {HELP_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
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
