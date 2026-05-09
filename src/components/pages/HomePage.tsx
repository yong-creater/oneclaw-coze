'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Upload,
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
} from 'lucide-react';

// ===== AI 工具匹配规则 =====
interface ToolMatch {
  slug: string;
  name: string;
  type: string;       // gen type id for /create
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

// ===== 灵感建议 =====
const recommendChips = [
  { label: '生成高级耳机主图', example: '帮我生成高级耳机主图，白底高级感，多角度展示' },
  { label: '护肤品极简白底图', example: '护肤品极简白底图，高端质感，柔光效果' },
  { label: '小红书爆款封面', example: '小红书爆款封面，夏日护肤推荐，清新风格' },
  { label: '带货口播脚本', example: '零食带货口播脚本，3分钟节奏紧凑' },
];

// ===== 右侧预览图 =====
const showcaseExamples = [
  { title: '商品主图', category: '商品图', image: '/case-lipstick-main.png' },
  { title: '小红书封面', category: '小红书', image: '/demo-card-lifestyle.jpg' },
  { title: '详情页片段', category: '详情页', image: '/case-ecommerce.jpg' },
  { title: '视频封面', category: '视频脚本', image: '/demo-scene.jpg' },
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

// ===== 工具匹配算法 =====
function matchTool(input: string): ToolMatch | null {
  const lower = input.toLowerCase();
  let bestMatch: ToolMatch | null = null;
  let bestScore = 0;

  for (const tool of TOOL_MATCHES) {
    let score = 0;
    for (const kw of tool.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // longer keyword match = higher score
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 需求识别状态
  const [phase, setPhase] = useState<IdentifyPhase>('idle');
  const [matchedTool, setMatchedTool] = useState<ToolMatch | null>(null);
  const [identifyStep, setIdentifyStep] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // 识别文案轮播
  const identifySteps = [
    '正在理解你的需求...',
    '正在匹配最佳工具...',
  ];

  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // ===== AI 需求识别 + 跳转 =====
  const handleStartCreate = useCallback(() => {
    if (!inputText.trim() || phase !== 'idle') return;

    // 开始 AI 识别流程
    setPhase('identifying');
    setIdentifyStep(0);

    // Step 1: "正在理解你的需求..."
    setTimeout(() => setIdentifyStep(1), 800);

    // Step 2: 匹配结果
    setTimeout(() => {
      const tool = matchTool(inputText);
      if (tool) {
        setMatchedTool(tool);
        setPhase('matched');
      } else {
        setPhase('no-match');
      }
    }, 1800);

    // Step 3: 自动跳转（匹配成功时）
    setTimeout(() => {
      const tool = matchTool(inputText);
      if (tool) {
        setIsJumping(true);
        const params = new URLSearchParams({
          prompt: inputText.trim(),
          type: tool.type,
          toolId: tool.slug,
        });
        if (uploadedImage) params.set('image', uploadedImage);
        router.push(`/create?${params.toString()}`);
      }
    }, 3000);
  }, [inputText, uploadedImage, phase, router]);

  // 匹配成功但用户不想等，手动跳转
  const handleJumpNow = useCallback(() => {
    if (!matchedTool) return;
    setIsJumping(true);
    const params = new URLSearchParams({
      prompt: inputText.trim(),
      type: matchedTool.type,
      toolId: matchedTool.slug,
    });
    if (uploadedImage) params.set('image', uploadedImage);
    router.push(`/create?${params.toString()}`);
  }, [matchedTool, inputText, uploadedImage, router]);

  // 无匹配时，跳转到工具库
  const handleBrowseTools = useCallback(() => {
    router.push('/tools');
  }, [router]);

  // 无匹配时，仍然跳转到工作台（自动识别模式）
  const handleAutoCreate = useCallback(() => {
    setIsJumping(true);
    const params = new URLSearchParams({
      prompt: inputText.trim(),
      type: 'auto',
    });
    if (uploadedImage) params.set('image', uploadedImage);
    router.push(`/create?${params.toString()}`);
  }, [inputText, uploadedImage, router]);

  // 重置识别状态
  const resetIdentify = useCallback(() => {
    setPhase('idle');
    setMatchedTool(null);
    setIdentifyStep(0);
    setIsJumping(false);
  }, []);

  // Ctrl+Enter 快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleStartCreate();
    }
  }, [handleStartCreate]);

  // Chip 点击
  const handleChipClick = useCallback((example: string) => {
    setInputText(example);
    resetIdentify();
  }, [resetIdentify]);

  // 上传图片
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 预览用 data URL，跳转时传给工作台
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  // 删除上传图片
  const removeUploadedImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区 ==================== */}
      <div className="os-hero">
        {/* 内容层 */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1100px] mx-auto px-4">

          {/* 主标题 */}
          <h1 className="os-hero-title">
            上传图片，一键生成<span className="gradient-text">高质量内容</span>
          </h1>

          {/* 副标题 */}
          <p className="os-hero-subtitle">
            商品图、详情页、小红书、视频脚本，<br className="sm:hidden" />简单输入需求就能生成。
          </p>

          {/* ===== AI 输入工作台 — 左右分栏 ===== */}
          <div className="os-studio mt-10">
            {/* 左侧：输入区 (60%) */}
            <div className="os-studio-input">
              <h3 className="os-studio-label">你想生成什么？</h3>
              <div className="os-studio-input-area">
                <div className="relative">
                  {!inputText && !uploadedImage && (
                    <div className="os-studio-placeholder" onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}>
                      <p className="os-studio-placeholder-example">例如：上传一张耳机图，生成电商主图、卖点图和场景图</p>
                    </div>
                  )}
                  <textarea
                    value={inputText}
                    onChange={(e) => { setInputText(e.target.value.slice(0, 500)); if (phase !== 'idle') resetIdentify(); }}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    className="os-studio-textarea"
                    rows={6}
                  />
                </div>

                {/* 上传图片预览 */}
                {uploadedImage && (
                  <div className="os-upload-preview">
                    <img src={uploadedImage} alt="已上传" className="os-upload-preview-img" />
                    <button onClick={removeUploadedImage} className="os-upload-preview-remove">
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {/* 底部工具栏 */}
              <div className="os-studio-toolbar">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button className="os-studio-tool-btn" onClick={handleUploadClick}>
                    <Upload className="w-4 h-4" />
                    <span>上传图片</span>
                  </button>
                  <span className="text-[12px] text-slate-300 ml-1">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleStartCreate}
                  disabled={!inputText.trim() || phase !== 'idle'}
                  className="os-studio-cta"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{phase === 'idle' ? '开始创作' : '识别中...'}</span>
                </button>
              </div>

              {/* ===== AI 识别状态浮层 ===== */}
              {phase !== 'idle' && (
                <div className="os-identify-overlay">
                  {/* 识别中 */}
                  {phase === 'identifying' && (
                    <div className="os-identify-loading">
                      <div className="os-identify-spinner" />
                      <span className="os-identify-text">{identifySteps[identifyStep]}</span>
                    </div>
                  )}

                  {/* 匹配成功 */}
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

                  {/* 无匹配 */}
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

            {/* 右侧：AI 生成效果预览 (35%) */}
            <div className="os-studio-showcase">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">✨</span>
                <span className="text-[13px] font-medium text-slate-500">生成效果预览</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">根据你的需求自动生成对应内容</p>
              <div className="grid grid-cols-2 gap-3">
                {showcaseExamples.map((example, idx) => (
                  <div key={idx} className="os-showcase-item group">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <span className="inline-block text-[11px] font-medium text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {example.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== 灵感建议 chips ===== */}
          <div className="os-chips-bar mt-6">
            <span className="os-chips-label">灵感建议</span>
            <div className="os-chips-list">
              {recommendChips.map((chip) => (
                <button
                  key={chip.label}
                  className="os-chip"
                  onClick={() => handleChipClick(chip.example)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

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
