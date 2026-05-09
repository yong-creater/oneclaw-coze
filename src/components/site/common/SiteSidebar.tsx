'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Flame, FolderOpen, Wrench, Info, MessageCircle } from 'lucide-react';
import { SiteLogo } from '@/components/site/common/SiteLogo';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Sparkles, label: '创作', href: '/' },
  { icon: Flame,    label: '灵感', href: '/prompts' },
  { icon: FolderOpen, label: '作品', href: '/projects' },
  { icon: Wrench,   label: '工具库', href: '/tools' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: Info,          label: '关于', href: '/about' },
  { icon: MessageCircle, label: '公众号', href: '#wechat' },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const [showQR, setShowQR] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="os-dock">
      {/* ===== Logo ===== */}
      <Link href="/" className="os-dock-logo" aria-label="OneClaw 首页">
        <SiteLogo size={32} />
      </Link>

      {/* ===== 主导航 ===== */}
      <nav className="os-dock-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`os-dock-item ${active ? 'os-dock-item-active' : ''}`}
              title={item.label}
            >
              <Icon className="os-dock-icon" strokeWidth={1.8} />
              <span className="os-dock-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===== 底部 ===== */}
      <div className="os-dock-bottom">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.href === '#wechat') {
            return (
              <button
                key="wechat"
                className="os-dock-item"
                title="微信公众号"
                onClick={() => setShowQR(!showQR)}
                type="button"
              >
                <Icon className="os-dock-icon" strokeWidth={1.8} />
                <span className="os-dock-label">公众号</span>
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className="os-dock-item"
              title={item.label}
            >
              <Icon className="os-dock-icon" strokeWidth={1.8} />
              <span className="os-dock-label">{item.label}</span>
            </Link>
          );
        })}

        {/* 备案信息 */}
        <div className="os-dock-icp" title="渝ICP备2026004291号-2">
          ICP
        </div>
      </div>

      {/* ===== 公众号二维码浮窗 ===== */}
      {showQR && (
        <div className="os-dock-qr-popup">
          <div className="os-dock-qr-card">
            <img
              src="/wechat-qrcode.jpg"
              alt="微信公众号二维码"
              className="os-dock-qr-img"
            />
            <p className="os-dock-qr-text">扫码关注公众号</p>
            <p className="os-dock-qr-sub">获取 AI 创作灵感</p>
          </div>
          <div className="os-dock-qr-arrow" />
        </div>
      )}
    </aside>
  );
}
