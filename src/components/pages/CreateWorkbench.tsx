'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload,
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
  ArrowRight,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { getToolWorkflow, slugToGenType, genTypeToSlug, type ToolWorkflowConfig, type GuideStep } from '@/lib/tool-workflow-config';

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
  textContent?: string;
}

// ===== Toast 通知 =====
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ===== 生成状态 =====
type GenStatus = 'idle' | 'guiding' | 'generating' | 'success' | 'failed';

export default function CreateWorkbench() {
  const searchParams = useSearchParams();

  // ===== 从 sessionStorage 读取首页传入的上下文 =====
  const getContext = useCallback((): { prompt: string; type: string; toolId: string; images: string[]; autoGenerate: boolean } => {
    try {
      const stored = sessionStorage.getItem('oneclaw_create_context');
      if (stored) {
        const ctx = JSON.parse(stored);
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
    } catch {}
    return {
      prompt: searchParams.get('prompt') || '',
      type: searchParams.get('type') || 'auto',
      toolId: searchParams.get('toolId') || '',
      images: [],
      autoGenerate: false,
    };
  }, [searchParams]);

  const context = useRef(getContext()).current;
  const initialPrompt = context.prompt;
  const initialType = context.type;
  const shouldAutoGenerate = context.autoGenerate;

  // ===== 当前工具配置 =====
  const resolvedSlug = genTypeToSlug(slugToGenType(initialType));
  const [currentSlug, setCurrentSlug] = useState(resolvedSlug || 'product-generator');
  const toolConfig = getToolWorkflow(currentSlug);

  // ===== 状态 =====
  const [prompt, setPrompt] = useState(initialPrompt);
  const [uploadedImages, setUploadedImages] = useState<string[]>(context.images);
  const [status, setStatus] = useState<GenStatus>(shouldAutoGenerate ? 'generating' : 'idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<GenResult[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [guideAnswers, setGuideAnswers] = useState<Record<string, string>>({});

  // 结果交互状态
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const toastIdRef = useRef(0);
  const autoGenTriggered = useRef(false);

  // ===== Toast 工具 =====
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

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
    const maxFiles = toolConfig?.steps.find(s => s.type === 'upload')?.maxFiles || 5;
    const newImages: string[] = [];
    for (const file of Array.from(files).slice(0, maxFiles - uploadedImages.length)) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(dataUrl);
    }
    setUploadedImages(prev => [...prev, ...newImages].slice(0, maxFiles));
    e.target.value = '';
  }, [uploadedImages.length, toolConfig]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ===== 引导步骤选择 =====
  const handleGuideSelect = useCallback((stepId: string, value: string) => {
    setGuideAnswers(prev => ({ ...prev, [stepId]: value }));
  }, []);

  // ===== 判断引导是否完成 =====
  const isGuideComplete = useCallback((): boolean => {
    if (!toolConfig) return !!prompt.trim() || uploadedImages.length > 0;
    const requiredSteps = toolConfig.steps.filter(s => !s.optional);
    return requiredSteps.every(step => {
      if (step.type === 'upload') return uploadedImages.length > 0;
      if (step.type === 'select') return !!guideAnswers[step.id];
      if (step.type === 'input') return !!prompt.trim();
      return true;
    });
  }, [toolConfig, uploadedImages, guideAnswers, prompt]);

  // ===== 开始生成 =====
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && uploadedImages.length === 0 && Object.keys(guideAnswers).length === 0) return;

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

    try {
      await new Promise<void>((resolve) => {
        const totalTimer = setTimeout(resolve, 5500);
        stepTimerRef.current.push(totalTimer);
      });

      const toolLabel = toolConfig?.name || 'AI';
      const mockResults: GenResult[] = [
        { url: '/case-lipstick-main.png', label: `${toolLabel}结果 1`, type: 'image' },
        { url: '/demo-card-lifestyle.jpg', label: `${toolLabel}结果 2`, type: 'image' },
        { url: '/demo-scene.jpg', label: `${toolLabel}结果 3`, type: 'image' },
        { url: '/case-ecommerce.jpg', label: `${toolLabel}结果 4`, type: 'image' },
      ];

      setResults(mockResults);
      setStatus('success');
    } catch {
      setStatus('failed');
      setErrorMsg('生成失败，请稍后重试');
    }
  }, [prompt, uploadedImages, guideAnswers, toolConfig]);

  // ===== 自动生成 =====
  useEffect(() => {
    if (shouldAutoGenerate && !autoGenTriggered.current && (initialPrompt.trim() || context.images.length > 0)) {
      autoGenTriggered.current = true;
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

  const handleDownloadAll = useCallback(() => {
    const imageResults = results.filter(r => r.type === 'image');
    imageResults.forEach((r, i) => {
      setTimeout(() => handleDownload(r.url, `${r.label}.png`), i * 400);
    });
  }, [results, handleDownload]);

  const handleSaveToProjects = useCallback(() => {
    showToast('已保存到作品');
  }, [showToast]);

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  const handleSetAsCover = useCallback((index: number) => {
    setActiveIndex(index);
    showToast('已设为封面');
  }, [showToast]);

  const handleContinueOptimize = useCallback(() => {
    const activeResult = results[activeIndex];
    if (activeResult) {
      setPrompt(prev => `${prev}\n\n请在此基础上继续优化：${activeResult.label}`);
      setStatus('idle');
      setResults([]);
    }
  }, [results, activeIndex]);

  // ===== 切换工具 =====
  const handleToolChange = useCallback((slug: string) => {
    setCurrentSlug(slug);
    setShowTypeDropdown(false);
    // 切换工具时不自动生成，保留已上传图片和输入
    if (status === 'generating') return;
  }, [status]);

  // ===== 计算进度 =====
  const progressPercent = status === 'generating'
    ? Math.min(100, Math.round((currentStep / GEN_STEPS.length) * 100))
    : status === 'success' ? 100 : 0;

  const activeResult = results[activeIndex] || null;
  const hasImageResults = results.some(r => r.type === 'image');
  const hasTextResults = results.some(r => r.type === 'text');
  const imageResults = results.filter(r => r.type === 'image');
  const textResults = results.filter(r => r.type === 'text');

  // ===== 全部工具列表（用于切换下拉） =====
  const allTools = getAllToolWorkflowsSimple();

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

        {/* ===== 顶部：已选择工具 + 切换 ===== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="os-aw-tool-badge">
                <span className="text-base">{toolConfig?.icon || '🤖'}</span>
              </div>
              <div>
                <div className="text-xs text-slate-400">已选择</div>
                <div className="text-sm font-semibold text-slate-800">{toolConfig?.name || 'AI 创作工具'}</div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-purple-300 transition-colors text-xs text-slate-400"
              >
                <span>切换</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 min-w-[180px]">
                  {allTools.map(t => (
                    <button
                      key={t.slug}
                      onClick={() => handleToolChange(t.slug)}
                      className={`flex items-center gap-2 w-full px-3.5 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${currentSlug === t.slug ? 'text-purple-600 bg-purple-50/50' : 'text-slate-600'}`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== 主体：左右分栏 ===== */}
        <div className="os-wb-layout">

          {/* ====== 左侧：AI 引导式输入 ====== */}
          <div className="os-wb-left">

            {/* AI 问候语 */}
            <div className="os-aw-greeting">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{toolConfig?.greeting || '告诉我你想生成什么？'}</span>
            </div>

            {/* 动态引导步骤 */}
            {toolConfig && toolConfig.steps.map((step) => (
              <div key={step.id} className="os-aw-step">
                {/* 步骤标签 */}
                <div className="os-aw-step-label">
                  {step.optional && <span className="os-aw-step-optional">可选</span>}
                  {step.label}
                </div>

                {/* 上传类步骤 */}
                {step.type === 'upload' && (
                  <div>
                    {uploadedImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-100">
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
                    ) : null}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="os-aw-upload-area"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                      <span className="text-sm text-slate-400">
                        {step.placeholder || '点击上传或拖拽图片'}
                      </span>
                      <span className="text-[11px] text-slate-300">
                        JPG / PNG，最多{step.maxFiles || 5}张
                      </span>
                    </button>
                  </div>
                )}

                {/* 选择类步骤 */}
                {step.type === 'select' && step.options && (
                  <div className="os-aw-options">
                    {step.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleGuideSelect(step.id, opt.value)}
                        className={`os-aw-option ${guideAnswers[step.id] === opt.value ? 'active' : ''}`}
                      >
                        {opt.icon && <span className="text-sm">{opt.icon}</span>}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 输入类步骤 */}
                {step.type === 'input' && (
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value.slice(0, 500))}
                    placeholder={step.placeholder || '请输入…'}
                    className="os-wb-textarea"
                    rows={3}
                  />
                )}
              </div>
            ))}

            {/* 无工具配置时 fallback 到原始输入 */}
            {!toolConfig && (
              <div className="os-aw-step">
                <div className="os-aw-step-label">你的需求</div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, 500))}
                  placeholder="描述你想生成的内容，例如：生成高级电商商品主图和场景图"
                  className="os-wb-textarea"
                  rows={5}
                />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 开始生成按钮 */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleGenerate}
                disabled={status === 'generating' || !isGuideComplete()}
                className="os-wb-gen-btn w-full"
              >
                {status === 'generating' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>生成中…</span></>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>开始生成</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
              {results.length > 0 && status !== 'generating' && (
                <button
                  onClick={handleGenerate}
                  className="os-wb-secondary-btn w-full mt-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重新生成</span>
                </button>
              )}
            </div>
          </div>

          {/* ====== 右侧：结果 / 案例 ====== */}
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

            {/* ===== 空状态：展示工具案例 ===== */}
            {status === 'idle' && results.length === 0 && (
              <div className="os-aw-cases">
                <div className="os-aw-cases-header">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{toolConfig?.name || 'AI'}创作案例</span>
                </div>
                <div className="os-aw-cases-grid">
                  {(toolConfig?.cases || FALLBACK_CASES).map((c, idx) => (
                    <div key={idx} className="os-aw-case-card">
                      <div className="os-aw-case-img">
                        {c.image ? (
                          <img src={c.image} alt={c.title} />
                        ) : (
                          <div className="os-aw-case-img-fallback">
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="os-aw-case-info">
                        <div className="os-aw-case-title">{c.title}</div>
                        <div className="os-aw-case-desc">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="os-aw-cases-hint">
                  完成左侧创作引导后，AI 将自动为你生成
                </div>
              </div>
            )}

            {/* ===== 图片结果展示 ===== */}
            {status === 'success' && hasImageResults && (
              <div className="os-wb-results">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">生成结果</span>
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{toolConfig?.name || 'AI'}</span>
                    <span className="text-[11px] text-slate-400">{imageResults.length} 张</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveToProjects} className="os-wb-action-btn">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>保存到作品</span>
                    </button>
                  </div>
                </div>

                {activeResult && activeResult.type === 'image' && (
                  <div className="os-wb-preview-main group">
                    <img src={activeResult.url} alt={activeResult.label} className="os-wb-preview-img" />
                    <div className="os-wb-preview-overlay">
                      <div className="os-wb-preview-actions">
                        <button onClick={() => setShowLightbox(true)} className="os-wb-preview-action" title="放大查看">
                          <ZoomIn className="w-4 h-4" /><span>放大</span>
                        </button>
                        <button onClick={() => handleDownload(activeResult.url, `${activeResult.label}.png`)} className="os-wb-preview-action" title="下载图片">
                          <Download className="w-4 h-4" /><span>下载</span>
                        </button>
                        <button onClick={() => handleSetAsCover(activeIndex)} className="os-wb-preview-action" title="设为封面">
                          <Check className="w-4 h-4" /><span>设为封面</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {imageResults.length > 1 && (
                  <div className="os-wb-thumb-row">
                    {imageResults.map((result, idx) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button key={idx} onClick={() => setActiveIndex(globalIdx)} className={`os-wb-thumb-item ${activeIndex === globalIdx ? 'active' : ''}`}>
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

                <div className="os-wb-bottom-bar">
                  <div className="flex items-center gap-2">
                    <button onClick={handleContinueOptimize} className="os-wb-action-btn">
                      <Sparkles className="w-3.5 h-3.5" /><span>继续优化</span>
                    </button>
                    <button onClick={handleGenerate} className="os-wb-action-btn">
                      <RefreshCw className="w-3.5 h-3.5" /><span>重新生成</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadAll} className="os-wb-action-btn">
                      <Download className="w-3.5 h-3.5" /><span>下载全部</span>
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
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{toolConfig?.name || 'AI'}</span>
                  </div>
                  <button onClick={handleSaveToProjects} className="os-wb-action-btn">
                    <FolderOpen className="w-3.5 h-3.5" /><span>保存到作品</span>
                  </button>
                </div>

                {textResults.map((result, idx) => (
                  <div key={idx} className="os-wb-text-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-medium">{result.label}</span>
                      <button onClick={() => handleCopyText(result.textContent || '')} className="os-wb-action-btn text-xs">
                        <Copy className="w-3 h-3" /><span>复制</span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {result.textContent || '暂无文本内容'}
                    </p>
                  </div>
                ))}

                {hasImageResults && (
                  <div className="mt-4">
                    <div className="text-xs text-slate-400 font-medium mb-2">图片结果</div>
                    <div className="grid grid-cols-3 gap-2">
                      {imageResults.map((result, idx) => (
                        <button key={idx} onClick={() => { setActiveIndex(idx); setShowLightbox(true); }} className="os-wb-thumb-item-sm">
                          <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="os-wb-bottom-bar">
                  <div className="flex items-center gap-2">
                    <button onClick={handleContinueOptimize} className="os-wb-action-btn">
                      <Sparkles className="w-3.5 h-3.5" /><span>继续优化</span>
                    </button>
                    <button onClick={handleGenerate} className="os-wb-action-btn">
                      <RefreshCw className="w-3.5 h-3.5" /><span>重新生成</span>
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
            <button onClick={() => setShowLightbox(false)} className="os-wb-lightbox-close">
              <X className="w-5 h-5" />
            </button>
            <img src={activeResult.url} alt={activeResult.label} className="os-wb-lightbox-img" />
            <div className="os-wb-lightbox-actions">
              <button onClick={() => handleDownload(activeResult.url, `${activeResult.label}.png`)} className="os-wb-lightbox-btn">
                <Download className="w-4 h-4" /><span>下载 PNG</span>
              </button>
              <button onClick={() => { handleSetAsCover(activeIndex); setShowLightbox(false); }} className="os-wb-lightbox-btn">
                <Check className="w-4 h-4" /><span>设为封面</span>
              </button>
              <button onClick={() => { handleSaveToProjects(); setShowLightbox(false); }} className="os-wb-lightbox-btn">
                <FolderOpen className="w-4 h-4" /><span>保存到作品</span>
              </button>
            </div>
            {imageResults.length > 1 && (
              <div className="os-wb-lightbox-thumbs">
                {imageResults.map((r, idx) => {
                  const globalIdx = results.indexOf(r);
                  return (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveIndex(globalIdx); }} className={`os-wb-lightbox-thumb ${activeIndex === globalIdx ? 'active' : ''}`}>
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

// ===== 简单工具列表（切换下拉用） =====
function getAllToolWorkflowsSimple() {
  return [
    { slug: 'product-generator', name: 'AI商品图', icon: '📦' },
    { slug: 'xiaohongshu-generator', name: '小红书爆款', icon: '📕' },
    { slug: 'ai-photo', name: 'AI写真', icon: '📸' },
    { slug: 'background-removal', name: '智能抠图', icon: '✂️' },
    { slug: 'product-page', name: '商品详情页', icon: '📋' },
    { slug: 'novel', name: '小说创作', icon: '📖' },
    { slug: 'resume-optimizer', name: '简历优化', icon: '📝' },
  ];
}

// ===== 兜底案例 =====
const FALLBACK_CASES = [
  { image: '/case-lipstick-main.png', title: '商品图案例', desc: '高级感电商主图' },
  { image: '/demo-card-lifestyle.jpg', title: '封面案例', desc: '氛围感内容封面' },
  { image: '/demo-scene.jpg', title: '场景图案例', desc: '生活化场景展示' },
];
