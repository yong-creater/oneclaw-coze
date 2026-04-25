'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Heart, Crown, Zap } from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

export default function LoginPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const handleMockLogin = () => {
    setToast('模拟登录成功');
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 mb-4">
              <AnimatedLobster size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">OneClaw</h1>
            <p className="text-sm text-slate-500 mt-1">登录以使用更多功能</p>
          </div>

          {/* 登录选项 */}
          <div className="space-y-3">
            <button
              onClick={handleMockLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <User className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">快速体验（模拟登录）</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">或</span>
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.69 6.95c-.17-.58-.67-.95-1.23-.95-.72 0-1.28.48-1.28 1.17 0 .75.66 1.12 1.74 1.5 1.25.43 2.31 1.17 2.31 2.85 0 1.85-1.63 3.04-3.7 3.04-1.63 0-2.93-.61-3.63-1.7l1.57-1.03c.31.66.9 1.05 1.7 1.05.67 0 1.2-.38 1.2-1.03 0-.61-.43-.96-1.53-1.32-1.08-.36-2.36-.96-2.36-2.62 0-1.67 1.37-2.86 3.3-2.86 1.25 0 2.31.53 2.95 1.52l-1.46 1.03c-.19-.46-.57-.73-1.08-.73-.52 0-.9.28-.9.72 0 .36.28.59 1.07.85.93.31 2.05.66 2.05 1.91 0 1.13-1.08 1.98-2.36 1.98-.98 0-1.88-.43-2.36-1.25l1.68-1.12c.17.59.67.98 1.28.98.72 0 1.28-.48 1.28-1.17 0-.72-.59-1.08-1.47-1.37-.08-.04-.17-.08-.25-.11l.25-.01c.17 0 .33-.01.5-.01z"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="text-sm font-medium">微信扫码登录</span>
            </button>
          </div>

          {/* 会员提示 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-800">开通会员享更多权益</h3>
                <p className="text-xs text-slate-500 mt-0.5">专属AI功能、无限使用、优先体验</p>
                <button
                  onClick={() => router.push('/membership')}
                  className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  了解会员权益 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 协议 */}
        <p className="text-center text-xs text-slate-400 mt-4">
          登录即表示同意{' '}
          <Link href="/terms" className="text-slate-500 hover:underline">用户协议</Link>
          {' '}和{' '}
          <Link href="/privacy" className="text-slate-500 hover:underline">隐私政策</Link>
        </p>
      </div>
    </div>
  );
}
