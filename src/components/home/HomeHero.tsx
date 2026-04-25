'use client';

import Link from 'next/link';
import { Sparkles, Palette, FileText, ShoppingCart, TrendingUp, Settings } from 'lucide-react';
import FeaturedTools from './FeaturedTools';

const CATEGORIES = [
  {
    name: 'AI设计工具',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-600 dark:text-pink-400',
    href: '/create?type=design',
    description: '封面、海报、主图一键生成',
  },
  {
    name: 'AI内容工具',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    href: '/create?type=content',
    description: '笔记、文章、脚本智能创作',
  },
  {
    name: 'AI电商工具',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    href: '/create?type=ecommerce',
    description: '商品图、详情页、卖点文案',
  },
  {
    name: 'AI营销工具',
    icon: TrendingUp,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    href: '/create?type=marketing',
    description: '海报、策划、转化文案',
  },
  {
    name: 'AI效率工具',
    icon: Settings,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    textColor: 'text-violet-600 dark:text-violet-400',
    href: '/create?type=productivity',
    description: '简历、邮件、报告自动写',
  },
];

const HOT_TOOLS = [
  {
    name: '小红书封面生成',
    desc: '爆款标题封面一键生成',
    href: '/tools/xiaohongshu-cover',
    gradient: 'from-pink-400 to-rose-500',
    icon: '📕',
  },
  {
    name: '商品主图生成',
    desc: '白底图/场景图/广告图',
    href: '/tools/product-image',
    gradient: 'from-emerald-400 to-teal-500',
    icon: '🛍️',
  },
  {
    name: '广告海报生成',
    desc: '活动海报/品牌广告',
    href: '/tools/ad-poster',
    gradient: 'from-orange-400 to-red-500',
    icon: '🎯',
  },
];

export default function HomeHero() {
  return (
    <div className="space-y-8">
      {/* Hero 区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
            AI帮你一键完成
          </span>
          <br />
          <span className="text-slate-800 dark:text-white">设计、内容与营销工作</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          无需学习AI，选择场景即可生成结果
        </p>
        
        {/* 快速入口 */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {HOT_TOOLS.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tool.gradient} text-white font-medium text-sm hover:shadow-lg hover:scale-105 transition-all`}
            >
              <span>{tool.icon}</span>
              {tool.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 五大入口 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group relative overflow-hidden rounded-xl border ${cat.borderColor} ${cat.bgColor} p-4 hover:shadow-lg transition-all hover:-translate-y-1`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 热门工具横向滚动区 */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            热门工具
          </h2>
          <Link href="/create" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            查看全部 →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {HOT_TOOLS.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`flex-shrink-0 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                {tool.icon}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tool.desc}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-orange-500">
                <span>立即使用</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 精选工具板块 */}
      <FeaturedTools />
    </div>
  );
}
