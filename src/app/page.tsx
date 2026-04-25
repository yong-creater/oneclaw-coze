'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, Plus, Box, Layers, Sparkles, 
  Image, Palette, Video, ShoppingBag,
  Wand2, ScanFace, Shirt, MoreHorizontal,
  ArrowRight, Zap, Star, TrendingUp,
  ChevronDown, Crown, User
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

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

// Toast 组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <Star className="w-3 h-3 text-green-400" />
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { collapsed } = useSidebar();

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setToast('消息已发送，AI 正在思考中...');
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header />
        
        <div className="p-8 max-w-5xl mx-auto">
          {/* 欢迎区域 */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              和我聊聊，你想要什么设计~
            </h1>
            <p className="text-slate-500">238 款 AI 工具，让创作更简单</p>
          </div>

          {/* AI Agent 入口 */}
          <div className="flex flex-wrap gap-3 mb-8 animate-fade-up delay-100">
            {AI_AGENTS.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <button
                  key={idx}
                  className="group relative flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-slate-700 group-hover:text-orange-600">{agent.label}</span>
                    <span className="block text-xs text-slate-400">{agent.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all absolute right-3" />
                </button>
              );
            })}
          </div>

          {/* 对话输入框 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 animate-fade-up delay-200">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你想要的设计，比如：帮我设计一张小红书封面，主色调是橙色..."
              className="w-full px-5 py-4 text-slate-700 placeholder-slate-400 resize-none focus:outline-none text-[15px] leading-relaxed"
              rows={4}
            />
            
            {/* 底部工具栏 */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  添加图片
                </button>
                <div className="w-px h-5 bg-slate-200" />
                <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                  <Box className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                发送
              </button>
            </div>
          </div>

          {/* 快捷案例 */}
          <div className="mb-8 animate-fade-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-5 bg-orange-500 rounded-full" />
                <h2 className="text-lg font-semibold text-slate-900">热门案例</h2>
              </div>
              <Link href="/tools" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
                查看更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUICK_CASES.map((item, idx) => (
                <button
                  key={idx}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all text-left cursor-pointer"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {item.hot && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        热门
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/90 rounded-full text-xs text-slate-600">
                      {item.tag}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-slate-800 text-sm mb-0.5 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 功能入口 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up delay-400">
            {GRID_FUNCTIONS.map((func, idx) => {
              const Icon = func.icon;
              return (
                <button
                  key={idx}
                  className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${func.isAI ? 'bg-gradient-to-br from-orange-100 to-amber-100' : 'bg-slate-100'}`}>
                    <Icon className={`w-5 h-5 ${func.isAI ? 'text-orange-500' : 'text-slate-500'}`} />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">{func.label}</span>
                </button>
              );
            })}
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
