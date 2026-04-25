'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 统一侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 页面内容 */}
        <div className="p-6">
          {/* 欢迎区域 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">欢迎回来 👋</h1>
            <p className="text-slate-500">今天想创作什么？</p>
          </div>

          {/* 快捷工具 */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷工具</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'AI抠图', icon: '✂️', color: 'from-blue-400 to-cyan-500', href: '/tools/remove-bg' },
                { name: '变清晰', icon: '🔍', color: 'from-purple-400 to-violet-500', href: '/tools/enhance' },
                { name: '改尺寸', icon: '📐', color: 'from-green-400 to-emerald-500', href: '/tools/resize' },
                { name: '小红书封面', icon: '📕', color: 'from-red-400 to-orange-500', href: '/tools/xiaohongshu' },
                { name: '视频封面', icon: '🎬', color: 'from-violet-400 to-purple-500', href: '/tools/douyin' },
                { name: '节日海报', icon: '🎊', color: 'from-rose-400 to-pink-500', href: '/tools/festival-poster' },
              ].map((tool, idx) => (
                <Link
                  key={idx}
                  href={tool.href}
                  className="group bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-center"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{tool.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 全部工具入口 */}
          <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">探索全部工具</h2>
                <p className="text-white/80 text-sm">发现更多AI创作能力</p>
              </div>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-white text-orange-600 font-medium rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                查看全部 <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
