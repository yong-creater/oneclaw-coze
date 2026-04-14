'use client';

import { ArrowLeft } from 'lucide-react';
import LoginButton from './LoginButton';
import { ReactNode } from 'react';

interface UtilityHeaderProps {
  toolIcon: ReactNode;
  toolName: string;
  toolDescription?: string;
  gradient: string;
  onBack?: () => void;
}

export default function UtilityHeader({
  toolIcon,
  toolName,
  toolDescription,
  gradient,
  onBack
}: UtilityHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.close();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左侧：Logo + 工具信息 */}
        <div className="flex items-center gap-4">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-600 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">返回</span>
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          
          {/* OneClaw Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">🦞</span>
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white hidden sm:inline">OneClaw</span>
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          
          {/* 工具图标 + 名称 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
              {typeof toolIcon === 'string' ? (
                <span className="text-white font-bold text-sm">{toolIcon}</span>
              ) : (
                <span className="text-white [&>svg]:w-4 [&>svg]:h-4">{toolIcon}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">{toolName}</span>
              {toolDescription && (
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">{toolDescription}</span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：登录按钮 */}
        <LoginButton />
      </div>
    </div>
  );
}
