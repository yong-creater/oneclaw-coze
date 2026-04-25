'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Zap, Heart } from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 mb-4">
            <AnimatedLobster size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">关于 OneClaw</h1>
          <p className="text-slate-500">全品类 AI 生图工具平台</p>
        </div>

        {/* 简介 */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">平台简介</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            OneClaw（钳爪）是一个专注于 AI 生图工具的平台，致力于为用户提供便捷、高效的 AI 图像生成服务。
            我们精选多款优质的 AI 生图工具，涵盖头像生成、封面设计、海报制作、菜单设计等多个场景，
            帮助用户轻松创建专业级的设计作品。
          </p>
          <p className="text-slate-600 leading-relaxed">
            无论您是设计师、营销人员、电商卖家还是普通用户，OneClaw 都能为您提供简单易用的 AI 生图解决方案，
            让设计变得轻松有趣。
          </p>
        </div>

        {/* 核心优势 */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">核心优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">AI 智能生成</h3>
              <p className="text-sm text-slate-500">先进的 AI 技术，一键生成精美图片</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">操作简单</h3>
              <p className="text-sm text-slate-500">无需设计基础，轻松上手使用</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-medium text-slate-800 mb-2">持续更新</h3>
              <p className="text-sm text-slate-500">不断上线新工具，满足更多场景</p>
            </div>
          </div>
        </div>

        {/* 功能列表 */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">主要功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'AI 头像表情包',
              '形象照生成',
              '小红书配图',
              '抖音封面',
              '餐饮菜单设计',
              '节日营销海报',
              '商品详情页',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* 联系信息 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">联系我们</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">联系邮箱：</span>
              1017760688@qq.com
            </p>
            <p>
              <span className="font-medium text-slate-800">工作时间：</span>
              周一至周五 9:00-18:00
            </p>
            <p>
              <span className="font-medium text-slate-800">官方网站：</span>
              oneclaw.shop
            </p>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            开始使用
          </Link>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm">
          <p className="mb-2">Copyright © 2024 OneClaw. All rights reserved.</p>
          <p className="text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors mx-2">隐私政策</Link>
            <Link href="/terms" className="hover:text-white transition-colors mx-2">用户协议</Link>
            <span className="mx-2">|</span>
            <span>皖ICP备XXXXXXXX号</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
