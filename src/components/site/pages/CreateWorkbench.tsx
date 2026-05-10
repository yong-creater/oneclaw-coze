'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Upload, X,
  Download, RotateCcw, ZoomIn, Loader2, Check,
  ArrowRight, ImageIcon, Menu, BookmarkPlus, BookmarkCheck,
  History, BookOpen, Wand2,
  Package, BookImage, Camera
} from 'lucide-react';
import { getToolWorkflow, getAllToolWorkflows, slugToGenType, type ToolWorkflowConfig } from '@/lib/tool-workflow-config';
import { useUser } from '@/contexts/UserContext';

// ===== 类型 =====
interface GeneratedImage { url: string; }
interface UploadItem { id: string; url: string; name: string; }

type GenStep = 'idle' | 'creating' | 'generating' | 'done' | 'error';

const STEP_LABELS: Record<GenStep, string> = {
  idle: '等待开始',
  creating: '创建任务',
  generating: '生成中',
  done: '完成',
  error: '生成失败',
};

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

// ===== fetch 超时工具 =====
function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const { signal: externalSignal, timeout: _t, ...rest } = options;
  // 如果外部也传了 signal，需要同时监听
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...rest, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ===== 工具主题色（统一 OneClaw 品牌紫蓝渐变） =====
const TOOL_ACCENT: Record<string, string> = {
  'product-generator': '#7B61FF',
  'xiaohongshu-generator': '#7B61FF',
  'ai-photo': '#7B61FF',
};

// ===== 工具 Lucide 图标映射 =====
const TOOL_LUCIDE_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'product-generator': Package,
  'xiaohongshu-generator': BookImage,
  'ai-photo': Camera,
};

// ===== 工具标题和描述（弱化后台感） =====
const TOOL_HEADER: Record<string, { title: string; desc: string }> = {
  'product-generator': { title: 'AI 商品图生成器', desc: '生成高质感电商视觉图' },
  'xiaohongshu-generator': { title: '小红书封面生成器', desc: '一键生成爆款封面' },
  'ai-photo': { title: 'AI 写真生成器', desc: '生成氛围感写真大片' },
};

// ===== 工具布局 ===== (CSS class suffix for canvas image sizing)
// ===== 生成中动态文案（会根据参数动态生成） =====
function buildLoadingMessages(count: number, ratio: string, styleName: string, subtypeName: string): string[] {
  const countStr = count > 1 ? `${count} 张` : '';
  const ratioStr = ratio;
  const styleStr = styleName || '';
  const typeStr = subtypeName || '';
  return [
    `正在生成 ${countStr} ${ratioStr} ${styleStr} ${typeStr}结果`.replace(/\s+/g, ' ').trim(),
    `正在理解你的创意`,
    `AI 正在构建视觉细节`,
    `正在优化${styleStr}光影与构图`.replace(/\s+/g, ' ').trim(),
    `正在生成高质量画面`,
  ];
}

// ===== Shimmer 尺寸映射（宽 x 高） =====
const TOOL_SHIMMER: Record<string, { w: number; h: number }> = {
  'product-generator': { w: 380, h: 300 },
  'xiaohongshu-generator': { w: 260, h: 380 },
  'ai-photo': { w: 300, h: 400 },
};

// ===== 生成步骤顺序 =====
const STEP_ORDER: GenStep[] = ['idle', 'creating', 'generating', 'done', 'error'];

// ===== 子类型结果标题 =====
const SUBTYPE_RESULT_LABEL: Record<string, Record<string, string>> = {
  'product-generator': {
    'white-bg': '白底主图结果',
    'scene': '场景图结果',
    'detail': '细节展示结果',
    'combo': '组合搭配结果',
  },
  'xiaohongshu-generator': {
    'cover': '封面图结果',
    'carousel': '轮播图结果',
    'guide': '教程图结果',
  },
  'ai-photo': {
    'portrait': '人像写真结果',
    'half-body': '半身写真结果',
    'full-body': '全身写真结果',
    'creative': '创意写真结果',
  },
};

// ===== 风格显示名 =====
function styleLabel(config: ToolWorkflowConfig, value: string): string {
  const opt = config.styleOptions?.find(s => s.value === value);
  return opt?.label || value;
}

// ===== 比例 → aspect-ratio CSS =====
function ratioToAspect(ratio: string): string {
  const map: Record<string, string> = {
    '1:1': '1 / 1',
    '3:4': '3 / 4',
    '4:5': '4 / 5',
    '4:3': '4 / 3',
    '2:3': '2 / 3',
    '16:9': '16 / 9',
    '9:16': '9 / 16',
  };
  return map[ratio] || '1 / 1';
}

export default function CreateWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, setShowLoginModal, requireAuth, dailyQuota, refreshQuota } = useUser();

  // ----- 工具 -----
  const allTools = getAllToolWorkflows();
  const [toolSlug, setToolSlug] = useState('product-generator');
  const rawConfig = getToolWorkflow(toolSlug);
  const config = rawConfig ?? {
    slug: toolSlug, name: toolSlug, icon: '🛠️', description: '',
    greeting: '', steps: [], cases: [],
    defaultRatio: '1:1', defaultCount: 4, styleOptions: [],
  };
  const accent = TOOL_ACCENT[toolSlug] || '#7B61FF';

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

  // ----- 选中图片 -----
  const [selectedIdx, setSelectedIdx] = useState(0);

  // ----- 移动端侧栏 -----
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ----- 加载中文案轮播 -----
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // ----- 任务系统 -----
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ----- Refs -----
  const parsedCtx = useRef<{
    shouldAuto?: boolean;
    prompt?: string;
    toolSlug?: string;
    images?: UploadItem[];
    analysisResult?: { tool?: string; style?: string; ratio?: string; count?: string; industry?: string; output_type?: string; layoutMode?: 'single-product' | 'multi-angle' };
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
    const urlCount = searchParams.get('count');

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
    const recCount = urlCount || analysis?.count;

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
  const subtypeLabel = config.subtypeOptions?.find(s => s.value === selectedSubtype)?.label || '';
  const sLabel = styleLabel(config, selectedStyle);
  const loadingMessages = buildLoadingMessages(count, ratio, sLabel, subtypeLabel);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingMsgIdx(0);
      return;
    }
    const iv = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
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
  // ===== 任务轮询 =====
  const pollTask = useCallback(async (taskId: string) => {
    // 每次 poll 创建新的 AbortController，组件卸载时统一取消
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const { signal } = ac;

    try {
      const res = await fetchWithTimeout(`/api/tasks/${taskId}`, { credentials: 'include', signal }, 10000);
      const data = await res.json();
      if (!data.success) {
        setStep('error');
        setErrorMsg(data.error || '任务查询失败');
        return;
      }
      const task = data.task;
      switch (task.status) {
        case 'pending':
          setStep('creating');
          break;
        case 'generating':
          setStep('generating');
          break;
        case 'completed': {
          const urls = (task.result_images || []).map((img: { url: string }) => img.url);
          if (urls.length > 0) {
            setImages(urls.map((url: string) => ({ url })));
            setSelectedIdx(0);
          }
          setStep('done');
          // 刷新每日配额
          refreshQuota();
          // Auto-save to user_generations
          if (authenticated && urls.length > 0) {
            try {
              await fetchWithTimeout('/api/generations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tool_id: toolSlug,
                  tool_name: config?.name || toolSlug,
                  tool_type: slugToGenType(toolSlug),
                  title: inputText.slice(0, 50) || config?.name || 'AI生成作品',
                  thumbnail: urls[0],
                  input_params: { prompt: inputText, style: selectedStyle, subtype: selectedSubtype, ratio, count },
                  output_content: { image_urls: urls },
                }),
                credentials: 'include',
                signal,
              }, 10000);
              setSaved(true);
            } catch { /* auto-save failure is non-critical */ }
          }
          return; // Stop polling
        }
        case 'failed':
          setStep('error');
          setErrorMsg(task.error_message || '生成失败，请重试');
          return; // Stop polling
      }
      // Continue polling
      pollTimerRef.current = window.setTimeout(() => pollTask(taskId), 2000);
    } catch (err: unknown) {
      // AbortError means component unmounted — don't update state
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setStep('error');
      setErrorMsg('网络错误，请重试');
    }
  }, [authenticated, config?.name, inputText, ratio, selectedStyle, selectedSubtype, count, toolSlug]);

  // 清理轮询和 pending 请求（防止导航卡死）
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // URL中有taskId时恢复任务状态
  // ===== 刷新恢复 =====
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tid = urlParams.get('taskId');
    if (tid && !currentTaskId && step === 'idle') {
      setCurrentTaskId(tid);
      const ac = new AbortController();
      abortRef.current = ac;
      fetch(`/api/tasks/${tid}`, { signal: ac.signal })
        .then(r => r.json())
        .then(data => {
          const task = data.task;
          if (!task) return;
          if (task.status === 'generating') {
            setStep('generating');
            pollTask(tid);
          } else if (task.status === 'completed') {
            setStep('done');
            setImages((task.result_images || []).map((img: { url: string }, i: number) => ({ id: `${i}`, url: img.url })));
          } else if (task.status === 'failed') {
            setStep('error');
            setErrorMsg(task.error_message || '生成失败');
          } else if (task.status === 'pending') {
            setStep('creating');
            pollTask(tid);
          }
        })
        .catch(() => {});
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [searchParams, currentTaskId, step, setImages, setStep, setErrorMsg]);

  // ===== 任务驱动生成 =====
  const handleGenerate = async () => {
    const p = genParamsRef.current;
    if (!p.inputText && p.uploads.length === 0) return;
    if (step === 'creating' || step === 'generating') return; // 防重复点击

    // 登录拦截：未登录时弹出登录弹窗，登录后继续执行
    if (!requireAuth(handleGenerate)) return;

    // 每日免费次数检查
    if (dailyQuota !== null && dailyQuota <= 0) {
      setErrorMsg('今日免费生成次数已用完，明天再来吧！');
      return;
    }

    setStep('creating');
    setImages([]);
    setSaved(false);
    setErrorMsg('');

    // 取消之前的 pending 请求
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const { signal } = ac;

    try {
      // 1. 创建任务
      const layoutMode = parsedCtx.current.analysisResult?.layoutMode || 'single-product';
      const createBody: Record<string, unknown> = {
        prompt: p.inputText,
        toolType: p.toolSlug,
        style: p.selectedStyle,
        ratio: p.ratio,
        count: p.count,
        generationType: p.selectedSubtype,
        layoutMode,
      };
      if (p.uploads.length > 0) createBody.uploadedImages = p.uploads.map(u => u.url);

      const createRes = await fetchWithTimeout('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody),
        credentials: 'include',
        signal,
      }, 15000);
      const createData = await createRes.json();

      if (!createData.success) {
        setStep('error');
        setErrorMsg(createData.error || '任务创建失败');
        return;
      }

      const taskId = createData.task.task_id || createData.task.taskId;
      setCurrentTaskId(taskId);

      // Update URL with taskId (no page reload)
      const url = new URL(window.location.href);
      url.searchParams.set('taskId', taskId);
      window.history.replaceState({}, '', url.toString());

      setStep('generating');

      // 2. 执行任务（异步，不等待完成，带超时避免挂起）
      fetchWithTimeout(`/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal,
      }, 30000).catch(() => { /* execute runs server-side */ });

      // 3. 开始轮询
      pollTask(taskId);
    } catch (err: unknown) {
      // AbortError means component unmounted — don't update state
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setStep('error');
      setErrorMsg('网络错误，请重试');
    }
  };

  // ===== 下载 =====
  const handleDownload = async (url: string, idx: number) => {
    // 登录拦截
    if (!requireAuth(() => handleDownload(url, idx))) return;
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
    // 登录拦截
    if (!requireAuth(handleSave)) return;
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
      const res = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
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
          </div>

          {/* 生成按钮 — sticky bottom */}
          <div className="os-ws-generate-wrap">
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
                style={{ width: shimmerSize.w, height: shimmerSize.h, aspectRatio: ratioToAspect(ratio) }}
              >
                <div className="os-ws-canvas-shimmer-icon">
                  <Sparkles />
                </div>
              </div>
              <div className="os-ws-canvas-loading-text">
                <div className="os-ws-canvas-loading-label" key={loadingMsgIdx}>
                  {loadingMessages[loadingMsgIdx]}
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

          {/* 生成结果 — 主预览 + 缩略图 */}
          {step === 'done' && images.length > 0 && (
            <div className="os-ws-canvas-result">
              {/* 结果标题栏 */}
              <div className="os-ws-result-header">
                <span className="os-ws-result-title">
                  {SUBTYPE_RESULT_LABEL[toolSlug]?.[selectedSubtype] || `${config.name}结果`}
                </span>
                <span className="os-ws-result-count">共 {images.length} 张</span>
              </div>

              {/* 主预览区 */}
              <div className="os-ws-result-main" style={{ aspectRatio: ratioToAspect(ratio) }}>
                <img
                  src={images[selectedIdx].url}
                  alt={`生成结果 ${selectedIdx + 1}`}
                  onClick={() => setLightboxIdx(selectedIdx)}
                  className="os-ws-result-main-img"
                />
              </div>

              {/* 缩略图列表（多图时） */}
              {images.length > 1 && (
                <div className="os-ws-result-thumbs">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`os-ws-result-thumb ${idx === selectedIdx ? 'active' : ''}`}
                      style={{ aspectRatio: ratioToAspect(ratio) }}
                      onClick={() => setSelectedIdx(idx)}
                    >
                      <img src={img.url} alt={`缩略图 ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}

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
                <button
                  className="os-ws-capsule-btn os-ws-capsule-btn--download"
                  onClick={() => handleDownload(images[selectedIdx].url, selectedIdx)}
                >
                  <Download /> 下载当前图
                </button>
                {images.length > 1 && (
                  <button
                    className="os-ws-capsule-btn os-ws-capsule-btn--download"
                    onClick={() => images.forEach((img, i) => handleDownload(img.url, i))}
                  >
                    <Download /> 下载全部
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
