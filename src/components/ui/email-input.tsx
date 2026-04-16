'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// 常见邮箱后缀
const EMAIL_DOMAINS = [
  '@qq.com',
  '@163.com',
  '@126.com',
  '@gmail.com',
  '@outlook.com',
  '@hotmail.com',
  '@yahoo.com',
  '@icloud.com',
  '@sina.com',
  '@sohu.com',
  '@139.com',
  '@wo.cn',
  '@189.cn',
];

export default function EmailInput({ 
  value, 
  onChange, 
  placeholder = '请输入邮箱',
  disabled = false,
  className = ''
}: EmailInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检测是否显示建议
  const showDomainSuggestions = value.includes('@') && !value.includes(' ');

  // 获取输入的前缀和后缀
  const getParts = (): { prefix: string; suffix: string } => {
    const atIndex = value.lastIndexOf('@');
    if (atIndex === -1) {
      return { prefix: value, suffix: '' };
    }
    return {
      prefix: value.substring(0, atIndex),
      suffix: value.substring(atIndex)
    };
  };

  // 过滤匹配的域名
  const getFilteredDomains = (): string[] => {
    if (!showDomainSuggestions) return [];
    
    const { suffix } = getParts();
    const inputDomain = suffix.toLowerCase();
    
    if (inputDomain === '@') return EMAIL_DOMAINS;
    
    return EMAIL_DOMAINS.filter(domain => 
      domain.toLowerCase().startsWith(inputDomain)
    );
  };

  const filteredDomains = getFilteredDomains();

  // 选择建议
  const selectSuggestion = (domain: string) => {
    const { prefix } = getParts();
    onChange(prefix + domain);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // 键盘事件处理
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredDomains.length === 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        // Tab 或 Enter 时，自动补全第一个域名
        if (showDomainSuggestions && !value.includes('@') && value) {
          e.preventDefault();
          onChange(value + '@qq.com');
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredDomains.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDomains.length - 1
        );
        break;
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(filteredDomains[selectedIndex]);
        } else if (filteredDomains.length > 0) {
          selectSuggestion(filteredDomains[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 检测 @ 符号
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.includes('@')) {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.includes('@')) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          className="pl-10"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* 域名建议列表 */}
      {showSuggestions && filteredDomains.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          {filteredDomains.map((domain, index) => (
            <div
              key={domain}
              className={`
                px-4 py-2 cursor-pointer transition-colors
                ${index === selectedIndex 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
              onClick={() => selectSuggestion(domain)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-slate-600 dark:text-slate-300">
                {getParts().prefix}
              </span>
              <span className="text-orange-500 font-medium">
                {domain}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 底部提示 */}
      {showSuggestions && filteredDomains.length > 0 && (
        <div className="absolute -bottom-6 left-0 text-xs text-slate-400">
          ↑↓ 选择，Enter/Tab 补全，Esc 关闭
        </div>
      )}
    </div>
  );
}
