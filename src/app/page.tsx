'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import SiteHeader from '@/components/common/SiteHeader';
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
    mainImg: '/demo-main.jpg',
    subImages: [
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
    mainImg: '/case-lipstick-product.png',
    subImages: [
      { src: '/case-lipstick-model.png', label: '卖点图' },
      { src: '/case-lipstick-scene.png', label: '场景图' },
      { src: '/case-lipstick-main.png', label: '功能图' },
    ],
    metrics: [
      { icon: 'trending', label: '转化率提升', value: '180%' },
      { icon: 'click', label: '点击率提升', value: '210%' },
      { icon: 'cart', label: '加购率提升', value: '145%' },
    ],
  },
  {
    name: '保温杯',
    mainImg: '/demo-card-lifestyle.jpg',
    subImages: [
      { src: '/demo-main.jpg', label: '卖点图' },
      { src: '/demo-card-digital.jpg', label: '场景图' },
      { src: '/demo-card-home.jpg', label: '功能图' },
    ],
    metrics: [
      { icon: 'trending', label: '转化率提升', value: '150%' },
      { icon: 'click', label: '点击率提升', value: '175%' },
      { icon: 'cart', label: '加购率提升', value: '190%' },
    ],
  },
] as const;

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
      {/* 顶部导航 - 使用独立组件避免hydration闪烁 */}
      <SiteHeader />

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

            {/* 右侧：4张结果预览（主图全宽 + 3列小图） */}
            <div className="flex-1 w-full max-w-lg">
              <div className="space-y-3">
                {/* 主图 - 全宽 */}
                <div className="group relative rounded-2xl overflow-hidden bg-[#f5f7fa]">
                  <img
                    src={RESULT_PREVIEWS[0].src}
                    alt={`AI生成电商${RESULT_PREVIEWS[0].label}`}
                    className="w-full aspect-[16/9] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-2 left-2 px-2.5 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-lg">
                    {RESULT_PREVIEWS[0].label}
                  </span>
                </div>
                {/* 3列小图 - 等宽无空白 */}
                <div className="grid grid-cols-3 gap-3">
                  {RESULT_PREVIEWS.slice(1).map((item, i) => (
                    <div
                      key={i}
                      className="group relative rounded-2xl overflow-hidden bg-[#f5f7fa]"
                    >
                      <img
                        src={item.src}
                        alt={`AI生成电商${item.label}`}
                        className="w-full aspect-[4/3] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-lg">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 爆款卖货案例 ==================== */}
        <section className="bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/30 dark:to-slate-900 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                爆款卖货案例
              </h2>
              <p className="mt-3 text-slate-500 text-base">
                无需准备素材，AI 一键生成全套卖货图
              </p>
            </div>

            <div className="space-y-10">
              {CASE_STUDIES.map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                >
                  {/* 案例头部 */}
                  <div className="px-8 pt-8 pb-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                  </div>

                  {/* 图片展示区 */}
                  <div className="px-8 pb-8">
                    {/* 主图 - 16:9 铺满 */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        src={item.mainImg}
                        alt={`${item.name}主图`}
                        className="w-full aspect-[16/9] object-cover"
                      />
                      <span className="absolute bottom-3 left-3 px-3 py-1 text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md rounded-lg">
                        主图
                      </span>
                    </div>

                    {/* 三张小图 - 4:3 等高 */}
                    <div className="grid grid-cols-3 gap-4 mt-5">
                      {item.subImages.map((img, j) => (
                        <div key={j} className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <img
                            src={img.src}
                            alt={`${item.name}${img.label}`}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md rounded-lg">
                            {img.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 转化数据 + CTA */}
                  <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                      {/* 转化数据 */}
                      <div className="flex items-center gap-8">
                        {item.metrics.map((m, j) => (
                          <div key={j} className="flex flex-col items-center sm:items-start">
                            <span className="text-xl font-bold text-orange-500">{m.value}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{m.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA 按钮 */}
                      <button
                        onClick={handleCTA}
                        className="px-7 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2 whitespace-nowrap"
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
