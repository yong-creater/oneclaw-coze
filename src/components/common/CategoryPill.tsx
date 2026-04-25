// 标准分类选择组件
'use client';

import { cn } from '@/lib/utils';

interface CategoryPillProps {
  categories: { id: number | string; name: string; slug?: string }[];
  activeId: string | number;
  onSelect: (id: string) => void;
  showAll?: boolean;
  allLabel?: string;
  allId?: string;
  className?: string;
}

export function CategoryPill({
  categories,
  activeId,
  onSelect,
  showAll = true,
  allLabel = '全部',
  allId = 'all',
  className
}: CategoryPillProps) {
  const allCategories = showAll 
    ? [{ id: allId, name: allLabel, slug: allId }, ...categories] 
    : categories;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {allCategories.map((cat) => {
        const isActive = activeId === cat.id || (cat.slug && activeId === cat.slug);
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug || String(cat.id))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryPill;
