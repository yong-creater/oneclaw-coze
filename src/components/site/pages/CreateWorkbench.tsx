'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Upload, ImagePlus, X, ChevronDown,
  Download, RotateCcw, ZoomIn, Loader2, Check,
  ArrowRight, Lightbulb, Wand2, ImageIcon
} from 'lucide-react';
import { getToolWorkflow, getAllToolWorkflows, slugToGenType, type ToolWorkflowConfig } from '@/lib/tool-workflow-config';

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

// ===== 生成 API =====
async function callGenerateAPI(
  slug: string, prompt: string, images: string[],
  style: string, subtype: string, count: number, ratio: string
): Promise<GeneratedImage[]> {
  // 统一使用 tool_id 从数据库读取模型配置，按 providerSlug 分发
  const genType = slugToGenType(slug);
  let url = '';
  let body: Record<string, unknown> = {};

  switch (genType) {
    case 'product':
    case 'xiaohongshu':
    case 'aiphoto':
      // 所有图片生成类工具统一走 /api/images/generate，通过 tool_id 区分
      url = '/api/images/generate';
      body = { prompt, images, style, subtype, count, ratio, tool_id: slug };
      break;
    case 'removebg':
      // 抠图走 /api/images/process
      url = '/api/images/process';
      body = { images, operation: 'remove-background', subtype, tool_id: 'background-removal' };
      break;
    case 'detail':
      // 商品详情页也走图片生成，通过 tool_id 指定
      url = '/api/images/generate';
      body = { prompt, images, style, subtype: subtype || 'full', tool_id: 'product-page' };
      break;
    default:
      // 兜底：走图片生成
      url = '/api/images/generate';
      body = { prompt, images, style, subtype, count, ratio, tool_id: slug };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `生成失败 (${res.status})`);
  }

  // 检查是否是流式响应（LLM）
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
    const text = await res.text();
    if (text) {
      // 将文本内容包装为 GeneratedImage 格式（用 data URL）
      return [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(text)}` }];
    }
    return [];
  }

  // JSON 响应
  const data = await res.json();

  // 统一响应格式：{ success, imageUrls } 或 { content }
  if (data.success && data.imageUrls) {
    return data.imageUrls.map((u: string) => ({ url: u }));
  }
  if (data.success && data.content) {
    return [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(data.content)}` }];
  }
  if (data.content) {
    return [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(data.content)}` }];
  }
  // 兼容旧格式
  if (data.images) return data.images;
  if (data.data?.images) return data.data.images;
  if (data.data?.url) return [{ url: data.data.url }];
  if (data.data?.content) return [{ url: `data:text/plain;charset=utf-8,${encodeURIComponent(data.data.content)}` }];
  if (Array.isArray(data.data)) return data.data;

  return [];
}

// ===== 组件 =====
export default function CreateWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Context ---
  const CREATE_KEY = 'oneclaw_create_context';
  const parsedCtx = useRef<{
    shouldAuto?: boolean;
    fromHome?: boolean;
    matchedTool?: string;
    prompt?: string;
    images?: string[];
    analysisResult?: { tool?: string; style?: string; ratio?: string; count?: string; industry?: string; output_type?: string };
  } | null>(null);

  const getContext = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CREATE_KEY);
      if (!raw) return null;
      const ctx = JSON.parse(raw);
      // 只在 shouldAuto 尚未被消费时设置，防止多次调用覆盖为 false
      if (!parsedCtx.current?.shouldAuto) {
        parsedCtx.current = {
          shouldAuto: ctx.autoGenerate === true,
          fromHome: ctx.fromHome === true,
          matchedTool: ctx.matchedTool,
          prompt: ctx.prompt,
          images: ctx.uploadedImages?.map((i: Record<string, string>) => i.url || i).filter(Boolean),
          analysisResult: ctx.analysisResult,
        };
      }
      // 一次性消费：删除 sessionStorage 项，防止重复读取
      sessionStorage.removeItem(CREATE_KEY);
      return ctx;
    } catch { return null; }
  }, []);

  // --- State ---
  const [toolSlug, setToolSlug] = useState('product-generator');
  const [inputText, setInputText] = useState('');
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [count, setCount] = useState(4);
  const [ratio, setRatio] = useState('1:1');

  const [step, setStep] = useState<GenStep>('idle');
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  const autoGenTriggered = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 用 ref 保存最新生成参数，避免 useEffect 闭包捕获旧值 ---
  const genParamsRef = useRef({ toolSlug, inputText, uploads, selectedStyle, selectedSubtype, count, ratio });
  genParamsRef.current = { toolSlug, inputText, uploads, selectedStyle, selectedSubtype, count, ratio };

  // --- Config ---
  const config = getToolWorkflow(toolSlug);

  // --- Init ---
  useEffect(() => {
    getContext();
    // 从 parsedCtx（持久化，不受 Strict Mode 二次调用影响）或 URL 读取参数
    const savedCtx = parsedCtx.current;
    const urlSlug = searchParams.get('tool') || searchParams.get('type') || searchParams.get('toolId');
    const urlPrompt = searchParams.get('prompt');
    const urlStyle = searchParams.get('style');
    const urlRatio = searchParams.get('ratio');
    const slug = savedCtx?.matchedTool || urlSlug || 'product-generator';
    setToolSlug(slug);

    // Prompt 来源：parsedCtx > URL 参数
    const effectivePrompt = savedCtx?.prompt || urlPrompt || '';
    if (effectivePrompt) setInputText(effectivePrompt);
    if (savedCtx?.images?.length) {
      setUploads(savedCtx.images.map((url: string, i: number) => ({ id: `ctx-${i}`, url, name: `参考图${i + 1}` })));
    }

    const toolConf = getToolWorkflow(slug);
    if (toolConf) {
      // 从 analysisResult（首页推荐）或 URL 参数读取推荐参数，覆盖默认值
      const analysis = savedCtx?.analysisResult;
      const recStyle = urlStyle || analysis?.style;
      const recRatio = urlRatio || analysis?.ratio;
      const recCount = analysis?.count;

      // 匹配推荐 style 到 styleOptions
      let matchedStyle = toolConf.styleOptions.length > 0 ? toolConf.styleOptions[0].value : '';
      if (recStyle && toolConf.styleOptions.length > 0) {
        const found = toolConf.styleOptions.find(s =>
          s.value.toLowerCase() === recStyle.toLowerCase() ||
          s.label.toLowerCase() === recStyle.toLowerCase() ||
          s.label.includes(recStyle) ||
          recStyle.includes(s.label)
        );
        if (found) matchedStyle = found.value;
      }

      // 匹配推荐 ratio
      let matchedRatio = toolConf.defaultRatio;
      if (recRatio) {
        const r = recRatio.replace(/\s/g, '');
        const validRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
        if (validRatios.includes(r)) matchedRatio = r;
      }

      // 匹配推荐 count
      let matchedCount = toolConf.defaultCount;
      if (recCount) {
        const c = parseInt(recCount, 10);
        if (c > 0 && c <= 8) matchedCount = c;
      }

      setCount(matchedCount);
      setRatio(matchedRatio);
      if (matchedStyle) setSelectedStyle(matchedStyle);
      // 匹配推荐 subtype（行业分类）
      const recIndustry = analysis?.industry;
      if (recIndustry && toolConf.steps[1]?.options?.length) {
        const foundSub = toolConf.steps[1].options.find(o =>
          o.value.toLowerCase() === recIndustry.toLowerCase() ||
          o.label.toLowerCase() === recIndustry.toLowerCase() ||
          o.label.includes(recIndustry) ||
          recIndustry.includes(o.label)
        );
        if (foundSub) setSelectedSubtype(foundSub.value);
        else setSelectedSubtype(toolConf.steps[1].options[0].value);
      } else if (toolConf.steps[1]?.options?.length) {
        setSelectedSubtype(toolConf.steps[1].options[0].value);
      }
    }

    // 当 URL 带 prompt 参数时（来自灵感页面），标记自动生成
    if (urlPrompt && !parsedCtx.current) {
      parsedCtx.current = { shouldAuto: true, prompt: urlPrompt };
    } else if (urlPrompt && parsedCtx.current && !parsedCtx.current.shouldAuto) {
      parsedCtx.current.shouldAuto = true;
    }
  }, [searchParams, getContext]);

  // --- Auto generate ---
  useEffect(() => {
    if (autoGenTriggered.current) return;
    const should = parsedCtx.current?.shouldAuto || parsedCtx.current?.fromHome;
    if (should && (inputText || uploads.length > 0)) {
      autoGenTriggered.current = true;
      // 延迟执行，确保所有 state（toolSlug/style 等）都已提交
      const timer = setTimeout(() => {
        const p = genParamsRef.current;
        if (!p.inputText.trim() && p.uploads.length === 0) return;

        const images = p.uploads.map(u => u.url);
        setStep('understanding');
        setErrorMsg('');
        setResults([]);

        const stepAnim = async () => {
          const steps: GenStep[] = ['understanding', 'analyzing', 'matching'];
          for (const s of steps) {
            setStep(s);
            await new Promise(r => setTimeout(r, 700));
          }
        };

        (async () => {
          try {
            const [, res] = await Promise.all([
              stepAnim(),
              callGenerateAPI(p.toolSlug, p.inputText, images, p.selectedStyle, p.selectedSubtype, p.count, p.ratio),
            ]);
            setStep('generating');
            await new Promise(r => setTimeout(r, 500));
            setStep('optimizing');
            await new Promise(r => setTimeout(r, 600));
            setResults(res);
            setStep('done');
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : '生成失败，请重试');
            setStep('error');
          }
        })();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [inputText, uploads, toolSlug]);

  // --- Upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 5 - uploads.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setUploads(prev => [...prev, { id: `${Date.now()}-${file.name}`, url, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeUpload = (id: string) => setUploads(prev => prev.filter(u => u.id !== id));

  // --- Generate ---
  const handleGenerate = async () => {
    if (!inputText.trim() && uploads.length === 0) return;
    setErrorMsg('');
    setResults([]);
    autoGenTriggered.current = true;

    const images = uploads.map(u => u.url);

    // Run step animation and real API in parallel
    const stepAnim = async () => {
      const steps: GenStep[] = ['understanding', 'analyzing', 'matching'];
      for (const s of steps) {
        setStep(s);
        await new Promise(r => setTimeout(r, 700));
      }
    };

    try {
      // Start both step animation and API call simultaneously
      const [, res] = await Promise.all([
        stepAnim(),
        callGenerateAPI(toolSlug, inputText, images, selectedStyle, selectedSubtype, count, ratio),
      ]);
      setStep('generating');
      await new Promise(r => setTimeout(r, 500));
      setStep('optimizing');
      await new Promise(r => setTimeout(r, 600));
      setResults(res);
      setStep('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
    }
  };

  const handleRegenerate = () => handleGenerate();

  // --- Download ---
  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${config?.name || 'oneclaw'}-${idx + 1}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch { /* ignore */ }
  };

  // --- Tool switch ---
  const handleToolSwitch = (slug: string) => {
    setToolSlug(slug);
    const tc = getToolWorkflow(slug);
    if (tc) {
      setCount(tc.defaultCount);
      setRatio(tc.defaultRatio);
      if (tc.styleOptions.length > 0) setSelectedStyle(tc.styleOptions[0].value);
      else setSelectedStyle('');
      if (tc.steps[1]?.options?.length) setSelectedSubtype(tc.steps[1].options[0].value);
      else setSelectedSubtype('');
    }
    setStep('idle');
    setResults([]);
  };

  // --- Step progress ---
  const currentStepIdx = step === 'idle' ? -1 : step === 'error' ? STEP_ORDER.indexOf('generating') : STEP_ORDER.indexOf(step);

  // --- All tools for switcher ---
  const allTools = getAllToolWorkflows() as ToolWorkflowConfig[];

  // --- Render ---
  return (
    <div className="os-ws-page">
      {/* Header */}
      <div className="os-ws-header">
        <div className="os-ws-header-left">
          <span className="os-ws-tool-icon">{config?.icon || '✨'}</span>
          <div>
            <h1 className="os-ws-tool-name">{config?.name || 'AI创作'}</h1>
            <p className="os-ws-tool-desc">{config?.description || '上传图片或输入需求，AI自动生成'}</p>
          </div>
        </div>
        <div className="os-ws-header-right">
          <select
            value={toolSlug}
            onChange={e => handleToolSwitch(e.target.value)}
            className="os-ws-tool-select"
          >
            {allTools.map(t => (
              <option key={t.slug} value={t.slug}>{t.icon} {t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Body: 3-column */}
      <div className="os-ws-body">
        {/* ====== LEFT: Control Panel ====== */}
        <div className="os-ws-left">
          {/* Greeting */}
          <div className="os-ws-greeting">
            <Sparkles className="w-4 h-4 text-[#7B6DFF]" />
            <span>{config?.greeting || '你想生成什么？'}</span>
          </div>

          {/* Text Input */}
          <div className="os-ws-section">
            <label className="os-ws-label">描述你的需求</label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="描述你想生成的内容…"
              className="os-ws-textarea"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="os-ws-section">
            <label className="os-ws-label">
              <Upload className="w-3.5 h-3.5" /> 上传参考图
              {uploads.length > 0 && <span className="os-ws-count-badge">{uploads.length}/5</span>}
            </label>
            <div className="os-ws-upload-area">
              {uploads.map(u => (
                <div key={u.id} className="os-ws-upload-thumb">
                  <img src={u.url} alt={u.name} />
                  <button className="os-ws-upload-remove" onClick={() => removeUpload(u.id)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {uploads.length < 5 && (
                <button className="os-ws-upload-add" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="w-5 h-5" />
                  <span>添加图片</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Subtype Selection */}
          {config?.steps[1]?.options && config.steps[1].options.length > 0 && (
            <div className="os-ws-section">
              <label className="os-ws-label">{config.steps[1].label}</label>
              <div className="os-ws-chips">
                {config.steps[1].options.map(opt => (
                  <button
                    key={opt.value}
                    className={`os-ws-chip ${selectedSubtype === opt.value ? 'os-ws-chip-active' : ''}`}
                    onClick={() => setSelectedSubtype(opt.value)}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Style Tags */}
          {config?.styleOptions && config.styleOptions.length > 0 && (
            <div className="os-ws-section">
              <label className="os-ws-label">风格选择</label>
              <div className="os-ws-chips">
                {config.styleOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`os-ws-chip ${selectedStyle === opt.value ? 'os-ws-chip-active' : ''}`}
                    onClick={() => setSelectedStyle(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Count & Ratio */}
          <div className="os-ws-section os-ws-row">
            <div className="os-ws-field">
              <label className="os-ws-label">数量</label>
              <div className="os-ws-number">
                <button onClick={() => setCount(Math.max(1, count - 1))}>-</button>
                <span>{count}</span>
                <button onClick={() => setCount(Math.min(8, count + 1))}>+</button>
              </div>
            </div>
            <div className="os-ws-field">
              <label className="os-ws-label">比例</label>
              <select value={ratio} onChange={e => setRatio(e.target.value)} className="os-ws-ratio-select">
                <option value="1:1">1:1</option>
                <option value="3:4">3:4</option>
                <option value="4:5">4:5</option>
                <option value="16:9">16:9</option>
                <option value="2:3">2:3</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="os-ws-gen-btn"
            onClick={handleGenerate}
            disabled={step !== 'idle' && step !== 'done' && step !== 'error'}
          >
            {step === 'idle' || step === 'done' || step === 'error' ? (
              <>
                <Wand2 className="w-4 h-4" />
                {step === 'done' ? '重新生成' : step === 'error' ? '重新生成' : '开始创作'}
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {STEP_LABELS[step]}
              </>
            )}
          </button>
        </div>

        {/* ====== CENTER: Step Progress + Results ====== */}
        <div className="os-ws-center">
          {/* Step Progress Bar */}
          {step !== 'idle' && (
            <div className="os-ws-steps">
              {STEP_ORDER.map((s, i) => {
                const isActive = i === currentStepIdx;
                const isDone = i < currentStepIdx;
                const isPending = i > currentStepIdx;
                return (
                  <div key={s} className="os-ws-step-item">
                    <div className={`os-ws-step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                      {isDone ? <Check className="w-3 h-3" /> : isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>{i + 1}</span>}
                    </div>
                    <span className={`os-ws-step-label ${isActive ? 'active' : isDone ? 'done' : 'pending'}`}>
                      {STEP_LABELS[s]}
                    </span>
                    {i < STEP_ORDER.length - 1 && (
                      <div className={`os-ws-step-line ${isDone ? 'done' : isActive ? 'active' : 'pending'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Area */}
          <div className="os-ws-results">
            {step === 'idle' && results.length === 0 && (
              <div className="os-ws-idle">
                <div className="os-ws-idle-icon">
                  <ImageIcon className="w-10 h-10 text-slate-300" />
                </div>
                <p className="os-ws-idle-text">在左侧输入需求，AI将为你生成内容</p>
                {config?.cases && config.cases.length > 0 && (
                  <div className="os-ws-idle-cases">
                    {config.cases.map((c, i) => (
                      <div key={i} className="os-ws-idle-case">
                        <div className="os-ws-idle-case-img">
                          <ImageIcon className="w-8 h-8 text-slate-200" />
                        </div>
                        <div className="os-ws-idle-case-info">
                          <span className="os-ws-idle-case-title">{c.title}</span>
                          <span className="os-ws-idle-case-desc">{c.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step !== 'idle' && step !== 'done' && step !== 'error' && results.length === 0 && (
              <div className="os-ws-generating">
                <div className="os-ws-gen-spinner" />
                <p className="os-ws-gen-text">{STEP_LABELS[step]}…</p>
              </div>
            )}

            {step === 'error' && (
              <div className="os-ws-error">
                <p>{errorMsg}</p>
                <button className="os-ws-error-btn" onClick={handleRegenerate}>
                  <RotateCcw className="w-4 h-4" /> 重新生成
                </button>
              </div>
            )}

            {(step === 'done' || results.length > 0) && (
              <div className="os-ws-done">
                <div className="os-ws-grid">
                  {results.map((img, i) => (
                    <div key={i} className="os-ws-result-card" onClick={() => setLightboxIdx(i)}>
                      <img src={img.url} alt={`结果 ${i + 1}`} />
                      <div className="os-ws-result-overlay">
                        <button onClick={e => { e.stopPropagation(); handleDownload(img.url, i); }}>
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}>
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="os-ws-done-actions">
                  <button className="os-ws-done-btn" onClick={handleRegenerate}>
                    <RotateCcw className="w-4 h-4" /> 重新生成
                  </button>
                  <button className="os-ws-done-btn secondary" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="w-4 h-4" /> 添加参考图
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====== RIGHT: Inspiration ====== */}
        <div className="os-ws-right">
          <div className="os-ws-right-title">
            <Lightbulb className="w-4 h-4 text-[#7B6DFF]" />
            灵感参考
          </div>

          {/* Cases from config */}
          {config?.cases && config.cases.length > 0 && (
            <div className="os-ws-inspire-cases">
              {config.cases.map((c, i) => (
                <div key={i} className="os-ws-inspire-card">
                  <div className="os-ws-inspire-img">
                    <ImageIcon className="w-6 h-6 text-slate-200" />
                  </div>
                  <div className="os-ws-inspire-info">
                    <span className="os-ws-inspire-title">{c.title}</span>
                    <span className="os-ws-inspire-desc">{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Style suggestions */}
          {config?.styleOptions && config.styleOptions.length > 0 && (
            <div className="os-ws-right-section">
              <span className="os-ws-right-label">推荐风格</span>
              <div className="os-ws-inspire-tags">
                {config.styleOptions.map(s => (
                  <button
                    key={s.value}
                    className={`os-ws-inspire-tag ${selectedStyle === s.value ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick subtype suggestions */}
          {config?.steps[1]?.options && (
            <div className="os-ws-right-section">
              <span className="os-ws-right-label">快速类型</span>
              <div className="os-ws-inspire-tags">
                {config.steps[1].options.map(o => (
                  <button
                    key={o.value}
                    className={`os-ws-inspire-tag ${selectedSubtype === o.value ? 'active' : ''}`}
                    onClick={() => setSelectedSubtype(o.value)}
                  >
                    {o.icon && <span className="mr-1">{o.icon}</span>}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== Lightbox ====== */}
      {lightboxIdx >= 0 && results[lightboxIdx] && (
        <div className="os-ws-lightbox" onClick={() => setLightboxIdx(-1)}>
          <button className="os-ws-lightbox-close" onClick={() => setLightboxIdx(-1)}>
            <X className="w-6 h-6" />
          </button>
          <img src={results[lightboxIdx].url} alt="预览" onClick={e => e.stopPropagation()} />
          <div className="os-ws-lightbox-thumbs" onClick={e => e.stopPropagation()}>
            {results.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`缩略图 ${i + 1}`}
                className={`os-ws-lightbox-thumb ${i === lightboxIdx ? 'active' : ''}`}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
