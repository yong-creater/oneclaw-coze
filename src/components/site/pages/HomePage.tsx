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
  ImageIcon,
  Loader2,
  BookmarkPlus,
  BookmarkCheck,
  SlidersHorizontal,
  Pencil,
  Copy,
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
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  type GenerationRecord = {
    id: string;
    images: { url: string }[];
    prompt: string;
    ratio: string;
    referenceImageUrl?: string;
    saved: boolean;
    saving: boolean;
    timestamp: number;
  };
  // 创作流历史：每次生成自动追加
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>([]);

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

      const images = urls.map((url: string) => ({ url }));
      setGenStep('done');
      // 追加到创作流历史
      setGenerationHistory(prev => [{
        id: `gen-${Date.now()}`,
        images,
        prompt: inputText.trim(),
        ratio: selectedRatio,
        saved: false,
        saving: false,
        timestamp: Date.now(),
      }, ...prev]);
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
      a.download = `oneclaw-${idx + 1}.png`;
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

  // 使用同款风格：复制 prompt 到剪贴板并重置到编辑状态
  const handleUseStyle = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inputText).catch(() => {});
    }
  }, [inputText]);

  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;
  const isGenerating = genStep === 'generating';

  // ===== 右侧面板内容 =====
  const renderRightPanel = () => {
    // 生成中（覆盖在创作流之上）
    if (isGenerating) {
      return (
        <div className="os-gen-flow">
          {/* 已有历史时，显示历史 + skeleton */}
          {generationHistory.length > 0 && (
            <div className="os-gen-flow-history">
              {generationHistory.map(renderHistoryCard)}
            </div>
          )}
          <div className="os-gen-flow-card os-gen-flow-card--loading">
            <div className="os-gen-flow-skeleton" style={{ aspectRatio: ratioToAspect(selectedRatio) }}>
              <div className="os-gen-flow-skeleton-icon">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <div className="os-gen-flow-card-body">
              <div className="os-gen-flow-loading-label" key={loadingMsgIdx}>
                {loadingMessages[loadingMsgIdx]}
              </div>
              <div className="os-gen-flow-loading-sub">AI 正在创作中…</div>
              <div className="os-gen-flow-loading-bar">
                <div className="os-gen-flow-loading-bar-inner" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 错误状态
    if (genStep === 'error') {
      return (
        <div className="os-gen-flow">
          {generationHistory.length > 0 && (
            <div className="os-gen-flow-history">
              {generationHistory.map(renderHistoryCard)}
            </div>
          )}
          <div className="os-gen-flow-card os-gen-flow-card--error">
            <div className="os-gen-flow-card-body">
              <div className="os-gen-flow-error-icon">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="os-gen-flow-error-title">生成失败</div>
              <div className="os-gen-flow-error-msg">{errorMsg || '请检查输入后重试'}</div>
              <button className="os-gen-flow-error-retry" onClick={handleGenerate}>
                <RotateCcw className="w-4 h-4" /> 重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 创作流：当前结果 + 历史记录
    if (generationHistory.length > 0) {
      return (
        <div className="os-gen-flow">
          {generationHistory.map(renderHistoryCard)}
        </div>
      );
    }

    // 空状态
    return (
      <div className="os-empty-state">
        <div className="os-empty-state-glow" />
        <Sparkles className="os-empty-state-icon" />
        <h2 className="os-empty-state-title">开始你的创作</h2>
        <p className="os-empty-state-sub">上传图片或输入描述词<br />即可生成高质量 AI 图片</p>
      </div>
    );
  };

  // 渲染单条创作流卡片
  const renderHistoryCard = (record: GenerationRecord) => {
    const isCurrent = record.id === generationHistory[0]?.id && genStep === 'done';
    return (
      <div key={record.id} className={`os-gen-card ${isCurrent ? 'current' : ''}`}>
        {/* 卡片头部 */}
        <div className="os-gen-card-header">
          <div className="os-gen-card-prompt" title={record.prompt}>
            {record.prompt}
          </div>
          <div className="os-gen-card-meta">
            {record.ratio} · {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* 图片展示区 */}
        {record.images.length === 1 ? (
          <div className="os-gen-card-main">
            <img src={record.images[0].url} alt={record.prompt} className="os-gen-card-img" />
          </div>
        ) : (
          <div className="os-gen-card-grid">
            {record.images.map((img, idx) => (
              <div key={idx} className="os-gen-card-grid-item">
                <img src={img.url} alt={`${record.prompt} ${idx + 1}`} className="os-gen-card-img" />
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮区 */}
        <div className="os-gen-card-actions">
          <button className="os-gen-action-primary" onClick={() => handleDownload(record.images[0].url, 0)}>
            <Download className="w-4 h-4" /> 下载
          </button>
          <button
            className={`os-gen-action-secondary ${record.saved ? 'saved' : ''}`}
            disabled={record.saved || record.saving}
            onClick={record.saved ? undefined : () => handleSaveRecord(record)}
          >
            {record.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : record.saved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            {record.saved ? '已保存' : record.saving ? '保存中' : '保存'}
          </button>
          <button className="os-gen-action-secondary" onClick={handleEditPrompt}>
            <Pencil className="w-4 h-4" /> 编辑
          </button>
          <button className="os-gen-action-secondary" onClick={() => { setGenStep('idle'); handleGenerate(); }}>
            <RotateCcw className="w-4 h-4" /> 重新生成
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="os-page os-page-studio">
      <div className="os-studio-layout">

        {/* ===== 左侧：创作面板 ===== */}
        <aside className="os-studio-panel">
          {/* --- AI 能力说明 --- */}
          <div className="os-panel-capability">
            <div className="os-panel-capability-label">GPT Image 2 AI 生图</div>
            <div className="os-panel-capability-sub">OpenAI 新一代视觉生成模型</div>
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

      {/* ===== Toast ===== */}
      <div className={`os-gen-toast ${showToast ? 'show' : ''}`}>
        <Check className="w-4 h-4" /> 已保存到作品库
      </div>
    </div>
  );
}
