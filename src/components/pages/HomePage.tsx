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
} from 'lucide-react';

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

export default function HomePage() {
  const { pendingInput, consumePendingInput, setPendingInput } = useMenu();
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

  // 点击快捷动作
  const handleQuickAction = useCallback((action: typeof quickActions[0]) => {
    setInputText(action.prompt);
  }, []);

  return (
    <div className="os-page">
      {/* ==================== 第一层：Hero AI 输入区 ==================== */}
      <div className="animate-fade-slide-up">
        {/* 标题区 */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            <span className="gradient-text">今天你想创造什么？</span>
          </h1>
          <p className="text-base text-slate-400 mt-3 font-light">
            输入你的想法，AI 为你生成高质量卖货内容
          </p>
        </div>

        {/* AI 输入大卡片 */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="os-card-static rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="描述你的创作需求，例如：为这款护肤品生成一张高端主图..."
              className="os-ai-input border-none rounded-b-none"
              style={{ minHeight: 120 }}
              rows={4}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                {/* 快捷动作按钮 */}
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition-colors"
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
                  className="os-btn-primary text-sm py-2 px-5"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? '生成中...' : '生成内容'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 试试这些 */}
        <div className="max-w-2xl mx-auto mb-2 flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-slate-400">试试这些:</span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 rounded-full text-xs text-slate-500 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
            >
              {prompt}
            </button>
          ))}
          <button
            onClick={() => {
              const idx = Math.floor(Math.random() * quickPrompts.length);
              handleQuickPrompt(quickPrompts[idx]);
            }}
            className="p-1 text-slate-400 hover:text-purple-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 生成结果区 */}
      {result && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-purple-50 rounded-2xl border border-purple-200 animate-fade-slide-up">
          <p className="text-sm text-purple-800">{result}</p>
        </div>
      )}

      {/* ==================== 第二层：最近使用 + 快捷入口 ==================== */}
      <div className="mt-12 grid grid-cols-5 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* 最近项目 */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="os-section-title">最近项目</h2>
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
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-purple-300" />
              </div>
              <p className="text-sm text-slate-400 mb-3">还没有生成记录</p>
              <p className="text-xs text-slate-300">在上方输入需求开始创作吧</p>
            </div>
          )}
        </div>

        {/* 快捷入口 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="os-section-title">快捷入口</h2>
              <p className="os-section-desc">快速跳转到常用功能</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: '提示词库', desc: '浏览和使用AI创作提示词', path: '/prompts', gradient: 'from-violet-500 to-purple-600' },
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
