'use client';

import { BookOpen } from 'lucide-react';

export default function PromptPage() {
  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <h1 className="ui-page-title">提示库</h1>
        <p className="ui-page-desc">精选AI提示词模板</p>
      </div>

      <div className="ui-card p-6 min-h-[200px] flex flex-col items-center justify-center text-slate-400">
        <BookOpen className="w-8 h-8 mb-2" />
        <p className="text-sm">提示库开发中</p>
      </div>
    </div>
  );
}
