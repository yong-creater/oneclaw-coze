'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, Plus, Box, Layers, Sparkles, 
  Image, Palette, Video, ShoppingBag,
  Wand2, ScanFace, Shirt, MoreHorizontal,
  Bell, User, ArrowRight, Zap, Star, TrendingUp
} from 'lucide-react';
import { Sidebar, Footer, useSidebar } from '@/components/common';
import { Menu } from 'lucide-react';

// AI Agent 入口
const AI_AGENTS = [
  { icon: ShoppingBag, label: '电商商品Agent', color: 'from-orange-400 to-amber-500', desc: '一键生成商品图' },
  { icon: Shirt, label: '服饰穿戴Agent', color: 'from-pink-400 to-rose-500', desc: '模特试穿效果' },
  { icon: Palette, label: '海报Agent', color: 'from-emerald-400 to-green-500', desc: '创意海报设计' },
  { icon: Video, label: '视频Agent', color: 'from-cyan-400 to-blue-500', desc: '视频封面生成' },
];

// 快捷案例
const QUICK_CASES = [
  { 
    title: 'Seedance2.0 生视频', 
    desc: '输入描述词，AI 生成精美视频',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    tag: '视频',
    hot: true
  },
  { 
    title: '一键模特试衣', 
    desc: '服装上身效果展示',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    tag: '穿戴',
    hot: true
  },
  { 
    title: '帮我生成A+详情页', 
    desc: '户外音响产品展示页设计',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    tag: '识图'
  },
  { 
    title: '一键生成亚马逊套图', 
    desc: '跨境电商商品主图',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    tag: '电商'
  },
];

// 底部功能按钮
const BOTTOM_FUNCTIONS = [
  { icon: Image, label: '图片编辑', desc: '导入图片，即刻编辑', color: 'from-blue-400 to-cyan-500' },
  { icon: Box, label: '创建设计', desc: '从空白画布开始', color: 'from-purple-400 to-violet-500' },
];

const GRID_FUNCTIONS = [
  { icon: ShoppingBag, label: '商品套图', isAI: true },
  { icon: Layers, label: 'A+/详情页' },
  { icon: Wand2, label: '智能抠图' },
  { icon: Sparkles, label: '变清晰' },
  { icon: ScanFace, label: 'AI消除' },
  { icon: User, label: '证件照' },
  { icon: Shirt, label: '服饰穿戴' },
  { icon: MoreHorizontal, label: '更多' },
];

export default function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const { collapsed } = useSidebar();

  const handleSend = () => {
    if (!inputValue.trim()) return;
    console.log('发送:', inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* 左侧统一导航 - md 以上显示 */}
      <Sidebar />

      {/* 主内容区 - 响应式布局 */}
      <main className={`
        flex-1 transition-all duration-300 
        md:${collapsed ? 'ml-[72px]' : 'ml-[268px]'}
      `}>
        {/* 移动端顶部导航栏 */}
        <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">OneClaw</span>
          </div>
        </div>

        {/* 页面内容 */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* 欢迎区域 */}
          <div className="mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
              和我聊聊，你想要什么设计~
            </h1>
            <p className="text-slate-500 text-sm md:text-base">238 款 AI 工具，让创作更简单</p>
          </div>

          {/* AI Agent 入口 */}
          <div className="flex flex-wrap gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {AI_AGENTS.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <button
                  key={idx}
                  className="group relative flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">{agent.label}</span>
                    <span className="block text-xs text-slate-400">{agent.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-300 absolute right-4" />
                </button>
              );
            })}
          </div>

          {/* 对话输入框 */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/50 overflow-hidden mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你想要的设计，比如：帮我设计一张小红书封面，主色调是橙色..."
              className="w-full px-6 py-5 text-slate-700 placeholder-slate-400 resize-none focus:outline-none text-base leading-relaxed"
              rows={4}
            />
            
            {/* 输入框底部工具栏 */}
            <div className="px-6 py-4 border-t border-slate-100/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                  <Plus className="w-4 h-4" />
                  添加图片
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                  <Box className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                  <Layers className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200/50 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                发送
              </button>
            </div>
          </div>

          {/* 快捷案例 */}
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                <h2 className="text-xl font-bold text-slate-800">热门案例</h2>
              </div>
              <Link href="/tools" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
                查看更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {QUICK_CASES.map((item, idx) => (
                <button
                  key={idx}
                  className="group relative bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-orange-100/30 hover:border-orange-200 transition-all duration-300 text-left"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {item.hot && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        热门
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-slate-600">
                      {item.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 底部功能区 */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            {/* 图片编辑 + 创建设计 */}
            <div className="grid grid-cols-2 gap-5">
              {BOTTOM_FUNCTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    className="group flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 hover:shadow-xl hover:shadow-orange-100/30 hover:border-orange-200 transition-all duration-300 text-left"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">{item.label}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 功能网格 */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 hover:shadow-xl hover:shadow-orange-100/30 transition-shadow duration-300">
              <div className="grid grid-cols-4 gap-4">
                {GRID_FUNCTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-amber-100 transition-all duration-300">
                          <Icon className="w-6 h-6 text-slate-500 group-hover:text-orange-500 transition-colors" />
                        </div>
                        {item.isAI && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded shadow-sm">
                            AI
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-orange-600 font-medium transition-colors">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部 */}
      {/* 底部 - 响应侧边栏折叠状态 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Footer />
      </div>
    </div>
  );
}
