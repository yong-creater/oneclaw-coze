'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Bot, Mail, Github, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    { label: '首页', href: '/' },
    { label: '自建工具', href: '/own-tools' },
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
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和简介 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">OneClaw</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              OneClaw（钳爪）是全品类AI工具导航站，精选238+款优质AI工具，涵盖视频生成、数字人、AI绘画、AI写作等全品类。
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:1017760688@qq.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                1017760688@qq.com
              </a>
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">产品</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司链接 */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">关于</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              <p>© 2024-2026 OneClaw All Rights Reserved.</p>
              <p className="mt-1">
                <Link href="https://beian.miit.gov.cn/" target="_blank" className="hover:text-primary">
                  京ICP备XXXXXXXX号
                </Link>
                {' · '}
                <span>增值电信业务经营许可证</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                联系方式: 1017760688@qq.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
