'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  Upload,
  ArrowRight,
  ImageIcon,
  Wand2,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

// 推荐创作场景 chips — 点击自动填充输入框
const recommendChips = [
  { label: '商品图', example: '帮我生成高级护肤品商品图，白底高级感' },
  { label: '详情页', example: '数码产品详情页，极简科技风格' },
  { label: '小红书', example: '小红书种草图，夏日护肤推荐' },
  { label: '视频脚本', example: '零食带货视频脚本，3分钟口播' },
  { label: 'AI 写真', example: '生成个人职业形象照，商务高级感' },
  { label: '带货文案', example: '美白精华种草文案，适合小红书发布' },
];

// 示例结果数据 — 使用本地高质量静态图片
const showcaseExamples = [
  { title: '商品主图', category: '商品图', image: '/case-lipstick-main.png' },
  { title: '小红书封面', category: '小红书', image: '/demo-card-lifestyle.jpg' },
  { title: '详情页片段', category: '详情页', image: '/case-ecommerce.jpg' },
  { title: '视频封面', category: '视频脚本', image: '/demo-scene.jpg' },
];

// 今日热门数据
const hotToday = [
  { title: '高级护肤品主图', category: '商品图', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=750&fit=crop&auto=format&q=80' },
  { title: '夏日穿搭种草图', category: '小红书', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=450&fit=crop&auto=format&q=80' },
  { title: '家居好物详情页', category: '详情页', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&auto=format&q=80' },
  { title: '零食包装场景图', category: '商品图', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bbd7f?w=600&h=750&fit=crop&auto=format&q=80' },
  { title: '数码产品主图', category: '商品图', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format&q=80' },
  { title: '健身器材详情页', category: '详情页', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop&auto=format&q=80' },
  { title: '美妆种草封面', category: '小红书', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop&auto=format&q=80' },
  { title: '美食带货脚本', category: '视频脚本', image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=450&fit=crop&auto=format&q=80' },
];

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1280px] mx-auto px-4">

          {/* 主标题 — 聚焦"描述需求 → AI 自动完成" */}
          <h1 className="os-hero-title text-center !text-[52px] !leading-[1.2] !tracking-[-0.03em]">
            不会 Prompt，<br className="sm:hidden" />也能生成{' '}
            <span className="gradient-text">专业内容</span>
          </h1>

          {/* 副标题 */}
          <p className="text-center text-[18px] text-[#6B7280] mt-4 max-w-[640px] leading-relaxed">
            上传图片或输入一句话，OneClaw 自动帮你生成商品图、详情页、小红书和视频脚本。
          </p>

          {/* ===== AI 输入工作台 — 左右分栏 ===== */}
          <div className="os-studio mt-10">
            {/* 左侧：输入区 (60%) */}
            <div className="os-studio-input">
              <div className="os-studio-input-area">
                <div className="relative">
                  {/* 结构化 placeholder — 标题+示例层级 */}
                  {!inputText && (
                    <div className="os-studio-placeholder" onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}>
                      <p className="os-studio-placeholder-title">描述你想生成的内容</p>
                      <p className="os-studio-placeholder-example">例如：上传一张耳机图，生成高级商品主图和场景图</p>
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
                  <button
                    onClick={() => {
                      const ideas = [
                        '帮我生成高级护肤品商品图，白底高级感',
                        '数码产品详情页，极简科技风格',
                        '小红书种草图，夏日护肤推荐',
                        '零食带货视频脚本，3分钟口播',
                      ];
                      setInputText(ideas[Math.floor(Math.random() * ideas.length)]);
                    }}
                    className="os-studio-tool-btn"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>灵感推荐</span>
                  </button>
                  <span className="text-[12px] text-slate-300 ml-1">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="os-studio-cta"
                >
                  <Wand2 className="w-5 h-5" />
                  {isLoading ? '生成中...' : '开始生成'}
                </button>
              </div>
            </div>

            {/* 右侧：示例结果 (40%) */}
            <div className="os-studio-showcase">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#7B61FF]/60" />
                <span className="text-[13px] font-medium text-slate-500">示例结果</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">根据需求自动生成对应内容</p>
              <div className="grid grid-cols-2 gap-3">
                {showcaseExamples.map((example, idx) => (
                  <div key={idx} className="os-showcase-item group">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

          {/* ===== 推荐创作场景 chips ===== */}
          <div className="os-chips-bar mt-6">
            <span className="os-chips-label">推荐创作</span>
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

      {/* ==================== 今日热门生成 — 瀑布流 ==================== */}
      <section className="os-section animate-fade-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#7B61FF]/60" />
            <h2 className="text-xl font-semibold text-slate-700">今日热门生成</h2>
          </div>
          <button
            onClick={() => router.push('/tools')}
            className="text-sm text-slate-400 hover:text-[#7B61FF] transition-colors flex items-center gap-1"
          >
            查看更多 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 瀑布流布局 */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {hotToday.map((item, idx) => (
            <div
              key={idx}
              className="os-card group cursor-pointer overflow-hidden !border-0 break-inside-avoid"
              onClick={() => router.push('/tools')}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ aspectRatio: idx % 3 === 0 ? '4/5' : idx % 3 === 1 ? '4/3' : '1/1' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-3.5">
                <p className="text-[13px] font-medium text-slate-700 truncate">{item.title}</p>
                <span className="text-[11px] text-slate-400">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 最近创作 — 作品卡片流 ==================== */}
      <section className="os-section animate-fade-slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-700">
            最近创作
          </h2>
          <button
            onClick={() => router.push('/projects')}
            className="text-sm text-slate-400 hover:text-[#7B61FF] transition-colors flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 空状态 */}
        <div className="os-card !rounded-2xl !border-0 flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-5 bg-gradient-to-br from-[#7B61FF]/[0.06] to-[#5B8CFF]/[0.04] rounded-full blur-2xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B61FF]/[0.06] to-[#5B8CFF]/[0.03] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#7B61FF]/30" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-slate-500 mb-1.5">还没有创作内容</p>
          <p className="text-[13px] text-slate-400">
            试试上方输入需求开始生成
          </p>
        </div>
      </section>
    </div>
  );
}
