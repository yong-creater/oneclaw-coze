'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useMenu } from '@/components/common/MenuProvider';
import {
  Sparkles,
  ClipboardPaste,
  ShoppingBag,
  FileText,
  Users,
  Video,
  ImagePlus,
  ArrowRight,
  Flame,
  FolderOpen,
  RefreshCw,
  Zap,
} from 'lucide-react';

// ========== 热门工具 ==========
const hotTools = [
  { name: '商品图生成', desc: 'AI生成高质量商品主图', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', href: '/product-generator' },
  { name: 'A+详情页生成', desc: '生成专业的A+页面', icon: FileText, color: 'bg-blue-100 text-blue-600', href: '/productpage' },
  { name: '模特替换', desc: '轻松更换模特和背景', icon: Users, color: 'bg-emerald-100 text-emerald-600', href: '/ai-photo' },
  { name: '视频生成', desc: '生成营销短视频', icon: Video, color: 'bg-pink-100 text-pink-600', href: '/product-poster' },
  { name: '图片编辑', desc: '智能编辑图片', icon: ImagePlus, color: 'bg-amber-100 text-amber-600', href: '/background-removal' },
];

// ========== 试试这些标签 ==========
const quickPrompts = [
  '生成亚马逊A+详情页',
  '创建产品卖点图',
  '制作小红书种草图',
  '生成TikTok带货视频脚本',
];

export default function HomePage() {
  const { pendingInput, consumePendingInput, setCurrentMenu } = useMenu();
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
    fetch('/api/generations?limit=6')
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

  return (
    <div className="ui-page">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-xs text-amber-700">
            <Zap className="w-3.5 h-3.5" />
            <span>剩余额度 12/20</span>
          </div>
          <Link href="/membership" className="text-xs text-emerald-600 font-medium hover:underline">
            去升级
          </Link>
        </div>
      </div>

      {/* AI 标题区 */}
      <div className="text-center mb-8 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[120px] font-black text-emerald-50/80 leading-none tracking-tighter">AI</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 relative">
          <span className="text-emerald-600">AI</span>，让电商创作更简单
        </h1>
        <p className="text-sm text-slate-400 mt-2 relative">输入您的需求，一键生成高质量内容</p>
      </div>

      {/* 输入区 */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, 500))}
            placeholder="输入您的创作需求，例如：生成一张高端护肤品主图..."
            className="w-full px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none outline-none min-h-[80px]"
            rows={3}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.readText().then(t => setInputText(t.slice(0, 500)))}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="粘贴"
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-300">{inputText.length} / 500</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: inputText.trim() && !isLoading ? 'linear-gradient(135deg, #10b981, #34d399)' : '#94a3b8' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLoading ? '生成中...' : '生成内容'}
            </button>
          </div>
        </div>
      </div>

      {/* 试试这些 */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">试试这些:</span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleQuickPrompt(prompt)}
            className="px-3 py-1 rounded-full text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {prompt}
          </button>
        ))}
        <button
          onClick={() => {
            const idx = Math.floor(Math.random() * quickPrompts.length);
            handleQuickPrompt(quickPrompts[idx]);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 生成结果区 */}
      {result && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-emerald-50 rounded-[10px] border border-emerald-200">
          <p className="text-sm text-emerald-800">{result}</p>
        </div>
      )}

      {/* 热门工具 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-semibold text-slate-900">热门工具</h2>
          </div>
          <button
            onClick={() => setCurrentMenu('tools')}
            className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline"
          >
            全部工具 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {hotTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="ui-card bg-white p-4 rounded-[10px] group"
              >
                <div className={`w-9 h-9 rounded-lg ${tool.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm font-medium text-slate-800 mb-0.5">{tool.name}</div>
                <div className="text-[11px] text-slate-400">{tool.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 最近项目 */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <h2 className="text-base font-semibold text-slate-900">最近项目</h2>
            </div>
            <button
              onClick={() => setCurrentMenu('project')}
              className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="ui-card aspect-[4/3] rounded-[10px] overflow-hidden bg-slate-100"
              >
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
