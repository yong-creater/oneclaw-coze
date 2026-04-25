'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';

// 模拟最近使用记录
const recentHistory = [
  { id: 1, name: '智能抠图', desc: '上传商品图，一键移除背景', time: '10分钟前', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', category: '图片编辑' },
  { id: 2, name: '商品主图生成', desc: '生成淘宝/京东主图', time: '1小时前', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop', category: '商品图' },
  { id: 3, name: '模特试衣', desc: '服装上身效果展示', time: '3小时前', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop', category: '模特图' },
  { id: 4, name: '图片变清晰', desc: '模糊图片高清修复', time: '昨天', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop', category: '图片编辑' },
  { id: 5, name: '证件照', desc: '生成各尺寸证件照', time: '2天前', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', category: '人像图' },
];

export default function RecentPage() {
  const [history, setHistory] = useState(recentHistory);
  const { collapsed } = useSidebar();

  const handleDelete = (id: number) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const handleClear = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title="最近使用" subtitle={`${history.length} 条记录`} />
        
        <div className="p-8 max-w-4xl mx-auto">
          {history.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无使用记录</h3>
              <p className="text-slate-500 mb-6">开始使用 AI 工具，创作你的作品</p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                探索工具
              </Link>
            </div>
          ) : (
            <>
              {/* 工具栏 */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">以下是您最近使用的工具</p>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  清空全部
                </button>
              </div>

              {/* 历史列表 */}
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all animate-fade-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* 图片 */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.desc}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>

                    {/* 操作 */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/tools/${item.id}`}
                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={`${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Footer />
        </div>
      </main>
    </div>
  );
}
