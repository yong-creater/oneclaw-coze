// 标准侧边栏导航组件
'use client';

import { cn } from '@/lib/utils';

interface SidebarNavProps {
  categories: { id: number; name: string; slug: string }[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
}

export function SidebarNav({
  categories,
  activeSlug,
  onSelect,
  className
}: SidebarNavProps) {
  return (
    <aside className={cn('w-56 flex-shrink-0', className)}>
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 sticky top-24">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">分类</h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {/* 全部 */}
          <button
            onClick={() => onSelect('all')}
            className={cn(
              'w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
              activeSlug === 'all'
                ? 'bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            )}
          >
            <span className="truncate flex-1 text-left">全部</span>
          </button>
          
          {/* 分类列表 */}
          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.slug)}
                className={cn(
                  'w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
              >
                <span className="truncate flex-1 text-left">{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default SidebarNav;
