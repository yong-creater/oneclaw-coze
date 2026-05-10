'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wand2,
  ArrowRight,
  ImagePlus,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

// ===== 布局模式识别（模块级，供 createTaskAndNavigate 和组件内部共用） =====
const LAYOUT_KEYWORDS = [
  '多角度', '多视角', '展示多个角度', '四宫格', '拼图',
  '组合展示', '多面展示', '全方位展示', '360度展示',
  '多角度展示', '多视角展示', '组合图', '九宫格',
];

function parseLayoutMode(input: string): 'single-product' | 'multi-angle' {
  const lower = input.toLowerCase();
  for (const kw of LAYOUT_KEYWORDS) {
    if (lower.includes(kw)) return 'multi-angle';
  }
  return 'single-product';
}

function stripLayoutKeywords(input: string): string {
  let cleaned = input;
  for (const kw of LAYOUT_KEYWORDS) {
    cleaned = cleaned.replace(new RegExp(`[，,]?\\s*${kw}\\s*[，,]?`, 'g'), '');
  }
  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/[，,]\s*[，,]/g, ',').replace(/^\s*[，,]\s*/, '').replace(/\s*[，,]\s*$/, '').trim();
  return cleaned;
}

// ===== 导航到创作页 =====
const CREATE_CONTEXT_KEY = 'oneclaw_create_context';

// 工具 slug → 页面路由映射
const TOOL_ROUTE_MAP: Record<string, string> = {
  'product-generator': '/create',
  'xiaohongshu-generator': '/create',
  'ai-photo': '/create',
};

async function createTaskAndNavigate(
  router: ReturnType<typeof useRouter>,
  opts: {
    prompt?: string;
    uploadedImages?: string[];
    matchedTool?: string;
    type?: string;
    autoGenerate?: boolean;
    analysisResult?: { tool: string; style: string; ratio: string; count: string; layoutMode?: 'single-product' | 'multi-angle' };
  }
): Promise<string | null> {
  // 布局模式识别：从 prompt 中剥离布局关键词
  const layoutMode = opts.analysisResult?.layoutMode || 'single-product';
  const cleanedPrompt = stripLayoutKeywords(opts.prompt || '');

  // 1. 写入 sessionStorage 作为备用（图片等大数据）
  const context: Record<string, unknown> = {};
  if (cleanedPrompt) context.prompt = cleanedPrompt;
  if (opts.uploadedImages && opts.uploadedImages.length > 0) {
    context.images = opts.uploadedImages.map((url, i) => ({
      id: `upload-${Date.now()}-${i}`,
      url,
      name: `参考图${i + 1}`,
    }));
  }
  if (opts.matchedTool) context.toolSlug = opts.matchedTool;
  if (opts.autoGenerate) context.autoGenerate = true;
  if (opts.analysisResult) {
    context.analysisResult = { ...opts.analysisResult, layoutMode };
  }
  try {
    sessionStorage.setItem(CREATE_CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    console.warn('sessionStorage write failed:', e);
  }

  // 2. 调用 createTask API 创建任务
  try {
    const taskRes = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: cleanedPrompt || '',
        uploadedImages: opts.uploadedImages || [],
        toolType: opts.matchedTool || 'product-generator',
        generationType: opts.type || opts.matchedTool || 'product-generator',
        style: opts.analysisResult?.style || '',
        ratio: opts.analysisResult?.ratio || '1:1',
        count: parseInt(opts.analysisResult?.count || '4', 10),
        layoutMode,
      }),
    });

    if (!taskRes.ok) {
      const errData = await taskRes.json().catch(() => ({}));
      // 如果是并发限制错误，返回错误信息
      if (taskRes.status === 429 && errData.error?.includes('正在生成')) {
        return errData.error;
      }
      throw new Error(errData.error || '创建任务失败');
    }

    const taskData = await taskRes.json();
    const taskId = taskData.task?.task_id || taskData.taskId;

    if (!taskId) throw new Error('未获取到任务ID');

    // 3. 跳转到工具页，携带 taskId
    const targetRoute = (opts.matchedTool && TOOL_ROUTE_MAP[opts.matchedTool]) || '/create';
    const params = new URLSearchParams();
    params.set('taskId', taskId);
    if (opts.matchedTool) params.set('tool', opts.matchedTool);
    router.push(`${targetRoute}?${params.toString()}`);

    return null; // 成功
  } catch (err) {
    // createTask 失败时降级为旧模式（不带 taskId）
    console.warn('createTask failed, falling back to legacy mode:', err);
    const targetRoute = (opts.matchedTool && TOOL_ROUTE_MAP[opts.matchedTool]) || '/create';
    const params = new URLSearchParams();
    if (opts.prompt) params.set('prompt', opts.prompt);
    if (opts.matchedTool) params.set('tool', opts.matchedTool);
    if (opts.autoGenerate) params.set('auto', '1');
    if (opts.analysisResult) {
      params.set('style', opts.analysisResult.style);
      params.set('ratio', opts.analysisResult.ratio);
      params.set('count', opts.analysisResult.count);
    }
    router.push(`${targetRoute}?${params.toString()}`);
    return null;
  }
}

// ===== 工具匹配 =====
interface ToolMatch {
  slug: string;
  name: string;
  icon: string;
  keywords: string[];
}

const TOOL_MATCHES: ToolMatch[] = [
  { slug: 'product-generator', name: 'AI商品图生成器', icon: '🛍', keywords: ['商品', '产品', '主图', '白底', '电商', '带货', '宝贝', 'listing'] },
  { slug: 'xiaohongshu-generator', name: '小红书封面生成器', icon: '📕', keywords: ['小红书', '封面', '种草', '笔记', '穿搭', '护肤', '美妆', '封面图'] },
  { slug: 'ai-photo', name: 'AI写真工坊', icon: '📸', keywords: ['写真', '人像', '头像', '照片', '肖像', '氛围', '风格'] },
];



// ===== AI 需求识别状态 =====
type IdentifyPhase = 'idle' | 'identifying' | 'no-match';

// ===== 试试这些创作 =====
const tryChips = [
  { label: '商品主图', prompt: '帮我生成高级感耳机商品图，白底高级感，多角度展示' },
  { label: '小红书封面', prompt: '生成小红书护肤封面，夏日清新风格' },
  { label: 'AI写真', prompt: '生成高级感AI写真头像，氛围感大片' },
];

// ===== Placeholder 轮播文案 =====
const placeholderTexts = [
  '生成高级感耳机商品图',
  '生成小红书护肤封面',
  '生成 AI 写真头像',
  '生成白底商品主图',
  '生成高级时尚大片',
  '生成穿搭种草封面图',
];

// ===== 右侧案例展示 =====
const showcaseExamples = [
  {
    title: '商品主图',
    category: '商品图',
    image: '/case-lipstick-main.png',
    generating: '夏日护肤封面',
  },
  {
    title: '小红书封面',
    category: '小红书',
    image: '/demo-card-lifestyle.jpg',
    generating: '高级感耳机主图',
  },
  {
    title: 'AI写真',
    category: 'AI写真',
    image: '/demo-scene.jpg',
    generating: '小红书穿搭大片',
  },
  {
    title: '商品场景图',
    category: '商品图',
    image: '/case-ecommerce.jpg',
    generating: '高级氛围感写真',
  },
];

// ===== 热门案例 =====
const hotResults = [
  {
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=750&fit=crop&auto=format&q=80',
    type: '商品图',
    title: '高级护肤品主图',
    examplePrompt: '帮我生成高级护肤品商品图，白底高级感',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop&auto=format&q=80',
    type: '小红书',
    title: '夏日穿搭种草图',
    examplePrompt: '生成小红书穿搭种草图，清新文艺风格',
  },
  {
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=750&fit=crop&auto=format&q=80',
    type: 'AI写真',
    title: '氛围感写真大片',
    examplePrompt: '生成高级氛围感写真，柔和光影',
  },
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop&auto=format&q=80',
    type: '商品图',
    title: '数码产品主图',
    examplePrompt: '生成数码产品商品主图，深色科技风',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=750&fit=crop&auto=format&q=80',
    type: '商品图',
    title: '极简手表商品图',
    examplePrompt: '生成极简手表商品主图，高级质感',
  },
  {
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=750&fit=crop&auto=format&q=80',
    type: 'AI写真',
    title: '时尚杂志大片',
    examplePrompt: '生成时尚杂志风格写真，杂志封面质感',
  },
];

const MAX_UPLOAD_IMAGES = 5;

// ===== 工具匹配算法 =====
function matchTool(input: string): ToolMatch | null {
  const lower = input.toLowerCase();
  let bestMatch: ToolMatch | null = null;
  let bestScore = 0;
  for (const tool of TOOL_MATCHES) {
    let score = 0;
    for (const kw of tool.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) { bestScore = score; bestMatch = tool; }
  }
  return bestMatch;
}

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const { requireAuth, dailyQuota } = useUser();
  const { showAlert } = useModal();
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<IdentifyPhase>('idle');
  const phaseRef = useRef<IdentifyPhase>('idle');
  const [isJumping, setIsJumping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseFading, setShowcaseFading] = useState(false);

  const identifyMessage = '正在准备创作环境…';

  interface StyleRecommendation { style: string; ratio: string; count: string; layoutMode: 'single-product' | 'multi-angle'; }
  function getStyleRecommendation(tool: ToolMatch | null, input: string): StyleRecommendation {
    if (!tool) return { style: 'premium', ratio: '3:4', count: '4', layoutMode: 'single-product' };
    const lower = input.toLowerCase();
    const layoutMode = parseLayoutMode(input);
    const map: Record<string, StyleRecommendation> = {
      'product-generator': { style: 'premium', ratio: '1:1', count: layoutMode === 'multi-angle' ? '1' : '4', layoutMode },
      'xiaohongshu-generator': { style: 'fresh', ratio: '3:4', count: layoutMode === 'multi-angle' ? '1' : '4', layoutMode },
      'ai-photo': { style: 'luxury', ratio: '3:4', count: layoutMode === 'multi-angle' ? '1' : '6', layoutMode },
    };
    const rec = map[tool.slug] ? { ...map[tool.slug] } : { style: 'premium', ratio: '3:4', count: '4', layoutMode };
    if (lower.includes('深色') || lower.includes('暗黑') || lower.includes('科技')) rec.style = 'tech';
    if (lower.includes('清新') || lower.includes('夏日') || lower.includes('文艺')) rec.style = 'fresh';
    if (lower.includes('极简') || lower.includes('简约')) rec.style = 'minimal';
    if (lower.includes('高级') || lower.includes('质感') || lower.includes('大片')) rec.style = 'premium';
    if (lower.includes('可爱') || lower.includes('甜美')) rec.style = 'cute';
    if (lower.includes('复古') || lower.includes('胶片')) rec.style = 'retro-film';
    if (lower.includes('韩系') || lower.includes('韩风')) rec.style = 'korean-fresh';
    if (lower.includes('节日') || lower.includes('圣诞')) rec.style = 'festive';
    if (lower.includes('生活') || lower.includes('场景')) rec.style = 'lifestyle';
    if (lower.includes('海报') || lower.includes('封面')) { rec.ratio = '3:4'; rec.count = '3'; }
    return rec;
  }

  useEffect(() => {
    if (inputText.trim()) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [inputText]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseFading(true);
      setTimeout(() => {
        setShowcaseIndex((prev) => (prev + 1) % showcaseExamples.length);
        setShowcaseFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingInput) { setInputText(pendingInput); consumePendingInput(); }
  }, [pendingInput, consumePendingInput]);

  const addImageFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    const remaining = MAX_UPLOAD_IMAGES - uploadedImages.length;
    const toProcess = fileArray.slice(0, remaining);
    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages(prev => {
          if (prev.length >= MAX_UPLOAD_IMAGES) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
  }, [uploadedImages.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    if (e.dataTransfer.files?.length) addImageFiles(e.dataTransfer.files);
  }, [addImageFiles]);

  // 实际执行创作流程（登录后可能被回调）
  const doStartCreate = useCallback(() => {
    if (!inputText.trim() || phase !== 'idle') return;
    // 每日免费次数检查（-2=无限制跳过，-1=未登录不阻止，null=加载中不阻止）
    if (dailyQuota !== null && dailyQuota !== -2 && dailyQuota !== -1 && dailyQuota <= 0) {
      showAlert('今日免费额度已用完', '注册登录后可继续生成作品，并同步保存你的创作记录。', 'quota-exhausted');
      requireAuth();
      return;
    }
    phaseRef.current = 'identifying'; setPhase('identifying');
    // 轻量过渡：1.2秒后创建任务并跳转工具页
    const navTimer = setTimeout(async () => {
      let tool = matchTool(inputText);
      // 未匹配到工具时，默认使用 AI 商品图生成器
      if (!tool) tool = TOOL_MATCHES[0];
      setIsJumping(true);
      const rec = getStyleRecommendation(tool, inputText);
      const cleanedPrompt = stripLayoutKeywords(inputText.trim());
      const err = await createTaskAndNavigate(router, {
        prompt: cleanedPrompt, uploadedImages, matchedTool: tool.slug,
        autoGenerate: true,
        analysisResult: { tool: tool.slug, style: rec.style, ratio: rec.ratio, count: rec.count, layoutMode: rec.layoutMode },
      });
      if (err) {
        // 并发限制等错误，回退到 idle
        phaseRef.current = 'idle'; setPhase('idle');
        setIsJumping(false);
        showAlert('跳转失败', String(err));
      }
    }, 1200);
    // 兜底：4秒后若仍在 identifying 阶段，强制跳转
    setTimeout(() => {
      if (phaseRef.current === 'identifying') {
        router.push('/create?tool=product-generator');
      }
    }, 4000);
  }, [inputText, uploadedImages, phase, router, dailyQuota]);

  // 登录拦截 + 创作入口
  const handleStartCreate = useCallback(() => {
    if (!inputText.trim() || phase !== 'idle') return;
    if (!requireAuth(doStartCreate)) return;
    doStartCreate();
  }, [doStartCreate, inputText, phase, requireAuth]);

  const handleBrowseTools = useCallback(() => { router.push('/tools'); }, [router]);

  const resetIdentify = useCallback(() => {
    phaseRef.current = 'idle'; setPhase('idle'); setIsJumping(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleStartCreate(); }
  }, [handleStartCreate]);

  const handleChipClick = useCallback((prompt: string) => { setInputText(prompt); resetIdentify(); }, [resetIdentify]);
  const handleUploadClick = useCallback(() => { fileInputRef.current?.click(); }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addImageFiles(e.target.files);
    e.target.value = '';
  }, [addImageFiles]);
  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);
  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  const currentShowcase = showcaseExamples[showcaseIndex];

  // Carousel scroll
  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 280;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区 — 左右分栏 ==================== */}
      <div className="os-hero">
        <div className="os-hero-noise" />
        <div className="os-hero-inner">

          {/* ===== 左侧内容区 ===== */}
          <div className="os-hero-left">
            <h1 className="os-hero-left-title">
              上传图片<br />一键生成<span className="gradient-text">高质量内容</span>
            </h1>
            <p className="os-hero-left-subtitle">
              商品图、小红书、AI写真等内容，简单输入需求即可生成。
            </p>

            {/* 输入区 */}
            <div className="os-hero-input-area">
              {!inputText && <span className="os-studio-ai-hint">描述你想生成的内容…</span>}
              <div className="os-studio-textarea-wrap">
                {!inputText && (
                  <div
                    className={`os-studio-placeholder ${placeholderVisible ? 'os-studio-placeholder-visible' : 'os-studio-placeholder-hidden'}`}
                    onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}
                  >
                    <p className="os-studio-placeholder-example">{placeholderTexts[placeholderIndex]}</p>
                  </div>
                )}
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value.slice(0, 500)); if (phase !== 'idle') resetIdentify(); }}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className="os-studio-textarea os-hero-textarea"
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="os-upload-previews">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="os-upload-preview-item">
                      <img src={img} alt={`参考图${idx + 1}`} className="os-upload-preview-img" />
                      <button onClick={() => removeImage(idx)} className="os-upload-preview-remove"><X /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 上传区 */}
            {canUploadMore && (
              <div
                ref={dropZoneRef}
                className={`os-dropzone ${isDragOver ? 'os-dropzone-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
                <div className="os-dropzone-icon"><ImagePlus className="w-5 h-5" /></div>
                <div className="os-dropzone-text">
                  <span className="os-dropzone-title">{uploadedImages.length > 0 ? '继续添加参考图' : '添加灵感参考（可选）'}</span>
                  <span className="os-dropzone-formats">点击或拖拽上传{uploadedImages.length > 0 ? ` · 已选 ${uploadedImages.length}/${MAX_UPLOAD_IMAGES}` : ' · 支持 JPG / PNG / WebP'}</span>
                </div>
              </div>
            )}
            {!canUploadMore && (
              <div className="os-dropzone os-dropzone-full">
                <div className="os-dropzone-icon"><Check className="w-5 h-5 text-emerald-500" /></div>
                <div className="os-dropzone-text">
                  <span className="os-dropzone-title">已选 {MAX_UPLOAD_IMAGES} 张参考图</span>
                  <span className="os-dropzone-formats">点击已有图片的 × 可移除</span>
                </div>
              </div>
            )}

            {/* 试试这些创作 */}
            {!inputText.trim() && phase === 'idle' && (
              <div className="os-hero-chips">
                <span className="os-hero-chips-label">试试这些创作</span>
                <div className="os-hero-chips-list">
                  {tryChips.map((chip) => (
                    <button key={chip.label} className="os-hero-chip" onClick={() => handleChipClick(chip.prompt)}>
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="os-hero-action-bar">
              <button
                onClick={handleStartCreate}
                disabled={!inputText.trim() || phase !== 'idle'}
                className="os-hero-cta"
              >
                <Wand2 className="w-5 h-5" />
                <span>{phase === 'idle' ? '立即开始创作' : '识别中...'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <span className="os-hero-char-count">{inputText.length} / 500</span>
            </div>
          </div>

          {/* ===== 右侧案例区 ===== */}
          <div className="os-hero-right">
            <div className="os-showcase-header">
              <span className="os-showcase-title">AI 创作灵感</span>
            </div>
            <div className={`os-showcase-featured ${showcaseFading ? 'os-showcase-fading' : ''}`}>
              <div className="os-showcase-featured-img-wrap">
                <img src={currentShowcase.image} alt={currentShowcase.title} className="os-showcase-featured-img" />
                <div className="os-showcase-shimmer" />
                <div className="os-showcase-featured-overlay" />
                <div className="os-showcase-featured-info">
                  <span className="os-showcase-featured-category">{currentShowcase.category}</span>
                  <span className="os-showcase-featured-generating">
                    <span className="os-showcase-gen-dot" />
                    正在生成：{currentShowcase.generating}
                  </span>
                </div>
              </div>
            </div>
            <div className="os-showcase-gen-label">
              <span className="os-showcase-gen-dot-sm" />
              <span>正在生成：{currentShowcase.generating}</span>
            </div>
            <div className="os-showcase-thumbs">
              {showcaseExamples.map((example, idx) => (
                <div
                  key={idx}
                  className={`os-showcase-thumb ${idx === showcaseIndex ? 'os-showcase-thumb-active' : ''}`}
                  onClick={() => {
                    setShowcaseFading(true);
                    setTimeout(() => { setShowcaseIndex(idx); setShowcaseFading(false); }, 300);
                  }}
                >
                  <img src={example.image} alt={example.title} className="os-showcase-thumb-img" />
                  <span className="os-showcase-thumb-label">{example.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 热门生成案例 — 横向轮播 ==================== */}
      <section className="os-hot-section">
        <div className="os-content">
          <div className="os-hot-header">
            <div>
              <div className="os-hot-title-row">
                <TrendingUp className="w-5 h-5 text-[#7B61FF]/60" />
                <h2 className="os-hot-title">热门生成案例</h2>
              </div>
              <p className="os-hot-subtitle">看看 OneClaw 能生成哪些内容</p>
            </div>
            <div className="os-hot-nav">
              <button onClick={() => scrollCarousel('left')} className="os-hot-nav-btn"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scrollCarousel('right')} className="os-hot-nav-btn"><ChevronRight className="w-5 h-5" /></button>
              <button onClick={() => router.push('/tools')} className="os-hot-more">
                查看更多 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="os-hot-carousel" ref={carouselRef}>
            {hotResults.map((item, idx) => (
              <div
                key={idx}
                className="os-hot-card"
                onClick={() => {
                  const params = new URLSearchParams({ prompt: item.examplePrompt });
                  router.push(`/create?${params.toString()}`);
                }}
              >
                <div className="os-hot-card-img-wrap">
                  <img src={item.image} alt={item.title} className="os-hot-card-img" loading="lazy" />
                  <div className="os-hot-card-hover">
                    <button
                      className="os-hot-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        const params = new URLSearchParams({ prompt: item.examplePrompt });
                        router.push(`/create?${params.toString()}`);
                      }}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>生成同款</span>
                    </button>
                  </div>
                </div>
                <div className="os-hot-card-info">
                  <span className="os-hot-card-type">{item.type}</span>
                  <p className="os-hot-card-title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 轻量过渡浮层 ===== */}
      {phase !== 'idle' && (
        <div className="os-ai-overlay">
          <div className="os-ai-card">
            <div className="os-ai-card-glow" />
            {phase === 'identifying' && (
              <div className="os-ai-analyzing">
                {uploadedImages.length > 0 && (
                  <div className="os-ai-scan-area">
                    {uploadedImages.length === 1 ? (
                      <div className="os-ai-scan-single">
                        <img src={uploadedImages[0]} alt="参考图" className="os-ai-scan-img" />
                      </div>
                    ) : (
                      <div className={`os-ai-scan-grid os-ai-scan-grid-${Math.min(uploadedImages.length, 5)}`}>
                        {uploadedImages.slice(0, 5).map((img, idx) => (
                          <div key={idx} className="os-ai-scan-grid-item">
                            <img src={img} alt={`参考图${idx + 1}`} className="os-ai-scan-grid-img" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="os-ai-scan-shimmer" />
                    {uploadedImages.length > 1 && <span className="os-ai-scan-count">已上传 {uploadedImages.length} 张参考图</span>}
                  </div>
                )}
                <div className="os-ai-msg-wrap">
                  <span className="os-ai-msg">{identifyMessage}</span>
                </div>
                <div className="os-ai-pulse-dots">
                  <span className="os-ai-pulse-dot" style={{ animationDelay: '0s' }} />
                  <span className="os-ai-pulse-dot" style={{ animationDelay: '0.4s' }} />
                  <span className="os-ai-pulse-dot" style={{ animationDelay: '0.8s' }} />
                </div>
              </div>
            )}
            {phase === 'no-match' && (
              <div className="os-ai-nomatch">
                <div className="os-ai-nomatch-icon"><Sparkles className="w-5 h-5" /></div>
                <span className="os-ai-nomatch-title">我们为你推荐这些创作方式</span>
                <span className="os-ai-nomatch-desc">当前需求不够明确，你可以选择一个方向继续创作</span>
                <div className="os-ai-nomatch-tags">
                  {TOOL_MATCHES.map(tool => {
                    return (
                      <button
                        key={tool.slug}
                        className="os-ai-nomatch-tag os-ai-nomatch-tag-clickable"
                        onClick={() => {
                          if (!TOOL_ROUTE_MAP[tool.slug]) return;
                          const rec = getStyleRecommendation(tool, inputText);
                          createTaskAndNavigate(router, {
                            prompt: inputText.trim(),
                            uploadedImages,
                            matchedTool: tool.slug,
                            analysisResult: { tool: tool.slug, style: rec.style, ratio: rec.ratio, count: String(rec.count), layoutMode: rec.layoutMode },
                          });
                        }}
                      >
                        {tool.icon}
                        <span className="ml-1">{tool.name.replace('AI', '').replace('生成器', '').replace('工坊', '')}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="os-ai-nomatch-actions">
                  <button onClick={() => {
                    const tool = TOOL_MATCHES[0];
                    if (!TOOL_ROUTE_MAP[tool.slug]) return;
                    const rec = getStyleRecommendation(tool, inputText);
                    createTaskAndNavigate(router, {
                      prompt: inputText.trim(),
                      uploadedImages,
                      matchedTool: tool.slug,
                      analysisResult: { tool: tool.slug, style: rec.style, ratio: rec.ratio, count: String(rec.count), layoutMode: rec.layoutMode },
                    });
                  }} className="os-ai-nomatch-primary">选择第一个推荐工具继续</button>
                  <button onClick={handleBrowseTools} className="os-ai-nomatch-secondary">浏览全部工具</button>
                  <button onClick={resetIdentify} className="os-ai-nomatch-ghost">返回修改需求</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
