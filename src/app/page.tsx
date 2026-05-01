'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Home
} from 'lucide-react';
import { SiteLogo } from '@/components/common/SiteLogo';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import LoginButton from '@/components/common/LoginButton';
import Link from 'next/link';
import WechatPromo from '@/components/common/WechatPromo';

// ==================== 常量 ====================
const MAIN_TABS = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'generator', label: '生成器', icon: Sparkles },
] as const;

type MainTab = 'home' | 'generator';

// ==================== 主组件 ====================
export default function HomePage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <AnimatedLobster size={32} className="sm:size-9" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                OneClaw
              </span>
            </Link>

            {/* 主导航Tab */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.key;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      if (tab.key === 'generator') {
                        router.push('/product-generator');
                      } else {
                        setMainTab(tab.key);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== 首页：生成器入口 ==================== */}
        {mainTab === 'home' && (
          <div className="flex flex-col items-center text-center py-12 md:py-20">
            {/* 品牌标识 */}
            <div className="mb-6">
              <SiteLogo size={48} showText={false} />
            </div>

            {/* 主标题 */}
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight max-w-3xl">
              一键生成能直接卖货的<br />
              <span className="text-orange-500">商品详情页</span>
            </h1>

            {/* 副标题 */}
            <p className="mt-4 text-base md:text-lg text-slate-500 max-w-xl">
              上传商品图，自动生成主图 + 卖点图 + 场景图 + 详情页
            </p>

            {/* CTA 按钮 */}
            <a
              href="/product-generator"
              className="mt-8 px-10 py-4 text-white font-semibold text-lg rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C00)', boxShadow: '0 8px 24px rgba(255,106,0,0.25)' }}
            >
              🔥 立即生成卖货图
            </a>

            {/* 结果预览说明 */}
            <p className="mt-3 text-sm text-slate-400">
              自动生成完整电商详情页（主图 / 卖点 / 场景 / 功能）
            </p>

            {/* 信任文案 */}
            <p className="mt-2 text-xs text-slate-400">
              已帮助 12,000+ 商家提升转化率
            </p>

            {/* 详情页效果流 */}
            <div className="mt-16 w-full max-w-2xl space-y-4">
              <img src="/demo-main.jpg" alt="AI生成电商主图" className="w-full aspect-[16/9] object-contain rounded-2xl bg-[#f5f7fa]" />
              <img src="/demo-card-digital.jpg" alt="AI生成卖点图" className="w-full aspect-[16/9] object-contain rounded-2xl bg-[#f5f7fa]" />
              <img src="/demo-card-home.jpg" alt="AI生成场景图" className="w-full aspect-[16/9] object-contain rounded-2xl bg-[#f5f7fa]" />
              <img src="/demo-card-lifestyle.jpg" alt="AI生成功能图" className="w-full aspect-[16/9] object-contain rounded-2xl bg-[#f5f7fa]" />
            </div>
          </div>
        )}
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
