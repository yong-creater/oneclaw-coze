'use client';

import React from 'react';
import { Search, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * 统一搜索输入框组件
 * 
 * 使用规范：
 * - 左侧搜索图标
 * - 背景白色
 * - 圆角 rounded-xl
 * - 聚焦使用 orange-500 ring
 */
export function SearchInput({ 
  value, 
  onChange, 
  placeholder = '搜索...',
  icon: Icon = Search,
  className = '' 
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-4 bg-white border-slate-200 rounded-xl h-11 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
      />
    </div>
  );
}

export default SearchInput;
