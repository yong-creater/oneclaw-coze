'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar, Header, Footer } from '@/components/common';
import { User, Bell, Shield, Palette, Globe, HelpCircle, Info, ChevronRight } from 'lucide-react';

const SETTINGS_MENU = [
  { icon: User, label: '账户信息', desc: '头像、昵称、邮箱', href: '/settings/account' },
  { icon: Bell, label: '消息通知', desc: '推送、提醒设置', href: '/settings/notifications' },
  { icon: Shield, label: '隐私安全', desc: '密码、安全设置', href: '/settings/security' },
  { icon: Palette, label: '界面设置', desc: '主题、字体大小', href: '/settings/appearance' },
  { icon: Globe, label: '语言设置', desc: '简体中文、English', href: '/settings/language' },
];

const HELP_MENU = [
  { icon: HelpCircle, label: '帮助中心', desc: '常见问题、使用教程', href: '/help' },
  { icon: Info, label: '关于我们', desc: '产品介绍、团队成员', href: '/about' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header title="设置" showRightArea={false} />

        <div className="p-6">
          {/* 设置分组 */}
          <div className="max-w-2xl space-y-6">
            {/* 通用设置 */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">通用设置</h3>
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {SETTINGS_MENU.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                        idx !== SETTINGS_MENU.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-800">{item.label}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 帮助与支持 */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">帮助与支持</h3>
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {HELP_MENU.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                        idx !== HELP_MENU.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-800">{item.label}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 版本信息 */}
            <div className="pt-4 text-center">
              <p className="text-xs text-slate-400">OneClaw AI工具箱 v1.0.0</p>
            </div>
          </div>
        </div>
      </main>

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
