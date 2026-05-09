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
  ZoomIn,
  Copy,
  FolderOpen,
  RefreshCw,
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
  type: string; // 'image' | 'text'
  textContent?: string;
}

// ===== Toast 通知 =====
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ===== 生成状态 =====
type GenStatus = 'idle' | 'generating' | 'success' | 'failed';

export default function CreateWorkbench() {
  const searchParams = useSearchParams();

  // ===== 从 sessionStorage 读取首页传入的上下文 =====
  const getContext = useCallback((): { prompt: string; type: string; toolId: string; images: string[]; autoGenerate: boolean } => {
    try {
      const stored = sessionStorage.getItem('oneclaw_create_context');
      if (stored) {
        const ctx = JSON.parse(stored);
        // 读取后标记为已消费（防止刷新重复自动生成）
        if (ctx.autoGenerate) {
          ctx.autoGenerate = false;
          try { sessionStorage.setItem('oneclaw_create_context', JSON.stringify(ctx)); } catch {}
        } else {
          sessionStorage.removeItem('oneclaw_create_context');
        }
        return {
          prompt: ctx.prompt || '',
          type: ctx.type || 'auto',
          toolId: ctx.matchedTool || '',
          images: Array.isArray(ctx.uploadedImages) ? ctx.uploadedImages : [],
          autoGenerate: !!ctx.autoGenerate,
        };
      }
    } catch {
      // sessionStorage 不可用时降级为 URL 参数
    }
    // 降级：从 URL 参数读取
    return {
      prompt: searchParams.get('prompt') || '',
      type: searchParams.get('type') || 'auto',
      toolId: searchParams.get('toolId') || '',
      images: [],
      autoGenerate: false,
    };
  }, [searchParams]);

  const context = useRef(getContext()).current;

  // ===== 从首页/工具库传入的参数 =====
  const initialPrompt = context.prompt;
  const initialType = context.type;
  const toolId = context.toolId;
  const shouldAutoGenerate = context.autoGenerate;

  // slug → genType 映射
  const slugToGenType = (slug: string): string => {
    const map: Record<string, string> = {
      'product-generator': 'product',
      'xiaohongshu-generator': 'xiaohongshu',
      'ai-photo': 'aiphoto',
      'background-removal': 'removebg',
      'product-page': 'detail',
      'productpage': 'detail',
      'product-poster': 'product',
      'novel': 'novel',
    };
    return map[slug] || slug;
  };

  // ===== 状态 =====
  const [prompt, setPrompt] = useState(initialPrompt);
  const [genType, setGenType] = useState(slugToGenType(initialType));
  const [uploadedImages, setUploadedImages] = useState<string[]>(context.images);
  const [status, setStatus] = useState<GenStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<GenResult[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 结果交互状态
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const toastIdRef = useRef(0);

  // ===== Toast 工具 =====
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

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

    stepTimerRef.current.forEach(t => clearTimeout(t));
    stepTimerRef.current = [];

    setStatus('generating');
    setCurrentStep(0);
    setResults([]);
    setErrorMsg('');
    setActiveIndex(0);
    setShowLightbox(false);

    GEN_STEPS.forEach((_, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i + 1);
      }, (i + 1) * 800);
      stepTimerRef.current.push(timer);
    });

    // TODO: 替换为真实 API 调用
    try {
      await new Promise<void>((resolve) => {
        const totalTimer = setTimeout(resolve, 5500);
        stepTimerRef.current.push(totalTimer);
      });

      const currentType = GEN_TYPES.find(t => t.id === genType) || GEN_TYPES[0];
      const mockResults: GenResult[] = [
        { url: '/case-lipstick-main.png', label: '生成结果 1', type: 'image' },
        { url: '/demo-card-lifestyle.jpg', label: '生成结果 2', type: 'image' },
        { url: '/demo-scene.jpg', label: '生成结果 3', type: 'image' },
        { url: '/case-ecommerce.jpg', label: '生成结果 4', type: 'image' },
      ];

      setResults(mockResults);
      setStatus('success');
    } catch {
      setStatus('failed');
      setErrorMsg('生成失败，请稍后重试');
    }
  }, [prompt, uploadedImages, genType]);

  // ===== 自动生成（从首页 AI 分析完成后跳转过来时触发） =====
  const autoGenTriggered = useRef(false);
  useEffect(() => {
    if (shouldAutoGenerate && !autoGenTriggered.current && (initialPrompt.trim() || context.images.length > 0)) {
      autoGenTriggered.current = true;
      // 延迟触发，确保组件状态已稳定
      const timer = setTimeout(() => {
        handleGenerate();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoGenerate, initialPrompt, context.images.length, handleGenerate]);

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
      showToast('下载成功');
    } catch {
      showToast('下载失败，请重试', 'error');
    }
  }, [showToast]);

  // ===== 下载全部 =====
  const handleDownloadAll = useCallback(() => {
    const imageResults = results.filter(r => r.type === 'image');
    imageResults.forEach((r, i) => {
      setTimeout(() => handleDownload(r.url, `${r.label}.png`), i * 400);
    });
  }, [results, handleDownload]);

  // ===== 保存到作品 =====
  const handleSaveToProjects = useCallback(() => {
    // TODO: 调用保存 API
    showToast('已保存到作品');
  }, [showToast]);

  // ===== 复制文本 =====
  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  // ===== 设为封面 =====
  const handleSetAsCover = useCallback((index: number) => {
    setActiveIndex(index);
    showToast('已设为封面');
  }, [showToast]);

  // ===== 继续优化 =====
  const handleContinueOptimize = useCallback(() => {
    const activeResult = results[activeIndex];
    if (activeResult) {
      setPrompt(prev => `${prev}\n\n请在此基础上继续优化：${activeResult.label}`);
      setStatus('idle');
      setResults([]);
      textareaRef.current?.focus();
    }
  }, [results, activeIndex]);

  // ===== 当前生成类型 =====
  const currentGenType = GEN_TYPES.find(t => t.id === genType) || GEN_TYPES[0];

  // ===== 当前选中结果 =====
  const activeResult = results[activeIndex] || null;
  const hasImageResults = results.some(r => r.type === 'image');
  const hasTextResults = results.some(r => r.type === 'text');
  const imageResults = results.filter(r => r.type === 'image');
  const textResults = results.filter(r => r.type === 'text');

  // ===== 计算进度百分比 =====
  const progressPercent = status === 'generating'
    ? Math.min(100, Math.round((currentStep / GEN_STEPS.length) * 100))
    : status === 'success' ? 100 : 0;

  return (
    <div className="os-page">
      <div className="page-container">

        {/* ===== Toast 通知 ===== */}
        {toasts.length > 0 && (
          <div className="os-wb-toast-container">
            {toasts.map(t => (
              <div key={t.id} className={`os-wb-toast os-wb-toast-${t.type}`}>
                {t.type === 'success' && <Check className="w-4 h-4 text-emerald-500" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                {t.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400" />}
                <span>{t.message}</span>
              </div>
            ))}
          </div>
        )}

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
                <div className="os-wb-gen-header">
                  <div className="os-wb-gen-icon-wrap">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="os-wb-gen-title-area">
                    <h3 className="text-base font-semibold text-slate-800">AI 正在生成</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{GEN_STEPS[currentStep - 1]?.text || GEN_STEPS[0].text}</p>
                  </div>
                </div>
                <div className="os-wb-progress-track">
                  <div className="os-wb-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="os-wb-step-list">
                  {GEN_STEPS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep > stepNum;
                    const isCurrent = currentStep === stepNum;
                    return (
                      <div key={step.id} className={`os-wb-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
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
                <button onClick={handleGenerate} className="os-wb-retry-btn mt-6">
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

            {/* ===== 图片结果展示 ===== */}
            {status === 'success' && hasImageResults && (
              <div className="os-wb-results">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">生成结果</span>
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{currentGenType.label}</span>
                    <span className="text-[11px] text-slate-400">{imageResults.length} 张</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveToProjects} className="os-wb-action-btn">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>保存到作品</span>
                    </button>
                  </div>
                </div>

                {/* 大图预览区 */}
                {activeResult && activeResult.type === 'image' && (
                  <div className="os-wb-preview-main group">
                    <img
                      src={activeResult.url}
                      alt={activeResult.label}
                      className="os-wb-preview-img"
                    />
                    {/* 图片操作浮层 */}
                    <div className="os-wb-preview-overlay">
                      <div className="os-wb-preview-actions">
                        <button
                          onClick={() => setShowLightbox(true)}
                          className="os-wb-preview-action"
                          title="放大查看"
                        >
                          <ZoomIn className="w-4 h-4" />
                          <span>放大</span>
                        </button>
                        <button
                          onClick={() => handleDownload(activeResult.url, `${activeResult.label}.png`)}
                          className="os-wb-preview-action"
                          title="下载图片"
                        >
                          <Download className="w-4 h-4" />
                          <span>下载</span>
                        </button>
                        <button
                          onClick={() => handleSetAsCover(activeIndex)}
                          className="os-wb-preview-action"
                          title="设为封面"
                        >
                          <Check className="w-4 h-4" />
                          <span>设为封面</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 多图缩略图行 */}
                {imageResults.length > 1 && (
                  <div className="os-wb-thumb-row">
                    {imageResults.map((result, idx) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(globalIdx)}
                          className={`os-wb-thumb-item ${activeIndex === globalIdx ? 'active' : ''}`}
                        >
                          <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                          {activeIndex === globalIdx && (
                            <div className="os-wb-thumb-active-indicator">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 底部操作栏 */}
                <div className="os-wb-bottom-bar">
                  <div className="flex items-center gap-2">
                    <button onClick={handleContinueOptimize} className="os-wb-action-btn">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>继续优化</span>
                    </button>
                    <button onClick={handleGenerate} className="os-wb-action-btn">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>重新生成</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadAll} className="os-wb-action-btn">
                      <Download className="w-3.5 h-3.5" />
                      <span>下载全部</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== 文本结果展示 ===== */}
            {status === 'success' && hasTextResults && (
              <div className="os-wb-results">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">生成结果</span>
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{currentGenType.label}</span>
                  </div>
                  <button onClick={handleSaveToProjects} className="os-wb-action-btn">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>保存到作品</span>
                  </button>
                </div>

                {textResults.map((result, idx) => (
                  <div key={idx} className="os-wb-text-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-medium">{result.label}</span>
                      <button
                        onClick={() => handleCopyText(result.textContent || '')}
                        className="os-wb-action-btn text-xs"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {result.textContent || '暂无文本内容'}
                    </p>
                  </div>
                ))}

                {/* 如果同时有图片结果，展示图片缩略图 */}
                {hasImageResults && (
                  <div className="mt-4">
                    <div className="text-xs text-slate-400 font-medium mb-2">图片结果</div>
                    <div className="grid grid-cols-3 gap-2">
                      {imageResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setActiveIndex(idx); setShowLightbox(true); }}
                          className="os-wb-thumb-item-sm"
                        >
                          <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="os-wb-bottom-bar">
                  <div className="flex items-center gap-2">
                    <button onClick={handleContinueOptimize} className="os-wb-action-btn">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>继续优化</span>
                    </button>
                    <button onClick={handleGenerate} className="os-wb-action-btn">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>重新生成</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ===== Lightbox 放大查看 ===== */}
      {showLightbox && activeResult && activeResult.type === 'image' && (
        <div className="os-wb-lightbox" onClick={() => setShowLightbox(false)}>
          <div className="os-wb-lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLightbox(false)}
              className="os-wb-lightbox-close"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeResult.url}
              alt={activeResult.label}
              className="os-wb-lightbox-img"
            />
            <div className="os-wb-lightbox-actions">
              <button
                onClick={() => handleDownload(activeResult.url, `${activeResult.label}.png`)}
                className="os-wb-lightbox-btn"
              >
                <Download className="w-4 h-4" />
                <span>下载 PNG</span>
              </button>
              <button
                onClick={() => { handleSetAsCover(activeIndex); setShowLightbox(false); }}
                className="os-wb-lightbox-btn"
              >
                <Check className="w-4 h-4" />
                <span>设为封面</span>
              </button>
              <button
                onClick={() => { handleSaveToProjects(); setShowLightbox(false); }}
                className="os-wb-lightbox-btn"
              >
                <FolderOpen className="w-4 h-4" />
                <span>保存到作品</span>
              </button>
            </div>
            {/* 缩略图切换 */}
            {imageResults.length > 1 && (
              <div className="os-wb-lightbox-thumbs">
                {imageResults.map((r, idx) => {
                  const globalIdx = results.indexOf(r);
                  return (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveIndex(globalIdx); }}
                      className={`os-wb-lightbox-thumb ${activeIndex === globalIdx ? 'active' : ''}`}
                    >
                      <img src={r.url} alt={r.label} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
