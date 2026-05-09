'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WechatPromoProps {
  className?: string;
}

export default function WechatPromo({ className = '' }: WechatPromoProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('/wechat-qrcode.jpg');

  useEffect(() => {
    fetch('/api/wechat/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`max-w-7xl mx-auto px-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-slate-200 dark:border-slate-700">
        {/* 品牌 + 公众号信息 */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={qrCodeUrl} 
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
        
        {/* 底部链接 */}
        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="text-slate-500 dark:text-slate-400">OneClaw - AI卖货内容生成器</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
            渝ICP备2026004291号-2
          </a>
        </div>
      </div>
    </div>
  );
}
