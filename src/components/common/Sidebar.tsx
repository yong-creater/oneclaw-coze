'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bot, Sparkles, Grid3X3, Crown, BookOpen, MessageSquare, Briefcase, Settings } from 'lucide-react';

// 导航配置
const NAV_ITEMS = [
  {
    label: 'AI工具库',
    href: '/ai-tools',
    icon: Grid3X3,
  },
  {
    label: '自建工具',
    href: '/own-tools',
    icon: Sparkles,
  },
  {
    label: '技能库',
    href: '/skills',
    icon: Briefcase,
  },
  {
    label: '榜单中心',
    href: '/rankings',
    icon: Crown,
  },
  {
    label: '提示词库',
    href: '/prompts',
    icon: MessageSquare,
  },
  {
    label: '教程库',
    href: '/tutorials',
    icon: BookOpen,
  },
  {
    label: '工作台',
    href: '/workspace',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // 检查是否匹配路径
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[var(--sidebar-width,260px)] flex flex-col
                 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl 
                 border-r border-zinc-200/60 dark:border-zinc-800/60
                 z-50"
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo 图标 */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-300">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {/* 光晕效果 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* 标题 */}
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              OneClaw
            </span>
            <span className="text-[10px] text-zinc-400 -mt-0.5">AI工具导航</span>
          </div>
        </Link>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                active && "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20"
              )}
            >
              {/* 选中指示器 */}
              {active && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-px w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full blur-[1px]" />
                </>
              )}
              
              {/* 图标 */}
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                active 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25"
                  : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
              )}>
                <Icon className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  active ? "text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
                )} />
              </div>
              
              {/* 文字 */}
              <span className={cn(
                "text-sm font-medium transition-colors duration-200",
                active 
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
              )}>
                {item.label}
              </span>
              
              {/* 悬停渐变 */}
              {!active && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 transition-opacity duration-200 pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 底部装饰 */}
      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
      
      {/* 底部信息 */}
      <div className="p-4">
        <div className="text-center">
          <p className="text-[10px] text-zinc-400">精选238款优质AI工具</p>
        </div>
      </div>
    </aside>
  );
}
