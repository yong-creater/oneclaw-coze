'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Upload,
  ArrowRight,
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

// 热门创作结果数据
const hotResults = [
  {
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&auto=format&q=80',
    type: '商品图',
    prompt: '高级护肤品主图，白底高级感',
    tags: ['GPT-Image-2', '商业风'],
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop&auto=format&q=80',
    type: '小红书',
    prompt: '夏日穿搭种草图，清新文艺风格',
    tags: ['GPT-Image-2', '小红书'],
  },
  {
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&auto=format&q=80',
    type: '详情页',
    prompt: '家居好物卖点长图，极简风格',
    tags: ['GPT-Image-2', '电商'],
  },
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format&q=80',
    type: '商品图',
    prompt: '数码产品主图，深色科技风',
    tags: ['GPT-Image-2', '科技感'],
  },
  {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&auto=format&q=80',
    type: '小红书',
    prompt: '美妆种草封面，高级质感',
    tags: ['GPT-Image-2', '美妆'],
  },
  {
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=600&fit=crop&auto=format&q=80',
    type: '视频脚本',
    prompt: '零食带货口播脚本，3分钟',
    tags: ['GPT-4o', '带货'],
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format&q=80',
    type: '商品图',
    prompt: '手表产品主图，极简商务风',
    tags: ['GPT-Image-2', '商务风'],
  },
  {
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&auto=format&q=80',
    type: '详情页',
    prompt: '笔记本电脑详情页，科技风格',
    tags: ['GPT-Image-2', '数码'],
  },
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
      <div className="os-hero pt-[72px] pb-[56px]">
        {/* 内容层 */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1280px] mx-auto px-4">

          {/* 主标题 */}
          <h1 className="text-center font-bold !text-[72px] !leading-[1.1] !tracking-[-0.03em]">
            一句需求，<br className="sm:hidden" />直接生成{' '}
            <span className="gradient-text">结果</span>
          </h1>

          {/* 副标题 */}
          <p className="text-center text-[24px] text-[#6B7280] mt-4 max-w-[880px] leading-[1.6]">
            上传图片或输入一句话，OneClaw 自动匹配最佳 AI 工作流。
          </p>

          {/* ===== AI 输入工作台 — 左右分栏 ===== */}
          <div className="os-studio mt-12">
            {/* 左侧：输入区 (60%) */}
            <div className="os-studio-input">
              <h3 className="os-studio-label">描述你想生成的内容</h3>
              <div className="os-studio-input-area">
                <div className="relative">
                  {!inputText && (
                    <div className="os-studio-placeholder" onClick={() => document.querySelector<HTMLTextAreaElement>('.os-studio-textarea')?.focus()}>
                      <p className="os-studio-placeholder-example">例如：上传一张耳机图，生成高级商品主图、卖点图和场景图</p>
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

            {/* 右侧：AI 正在生成 (35%) */}
            <div className="os-studio-showcase">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">✨</span>
                <span className="text-[13px] font-medium text-slate-500">AI 正在生成</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">根据你的需求自动生成对应内容</p>
              <div className="grid grid-cols-2 gap-3">
                {showcaseExamples.map((example, idx) => (
                  <div key={idx} className="os-showcase-item group">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

      {/* ==================== 热门创作结果 — AI 结果流 ==================== */}
      <section className="os-section animate-fade-slide-up !mt-[100px]" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#7B61FF]/60" />
              <h2 className="text-xl font-semibold text-slate-700">热门创作结果</h2>
            </div>
            <p className="text-[13px] text-slate-400 mt-1.5 ml-8">看看大家正在生成什么内容</p>
          </div>
          <button
            onClick={() => router.push('/tools')}
            className="text-sm text-slate-400 hover:text-[#7B61FF] transition-colors flex items-center gap-1"
          >
            查看更多 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4列规则网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {hotResults.map((item, idx) => (
            <div
              key={idx}
              className="os-result-card group cursor-pointer"
              onClick={() => router.push('/tools')}
            >
              {/* 大图区域 */}
              <div className="os-result-card-image">
                <img
                  src={item.image}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* 类型标签 — 悬浮在图片上 */}
                <span className="os-result-card-type">{item.type}</span>
              </div>
              {/* 信息区 */}
              <div className="os-result-card-info">
                {/* 用户需求 */}
                <p className="os-result-card-prompt">{item.prompt}</p>
                {/* 生成标签 */}
                <div className="os-result-card-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="os-result-card-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
