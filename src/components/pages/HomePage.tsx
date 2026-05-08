'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ShoppingBag,
  Camera,
  Heart,
  Package,
  ImageIcon,
  FileText,
  BookOpen,
  Scissors,
  Star,
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
  Scissors,
};

// ========== 创作场景 Tabs ==========
const sceneTabs = [
  { key: 'product', label: '商品图', icon: ShoppingBag, slug: 'product-generator', placeholder: '上传商品图或描述，生成高级电商主图、卖点图、场景图...' },
  { key: 'detail', label: '详情页', icon: LayoutTemplate, slug: 'productpage', placeholder: '输入商品信息，一键生成电商详情页...' },
  { key: 'xiaohongshu', label: '小红书', icon: Heart, slug: 'xiaohongshu-generator', placeholder: '生成小红书种草封面 + 图文内容...' },
  { key: 'video', label: '视频脚本', icon: Video, slug: 'novel', placeholder: '生成带货短视频脚本与口播文案...' },
] as const;

// ========== 推荐创作 Prompt（按场景分组） ==========
const scenePrompts: Record<string, string[]> = {
  product: ['为这款耳机生成高级电商主图', '护肤品白色背景商品图', '零食包装场景图'],
  detail: ['护肤品详情页，强调成分功效', '数码产品详情页，极简科技风', '食品详情页，突出新鲜口感'],
  xiaohongshu: ['小红书种草图，夏日护肤', '测评类小红书封面', '打卡类小红书封面'],
  video: ['护肤品带货短视频脚本', '数码产品开箱脚本', '零食种草短视频口播'],
};

export default function HomePage() {
  const { pendingInput, consumePendingInput } = useMenu();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<Array<{
    id: number; title: string; thumbnail: string | null; tool_name: string;
  }>>([]);
  const [activeScene, setActiveScene] = useState<string>('product');

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

  // 切换场景时更新 placeholder
  const currentScene = sceneTabs.find(s => s.key === activeScene) ?? sceneTabs[0];
  const currentPrompts = scenePrompts[activeScene] ?? scenePrompts.product;

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区 ==================== */}
      <div className="animate-fade-slide-up relative">
        {/* 氛围背景 */}
        <div className="absolute inset-0 -top-8 -left-12 -right-12 pointer-events-none overflow-hidden" style={{ height: '600px' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(123,97,255,0.18) 0%, rgba(91,140,255,0.08) 40%, transparent 70%)' }} />
          <div className="absolute top-20 left-1/4 w-[350px] h-[350px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(110,231,255,0.2) 0%, transparent 60%)' }} />
        </div>

        {/* AI 氛围装饰层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '600px' }}>
          <div className="os-hero-cube os-cube-1" />
          <div className="os-hero-cube os-cube-2" />
          <div className="os-hero-orb os-orb-1" />
          <div className="os-hero-orb os-orb-2" />
          <div className="os-hero-trail os-trail-1" />
          <div className="os-hero-trail os-trail-2" />
          <div className="os-hero-particle os-particle-1" />
          <div className="os-hero-particle os-particle-2" />
          <div className="os-hero-particle os-particle-3" />
          <div className="os-hero-particle os-particle-4" />
          <div className="os-hero-particle os-particle-5" />
          <div className="os-hero-particle os-particle-6" />
        </div>

        {/* 标题区 */}
        <div className="text-center relative z-10 pt-20 pb-10">
          <h1 className="os-h1 tracking-tight">
            <span className="gradient-text">今天你想创造什么？</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)', fontSize: '17px', lineHeight: 1.7, fontWeight: 400 }}>
            输入想法，AI 帮你生成商品图、详情页、小红书内容、视频脚本
          </p>
        </div>

        {/* ========== 创作场景 Tabs ========== */}
        <div className="max-w-2xl mx-auto relative z-10 mb-4">
          <div className="os-scene-tabs">
            {sceneTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeScene === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveScene(tab.key)}
                  className={`os-scene-tab ${isActive ? 'os-scene-tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========== AI 超级输入框 ========== */}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="os-ai-input-shell os-card-static rounded-[20px] overflow-hidden" style={{ padding: 0 }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder={currentScene.placeholder}
              className="os-ai-input border-none rounded-b-none"
              style={{ minHeight: 160 }}
              rows={5}
            />
            {/* 底部工具栏 */}
            <div className="os-input-toolbar">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.readText().then(t => setInputText(t.slice(0, 500)))}
                  className="os-toolbar-btn"
                  title="粘贴"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
                <span className="os-toolbar-counter">{inputText.length} / 500</span>
              </div>
              <button
                onClick={() => router.push(`/${currentScene.slug}`)}
                disabled={!inputText.trim() || isLoading}
                className="os-btn-primary !text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? '生成中...' : '开始创作'}
              </button>
            </div>
          </div>
        </div>

        {/* 试试这些创作 */}
        <div className="max-w-2xl mx-auto mt-6 mb-24 flex items-center gap-2.5 flex-wrap justify-center relative z-10">
          <span className="os-caption !text-[13px]">试试：</span>
          {currentPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInputText(prompt)}
              className="os-btn-capsule text-xs !h-[32px] !px-4"
            >
              {prompt}
            </button>
          ))}
          <button
            onClick={() => {
              const idx = Math.floor(Math.random() * currentPrompts.length);
              setInputText(currentPrompts[idx]);
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

      {/* ==================== 最近创作（弱化） ==================== */}
      <div className="animate-fade-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            最近创作
            <Star className="w-4 h-4 text-[#7B61FF] fill-[#7B61FF]/20" />
          </h2>
          <button
            onClick={() => router.push('/projects')}
            className="os-btn-ghost text-xs"
          >
            查看全部 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="os-card aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 !p-0"
              >
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <FolderOpen className="w-7 h-7" />
                    <span className="text-[11px] truncate max-w-[80%]">{project.title || project.tool_name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="os-card-static rounded-2xl py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#7B61FF]/[0.06] flex items-center justify-center mx-auto mb-3">
              <ImagePlus className="w-5 h-5 text-[#7B61FF]/30" />
            </div>
            <p className="os-body mb-1 text-sm">还没有创作记录</p>
            <p className="os-caption">在上方输入需求，开始你的第一次创作</p>
          </div>
        )}
      </div>
    </div>
  );
}
