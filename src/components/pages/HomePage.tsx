'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Upload,
  ArrowRight,
  Wand2,
  TrendingUp,
} from 'lucide-react';

// 灵感建议 chips — 点击自动填充输入框
const recommendChips = [
  { label: '生成高级耳机主图', example: '帮我生成高级耳机主图，白底高级感，多角度展示' },
  { label: '护肤品极简白底图', example: '护肤品极简白底图，高端质感，柔光效果' },
  { label: '小红书爆款封面', example: '小红书爆款封面，夏日护肤推荐，清新风格' },
  { label: '带货口播脚本', example: '零食带货口播脚本，3分钟节奏紧凑' },
];

// 示例结果数据 — 使用本地高质量静态图片
const showcaseExamples = [
  { title: '商品主图', category: '商品图', image: '/case-lipstick-main.png' },
  { title: '小红书封面', category: '小红书', image: '/demo-card-lifestyle.jpg' },
  { title: '详情页片段', category: '详情页', image: '/case-ecommerce.jpg' },
  { title: '视频封面', category: '视频脚本', image: '/demo-scene.jpg' },
];

// 精选工具 — 从后台 API 动态获取
interface UtilityTool {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  cover_image: string | null;
  color: string;
  sort_order: number;
  use_cases: { title: string; desc: string }[];
}

// 热门创作结果数据
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

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [utilityTools, setUtilityTools] = useState<UtilityTool[]>([]);
  const studioInputRef = useRef<HTMLDivElement>(null);

  // 从后台 API 获取精选工具（带缓存，5分钟内不重复请求）
  useEffect(() => {
    const CACHE_KEY = 'oneclaw_utility_tools_cache';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setUtilityTools(data);
          return;
        }
      }
    } catch {}

    fetch('/api/utility-tools')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tools)) {
          setUtilityTools(data.tools);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.tools, timestamp: Date.now() }));
          } catch {}
        }
      })
      .catch(() => {}); // silent fail - graceful degradation
  }, []);

  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // 开始生成 — AI 自动匹配创作方式
  const handleGenerate = useCallback(() => {
    if (!inputText.trim() || isLoading) return;
    router.push('/product-generator');
  }, [inputText, isLoading, router]);

  // Ctrl+Enter 快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  // Chip 点击 — 自动填充示例内容
  const handleChipClick = useCallback((example: string) => {
    setInputText(example);
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
              <div className="os-studio-input-area" ref={studioInputRef}>
                <div className="relative">
                  {!inputText && (
                    <div className="os-studio-placeholder" onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}>
                      <p className="os-studio-placeholder-example">例如：上传一张耳机图，生成电商主图、卖点图和场景图</p>
                    </div>
                  )}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    className="os-studio-textarea"
                    rows={6}
                  />
                </div>
              </div>
              {/* 底部工具栏 */}
              <div className="os-studio-toolbar">
                <div className="flex items-center gap-2">
                  <button className="os-studio-tool-btn">
                    <Upload className="w-4 h-4" />
                    <span>上传图片</span>
                  </button>
                  <span className="text-[12px] text-slate-300 ml-1">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="os-studio-cta"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>{isLoading ? '生成中...' : '开始生成'}</span>
                </button>
              </div>
            </div>

            {/* 右侧：AI 正在生成 (35%) */}
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

          {/* ===== 你可以这样生成 ===== */}
          <div className="w-full mt-12 pb-14">
            <div className="text-center mb-7">
              <h2 className="text-lg font-semibold text-slate-700">你可以这样生成</h2>
              <p className="text-[13px] text-slate-400 mt-1.5">上传图片或输入一句话，AI 自动帮你完成。</p>
            </div>

            <div className="os-scene-row">
              {utilityTools.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-400 text-sm">加载精选工具中...</div>
              )}
              {utilityTools.map((tool) => (
                <button
                  key={tool.slug}
                  onClick={() => {
                    setInputText(tool.description);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="os-scene-card group"
                >
                  <div className="os-scene-card-img">
                    {tool.cover_image ? (
                      <img src={tool.cover_image} alt={tool.name} loading="lazy" />
                    ) : (
                      <div className="os-scene-card-placeholder">
                        <span className="text-2xl">{tool.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="os-scene-card-body">
                    <span className="os-scene-card-title">{tool.name}</span>
                    <span className="os-scene-card-desc">{tool.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 热门创作结果 — AI 结果流 ==================== */}
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

        {/* 4列规则网格 */}
        <div className="os-result-grid">
          {hotResults.map((item, idx) => (
            <div
              key={idx}
              className="os-result-card group cursor-pointer"
              onClick={() => {
                setInputText(item.examplePrompt);
                studioInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              {/* 图片区域 */}
              <div className="os-result-card-image">
                <img
                  src={item.image}
                  alt={item.title}
                  className="os-result-card-img"
                  loading="lazy"
                />
                {/* 类型标签 */}
                <span className="os-result-card-type">{item.type}</span>
                {/* Hover 浮层 */}
                <div className="os-result-card-overlay">
                  <button
                    className="os-result-card-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputText(item.examplePrompt);
                      studioInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>用这个生成</span>
                  </button>
                </div>
              </div>
              {/* 标题 */}
              <div className="os-result-card-info">
                <p className="os-result-card-title">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
        </div>{/* /max-width container */}
      </section>

    </div>
  );
}
