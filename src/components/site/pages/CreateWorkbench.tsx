'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Upload, X,
  Download, RotateCcw, ZoomIn, Loader2, Check,
  ArrowRight, ImageIcon, Menu, BookmarkPlus, BookmarkCheck,
  History, BookOpen, Wand2,
  Package, BookImage, Camera, Palette, Scissors, FileText
} from 'lucide-react';
import { getToolWorkflow, getAllToolWorkflows, slugToGenType, type ToolWorkflowConfig } from '@/lib/tool-workflow-config';
import { useUser } from '@/contexts/UserContext';

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

// ===== 工具 Lucide 图标映射 =====
const TOOL_LUCIDE_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'product-generator': Package,
  'xiaohongshu-generator': BookImage,
  'ai-photo': Camera,
  'poster-design': Palette,
  'background-removal': Scissors,
  'product-page': FileText,
};

// ===== 工具标题和描述（弱化后台感） =====
const TOOL_HEADER: Record<string, { title: string; desc: string }> = {
  'product-generator': { title: 'AI 商品图生成器', desc: '生成高质感电商视觉图' },
  'xiaohongshu-generator': { title: '小红书封面生成器', desc: '一键生成爆款封面' },
  'ai-photo': { title: 'AI 写真生成器', desc: '生成氛围感写真大片' },
  'poster-design': { title: 'AI 海报设计器', desc: '生成营销海报与品牌视觉图' },
  'background-removal': { title: 'AI 智能抠图', desc: '快速去背景，生成白底图' },
  'product-page': { title: 'AI 商品详情页生成器', desc: '自动生成电商详情页长图' },
};

// ===== 工具布局 ===== (CSS class suffix for canvas image sizing)
const TOOL_SIZE: Record<string, string> = {
  'product-generator': 'product',
  'xiaohongshu-generator': 'xiaohongshu',
  'ai-photo': 'photo',
  'poster-design': 'poster',
  'background-removal': 'default',
  'product-page': 'default',
};

// ===== 生成中动态文案 =====
const LOADING_MESSAGES = [
  '正在理解你的创意',
  'AI 正在构建视觉细节',
  '正在优化光影与构图',
  '正在生成高质量画面',
];

// ===== Shimmer 尺寸映射（宽 x 高） =====
const TOOL_SHIMMER: Record<string, { w: number; h: number }> = {
  'product-generator': { w: 380, h: 300 },
  'xiaohongshu-generator': { w: 260, h: 380 },
  'ai-photo': { w: 300, h: 400 },
  'poster-design': { w: 420, h: 300 },
  'background-removal': { w: 340, h: 340 },
  'product-page': { w: 360, h: 320 },
};

export default function CreateWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, setShowLoginModal } = useUser();

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

  // ----- 加载中文案轮播 -----
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

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

  // 同步 ref (useEffect to avoid assigning ref during render)
  useEffect(() => {
    genParamsRef.current = { toolSlug, selectedStyle, selectedSubtype, count, ratio, inputText, uploads };
  }, [toolSlug, selectedStyle, selectedSubtype, count, ratio, inputText, uploads]);

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

  // ===== 加载中文案轮播 =====
  useEffect(() => {
    if (!isGenerating) {
      setLoadingMsgIdx(0);
      return;
    }
    const iv = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
    if (!authenticated) {
      setShowLoginModal(true);
      return;
    }
    if (images.length === 0) {
      alert('暂无可保存的作品');
      return;
    }
    try {
      const payload = {
        tool_id: toolSlug,
        tool_name: config?.name || toolSlug,
        tool_type: slugToGenType(toolSlug),
        title: inputText.slice(0, 50) || config?.name || 'AI生成作品',
        thumbnail: images[0]?.url || '',
        input_params: {
          prompt: inputText,
          style: selectedStyle,
          subtype: selectedSubtype,
          ratio,
          count,
        },
        output_content: {
          image_urls: images.map((i: GeneratedImage) => i.url),
        },
      };
      console.log('[Save] payload:', payload);
      const res = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      console.log('[Save] response:', res.status, data);
      if (res.ok && data.success) {
        setSaved(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      } else if (res.status === 401) {
        setShowLoginModal(true);
      } else {
        alert(data.error || '保存失败，请稍后重试');
      }
    } catch (err) {
      console.error('保存请求异常:', err);
      alert('网络异常，请稍后重试');
    }
  };

  // ===== 渲染 =====
  const isGenerating = !['idle', 'done', 'error'].includes(step);
  const sizeSuffix = TOOL_SIZE[toolSlug] || 'default';
  const shimmerSize = TOOL_SHIMMER[toolSlug] || { w: 340, h: 340 };
  const currentStepIdx = STEP_ORDER.indexOf(step);
  const HeaderIcon = TOOL_LUCIDE_ICON[toolSlug] || Package;
  const headerInfo = TOOL_HEADER[toolSlug] || { title: config.name, desc: config.description };

  return (
    <div className="os-ws-page" style={{ '--ws-accent': accent } as React.CSSProperties}>
      {/* ===== HEADER — lightweight context bar ===== */}
      <div className="os-ws-header">
        <div className="os-ws-header-left">
          <div className="os-ws-header-tool-icon">
            <HeaderIcon size={18} strokeWidth={1.6} />
          </div>
          <div className="os-ws-header-tool-info">
            <h1 className="os-ws-header-tool-name">{headerInfo.title}</h1>
            <span className="os-ws-header-tool-desc">{headerInfo.desc}</span>
          </div>
        </div>
        <div className="os-ws-header-actions">
          <button
            onClick={() => {/* TODO: 历史记录 */}}
            title="历史记录"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => {/* TODO: 使用指南 */}}
            title="使用指南"
          >
            <BookOpen size={16} />
          </button>
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
          </div>
        </div>

        {/* ----- CENTER — AI Creation Canvas ----- */}
        <div className="os-ws-center">

          {/* 空状态 — 画布氛围 */}
          {step === 'idle' && images.length === 0 && (
            <div className="os-ws-canvas-empty">
              <div className="os-ws-canvas-empty-icon">
                <div className="os-ws-canvas-empty-icon-core">
                  <Wand2 />
                </div>
              </div>
              <h3>{config.name}</h3>
              <p>{config.description || '在左侧输入描述和上传参考图，AI 将为你创作'}</p>
            </div>
          )}

          {/* 加载中 — Shimmer Canvas */}
          {isGenerating && (
            <div className="os-ws-canvas-loading">
              <div
                className="os-ws-canvas-shimmer"
                style={{ width: shimmerSize.w, height: shimmerSize.h }}
              >
                <div className="os-ws-canvas-shimmer-icon">
                  <Sparkles />
                </div>
              </div>
              <div className="os-ws-canvas-loading-text">
                <div className="os-ws-canvas-loading-label" key={loadingMsgIdx}>
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </div>
                <div className="os-ws-canvas-loading-sub">
                  {STEP_LABELS[step]}…
                </div>
              </div>
              <div className="os-ws-canvas-loading-dots">
                {STEP_ORDER.map((s, i) => (
                  <div
                    key={s}
                    className={`os-ws-canvas-loading-dot ${
                      i < currentStepIdx ? 'done' : i === currentStepIdx ? 'active' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 错误 */}
          {step === 'error' && (
            <div className="os-ws-canvas-error">
              <div className="os-ws-canvas-error-icon">
                <ImageIcon />
              </div>
              <h3>生成失败</h3>
              <p>{errorMsg || '请检查输入后重试'}</p>
              <button
                className="os-ws-capsule-btn os-ws-capsule-btn--accent"
                onClick={handleGenerate}
              >
                <RotateCcw /> 重试
              </button>
            </div>
          )}

          {/* 生成结果 — 聚焦展示 */}
          {step === 'done' && images.length > 0 && (
            <div className="os-ws-canvas-result">
              {/* 图片区域 */}
              <div className="os-ws-canvas-gallery">
                {images.length === 1 ? (
                  /* 单图大展示 */
                  <div
                    className={`os-ws-canvas-img os-ws-canvas-img--${sizeSuffix}`}
                    style={{ animationDelay: '0.1s' }}
                    onClick={() => setLightboxIdx(0)}
                  >
                    <img src={images[0].url} alt="生成结果" />
                  </div>
                ) : (
                  /* 多图网格 */
                  <div className="os-ws-canvas-multi-grid">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`os-ws-canvas-img os-ws-canvas-img--${sizeSuffix}`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        onClick={() => setLightboxIdx(idx)}
                      >
                        <img src={img.url} alt={`生成结果 ${idx + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 胶囊操作栏 */}
              <div className="os-ws-canvas-actions">
                <button
                  className="os-ws-capsule-btn os-ws-capsule-btn--glass"
                  onClick={handleGenerate}
                >
                  <RotateCcw /> 重新生成
                </button>
                <button
                  className={`os-ws-capsule-btn ${
                    saved
                      ? 'os-ws-capsule-btn--saved'
                      : 'os-ws-capsule-btn--accent'
                  }`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? <><BookmarkCheck /> 已保存</> : <><BookmarkPlus /> 保存到作品库</>}
                </button>
                {images.length === 1 && (
                  <button
                    className="os-ws-capsule-btn os-ws-capsule-btn--download"
                    onClick={() => handleDownload(images[0].url, 0)}
                  >
                    <Download /> 下载
                  </button>
                )}
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
