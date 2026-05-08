'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  Upload,
  ArrowRight,
  FolderOpen,
  RefreshCw,
  ClipboardPaste,
  ShoppingBag,
  LayoutTemplate,
  Heart,
  Video,
} from 'lucide-react';

// 图标名称 → Lucide 组件映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  LayoutTemplate,
  Heart,
  Video,
};

// 创作模式卡片
const modeCards = [
  { key: 'product', label: '商品图', desc: '主图·场景图·卖点图', icon: ShoppingBag, slug: 'product-generator', gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
  { key: 'detail', label: '详情页', desc: '商品详情·图文内容', icon: LayoutTemplate, slug: 'productpage', gradient: 'from-[#5B8CFF] to-[#6EE7FF]' },
  { key: 'xiaohongshu', label: '小红书', desc: '种草封面·爆款文案', icon: Heart, slug: 'xiaohongshu-generator', gradient: 'from-[#FF6B9D] to-[#FF9A76]' },
  { key: 'video', label: '视频脚本', desc: '短视频·口播·带货', icon: Video, slug: 'novel', gradient: 'from-[#FFB84D] to-[#FF6B6B]' },
] as const;

// 推荐案例
const promptPool = [
  '帮我生成一张高级护肤品主图',
  '护肤品白色背景商品图',
  '零食包装场景图',
  '护肤品详情页，强调成分功效',
  '数码产品详情页，极简科技风',
  '小红书种草图，夏日护肤',
  '测评类小红书封面',
  '护肤品带货短视频脚本',
  '数码产品开箱脚本',
];

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
  const [activeMode, setActiveMode] = useState<string>('product');
  const [recentProjects, setRecentProjects] = useState<Array<{
    id: number; title: string; thumbnail: string | null; tool_name: string;
  }>>([]);
  const [tools, setTools] = useState<UtilityTool[]>([]);
  const [prompts, setPrompts] = useState<string[]>(() => {
    const shuffled = [...promptPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

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

  // 开始创作
  const handleGenerate = useCallback(() => {
    if (!inputText.trim() || isLoading) return;
    const route = modeCards.find(m => m.key === activeMode)?.slug ?? 'product-generator';
    router.push(`/${route}`);
  }, [inputText, isLoading, activeMode, router]);

  // Ctrl+Enter 快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  // 换一批推荐
  const refreshPrompts = useCallback(() => {
    const shuffled = [...promptPool].sort(() => Math.random() - 0.5);
    setPrompts(shuffled.slice(0, 3));
  }, []);

  return (
    <div className="os-page">
      {/* ==================== Hero 创作区（780px · 居中） ==================== */}
      <div className="os-hero">
        {/* 氛围光晕层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="os-orb os-orb-primary os-atmo-orb-center" />
          <div className="os-orb os-orb-secondary os-atmo-orb-left" />
          <div className="os-orb os-orb-accent os-atmo-orb-right" />
        </div>

        {/* 漂浮微粒层 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="os-mote os-mote-purple os-mote-1" />
          <div className="os-mote os-mote-cyan os-mote-2" />
          <div className="os-mote os-mote-blue os-mote-3" />
          <div className="os-mote os-mote-purple os-mote-4" />
          <div className="os-mote os-mote-cyan os-mote-5" />
          <div className="os-mote os-mote-blue os-mote-6" />
        </div>

        {/* 内容层 — 垂直居中 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[720px] mx-auto">

          {/* 标题 — 结果导向，64px 渐变 */}
          <h1 className="os-hero-title text-center">
            输入需求，
            <br />
            <span className="gradient-text">OneClaw 帮你直接生成结果</span>
          </h1>

          {/* 副标题 — 20px 灰蓝色 */}
          <p className="os-hero-subtitle text-center mt-4">
            商品图、详情页、小红书、视频脚本，
            <br className="sm:hidden" />
            不会 AI 也能轻松生成。
          </p>

          {/* 创作模式卡片 — 4 列 */}
          <div className="os-mode-cards mt-8">
            {modeCards.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => setActiveMode(mode.key)}
                  className={`os-mode-card ${isActive ? 'os-mode-card-active' : ''}`}
                >
                  <div className={`os-mode-card-icon ${isActive ? `bg-gradient-to-br ${mode.gradient}` : ''}`}>
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="os-mode-card-text">
                    <span className="os-mode-card-label">{mode.label}</span>
                    <span className="os-mode-card-desc">{mode.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ===== AI 输入工作台 ===== */}
          <div className="os-workspace-wrapper w-full mt-6">
            <div className="os-workspace">
              {/* Prompt 输入区域 */}
              <div className="os-workspace-body">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="描述你想生成的内容…&#10;&#10;例如：帮我生成一张高级护肤品主图"
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
                    onClick={() => navigator.clipboard.readText().then(t => setInputText(t.slice(0, 500))).catch(() => {})}
                    className="os-workspace-tool-btn"
                    title="粘贴"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                  <span className="os-workspace-counter">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="os-btn-primary !h-12 !rounded-[14px] !px-8 !text-[14px] !gap-2.5"
                >
                  <Sparkles className="w-[16px] h-[16px]" />
                  {isLoading ? '生成中...' : '开始创作'}
                </button>
              </div>
            </div>
          </div>

          {/* 推荐案例 — 胶囊标签 */}
          <div className="mt-5 flex items-center gap-2.5 flex-wrap justify-center">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputText(prompt)}
                className="os-btn-capsule text-xs !h-[30px] !px-3.5"
              >
                {prompt}
              </button>
            ))}
            <button
              onClick={refreshPrompts}
              className="os-btn-ghost !p-1.5"
              title="换一批"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 最近创作（弱化 — 只保留 3 条） ==================== */}
      <div className="animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--text-tertiary)]">最近创作</h2>
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
          <div className="os-card-static rounded-2xl py-6 text-center">
            <p className="os-caption">还没有创作记录</p>
          </div>
        )}
      </div>

      {/* ==================== 推荐工具（横向滑动） ==================== */}
      {tools.length > 0 && (
        <div className="animate-fade-slide-up mt-8" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--text-tertiary)]">更多工具</h2>
            <button
              onClick={() => router.push('/tools')}
              className="os-btn-ghost text-xs"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {tools.map((tool) => {
              const ToolIcon = ICON_MAP[tool.icon] || Sparkles;
              return (
                <button
                  key={tool.id}
                  onClick={() => router.push(`/${tool.slug}`)}
                  className="os-card shrink-0 flex items-center gap-3 cursor-pointer group !py-3 !px-4"
                  style={{ width: '260px' }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${tool.color || 'from-[#7B61FF]/20 to-[#5B8CFF]/20'}`}>
                    <ToolIcon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{tool.name}</h3>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                      {tool.highlight || tool.description || 'AI 智能创作'}
                    </p>
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
