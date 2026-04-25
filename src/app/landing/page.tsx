'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Feather, FileText, Globe, MapPin, Palette, UserCircle,
  Wand2, ArrowRight, Zap, Shield, Clock, Users, Star, ChevronDown,
  Play, CheckCircle, TrendingUp, Gift, Rocket, Target, Award, Crown
} from 'lucide-react';

const BRAND_FEATURES = [
  {
    icon: Wand2,
    title: '7大AI神器',
    desc: '头像表情包、形象照、营销海报、手抄报、简历优化、小说创作、出海详情页',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Layers,
    title: '238+工具库',
    desc: '全品类AI工具导航，视频生成、数字人、AI绘画、AI编程全覆盖',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: '零门槛使用',
    desc: '无需写prompt，一键生成，小白也能轻松上手',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: '商用无忧',
    desc: '正版授权，商用无忧，合规出海无风险',
    color: 'from-green-500 to-emerald-500'
  }
];

const TOOL_CARDS = [
  {
    icon: Sparkles,
    name: '头像表情包',
    desc: 'AI生成专属头像和表情包',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    highlight: '支持动漫/插画多种风格'
  },
  {
    icon: UserCircle,
    name: '形象照生成',
    desc: '一键生成专业职业形象照',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    highlight: '简历/LinkedIn/商务通用'
  },
  {
    icon: MapPin,
    name: '门店营销海报',
    desc: '餐饮/零售/节日海报一键生成',
    color: 'bg-gradient-to-br from-red-500 to-pink-500',
    highlight: '50+行业模板覆盖'
  },
  {
    icon: Palette,
    name: '儿童创意工坊',
    desc: '手抄报/涂色绘本素材生成',
    color: 'bg-gradient-to-br from-cyan-500 to-teal-500',
    highlight: 'A4高清可打印'
  },
  {
    icon: FileText,
    name: 'STAR简历优化',
    desc: '简历+JD匹配优化',
    color: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    highlight: '面试邀约率提升200%'
  },
  {
    icon: Feather,
    name: '小说创作工坊',
    desc: '小说洗稿+推文脚本',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    highlight: '日更千字不是梦'
  },
  {
    icon: Globe,
    name: '出海详情页',
    desc: '多语言+合规海外详情页',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    highlight: '亚马逊/Temu/独立站'
  }
];

const STATS = [
  { value: '238+', label: '精选AI工具', icon: Wand2 },
  { value: '7+', label: '自研神器', icon: Star },
  { value: '10万+', label: '用户信赖', icon: Users },
  { value: '99.9%', label: '服务可用', icon: Shield }
];

const SOCIAL_PROOF = [
  '零门槛上手，生成效果惊艳',
  '出海详情页帮我月入3万+',
  '形象照免费生成太香了',
  '孩子手抄报终于不用愁了',
  '简历优化后拿到5个offer',
  '小说推文素材一键搞定'
];

export default function LandingPage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 动画效果
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <AnimatedLobster size={36} />
            <div>
              <span className="font-bold text-xl text-slate-800 dark:text-white">OneClaw</span>
              <span className="text-orange-500 font-medium ml-1">钳爪</span>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/tools')}
              className="hidden sm:flex"
            >
              浏览工具
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              开始使用
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Big */}
          <div className={`mb-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 shadow-2xl shadow-orange-500/30">
              <AnimatedLobster size={72} />
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 transition-all duration-1000 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent">
              OneClaw 钳爪
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            全品类AI工具导航站
          </p>

          {/* Tagline */}
          <p className={`text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            一爪搞定238款AI工具，7大自研神器让创作更简单
            <br />
            <span className="text-orange-500 font-medium">零门槛 · 商用无忧 · 极速出图</span>
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Button 
              size="lg"
              onClick={() => router.push('/')}
              className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
            >
              <Rocket className="mr-2 w-5 h-5" />
              立即体验
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/tools')}
              className="px-8 py-6 text-lg border-2 border-slate-300 hover:border-orange-500"
            >
              探索全部工具
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className={`mt-16 animate-bounce transition-all duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <ChevronDown className="w-8 h-8 mx-auto text-slate-400" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-3">
                  <stat.icon className="w-7 h-7 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mb-4">
              为什么选择 OneClaw
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              一爪搞定，一切皆有可能
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND_FEATURES.map((feature, i) => (
              <Card 
                key={i} 
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Tools Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mb-4">
              核心功能
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              7大AI神器，让创作更简单
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              无需学习，无需prompt，一键生成专业级作品
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOL_CARDS.map((tool, i) => (
              <Card 
                key={i}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group"
                onClick={() => router.push('/')}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{tool.desc}</p>
                  <div className="flex items-center text-xs text-orange-500 font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {tool.highlight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg"
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              体验全部工具
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mb-4">
              简单三步
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              轻松上手，即刻创作
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '选择工具', desc: '从7大AI神器中选择你需要的类型', icon: Target },
              { step: '02', title: '上传素材', desc: '上传图片或输入简单描述', icon: Upload },
              { step: '03', title: '一键生成', desc: 'AI自动生成专业级作品', icon: Wand2 }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-4">
                  <item.icon className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-4xl font-bold text-orange-200 dark:text-orange-900 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Award className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            用户的真实反馈
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_PROOF.map((text, i) => (
              <div 
                key={i}
                className="bg-white/20 backdrop-blur rounded-xl p-4 text-white"
              >
                <Star className="w-5 h-5 text-yellow-300 mb-2" />
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Crown className="w-16 h-16 mx-auto mb-6 text-orange-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            加入10万+用户，让AI成为你的超级助手
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/')}
            className="px-10 py-6 text-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/30"
          >
            <Gift className="mr-2 w-6 h-6" />
            免费开始使用
          </Button>
          <p className="mt-4 text-sm text-slate-400">
            无需注册，即刻体验 · 商用无忧，正版授权
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto text-center">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 mb-4"
          >
            <AnimatedLobster size={28} />
            <span className="font-bold text-lg text-slate-800 dark:text-white">OneClaw 钳爪</span>
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            全品类AI工具导航站 · 让创作更简单
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 OneClaw. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// 临时图标占位
function Upload(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function Layers(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
