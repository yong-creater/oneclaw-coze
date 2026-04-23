'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UtilityCardProps {
  children: ReactNode;
  className?: string;
}

export function UtilityCard({ children, className = '' }: UtilityCardProps) {
  return (
    <Card className={`bg-white dark:bg-slate-800 ${className}`}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export function PrimaryButton({ children, loading, disabled, className = '', icon, ...props }: PrimaryButtonProps) {
  return (
    <Button 
      className={`bg-orange-500 hover:bg-orange-600 text-white ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        '加载中...'
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
}

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export function ActionButton({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  
  return (
    <Button 
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SelectField({ label, children, required }: FormFieldProps) {
  return <FormField label={label} required={required}>{children}</FormField>;
}

export function TextareaField({ label, children, required }: FormFieldProps) {
  return <FormField label={label} required={required}>{children}</FormField>;
}

export { default as ModeToggle } from './ModeToggle';

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning';
}

export function Tag({ children, variant = 'default' }: TagProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    secondary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

interface AlertProps {
  children: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function Alert({ children, type = 'info' }: AlertProps) {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
    success: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
    error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  };
  
  return (
    <div className={`p-3 rounded-lg border ${typeClasses[type]}`}>
      {children}
    </div>
  );
}
