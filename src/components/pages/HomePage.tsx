'use client';

import { useState, useEffect } from 'react';
import { useMenu } from '@/components/common/MenuProvider';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 消费模板/项目传入的 pendingInput
  useEffect(() => {
    const text = consumePendingInput();
    if (text) {
      setInputText(text);
    }
  }, [consumePendingInput]);

  const handleGenerate = () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    // 模拟生成（不接API）
    setTimeout(() => {
      setResult(`已收到需求：「${inputText}」\n生成结果将在这里显示`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="ui-page">
      {/* 标题区 */}
      <div className="ui-page-header">
        <h1 className="ui-page-title">AI 内容生成中心</h1>
        <p className="ui-page-desc">输入你的需求，一键生成电商内容</p>
      </div>

      {/* 输入区 */}
      <div className="space-y-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例如：生成亚马逊A+详情页 / 商品主图 / TikTok视频脚本"
          rows={4}
          className="ui-input resize-none"
        />

        {/* 操作区 */}
        <button
          onClick={handleGenerate}
          disabled={!inputText.trim() || isLoading}
          className="ui-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
      <div className="ui-card p-6 min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>正在生成...</span>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Sparkles className="w-4 h-4 text-brand" />
              生成结果
            </div>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
            <button className="ui-btn-secondary">
              <ArrowRight className="w-4 h-4" />
              继续优化
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            生成结果将在这里显示
          </div>
        )}
      </div>
    </div>
  );
}
