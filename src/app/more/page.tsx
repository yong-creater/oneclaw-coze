'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar, Header, Footer } from '@/components/common';
import { 
  Crown, CreditCard, Gift, FileText, Headphones, 
  MessageCircle, Star, ChevronRight, ExternalLink,
  ShoppingBag, Palette, Video, Image, Music,
  User, Bell, Shield, Palette as ThemeIcon, Globe, HelpCircle, Info,
  Check
} from 'lucide-react';

// 设置菜单项
const SETTINGS_MENU = [
  { icon: User, label: '账户信息', desc: '头像、昵称、邮箱' },
  { icon: Bell, label: '消息通知', desc: '推送、提醒设置' },
  { icon: Shield, label: '隐私安全', desc: '密码、安全设置' },
  { icon: ThemeIcon, label: '界面设置', desc: '主题、字体大小' },
  { icon: Globe, label: '语言设置', desc: '简体中文、English' },
];

// 更多功能分组
const MORE_FUNCTIONS = [
  {
    title: '会员服务',
    items: [
      { icon: Crown, label: '会员中心', desc: '开通会员、查看权益', href: '/vip' },
      { icon: CreditCard, label: '充值中心', desc: '积分充值、套餐购买', href: '/recharge' },
      { icon: Gift, label: '邀请好友', desc: '邀请得积分、好友福利', href: '/invite' },
    ]
  },
  {
    title: '创作工具',
    items: [
      { icon: FileText, label: '产品文档', desc: 'API文档、开发者中心', href: '/docs' },
      { icon: Palette, label: '模板市场', desc: '更多精品模板', href: '/market' },
      { icon: Headphones, label: '在线客服', desc: '工作日 9:00-18:00', href: '/support' },
    ]
  },
  {
    title: '社区与反馈',
    items: [
      { icon: MessageCircle, label: '用户社区', desc: '交流心得、分享作品', href: '/community' },
      { icon: Star, label: '给我们评分', desc: '好评鼓励、意见反馈', href: '/feedback' },
    ]
  },
];

// 合作产品
const PARTNER_PRODUCTS = [
  { icon: ShoppingBag, label: '电商工具', desc: '一站式电商素材解决方案', url: '#' },
  { icon: Palette, label: '设计工具', desc: '专业在线设计平台', url: '#' },
  { icon: Video, label: '视频剪辑', desc: 'AI智能视频剪辑工具', url: '#' },
  { icon: Image, label: '图片处理', desc: '批量图片处理工具', url: '#' },
  { icon: Music, label: '音频处理', desc: '音频剪辑与合成工具', url: '#' },
];

// 帮助菜单
const HELP_MENU = [
  { icon: HelpCircle, label: '帮助中心', desc: '常见问题、使用教程', href: '/help' },
  { icon: Info, label: '关于我们', desc: '产品介绍、团队成员', href: '/about' },
];

export default function MorePage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'more'>('more');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 统一顶部 */}
        <Header title="更多" showRightArea={false} />

        <div className="p-6">
          <div className="max-w-3xl">
            {/* 标签切换 */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                }`}
              >
                设置
              </button>
              <button
                onClick={() => setActiveTab('more')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'more'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                }`}
              >
                功能与服务
              </button>
            </div>

            {/* 设置内容 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* 基本设置 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">基本设置</h3>
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    {SETTINGS_MENU.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
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
                        </div>
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
                          key={item.label}
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
            )}

            {/* 更多功能 */}
            {activeTab === 'more' && (
              <div className="space-y-6">
                {/* 更多功能 */}
                {MORE_FUNCTIONS.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="text-sm font-medium text-slate-500 mb-3">{group.title}</h3>
                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                      {group.items.map((item, itemIdx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                              itemIdx !== group.items.length - 1 ? 'border-b border-slate-100' : ''
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
                ))}

                {/* 合作产品 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">合作伙伴</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PARTNER_PRODUCTS.map((product, idx) => {
                      const Icon = product.icon;
                      return (
                        <a
                          key={idx}
                          href={product.url}
                          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="text-center">
                            <h4 className="text-sm font-medium text-slate-800">{product.label}</h4>
                            <p className="text-xs text-slate-400">{product.desc}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* 联系方式 */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <h3 className="font-medium text-slate-800 mb-2">联系我们</h3>
                  <p className="text-sm text-slate-600 mb-3">有问题或建议？我们随时为您服务</p>
                  <div className="flex gap-3">
                    <a 
                      href="mailto:1017760688@qq.com"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors text-center"
                    >
                      发送邮件
                    </a>
                    <a 
                      href="#"
                      className="flex-1 px-4 py-2 border border-orange-200 text-orange-500 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors text-center"
                    >
                      在线客服
                    </a>
                  </div>
                </div>
              </div>
            )}
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
