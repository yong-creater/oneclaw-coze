'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  Upload,
  ImagePlus,
  LayoutTemplate,
  Heart,
  Video,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  ShoppingBag,
  Camera,
  ChevronLeft,
  ChevronRight,
  Package,
  ImageIcon,
  FileText,
  BookOpen,
  Scissors,
  Lightbulb,
  ClipboardPaste,
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

// ========== 创作模式选择器 ==========
const modeCards = [
  { key: 'product', label: '商品图', desc: '生成主图 / 场景图', icon: ShoppingBag, slug: 'product-generator', placeholder: '描述你想生成的内容，例如：\n帮我生成一张高级护肤品主图' },
  { key: 'detail', label: '详情页', desc: '生成商品详情内容', icon: LayoutTemplate, slug: 'productpage', placeholder: '描述你想生成的内容，例如：\n帮我生成高级感护肤品详情页' },
  { key: 'xiaohongshu', label: '小红书', desc: '生成封面与文案', icon: Heart, slug: 'xiaohongshu-generator', placeholder: '描述你想生成的内容，例如：\n制作小红书爆款封面和种草文案' },
  { key: 'video', label: '视频脚本', desc: '生成短视频口播脚本', icon: Video, slug: 'novel', placeholder: '描述你想生成的内容，例如：\n生成带货短视频脚本与口播文案' },
] as const;

// ========== 推荐创作 Prompt（按场景分组） ==========
const scenePrompts: Record<string, string[]> = {
  product: ['为这款耳机生成高级电商主图', '护肤品白色背景商品图', '零食包装场景图'],
  detail: ['护肤品详情页，强调成分功效', '数码产品详情页，极简科技风', '食品详情页，突出新鲜口感'],
  xiaohongshu: ['小红书种草图，夏日护肤', '测评类小红书封面', '打卡类小红书封面'],
  video: ['护肤品带货短视频脚本', '数码产品开箱脚本', '零食种草短视频口播'],
};

// ========== UtilityTool 类型 ==========
interface UtilityTool {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  cover_image: string | null;
  description: string;
  highlight: string;
}

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
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // 获取最近项目（只取 3 条）
  useEffect(() => {
    fetch('/api/generations?limit=3', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.generations) ? data.generations : [];
        setRecentProjects(list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  // 获取推荐工具
  useEffect(() => {
    fetch('/api/utility-tools', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const list = data?.tools ?? [];
        setTools(list);
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

  // 切换场景
  const currentScene = modeCards.find(s => s.key === activeScene) ?? modeCards[0];
  const currentPrompts = scenePrompts[activeScene] ?? scenePrompts.product;

  // 横向滚动
  const scrollTools = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区（核心 — 占首屏 75%） ==================== */}
      <div className="animate-fade-slide-up relative" style={{ minHeight: '75vh' }}>
        {/* 氛围光晕层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '800px' }}>
          <div className="os-orb os-orb-primary os-atmo-orb-center" />
          <div className="os-orb os-orb-secondary os-atmo-orb-left" />
          <div className="os-orb os-orb-accent os-atmo-orb-right" />
        </div>

        {/* 漂浮微粒层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '800px' }}>
          <div className="os-mote os-mote-purple os-mote-1" />
          <div className="os-mote os-mote-cyan os-mote-2" />
          <div className="os-mote os-mote-blue os-mote-3" />
          <div className="os-mote os-mote-purple os-mote-4" />
          <div className="os-mote os-mote-cyan os-mote-5" />
          <div className="os-mote os-mote-blue os-mote-6" />
        </div>

        {/* 标题区 */}
        <div className="text-center relative z-10 pt-16 pb-6">
          <h1 className="os-h1 tracking-tight">
            <span className="gradient-text">今天你想创造什么？</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto" style={{ color: 'var(--text-tertiary)', fontSize: '15px', lineHeight: 1.6, fontWeight: 400 }}>
            输入想法，AI 帮你生成商品图、详情页、小红书内容、视频脚本
          </p>
        </div>

        {/* AI 创作模式选择器 */}
        <div className="os-mode-grid os-workspace-wrapper relative z-10 mb-5">
          {modeCards.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeScene === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => setActiveScene(mode.key)}
                className={`os-mode-card ${isActive ? 'os-mode-card-active' : ''}`}
              >
                <div className={`os-mode-card-icon ${isActive ? 'os-mode-card-icon-active' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="os-mode-card-text">
                  <span className="os-mode-card-title">{mode.label}</span>
                  <span className="os-mode-card-desc">{mode.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Workspace 工作台 */}
        <div className="os-workspace-wrapper relative z-10">
          <div className="os-workspace">
            {/* Prompt 输入区域 */}
            <div className="os-workspace-body">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                placeholder={currentScene.placeholder}
                className="os-workspace-textarea"
                rows={6}
              />
            </div>

            {/* 底部工具栏 */}
            <div className="os-workspace-footer">
              <div className="flex items-center gap-1">
                <button className="os-workspace-tool-btn" title="上传图片">
                  <Upload className="w-4 h-4" />
                  <span>上传</span>
                </button>
                <button
                  onClick={() => navigator.clipboard.readText().then(t => setInputText(t.slice(0, 500)))}
                  className="os-workspace-tool-btn"
                  title="粘贴"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
                <span className="os-workspace-counter">{inputText.length} / 500</span>
              </div>
              <button
                onClick={() => router.push(`/${currentScene.slug}`)}
                disabled={!inputText.trim() || isLoading}
                className="os-btn-primary !h-12 !rounded-[14px] !px-7 !text-[14px] !gap-2"
              >
                <Sparkles className="w-[16px] h-[16px]" />
                {isLoading ? '生成中...' : '开始创作'}
              </button>
            </div>
          </div>
        </div>

        {/* 推荐 Prompt */}
        <div className="os-workspace-wrapper mt-4 mb-16 flex items-center gap-2.5 flex-wrap justify-center relative z-10">
          <Lightbulb className="w-3.5 h-3.5 text-[#94A3B8]" />
          {currentPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInputText(prompt)}
              className="os-btn-capsule text-xs !h-[30px] !px-3.5"
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
        <div className="max-w-[960px] mx-auto mb-8 p-5 bg-[#7B61FF]/[0.06] rounded-2xl border border-[#7B61FF]/10 animate-fade-slide-up">
          <p className="text-sm text-[#6948E8]">{result}</p>
        </div>
      )}

      {/* ==================== 最近创作（弱化 — 只保留 3 条） ==================== */}
      <div className="animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">最近创作</h2>
          <button
            onClick={() => router.push('/projects')}
            className="os-btn-ghost text-xs"
          >
            查看全部 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="os-card aspect-[16/10] rounded-2xl overflow-hidden bg-slate-50 !p-0 cursor-pointer"
                onClick={() => router.push('/projects')}
              >
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5">
                    <FolderOpen className="w-6 h-6" />
                    <span className="text-[11px] truncate max-w-[80%]">{project.title || project.tool_name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="os-card-static rounded-2xl py-8 text-center">
            <div className="w-9 h-9 rounded-full bg-[#7B61FF]/[0.06] flex items-center justify-center mx-auto mb-2.5">
              <ImagePlus className="w-4 h-4 text-[#7B61FF]/30" />
            </div>
            <p className="os-caption">还没有创作记录</p>
          </div>
        )}
      </div>

      {/* ==================== 推荐工具（横向滑动） ==================== */}
      {tools.length > 0 && (
        <div className="animate-fade-slide-up mt-10" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">推荐工具</h2>
            <div className="flex items-center gap-1.5">
              <button onClick={() => scrollTools('left')} className="os-btn-ghost !p-1.5 rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTools('right')} className="os-btn-ghost !p-1.5 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {tools.map((tool) => {
              const ToolIcon = ICON_MAP[tool.icon] || Sparkles;
              return (
                <button
                  key={tool.id}
                  onClick={() => router.push(`/${tool.slug}`)}
                  className="os-card shrink-0 flex flex-col overflow-hidden cursor-pointer group"
                  style={{ width: '240px', scrollSnapAlign: 'start' }}
                >
                  {/* 封面图区域 */}
                  <div className="os-card-cover bg-gradient-to-br relative" style={{ backgroundImage: tool.cover_image ? 'none' : undefined }}>
                    {tool.cover_image ? (
                      <img src={tool.cover_image} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${tool.color || 'from-[#7B61FF] to-[#5B8CFF]'}`}>
                        <ToolIcon className="w-8 h-8 text-white/70" />
                      </div>
                    )}
                  </div>
                  {/* 文字区 */}
                  <div className="p-4 text-left">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 truncate">{tool.name}</h3>
                    <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
                      {tool.highlight || tool.description || 'AI 智能创作工具'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#7B61FF] group-hover:gap-1.5 transition-all">
                      立即使用 <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
