'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wand2, Lightbulb, Image, LogIn, LogOut, User, Crown } from 'lucide-react';

/** 微信图标 — 简约 SVG */
function WechatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" strokeWidth={0}>
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.42 6.42 0 0 1-.246-1.79c0-3.552 3.395-6.443 7.585-6.443.232 0 .459.022.684.042C16.387 4.834 12.879 2.188 8.691 2.188zm-2.85 4.56a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm5.7 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm4.3 4.378c-3.652 0-6.615 2.472-6.615 5.517s2.963 5.517 6.615 5.517a7.8 7.8 0 0 0 2.222-.323.617.617 0 0 1 .51.07l1.36.796a.233.233 0 0 0 .119.039.21.21 0 0 0 .207-.211c0-.051-.021-.102-.035-.152l-.278-1.054a.42.42 0 0 1 .152-.474c1.34-.988 2.198-2.452 2.198-4.108 0-3.045-2.963-5.517-6.655-5.517zM14.5 15a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm3.6 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
    </svg>
  );
}
import { SiteLogo } from '@/components/site/common/SiteLogo';
import { useUser } from '@/contexts/UserContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

/* 创作 → 灵感 → 作品 */
const NAV_ITEMS: NavItem[] = [
  { icon: Wand2,     label: '创作',   href: '/' },
  { icon: Lightbulb, label: '灵感',   href: '/inspiration' },
  { icon: Image,     label: '作品',   href: '/projects' },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const { user, authenticated, logout, setShowLoginModal, requireAuth } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQr, setShowQr] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="os-dock">
      {/* ===== Logo ===== */}
      <Link href="/" className="os-dock-logo" aria-label="OneClaw 首页">
        <div className="relative rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#5B8CFF] shadow-sm" style={{ width: 36, height: 36 }}>
          <Wand2 className="text-white" style={{ width: 18, height: 18 }} strokeWidth={2.5} />
        </div>
        <span className="os-dock-brand">OneClaw</span>
      </Link>

      {/* ===== 主导航 ===== */}
      <nav className="os-dock-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const needsAuth = item.href === '/projects';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`os-dock-item ${active ? 'os-dock-item-active' : ''}`}
              title={item.label}
              onClick={(e) => {
                if (needsAuth && !requireAuth(undefined)) { e.preventDefault(); }
              }}
            >
              <Icon className="os-dock-icon" strokeWidth={1.5} />
              <span className="os-dock-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===== 底部区域 ===== */}
      <div className="os-dock-bottom">
        {/* 公众号入口 */}
        <div
          className="os-dock-wechat-btn"
          title="关注公众号"
          onMouseEnter={() => setShowQr(true)}
          onMouseLeave={() => setShowQr(false)}
        >
          <WechatIcon className="os-dock-wechat-icon" />

          {/* 二维码浮层 */}
          {showQr && (
            <div className="os-dock-qr-popup">
              <div className="os-dock-qr-popup-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/wechat/qrcode-image"
                  alt="微信公众号"
                  className="os-dock-qr-img"
                />
                <span className="os-dock-qr-text">扫码关注公众号</span>
              </div>
            </div>
          )}
        </div>

        {/* 会员入口 */}
        <Link
          href="/membership"
          className="os-dock-member-btn"
          title="会员中心"
        >
          <Crown className="os-dock-member-icon" strokeWidth={1.5} />
        </Link>

        {/* 登录 / 头像 */}
        {!authenticated ? (
          <button
            className="os-dock-login-btn"
            title="登录"
            onClick={() => setShowLoginModal(true)}
            type="button"
          >
            <LogIn className="os-dock-login-icon" strokeWidth={1.5} />
          </button>
        ) : (
          <div className="os-dock-avatar-wrap">
            <button
              className="os-dock-avatar-btn"
              title={user?.nickname || '用户'}
              onClick={() => setShowDropdown(!showDropdown)}
              type="button"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="os-dock-avatar-img" />
              ) : (
                <div className="os-dock-avatar-fallback">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="os-dock-user-menu">
                  <Link
                    href="/projects"
                    onClick={() => setShowDropdown(false)}
                    className="os-dock-user-menu-item"
                  >
                    <Image className="w-4 h-4" />
                    <span>我的作品</span>
                  </Link>
                  <Link
                    href="/membership"
                    onClick={() => setShowDropdown(false)}
                    className="os-dock-user-menu-item"
                  >
                    <Crown className="w-4 h-4" />
                    <span>会员中心</span>
                  </Link>
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="os-dock-user-menu-item text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
