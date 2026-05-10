'use client';

import Link from 'next/link';

interface WechatPromoProps {
  className?: string;
}

export default function WechatPromo({ className = '' }: WechatPromoProps) {
  const qrCodeSrc = '/api/wechat/qrcode-image';

  return (
    <div className={`max-w-7xl mx-auto px-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-slate-200 dark:border-slate-700">
        {/* 品牌 + 公众号信息 */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={qrCodeSrc} 
            alt="微信公众号" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg shadow-sm object-cover flex-shrink-0"
          />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">欢迎关注公众号</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              获取最新AI工具资讯、技巧与资源 · 回复「AI」送你AI工具使用指南
            </p>
          </div>
        </div>
        
        {/* 关于我们 */}
        <Link
          href="/about"
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          关于我们
        </Link>
      </div>
    </div>
  );
}
