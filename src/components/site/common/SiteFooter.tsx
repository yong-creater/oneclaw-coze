'use client';

import { useEffect, useState } from 'react';

export default function SiteFooter() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/wechat/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
        } else {
          // API 未返回有效 URL，使用静态文件兜底
          setQrCodeUrl('/wechat-qrcode.jpg');
        }
      })
      .catch(() => {
        setQrCodeUrl('/wechat-qrcode.jpg');
      });
  }, []);

  return (
    <footer className="os-footer">
      <div className="os-footer-inner">
        {/* 左侧：品牌 + 关于我们 */}
        <div className="os-footer-left">
          <span className="os-footer-logo">OneClaw</span>
          <p className="os-footer-desc">
            AI 商业内容生成平台，帮助用户快速生成商品图、小红书、详情页、AI 写真等内容。
          </p>
          <a href="/about" className="os-footer-about-link">关于我们</a>
        </div>

        {/* 右侧：公众号二维码 */}
        <div className="os-footer-qr">
          <div className="os-footer-qr-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="微信公众号" />
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
            )}
          </div>
          <span className="os-footer-qr-label">
            扫码关注公众号
            <br />
            获取 AI 创作灵感
          </span>
        </div>
      </div>

      {/* 底部：版权备案（独立一行） */}
      <div className="os-footer-bottom">
        <span>© 2026 OneClaw · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">渝ICP备2026004291号-2</a></span>
      </div>
    </footer>
  );
}
