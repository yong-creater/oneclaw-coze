'use client';

import { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UtilityCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function UtilityCard({ 
  title, 
  icon, 
  children, 
  className = '',
  gradient = 'from-orange-500 to-amber-500'
}: UtilityCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 标题栏 */}
      <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r ${gradient} bg-opacity-5`}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-orange-500">
              {icon}
            </span>
          )}
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {title}
          </h2>
        </div>
      </div>
      
      {/* 内容区 */}
      <div className={className}>
        {children}
      </div>
    </div>
  );
}

interface UtilitySectionProps {
  children: ReactNode;
  className?: string;
}

export function UtilitySection({ children, className = '' }: UtilitySectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  icon,
  className = ''
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>加载中...</span>
        </>
      ) : (
        <>
          {icon && <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ActionButton({ 
  children, 
  onClick, 
  variant = 'secondary',
  icon,
  disabled,
  className = ''
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg',
    secondary: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      {children}
    </button>
  );
}

// 统一的下拉框样式
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: ReactNode;
  showBorder?: boolean;
}

export function SelectField({ label, value, onChange, options, placeholder, icon, showBorder = true }: SelectFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {icon && <span className="inline-flex items-center mr-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-orange-500">{icon}</span>}
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:border-orange-500 transition-colors hover:border-slate-300 dark:hover:border-slate-600 ${
          showBorder ? 'border-2 border-slate-200 dark:border-slate-700' : 'border-2 border-transparent'
        }`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// 统一的文本框样式
interface TextareaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showBorder?: boolean;
}

export function TextareaField({ value, onChange, placeholder, rows = 6, className = '', showBorder = true }: TextareaFieldProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full p-4 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors resize-none hover:border-slate-300 dark:hover:border-slate-600 ${className} ${
        showBorder 
          ? 'border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500' 
          : 'border-2 border-transparent focus:outline-none focus:border-orange-500'
      }`}
    />
  );
}

// 统一的模式切换按钮组
interface ModeToggleProps {
  modes: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  color?: string;
}

export function ModeToggle({ modes, value, onChange, color = 'orange' }: ModeToggleProps) {
  const activeColor = {
    orange: 'bg-orange-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    green: 'bg-green-500 text-white',
  };
  const activeBgClass = activeColor[color as keyof typeof activeColor] || activeColor.orange;

  return (
    <div className="flex gap-2">
      {modes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            value === mode.value 
              ? activeBgClass
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

// 统一的标签样式
interface TagProps {
  children: ReactNode;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'gray';
}

export function Tag({ children, color = 'orange' }: TagProps) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  const bgClass = colorClasses[color];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgClass}`}>
      {children}
    </span>
  );
}

// 统一的成功/错误提示
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  icon?: ReactNode;
}

export function Alert({ type, children, icon }: AlertProps) {
  const typeClasses = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className={`flex items-center gap-2 p-4 rounded-xl border ${typeClasses[type]}`}>
      {icon && <span className="[&>svg]:w-5 [&>svg]:h-5 flex-shrink-0">{icon}</span>}
      <span className="text-sm">{children}</span>
    </div>
  );
}
