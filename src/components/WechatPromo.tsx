'use client';

import Image from 'next/image';
import Link from 'next/link';

interface WechatPromoProps {
  className?: string;
}

export default function WechatPromo({ className = '' }: WechatPromoProps) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 border-b border-slate-100 ${className}`}>
      <div className="flex items-center gap-4">
        <Image 
          src="/wechat-qrcode.jpg" 
          alt="微信公众号" 
          width={80}
          height={80}
          className="w-20 h-20 rounded-lg shadow-sm object-cover"
        />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">欢迎关注公众号</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            获取最新AI工具资讯、技巧与资源
          </p>
          <p className="text-xs text-slate-400">
            回复「AI」送你一份AI工具使用指南
          </p>
        </div>
      </div>
    </div>
  );
}
