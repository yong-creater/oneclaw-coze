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
  SlidersHorizontal,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

// ===== 生成阶段文案池 =====
const GENERATION_PHASES = [
  '正在分析构图...',
  '正在优化光影效果...',
  '正在增强商品细节...',
  '正在提升画面真实感...',
  '正在生成第1张图片...',
  '正在生成第2张图片...',
  '正在生成第3张图片...',
  '正在生成第4张图片...',
];

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
  /** 渐进出图：已返回的图片数量（1~4） */
  revealedCount?: number;
}

// ===== 继续创作模板 =====
const CONTINUE_STYLES = [
  { name: '商品详情页', suffix: '，制作成电商商品详情页，展示产品卖点和规格参数' },
  { name: '品牌海报', suffix: '，制作成品牌宣传海报，高端大气' },
  { name: '模特场景图', suffix: '，制作成模特场景展示图，生活化场景' },
  { name: '小红书封面', suffix: '，制作成小红书封面图，清新吸引眼球' },
] as const;

// ===== Prompt 截断 =====
function truncatePrompt(text: string, max = 30): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
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

// ===== 精选案例数据 =====
const FEATURED_CASES = [
  { name: '商品主图', prompt: '高端口红商品主图，白色背景，专业摄影打光', ratio: '1:1', image: '/cases/lipstick.png' },
  { name: '商品详情页', prompt: '护肤品商品详情页，优雅排版，品牌调性', ratio: '9:16', image: '/cases/detail-page.png' },
  { name: 'AI写真', prompt: 'AI写真风格人像，柔和光线，杂志质感', ratio: '3:4', image: '/cases/portrait.png' },
  { name: '小红书封面', prompt: '小红书风格封面图，清新配色，生活场景', ratio: '3:4', image: '/cases/xiaohongshu.png' },
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
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 创作流历史：每次生成自动追加（含 loading 状态）
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>([]);

  // 是否正在生成中（从 history 中判断）
  const isGenerating = generationHistory.some(r => r.status === 'loading');

  // 生成阶段文案轮播（每2秒切换）
  const [loadingPhaseIdx, setLoadingPhaseIdx] = useState(0);
  useEffect(() => {
    if (!isGenerating) { setLoadingPhaseIdx(0); return; }
    const timer = setInterval(() => {
      setLoadingPhaseIdx(prev => (prev + 1) % GENERATION_PHASES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isGenerating]);

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
      // 渐进出图：先填入图片数据，但 revealedCount=0，然后逐步揭示
      setGenerationHistory(prev => prev.map(r =>
        r.id === recordId ? { ...r, status: 'loading' as GenRecordStatus, images, revealedCount: 0 } : r
      ));
      // 每600ms揭示一张图，模拟渐进出图
      for (let i = 1; i <= images.length; i++) {
        await new Promise<void>(resolve => setTimeout(resolve, 600));
        setGenerationHistory(prev => prev.map(r =>
          r.id === recordId ? { ...r, revealedCount: i } : r
        ));
      }
      // 全部揭示后标记为 done
      setGenerationHistory(prev => prev.map(r =>
        r.id === recordId ? { ...r, status: 'done' as GenRecordStatus } : r
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
    // 空状态：从未生成过 → 2x2 精选案例
    if (generationHistory.length === 0) {
      return (
        <div className="os-showcase-page">
          {/* 品牌区 */}
          <div className="os-showcase-brand">
            <h2 className="os-showcase-brand-title">GPT Image 2</h2>
            <p className="os-showcase-brand-sub">ChatGPT 同款生图模型</p>
          </div>

          {/* 2×2 案例网格 */}
          <div className="os-showcase-grid">
            {FEATURED_CASES.map((item, idx) => (
              <div
                key={idx}
                className="os-showcase-card"
                onClick={() => {
                  setInputText(item.prompt);
                  if (item.ratio !== selectedRatio) setSelectedRatio(item.ratio);
                }}
              >
                <div className="os-showcase-card-img">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="os-showcase-card-name">{item.name}</div>
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

  // Loading 卡片：4 格骨架网格 + 动态文案 + 渐进出图
  const renderLoadingCard = (record: GenerationRecord) => {
    const revealed = record.revealedCount ?? 0;
    const totalSlots = 4;
    // 已渐进显示的图片用真实图，其余用骨架
    return (
      <div key={record.id} className="os-gen-card os-gen-card--loading">
        {/* 卡片头部 */}
        <div className="os-gen-card-header">
          <div className="os-gen-card-prompt-wrap">
            <span className="os-gen-card-brand-tag">GPT Image 2</span>
            <div className="os-gen-card-prompt" title={record.prompt}>
              {truncatePrompt(record.prompt)}
            </div>
          </div>
          {/* 右上角创作状态 */}
          <div className="os-gen-card-loading-status">
            <span className="os-gen-card-loading-dot" />
            <span>GPT Image 2 创作中</span>
          </div>
        </div>

        {/* 动态阶段文案 */}
        <div className="os-gen-card-phase">
          GPT Image 2 正在创作
          <span className="os-gen-card-phase-text">{GENERATION_PHASES[loadingPhaseIdx]}</span>
        </div>

        {/* 4 格：已出图用真实图，未出图用骨架 */}
        <div className="os-gen-card-skeleton-grid">
          {Array.from({ length: totalSlots }, (_, i) => (
            i < revealed && record.images[i] ? (
              <div key={i} className="os-gen-card-grid-item os-gen-card-grid-item--revealed">
                <img src={record.images[i].url} alt={`${record.prompt} ${i + 1}`} />
              </div>
            ) : (
              <div key={i} className="os-gen-card-skeleton-cell">
                <div className="os-gen-card-skeleton-cell-shimmer" />
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  // Error 卡片：错误信息 + 重试
  const renderErrorCard = (record: GenerationRecord) => (
      <div key={record.id} className="os-gen-card os-gen-card--error">
      {/* 卡片头部 */}
      <div className="os-gen-card-header">
        <div className="os-gen-card-prompt-wrap">
          <span className="os-gen-card-brand-tag">GPT Image 2</span>
          <div className="os-gen-card-prompt" title={record.prompt}>
            {truncatePrompt(record.prompt)}
          </div>
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
      {/* 模型标签行 */}
      <div className="os-gen-card-model-tags">
        <span className="os-gen-card-model-tag">GPT Image 2</span>
        <span className="os-gen-card-model-tag os-gen-card-model-tag--outline">ChatGPT Plus 同款</span>
      </div>

      {/* Prompt（截断30字） */}
      <div className="os-gen-card-prompt-line" title={record.prompt}>
        {truncatePrompt(record.prompt)}
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

      {/* 操作按钮区 */}
      <div className="os-gen-actions">
        <button className="os-gen-action-btn os-gen-action-primary" onClick={() => {
          record.images.forEach((img, idx) => handleDownload(img.url, idx));
        }}>
          <Download className="w-4 h-4" /> 下载全部
        </button>
        <button className="os-gen-action-btn os-gen-action-ghost" onClick={handleEditPrompt}>
          <Pencil className="w-4 h-4" /> 编辑提示词
        </button>
        <button className="os-gen-action-btn os-gen-action-ghost" onClick={handleGenerate}>
          <RotateCcw className="w-4 h-4" /> 重新生成
        </button>
      </div>

      {/* 继续创作 */}
      <div className="os-gen-continue">
        <div className="os-gen-continue-label">继续创作</div>
        <div className="os-gen-continue-options">
          {CONTINUE_STYLES.map((style, idx) => (
            <button
              key={idx}
              className="os-gen-continue-btn"
              onClick={() => {
                const newPrompt = record.prompt + style.suffix;
                setInputText(newPrompt);
                handleEditPrompt();
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
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
