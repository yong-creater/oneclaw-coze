'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';

// ========== 数据结构 ==========
const toolsList = [
  {
    id: 'product-generator',
    name: 'AI商品图生成',
    desc: '上传商品图，AI生成高质量卖货图',
    href: '/product-generator',
    icon: Package,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'background-removal',
    name: 'AI智能抠图',
    desc: '一键去除背景，支持复杂边缘',
    href: '/background-removal',
    icon: Scissors,
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'ai-photo',
    name: 'AI写真生成',
    desc: '上传照片，生成多种风格写真',
    href: '/ai-photo',
    icon: Camera,
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 'product-poster',
    name: '商品海报生成',
    desc: '自动生成电商促销海报',
    href: '/product-poster',
    icon: ImageIcon,
    gradient: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'xiaohongshu-generator',
    name: '小红书爆款生成',
    desc: '生成小红书种草图文内容',
    href: '/xiaohongshu-generator',
    icon: FileText,
    gradient: 'from-red-400 to-orange-500',
  },
  {
    id: 'novel',
    name: '小说创作工坊',
    desc: 'AI辅助小说创作与续写',
    href: '/novel',
    icon: BookOpen,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'resume',
    name: 'STAR简历优化',
    desc: 'AI优化简历，提升面试通过率',
    href: '/resume',
    icon: Sparkles,
    gradient: 'from-amber-400 to-yellow-500',
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState('');

  const filtered = toolsList.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="os-page">
      {/* 标题区 */}
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="os-section-title text-2xl">小工具</h1>
        <p className="os-section-desc">选择工具，快速生成内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索工具..."
          className="os-search-input"
        />
      </div>

      {/* 工具网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="os-card p-5 flex flex-col gap-4 animate-stagger-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 图标 */}
                <div className={`os-icon-bg bg-gradient-to-br ${tool.gradient} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800">{tool.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{tool.desc}</p>
                </div>
                {/* 进入按钮 */}
                <div className="flex items-center text-xs text-slate-400 group-hover:text-purple-500 transition-colors">
                  进入工具
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">未找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}
