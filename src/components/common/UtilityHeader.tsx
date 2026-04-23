'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface UtilityHeaderProps {
  toolIcon: ReactNode;
  toolName: string;
  toolDescription?: string;
  gradient?: string;
}

export default function UtilityHeader({ 
  toolIcon, 
  toolName, 
  toolDescription,
  gradient = 'from-orange-500 to-amber-500'
}: UtilityHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLobster size={32} />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                OneClaw
              </span>
            </Link>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
          </div>
          
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
            {toolIcon}
            <div>
              <h1 className="font-bold text-sm">{toolName}</h1>
              {toolDescription && (
                <p className="text-xs text-white/80">{toolDescription}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
