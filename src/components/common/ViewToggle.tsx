'use client';

import React from 'react';
import { Grid3X3, List, LucideIcon } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

/**
 * 统一视图切换组件
 * 
 * 使用规范：
 * - 背景白色
 * - 圆角 rounded-xl
 * - 选中状态使用 bg-slate-900 text-white
 * - 未选中使用 text-slate-500 hover:bg-slate-100
 */
export function ViewToggle({ 
  viewMode, 
  onViewModeChange,
  className = '' 
}: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          viewMode === 'grid' 
            ? 'bg-slate-900 text-white' 
            : 'text-slate-500 hover:bg-slate-100'
        }`}
        aria-label="网格视图"
      >
        <Grid3X3 className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          viewMode === 'list' 
            ? 'bg-slate-900 text-white' 
            : 'text-slate-500 hover:bg-slate-100'
        }`}
        aria-label="列表视图"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ViewToggle;
