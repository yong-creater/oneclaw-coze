'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Upload, Image as ImageIcon, Download, ZoomIn,
  Check, RefreshCw, Copy, ChevronDown, ChevronUp, X,
  FolderOpen, Lightbulb, RotateCcw, Minus, Plus, Palette, Ratio
} from 'lucide-react';
import { getToolWorkflow, getAllToolWorkflows, slugToGenType, type ToolWorkflowConfig, type ToolCase } from '@/lib/tool-workflow-config';

// ===== 生成结果类型 =====
interface GenResult {
  type: 'image' | 'text';
  url?: string;
  label: string;
  textContent?: string;
}

// ===== 生成步骤 =====
const GEN_STEPS = [
  { text: '正在理解需求…', percent: 15 },
  { text: '正在分析参考图…', percent: 35 },
  { text: '正在生成内容…', percent: 60 },
  { text: '正在优化细节…', percent: 85 },
  { text: '即将完成…', percent: 95 },
];

// ===== 默认案例 =====
const FALLBACK_CASES: ToolCase[] = [
  { image: '/case-lipstick-main.png', title: '商品图案例', desc: '高级感电商主图' },
  { image: '/demo-card-lifestyle.jpg', title: '封面案例', desc: '氛围感内容封面' },
  { image: '/demo-scene.jpg', title: '场景图案例', desc: '生活化场景展示' },
];

// ===== 灵感提示 =====
const PROMPT_TIPS: Record<string, string[]> = {
  'product-generator': [
    '白底主图 + 柔和阴影 = 点击率翻倍',
    '场景图选择与产品调性一致的环境',
    '细节图展示材质质感更容易转化',
  ],
  'xiaohongshu-generator': [
    '3:4 竖图是小红书封面黄金比例',
    '标题用大字 + 纯色背景更吸睛',
    '第一张图决定点击率，要放最强视觉',
  ],
  'ai-photo': [
    '上传清晰的正面照效果最好',
    '港风适合暖色调，日系适合冷色调',
    '证件照建议浅色背景 + 自然光',
  ],
  default: [
    '描述越具体，生成效果越好',
    '可以上传参考图指定风格方向',
    '尝试不同风格选项对比效果',
  ],
};

// ===== 创作上下文 =====
interface CreateContext {
  prompt?: string;
  uploadedImages?: { id: string; url: string; fileName: string; type?: string; size?: number }[];
  matchedTool?: string;
  analysisResult?: Record<string, unknown>;
  autoGenerate?: boolean;
  fromHome?: boolean;
}

function getContext(): { ctx: CreateContext; shouldAuto: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('oneclaw_create_context');
    if (!raw) return null;
    const ctx = JSON.parse(raw) as CreateContext;
    // 在修改前保存原始 autoGenerate 值
    const shouldAuto = !!(ctx.autoGenerate || ctx.fromHome);
    // 读取后立即关闭 autoGenerate 防止刷新重复生成
    if (ctx.autoGenerate) {
      ctx.autoGenerate = false;
      sessionStorage.setItem('oneclaw_create_context', JSON.stringify({ ...ctx, autoGenerate: false }));
    }
    return { ctx, shouldAuto };
  } catch { return null; }
}

export default function CreateWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== 读取上下文 =====
  const parsedCtx = useRef(getContext());
  const ctxRef = useRef(parsedCtx.current?.ctx || null);
  const urlType = searchParams.get('type') || '';
  const urlPrompt = searchParams.get('prompt') || '';

  // ===== 初始工具 =====
  const initToolSlug = ctxRef.current?.matchedTool
    || (urlType ? (getAllToolWorkflows().find(t => slugToGenType(t.slug) === urlType)?.slug || 'product-generator') : 'product-generator');
  const toolConfig = getToolWorkflow(initToolSlug) || getToolWorkflow('product-generator')!;

  // ===== 状态 =====
  const [genType, setGenType] = useState(initToolSlug);
  const [currentTool, setCurrentTool] = useState(toolConfig);
  const [prompt, setPrompt] = useState(ctxRef.current?.prompt || urlPrompt || '');
  const [uploadedImages, setUploadedImages] = useState<(File & { preview: string })[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(
    ctxRef.current?.uploadedImages?.map((img: { url: string }) => img.url).filter(Boolean) || []
  );
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'failed'>('idle');
  const [results, setResults] = useState<GenResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedRatio, setSelectedRatio] = useState(currentTool.defaultRatio);
  const [genCount, setGenCount] = useState(currentTool.defaultCount);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const shouldAutoGenerate = !!(parsedCtx.current?.shouldAuto);
  const autoGenTriggered = useRef(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeResult = results[activeIndex];
  const imageResults = results.filter(r => r.type === 'image');
  const hasImageResults = imageResults.length > 0;
  const hasTextResults = results.some(r => r.type === 'text');

  // ===== 切换工具 =====
  const handleToolChange = useCallback((slug: string) => {
    const cfg = getToolWorkflow(slug);
    if (!cfg) return;
    setGenType(slug);
    setCurrentTool(cfg);
    setSelectedRatio(cfg.defaultRatio);
    setGenCount(cfg.defaultCount);
    setSelectedStyle('');
    setSelectedOptions({});
    setShowToolDropdown(false);
    setStatus('idle');
    setResults([]);
  }, []);

  // ===== 步骤动画 =====
  const startStepAnimation = useCallback(() => {
    let step = 0;
    setCurrentStep(0);
    setProgressPercent(5);
    stepTimerRef.current = setInterval(() => {
      step++;
      if (step < GEN_STEPS.length) {
        setCurrentStep(step);
        setProgressPercent(GEN_STEPS[step].percent);
      }
    }, 2200);
  }, []);

  const clearStepAnimation = useCallback(() => {
    if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
  }, []);

  // ===== 真实 API 调用 =====
  const callGenerateAPI = useCallback(async (toolSlug: string, userPrompt: string, images: string[], opts: Record<string, string>): Promise<GenResult[]> => {
    const genTypeSlug = slugToGenType(toolSlug);

    // 抠图 → images/process
    if (genTypeSlug === 'removebg' && images.length > 0) {
      const res = await fetch('/api/images/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-bg', image: images[0] }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '抠图生成失败');
      return [{ type: 'image', url: data.data?.url || data.result?.url || images[0], label: '抠图结果' }];
    }

    // 详情页 → product-page/generate
    if (genTypeSlug === 'detail') {
      const res = await fetch('/api/product-page/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, images, style: opts.style || selectedStyle, modules: ['hero', 'features', 'specs'] }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '详情页生成失败');
      const urls = data.data?.urls || data.data?.images || (data.data?.url ? [data.data.url] : []);
      return urls.map((url: string, i: number) => ({ type: 'image', url, label: `详情页-${i + 1}` }));
    }

    // 小说 → novel/generate-script
    if (genTypeSlug === 'novel') {
      const res = await fetch('/api/novel/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, genre: opts.genre || 'romance' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '小说生成失败');
      return [{ type: 'text', label: '小说内容', textContent: data.data?.content || data.data?.script || data.data?.text || '生成完成' }];
    }

    // 简历 → llm/generate
    if (genTypeSlug === 'resume') {
      const res = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, type: 'resume' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '简历优化失败');
      return [{ type: 'text', label: '优化简历', textContent: data.data?.content || data.data?.text || '优化完成' }];
    }

    // 默认 → images/generate（商品图/小红书/写真等）
    const res = await fetch('/api/images/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        images,
        toolSlug,
        count: genCount || 4,
        ratio: selectedRatio || '1:1',
        style: opts.style || selectedStyle || '',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || '图片生成失败');
    const urls: string[] = data.data?.urls || data.data?.images || (data.data?.url ? [data.data.url] : []);
    return urls.map((url: string, i: number) => ({ type: 'image' as const, url, label: `生成结果-${i + 1}` }));
  }, [genCount, selectedRatio, selectedStyle]);

  // ===== 生成主函数 =====
  const handleGenerate = useCallback(async () => {
    const finalPrompt = prompt.trim();
    const allImages = [...uploadedImageUrls];
    if (!finalPrompt && allImages.length === 0) {
      setToast({ msg: '请输入创作需求或上传参考图', type: 'info' });
      return;
    }
    setStatus('generating');
    setResults([]);
    setActiveIndex(0);
    setErrorMsg('');
    startStepAnimation();

    try {
      const apiResults = await callGenerateAPI(genType, finalPrompt, allImages, selectedOptions);
      clearStepAnimation();
      setProgressPercent(100);
      if (apiResults.length > 0) {
        setResults(apiResults);
        setActiveIndex(0);
        setStatus('success');
      } else {
        setStatus('failed');
        setErrorMsg('生成结果为空，请重试');
      }
    } catch (err: unknown) {
      clearStepAnimation();
      setStatus('failed');
      setErrorMsg(err instanceof Error ? err.message : '生成失败，请稍后重试');
      console.error('[CreateWorkbench] 生成错误:', err);
    }
  }, [prompt, uploadedImageUrls, genType, selectedOptions, callGenerateAPI, startStepAnimation, clearStepAnimation]);

  // ===== 自动生成 =====
  useEffect(() => {
    if (shouldAutoGenerate && !autoGenTriggered.current && (prompt || uploadedImageUrls.length > 0)) {
      autoGenTriggered.current = true;
      const timer = setTimeout(() => handleGenerate(), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoGenerate, prompt, uploadedImageUrls.length, handleGenerate]);

  // ===== 上传 =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = files.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }));
    setUploadedImages(prev => [...prev, ...newFiles].slice(0, 5));
    setUploadedImageUrls(prev => [...prev, ...newFiles.map(f => f.preview)].slice(0, 5));
    if (e.target.value) e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  // ===== 操作 =====
  const handleDownload = async (url: string, filename: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = filename; a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { setToast({ msg: '下载失败', type: 'error' }); }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => setToast({ msg: '已复制', type: 'success' }));
  };

  const handleSaveToProjects = () => setToast({ msg: '已保存到作品集', type: 'success' });
  const handleContinueOptimize = () => { setStatus('idle'); setResults([]); };
  const handleSetAsCover = (idx: number) => { setActiveIndex(idx); setToast({ msg: '已设为封面', type: 'success' }); };
  const handleDownloadAll = () => { imageResults.forEach((r, i) => setTimeout(() => handleDownload(r.url!, `${r.label}.png`), i * 500)); };

  // ===== Toast =====
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== 比例选项 =====
  const ratioOptions = ['1:1', '3:4', '4:5', '4:3', '16:9', '2:3'];

  // ===== 灵感提示 =====
  const tips = PROMPT_TIPS[genType] || PROMPT_TIPS.default;

  return (
    <div className="os-ws-page">
      {/* ===== 顶部工具栏 ===== */}
      <header className="os-ws-header">
        <div className="os-ws-header-left">
          <div className="os-ws-tool-switcher" onClick={() => setShowToolDropdown(!showToolDropdown)}>
            <span className="os-ws-tool-icon">{currentTool.icon}</span>
            <span className="os-ws-tool-name">{currentTool.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <span className="os-ws-tool-desc">{currentTool.description}</span>
        </div>
        <div className="os-ws-header-right">
          {status === 'idle' && results.length === 0 && (
            <button onClick={handleGenerate} className="os-ws-gen-btn" disabled={!prompt && uploadedImageUrls.length === 0}>
              <Sparkles className="w-4 h-4" />
              <span>开始创作</span>
            </button>
          )}
        </div>

        {/* 工具下拉 */}
        {showToolDropdown && (
          <div className="os-ws-dropdown">
            {getAllToolWorkflows().map(t => (
              <button key={t.slug} className={`os-ws-dropdown-item ${t.slug === genType ? 'active' : ''}`} onClick={() => handleToolChange(t.slug)}>
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ===== 三栏主体 ===== */}
      <div className="os-ws-body">
        {/* ===== 左栏：控制区 ===== */}
        <aside className="os-ws-left">
          {/* 问候语 */}
          <div className="os-ws-section">
            <div className="os-ws-greeting">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{currentTool.greeting}</span>
            </div>
          </div>

          {/* 输入框 */}
          <div className="os-ws-section">
            <label className="os-ws-label">创作描述</label>
            <textarea
              className="os-ws-textarea"
              placeholder="描述你想生成的内容…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* 上传区 */}
          <div className="os-ws-section">
            <label className="os-ws-label">上传参考图</label>
            <div className="os-ws-upload-area" onClick={() => fileInputRef.current?.click()}>
              {uploadedImages.length === 0 ? (
                <div className="os-ws-upload-empty">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span>点击或拖拽上传</span>
                  <span className="os-ws-upload-hint">JPG / PNG / WEBP</span>
                </div>
              ) : (
                <div className="os-ws-upload-grid">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="os-ws-upload-thumb">
                      <img src={img.preview} alt="" />
                      <button className="os-ws-upload-remove" onClick={e => { e.stopPropagation(); removeImage(idx); }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {uploadedImages.length < 5 && (
                    <div className="os-ws-upload-add">
                      <Plus className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* 引导选项 */}
          {currentTool.steps.filter(s => s.type === 'select').map(step => (
            <div className="os-ws-section" key={step.id}>
              <label className="os-ws-label">{step.label}</label>
              <div className="os-ws-options">
                {step.options?.map(opt => (
                  <button
                    key={opt.value}
                    className={`os-ws-option ${selectedOptions[step.id] === opt.value ? 'active' : ''}`}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [step.id]: opt.value }))}
                  >
                    {opt.icon && <span className="os-ws-option-icon">{opt.icon}</span>}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 风格选择 */}
          {currentTool.styleOptions.length > 0 && (
            <div className="os-ws-section">
              <label className="os-ws-label">
                <Palette className="w-3.5 h-3.5" />
                风格
              </label>
              <div className="os-ws-chips">
                {currentTool.styleOptions.map(s => (
                  <button key={s.value} className={`os-ws-chip ${selectedStyle === s.value ? 'active' : ''}`} onClick={() => setSelectedStyle(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输出规格（折叠） */}
          <div className="os-ws-section">
            <button className="os-ws-adv-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Ratio className="w-3.5 h-3.5" />
              <span>输出规格</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showAdvanced && (
              <div className="os-ws-adv-content">
                <div className="os-ws-spec-row">
                  <span className="os-ws-spec-label">比例</span>
                  <div className="os-ws-ratio-group">
                    {ratioOptions.map(r => (
                      <button key={r} className={`os-ws-ratio-btn ${selectedRatio === r ? 'active' : ''}`} onClick={() => setSelectedRatio(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="os-ws-spec-row">
                  <span className="os-ws-spec-label">数量</span>
                  <div className="os-ws-count-group">
                    <button className="os-ws-count-btn" onClick={() => setGenCount(Math.max(1, genCount - 1))}><Minus className="w-3.5 h-3.5" /></button>
                    <span className="os-ws-count-val">{genCount}</span>
                    <button className="os-ws-count-btn" onClick={() => setGenCount(Math.min(8, genCount + 1))}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 生成按钮（左栏底部固定） */}
          {status !== 'generating' && (
            <button onClick={handleGenerate} className="os-ws-gen-btn-full" disabled={!prompt && uploadedImageUrls.length === 0}>
              <Sparkles className="w-4 h-4" />
              <span>{status === 'failed' ? '重新生成' : '开始创作'}</span>
            </button>
          )}
          {status === 'generating' && (
            <div className="os-ws-gen-cancel" onClick={() => { clearStepAnimation(); setStatus('idle'); }}>
              取消生成
            </div>
          )}
        </aside>

        {/* ===== 中栏：结果区 ===== */}
        <main className="os-ws-center">
          {/* 生成中 */}
          {status === 'generating' && (
            <div className="os-ws-generating">
              <div className="os-ws-gen-pulse" />
              <div className="os-ws-gen-info">
                <h3 className="text-base font-semibold text-slate-800">AI 正在生成</h3>
                <p className="text-sm text-slate-500 mt-0.5">{GEN_STEPS[currentStep]?.text || GEN_STEPS[0].text}</p>
              </div>
              <div className="os-ws-progress-track">
                <div className="os-ws-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="os-ws-skeleton-area">
                <div className="os-ws-skeleton" style={{ height: '260px' }} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="os-ws-skeleton" style={{ height: '130px' }} />
                  <div className="os-ws-skeleton" style={{ height: '130px' }} />
                </div>
              </div>
            </div>
          )}

          {/* 生成失败 */}
          {status === 'failed' && (
            <div className="os-ws-failed">
              <div className="os-ws-failed-icon"><RotateCcw className="w-8 h-8 text-red-400" /></div>
              <h3 className="text-base font-semibold text-slate-800 mt-4">生成失败</h3>
              <p className="text-sm text-slate-500 mt-1.5">{errorMsg || '生成失败，请稍后重试'}</p>
              <button onClick={handleGenerate} className="os-ws-retry-btn mt-6">
                <RefreshCw className="w-4 h-4" /><span>重新生成</span>
              </button>
            </div>
          )}

          {/* 空闲状态：展示工具案例 */}
          {status === 'idle' && results.length === 0 && (
            <div className="os-ws-idle">
              <div className="os-ws-idle-header">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{currentTool.name}创作案例</span>
              </div>
              <div className="os-ws-idle-cases">
                {(currentTool.cases.length > 0 ? currentTool.cases : FALLBACK_CASES).map((c, idx) => (
                  <div key={idx} className="os-ws-idle-case">
                    <div className="os-ws-idle-case-img">
                      {c.image ? <img src={c.image} alt={c.title} /> : <div className="os-ws-idle-case-fallback"><ImageIcon className="w-8 h-8 text-slate-300" /></div>}
                    </div>
                    <div className="os-ws-idle-case-info">
                      <div className="os-ws-idle-case-title">{c.title}</div>
                      <div className="os-ws-idle-case-desc">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="os-ws-idle-hint">完成左侧创作引导后，AI 将自动为你生成</div>
            </div>
          )}

          {/* 图片结果 */}
          {status === 'success' && hasImageResults && (
            <div className="os-ws-results">
              <div className="os-ws-results-bar">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">生成结果</span>
                  <span className="os-ws-results-badge">{currentTool.name}</span>
                  <span className="text-[11px] text-slate-400">{imageResults.length} 张</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveToProjects} className="os-ws-action-btn"><FolderOpen className="w-3.5 h-3.5" /><span>保存到作品</span></button>
                </div>
              </div>

              {activeResult && activeResult.type === 'image' && (
                <div className="os-ws-preview-main group">
                  <img src={activeResult.url} alt={activeResult.label} className="os-ws-preview-img" />
                  <div className="os-ws-preview-overlay">
                    <div className="os-ws-preview-actions">
                      <button onClick={() => setShowLightbox(true)} className="os-ws-preview-action" title="放大"><ZoomIn className="w-4 h-4" /><span>放大</span></button>
                      <button onClick={() => handleDownload(activeResult.url!, `${activeResult.label}.png`)} className="os-ws-preview-action" title="下载"><Download className="w-4 h-4" /><span>下载</span></button>
                      <button onClick={() => handleSetAsCover(activeIndex)} className="os-ws-preview-action" title="设为封面"><Check className="w-4 h-4" /><span>封面</span></button>
                    </div>
                  </div>
                </div>
              )}

              {imageResults.length > 1 && (
                <div className="os-ws-thumb-row">
                  {imageResults.map((result, idx) => {
                    const globalIdx = results.indexOf(result);
                    return (
                      <button key={idx} onClick={() => setActiveIndex(globalIdx)} className={`os-ws-thumb-item ${activeIndex === globalIdx ? 'active' : ''}`}>
                        <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                        {activeIndex === globalIdx && <div className="os-ws-thumb-indicator"><Check className="w-3 h-3 text-white" /></div>}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="os-ws-bottom-bar">
                <div className="flex items-center gap-2">
                  <button onClick={handleContinueOptimize} className="os-ws-action-btn"><Sparkles className="w-3.5 h-3.5" /><span>继续优化</span></button>
                  <button onClick={handleGenerate} className="os-ws-action-btn"><RefreshCw className="w-3.5 h-3.5" /><span>重新生成</span></button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleDownloadAll} className="os-ws-action-btn"><Download className="w-3.5 h-3.5" /><span>下载全部</span></button>
                </div>
              </div>
            </div>
          )}

          {/* 文本结果 */}
          {status === 'success' && hasTextResults && (
            <div className="os-ws-results">
              <div className="os-ws-results-bar">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">生成结果</span>
                  <span className="os-ws-results-badge">{currentTool.name}</span>
                </div>
                <button onClick={handleSaveToProjects} className="os-ws-action-btn"><FolderOpen className="w-3.5 h-3.5" /><span>保存到作品</span></button>
              </div>
              {results.filter(r => r.type === 'text').map((result, idx) => (
                <div key={idx} className="os-ws-text-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{result.label}</span>
                    <button onClick={() => handleCopyText(result.textContent || '')} className="os-ws-action-btn text-xs"><Copy className="w-3 h-3" /><span>复制</span></button>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.textContent || '暂无文本内容'}</p>
                </div>
              ))}
              {hasImageResults && (
                <div className="mt-4">
                  <div className="text-xs text-slate-400 font-medium mb-2">图片结果</div>
                  <div className="grid grid-cols-3 gap-2">
                    {imageResults.map((result, idx) => (
                      <button key={idx} onClick={() => { setActiveIndex(idx); setShowLightbox(true); }} className="os-ws-thumb-item-sm">
                        <img src={result.url} alt={result.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="os-ws-bottom-bar">
                <div className="flex items-center gap-2">
                  <button onClick={handleContinueOptimize} className="os-ws-action-btn"><Sparkles className="w-3.5 h-3.5" /><span>继续优化</span></button>
                  <button onClick={handleGenerate} className="os-ws-action-btn"><RefreshCw className="w-3.5 h-3.5" /><span>重新生成</span></button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ===== 右栏：灵感区 ===== */}
        <aside className="os-ws-right">
          {/* 热门风格 */}
          {currentTool.styleOptions.length > 0 && (
            <div className="os-ws-insp-section">
              <div className="os-ws-insp-title">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>热门风格</span>
              </div>
              <div className="os-ws-insp-styles">
                {currentTool.styleOptions.map(s => (
                  <button key={s.value} className={`os-ws-insp-style ${selectedStyle === s.value ? 'active' : ''}`} onClick={() => setSelectedStyle(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 灵感案例 */}
          <div className="os-ws-insp-section">
            <div className="os-ws-insp-title">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>灵感案例</span>
            </div>
            <div className="os-ws-insp-cases">
              {(currentTool.cases.length > 0 ? currentTool.cases : FALLBACK_CASES).map((c, idx) => (
                <div key={idx} className="os-ws-insp-case">
                  <div className="os-ws-insp-case-img">
                    {c.image ? <img src={c.image} alt={c.title} /> : <div className="os-ws-insp-case-fallback"><ImageIcon className="w-5 h-5 text-slate-300" /></div>}
                  </div>
                  <div className="os-ws-insp-case-info">
                    <div className="os-ws-insp-case-title">{c.title}</div>
                    <div className="os-ws-insp-case-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt 灵感 */}
          <div className="os-ws-insp-section">
            <div className="os-ws-insp-title">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>创作技巧</span>
            </div>
            <div className="os-ws-insp-tips">
              {tips.map((tip, idx) => (
                <div key={idx} className="os-ws-insp-tip">{tip}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ===== Lightbox ===== */}
      {showLightbox && activeResult && activeResult.type === 'image' && (
        <div className="os-ws-lightbox" onClick={() => setShowLightbox(false)}>
          <div className="os-ws-lightbox-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLightbox(false)} className="os-ws-lightbox-close"><X className="w-5 h-5" /></button>
            <img src={activeResult.url} alt={activeResult.label} className="os-ws-lightbox-img" />
            <div className="os-ws-lightbox-actions">
              <button onClick={() => handleDownload(activeResult.url!, `${activeResult.label}.png`)} className="os-ws-lightbox-btn"><Download className="w-4 h-4" /><span>下载 PNG</span></button>
              <button onClick={() => { handleSetAsCover(activeIndex); setShowLightbox(false); }} className="os-ws-lightbox-btn"><Check className="w-4 h-4" /><span>设为封面</span></button>
              <button onClick={() => { handleSaveToProjects(); setShowLightbox(false); }} className="os-ws-lightbox-btn"><FolderOpen className="w-4 h-4" /><span>保存到作品</span></button>
            </div>
            {imageResults.length > 1 && (
              <div className="os-ws-lightbox-thumbs">
                {imageResults.map((r, idx) => {
                  const globalIdx = results.indexOf(r);
                  return (
                    <button key={idx} onClick={e => { e.stopPropagation(); setActiveIndex(globalIdx); }} className={`os-ws-lightbox-thumb ${activeIndex === globalIdx ? 'active' : ''}`}>
                      <img src={r.url} alt={r.label} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Toast ===== */}
      {toast && (
        <div className={`os-ws-toast os-ws-toast-${toast.type}`}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ===== 全局点击关闭下拉 ===== */}
      {showToolDropdown && <div className="os-ws-overlay" onClick={() => setShowToolDropdown(false)} />}
    </div>
  );
}
