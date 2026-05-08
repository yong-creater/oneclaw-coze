'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface HomeState {
  inputText: string;
  isLoading: boolean;
  result: string | null;
}

export default function HomePage() {
  const [state, setState] = useState<HomeState>({
    inputText: '',
    isLoading: false,
    result: null,
  });

  const handleGenerate = () => {
    if (!state.inputText.trim() || state.isLoading) return;
    setState((prev) => ({ ...prev, isLoading: true, result: null }));
    // 模拟 loading，不接 API
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        result: '生成结果将在这里显示',
      }));
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] py-16 px-6">
      {/* 标题区 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          AI 内容生成中心
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          输入你的需求，一键生成电商内容
        </p>
      </div>

      {/* 输入区 + 操作区 */}
      <div className="w-full max-w-2xl mb-8">
        <textarea
          value={state.inputText}
          onChange={(e) =>
            setState((prev) => ({ ...prev, inputText: e.target.value }))
          }
          placeholder="例如：生成亚马逊A+详情页 / 商品主图 / TikTok视频脚本"
          className="w-full h-36 px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors text-sm text-slate-800 dark:text-slate-200 resize-none placeholder:text-slate-400"
          disabled={state.isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={!state.inputText.trim() || state.isLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {state.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              开始生成
            </>
          )}
        </button>
      </div>

      {/* 结果区 */}
      <div className="w-full max-w-2xl">
        <div className="min-h-[200px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-center">
          {state.isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-sm">AI 正在生成内容...</span>
            </div>
          ) : state.result ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {state.result}
            </p>
          ) : (
            <p className="text-sm text-slate-400">生成结果将在这里显示</p>
          )}
        </div>
      </div>
    </div>
  );
}
