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
    color: 'text-orange-600 bg-orange-50',
  },
  {
    id: 'background-removal',
    name: 'AI智能抠图',
    desc: '一键去除背景，支持复杂边缘',
    href: '/background-removal',
    icon: Scissors,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'ai-photo',
    name: 'AI写真生成',
    desc: '上传照片，生成多种风格写真',
    href: '/ai-photo',
    icon: Camera,
    color: 'text-pink-600 bg-pink-50',
  },
  {
    id: 'product-poster',
    name: '商品海报生成',
    desc: '自动生成电商促销海报',
    href: '/product-poster',
    icon: ImageIcon,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    id: 'xiaohongshu-generator',
    name: '小红书爆款生成',
    desc: '生成小红书种草图文内容',
    href: '/xiaohongshu-generator',
    icon: FileText,
    color: 'text-red-600 bg-red-50',
  },
  {
    id: 'novel',
    name: '小说创作工坊',
    desc: 'AI辅助小说创作与续写',
    href: '/novel',
    icon: BookOpen,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 'resume',
    name: 'STAR简历优化',
    desc: 'AI优化简历，提升面试通过率',
    href: '/resume',
    icon: Sparkles,
    color: 'text-amber-600 bg-amber-50',
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
    <div className="ui-page">
      {/* 标题区 */}
      <div className="ui-page-header">
        <h1 className="ui-page-title">小工具</h1>
        <p className="ui-page-desc">选择工具，快速生成内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索工具..."
          className="ui-input pl-10"
        />
      </div>

      {/* 工具网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="ui-card p-4 flex flex-col gap-3 group"
              >
                {/* 图标 */}
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${tool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{tool.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tool.desc}</p>
                </div>
                {/* 进入按钮 */}
                <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-700 transition-colors">
                  进入
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Search className="w-8 h-8 mb-2" />
          <p className="text-sm">未找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}
