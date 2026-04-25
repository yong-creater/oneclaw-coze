'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  Copy, 
  CheckCheck,
  Zap,
  Star,
  Coins,
  RefreshCw,
  Send
} from 'lucide-react';
import { Sidebar, Header, Footer, useSidebar } from '@/components/common';
import { TOOL_CONFIGS, getEnabledTools, TOOL_CATEGORIES, formatUsageCount } from '@/config/tools';

interface ToolInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  tags: string[];
}

export default function ToolDetailPage() {
  const params = useParams();
  const toolId = params.id as string;
  const { collapsed } = useSidebar();

  // 获取工具信息
  const toolInfo = TOOL_CONFIGS.find(t => t.id === toolId) as ToolInfo | undefined;
  const enabledTools = getEnabledTools();
  const isValidTool = enabledTools.some(t => t.id === toolId);

  // 状态
  const [imageUrl, setImageUrl] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [fileName, setFileName] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // 自动滚动到结果
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // 处理图片上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // 使用 FileReader 转换为 base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 处理任务
  const handleProcess = async () => {
    if (!prompt && !imageUrl) {
      setError('请输入提示词或上传图片');
      return;
    }

    setIsProcessing(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('/api/tools/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          prompt,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('处理失败');
      }

      // 处理 SSE 流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应');
      }

      let fullResult = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                fullResult += data.content;
                setResult(fullResult);
              } else if (data.type === 'done') {
                setResult(data.content);
              } else if (data.type === 'error') {
                setError(data.error);
              }
            } catch (parseError) {
              // 忽略解析错误
            }
          }
        }
      }

    } catch (err: any) {
      setError(err.message || '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 复制结果
  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  // 重新处理
  const handleReset = useCallback(() => {
    setPrompt('');
    setImageUrl('');
    setFileName('');
    setResult('');
    setError('');
  }, []);

  // 工具不存在或已禁用
  if (!isValidTool || !toolInfo) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
          <Header title="工具不存在" />
          <div className="p-8">
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">工具不存在或已禁用</h2>
              <p className="text-slate-500 mb-8">您访问的工具不存在或已被管理员禁用</p>
              <Link 
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回工具列表
              </Link>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    );
  }

  const categoryName = TOOL_CATEGORIES[toolInfo.category as keyof typeof TOOL_CATEGORIES]?.name || toolInfo.category;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[268px]'}`}>
        <Header title={toolInfo.name} subtitle={categoryName} />
        
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* 工具信息卡片 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${toolInfo.color} flex items-center justify-center text-3xl shrink-0`}>
                  {toolInfo.icon}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-900 mb-2">{toolInfo.name}</h1>
                  <p className="text-slate-600 mb-3">{toolInfo.description}</p>
                  <div className="flex items-center gap-2">
                    {toolInfo.tags?.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 输入区域 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                输入
              </h2>

              {/* 上传方式切换 */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    uploadMethod === 'url' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  图片链接
                </button>
                <button
                  onClick={() => setUploadMethod('upload')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    uploadMethod === 'upload' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  上传图片
                </button>
              </div>

              {/* 图片输入 */}
              {uploadMethod === 'url' ? (
                <div className="mb-4">
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      placeholder="输入图片 URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {fileName ? (
                        <>
                          <CheckCheck className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm text-slate-700">{fileName}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">点击或拖拽上传图片</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* 提示词输入 */}
              <div className="mb-4">
                <textarea
                  placeholder={`输入 ${toolInfo.name} 的提示词...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || (!prompt && !imageUrl)}
                  className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      开始处理
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* 结果区域 */}
            {isProcessing && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  处理中
                </h2>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="animate-pulse">AI 正在分析...</div>
                </div>
              </div>
            )}

            {result && (
              <div ref={resultRef} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    处理结果
                  </h2>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {result}
                  </div>
                </div>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                使用说明
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">1.</span>
                  <span>上传需要处理的图片或输入图片 URL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">2.</span>
                  <span>描述您的具体需求或期望的效果</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">3.</span>
                  <span>点击「开始处理」，AI 将分析图片并给出专业建议</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">4.</span>
                  <span>处理完成后可复制结果或继续调整</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
