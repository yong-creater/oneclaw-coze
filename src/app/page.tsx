'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, Plus, Box, Layers, Sparkles, 
  Image, Palette, Video, ShoppingBag,
  Wand2, ScanFace, Shirt, MoreHorizontal,
  Bell, User
} from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';

// AI Agent 入口
const AI_AGENTS = [
  { icon: ShoppingBag, label: '电商商品Agent', color: 'from-orange-400 to-amber-500' },
  { icon: Shirt, label: '服饰穿戴Agent', color: 'from-pink-400 to-rose-500' },
  { icon: Palette, label: '海报Agent', color: 'from-emerald-400 to-green-500' },
  { icon: Video, label: '视频Agent', color: 'from-cyan-400 to-blue-500' },
];

// 快捷案例
const QUICK_CASES = [
  { 
    title: 'Seedance2.0 生视频', 
    desc: '输入描述词，AI 生成精美视频',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop',
    tag: '视频'
  },
  { 
    title: '一键模特试衣', 
    desc: '服装上身效果展示',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    tag: '穿戴'
  },
  { 
    title: '帮我生成A+详情页', 
    desc: '户外音响产品展示页设计',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
    tag: '识图'
  },
  { 
    title: '一键生成亚马逊套图', 
    desc: '跨境电商商品主图',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
    tag: '电商'
  },
];

// 底部功能按钮
const BOTTOM_FUNCTIONS = [
  { icon: Image, label: '图片编辑', desc: '导入图片，即刻编辑' },
  { icon: Box, label: '创建设计', desc: '从空白画布开始' },
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧统一导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-56">
        {/* 页面内容 */}
        <div className="p-6">
          {/* 欢迎区域 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">欢迎回来 👋</h1>
            <p className="text-slate-500">和我聊聊，你想要什么设计~</p>
          </div>

          {/* AI Agent 入口 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {AI_AGENTS.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <button
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{agent.label}</span>
                </button>
              );
            })}
          </div>

          {/* 对话输入框 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="和我聊聊，你想要什么设计。"
              className="w-full px-5 py-4 text-slate-700 placeholder-slate-400 resize-none focus:outline-none text-base"
              rows={3}
            />
            
            {/* 输入框底部工具栏 */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  添加
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Box className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发送 <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 快捷案例 */}
          <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷案例</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {QUICK_CASES.map((item, idx) => (
              <button
                key={idx}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all text-left"
              >
                <div className="relative h-24 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-xs text-slate-600">
                    {item.tag}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-slate-800 mb-0.5 group-hover:text-orange-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 底部功能区 */}
          <div className="space-y-4">
            {/* 图片编辑 + 创建设计 */}
            <div className="grid grid-cols-2 gap-4">
              {BOTTOM_FUNCTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{item.label}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 功能网格 */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="grid grid-cols-4 gap-3">
                {GRID_FUNCTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                          <Icon className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors" />
                        </div>
                        {item.isAI && (
                          <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-emerald-500 text-white text-[10px] font-medium rounded">
                            AI
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
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
      <Footer />
    </div>
  );
}
