'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * 统一分页组件
 * 
 * 使用规范：
 * - 居中显示
 * - 按钮使用 variant="outline"
 * - 禁用状态使用 disabled 属性
 */
export function Pagination({ 
  page, 
  totalPages, 
  onPageChange,
  className = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="cursor-pointer"
      >
        上一页
      </Button>
      <span className="text-sm text-slate-500">
        第 {page} / {totalPages} 页
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="cursor-pointer"
      >
        下一页
      </Button>
    </div>
  );
}

export default Pagination;
