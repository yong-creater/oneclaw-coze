'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * 统一统计卡片组件
 * 
 * 使用规范：
 * - 用于仪表盘统计展示
 * - 图标容器使用 rounded-xl
 * - 卡片使用 border-slate-200
 * - 悬浮使用 shadow-lg border-slate-300
 */
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  href,
  trend,
  className = '' 
}: StatCardProps) {
  const content = (
    <Card className={`bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <p className={`text-xs mt-1 ${
                trend.value >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default StatCard;
