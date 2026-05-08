'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteLogo } from '@/components/common/SiteLogo';
import LoginButton from '@/components/common/LoginButton';
import {
  Home,
  Package,
  Scissors,
  Camera,
  Image,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';

// 导航项配置
const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { divider: true, label: 'AI 工具' },
  { href: '/product-generator', label: '商品图生成', icon: Package },
  { href: '/background-removal', label: '智能抠图', icon: Scissors },
  { href: '/ai-photo', label: 'AI 写真', icon: Camera },
  { href: '/product-poster', label: '商品海报', icon: Image },
  { href: '/xiaohongshu-generator', label: '小红书图文', icon: FileText },
  { divider: true, label: '更多' },
  { href: '/novel', label: '小说洗稿', icon: BookOpen },
  { href: '/resume', label: '简历优化', icon: Sparkles },
];

export default function SiteSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col"
    >
      {/* Logo 区域 */}
      <div className="h-14 flex items-center px-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <SiteLogo size={28} showText />
      </div>

      {/* 导航链接 */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_ITEMS.map((item, i) => {
          if ('divider' in item && item.divider) {
            return (
              <div key={`divider-${i}`} className="pt-4 pb-1 px-2">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          const navItem = item as { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
          const Icon = navItem.icon;
          const active = isActive(navItem.href);

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  active
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-orange-500' : ''}`} />
              <span>{navItem.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部：登录按钮 */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <LoginButton />
      </div>
    </aside>
  );
}
