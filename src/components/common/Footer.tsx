'use client';

import Link from 'next/link';
import { Mail, Heart } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    { label: '首页', href: '/' },
    { label: 'AI工具库', href: '/ai-tools' },
    { label: '提示词', href: '/prompts' },
    { label: '教程', href: '/tutorials' },
  ],
  company: [
    { label: '关于我们', href: '/about' },
    { label: '联系方式', href: '/contact' },
    { label: '用户协议', href: '/terms' },
    { label: '隐私政策', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* 上部分 - 链接 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 品牌 */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              {/* Logo图标 */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 rounded-xl blur opacity-30" />
                <svg viewBox="0 0 36 36" className="w-8 h-8 relative">
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444"/>
                      <stop offset="50%" stopColor="#f97316"/>
                      <stop offset="100%" stopColor="#fb923c"/>
                    </linearGradient>
                  </defs>
                  <path d="M8 14 L4 8 Q2 4 6 3 Q10 2 11 6 L13 14" 
                        fill="none" stroke="url(#footerLogoGrad)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M28 14 L32 8 Q34 4 30 3 Q26 2 25 6 L23 14" 
                        fill="none" stroke="url(#footerLogoGrad)" strokeWidth="2" strokeLinecap="round"/>
                  <ellipse cx="18" cy="22" rx="9" ry="8" fill="url(#footerLogoGrad)"/>
                  <circle cx="14" cy="20" r="1.5" fill="white"/>
                  <circle cx="22" cy="20" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              精选238+款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作等全品类。
            </p>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              产品
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司链接 */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              关于
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部 */}
        <div className="pt-6 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
              <span>© 2024-2026 OneClaw</span>
              <span className="mx-1">·</span>
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>in Beijing</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="mailto:1017760688@qq.com"
                className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                1017760688@qq.com
              </a>
              <Link 
                href="https://beian.miit.gov.cn/" 
                target="_blank"
                className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
              >
                皖ICP备2025012345号
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
