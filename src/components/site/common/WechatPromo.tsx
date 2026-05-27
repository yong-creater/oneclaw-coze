'use client';

import Link from 'next/link';

interface WechatPromoProps {
  className?: string;
}

export default function WechatPromo({ className = '' }: WechatPromoProps) {
  // 直接使用后端代理接口返回二维码图片，无需前端 fetch
  const qrCodeSrc = '/api/wechat/qrcode-image';

  return (
    <div className={`max-w-7xl mx-auto px-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-white/[0.06]">
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
            <h3 className="font-bold text-white/80">欢迎关注公众号</h3>
            <p className="text-sm text-white/30">
              获取最新AI工具资讯、技巧与资源 · 回复「AI」送你AI工具使用指南
            </p>
          </div>
        </div>
        
        {/* 底部链接 */}
        <div className="flex items-center gap-6 text-sm text-white/30">
          <span className="text-white/30">OneClaw - AI卖货内容生成器</span>
          <span className="text-white/15">|</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#a78bfa] transition-colors">
            渝ICP备2026004291号-2
          </a>
        </div>
      </div>
    </div>
  );
}
