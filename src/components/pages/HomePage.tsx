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
  Wand2,
  ChevronRight,
  Package,
  Scissors,
  Camera,
  Image as ImageIcon,
  FileText,
  BookOpen,
  ShoppingBag,
  Heart,
  Feather,
} from 'lucide-react';

// 图标名称 → Lucide 组件映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Scissors,
  Camera,
  ImageIcon,
  FileText,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Heart,
  Feather,
};

// ========== 快捷动作 ==========
const quickActions = [
  { label: '生成图片', icon: ImagePlus, prompt: '生成一张商品主图' },
  { label: '详情页', icon: LayoutTemplate, prompt: '生成亚马逊A+详情页' },
  { label: '种草图', icon: Lightbulb, prompt: '制作小红书种草图' },
  { label: '视频脚本', icon: Video, prompt: '生成TikTok带货视频脚本' },
];

// ========== 试试这些标签 ==========
const quickPrompts = [
  '生成亚马逊A+详情页',
  '创建产品卖点图',
  '制作小红书种草图',
  '生成TikTok带货视频脚本',
];

// ========== 工具数据类型 ==========
interface UtilityTool {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  cover_image: string | null;
  color: string;
  use_cases: string[];
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
  const [tools, setTools] = useState<UtilityTool[]>([]);

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

  // 获取工具列表（仅 is_active 的）
  useEffect(() => {
    fetch('/api/utility-tools', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.tools)) {
          setTools(data.tools);
        }
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

  // 点击快捷动作
  const handleQuickAction = useCallback((action: typeof quickActions[0]) => {
    setInputText(action.prompt);
  }, []);

  // 工具颜色渐变映射 — 统一蓝紫体系
  const getGradient = (color: string) => {
    const map: Record<string, string> = {
      purple: 'from-[#7B61FF] to-[#5B8CFF]',
      blue: 'from-[#5B8CFF] to-[#6EE7FF]',
      pink: 'from-[#7B61FF] to-[#A78BFA]',
      green: 'from-[#34D399] to-[#5B8CFF]',
      orange: 'from-[#FFB84D] to-[#7B61FF]',
      yellow: 'from-[#FFB84D] to-[#5B8CFF]',
      cyan: 'from-[#6EE7FF] to-[#5B8CFF]',
      red: 'from-[#7B61FF] to-[#F87171]',
    };
    return map[color] || 'from-[#7B61FF] to-[#5B8CFF]';
  };

  return (
    <div className="os-page">
      {/* ==================== 第一层：Hero AI 输入区 ==================== */}
      <div className="animate-fade-slide-up">
        {/* 标题区 */}
        <div className="text-center mb-10 pt-12">
          <h1 className="os-h1 tracking-tight">
            <span className="gradient-text">今天你想创造什么？</span>
          </h1>
          <p className="os-caption mt-4 font-light" style={{ fontSize: '18px' }}>
            输入你的想法，AI 为你生成高质量卖货内容
          </p>
        </div>

        {/* AI 输入大卡片 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="os-card-static rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ padding: 0 }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="描述你的创作需求，例如：为这款护肤品生成一张高端主图..."
              className="os-ai-input border-none rounded-b-none"
              style={{ minHeight: 120 }}
              rows={4}
            />
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                {/* 快捷动作按钮 */}
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-50 hover:bg-[#7B61FF]/[0.06] hover:text-[#7B61FF] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
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
                  className="os-btn-primary text-sm py-2.5 px-5"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? '生成中...' : '生成内容'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 试试这些 */}
        <div className="max-w-2xl mx-auto mb-16 flex items-center gap-2 flex-wrap justify-center">
          <span className="os-caption">试试这些:</span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 rounded-full text-xs text-slate-500 bg-white border border-slate-200 hover:border-[#7B61FF]/30 hover:text-[#7B61FF] hover:bg-[#7B61FF]/[0.04] transition-all"
            >
              {prompt}
            </button>
          ))}
          <button
            onClick={() => {
              const idx = Math.floor(Math.random() * quickPrompts.length);
              handleQuickPrompt(quickPrompts[idx]);
            }}
            className="p-1 text-slate-400 hover:text-[#7B61FF] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 生成结果区 */}
      {result && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-[#7B61FF]/[0.06] rounded-2xl border border-[#7B61FF]/10 animate-fade-slide-up">
          <p className="text-sm text-[#6948E8]">{result}</p>
        </div>
      )}

      {/* ==================== 第二层：AI 创作能力 ==================== */}
      {tools.length > 0 && (
        <div className="animate-fade-slide-up" style={{ marginTop: "var(--spacing-section)", animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="os-h2">AI 创作能力</h2>
              <p className="os-section-desc">选择能力，快速生成内容</p>
            </div>
            <button
              onClick={() => router.push('/tools')}
              className="os-btn-ghost text-sm"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => router.push(`/${tool.slug}`)}
                className="os-card rounded-2xl overflow-hidden text-left group"
              >
                {/* 封面图区域 */}
                <div className="relative h-28 bg-slate-50 overflow-hidden">
                  {tool.cover_image ? (
                    <img
                      src={tool.cover_image}
                      alt={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(tool.color)} flex items-center justify-center`}>
                      {(() => { const Ic = ICON_MAP[tool.icon] || Package; return <Ic className="w-10 h-10 text-white/80" />; })()}
                    </div>
                  )}
                </div>
                {/* 信息区 */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">{tool.name}</h3>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7B61FF] transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 第三层：最近使用 + 快捷入口 ==================== */}
      <div className="grid grid-cols-5 gap-6 animate-fade-slide-up" style={{ marginTop: 'var(--spacing-section)', animationDelay: '0.2s' }}>
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
            <div className="grid grid-cols-3 gap-3">
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
            <div className="os-card-static rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#7B61FF]/[0.06] flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-[#7B61FF]/30" />
              </div>
              <p className="text-sm text-slate-400 mb-3">还没有生成记录</p>
              <p className="text-xs text-slate-300">在上方输入需求开始创作吧</p>
            </div>
          )}
        </div>

        {/* 快捷入口 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="os-h2">快捷入口</h2>
              <p className="os-section-desc">快速跳转到常用功能</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: '提示词库', desc: '浏览和使用AI创作提示词', path: '/prompts', gradient: 'from-[#7B61FF] to-[#5B8CFF]' },
              { name: '模板中心', desc: '一键使用创作模板', path: '/templates', gradient: 'from-blue-400 to-cyan-500' },
              { name: '小工具', desc: '使用AI创作小工具', path: '/tools', gradient: 'from-pink-400 to-rose-500' },
              { name: '我的项目', desc: '查看所有生成记录', path: '/projects', gradient: 'from-emerald-400 to-teal-500' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="w-full os-card p-4 flex items-center gap-3 text-left"
              >
                <div className={`os-icon-bg bg-gradient-to-br ${item.gradient} text-white`} style={{ width: 40, height: 40, borderRadius: 10 }}>
                  <Wand2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
