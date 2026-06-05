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
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

// ===== 生成阶段文案池（精简 4 条） =====
const GENERATION_PHASES = [
  '分析构图...',
  '优化光影...',
  '增强细节...',
  '生成图片...',
];

// ===== 类型 =====
type GenRecordStatus = 'loading' | 'done' | 'error';

interface GenerationRecord {
  id: string;
  dbId?: string;        // 数据库记录 ID（持久化后回填）
  images: { url: string }[];
  prompt: string;
  ratio: string;
  referenceImageUrl?: string;
  saved: boolean;
  saving: boolean;
  timestamp: number;
  createdAt?: string;  // ISO date string from DB
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
const HOT_TAGS = [
  { emoji: '🔥', label: '商品主图', prompt: '高端商品主图摄影，奢侈品质感，商业级打光，8K超清', ratio: '4:5' },
  { emoji: '🔥', label: 'AI写真', prompt: 'AI杂志写真，高级时尚人像，电影感打光，VOGUE封面质感', ratio: '4:5' },
  { emoji: '🔥', label: '小红书封面', prompt: '小红书爆款封面，美妆博主风格，清新自然光，氛围感', ratio: '3:4' },
  { emoji: '🔥', label: '品牌海报', prompt: '品牌视觉海报，极简几何构成，高端渐变色彩，现代设计', ratio: '3:4' },
] as const;

const FEATURED_CASES = [
  { name: '商品摄影', sub: '专业级产品拍摄', prompt: '高端商品摄影，奢侈品护肤品瓶身，水滴飞溅，商业级打光，8K超清', ratio: '4:5', image: '/cases/product-photography.png' },
  { name: '电商详情页', sub: '高转化详情页设计', prompt: '电商详情页设计，高端护肤品展示，白色极简背景，产品特写，商业级排版', ratio: '4:5', image: '/cases/ecommerce-detail.png' },
  { name: 'AI写真', sub: '高质量人像写真', prompt: 'AI杂志写真，高级时尚人像，电影感打光，VOGUE封面质感', ratio: '4:5', image: '/cases/ai-portrait.png' },
  { name: '品牌海报', sub: '品牌视觉系统设计', prompt: '品牌视觉设计KV，极简几何，高端质感，渐变色彩，视觉识别', ratio: '4:5', image: '/cases/brand-visual-new.png' },
  { name: '珠宝广告', sub: '高端广告视觉创意', prompt: '商业广告创意，珠宝首饰特写，钻石闪耀，深色背景，奢华质感', ratio: '4:5', image: '/cases/commercial-ad.png' },
  { name: '小红书封面', sub: '爆款封面一键生成', prompt: '小红书爆款封面，美妆博主风格，清新自然光，精致妆容', ratio: '4:5', image: '/cases/xiaohongshu-cover.png' },
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
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 创作流历史：每次生成自动追加（含 loading 状态）
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>([]);

  // 生成中时自动折叠历史记录
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // 是否正在生成中（从 history 中判断）
  const isGenerating = generationHistory.some(r => r.status === 'loading');

  // 生成开始时自动折叠历史，结束时自动展开
  useEffect(() => {
    if (isGenerating) {
      setHistoryCollapsed(true);
    } else {
      setHistoryCollapsed(false);
    }
  }, [isGenerating]);

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

  // ===== 加载历史生成记录 =====
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/generation-records?limit=50', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.records?.length) return;

      const records: GenerationRecord[] = data.records.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        dbId: r.id as string,
        images: Array.isArray(r.images) ? r.images : [],
        prompt: (r.prompt as string) || '',
        ratio: (r.ratio as string) || '1:1',
        referenceImageUrl: (r.reference_image_url as string) || undefined,
        saved: false,
        saving: false,
        timestamp: new Date(r.created_at as string).getTime(),
        createdAt: (r.created_at as string) || new Date().toISOString(),
        status: 'done' as GenRecordStatus,
      }));

      setGenerationHistory(prev => {
        // 保留正在 loading 的记录，合并已有的 DB 记录
        const loadingRecords = prev.filter(r => r.status === 'loading');
        return [...loadingRecords, ...records];
      });
    } catch {
      // 静默失败，不影响页面
    }
  }, []);

  // 页面加载时获取历史记录
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
      createdAt: new Date().toISOString(),
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
      // 持久化生成记录到数据库
      try {
        const finalRecord = generationHistory.find(r => r.id === recordId);
        const saveRes = await fetch('/api/generation-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            prompt: inputText.trim(),
            images: images.map((img: { url: string }) => img.url),
            ratio: selectedRatio,
            model: 'GPT Image 2',
            source: 'create_page',
            status: 'completed',
            referenceImageUrl: uploadedImages.length > 0 ? uploadedImages[0] : undefined,
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.success && saveData.record?.id) {
          // 更新记录的 dbId
          setGenerationHistory(prev => prev.map(r =>
            r.id === recordId ? { ...r, dbId: saveData.record.id } : r
          ));
        }
      } catch {
        // 持久化失败不影响前端展示
      }
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
      // 保存到作品库
      const res = await fetch('/api/user-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          generation_id: record.dbId,
          images: record.images.map((img: { url: string }) => img.url),
          prompt: record.prompt,
          ratio: record.ratio,
          model: 'GPT Image 2',
          source: 'create_page',
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

  // ===== 删除生成记录 =====
  const handleDeleteRecord = useCallback(async (record: GenerationRecord) => {
    // 先从前端移除
    setGenerationHistory(prev => prev.filter(r => r.id !== record.id));
    // 如果有 dbId，同步删除数据库记录
    if (record.dbId) {
      try {
        await fetch(`/api/generation-records/${record.dbId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {
        // 静默失败
      }
    }
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
    // 空状态：从未生成过 → 3×2 精选案例
    if (generationHistory.length === 0) {
      return (
        <div className="os-showcase-page">
          {/* 标题区 - 左对齐 */}
          <div className="os-showcase-header">
            <h2 className="os-showcase-header-title">热门创作案例</h2>
            <p className="os-showcase-header-sub">点击案例快速开始</p>
            {/* 热门标签 */}
            <div className="os-showcase-tags">
              {HOT_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  className="os-showcase-tag"
                  onClick={() => {
                    setInputText(tag.prompt);
                    if (tag.ratio !== selectedRatio) setSelectedRatio(tag.ratio);
                    const textarea = document.querySelector<HTMLTextAreaElement>('.os-panel-textarea');
                    textarea?.focus();
                  }}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3×2 案例网格 */}
          <div className="os-showcase-masonry">
            {FEATURED_CASES.map((item, idx) => (
              <div
                key={idx}
                className="os-showcase-masonry-item"
                onClick={() => {
                  setInputText(item.prompt);
                  if (item.ratio !== selectedRatio) setSelectedRatio(item.ratio);
                }}
              >
                <div className="os-showcase-masonry-img">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  {/* 底部渐变信息区 */}
                  <div className="os-showcase-masonry-info">
                    <div className="os-showcase-masonry-info-title">{item.name}</div>
                    <div className="os-showcase-masonry-info-sub">{item.sub}</div>
                  </div>
                  {/* hover 遮罩 + 箭头按钮 */}
                  <div className="os-showcase-masonry-hover">
                    <div className="os-showcase-masonry-arrow">
                      <ArrowRight className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 创作流：所有记录（含 loading/error/done）
    const currentRecord = generationHistory[0]; // 最新的（可能是 loading）
    const historyRecords = generationHistory.slice(1); // 历史记录（不含当前）

    return (
      <div className="os-gen-flow">
        {/* 当前生成任务（始终展开） */}
        {currentRecord.status === 'loading' ? renderLoadingCard(currentRecord) :
         currentRecord.status === 'error' ? renderErrorCard(currentRecord) :
         renderDoneCard(currentRecord)}

        {/* 历史记录：每条默认折叠，点击展开 */}
        {historyRecords.length > 0 && (
          <div className="os-gen-history">
            <div className="os-gen-history-label">历史作品</div>
            <div className="os-gen-history-list">
              {historyRecords.map(record => renderDoneCard(record, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染单条创作流卡片（统一入口：loading/done/error 三态）

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
            <div className="os-gen-card-prompt" title={record.prompt}>
              {truncatePrompt(record.prompt)}
            </div>
          </div>
          {/* 右上角创作状态 */}
          <div className="os-gen-card-loading-status">
            <span className="os-gen-card-loading-dot" />
            <span>正在生成</span>
          </div>
        </div>

        {/* 动态阶段文案（单行轮播） */}
        <div className="os-gen-card-phase">
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

  // Done 卡片：支持展开/收起
  const renderDoneCard = (record: GenerationRecord, isHistoryItem = false) => {
    const isCurrentRecord = generationHistory[0]?.id === record.id && record.status === 'done';
    const isExpanded = isCurrentRecord || expandedRecordId === record.id;
    const timeStr = record.createdAt
      ? new Date(record.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <div key={record.id} className={`os-gen-card ${isHistoryItem ? 'os-gen-card--history' : ''} ${isExpanded ? 'os-gen-card--expanded' : 'os-gen-card--collapsed'}`}>
        {/* 收起态：缩略图 + 标题 + 时间 */}
        <div className="os-gen-card-summary" onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}>
          <div className="os-gen-card-summary-thumb">
            {record.images[0] ? <img src={record.images[0].url} alt="" /> : <span style={{color:'rgba(255,255,255,0.3)',fontSize:'10px'}}>IMG</span>}
          </div>
          <div className="os-gen-card-summary-info">
            <div className="os-gen-card-summary-title" title={record.prompt}>{truncatePrompt(record.prompt)}</div>
            <div className="os-gen-card-summary-time">{timeStr}</div>
          </div>
          <span className={`os-gen-card-summary-arrow ${isExpanded ? 'os-gen-card-summary-arrow--open' : ''}`}>▼</span>
        </div>

        {/* 展开态：完整内容 */}
        {isExpanded && (
          <>
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
              <button className="os-gen-action-btn os-gen-action-ghost os-gen-action-danger" onClick={() => handleDeleteRecord(record)}>
                <Trash2 className="w-4 h-4" /> 删除
              </button>
            </div>

            {/* 推荐衍生创作 */}
            <div className="os-gen-continue">
              <div className="os-gen-continue-label">推荐衍生创作</div>
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
          </>
        )}
      </div>
    );
  };

  return (
    <div className="os-page os-page-studio">
      <div className="os-studio-layout">

        {/* ===== 左侧：创作面板 ===== */}
        <aside className="os-studio-panel">
          {/* --- 模型品牌卡 --- */}
          <div className="os-panel-capability">
            <div className="os-panel-capability-label">OneClaw</div>
            <div className="os-panel-capability-subtitle">商业视觉创作</div>
            <span className="os-panel-capability-tech-tag">GPT Image 2</span>
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
                <ImagePlus className="os-panel-upload-icon" />
                <span className="os-panel-upload-text">上传图片</span>
                <span className="os-panel-upload-subtext">或拖拽到此处</span>
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
                placeholder="输入你的想法，越详细越好..."
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
                <span>重新创作</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4.5 h-4.5" />
                <span>开始创作</span>
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
