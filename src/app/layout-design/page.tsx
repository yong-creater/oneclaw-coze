'use client';

import { Card, CardContent } from '@/components/ui/card';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import { Palette, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LayoutDesignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium mb-4">
            <Palette className="w-4 h-4" />
            图文排版
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            小红书笔记 / 公众号 / PPT配图
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            AI自动排版，一键导出
          </p>
        </div>

        <Card className="mb-8 border-green-100 dark:border-green-900/30">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              功能即将上线
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              AI自动排版，批量制作
            </p>
            <button
              onClick={() => toast.success('功能开发中，敬请期待！')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              敬请期待
            </button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { title: '小红书排版', desc: '活泼风格，自动对齐图文' },
            { title: '公众号推文', desc: '简洁风格，适合长图文' },
            { title: '批量排版', desc: '5套内容同时排版' },
          ].map((item, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <WechatPromo />
      </div>
    </div>
  );
}
