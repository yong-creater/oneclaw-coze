'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, TrendingUp, MousePointerClick, ShoppingCart, Zap } from 'lucide-react';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';
import WechatPromo from '@/components/common/WechatPromo';

// ==================== 结果预览图配置 ====================
const RESULT_PREVIEWS = [
  { src: '/demo-main.jpg', label: '主图' },
  { src: '/demo-card-digital.jpg', label: '卖点图' },
  { src: '/demo-card-home.jpg', label: '场景图' },
  { src: '/demo-card-lifestyle.jpg', label: '功能图' },
] as const;

// ==================== 爆款案例配置 ====================
const CASE_STUDIES = [
  {
    name: '蓝牙耳机',
    category: '科技类',
    beforeImg: '/demo-main.jpg',
    afterMainImg: '/demo-main.jpg',
    afterSubImages: [
      { src: '/demo-card-digital.jpg', label: '卖点图' },
      { src: '/demo-card-home.jpg', label: '场景图' },
      { src: '/demo-card-lifestyle.jpg', label: '功能图' },
    ],
    metrics: [
      { icon: 'trending', label: '转化率提升', value: '230%' },
      { icon: 'click', label: '点击率提升', value: '185%' },
      { icon: 'cart', label: '加购率提升', value: '160%' },
    ],
  },
  {
    name: '口红美妆',
    category: '消费类',
    beforeImg: '/demo-card-home.jpg',
    afterMainImg: '/demo-card-home.jpg',
    afterSubImages: [
      { src: '/demo-main.jpg', label: '主图' },
      { src: '/demo-card-digital.jpg', label: '卖点图' },
      { src: '/demo-card-lifestyle.jpg', label: '功能图' },
    ],
    metrics: [
      { icon: 'trending', label: '转化率提升', value: '180%' },
      { icon: 'click', label: '点击率提升', value: '210%' },
      { icon: 'cart', label: '加购率提升', value: '145%' },
    ],
  },
  {
    name: '保温杯',
    category: '通用类',
    beforeImg: '/demo-card-lifestyle.jpg',
    afterMainImg: '/demo-card-lifestyle.jpg',
    afterSubImages: [
      { src: '/demo-main.jpg', label: '主图' },
      { src: '/demo-card-digital.jpg', label: '卖点图' },
      { src: '/demo-card-home.jpg', label: '场景图' },
    ],
    metrics: [
      { icon: 'trending', label: '转化率提升', value: '150%' },
      { icon: 'click', label: '点击率提升', value: '175%' },
      { icon: 'cart', label: '加购率提升', value: '190%' },
    ],
  },
] as const;

// ==================== Metric图标映射 ====================
function MetricIcon({ type }: { type: string }) {
  switch (type) {
    case 'trending':
      return <TrendingUp className="w-4 h-4" />;
    case 'click':
      return <MousePointerClick className="w-4 h-4" />;
    case 'cart':
      return <ShoppingCart className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
}

// ==================== 主组件 ====================
export default function HomePage() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleCTA = () => {
    router.push('/product-generator');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
              <SiteLogo size={32} showText />
            </Link>

            <div className="flex items-center gap-3 min-w-[120px] justify-end">
              <button
                onClick={handleCTA}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 rounded-full transition-colors"
              >
                <span>生成器</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ==================== 第一屏：文案 + 结果预览 ==================== */}
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* 左侧：文案 + CTA */}
            <div className="flex-1 text-center lg:text-left max-w-xl">
              <h1 className="text-3xl md:text-[2.75rem] md:leading-tight font-bold text-slate-900 dark:text-white leading-tight">
                一键生成能直接卖货的
                <br />
                <span className="text-orange-500">商品详情页</span>
              </h1>

              <p className="mt-5 text-base md:text-lg text-slate-500 leading-relaxed">
                上传商品图，自动生成主图、卖点图、场景图、功能图，可直接用于淘宝、京东、拼多多
              </p>

              {/* CTA 按钮 */}
              <button
                onClick={handleCTA}
                className="mt-8 px-10 py-4 text-white font-semibold text-lg rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C00)', boxShadow: '0 8px 24px rgba(255,106,0,0.25)' }}
              >
                🔥 立即生成卖货图
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* 信任文案 */}
              <p className="mt-4 text-sm text-slate-400">
                已帮助 12,000+ 商家生成卖货素材
              </p>
            </div>

            {/* 右侧：4张结果预览 */}
            <div className="flex-1 w-full max-w-lg">
              <div className="grid grid-cols-2 gap-3">
                {RESULT_PREVIEWS.map((item, i) => (
                  <div
                    key={i}
                    className={`group relative rounded-2xl overflow-hidden bg-[#f5f7fa] ${
                      i === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={`AI生成电商${item.label}`}
                      className={`w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] ${
                        i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'
                      }`}
                    />
                    {/* 标签 */}
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-lg">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 爆款卖货案例 ==================== */}
        <section className="bg-slate-50 dark:bg-slate-800/50 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                爆款卖货案例
              </h2>
              <p className="mt-2 text-slate-500 text-sm">
                普通商品图 → AI 卖货图，效果对比一目了然
              </p>
            </div>

            <div className="space-y-14">
              {CASE_STUDIES.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                  {/* 案例头部 */}
                  <div className="px-6 md:px-8 pt-6 pb-4 flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-md">{item.category}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                  </div>

                  {/* 对比区：左原图 → AI节点 → 右AI生成 */}
                  <div className="px-6 md:px-8 pb-6">
                    <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-5">
                      {/* 左：普通商品图 */}
                      <div className="flex-1 w-full md:max-w-[240px] flex flex-col items-center">
                        <span className="mb-3 px-3 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full">
                          普通商品图
                        </span>
                        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600">
                          <img
                            src={item.beforeImg}
                            alt={`${item.name}商品原图`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* 中间AI节点：竖向居中 */}
                      <div className="flex md:flex-col items-center justify-center gap-2 shrink-0 py-2 md:py-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
                          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-bold text-orange-500 tracking-wide">AI重构</span>
                      </div>

                      {/* 右：AI生成卖货图 - 整体卡片容器 */}
                      <div className="flex-[2] w-full flex flex-col">
                        <span className="mb-2 self-start px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-sm">
                          AI 卖货图
                        </span>
                        <div className="flex-1 rounded-2xl bg-[#fafbfc] dark:bg-slate-700/30 border border-orange-100 dark:border-orange-900/20 p-3 space-y-2.5">
                          {/* 第一行：主图 */}
                          <div className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-700/50 shadow-sm">
                            <img
                              src={item.afterMainImg}
                              alt={`${item.name}AI主图`}
                              className="w-full aspect-[16/9] object-contain"
                            />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[10px] font-medium text-white bg-orange-500/70 backdrop-blur-sm rounded-md">
                              主图
                            </span>
                          </div>
                          {/* 第二行：卖点图 + 场景图 + 功能图（3列等宽） */}
                          <div className="grid grid-cols-3 gap-2.5">
                            {item.afterSubImages.map((img, j) => (
                              <div key={j} className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-700/50 shadow-sm">
                                <img
                                  src={img.src}
                                  alt={`${item.name}${img.label}`}
                                  className="w-full aspect-[4/3] object-cover"
                                />
                                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[10px] font-medium text-white bg-orange-500/70 backdrop-blur-sm rounded-md">
                                  {img.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 转化数据 + CTA（紧跟案例内容下方） */}
                  <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20 px-6 md:px-8 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* 转化数据 */}
                      <div className="flex items-center gap-6">
                        {item.metrics.map((m, j) => (
                          <div key={j} className="flex items-center gap-1.5">
                            <span className="text-orange-500">
                              <MetricIcon type={m.icon} />
                            </span>
                            <span className="text-xs text-slate-400">{m.label}</span>
                            <span className="text-sm font-bold text-orange-500">{m.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA 按钮 */}
                      <button
                        onClick={handleCTA}
                        className="px-6 py-2.5 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2 whitespace-nowrap"
                        style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C00)', boxShadow: '0 4px 16px rgba(255,106,0,0.2)' }}
                      >
                        🔥 用这个案例生成我的卖货图
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <WechatPromo />
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
              <span className="font-semibold">OneClaw</span>
              <span>·</span>
              <span>AI卖货内容生成器</span>
            </div>
            <span>© {currentYear} All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
