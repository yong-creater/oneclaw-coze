'use client';

import { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ========== UtilityCard ========== */

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
  gradient = 'from-[#7B61FF] to-[#5B8CFF]'
}: UtilityCardProps) {
  return (
    <div className="bg-[#171717] rounded-2xl shadow-sm border border-white/[0.06] overflow-hidden">
      <div className={`px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r ${gradient} bg-opacity-5`}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-[#a78bfa]">
              {icon}
            </span>
          )}
          <h2 className="font-semibold text-white/90">
            {title}
          </h2>
        </div>
      </div>
      <div className={className}>
        {children}
      </div>
    </div>
  );
}

/* ========== UtilitySection ========== */

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

/* ========== FormField ========== */

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-white/30">{hint}</p>
      )}
    </div>
  );
}

/* ========== PrimaryButton ========== */

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
      className={`os-btn-primary ${className}`}
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

/* ========== ActionButton ========== */

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
    primary: 'os-btn-primary',
    secondary: 'os-btn-secondary',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-xl transition-all',
    ghost: 'os-btn-ghost',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      {children}
    </button>
  );
}

/* ========== SelectField ========== */

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
        <label className="block text-sm font-medium text-white/60 mb-1.5">
          {icon && <span className="inline-flex items-center mr-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-[#a78bfa]">{icon}</span>}
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full bg-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#7B61FF] transition-colors hover:border-white/20 ${
          showBorder ? 'border-2 border-white/[0.08]' : 'border-2 border-transparent'
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

/* ========== TextareaField ========== */

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
      className={`w-full p-4 rounded-xl bg-[#1a1a1a] text-white/90 placeholder:text-white/25 transition-colors resize-none hover:border-white/20 ${className} ${
        showBorder 
          ? 'border-2 border-white/[0.08] focus:outline-none focus:border-[#7B61FF]' 
          : 'border-2 border-transparent focus:outline-none focus:border-[#7B61FF]'
      }`}
    />
  );
}
