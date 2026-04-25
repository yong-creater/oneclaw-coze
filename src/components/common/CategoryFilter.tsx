'use client';

import React from 'react';

interface CategoryItem {
  name: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

/**
 * 统一分类筛选组件
 * 
 * 使用规范：
 * - 选中状态使用 bg-slate-900 text-white
 * - 未选中使用 bg-white border border-slate-200
 * - 圆角 rounded-xl
 * - 可水平滚动
 */
export function CategoryFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  className = '' 
}: CategoryFilterProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onCategoryChange(cat.name)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
            transition-all cursor-pointer
            ${activeCategory === cat.name
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }
          `}
        >
          {cat.name}
          {cat.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
