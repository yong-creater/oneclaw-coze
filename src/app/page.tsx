'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Grid3X3, Wand2, Search, Sparkles,
  ArrowRight, Download, Palette, Image,
  FileText, Play, Coffee, PartyPopper, Package,
  Plus, Check, RefreshCw, Upload
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';
import WechatPromo from '@/components/common/WechatPromo';

// 简化工具数据
const AI_TOOLS = [
  // 图片处理
  { name: 'AI抠图', desc: '一键去除背景', icon: Scissors, emoji: '✂️', color: 'from-blue-100 to-cyan-200', tag: '免费', href: '/tools' },
  { name: '变清晰', desc: '模糊图变高清', icon: Sparkles, emoji: '🔍', color: 'from-purple-100 to-violet-200', tag: '热门', href: '/tools' },
  { name: '改尺寸', desc: '无损放大缩小', icon: Image, emoji: '📐', color: 'from-green-100 to-emerald-200', tag: '免费', href: '/tools' },
  // 营销图
  { name: '小红书封面', desc: '爆款封面生成', icon: FileText, emoji: '📕', color: 'from-red-100 to-orange-200', tag: '热门', href: '/tools' },
  { name: '视频封面', desc: '抖音/视频号', icon: Play, emoji: '🎬', color: 'from-violet-100 to-purple-200', tag: '新版', href: '/tools' },
  { name: '节日海报', desc: '节日营销海报', icon: PartyPopper, emoji: '🎊', color: 'from-rose-100 to-pink-200', tag: '限时', href: '/tools' },
  { name: '商品主图', desc: '电商主图生成', icon: Package, emoji: '🛍️', color: 'from-teal-100 to-cyan-200', tag: '新版', href: '/tools' },
  // AI设计
  { name: '菜单设计', desc: '餐厅菜单生成', icon: Coffee, emoji: '🍽️', color: 'from-amber-100 to-yellow-200', tag: '实用', href: '/tools' },
];

function Scissors(props: any) {
  return <span className="text-xl" {...props}>✂️</span>;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <AnimatedLobster size={20} />
            </div>
            <span className="font-bold text-lg text-slate-800">OneClaw</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/tools" className="text-sm text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-1.5">
              <Grid3X3 className="w-4 h-4" />
              工具
            </Link>
            <Link href="/login" className="text-sm text-slate-600 hover:text-orange-500 transition-colors">
              登录
            </Link>
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero 区域 */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-sm text-orange-600 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI 驱动的图片处理工具</span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            一键完成图片处理
            <span className="text-orange-500">无需设计基础</span>
          </h1>
          
          <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
            抠图、变清晰、改尺寸... 只需上传图片，AI自动帮你处理
          </p>

          {/* 搜索框 */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索工具..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-slate-200 focus:border-orange-400 focus:outline-none transition-colors text-slate-800 shadow-sm"
              />
              <Link 
                href="/tools"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-shadow"
              >
                搜索
              </Link>
            </div>
          </div>
        </section>

        {/* 快速入口 */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">快速开始</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'AI抠图', desc: '去除背景', color: 'from-blue-400 to-cyan-500', icon: '✂️' },
              { name: '变清晰', desc: '模糊修复', color: 'from-purple-400 to-violet-500', icon: '🔍' },
              { name: '小红书封面', desc: '爆款封面', color: 'from-red-400 to-orange-500', icon: '📕' },
              { name: '节日海报', desc: '节日营销', color: 'from-rose-400 to-pink-500', icon: '🎊' },
            ].map((tool, idx) => (
              <Link
                key={idx}
                href="/tools"
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all"
              >
                <div className={`h-24 bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                  <span className="text-4xl">{tool.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 全部工具 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">全部工具</h2>
            <Link href="/tools" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_TOOLS.map((tool, idx) => (
              <Link
                key={idx}
                href={tool.href}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
              >
                <div className={`h-20 bg-gradient-to-br ${tool.color} relative flex items-center justify-center`}>
                  <span className="text-3xl">{tool.emoji}</span>
                  <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full ${tool.tag === '免费' ? 'bg-green-100 text-green-600' : tool.tag === '热门' ? 'bg-orange-100 text-orange-600' : tool.tag === '新版' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    {tool.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 微信群推广 */}
        <WechatPromo />
      </main>

      <Footer />
    </div>
  );
}
