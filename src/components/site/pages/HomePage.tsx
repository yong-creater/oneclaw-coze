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

  // 直接跳转到创作页（不再创建任务，创作页自己处理生成）
  const params = new URLSearchParams();
  if (cleanedPrompt) params.set('prompt', cleanedPrompt);
  if (opts.autoGenerate) params.set('auto', '1');
  params.set('style', style);
  params.set('ratio', ratio);
  params.set('count', count);

  router.push(`/create?${params.toString()}`);
}

// ===== 动态示例轮播 =====
const examplePrompts = [
  '生成一个未来感新能源发布会海报',
  '做一个赛博朋克人物',
  '设计一个咖啡品牌包装',
  '生成行业分析图',
  '设计高级感网站 Banner',
  '创作一幅赛博朋克城市夜景',
  '设计一个极简主义香水品牌视觉',
  '生成一张复古胶片风旅行照片',
  '制作一张音乐节主视觉海报',
  '设计一个潮牌 T 恤印花图案',
];

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

const MAX_UPLOAD_IMAGES = 5;

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const { requireAuth, dailyQuota } = useUser();
  const { showAlert } = useModal();
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [exampleVisible, setExampleVisible] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // 动态示例轮播
  useEffect(() => {
    if (inputText.trim()) return;
    const interval = setInterval(() => {
      setExampleVisible(false);
      setTimeout(() => {
        setExampleIndex((prev) => (prev + 1) % examplePrompts.length);
        setExampleVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, [inputText]);

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

  // 创作入口
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
    if (e.key === 'Enter' && !e.shiftKey) {
      // 移动端单行输入体验
    }
  }, [handleStartCreate]);

  const handleExampleClick = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  const handleUploadClick = useCallback(() => { fileInputRef.current?.click(); }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addImageFiles(e.target.files);
    e.target.value = '';
  }, [addImageFiles]);
  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);
  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  // Carousel scroll
  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 280;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  return (
    <div className="os-page os-page-hero">
      {/* ==================== Hero 居中创作区 ==================== */}
      <div className="os-hero-center">
        <div className="os-hero-noise" />

        {/* 标题 */}
        <div className="os-hero-center-header">
          <h1 className="os-hero-center-title">
            你想创造什么<span className="gradient-text">？</span>
          </h1>
          <p className="os-hero-center-subtitle">
            输入一句话，生成任何视觉内容。
          </p>
        </div>

        {/* 输入区 */}
        <div className={`os-hero-center-input ${isDragOver ? 'os-hero-center-input-dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 参考图预览 */}
          {uploadedImages.length > 0 && (
            <div className="os-center-upload-previews">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="os-center-upload-item">
                  <img src={img} alt={`参考图${idx + 1}`} className="os-center-upload-img" />
                  <button onClick={() => removeImage(idx)} className="os-center-upload-remove"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="os-center-input-row">
            {/* 上传按钮 */}
            <button onClick={handleUploadClick} className="os-center-upload-btn" title="添加参考图">
              <ImagePlus className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />

            {/* 文本输入 */}
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value.slice(0, 500)); }}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="os-center-textarea"
              rows={2}
            />

            {/* 生成按钮 */}
            <button
              onClick={handleStartCreate}
              disabled={!inputText.trim() || isTransitioning}
              className="os-center-cta"
            >
              <Wand2 className="w-4.5 h-4.5" />
              <span>生成</span>
            </button>
          </div>

          {/* 底部信息行 */}
          <div className="os-center-input-footer">
            <div className="os-center-example-row">
              <Sparkles className="w-3.5 h-3.5 text-[#7B61FF]/50 flex-shrink-0" />
              <span
                className={`os-center-example-text ${exampleVisible ? 'os-center-example-visible' : 'os-center-example-hidden'}`}
                onClick={() => {
                  if (!inputText.trim()) handleExampleClick(examplePrompts[exampleIndex]);
                }}
              >
                {examplePrompts[exampleIndex]}
              </span>
            </div>
            <span className="os-center-char-count">{inputText.length} / 500</span>
          </div>
        </div>

        {/* 快捷标签 */}
        {!inputText.trim() && (
          <div className="os-center-chips">
            {['海报设计', '人物形象', '品牌包装', '数据图表', '网站 Banner', '插画风格'].map((label) => (
              <button
                key={label}
                className="os-center-chip"
                onClick={() => {
                  const prompts: Record<string, string> = {
                    '海报设计': '设计一张科技发布会海报，未来感十足',
                    '人物形象': '生成一个赛博朋克风格人物形象',
                    '品牌包装': '设计一个高端咖啡品牌包装',
                    '数据图表': '生成一张行业分析数据可视化图表',
                    '网站 Banner': '设计一个高级感网站首页 Banner',
                    '插画风格': '创作一幅日系清新风格插画',
                  };
                  handleExampleClick(prompts[label] || label);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* 参考图上传区（当没有上传时显示小入口） */}
        {uploadedImages.length === 0 && (
          <div
            className="os-center-upload-hint"
            onClick={handleUploadClick}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>添加参考图（可选）</span>
          </div>
        )}
        {uploadedImages.length > 0 && canUploadMore && (
          <div className="os-center-upload-hint" onClick={handleUploadClick}>
            <ImagePlus className="w-3.5 h-3.5" />
            <span>继续添加 · 已选 {uploadedImages.length}/{MAX_UPLOAD_IMAGES}</span>
          </div>
        )}
        {uploadedImages.length >= MAX_UPLOAD_IMAGES && (
          <div className="os-center-upload-hint os-center-upload-full">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>已选 {MAX_UPLOAD_IMAGES} 张参考图</span>
          </div>
        )}
      </div>

      {/* ==================== 创作灵感 — 横向轮播 ==================== */}
      <section className="os-hot-section">
        <div className="os-content">
          <div className="os-hot-header">
            <div>
              <div className="os-hot-title-row">
                <TrendingUp className="w-5 h-5 text-[#7B61FF]/60" />
                <h2 className="os-hot-title">创作灵感</h2>
              </div>
              <p className="os-hot-subtitle">看看 OneClaw 能为你创造什么</p>
            </div>
            <div className="os-hot-nav">
              <button onClick={() => scrollCarousel('left')} className="os-hot-nav-btn"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scrollCarousel('right')} className="os-hot-nav-btn"><ChevronRight className="w-5 h-5" /></button>
              <button onClick={() => router.push('/inspiration')} className="os-hot-more">
                查看更多 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="os-hot-carousel" ref={carouselRef}>
            {hotInspirations.map((item, idx) => (
              <div
                key={idx}
                className="os-hot-card"
                onClick={() => handleExampleClick(item.examplePrompt)}
              >
                <div className="os-hot-card-img-wrap">
                  <img src={item.image} alt={item.title} className="os-hot-card-img" loading="lazy" />
                  <div className="os-hot-card-hover">
                    <button
                      className="os-hot-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputText(item.examplePrompt);
                      }}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>试试这个</span>
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
