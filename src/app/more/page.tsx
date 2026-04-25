'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Sparkles, Palette, Bell, Shield, 
  HelpCircle, FileText, MessageCircle, ExternalLink,
  ChevronRight, Check, Moon, Sun, Globe, Smartphone,
  CreditCard, Gift, Users, Star, Crown, Zap,
  Download, Trash2, User, LogOut, Key, Clock
} from 'lucide-react';
import { Sidebar, Header, Footer } from '@/components/common';

// 设置分类
const SETTINGS_CATEGORIES = [
  { id: 'account', icon: User, label: '账户设置', desc: '个人信息、登录密码', color: 'from-blue-100 to-sky-100' },
  { id: 'appearance', icon: Palette, label: '外观', desc: '主题、字体大小', color: 'from-purple-100 to-violet-100' },
  { id: 'notifications', icon: Bell, label: '通知', desc: '消息推送、提醒', color: 'from-amber-100 to-orange-100' },
  { id: 'privacy', icon: Shield, label: '隐私安全', desc: '数据保护、权限', color: 'from-green-100 to-emerald-100' },
  { id: 'vip', icon: Crown, label: '会员中心', desc: '套餐购买、特权', color: 'from-orange-100 to-amber-100', highlight: true },
  { id: 'about', icon: FileText, label: '关于我们', desc: '使用协议、帮助', color: 'from-slate-100 to-gray-100' },
];

// 功能服务列表
const FEATURES = [
  { id: 1, name: 'AI 抠图', desc: '一键去除背景', icon: '🪄', tool: '/tools/remove-bg', hot: true },
  { id: 2, name: '图片变清晰', desc: '模糊图片秒变高清', icon: '✨', tool: '/tools/enhance', hot: true },
  { id: 3, name: '小红书封面', desc: '爆款笔记封面', icon: '📕', tool: '/tools/xiaohongshu', hot: false },
  { id: 4, name: '节日海报', desc: '一键生成节日海报', icon: '🎉', tool: '/tools/festival-poster', hot: false },
  { id: 5, name: '商品主图', desc: '电商品牌主图设计', icon: '📦', tool: '/tools/productpage', hot: true },
  { id: 6, name: '改尺寸', desc: '自由调整图片尺寸', icon: '📐', tool: '/tools/resize', hot: false },
  { id: 7, name: '菜单设计', desc: '餐饮店铺菜单', icon: '🍽️', tool: '/tools/restaurant-menu', hot: false },
  { id: 8, name: '抖音封面', desc: '短视频爆款封面', icon: '🎬', tool: '/tools/douyin', hot: true },
  { id: 9, name: '简历形象照', desc: '职业照片精修', icon: '👔', tool: '/tools/resume-photo', hot: false },
  { id: 10, name: '头像表情包', desc: '趣味头像生成', icon: '😄', tool: '/tools/avatar-emoji', hot: true },
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
  const [activeTab, setActiveTab] = useState<'settings' | 'features'>('settings');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  // 切换设置项
  const toggleSetting = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setToast(`${notifications[key] ? '已关闭' : '已开启'}通知`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10">
      {/* 左侧统一侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header title="更多" subtitle="设置与服务" />

        <div className="p-8">
          {/* 标签切换 */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 w-fit mb-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              设置
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'features'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              功能服务
            </button>
          </div>

          {/* 设置页面 */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* 账户卡片 */}
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
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
                        <p className="text-sm text-slate-500">跟随系统自动切换</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setToast('主题已切换'); }}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-orange-500' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
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
                      onClick={() => toggleSetting('email')}
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
                      onClick={() => toggleSetting('push')}
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
            </div>
          )}

          {/* 功能服务页面 */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 热门工具 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">热门工具</h2>
                  <Link href="/tools" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    查看全部 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {FEATURES.filter(f => f.hot).map((feature, index) => (
                    <Link
                      key={feature.id}
                      href={feature.tool}
                      className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-xl hover:border-orange-200 transition-all relative animate-in fade-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {feature.hot && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium rounded-full">
                          热
                        </span>
                      )}
                      <div className="text-4xl mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-orange-500 transition-colors">{feature.name}</h3>
                      <p className="text-xs text-slate-500">{feature.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 全部工具 */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">全部工具</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {FEATURES.map((feature, index) => (
                    <Link
                      key={feature.id}
                      href={feature.tool}
                      className="group bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-xl hover:border-orange-200 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-4xl mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-orange-500 transition-colors">{feature.name}</h3>
                      <p className="text-xs text-slate-500">{feature.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 快捷入口 */}
              <div className="grid grid-cols-3 gap-4">
                <Link href="/vip" className="group bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-orange-200/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Crown className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">开通会员</span>
                  </div>
                  <p className="text-sm text-white/80">解锁全部高级功能</p>
                </Link>
                <Link href="/templates" className="group bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-purple-200/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">精选模板</span>
                  </div>
                  <p className="text-sm text-white/80">海量设计模板</p>
                </Link>
                <Link href="/recent" className="group bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-sky-200/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">最近打开</span>
                  </div>
                  <p className="text-sm text-white/80">查看历史记录</p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
