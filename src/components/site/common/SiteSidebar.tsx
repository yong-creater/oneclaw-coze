'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wand2, Lightbulb, Image, LogIn, LogOut, User, Crown } from 'lucide-react';
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
                  <hr className="my-1 border-slate-100" />
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
