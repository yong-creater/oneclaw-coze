'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Scissors,
  Camera,
  Image,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';

// ========== 工具列表数据结构 ==========
interface ToolItem {
  id: string;
  name: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // 图标背景色
}

const toolsList: ToolItem[] = [
  {
    id: 'product-generator',
    name: 'AI商品图生成',
    desc: '上传商品图，3秒生成电商级白底主图、高级感主图和场景图',
    href: '/product-generator',
    icon: Package,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'background-removal',
    name: 'AI智能抠图',
    desc: '发丝级精准抠图，一键生成纯白底图，支持批量处理',
    href: '/background-removal',
    icon: Scissors,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'ai-photo',
    name: 'AI写真生成',
    desc: '上传照片，AI生成高级感写真，让你的朋友圈获得更多点赞',
    href: '/ai-photo',
    icon: Camera,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'product-poster',
    name: '商品海报生成',
    desc: '一键生成高转化电商海报，支持多种风格模板',
    href: '/product-poster',
    icon: Image,
    color: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'xiaohongshu-generator',
    name: '小红书爆款生成',
    desc: '输入一句话，3秒生成爆款标题+正文+标签+封面图',
    href: '/xiaohongshu-generator',
    icon: FileText,
    color: 'bg-red-100 text-red-500',
  },
  {
    id: 'novel',
    name: '小说创作工坊',
    desc: '小说→深度洗稿→漫画生图→推文脚本，全流程创作',
    href: '/novel',
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'resume',
    name: 'STAR简历优化',
    desc: '上传简历+粘贴JD，一键生成STAR法则优化版简历',
    href: '/resume',
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-600',
  },
];

export default function ToolsPage() {
  const [searchText, setSearchText] = useState('');

  const filtered = toolsList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* 页头 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">工具中心</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          选择工具，开始创作
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索工具..."
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
        />
      </div>

      {/* 工具卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all duration-200"
            >
              {/* 图标 + 标题 */}
              <div className="flex items-start gap-3.5 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {tool.name}
                  </h3>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {tool.desc}
              </p>

              {/* 进入按钮 */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500 dark:text-orange-400 group-hover:gap-2.5 transition-all">
                <span>进入工具</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 空状态 */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">没有找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}
