'use client';

import { Card, CardContent } from '@/components/ui/card';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import { Layout, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CoverGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium mb-4">
            <Layout className="w-4 h-4" />
            封面生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            输入关键词，生成爆款封面
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            小红书 / 抖音 / 公众号 多平台适配
          </p>
        </div>

        <Card className="mb-8 border-pink-100 dark:border-pink-900/30">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <Layout className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              功能即将上线
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              AI生成多平台封面图
            </p>
            <button
              onClick={() => toast.success('功能开发中，敬请期待！')}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              敬请期待
            </button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { title: '小红书封面', desc: '1:1尺寸，吸睛风格' },
            { title: '抖音封面', desc: '9:16竖版，自动适配' },
            { title: '批量生成', desc: '一次生成5套封面' },
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
