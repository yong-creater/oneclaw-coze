'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Upload, X, ChevronDown,
  Download, RotateCcw, ZoomIn, Loader2, Check,
  ArrowRight, ImageIcon, Menu, BookmarkPlus, BookmarkCheck
} from 'lucide-react';
import { getToolWorkflow, getAllToolWorkflows, slugToGenType, type ToolWorkflowConfig, type InspirationItem } from '@/lib/tool-workflow-config';
import { SiteLogo } from '@/components/site/common/SiteLogo';
import InspirationLibrary from '@/components/site/common/InspirationLibrary';

// ===== 类型 =====
interface GeneratedImage { url: string; }
interface UploadItem { id: string; url: string; name: string; }

type GenStep = 'idle' | 'understanding' | 'analyzing' | 'matching' | 'generating' | 'optimizing' | 'done' | 'error';

const STEP_LABELS: Record<GenStep, string> = {
  idle: '等待开始',
  understanding: '理解需求',
  analyzing: '分析图片',
  matching: '匹配生成方式',
  generating: '生成结果',
  optimizing: '优化细节',
  done: '完成',
  error: '生成失败',
};

const STEP_ORDER: GenStep[] = ['understanding', 'analyzing', 'matching', 'generating', 'optimizing', 'done'];

// 比例 → SDK size 映射（由 API 端处理，前端只传 ratio）
const RATIO_OPTIONS = [
  { value: '1:1',  w: 20, h: 20, label: '1:1' },
  { value: '3:4',  w: 15, h: 20, label: '3:4' },
  { value: '4:5',  w: 16, h: 20, label: '4:5' },
  { value: '4:3',  w: 20, h: 15, label: '4:3' },
  { value: '2:3',  w: 13, h: 20, label: '2:3' },
  { value: '16:9', w: 20, h: 11, label: '16:9' },
  { value: '9:16', w: 11, h: 20, label: '9:16' },
];

const VALID_RATIOS = RATIO_OPTIONS.map(r => r.value);

// sessionStorage key
const CREATE_CONTEXT_KEY = 'oneclaw_create_context';

// ===== 工具主题色 =====
const TOOL_ACCENT: Record<string, string> = {
  'product-generator': '#7B6DFF',
  'xiaohongshu-generator': '#FF2442',
  'ai-photo': '#F97316',
  'poster-design': '#06B6D4',
  'background-removal': '#8B5CF6',
  'product-page': '#10B981',
};

// ===== 工具布局 =====
const TOOL_LAYOUT: Record<string, string> = {
  'product-generator': 'os-ws-layout-product',
  'xiaohongshu-generator': 'os-ws-layout-xiaohongshu',
  'ai-photo': 'os-ws-layout-photo',
  'poster-design': 'os-ws-layout-poster',
  'background-removal': 'os-ws-layout-default',
  'product-page': 'os-ws-layout-default',
};

export default function CreateWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ----- 工具 -----
  const allTools = getAllToolWorkflows();
  const [toolSlug, setToolSlug] = useState('product-generator');
  const rawConfig = getToolWorkflow(toolSlug);
  const config = rawConfig ?? {
    slug: toolSlug, name: toolSlug, icon: '🛠️', description: '',
    greeting: '', steps: [], cases: [],
    defaultRatio: '1:1', defaultCount: 4, styleOptions: [],
  };
  const accent = TOOL_ACCENT[toolSlug] || '#7B6DFF';

  // ----- 输入 -----
  const [inputText, setInputText] = useState('');
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  // ----- 参数 -----
  const [selectedSubtype, setSelectedSubtype] = useState(config.subtypeOptions?.[0]?.value || '');
  const [selectedStyle, setSelectedStyle] = useState(config.styleOptions?.[0]?.value || '');
  const [count, setCount] = useState(config.defaultCount || 4);
  const [ratio, setRatio] = useState(config.defaultRatio || '1:1');

  // ----- 生成 -----
  const [step, setStep] = useState<GenStep>('idle');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // ----- 保存 -----
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ----- 大图 -----
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  // ----- 移动端侧栏 -----
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ----- Refs -----
  const parsedCtx = useRef<{
    shouldAuto?: boolean;
    prompt?: string;
    toolSlug?: string;
    images?: UploadItem[];
    analysisResult?: { tool?: string; style?: string; ratio?: string; count?: string; industry?: string; output_type?: string };
  }>({});
  const genParamsRef = useRef({ toolSlug, selectedStyle, selectedSubtype, count, ratio, inputText, uploads });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步 ref
  genParamsRef.current = { toolSlug, selectedStyle, selectedSubtype, count, ratio, inputText, uploads };

  // ===== 读取 context =====
  const getContext = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CREATE_CONTEXT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      sessionStorage.removeItem(CREATE_CONTEXT_KEY);
      const shouldAuto = data.autoGenerate === true;
      if (shouldAuto && !parsedCtx.current.shouldAuto) {
        parsedCtx.current.shouldAuto = true;
      }
      parsedCtx.current.prompt = data.prompt;
      parsedCtx.current.toolSlug = data.toolSlug;
      parsedCtx.current.images = data.images;
      parsedCtx.current.analysisResult = data.analysisResult;
      return data;
    } catch { return null; }
  }, []);

  // ===== 初始化 =====
  useEffect(() => {
    getContext();
    const urlSlug = searchParams.get('tool') || searchParams.get('type') || searchParams.get('toolId');
    const urlPrompt = searchParams.get('prompt');
    const urlStyle = searchParams.get('style');
    const urlRatio = searchParams.get('ratio');

    const ctx = parsedCtx.current;
    const slug = urlSlug || ctx?.toolSlug || 'product-generator';

    if (slug && slug !== 'product-generator') {
      const tc = getToolWorkflow(slug);
      if (tc) {
        setToolSlug(slug);
        setSelectedSubtype(tc.subtypeOptions?.[0]?.value || '');
        setSelectedStyle(tc.styleOptions?.[0]?.value || '');
        setCount(tc.defaultCount || 4);
        setRatio(tc.defaultRatio || '1:1');
      }
    }

    if (ctx?.prompt || urlPrompt) {
      setInputText(ctx?.prompt || urlPrompt || '');
    }

    const analysis = ctx?.analysisResult;
    const recStyle = urlStyle || analysis?.style;
    const recRatio = urlRatio || analysis?.ratio;
    const recCount = analysis?.count;

    if (slug) {
      const tc = getToolWorkflow(slug);
      // 匹配 style
      if (recStyle && tc?.styleOptions?.length) {
        const found = tc.styleOptions.find(s =>
          s.value.toLowerCase() === recStyle.toLowerCase() ||
          s.label === recStyle ||
          s.label.includes(recStyle) ||
          recStyle.includes(s.label)
        );
        if (found) setSelectedStyle(found.value);
      }
      // 匹配 subtype
      if (analysis?.output_type && tc?.subtypeOptions?.length) {
        const found = tc.subtypeOptions.find(s =>
          s.value.toLowerCase() === analysis.output_type!.toLowerCase() ||
          s.label.includes(analysis.output_type!) ||
          analysis.output_type!.includes(s.label)
        );
        if (found) setSelectedSubtype(found.value);
      }
      // 匹配 ratio
      if (recRatio && VALID_RATIOS.includes(recRatio)) {
        setRatio(recRatio);
      }
      // 匹配 count
      if (recCount) {
        const n = parseInt(String(recCount).replace(/[^\d]/g, ''), 10);
        if (n >= 1 && n <= 8) setCount(n);
      }
    }

    // URL 带 prompt 时自动生成
    if (urlPrompt && !ctx?.shouldAuto) {
      parsedCtx.current.shouldAuto = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ===== 自动生成 =====
  useEffect(() => {
    if (!parsedCtx.current.shouldAuto) return;
    parsedCtx.current.shouldAuto = false;
    const timer = setTimeout(() => {
      const p = genParamsRef.current;
      if (p.inputText || p.uploads.length > 0) {
        handleGenerate();
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolSlug]);

  // ===== 切换工具 =====
  const handleToolSwitch = (slug: string) => {
    const tc = getToolWorkflow(slug);
    if (!tc) return;
    setToolSlug(slug);
    setSelectedSubtype(tc.subtypeOptions?.[0]?.value || '');
    setSelectedStyle(tc.styleOptions?.[0]?.value || '');
    setCount(tc.defaultCount || 4);
    setRatio(tc.defaultRatio || '1:1');
    setStep('idle');
    setImages([]);
    setSaved(false);
    setErrorMsg('');
  };

  // ===== 上传图片 =====
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (uploads.length >= 5) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploads(prev => [...prev, {
          id: Math.random().toString(36).slice(2),
          url: ev.target?.result as string,
          name: file.name,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeUpload = (id: string) => setUploads(prev => prev.filter(u => u.id !== id));

  // ===== 生成 =====
  const handleGenerate = async () => {
    const p = genParamsRef.current;
    if (!p.inputText && p.uploads.length === 0) return;

    setStep('understanding');
    setImages([]);
    setSaved(false);
    setErrorMsg('');

    const steps: GenStep[] = ['understanding', 'analyzing', 'matching', 'generating', 'optimizing'];
    let stepIdx = 0;
    const iv = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) setStep(steps[stepIdx]);
    }, 1200);

    try {
      const body: Record<string, unknown> = {
        prompt: p.inputText,
        tool_id: p.toolSlug,
        style: p.selectedStyle,
        ratio: p.ratio,
        count: p.count,
        subtype: p.selectedSubtype,
      };
      if (p.uploads.length > 0) body.images = p.uploads.map(u => u.url);

      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      clearInterval(iv);
      const data = await res.json();

      if (data.success && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        setImages(data.imageUrls.map((url: string) => ({ url })));
        setStep('done');
      } else if (data.success && Array.isArray(data.images) && data.images.length > 0) {
        setImages(data.images.map((url: string) => ({ url })));
        setStep('done');
      } else {
        setStep('error');
        setErrorMsg(data.error || '生成失败，请重试');
      }
    } catch (err) {
      clearInterval(iv);
      setStep('error');
      setErrorMsg('网络错误，请重试');
    }
  };

  // ===== 下载 =====
  const handleDownload = async (url: string, idx: number) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${toolSlug}-${idx + 1}.png`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch { /* fallback: open in new tab */ window.open(url, '_blank'); }
  };

  // ===== 保存到作品库 =====
  const handleSave = async () => {
    if (images.length === 0) return;
    try {
      await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: toolSlug,
          tool_name: config.name,
          tool_type: slugToGenType(toolSlug),
          title: inputText.slice(0, 50) || config.name,
          thumbnail: images[0]?.url,
          input_params: {
            prompt: inputText,
            style: selectedStyle,
            subtype: selectedSubtype,
            ratio,
            count,
          },
          output_content: {
            image_urls: images.map(i => i.url),
          },
        }),
      });
      setSaved(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch { /* silently fail */ }
  };

  // ===== 使用灵感 =====
  const handleUseInspiration = useCallback((item: InspirationItem) => {
    // 切换到对应工具
    if (item.toolSlug !== toolSlug) {
      handleToolSwitch(item.toolSlug);
    }
    // 填充参数
    setInputText(item.desc);
    if (item.style) setSelectedStyle(item.style);
    if (item.subtype) setSelectedSubtype(item.subtype);
    if (item.ratio && VALID_RATIOS.includes(item.ratio)) setRatio(item.ratio);
    if (item.count >= 1 && item.count <= 8) setCount(item.count);
    // 自动触发生成
    setTimeout(() => handleGenerate(), 300);
  }, [toolSlug]);

  // ===== 渲染 =====
  const isGenerating = !['idle', 'done', 'error'].includes(step);
  const layoutClass = TOOL_LAYOUT[toolSlug] || 'os-ws-layout-default';

  return (
    <div className="os-ws-page" style={{ '--ws-accent': accent } as React.CSSProperties}>
      {/* ===== HEADER ===== */}
      <div className="os-ws-header">
        <div className="os-ws-header-left">
          <SiteLogo size={28} showText href="/" />
          <div className="os-ws-tool-selector" onClick={() => {
            const idx = allTools.findIndex(t => t.slug === toolSlug);
            const next = allTools[(idx + 1) % allTools.length];
            handleToolSwitch(next.slug);
          }}>
            <span>{config.icon} {config.name}</span>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="os-ws-body">
        {/* ----- LEFT PANEL ----- */}
        <div className={`os-ws-left ${sidebarOpen ? 'open' : ''}`}>
          <div className="os-ws-left-content">

            {/* 需求描述 */}
            <div>
              <div className="os-ws-section-label">需求描述</div>
              <textarea
                className="os-ws-textarea"
                placeholder="描述你想生成的内容…"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
            </div>

            {/* 上传参考图 */}
            {toolSlug !== 'background-removal' && (
              <div>
                <div className="os-ws-section-label">参考图 {uploads.length > 0 && `(${uploads.length}/5)`}</div>
                <div className="os-ws-upload-area">
                  {uploads.map(u => (
                    <div key={u.id} className="os-ws-upload-thumb">
                      <img src={u.url} alt={u.name} />
                      <button className="os-ws-upload-thumb-remove" onClick={() => removeUpload(u.id)}>
                        <X />
                      </button>
                    </div>
                  ))}
                  {uploads.length < 5 && (
                    <div className="os-ws-upload-btn" onClick={() => fileInputRef.current?.click()}>
                      <Upload />
                      <span>添加图片</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* 生成类型 (subtype) */}
            {config.subtypeOptions && config.subtypeOptions.length > 0 && (
              <div>
                <div className="os-ws-section-label">{config.subtypeLabel || '生成类型'}</div>
                <div className="os-ws-pills">
                  {config.subtypeOptions.map(opt => (
                    <div
                      key={opt.value}
                      className={`os-ws-pill ${selectedSubtype === opt.value ? 'active' : ''}`}
                      onClick={() => setSelectedSubtype(opt.value)}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 风格选择 */}
            {config.styleOptions && config.styleOptions.length > 0 && (
              <div>
                <div className="os-ws-section-label">风格</div>
                <div className="os-ws-pills">
                  {config.styleOptions.map(opt => (
                    <div
                      key={opt.value}
                      className={`os-ws-pill ${selectedStyle === opt.value ? 'active' : ''}`}
                      onClick={() => setSelectedStyle(opt.value)}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 数量 + 比例 */}
            <div className="os-ws-count-ratio-row">
              <div className="os-ws-count-group">
                <div className="os-ws-section-label">数量</div>
                <div className="os-ws-stepper">
                  <button
                    className="os-ws-stepper-btn"
                    onClick={() => setCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                  >−</button>
                  <div className="os-ws-stepper-value">{count}</div>
                  <button
                    className="os-ws-stepper-btn"
                    onClick={() => setCount(Math.min(8, count + 1))}
                    disabled={count >= 8}
                  >+</button>
                </div>
              </div>
              <div className="os-ws-ratio-group">
                <div className="os-ws-section-label">比例</div>
                <div className="os-ws-ratio-grid">
                  {RATIO_OPTIONS.map(r => (
                    <div
                      key={r.value}
                      className={`os-ws-ratio-card ${ratio === r.value ? 'active' : ''}`}
                      onClick={() => setRatio(r.value)}
                    >
                      <div
                        className="os-ws-ratio-icon"
                        style={{ width: r.w, height: r.h }}
                      />
                      <span className="os-ws-ratio-label">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              className="os-ws-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating || (!inputText && uploads.length === 0)}
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin" /> 生成中…</>
              ) : step === 'done' ? (
                <><RotateCcw /> 重新生成</>
              ) : (
                <><Sparkles /> 开始生成</>
              )}
            </button>

            {/* 灵感参考 */}
            <div className="os-ws-inspiration-section">
              <InspirationLibrary currentTool={toolSlug} onUseInspiration={handleUseInspiration} />
            </div>
          </div>
        </div>

        {/* ----- CENTER (Visual Focus) ----- */}
        <div className="os-ws-center">

          {/* 空状态 */}
          {step === 'idle' && images.length === 0 && (
            <div className="os-ws-empty">
              <div className="os-ws-empty-icon">
                <ImageIcon />
              </div>
              <h3>{config.name}</h3>
              <p>{config.description || '在左侧输入描述和上传参考图，或从灵感库选取'}</p>
            </div>
          )}

          {/* 加载中 */}
          {isGenerating && (
            <div className="os-ws-progress">
              <div className="os-ws-progress-spinner" />
              <div className="os-ws-progress-steps">
                {STEP_ORDER.map((s, i) => {
                  const curIdx = STEP_ORDER.indexOf(step);
                  const isDone = i < curIdx;
                  const isActive = s === step;
                  return (
                    <div key={s} className={`os-ws-progress-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      {isDone ? <Check /> : isActive ? <Loader2 className="animate-spin" /> : null}
                      {STEP_LABELS[s]}
                      {i < STEP_ORDER.length - 1 && <div className="os-ws-progress-arrow" />}
                    </div>
                  );
                })}
              </div>
              <div className="os-ws-progress-text">AI 正在为你创作，请稍候…</div>
            </div>
          )}

          {/* 错误 */}
          {step === 'error' && (
            <div className="os-ws-empty">
              <div className="os-ws-empty-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <ImageIcon style={{ color: '#ef4444' }} />
              </div>
              <h3>生成失败</h3>
              <p>{errorMsg || '请检查输入后重试'}</p>
              <button className="os-ws-generate-btn" style={{ width: 'auto', padding: '8px 24px' }} onClick={handleGenerate}>
                <RotateCcw /> 重试
              </button>
            </div>
          )}

          {/* 生成结果 */}
          {step === 'done' && images.length > 0 && (
            <div className="os-ws-results">
              {/* 图片网格 */}
              <div className={layoutClass}>
                {images.map((img, idx) => (
                  <div key={idx} className="os-ws-img-card" onClick={() => setLightboxIdx(idx)}>
                    <img src={img.url} alt={`生成结果 ${idx + 1}`} loading="lazy" />
                    <div className="os-ws-img-overlay">
                      <button
                        className="os-ws-img-action os-ws-img-action-primary"
                        onClick={e => { e.stopPropagation(); handleDownload(img.url, idx); }}
                      >
                        <Download /> 下载
                      </button>
                      <button
                        className="os-ws-img-action os-ws-img-action-secondary"
                        onClick={e => { e.stopPropagation(); setLightboxIdx(idx); }}
                      >
                        <ZoomIn /> 查看
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 操作栏 */}
              <div className="os-ws-result-actions">
                <button className="os-ws-result-btn" onClick={handleGenerate}>
                  <RotateCcw /> 重新生成
                </button>
                <button
                  className={`os-ws-result-btn ${saved ? 'os-ws-result-btn-saved' : 'os-ws-result-btn-primary'}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? <><BookmarkCheck /> 已保存</> : <><BookmarkPlus /> 保存到作品库</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 移动端侧栏切换 ===== */}
      <button className="os-ws-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
        <Menu />
      </button>

      {/* ===== SAVE TOAST ===== */}
      <div className={`os-ws-save-toast ${showToast ? 'show' : ''}`}>
        <Check /> 已保存到作品库
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxIdx >= 0 && images[lightboxIdx] && (
        <div className="os-ws-lightbox" onClick={() => setLightboxIdx(-1)}>
          <button className="os-ws-lightbox-close" onClick={() => setLightboxIdx(-1)}>
            <X />
          </button>
          <img src={images[lightboxIdx].url} alt="大图预览" />
          {images.length > 1 && (
            <div className="os-ws-lightbox-thumbs">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`缩略图 ${i + 1}`}
                  className={`os-ws-lightbox-thumb ${i === lightboxIdx ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
