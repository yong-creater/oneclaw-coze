'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wand2,
  ImagePlus,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Upload,
  Zap,
  ChevronDown,
  Palette,
  SlidersHorizontal,
  Crown,
} from 'lucide-react';
import { useMenu } from '@/components/site/common/MenuProvider';
import { useUser } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

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

async function navigateToCreate(
  router: ReturnType<typeof useRouter>,
  opts: {
    prompt?: string;
    uploadedImages?: string[];
    autoGenerate?: boolean;
  }
): Promise<void> {
  const cleanedPrompt = stripLayoutKeywords(opts.prompt || '');

  const context: Record<string, unknown> = {};
  if (cleanedPrompt) context.prompt = cleanedPrompt;
  if (opts.uploadedImages && opts.uploadedImages.length > 0) {
    context.images = opts.uploadedImages.map((url, i) => ({
      id: `upload-${Date.now()}-${i}`,
      url,
      name: `参考图${i + 1}`,
    }));
  }
  if (opts.autoGenerate) context.autoGenerate = true;

  // 简单风格推荐
  const lower = (cleanedPrompt || '').toLowerCase();
  let style = 'premium';
  let ratio = '3:4';
  let count = '4';
  if (lower.includes('海报') || lower.includes('banner') || lower.includes('封面')) { style = 'premium'; ratio = '3:4'; count = '3'; }
  if (lower.includes('人物') || lower.includes('写真') || lower.includes('人像')) { style = 'luxury'; ratio = '3:4'; count = '4'; }
  if (lower.includes('包装') || lower.includes('品牌')) { style = 'minimal'; ratio = '1:1'; count = '4'; }
  if (lower.includes('深色') || lower.includes('暗黑') || lower.includes('科技') || lower.includes('赛博')) { style = 'tech'; }
  if (lower.includes('清新') || lower.includes('文艺') || lower.includes('日系')) { style = 'fresh'; }
  if (lower.includes('极简') || lower.includes('简约')) { style = 'minimal'; }
  if (lower.includes('可爱') || lower.includes('甜美')) { style = 'cute'; }
  if (lower.includes('复古') || lower.includes('胶片')) { style = 'retro-film'; }

  const layoutMode = parseLayoutMode(cleanedPrompt);
  context.analysisResult = { tool: 'product-generator', style, ratio, count, layoutMode };

  try {
    sessionStorage.setItem(CREATE_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // ignore
  }

  const params = new URLSearchParams();
  if (cleanedPrompt) params.set('prompt', cleanedPrompt);
  if (opts.autoGenerate) params.set('auto', '1');
  params.set('style', style);
  params.set('ratio', ratio);
  params.set('count', count);

  router.push(`/create?${params.toString()}`);
}

// ===== 热门创作灵感 =====
const hotInspirations = [
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=750&fit=crop&auto=format&q=80',
    type: '海报',
    title: '未来感发布会海报',
    examplePrompt: '生成一个未来感新能源发布会海报',
  },
  {
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=750&fit=crop&auto=format&q=80',
    type: '人物',
    title: '赛博朋克风格人物',
    examplePrompt: '做一个赛博朋克人物',
  },
  {
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=600&h=750&fit=crop&auto=format&q=80',
    type: '包装',
    title: '咖啡品牌包装设计',
    examplePrompt: '设计一个咖啡品牌包装',
  },
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=750&fit=crop&auto=format&q=80',
    type: '数据',
    title: '行业分析图',
    examplePrompt: '生成行业分析图',
  },
  {
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=750&fit=crop&auto=format&q=80',
    type: 'Banner',
    title: '高级感网站 Banner',
    examplePrompt: '设计高级感网站 Banner',
  },
  {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=750&fit=crop&auto=format&q=80',
    type: '风景',
    title: '赛博朋克城市夜景',
    examplePrompt: '创作一幅赛博朋克城市夜景',
  },
  {
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=750&fit=crop&auto=format&q=80',
    type: '品牌',
    title: '极简香水品牌视觉',
    examplePrompt: '设计一个极简主义香水品牌视觉',
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=750&fit=crop&auto=format&q=80',
    type: '摄影',
    title: '复古胶片风旅行照',
    examplePrompt: '生成一张复古胶片风旅行照片',
  },
];

// ===== 面板参数选项 =====
const RATIO_OPTIONS = [
  { value: '1:1', label: '1:1', w: 16, h: 16 },
  { value: '3:4', label: '3:4', w: 12, h: 16 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
];

const QUALITY_OPTIONS = [
  { value: 'standard', label: '标准' },
  { value: 'hd', label: '高清' },
];

const STYLE_OPTIONS = [
  { value: 'auto', label: '自动' },
  { value: 'cinematic', label: '电影感' },
  { value: 'commercial', label: '商业设计' },
  { value: 'trendy', label: '潮流艺术' },
  { value: 'futuristic', label: '未来科技' },
  { value: 'minimal', label: '极简高级' },
];

const MAX_UPLOAD_IMAGES = 5;

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const { requireAuth, dailyQuota } = useUser();
  const { showAlert } = useModal();

  // ===== 面板状态 =====
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = useState('3:4');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [selectedStyle, setSelectedStyle] = useState('auto');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // ===== 生成入口 =====
  const handleStartCreate = useCallback(() => {
    if (!inputText.trim() || isTransitioning) return;
    if (dailyQuota !== null && dailyQuota !== -2 && dailyQuota !== -1 && dailyQuota <= 0) {
      showAlert('今日免费额度已用完', '注册登录后可继续生成作品，并同步保存你的创作记录。', 'quota-exhausted');
      requireAuth();
      return;
    }
    if (!requireAuth()) return;

    setIsTransitioning(true);
    navigateToCreate(router, {
      prompt: inputText.trim(),
      uploadedImages,
      autoGenerate: true,
    });
  }, [inputText, uploadedImages, isTransitioning, router, dailyQuota, requireAuth, showAlert]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleStartCreate(); }
  }, [handleStartCreate]);

  // ===== Carousel =====
  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 260;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  const handleInspirationClick = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  return (
    <div className="os-page os-page-studio">
      {/* ==================== 两栏布局：面板 + 灵感流 ==================== */}
      <div className="os-studio-layout">

        {/* ===== 左侧：创作面板 ===== */}
        <aside className="os-studio-panel">
          {/* --- 模型区域 --- */}
          <div className="os-panel-model">
            <div className="os-panel-model-header">
              <div className="os-panel-model-icon">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="os-panel-model-info">
                <div className="os-panel-model-name">GPT Image 2</div>
                <div className="os-panel-model-desc">高质量 AI 视觉生成</div>
              </div>
            </div>
          </div>

          {/* --- 分隔线 --- */}
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

            {/* 质量 */}
            <div className="os-panel-params-row">
              <div className="os-panel-params-label">
                <Crown className="w-3.5 h-3.5" />
                <span>质量</span>
              </div>
              <div className="os-panel-params-options">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`os-panel-quality-btn ${selectedQuality === opt.value ? 'os-panel-quality-active' : ''}`}
                    onClick={() => setSelectedQuality(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 风格 */}
            <div className="os-panel-params-row">
              <div className="os-panel-params-label">
                <Palette className="w-3.5 h-3.5" />
                <span>风格</span>
              </div>
              <div className="os-panel-params-options os-panel-style-options">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`os-panel-style-btn ${selectedStyle === opt.value ? 'os-panel-style-active' : ''}`}
                    onClick={() => setSelectedStyle(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- 生成按钮 --- */}
          <button
            onClick={handleStartCreate}
            disabled={!inputText.trim() || isTransitioning}
            className="os-panel-generate-btn"
          >
            {isTransitioning ? (
              <>
                <span className="os-panel-generate-spinner" />
                <span>准备中...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4.5 h-4.5" />
                <span>开始生成</span>
              </>
            )}
          </button>
        </aside>

        {/* ===== 右侧：灵感流 ===== */}
        <main className="os-studio-feed">
          <div className="os-feed-header">
            <div className="os-feed-header-left">
              <TrendingUp className="w-4.5 h-4.5 text-[#7B61FF]/60" />
              <h2 className="os-feed-title">创作灵感</h2>
              <span className="os-feed-count">{hotInspirations.length} 个创意</span>
            </div>
            <div className="os-feed-header-right">
              <button onClick={() => scrollCarousel('left')} className="os-feed-nav-btn"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => scrollCarousel('right')} className="os-feed-nav-btn"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="os-feed-grid" ref={carouselRef}>
            {hotInspirations.map((item, idx) => (
              <div
                key={idx}
                className="os-feed-card"
                onClick={() => handleInspirationClick(item.examplePrompt)}
              >
                <div className="os-feed-card-img-wrap">
                  <img src={item.image} alt={item.title} className="os-feed-card-img" loading="lazy" />
                  <div className="os-feed-card-hover">
                    <button
                      className="os-feed-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputText(item.examplePrompt);
                      }}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>试试这个</span>
                    </button>
                  </div>
                </div>
                <div className="os-feed-card-info">
                  <span className="os-feed-card-type">{item.type}</span>
                  <p className="os-feed-card-title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ===== 过渡浮层 ===== */}
      {isTransitioning && (
        <div className="os-ai-overlay">
          <div className="os-ai-card">
            <div className="os-ai-card-glow" />
            <div className="os-ai-analyzing">
              <div className="os-ai-msg-wrap">
                <span className="os-ai-msg">正在准备创作环境…</span>
              </div>
              <div className="os-ai-pulse-dots">
                <span className="os-ai-pulse-dot" style={{ animationDelay: '0s' }} />
                <span className="os-ai-pulse-dot" style={{ animationDelay: '0.4s' }} />
                <span className="os-ai-pulse-dot" style={{ animationDelay: '0.8s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
