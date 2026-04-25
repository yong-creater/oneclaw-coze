// 标准空状态组件
'use client';

import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button 
          variant="outline" 
          onClick={action.onClick}
          className="rounded-xl border border-slate-200 dark:border-slate-700 
                     hover:border-slate-300 dark:hover:border-slate-600"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
