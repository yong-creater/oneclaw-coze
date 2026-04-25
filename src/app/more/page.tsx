'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { 
  Crown, CreditCard, Gift, FileText, Headphones, 
  MessageCircle, Star, ChevronRight, ExternalLink,
  ShoppingBag, Palette, Video, Image, Music
} from 'lucide-react';

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

export default function MorePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 顶部栏 */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">更多</h1>
        </header>

        <div className="p-6">
          <div className="max-w-2xl space-y-8">
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
        </div>
      </main>

      {/* 底部 - 全宽 */}
      <div className="ml-56">
        <Footer />
      </div>
    </div>
  );
}
