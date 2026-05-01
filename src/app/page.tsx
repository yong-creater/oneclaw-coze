'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { SiteLogo } from '@/components/common/SiteLogo';
import AnimatedLobster from '@/components/common/AnimatedLobster';
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
    beforeImg: '/demo-main.jpg',
    afterImages: [
      '/demo-card-digital.jpg',
      '/demo-card-home.jpg',
      '/demo-card-lifestyle.jpg',
    ],
    afterLabels: ['主图', '卖点图', '场景图'],
    highlight: '转化率提升 230%',
  },
  {
    name: '口红美妆',
    beforeImg: '/demo-main.jpg',
    afterImages: [
      '/demo-card-digital.jpg',
      '/demo-card-home.jpg',
      '/demo-card-lifestyle.jpg',
    ],
    afterLabels: ['主图', '卖点图', '场景图'],
    highlight: '点击率提升 180%',
  },
  {
    name: '保温杯',
    beforeImg: '/demo-main.jpg',
    afterImages: [
      '/demo-card-digital.jpg',
      '/demo-card-home.jpg',
      '/demo-card-lifestyle.jpg',
    ],
    afterLabels: ['主图', '卖点图', '场景图'],
    highlight: '加购率提升 150%',
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
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>

            <div className="flex items-center gap-3">
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
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                爆款卖货案例
              </h2>
              <p className="mt-2 text-slate-500 text-sm">
                普通商品图 → AI 生成卖货图，效果立见
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CASE_STUDIES.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  {/* Before 图片 */}
                  <div className="relative">
                    <div className="aspect-[4/3] bg-[#f5f7fa]">
                      <img
                        src={item.beforeImg}
                        alt={`${item.name}商品原图`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200">
                      原图
                    </span>
                  </div>

                  {/* 转化箭头 */}
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>商品图</span>
                      <ArrowRight className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-500 font-medium">卖货图</span>
                    </div>
                  </div>

                  {/* After 图片组 */}
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-3 gap-2">
                      {item.afterImages.map((img, j) => (
                        <div key={j} className="relative rounded-xl overflow-hidden bg-[#f5f7fa]">
                          <img
                            src={img}
                            alt={`${item.name}${item.afterLabels[j]}`}
                            className="w-full aspect-square object-cover"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium text-white bg-black/50 rounded">
                            {item.afterLabels[j]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 提升数据 */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-sm font-bold text-orange-500">{item.highlight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 案例区底部 CTA */}
            <div className="text-center mt-12">
              <button
                onClick={handleCTA}
                className="px-8 py-3.5 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C00)' }}
              >
                🔥 立即生成卖货图
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <WechatPromo />
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={12} />
              </div>
              <span>OneClaw</span>
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
