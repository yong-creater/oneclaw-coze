'use client';

import { Feather, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NovelPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
              <span>← 返回首页</span>
            </Link>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Feather className="w-4 h-4" />
              <span>小说创作</span>
            </div>
          </div>
        </div>
      </header>

      {/* 占位内容 */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Feather className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
            小说创作助手
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            AI驱动的智能小说创作工具，帮助您快速生成创意故事、人物设定和情节发展。
          </p>

          {/* 功能预览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">故事生成</h3>
              <p className="text-sm text-slate-500">输入关键词，AI自动生成完整故事</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">人物设定</h3>
              <p className="text-sm text-slate-500">智能生成饱满的角色设定</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">情节发展</h3>
              <p className="text-sm text-slate-500">续写、扩展、转折应有尽有</p>
            </div>
          </div>

          {/* 开发提示 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-orange-600 dark:text-orange-400 text-sm">
              🚧 此页面正在开发中，敬请期待...
            </p>
            <p className="text-slate-500 text-xs mt-2">
              如需自定义开发，请修改 src/app/novel/page.tsx
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
