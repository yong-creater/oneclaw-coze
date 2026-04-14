'use client';

import { ReactNode } from 'react';

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
  gradient = 'from-orange-500 to-red-500'
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
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
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
