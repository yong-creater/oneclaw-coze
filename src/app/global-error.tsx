'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报错误到监控（可选）
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              出了点问题
            </h2>
            <p className="text-slate-500 mb-6">
              抱歉，页面加载时遇到了意外错误
            </p>
            
            <div className="bg-slate-100 rounded-lg p-3 mb-6 text-left">
              <p className="text-xs text-slate-400 font-mono break-all">
                {error.message || '未知错误'}
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                重试
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
