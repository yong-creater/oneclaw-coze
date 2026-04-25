'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// 精选工具数据配置
const FEATURED_TOOLS = [
  {
    id: 'resume-star',
    name: 'STAR简历优化',
    description: '上传简历+粘贴JD，一键生成STAR法则优化版简历，精准匹配岗位',
    gradient: 'from-blue-500 to-sky-400',
    icon: '📋',
    href: '/tools/star-resume',
    tags: ['JD精准匹配', '量化成果'],
    tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'novel-studio',
    name: '小说创作工坊',
    description: '小说→深度洗稿→漫画生图→推文脚本，全流程创作一键导出',
    gradient: 'from-violet-500 to-pink-400',
    icon: '✍️',
    href: '/tools/novel-studio',
    tags: ['全流程', '一键导出'],
    tagColor: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  {
    id: 'overseas-detail',
    name: '出海详情页',
    description: '一键生成符合海外法规、人文风情的商品详情页，适配多平台',
    gradient: 'from-emerald-500 to-teal-400',
    icon: '🌍',
    href: '/tools/overseas-detail',
    tags: ['海外合规', '多平台适配'],
    tagColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
];

export default function FeaturedTools() {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          精选工具
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          AI驱动的精选工具，提升您的工作效率
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800"
          >
            {/* 工具图标 */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-md`}
            >
              <span className="text-2xl">{tool.icon}</span>
            </div>

            {/* 工具名称 */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {tool.name}
            </h3>

            {/* 功能描述 */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {tool.description}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border ${tool.tagColor}`}
                >
                  →{tag}
                </span>
              ))}
            </div>

            {/* 操作按钮 */}
            <Link
              href={tool.href}
              className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors group-hover:gap-2.5"
            >
              开始使用
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
