'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Clock, FolderOpen, Database, 
  MoreHorizontal, Grid3X3, Settings, LogIn,
  Search, Sparkles, Wand2, ScanFace, FileText, 
  Play, Coffee, PartyPopper, Package,
  ChevronRight, ArrowLeft, Upload, RefreshCw
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// 7个AI工具
const AI_TOOLS = [
  {
    key: 'avatar-emoji',
    name: 'AI头像表情包',
    desc: '上传照片，一键生成精美头像和表情包',
    icon: Wand2,
    color: 'from-pink-100 to-rose-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    tag: '热门',
    features: ['一键生成', '多种风格', '高清输出'],
  },
  {
    key: 'resume-photo',
    name: '形象照生成',
    desc: 'AI生成专业简历形象照，多种职业风格',
    icon: ScanFace,
    color: 'from-sky-100 to-blue-200',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    tag: '推荐',
    features: ['专业质感', '多背景', '快速生成'],
  },
  {
    key: 'xiaohongshu',
    name: '小红书配图',
    desc: '爆款小红书封面图，吸引更多点赞',
    icon: FileText,
    color: 'from-orange-100 to-amber-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    tag: '热门',
    features: ['爆款模板', '精准定位', '高转化'],
  },
  {
    key: 'douyin',
    name: '抖音封面',
    desc: '视频封面一键生成，提升播放量',
    icon: Play,
    color: 'from-purple-100 to-pink-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tag: '新版',
    features: ['动态效果', '热门元素', '一键套用'],
  },
  {
    key: 'restaurant-menu',
    name: '餐饮菜单',
    desc: '上传菜品照片，智能生成精美菜单',
    icon: Coffee,
    color: 'from-amber-100 to-orange-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    tag: '实用',
    features: ['智能排版', '多种模板', '打印优化'],
  },
  {
    key: 'festival-poster',
    name: '节日海报',
    desc: '端午、中秋等节日营销海报一键生成',
    icon: PartyPopper,
    color: 'from-red-100 to-orange-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    tag: '限时',
    features: ['节日齐全', '精美模板', '营销文案'],
  },
  {
    key: 'productpage',
    name: '商品详情',
    desc: '电商主图和详情页，高转化率设计',
    icon: Package,
    color: 'from-emerald-100 to-teal-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    tag: '新版',
    features: ['主图设计', '详情页', '多尺寸'],
  },
];

// Toast组件
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useState(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-orange-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const handleUseTool = (tool: typeof AI_TOOLS[0]) => {
    window.open(`/${tool.key}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧导航 */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20">
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-sm text-slate-800">OneClaw</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { key: 'home', label: '首页', icon: Home, href: '/' },
            { key: 'tools', label: '工具', icon: Grid3X3, href: '/tools', active: true },
            { key: 'templates', label: '模板', icon: Sparkles, href: '/templates' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  item.active
                    ? 'bg-slate-100 text-slate-800 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-slate-100 my-3" />

          {[
            { key: 'recent', label: '最近打开', icon: Clock, href: '#' },
            { key: 'projects', label: '项目', icon: FolderOpen, href: '#' },
            { key: 'assets', label: '资产库', icon: Database, href: '#' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>更多</span>
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </Link>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 ml-56">
        <div className="p-6 pb-24">
          {/* Toast */}
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}

          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">AI生图工具</h1>
            <p className="text-sm text-slate-500 mt-1">选择工具，快速生成你想要的设计</p>
          </div>

          {/* 工具列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.key}
                  onClick={() => handleUseTool(tool)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
                >
                  {/* 工具头部 */}
                  <div className={`h-32 bg-gradient-to-br ${tool.color} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-2xl ${tool.iconBg} flex items-center justify-center shadow-lg`}>
                        <Icon className={`w-8 h-8 ${tool.iconColor}`} />
                      </div>
                    </div>
                    {/* 标签 */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 rounded-full text-xs font-medium text-slate-600">
                      {tool.tag}
                    </span>
                    {/* 箭头 */}
                    <div className="absolute top-3 left-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowLeft className="w-4 h-4 text-slate-500 rotate-180" />
                    </div>
                  </div>
                  
                  {/* 工具信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 text-base mb-1">{tool.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{tool.desc}</p>
                    
                    {/* 功能标签 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {tool.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 更多工具提示 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">更多工具持续更新中...</p>
          </div>
        </div>

        {/* 页脚 */}
        <Footer />
      </main>
    </div>
  );
}
