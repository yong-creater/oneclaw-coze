'use client';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Bot, Target, Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Target,
    title: '精选推荐',
    desc: '人工审核精选，确保每个工具都是精品',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    icon: Sparkles,
    title: '持续更新',
    desc: '紧跟AI发展，第一时间收录新工具',
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    icon: Heart,
    title: '用户至上',
    desc: '真实评分评价，帮你做出明智选择',
    color: 'bg-red-500/10 text-red-600'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              关于 OneClaw
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              OneClaw（钳爪）是一个专注于AI工具导航的平台，致力于帮助用户发现、了解和选择最适合的AI工具。我们相信，AI的力量应该触手可及。
            </p>
          </div>

          {/* 特点 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 border border-border">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    feature.color
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 使命 */}
          <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold text-foreground mb-4">我们的使命</h2>
            <p className="text-muted-foreground leading-relaxed">
              让人工智能不再遥不可及。我们希望通过OneClaw这个平台，让每一个想要使用AI工具的人都能快速找到适合自己的工具，无论是创作者、企业还是普通用户，都能从AI技术中受益。
            </p>
          </div>

          {/* 联系方式 */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">联系我们</h2>
            <p className="text-muted-foreground mb-4">
              如果你有任何问题或建议，欢迎联系我们
            </p>
            <a
              href="mailto:1017760688@qq.com"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              1017760688@qq.com
            </a>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
