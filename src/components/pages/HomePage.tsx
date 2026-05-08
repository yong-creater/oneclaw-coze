'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  ClipboardPaste,
  ImagePlus,
  LayoutTemplate,
  Lightbulb,
  Video,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Package,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  ShoppingBag,
  Heart,
  Feather,
  Palette,
  Flame,
} from 'lucide-react';

// 图标名称 → Lucide 组件映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Camera,
  ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Heart,
  Feather,
  Scissors: Package,
};

// ========== 快捷能力 ==========
const capabilities = [
  { label: '生成图片', icon: ImagePlus },
  { label: '商品详情页', icon: LayoutTemplate },
  { label: '小红书种草', icon: Lightbulb },
  { label: '视频脚本', icon: Video },
];

// ========== 推荐创作 Prompt ==========
const recommendedPrompts = [
  '生成耳机商品主图',
  '创建护肤品详情页',
  '制作小红书种草图',
  '生成带货视频脚本',
];

// ========== 创作场景 ==========
const creativeScenes = [
  {
    title: '电商商品图',
    desc: '生成主图、卖点图、场景图',
    slug: 'product-generator',
    icon: ShoppingBag,
    cover: '/scene-product.jpg',
    gradient: 'from-[#7B61FF]/80 to-[#5B8CFF]/80',
  },
  {
    title: '商品详情页',
    desc: '一键生成电商详情页',
    slug: 'productpage',
    icon: LayoutTemplate,
    cover: '/scene-detail.jpg',
    gradient: 'from-[#5B8CFF]/80 to-[#6EE7FF]/80',
  },
  {
    title: '小红书种草图',
    desc: '生成封面 + 图文内容',
    slug: 'xiaohongshu-generator',
    icon: Heart,
    cover: '/scene-xiaohongshu.jpg',
    gradient: 'from-[#FF6B9D]/70 to-[#7B61FF]/80',
  },
  {
    title: '带货视频脚本',
    desc: '生成短视频脚本与口播文案',
    slug: 'novel',
    icon: Video,
    cover: '/scene-video.jpg',
    gradient: 'from-[#FFB84D]/80 to-[#7B61FF]/80',
  },
  {
    title: 'AI 写真',
    desc: '生成高级感人物写真',
    slug: 'ai-photo',
    icon: Camera,
    cover: '/scene-photo.jpg',
    gradient: 'from-[#6EE7FF]/80 to-[#7B61FF]/80',
  },
];

// ========== 热门模板 ==========
const hotTemplates = [
  { title: '电商主图模板', desc: '白底 / 场景 / 卖点', icon: Flame, gradient: 'from-[#FFB84D] to-[#FF8C4D]' },
  { title: '详情页模板', desc: '品牌故事 / 功效展示', icon: LayoutTemplate, gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
  { title: '小红书封面', desc: '种草 / 测评 / 打卡', icon: Heart, gradient: 'from-[#FF6B9D] to-[#A78BFA]' },
];

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<Array<{
    id: number; title: string; thumbnail: string | null; tool_name: string;
  }>>([]);

  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // 获取最近项目
  useEffect(() => {
    fetch('/api/generations?limit=6', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.generations) ? data.generations : [];
        setRecentProjects(list.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  // 生成内容（模拟）
  const handleGenerate = useCallback(() => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(`已为您生成：${inputText.trim()}`);
      setIsLoading(false);
    }, 2000);
  }, [inputText, isLoading]);

  // 点击试试这些
  const handleQuickPrompt = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  // 快捷能力按钮状态
  const [activeCapability, setActiveCapability] = useState('生成图片');

  return (
    <div className="os-page">
      {/* ==================== 第一层：Hero AI 输入区 ==================== */}
      <div className="animate-fade-slide-up relative">
        {/* 氛围背景 */}
        <div className="absolute inset-0 -top-8 -left-12 -right-12 pointer-events-none overflow-hidden" style={{ height: '520px' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(123,97,255,0.15) 0%, rgba(91,140,255,0.08) 40%, transparent 70%)' }} />
          <div className="absolute top-20 left-1/3 w-[300px] h-[300px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(110,231,255,0.2) 0%, transparent 60%)' }} />
        </div>

        {/* 标题区 */}
        <div className="text-center relative z-10 pt-16 pb-8">
          <h1 className="os-h1 tracking-tight">
            <span className="gradient-text">今天你想创造什么？</span>
          </h1>
          <p className="os-body mt-5 max-w-xl mx-auto" style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: 1.7 }}>
            上传商品图、输入想法，OneClaw 帮你生成高质量商品图、详情页、小红书内容和视频脚本。
          </p>
        </div>

        {/* AI 输入区 */}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="os-card-static rounded-[20px] overflow-hidden" style={{ padding: 0, boxShadow: '0 4px 24px rgba(15,23,42,0.06), 0 0 0 1px rgba(123,97,255,0.04)' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="为这款耳机生成高级电商主图..."
              className="os-ai-input border-none rounded-b-none"
              style={{ minHeight: 140 }}
              rows={4}
            />
            {/* 底部工具栏 */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2 flex-wrap">
                {capabilities.map((cap) => {
                  const Icon = cap.icon;
                  const isActive = activeCapability === cap.label;
                  return (
                    <button
                      key={cap.label}
                      onClick={() => { setActiveCapability(cap.label); }}
                      className={`os-btn-capsule !h-8 !px-3.5 !text-xs flex items-center gap-1.5 ${isActive ? 'os-btn-capsule-active' : ''}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cap.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => router.push('/tools')}
                  className="os-btn-capsule !h-8 !px-3.5 !text-xs flex items-center gap-1.5"
                >
                  更多工具
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <button
                  onClick={() => navigator.clipboard.readText().then(t => setInputText(t.slice(0, 500)))}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="粘贴"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-300">{inputText.length} / 500</span>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="os-btn-primary !text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? '生成中...' : '开始创作'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 试试这些创作 */}
        <div className="max-w-2xl mx-auto mt-8 mb-20 flex items-center gap-2.5 flex-wrap justify-center relative z-10">
          <span className="os-caption !text-[13px]">试试这些创作：</span>
          {recommendedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="os-btn-capsule text-xs !h-[32px] !px-4"
            >
              {prompt}
            </button>
          ))}
          <button
            onClick={() => {
              const idx = Math.floor(Math.random() * recommendedPrompts.length);
              handleQuickPrompt(recommendedPrompts[idx]);
            }}
            className="os-btn-ghost !p-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 生成结果区 */}
      {result && (
        <div className="max-w-2xl mx-auto mb-8 p-5 bg-[#7B61FF]/[0.06] rounded-2xl border border-[#7B61FF]/10 animate-fade-slide-up">
          <p className="text-sm text-[#6948E8]">{result}</p>
        </div>
      )}

      {/* ==================== 第二层：开始创作 — 创作场景 ==================== */}
      <div className="animate-fade-slide-up" style={{ marginTop: "var(--spacing-section)", animationDelay: '0.1s' }}>
        <div className="text-center mb-10">
          <h2 className="os-h2">开始创作</h2>
          <p className="os-section-desc mt-2">选择一个高频场景，快速生成内容</p>
        </div>

        <div className="grid grid-cols-5 gap-5">
          {creativeScenes.map((scene) => {
            const Icon = scene.icon;
            return (
              <div
                key={scene.slug}
                onClick={() => router.push(`/${scene.slug}`)}
                className="os-card p-0 overflow-hidden cursor-pointer group"
              >
                {/* 视觉图区域 */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white/60 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* hover 蒙层 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                </div>
                {/* 信息区 */}
                <div className="p-5 flex flex-col gap-2">
                  <h3 className="os-h3">{scene.title}</h3>
                  <p className="os-caption line-clamp-2">{scene.desc}</p>
                  <div className="mt-1">
                    <span className="os-btn-primary !text-xs !py-1.5 !px-4 inline-flex items-center gap-1">
                      立即创作 <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== 第三层：最近项目 + 热门模板 ==================== */}
      <div className="grid grid-cols-5 gap-8 animate-fade-slide-up" style={{ marginTop: 'var(--spacing-section)', animationDelay: '0.2s' }}>
        {/* 最近项目 */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="os-h2">最近项目</h2>
              <p className="os-section-desc">查看和管理你的生成内容</p>
            </div>
            <button
              onClick={() => router.push('/projects')}
              className="os-btn-ghost text-sm"
            >
              全部项目 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="os-card aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50"
                >
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <FolderOpen className="w-8 h-8" />
                      <span className="text-xs">{project.title || project.tool_name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="os-card-static rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#7B61FF]/[0.06] flex items-center justify-center mx-auto mb-4">
                <Palette className="w-7 h-7 text-[#7B61FF]/30" />
              </div>
              <p className="os-body mb-1">还没有创作记录</p>
              <p className="os-caption">在上方输入需求，开始你的第一次创作</p>
            </div>
          )}
        </div>

        {/* 热门模板 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="os-h2">热门模板</h2>
              <p className="os-section-desc">创作灵感，一键使用</p>
            </div>
            <button
              onClick={() => router.push('/templates')}
              className="os-btn-ghost text-sm"
            >
              更多 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {hotTemplates.map((tpl, idx) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={idx}
                  onClick={() => router.push('/templates')}
                  className="w-full os-card flex items-center gap-4 text-left"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tpl.gradient} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="os-h3">{tpl.title}</div>
                    <div className="os-caption">{tpl.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
