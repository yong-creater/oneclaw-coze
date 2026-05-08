'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  Upload,
  ArrowRight,
  FolderOpen,
  ShoppingBag,
  LayoutTemplate,
  Heart,
  Video,
  ImageIcon,
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
    id: number; title: string; thumbnail: string | null; tool_name: string; created_at?: string;
  }>>([]);
  const [tools, setTools] = useState<UtilityTool[]>([]);


  // 消费模板/提示词填充
  useEffect(() => {
    if (pendingInput) {
      setInputText(pendingInput);
      consumePendingInput();
    }
  }, [pendingInput, consumePendingInput]);

  // 获取最近项目（只取 3 条）
  useEffect(() => {
    fetch('/api/generations?limit=4', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.generations) ? data.generations : [];
        setRecentProjects(list.slice(0, 4));
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



  return (
    <div className="os-page">
      {/* ==================== Hero 创作区（780px · 居中） ==================== */}
      <div className="os-hero">
        {/* 柔光球层 — 三个大型模糊光球 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="os-orb os-orb-primary os-atmo-orb-center" />
          <div className="os-orb os-orb-secondary os-atmo-orb-left" />
          <div className="os-orb os-orb-accent os-atmo-orb-right" />
        </div>

        {/* 动态模糊光带 — 超浅渐变飘动 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="os-light-band os-light-band-primary os-atmo-band-top" />
          <div className="os-light-band os-light-band-secondary os-atmo-band-mid" />
        </div>

        {/* 漂浮微粒层 — 8颗缓慢上升 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="os-mote os-mote-purple os-mote-1" />
          <div className="os-mote os-mote-cyan os-mote-2" />
          <div className="os-mote os-mote-blue os-mote-3" />
          <div className="os-mote os-mote-purple os-mote-4" />
          <div className="os-mote os-mote-cyan os-mote-5" />
          <div className="os-mote os-mote-blue os-mote-6" />
          <div className="os-mote os-mote-purple os-mote-7" />
          <div className="os-mote os-mote-cyan os-mote-8" />
        </div>

        {/* 内容层 — 垂直居中 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[1080px] mx-auto">

          {/* 标题 — 结果导向，64px 渐变 */}
          <h1 className="os-hero-title text-center max-w-[640px]">
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

          {/* 创作模式卡片 — AI Mode Selector */}
          <div className="os-mode-cards mt-10">
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

          {/* ===== AI 输入工作台 — 1180px / 420px ===== */}
          <div className="w-full mt-8">
            <div className="os-workspace">
              {/* Prompt 输入区域 */}
              <div className="os-workspace-body">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder={'描述你想生成的内容，例如：\n\n帮我生成一套高级护肤品商品图\n或者：\n上传商品图，自动生成详情页和卖点图'}
                  className="os-workspace-textarea"
                  rows={12}
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
                    onClick={() => {
                      const ideas = [
                        '帮我生成一套高级护肤品商品图',
                        '零食包装场景图，白底高级感',
                        '数码产品详情页，极简科技风',
                        '小红书种草图，夏日护肤推荐',
                      ];
                      setInputText(ideas[Math.floor(Math.random() * ideas.length)]);
                    }}
                    className="os-workspace-tool-btn"
                    title="灵感推荐"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>灵感推荐</span>
                  </button>
                  <span className="os-workspace-counter">{inputText.length} / 500</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isLoading}
                  className="os-cta-btn"
                >
                  <Sparkles className="w-5 h-5" />
                  {isLoading ? '生成中...' : '开始创作'}
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* ==================== 最近创作 — 作品卡片流 ==================== */}
      <div className="animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-700">
            最近创作 <span className="text-[#7B61FF]">✦</span>
          </h2>
          <button
            onClick={() => router.push('/projects')}
            className="text-sm text-slate-400 hover:text-[#7B61FF] transition-colors flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="os-card group cursor-pointer overflow-hidden !rounded-2xl !border-0 !shadow-[0_2px_16px_rgba(15,23,42,0.04)]"
                onClick={() => router.push('/projects')}
              >
                {/* 4:3 预览图 */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100/80 overflow-hidden">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>
                  )}
                  {/* 状态标签 */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm">
                      已完成
                    </span>
                  </div>
                </div>
                {/* 信息区 */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-700 truncate">{project.title || project.tool_name || '未命名创作'}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 空状态 — AI 插画感 */
          <div className="os-card !rounded-2xl !border-0 flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-8">
              {/* 柔和光晕 */}
              <div className="absolute -inset-6 bg-gradient-to-br from-[#7B61FF]/[0.08] to-[#5B8CFF]/[0.05] rounded-full blur-2xl" />
              {/* 图标容器 */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7B61FF]/[0.08] to-[#5B8CFF]/[0.04] flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-[#7B61FF]/40" />
              </div>
            </div>
            <p className="text-[15px] font-medium text-slate-600 mb-2">还没有创作内容</p>
            <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed">
              试试上方输入需求开始生成
            </p>
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
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${tool.color || 'from-[#7B61FF]/20 to-[#5B8CFF]/20'}`}>
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
