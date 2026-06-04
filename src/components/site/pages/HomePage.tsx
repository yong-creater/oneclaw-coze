'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Wand2,
  ImagePlus,
  X,
  Check,
  Sparkles,
  Upload,
  Download,
  RotateCcw,
  Loader2,
  BookmarkPlus,
  BookmarkCheck,
  SlidersHorizontal,
  Pencil,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

// ===== 类型 =====
type GenRecordStatus = 'loading' | 'done' | 'error';

interface GenerationRecord {
  id: string;
  images: { url: string }[];
  prompt: string;
  ratio: string;
  referenceImageUrl?: string;
  saved: boolean;
  saving: boolean;
  timestamp: number;
  status: GenRecordStatus;
  errorMsg?: string;
}

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

// ===== 面板参数选项 =====
const RATIO_OPTIONS = [
  { value: '1:1', label: '1:1', w: 16, h: 16 },
  { value: '3:4', label: '3:4', w: 12, h: 16 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
];

const MAX_UPLOAD_IMAGES = 5;

// ===== 瀑布流案例数据 =====
const MASONRY_CASES = [
  { name: '高端口红主图', prompt: '高端口红商品主图，白色背景，专业摄影打光', ratio: '1:1', image: '/cases/lipstick.png', span: 'md' },
  { name: '商品详情页', prompt: '护肤品商品详情页，优雅排版，品牌调性', ratio: '9:16', image: '/cases/detail-page.png', span: 'lg' },
  { name: '小红书封面', prompt: '小红书风格封面图，清新配色，生活场景', ratio: '3:4', image: '/cases/xiaohongshu.png', span: 'md' },
  { name: 'AI写真', prompt: 'AI写真风格人像，柔和光线，杂志质感', ratio: '3:4', image: '/cases/portrait.png', span: 'md' },
  { name: '品牌海报', prompt: '品牌视觉海报，简约大气，高级质感', ratio: '16:9', image: '/cases/poster.png', span: 'sm' },
  { name: '奢侈品广告', prompt: '奢侈品香水广告，金色光影，高端商业摄影', ratio: '1:1', image: '/cases/luxury-perfume.png', span: 'md' },
  { name: '美妆海报', prompt: '美妆护肤品牌海报，清新粉色调，少女感', ratio: '3:4', image: '/cases/beauty-poster.png', span: 'md' },
  { name: '科技产品', prompt: '科技电子产品广告，手机产品展示，极简白色背景', ratio: '1:1', image: '/cases/tech-product.png', span: 'md' },
  { name: '餐饮封面', prompt: '精致甜品美食摄影，咖啡馆风格，温馨暖色调', ratio: '1:1', image: '/cases/food-cover.png', span: 'sm' },
  { name: '时尚写真', prompt: '高级女装时尚写真，优雅站姿，杂志大片风格', ratio: '3:4', image: '/cases/fashion-portrait.png', span: 'lg' },
  { name: '汽车海报', prompt: '汽车品牌海报，豪华轿车，城市夜景灯光', ratio: '16:9', image: '/cases/car-poster.png', span: 'sm' },
  { name: '商业广告图', prompt: '商业广告设计图，产品展示，精美排版', ratio: '16:9', image: '/cases/commercial.png', span: 'sm' },
] as const;

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

// ===== 生成中动态文案（6阶段，每3秒轮播） =====
const GENERATION_PHASES = [
  '正在理解提示词...',
  '正在设计构图...',
  '正在生成主体...',
  '正在补充细节...',
  '正在提升画质...',
  '正在完成渲染...',
] as const;

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
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 创作流历史：每次生成自动追加（含 loading 状态）
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>([]);

  // 是否正在生成中（从 history 中判断）
  const isGenerating = generationHistory.some(r => r.status === 'loading');

  // ===== URL 参数自动填充 =====
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const ratio = searchParams.get('ratio');
    const style = searchParams.get('style');
    const imageUrl = searchParams.get('imageUrl');

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

  // ===== 生成逻辑（点击即创建 loading 记录，完成后更新为 done） =====
  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() && uploadedImages.length === 0) {
      showAlert('请先输入内容', '请输入描述文字或上传参考图片后再生成。', 'alert');
      return;
    }
    if (isGenerating) return;

    // 登录拦截
    if (!requireAuth()) return;

    // 额度检查
    if (dailyQuota !== null && dailyQuota !== -2 && dailyQuota !== -1 && dailyQuota <= 0) {
      showAlert('今日免费额度已用完', '注册登录后可继续生成作品，并同步保存你的创作记录。', 'quota-exhausted');
      return;
    }

    // 立即创建 loading 记录并插入历史顶部
    const recordId = `gen-${Date.now()}`;
    const loadingRecord: GenerationRecord = {
      id: recordId,
      images: [],
      prompt: inputText.trim(),
      ratio: selectedRatio,
      saved: false,
      saving: false,
      timestamp: Date.now(),
      status: 'loading',
    };
    setGenerationHistory(prev => [loadingRecord, ...prev]);

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
        const errMsg = genData.error || '生成失败，请重试';
        setGenerationHistory(prev => prev.map(r =>
          r.id === recordId ? { ...r, status: 'error' as GenRecordStatus, errorMsg: errMsg } : r
        ));
        return;
      }

      const urls: string[] = genData.imageUrls || genData.images || genData.data?.images || [];
      if (urls.length === 0) {
        setGenerationHistory(prev => prev.map(r =>
          r.id === recordId ? { ...r, status: 'error' as GenRecordStatus, errorMsg: '未获取到生成结果' } : r
        ));
        return;
      }

      const images = urls.map((url: string) => ({ url }));
      // 更新记录：loading → done，填入图片
      setGenerationHistory(prev => prev.map(r =>
        r.id === recordId ? { ...r, status: 'done' as GenRecordStatus, images } : r
      ));
      refreshQuota();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // 中断时移除 loading 记录
        setGenerationHistory(prev => prev.filter(r => r.id !== recordId));
        return;
      }
      const msg = err instanceof Error && err.message.includes('timeout') ? '生成超时，请重试' : '网络错误，请重试';
      setGenerationHistory(prev => prev.map(r =>
        r.id === recordId ? { ...r, status: 'error' as GenRecordStatus, errorMsg: msg } : r
      ));
    }
  }, [inputText, uploadedImages, selectedRatio, isGenerating, dailyQuota, requireAuth, showAlert, refreshQuota]);

  // 键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGenerate(); }
  }, [handleGenerate]);

  // 清理请求
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // ===== 加载中文案轮播（全局计时器） =====
  useEffect(() => {
    if (!isGenerating) {
      setLoadingMsgIdx(0);
      return;
    }
    const iv = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % GENERATION_PHASES.length);
    }, 3000);
    return () => clearInterval(iv);
  }, [isGenerating]);

  // ===== 保存到作品集 =====
  const handleSaveRecord = useCallback(async (record: GenerationRecord) => {
    if (!requireAuth()) return;
    if (record.saved || record.images.length === 0) return;
    setGenerationHistory(prev => prev.map(r => r.id === record.id ? { ...r, saving: true } : r));
    try {
      const res = await fetch('/api/generations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          images: record.images.map((img: { url: string }) => img.url),
          prompt: record.prompt,
          ratio: record.ratio,
          referenceImageUrl: record.referenceImageUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerationHistory(prev => prev.map(r => r.id === record.id ? { ...r, saved: true, saving: false } : r));
        showAlert('已保存到我的作品', 'success');
      } else {
        setGenerationHistory(prev => prev.map(r => r.id === record.id ? { ...r, saving: false } : r));
        showAlert(data.error || '保存失败', 'error');
      }
    } catch {
      setGenerationHistory(prev => prev.map(r => r.id === record.id ? { ...r, saving: false } : r));
      showAlert('保存失败，请稍后重试', 'error');
    }
  }, [requireAuth, showAlert]);

  // ===== 下载 =====
  const handleDownload = useCallback(async (url: string, idx: number) => {
    if (!requireAuth()) return;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `oneclaw-gpt-image2-${idx + 1}.png`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }, [requireAuth]);

  // 编辑 Prompt：滚动到输入框并聚焦
  const handleEditPrompt = useCallback(() => {
    const textarea = document.querySelector('.os-panel-prompt-input') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  // ===== 右侧面板内容 =====
  const renderRightPanel = () => {
    // 空状态：从未生成过 → 瀑布流作品展示
    if (generationHistory.length === 0) {
      return (
        <div className="os-masonry-page">
          {/* 品牌区 */}
          <div className="os-masonry-brand">
            <Sparkles className="w-6 h-6" style={{ color: '#A78BFA' }} />
            <h2 className="os-masonry-brand-title">GPT Image 2 创作平台</h2>
            <p className="os-masonry-brand-sub">ChatGPT Plus 同款模型 · 商业级图片生成</p>
          </div>

          {/* 瀑布流作品 */}
          <div className="os-masonry-grid">
            {MASONRY_CASES.map((item, idx) => (
              <div
                key={idx}
                className={`os-masonry-card os-masonry-card--${item.span}`}
                onClick={() => {
                  setInputText(item.prompt);
                  if (item.ratio !== selectedRatio) setSelectedRatio(item.ratio);
                }}
              >
                <div className="os-masonry-card-img" style={{ aspectRatio: ratioToAspect(item.ratio) }}>
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="os-masonry-card-overlay">
                  <span className="os-masonry-card-view">查看案例</span>
                </div>
                <div className="os-masonry-card-title">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 创作流：所有记录（含 loading/error/done）
    return (
      <div className="os-gen-flow">
        {generationHistory.map(record => renderFlowCard(record))}
      </div>
    );
  };

  // 渲染单条创作流卡片（统一入口：loading/done/error 三态）
  const renderFlowCard = (record: GenerationRecord) => {
    if (record.status === 'loading') {
      return renderLoadingCard(record);
    }
    if (record.status === 'error') {
      return renderErrorCard(record);
    }
    return renderDoneCard(record);
  };

  // Loading 卡片：skeleton + 阶段文案
  const renderLoadingCard = (record: GenerationRecord) => (
    <div key={record.id} className="os-gen-card os-gen-card--loading">
      {/* 卡片头部 */}
      <div className="os-gen-card-header">
        <div className="os-gen-card-prompt-wrap">
          <span className="os-gen-card-brand-tag">GPT Image 2</span>
          <div className="os-gen-card-prompt" title={record.prompt}>
            {record.prompt}
          </div>
        </div>
        <div className="os-gen-card-meta">
          {record.ratio} · {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Skeleton 图片区域 */}
      <div className="os-gen-card-skeleton" style={{ aspectRatio: ratioToAspect(record.ratio) }}>
        <div className="os-gen-card-skeleton-shimmer" />
        <div className="os-gen-card-skeleton-content">
          <Loader2 className="w-6 h-6 os-gen-card-skeleton-icon" />
          <div className="os-gen-card-skeleton-title">GPT Image 2 正在生成</div>
          <div className="os-gen-card-skeleton-phase" key={loadingMsgIdx}>
            {GENERATION_PHASES[loadingMsgIdx]}
          </div>
          <div className="os-gen-card-skeleton-est">预计需要 10-30 秒</div>
          <div className="os-gen-card-skeleton-bar">
            <div className="os-gen-card-skeleton-bar-inner" />
          </div>
        </div>
      </div>
    </div>
  );

  // Error 卡片：错误信息 + 重试
  const renderErrorCard = (record: GenerationRecord) => (
    <div key={record.id} className="os-gen-card os-gen-card--error">
      {/* 卡片头部 */}
      <div className="os-gen-card-header">
        <div className="os-gen-card-prompt-wrap">
          <span className="os-gen-card-brand-tag">GPT Image 2</span>
          <div className="os-gen-card-prompt" title={record.prompt}>
            {record.prompt}
          </div>
        </div>
        <div className="os-gen-card-meta">
          {record.ratio} · {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* 错误内容 */}
      <div className="os-gen-card-error-body">
        <div className="os-gen-card-error-icon">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="os-gen-card-error-title">生成失败</div>
        <div className="os-gen-card-error-msg">{record.errorMsg || '请检查输入后重试'}</div>
        <button className="os-gen-card-error-retry" onClick={handleGenerate}>
          <RotateCcw className="w-4 h-4" /> 重试
        </button>
      </div>
    </div>
  );

  // Done 卡片：图片 + 操作
  const renderDoneCard = (record: GenerationRecord) => (
    <div key={record.id} className="os-gen-card">
      {/* 卡片头部 */}
      <div className="os-gen-card-header">
        <div className="os-gen-card-prompt-wrap">
          <span className="os-gen-card-brand-tag">GPT Image 2</span>
          <div className="os-gen-card-prompt" title={record.prompt}>
            {record.prompt}
          </div>
        </div>
        <div className="os-gen-card-meta">
          {record.ratio} · {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* 图片展示区 */}
      {record.images.length === 1 ? (
        <div className="os-gen-main-img">
          <img src={record.images[0].url} alt={record.prompt} />
        </div>
      ) : (
        <div className="os-gen-card-grid">
          {record.images.map((img, idx) => (
            <div key={idx} className="os-gen-card-grid-item">
              <img src={img.url} alt={`${record.prompt} ${idx + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* 由 GPT Image 2 生成 */}
      <div className="os-gen-card-brand-line">
        <BadgeCheck className="w-3.5 h-3.5" />
        <span>由 OpenAI GPT Image 2 生成</span>
      </div>

      {/* 操作按钮区 */}
      <div className="os-gen-actions">
        <button className="os-gen-action-btn os-gen-action-primary" onClick={() => handleDownload(record.images[0].url, 0)}>
          <Download className="w-4 h-4" /> 下载
        </button>
        <button
          className={`os-gen-action-btn ${record.saved ? 'os-gen-action-saved' : 'os-gen-action-ghost'}`}
          disabled={record.saved || record.saving}
          onClick={record.saved ? undefined : () => handleSaveRecord(record)}
        >
          {record.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : record.saved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          {record.saved ? '已保存' : record.saving ? '保存中' : '保存'}
        </button>
        <button className="os-gen-action-btn os-gen-action-ghost" onClick={handleEditPrompt}>
          <Pencil className="w-4 h-4" /> 编辑
        </button>
        <button className="os-gen-action-btn os-gen-action-ghost" onClick={handleGenerate}>
          <RotateCcw className="w-4 h-4" /> 重新生成
        </button>
      </div>
    </div>
  );

  return (
    <div className="os-page os-page-studio">
      <div className="os-studio-layout">

        {/* ===== 左侧：创作面板 ===== */}
        <aside className="os-studio-panel">
          {/* --- 模型品牌卡 --- */}
          <div className="os-panel-capability">
            <div className="os-panel-capability-top">
              <div className="os-panel-capability-label">GPT Image 2</div>
              <span className="os-panel-capability-tag">ChatGPT Plus 同款</span>
            </div>
            <div className="os-panel-capability-points">
              <span>✓ 中文文字更准确</span>
              <span>✓ 商品细节更真实</span>
              <span>✓ 海报设计更高级</span>
            </div>
          </div>

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
            ) : generationHistory.length > 0 ? (
              <>
                <RotateCcw className="w-4.5 h-4.5" />
                <span>重新生成</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4.5 h-4.5" />
                <span>使用 GPT Image 2 生成</span>
              </>
            )}
          </button>
        </aside>

        {/* ===== 右侧：创作流 ===== */}
        <main className="os-studio-feed">
          {renderRightPanel()}
        </main>
      </div>

      {/* ===== Toast ===== */}
      <div className={`os-gen-toast ${showToast ? 'show' : ''}`}>
        <Check className="w-4 h-4" /> 已保存到作品库
      </div>
    </div>
  );
}
