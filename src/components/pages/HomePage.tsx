'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  ArrowRight,
  Wand2,
  TrendingUp,
  Sparkles,
  Check,
  Package,
  BookOpen,
  Heart,
  X,
  Scissors,
  PenTool,
  FileText,
  ImagePlus,
} from 'lucide-react';

// ===== AI 工具匹配规则 =====
interface ToolMatch {
  slug: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  keywords: string[];
  description: string;
}

const TOOL_MATCHES: ToolMatch[] = [
  {
    slug: 'product-generator',
    name: 'AI商品图生成器',
    type: 'product',
    icon: <Package className="w-4 h-4" />,
    keywords: ['商品图', '商品主图', '主图', '电商图', '淘宝图', '产品图', '白底图', '场景图', '卖点图', '电商', '淘宝', '京东', '拼多多', '商品照', '产品照', '耳机', '手机壳', '护肤品', '零食', '服装'],
    description: '3秒生成可直接用于淘宝/小红书的高级商品图',
  },
  {
    slug: 'xiaohongshu-generator',
    name: '小红书爆款生成器',
    type: 'xiaohongshu',
    icon: <BookOpen className="w-4 h-4" />,
    keywords: ['小红书', '种草', '封面', '笔记', '爆款', '涨粉', '好物推荐', '测评', '分享', '穿搭', '美妆', '护肤'],
    description: '爆款小红书内容一键生成，涨粉必备神器',
  },
  {
    slug: 'ai-photo',
    name: 'AI写真生成器',
    type: 'aiphoto',
    icon: <Heart className="w-4 h-4" />,
    keywords: ['写真', '人像', '肖像', '自拍', '头像', '氛围感', '大片', '证件照', '形象照', '个人照'],
    description: '一键生成氛围感写真大片，朋友圈C位担当',
  },
  {
    slug: 'background-removal',
    name: 'AI智能抠图',
    type: 'removebg',
    icon: <Scissors className="w-4 h-4" />,
    keywords: ['抠图', '去背景', '去底', '透明底', '白底图', '换背景', '抠人', '抠产品', '批量抠图'],
    description: '一键智能抠图，3秒出电商白底图和证件照',
  },
  {
    slug: 'product-page',
    name: '商品详情页生成器',
    type: 'detail',
    icon: <FileText className="w-4 h-4" />,
    keywords: ['详情页', '详情', '长图', '卖点', '规格', '参数', '详情页设计', '产品详情', '宝贝详情'],
    description: '自动生成电商详情长图和卖点排版',
  },
  {
    slug: 'novel',
    name: '小说创作工坊',
    type: 'novel',
    icon: <PenTool className="w-4 h-4" />,
    keywords: ['小说', '故事', '大纲', '角色', '剧情', '写作', '创作', '短剧', 'IP'],
    description: 'AI辅助小说创作，从大纲到正文一键生成',
  },
];

// ===== AI 需求识别状态 =====
type IdentifyPhase = 'idle' | 'identifying' | 'matched' | 'no-match';

// ===== 试试这些创作 — pills 标签（精简到4个） =====
const tryChips = [
  { label: '🔥 商品主图', prompt: '帮我生成高级感耳机商品图，白底高级感，多角度展示' },
  { label: '🔥 小红书封面', prompt: '生成小红书护肤封面，夏日清新风格' },
  { label: '🔥 AI写真', prompt: '生成高级感AI写真头像，氛围感大片' },
  { label: '🔥 海报设计', prompt: '做一张夏日饮品海报，清新文艺风格' },
];

// ===== Placeholder 轮播文案 =====
const placeholderTexts = [
  '生成高级感耳机商品图',
  '生成小红书护肤封面',
  '生成 AI 写真头像',
  '生成高级咖啡海报',
  '生成电商详情页长图',
  '生成高级时尚大片',
  '做一张夏日饮品海报',
  '生成穿搭种草封面图',
];

// ===== 右侧预览图 — 带生成描述 =====
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
    title: '详情页片段',
    category: '详情页',
    image: '/case-ecommerce.jpg',
    generating: '小红书穿搭大片',
  },
  {
    title: 'AI写真',
    category: 'AI写真',
    image: '/demo-scene.jpg',
    generating: '高级咖啡海报',
  },
];

// ===== 热门案例 =====
const hotResults = [
  {
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=450&fit=crop&auto=format&q=80',
    type: '商品图',
    title: '高级护肤品主图',
    examplePrompt: '帮我生成高级护肤品商品图，白底高级感',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=450&fit=crop&auto=format&q=80',
    type: '小红书',
    title: '夏日穿搭种草图',
    examplePrompt: '生成小红书穿搭种草图，清新文艺风格',
  },
  {
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop&auto=format&q=80',
    type: '详情页',
    title: '家居好物卖点长图',
    examplePrompt: '生成家居好物详情长图，极简风格',
  },
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format&q=80',
    type: '商品图',
    title: '数码产品主图',
    examplePrompt: '生成数码产品商品主图，深色科技风',
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
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = tool;
    }
  }

  return bestMatch;
}

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // AI 需求识别状态
  const [phase, setPhase] = useState<IdentifyPhase>('idle');
  const [matchedTool, setMatchedTool] = useState<ToolMatch | null>(null);
  const [identifyStep, setIdentifyStep] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Placeholder 轮播
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  // 拖拽状态
  const [isDragOver, setIsDragOver] = useState(false);

  // 右侧案例轮播
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseFading, setShowcaseFading] = useState(false);

  // 识别文案轮播
  const identifySteps = [
    '正在理解你的需求...',
    '正在匹配最佳工具...',
  ];

  // Placeholder 自动轮播 — 用 CSS opacity 过渡避免布局抖动
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

  // 右侧案例自动轮播 — 5秒切换，淡入淡出
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

  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // ===== 多图上传辅助 =====
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

  // ===== 拖拽上传 =====
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      addImageFiles(e.dataTransfer.files);
    }
  }, [addImageFiles]);

  // ===== AI 需求识别 + 跳转 =====
  const handleStartCreate = useCallback(() => {
    if (!inputText.trim() || phase !== 'idle') return;

    setPhase('identifying');
    setIdentifyStep(0);

    setTimeout(() => setIdentifyStep(1), 800);

    setTimeout(() => {
      const tool = matchTool(inputText);
      if (tool) {
        setMatchedTool(tool);
        setPhase('matched');
      } else {
        setPhase('no-match');
      }
    }, 1800);

    setTimeout(() => {
      const tool = matchTool(inputText);
      if (tool) {
        setIsJumping(true);
        const params = new URLSearchParams({
          prompt: inputText.trim(),
          type: tool.type,
          toolId: tool.slug,
        });
        if (uploadedImages.length > 0) params.set('images', JSON.stringify(uploadedImages));
        router.push(`/create?${params.toString()}`);
      }
    }, 3000);
  }, [inputText, uploadedImages, phase, router]);

  const handleJumpNow = useCallback(() => {
    if (!matchedTool) return;
    setIsJumping(true);
    const params = new URLSearchParams({
      prompt: inputText.trim(),
      type: matchedTool.type,
      toolId: matchedTool.slug,
    });
    if (uploadedImages.length > 0) params.set('images', JSON.stringify(uploadedImages));
    router.push(`/create?${params.toString()}`);
  }, [matchedTool, inputText, uploadedImages, router]);

  const handleBrowseTools = useCallback(() => {
    router.push('/tools');
  }, [router]);

  const handleAutoCreate = useCallback(() => {
    setIsJumping(true);
    const params = new URLSearchParams({
      prompt: inputText.trim(),
      type: 'auto',
    });
    if (uploadedImages.length > 0) params.set('images', JSON.stringify(uploadedImages));
    router.push(`/create?${params.toString()}`);
  }, [inputText, uploadedImages, router]);

  const resetIdentify = useCallback(() => {
    setPhase('idle');
    setMatchedTool(null);
    setIdentifyStep(0);
    setIsJumping(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleStartCreate();
    }
  }, [handleStartCreate]);

  const handleChipClick = useCallback((prompt: string) => {
    setInputText(prompt);
    resetIdentify();
  }, [resetIdentify]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImageFiles(e.target.files);
    }
    e.target.value = '';
  }, [addImageFiles]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const canUploadMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  // 当前展示的案例
  const currentShowcase = showcaseExamples[showcaseIndex];

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区 ==================== */}
      <div className="os-hero">
        {/* 噪点纹理 */}
        <div className="os-hero-noise" />

        {/* 氛围光斑 */}
        <div className="os-hero-glow-orb os-hero-glow-1" />
        <div className="os-hero-glow-orb os-hero-glow-2" />

        {/* 内容层 */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1200px] mx-auto px-4">

          {/* 主标题 — PC端单行 nowrap，移动端允许换行 */}
          <h1 className="os-hero-title">
            上传图片，一键生成<span className="gradient-text">高质量内容</span>
          </h1>

          {/* 副标题 */}
          <p className="os-hero-subtitle">
            商品图、小红书、详情页、AI写真、封面海报等内容，简单输入需求即可生成。
          </p>

          {/* ===== AI 创作输入区 — 左右分栏 ===== */}
          <div className="os-studio mt-10">
            {/* 左侧：输入区 (65%) */}
            <div className="os-studio-input">
              {/* AI 创作描述框 */}
              <div className="os-studio-input-area">
                {/* 轮播 placeholder — 始终占位，避免布局抖动 */}
                <div
                  className={`os-studio-placeholder ${placeholderVisible && !inputText ? 'os-studio-placeholder-visible' : 'os-studio-placeholder-hidden'}`}
                  onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}
                >
                  <p className="os-studio-placeholder-example">
                    {placeholderTexts[placeholderIndex]}
                  </p>

                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value.slice(0, 500)); if (phase !== 'idle') resetIdentify(); }}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className="os-studio-textarea"
                />

                {/* 上传图片预览 — 多图横向排列 */}
                {uploadedImages.length > 0 && (
                  <div className="os-upload-previews">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="os-upload-preview-item">
                        <img src={img} alt={`参考图${idx + 1}`} className="os-upload-preview-img" />
                        <button onClick={() => removeImage(idx)} className="os-upload-preview-remove">
                          <X />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 拖拽上传区域 — 带能力说明 */}
              {canUploadMore && (
                <div
                  ref={dropZoneRef}
                  className={`os-dropzone ${isDragOver ? 'os-dropzone-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="os-dropzone-icon">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <div className="os-dropzone-text">
                    <span className="os-dropzone-title">
                      {uploadedImages.length > 0 ? '继续添加参考图' : '上传参考图片'}
                    </span>
                    <span className="os-dropzone-formats">
                      支持拖拽上传{uploadedImages.length > 0 ? ` · 已选 ${uploadedImages.length}/${MAX_UPLOAD_IMAGES}` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* 已达上限提示 */}
              {!canUploadMore && (
                <div className="os-dropzone os-dropzone-full">
                  <div className="os-dropzone-icon">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="os-dropzone-text">
                    <span className="os-dropzone-title">已选 {MAX_UPLOAD_IMAGES} 张参考图</span>
                    <span className="os-dropzone-formats">点击已有图片的 × 可移除</span>
                  </div>
                </div>
              )}

              {/* 试试这些创作 — pills 标签 */}
              {!inputText.trim() && phase === 'idle' && (
                <div className="os-try-chips-bar">
                  <span className="os-try-chips-label">试试这些创作</span>
                  <div className="os-try-chips-list">
                    {tryChips.map((chip) => (
                      <button
                        key={chip.label}
                        className="os-try-chip"
                        onClick={() => handleChipClick(chip.prompt)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 底部工具栏 */}
              <div className="os-studio-toolbar">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-300 ml-1">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleStartCreate}
                  disabled={!inputText.trim() || phase !== 'idle'}
                  className="os-studio-cta"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>{phase === 'idle' ? '立即开始创作' : '识别中...'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* ===== AI 识别状态浮层 ===== */}
              {phase !== 'idle' && (
                <div className="os-identify-overlay">
                  {phase === 'identifying' && (
                    <div className="os-identify-loading">
                      <div className="os-identify-spinner" />
                      <span className="os-identify-text">{identifySteps[identifyStep]}</span>
                    </div>
                  )}

                  {phase === 'matched' && matchedTool && (
                    <div className="os-identify-matched">
                      <div className="os-identify-matched-icon">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div className="os-identify-matched-info">
                        <span className="os-identify-matched-label">已为你匹配</span>
                        <span className="os-identify-matched-name">
                          {matchedTool.icon}
                          <span className="ml-1.5">{matchedTool.name}</span>
                        </span>
                      </div>
                      <button onClick={handleJumpNow} className="os-identify-jump-btn" disabled={isJumping}>
                        {isJumping ? '跳转中...' : '立即前往'}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  )}

                  {phase === 'no-match' && (
                    <div className="os-identify-nomatch">
                      <div className="os-identify-nomatch-info">
                        <span className="os-identify-nomatch-title">未找到完全匹配的工具</span>
                        <span className="os-identify-nomatch-desc">OneClaw 当前更擅长：</span>
                      </div>
                      <div className="os-identify-nomatch-tools">
                        {TOOL_MATCHES.map(tool => (
                          <span key={tool.slug} className="os-identify-nomatch-tag">
                            {tool.icon}
                            <span className="ml-1">{tool.name.replace('AI', '').replace('生成器', '').replace('工坊', '')}</span>
                          </span>
                        ))}
                      </div>
                      <div className="os-identify-nomatch-actions">
                        <button onClick={handleAutoCreate} className="os-identify-auto-btn">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>自动识别创作</span>
                        </button>
                        <button onClick={handleBrowseTools} className="os-identify-browse-btn">
                          浏览工具库
                        </button>
                        <button onClick={resetIdentify} className="os-identify-cancel-btn">
                          返回修改
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 右侧：AI 创作灵感 (35%) */}
            <div className="os-studio-showcase">
              <div className="os-showcase-header">
                <span className="os-showcase-title">AI 创作灵感</span>
              </div>

              {/* 主展示区 — 当前高亮案例 */}
              <div className={`os-showcase-featured ${showcaseFading ? 'os-showcase-fading' : ''}`}>
                <div className="os-showcase-featured-img-wrap">
                  <img
                    src={currentShowcase.image}
                    alt={currentShowcase.title}
                    className="os-showcase-featured-img"
                  />
                  {/* shimmer 扫光 */}
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

              {/* 缩略图列表 */}
              <div className="os-showcase-thumbs">
                {showcaseExamples.map((example, idx) => (
                  <div
                    key={idx}
                    className={`os-showcase-thumb ${idx === showcaseIndex ? 'os-showcase-thumb-active' : ''}`}
                    onClick={() => {
                      setShowcaseFading(true);
                      setTimeout(() => {
                        setShowcaseIndex(idx);
                        setShowcaseFading(false);
                      }, 300);
                    }}
                  >
                    <img src={example.image} alt={example.title} className="os-showcase-thumb-img" />
                    <span className="os-showcase-thumb-label">{example.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== 旧的灵感建议 chips — 移除，已由试试这些创作替代 ===== */}

        </div>
      </div>

      {/* ==================== 热门创作结果 ==================== */}
      <section className="relative animate-fade-slide-up mt-16 pb-8" style={{ animationDelay: '0.15s' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#7B61FF]/60" />
                <h2 className="text-xl font-semibold text-slate-700">热门生成案例</h2>
              </div>
              <p className="text-[13px] text-slate-400 mt-1.5 ml-8">看看 OneClaw 能生成哪些内容</p>
            </div>
            <button
              onClick={() => router.push('/tools')}
              className="text-sm text-slate-400 hover:text-[#7B61FF] transition-colors flex items-center gap-1"
            >
              查看更多 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="os-result-grid">
            {hotResults.map((item, idx) => (
              <div
                key={idx}
                className="os-result-card group cursor-pointer"
                onClick={() => {
                  const params = new URLSearchParams({ prompt: item.examplePrompt });
                  router.push(`/create?${params.toString()}`);
                }}
              >
                <div className="os-result-card-image">
                  <img src={item.image} alt={item.title} className="os-result-card-img" loading="lazy" />
                  <span className="os-result-card-type">{item.type}</span>
                  <div className="os-result-card-overlay">
                    <button
                      className="os-result-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        const params = new URLSearchParams({ prompt: item.examplePrompt });
                        router.push(`/create?${params.toString()}`);
                      }}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>用这个生成</span>
                    </button>
                  </div>
                </div>
                <div className="os-result-card-info">
                  <p className="os-result-card-title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
