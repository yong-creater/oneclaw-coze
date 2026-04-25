'use client';

import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * 统一空状态组件
 * 
 * 使用规范：
 * - 用于列表为空时显示
 * - 图标默认使用 FolderOpen
 * - 提供操作按钮引导用户
 */
export function EmptyState({ 
  icon: Icon = FolderOpen, 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 mb-6">{description}</p>
      )}
      {action && (
        <Button 
          onClick={action.onClick}
          className="bg-slate-900 hover:bg-slate-800 cursor-pointer"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
