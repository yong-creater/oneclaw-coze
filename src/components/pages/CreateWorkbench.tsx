'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload,
  Wand2,
  Loader2,
  Download,
  RotateCcw,
  Save,
  Sparkles,
  X,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';

// ===== 生成类型 =====
interface GenType {
  id: string;
  label: string;
  icon: string;
}

const GEN_TYPES: GenType[] = [
  { id: 'auto', label: '自动识别', icon: '🤖' },
  { id: 'product', label: '商品图', icon: '📦' },
  { id: 'xiaohongshu', label: '小红书', icon: '📕' },
  { id: 'aiphoto', label: 'AI写真', icon: '📸' },
  { id: 'removebg', label: '抠图', icon: '✂️' },
  { id: 'detail', label: '详情页', icon: '📋' },
];

// ===== 生成步骤 =====
const GEN_STEPS = [
  { id: 1, text: '正在理解你的需求' },
  { id: 2, text: '正在分析图片内容' },
  { id: 3, text: '正在匹配生成方式' },
  { id: 4, text: '正在生成结果' },
  { id: 5, text: '正在优化细节' },
  { id: 6, text: '即将完成' },
];

// ===== 生成结果 =====
interface GenResult {
  url: string;
  label: string;
  type: string;
}

// ===== 生成状态 =====
type GenStatus = 'idle' | 'generating' | 'success' | 'failed';

export default function CreateWorkbench() {
  const searchParams = useSearchParams();

  // ===== 从首页传入的参数 =====
  const initialPrompt = searchParams.get('prompt') || '';
  const initialType = searchParams.get('type') || 'auto';
  const initialImage = searchParams.get('image') || '';

  // ===== 状态 =====
  const [prompt, setPrompt] = useState(initialPrompt);
  const [genType, setGenType] = useState(initialType);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImage ? [initialImage] : []);
  const [status, setStatus] = useState<GenStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<GenResult[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 如果从首页带入了 prompt，自动聚焦输入框
  useEffect(() => {
    if (initialPrompt && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(initialPrompt.length, initialPrompt.length);
    }
  }, [initialPrompt]);

  // 清理步骤计时器
  useEffect(() => {
    return () => {
      stepTimerRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // ===== 图片上传 =====
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (const file of Array.from(files).slice(0, 5 - uploadedImages.length)) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(dataUrl);
    }
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 5));
    e.target.value = '';
  }, [uploadedImages.length]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ===== 开始生成 =====
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && uploadedImages.length === 0) return;

    // 清理旧计时器
    stepTimerRef.current.forEach(t => clearTimeout(t));
    stepTimerRef.current = [];

    setStatus('generating');
    setCurrentStep(0);
    setResults([]);
    setErrorMsg('');

    // 按顺序轮播步骤，每步间隔 800ms
    GEN_STEPS.forEach((_, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i + 1);
      }, (i + 1) * 800);
      stepTimerRef.current.push(timer);
    });

    // TODO: 替换为真实 API 调用
    // 当前使用模拟生成
    try {
      await new Promise<void>((resolve, reject) => {
        const totalTimer = setTimeout(resolve, 5500);
        stepTimerRef.current.push(totalTimer);
      });

      // 模拟生成结果
      const currentType = GEN_TYPES.find(t => t.id === genType) || GEN_TYPES[0];
      const mockResults: GenResult[] = [
        { url: '/case-lipstick-main.png', label: '生成结果 1', type: currentType.label },
        { url: '/demo-card-lifestyle.jpg', label: '生成结果 2', type: currentType.label },
      ];

      setResults(mockResults);
      setStatus('success');
    } catch {
      setStatus('failed');
      setErrorMsg('生成失败，请稍后重试');
    }
  }, [prompt, uploadedImages, genType]);

  // ===== 下载图片 =====
  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }, []);

  // ===== 当前生成类型 =====
  const currentGenType = GEN_TYPES.find(t => t.id === genType) || GEN_TYPES[0];

  // ===== 计算进度百分比 =====
  const progressPercent = status === 'generating'
    ? Math.min(100, Math.round((currentStep / GEN_STEPS.length) * 100))
    : status === 'success' ? 100 : 0;

  return (
    <div className="os-page">
      <div className="page-container">

        {/* ===== 顶部：生成类型标识 ===== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-800">生成工作台</h1>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-purple-300 transition-colors text-sm"
              >
                <span>{currentGenType.icon}</span>
                <span className="text-slate-600 font-medium">{currentGenType.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 min-w-[140px]">
                  {GEN_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setGenType(type.id); setShowTypeDropdown(false); }}
                      className={`flex items-center gap-2 w-full px-3.5 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${genType === type.id ? 'text-purple-600 bg-purple-50/50' : 'text-slate-600'}`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== 主体：左右分栏 ===== */}
        <div className="os-wb-layout">

          {/* ====== 左侧：输入面板 ====== */}
          <div className="os-wb-left">

            {/* 上传图片预览 */}
            {uploadedImages.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-slate-400 font-medium mb-2">已上传图片</div>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                      <img src={img} alt={`上传图 ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 需求输入框 */}
            <div className="mb-4">
              <div className="text-xs text-slate-400 font-medium mb-2">你的需求</div>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value.slice(0, 500))}
                placeholder="描述你想生成的内容，例如：生成高级电商商品主图和场景图"
                className="os-wb-textarea"
                rows={5}
              />
              <div className="text-right text-[11px] text-slate-300 mt-1">{prompt.length} / 500</div>
            </div>

            {/* 上传图片按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="os-wb-upload-btn mb-5"
            >
              <Upload className="w-4 h-4" />
              <span>上传参考图片</span>
              <span className="text-[11px] text-slate-300 ml-1">(JPG / PNG，最多5张)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={status === 'generating' || (!prompt.trim() && uploadedImages.length === 0)}
                className="os-wb-gen-btn flex-1"
              >
                {status === 'generating' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>生成中…</span></>
                ) : (
                  <><Wand2 className="w-4 h-4" /><span>开始生成</span></>
                )}
              </button>
              {results.length > 0 && status !== 'generating' && (
                <button
                  onClick={handleGenerate}
                  disabled={false}
                  className="os-wb-secondary-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重新生成</span>
                </button>
              )}
            </div>
          </div>

          {/* ====== 右侧：结果面板 ====== */}
          <div className="os-wb-right">

            {/* ===== 生成中状态 ===== */}
            {status === 'generating' && (
              <div className="os-wb-generating">
                {/* 标题 + 当前步骤 */}
                <div className="os-wb-gen-header">
                  <div className="os-wb-gen-icon-wrap">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="os-wb-gen-title-area">
                    <h3 className="text-base font-semibold text-slate-800">AI 正在生成</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{GEN_STEPS[currentStep - 1]?.text || GEN_STEPS[0].text}</p>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="os-wb-progress-track">
                  <div
                    className="os-wb-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 步骤列表 */}
                <div className="os-wb-step-list">
                  {GEN_STEPS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep > stepNum;
                    const isCurrent = currentStep === stepNum;
                    return (
                      <div
                        key={step.id}
                        className={`os-wb-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className={`os-wb-step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                        </div>
                        <span className={`os-wb-step-text ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          {step.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Skeleton 占位 */}
                <div className="os-wb-skeleton-area">
                  <div className="os-wb-skeleton" style={{ height: '200px' }} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="os-wb-skeleton" style={{ height: '130px' }} />
                    <div className="os-wb-skeleton" style={{ height: '130px' }} />
                  </div>
                </div>
              </div>
            )}

            {/* ===== 生成失败状态 ===== */}
            {status === 'failed' && (
              <div className="os-wb-failed">
                <div className="os-wb-failed-icon-wrap">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mt-4">生成失败</h3>
                <p className="text-sm text-slate-500 mt-1.5">{errorMsg || '生成失败，请稍后重试'}</p>
                <button
                  onClick={handleGenerate}
                  className="os-wb-retry-btn mt-6"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重新生成</span>
                </button>
              </div>
            )}

            {/* ===== 无结果默认态 ===== */}
            {status === 'idle' && results.length === 0 && (
              <div className="os-wb-empty">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-base font-medium text-slate-600 mb-1.5">等待生成</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed">
                  在左侧输入需求或上传图片，<br />点击「开始生成」查看结果
                </p>
              </div>
            )}

            {/* ===== 生成结果 ===== */}
            {status === 'success' && results.length > 0 && (
              <div className="os-wb-results">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">生成结果</span>
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{currentGenType.label}</span>
                  </div>
                  <button
                    onClick={() => {/* TODO: 保存到作品 */}}
                    className="os-wb-action-btn"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存到作品</span>
                  </button>
                </div>

                {/* 主图 */}
                {results[0] && (
                  <div className="os-wb-result-main group">
                    <img src={results[0].url} alt={results[0].label} className="w-full h-full object-cover" />
                    <div className="os-wb-result-overlay">
                      <button
                        onClick={() => handleDownload(results[0].url, `${results[0].label}.png`)}
                        className="os-wb-result-action"
                      >
                        <Download className="w-4 h-4" />
                        <span>下载</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 多图结果 */}
                {results.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {results.slice(1).map((result, idx) => (
                      <div key={idx} className="os-wb-result-thumb group">
                        <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                        <div className="os-wb-result-overlay">
                          <button
                            onClick={() => handleDownload(result.url, `${result.label}.png`)}
                            className="os-wb-result-action"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>下载</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 底部操作栏 */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {/* TODO: 继续优化 */}}
                    className="os-wb-action-btn"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>继续优化</span>
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={false}
                    className="os-wb-action-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重新生成</span>
                  </button>
                  <button
                    onClick={() => {
                      results.forEach((r, i) => {
                        setTimeout(() => handleDownload(r.url, `${r.label}.png`), i * 300);
                      });
                    }}
                    className="os-wb-action-btn ml-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载全部</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
