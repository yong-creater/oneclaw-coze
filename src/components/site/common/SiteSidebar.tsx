'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Flame, FolderOpen, Wrench, LogIn, LogOut, User, Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/site/common/SiteLogo';
import { useUser } from '@/contexts/UserContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

/* 创作 → 灵感 → 作品 → 工具库 */
const NAV_ITEMS: NavItem[] = [
  { icon: Sparkles,  label: '创作',   href: '/' },
  { icon: Flame,     label: '灵感',   href: '/inspiration' },
  { icon: FolderOpen,label: '作品',   href: '/projects' },
  { icon: Wrench,    label: '工具库', href: '/tools' },
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const { user, authenticated, logout, setShowLoginModal, requireAuth } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTaskCount, setActiveTaskCount] = useState(0);

  // 轮询活跃任务数
  useEffect(() => {
    if (!authenticated) { setActiveTaskCount(0); return; }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/tasks?status=generating&limit=10');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setActiveTaskCount(data.tasks?.length ?? 0);
        }
      } catch { /* ignore */ }
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [authenticated]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="os-dock">
      {/* ===== Logo ===== */}
      <Link href="/" className="os-dock-logo" aria-label="OneClaw 首页">
        <div className="relative rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#5B8CFF] shadow-sm" style={{ width: 36, height: 36 }}>
          <Sparkles className="text-white" style={{ width: 18, height: 18 }} strokeWidth={2.5} />
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

      {/* ===== 生成任务指示器 ===== */}
      {activeTaskCount > 0 && (
        <Link
          href="/projects?tab=tasks"
          className="os-dock-task-indicator"
          title={`${activeTaskCount} 个任务生成中`}
          onClick={(e) => {
            if (!requireAuth(undefined)) { e.preventDefault(); }
          }}
        >
          <div className="os-dock-task-dot" />
          <span className="os-dock-task-text">{activeTaskCount} 生成中</span>
        </Link>
      )}

      {/* ===== 底部：登录 / 我的 ===== */}
      <div className="os-dock-bottom">
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
                    <FolderOpen className="w-4 h-4" />
                    <span>我的作品</span>
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
