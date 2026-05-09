'use client';

import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="os-footer">
      <div className="os-footer-inner">
        {/* 左侧：品牌 + 简介 */}
        <div className="os-footer-brand">
          <div className="os-footer-logo">OneClaw</div>
          <p className="os-footer-desc">
            OneClaw 是一个 AI 商业内容生成平台，帮助用户快速生成商品图、小红书、海报、详情页、AI 写真等内容。
          </p>
        </div>

        {/* 中间：快速链接 */}
        <div className="os-footer-links">
          <div className="os-footer-link-group">
            <span className="os-footer-link-title">产品</span>
            <Link href="/?toolId=product-generator&type=product" className="os-footer-link">AI 商品图</Link>
            <Link href="/?toolId=xiaohongshu-generator&type=xiaohongshu" className="os-footer-link">小红书生成</Link>
            <Link href="/?toolId=ai-photo&type=aiphoto" className="os-footer-link">AI 写真</Link>
            <Link href="/tools" className="os-footer-link">全部工具</Link>
          </div>
          <div className="os-footer-link-group">
            <span className="os-footer-link-title">发现</span>
            <Link href="/prompts" className="os-footer-link">灵感案例</Link>
            <Link href="/projects" className="os-footer-link">我的作品</Link>
            <Link href="/about" className="os-footer-link">关于我们</Link>
          </div>
        </div>

        {/* 右侧：公众号 */}
        <div className="os-footer-wechat">
          <span className="os-footer-link-title">微信公众号</span>
          <div className="os-footer-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wechat-qrcode.jpg" alt="微信公众号" />
          </div>
        </div>
      </div>

      {/* 底部备案 */}
      <div className="os-footer-bottom">
        <span>© {new Date().getFullYear()} OneClaw</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          渝ICP备2026004291号-2
        </a>
      </div>
    </footer>
  );
}
