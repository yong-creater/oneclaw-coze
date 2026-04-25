// 标准分页组件
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 
                   hover:border-slate-300 dark:hover:border-slate-600
                   text-slate-600 dark:text-slate-400"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <span className="text-sm text-slate-500 dark:text-slate-400 min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 
                   hover:border-slate-300 dark:hover:border-slate-600
                   text-slate-600 dark:text-slate-400"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default Pagination;
