'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wand2,
  ImagePlus,
  X,
  Check,
  Sparkles,
  ChevronRight,
  Upload,
  Download,
  RotateCcw,
  ImageIcon,
  Loader2,
  BookmarkPlus,
  BookmarkCheck,
  ZoomIn,
  Lightbulb,
  SlidersHorizontal,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

// ===== 类型 =====
interface GeneratedImage { url: string; }
type GenStep = 'idle' | 'generating' | 'done' | 'error';

// ===== 布局模式识别 =====
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

// ===== fetch 超时工具 =====
function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const { signal: externalSignal, timeout: _t, ...rest } = options;
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...rest, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ===== 推荐案例数据 =====
const recommendedCases = [
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop&auto=format&q=80',
    type: '海报',
    title: '未来感发布会海报',
    prompt: '生成一个未来感新能源发布会海报',
  },
  {
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=500&fit=crop&auto=format&q=80',
    type: '人物',
    title: '赛博朋克风格人物',
    prompt: '做一个赛博朋克人物',
  },
  {
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=500&fit=crop&auto=format&q=80',
    type: '包装',
    title: '咖啡品牌包装设计',
    prompt: '设计一个咖啡品牌包装',
  },
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop&auto=format&q=80',
    type: '数据',
    title: '行业分析图',
    prompt: '生成行业分析图',
  },
  {
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=500&fit=crop&auto=format&q=80',
    type: 'Banner',
    title: '高级感网站 Banner',
    prompt: '设计高级感网站 Banner',
  },
  {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=500&fit=crop&auto=format&q=80',
    type: '风景',
    title: '赛博朋克城市夜景',
    prompt: '创作一幅赛博朋克城市夜景',
  },
];

// ===== 面板参数选项 =====
const RATIO_OPTIONS = [
  { value: '1:1', label: '1:1', w: 16, h: 16 },
  { value: '3:4', label: '3:4', w: 12, h: 16 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
];

const MAX_UPLOAD_IMAGES = 5;

// ===== 比例 → aspect-ratio CSS =====
function ratioToAspect(ratio: string): string {
  const map: Record<string, string> = {
    '1:1': '1 / 1',
    '3:4': '3 / 4',
    '9:16': '9 / 16',
    '16:9': '16 / 9',
  };
  return map[ratio] || '1 / 1';
}

// ===== 生成中动态文案 =====
function buildLoadingMessages(ratio: string, styleName: string): string[] {
  const ratioStr = ratio;
  const styleStr = styleName || '';
  return [
    `正在生成 ${ratioStr} ${styleStr} 视觉内容`.replace(/\s+/g, ' ').trim(),
    '正在理解你的创意',
    'AI 正在构建视觉细节',
    `正在优化${styleStr}光影与构图`.replace(/\s+/g, ' ').trim(),
    '正在生成高质量画面',
  ];
}

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const { requireAuth, dailyQuota, refreshQuota, user, loading } = useUser();
  const { showAlert } = useModal();
  const searchParams = useSearchParams();

  // ===== 面板状态 =====
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = useState('3:4');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ===== 生成状态 =====
  const [genStep, setGenStep] = useState<GenStep>('idle');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ===== URL 参数自动填充 =====
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const ratio = searchParams.get('ratio');
    const style = searchParams.get('style');
    const imageUrl = searchParams.get('imageUrl');
    // const sourceType = searchParams.get('sourceType'); // reserved for analytics

    if (prompt) setInputText(prompt);
    if (ratio && ['1:1', '3:4', '9:16', '16:9'].includes(ratio)) setSelectedRatio(ratio);
    if (imageUrl) setUploadedImages([imageUrl]);
  }, [searchParams]);

  // ===== 初始化 =====
  useEffect(() => {
    if (pendingInput) { setInputText(pendingInput); consumePendingInput(); }
  }, [pendingInput, consumePendingInput]);

  // ===== 上传逻辑 =====
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

  const handleUploadClick = useCallback(() => { fileInputRef.current?.click(); }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addImageFiles(e.target.files);
    e.target.value = '';
  }, [addImageFiles]);
  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ===== 生成逻辑（直接调用 /api/images/generate，不跳转） =====
  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() && uploadedImages.length === 0) {
      showAlert('请先输入内容', '请输入描述文字或上传参考图片后再生成。', 'alert');
      return;
    }
    if (genStep === 'generating') return;

    // 登录拦截
    if (!requireAuth()) return;

    // 额度检查
    if (dailyQuota !== null && dailyQuota !== -2 && dailyQuota !== -1 && dailyQuota <= 0) {
      showAlert('今日免费额度已用完', '注册登录后可继续生成作品，并同步保存你的创作记录。', 'quota-exhausted');
      return;
    }

    // 开始生成
    setGenStep('generating');
    setGeneratedImages([]);
    setSaved(false);
    setErrorMsg('');

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const layoutMode = parseLayoutMode(inputText);
      const genBody: Record<string, unknown> = {
        prompt: inputText.trim(),
        toolSlug: 'product-generator',
        ratio: selectedRatio,
        count: 4,
        generationType: 'general',
        layoutMode,
      };
      if (uploadedImages.length > 0) genBody.referenceImages = uploadedImages;

      const genRes = await fetchWithTimeout('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genBody),
        credentials: 'include',
        signal: ac.signal,
      }, 120000);

      const genData = await genRes.json();

      if (!genData.success) {
        setGenStep('error');
        const errMsg = genData.error || '生成失败，请重试';
        setErrorMsg(errMsg);
        return;
      }

      const urls: string[] = genData.imageUrls || genData.images || genData.data?.images || [];
      if (urls.length === 0) {
        setGenStep('error');
        setErrorMsg('未获取到生成结果');
        return;
      }

      setGeneratedImages(urls.map((url: string) => ({ url })));
      setSelectedImgIdx(0);
      setGenStep('done');
      setSaved(true);
      refreshQuota();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setGenStep('error');
      const msg = err instanceof Error && err.message.includes('timeout') ? '生成超时，请重试' : '网络错误，请重试';
      setErrorMsg(msg);
    }
  }, [inputText, uploadedImages, selectedRatio, genStep, dailyQuota, requireAuth, showAlert, refreshQuota]);

  // 键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGenerate(); }
  }, [handleGenerate]);

  // 清理请求
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // ===== 加载中文案轮播 =====
  const loadingMessages = buildLoadingMessages(selectedRatio, '');

  useEffect(() => {
    if (genStep !== 'generating') {
      setLoadingMsgIdx(0);
      return;
    }
    const iv = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
    }, 2800);
    return () => clearInterval(iv);
  }, [genStep, loadingMessages.length]);

  // ===== Carousel =====
  const handleInspirationClick = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  // ===== 下载 =====
  const handleDownload = useCallback(async (url: string, idx: number) => {
    if (!requireAuth()) return;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `oneclaw-${idx + 1}.png`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }, [requireAuth]);

  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;
  const isGenerating = genStep === 'generating';

  // ===== 右侧面板内容 =====
  const renderRightPanel = () => {
    // 空状态：推荐案例
    if (genStep === 'idle' && generatedImages.length === 0) {
      return (
        <>
          <div className="os-cases-header">
            <div className="os-cases-header-left">
              <Lightbulb className="w-4 h-4 text-[#7B61FF]/60" />
              <h2 className="os-cases-title">推荐案例</h2>
            </div>
            <Link href="/inspiration" className="os-cases-more">
              探索更多 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="os-cases-grid">
            {recommendedCases.map((c, idx) => (
              <div
                key={idx}
                className="os-case-card"
                onClick={() => handleInspirationClick(c.prompt)}
              >
                <div className="os-case-card-img-wrap">
                  <img src={c.image} alt={c.title} className="os-case-card-img" loading="lazy" />
                  <div className="os-case-card-hover">
                    <button
                      className="os-case-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputText(c.prompt);
                      }}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>试试</span>
                    </button>
                  </div>
                </div>
                <div className="os-case-card-info">
                  <span className="os-case-card-type">{c.type}</span>
                  <p className="os-case-card-title">{c.title}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    // 生成中
    if (isGenerating) {
      return (
        <div className="os-gen-loading">
          <div className="os-gen-shimmer" style={{ aspectRatio: ratioToAspect(selectedRatio) }}>
            <div className="os-gen-shimmer-icon">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <div className="os-gen-loading-text">
            <div className="os-gen-loading-label" key={loadingMsgIdx}>
              {loadingMessages[loadingMsgIdx]}
            </div>
            <div className="os-gen-loading-sub">AI 正在创作中…</div>
          </div>
          <div className="os-gen-loading-bar">
            <div className="os-gen-loading-bar-inner" />
          </div>
        </div>
      );
    }

    // 错误状态
    if (genStep === 'error') {
      return (
        <div className="os-gen-error">
          <div className="os-gen-error-icon">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h3>生成失败</h3>
          <p>{errorMsg || '请检查输入后重试'}</p>
          <button className="os-gen-error-retry" onClick={handleGenerate}>
            <RotateCcw className="w-4 h-4" /> 重试
          </button>
        </div>
      );
    }

    // 生成结果
    if (genStep === 'done' && generatedImages.length > 0) {
      return (
        <div className="os-gen-result">
          {/* 结果标题 */}
          <div className="os-gen-result-header">
            <span className="os-gen-result-title">生成结果</span>
            <span className="os-gen-result-count">共 {generatedImages.length} 张</span>
          </div>

          {/* 主预览 */}
          <div
            className="os-gen-result-main"
            style={{ aspectRatio: ratioToAspect(selectedRatio) }}
            onClick={() => setLightboxIdx(selectedImgIdx)}
          >
            <img
              src={generatedImages[selectedImgIdx].url}
              alt={`生成结果 ${selectedImgIdx + 1}`}
              className="os-gen-result-main-img"
            />
            <div className="os-gen-result-zoom">
              <ZoomIn className="w-5 h-5" />
            </div>
          </div>

          {/* 缩略图 */}
          {generatedImages.length > 1 && (
            <div className="os-gen-result-thumbs">
              {generatedImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`os-gen-result-thumb ${idx === selectedImgIdx ? 'active' : ''}`}
                  style={{ aspectRatio: ratioToAspect(selectedRatio) }}
                  onClick={() => setSelectedImgIdx(idx)}
                >
                  <img src={img.url} alt={`缩略图 ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* 操作栏 */}
          <div className="os-gen-result-actions">
            <button className="os-gen-action-btn os-gen-action-glass" onClick={handleGenerate}>
              <RotateCcw className="w-4 h-4" /> 重新生成
            </button>
            <button
              className={`os-gen-action-btn ${saved ? 'os-gen-action-saved' : 'os-gen-action-accent'}`}
              disabled={saved}
            >
              {saved ? <><BookmarkCheck className="w-4 h-4" /> 已保存</> : <><BookmarkPlus className="w-4 h-4" /> 保存</>}
            </button>
            <button
              className="os-gen-action-btn os-gen-action-download"
              onClick={() => handleDownload(generatedImages[selectedImgIdx].url, selectedImgIdx)}
            >
              <Download className="w-4 h-4" /> 下载
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="os-page os-page-studio">
      <div className="os-studio-layout">

        {/* ===== 左侧：创作面板 ===== */}
        <aside className="os-studio-panel">
          {/* --- 品牌区域 --- */}
          <div className="os-panel-model">
            <div className="os-panel-model-header">
              <div className="os-panel-model-icon">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="os-panel-model-info">
                <div className="os-panel-model-name">OneClaw Vision</div>
                <div className="os-panel-model-desc">Powered by GPT Image 2</div>
              </div>
            </div>
          </div>

          <div className="os-panel-divider" />

          {/* --- 图片上传区域 --- */}
          <div className="os-panel-section">
            <div className="os-panel-section-label">
              <Upload className="w-3.5 h-3.5" />
              <span>参考图</span>
            </div>

            {uploadedImages.length > 0 ? (
              <div className="os-panel-upload-grid">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="os-panel-upload-thumb">
                    <img src={img} alt={`参考图${idx + 1}`} />
                    <button onClick={() => removeImage(idx)} className="os-panel-upload-remove">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {canUploadMore && (
                  <button className="os-panel-upload-add" onClick={handleUploadClick}>
                    <ImagePlus className="w-4 h-4" />
                    <span>添加</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`os-panel-upload-area ${isDragOver ? 'os-panel-upload-area-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <ImagePlus className="w-6 h-6 os-panel-upload-icon" />
                <span className="os-panel-upload-text">上传图片</span>
                <span className="os-panel-upload-subtext">或拖拽图片到这里</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* --- Prompt 输入框 --- */}
          <div className="os-panel-section os-panel-section-grow">
            <div className="os-panel-section-label">
              <Sparkles className="w-3.5 h-3.5" />
              <span>描述</span>
            </div>
            <div className={`os-panel-prompt-wrap ${isFocused ? 'os-panel-prompt-focused' : ''}`}>
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value.slice(0, 500)); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="描述你想生成的内容..."
                className="os-panel-prompt-input"
                rows={4}
                disabled={isGenerating}
              />
              <div className="os-panel-prompt-footer">
                <span className="os-panel-prompt-count">{inputText.length} / 500</span>
              </div>
            </div>
          </div>

          {/* --- 参数区域 --- */}
          <div className="os-panel-section">
            {/* 比例 */}
            <div className="os-panel-params-row">
              <div className="os-panel-params-label">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>比例</span>
              </div>
              <div className="os-panel-params-options">
                {RATIO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`os-panel-ratio-btn ${selectedRatio === opt.value ? 'os-panel-ratio-active' : ''}`}
                    onClick={() => setSelectedRatio(opt.value)}
                    title={opt.label}
                  >
                    <div className="os-panel-ratio-icon" style={{ width: opt.w, height: opt.h }} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- 生成按钮 --- */}
          <button
            onClick={handleGenerate}
            disabled={(!inputText.trim() && uploadedImages.length === 0) || isGenerating}
            className="os-panel-generate-btn"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>生成中…</span>
              </>
            ) : genStep === 'done' ? (
              <>
                <RotateCcw className="w-4.5 h-4.5" />
                <span>重新生成</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4.5 h-4.5" />
                <span>开始生成</span>
              </>
            )}
          </button>
        </aside>

        {/* ===== 右侧：灵感流 / 生成结果 ===== */}
        <main className="os-studio-feed">
          {renderRightPanel()}
        </main>
      </div>

      {/* ===== Lightbox ===== */}
      {lightboxIdx >= 0 && generatedImages[lightboxIdx] && (
        <div className="os-gen-lightbox" onClick={() => setLightboxIdx(-1)}>
          <button className="os-gen-lightbox-close" onClick={() => setLightboxIdx(-1)}>
            <X className="w-6 h-6" />
          </button>
          <img src={generatedImages[lightboxIdx].url} alt="大图预览" />
          {generatedImages.length > 1 && (
            <div className="os-gen-lightbox-thumbs">
              {generatedImages.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`缩略图 ${i + 1}`}
                  className={`os-gen-lightbox-thumb ${i === lightboxIdx ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Toast ===== */}
      <div className={`os-gen-toast ${showToast ? 'show' : ''}`}>
        <Check className="w-4 h-4" /> 已保存到作品库
      </div>
    </div>
  );
}
