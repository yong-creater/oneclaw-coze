'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, LayoutDashboard, Clock, FolderOpen, 
  Database, MoreHorizontal, Grid3X3, 
  Crown, Settings, LogIn,
  ChevronRight, Plus, ImageIcon, Sparkles,
  PartyPopper, Coffee, Search,
  Shirt, Wand2, Layers, Zap, ScanFace,
  Eraser, FileText, Sofa, Play, Package,
  HelpCircle, StickyNote, Check
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// ==================== 类型定义 ====================
type MainTab = 'home' | 'tools' | 'templates' | 'recent' | 'projects' | 'assets' | 'more';

// ==================== 常量 ====================
// 工具URL映射
const TOOL_URLS: Record<string, string> = {
  'avatar-emoji': '/avatar-emoji',
  'resume-photo': '/resume-photo',
  'restaurant-menu': '/restaurant-menu',
  'xiaohongshu': '/xiaohongshu',
  'douyin': '/douyin',
  'festival-poster': '/festival-poster',
  'productpage': '/productpage',
};

// 7个AI生图工具
const AI_IMAGE_TOOLS = [
  { name: 'AI头像表情包', desc: '上传照片，一键生成精美头像', tag: '热门', color: 'from-pink-100 to-rose-100', key: 'avatar-emoji' },
  { name: '形象照生成', desc: 'AI生成专业简历形象照', tag: '推荐', color: 'from-sky-100 to-blue-100', key: 'resume-photo' },
  { name: '小红书配图', desc: '爆款小红书封面图', tag: '热门', color: 'from-pink-50 to-red-50', key: 'xiaohongshu' },
  { name: '抖音封面', desc: '视频封面一键生成', tag: '新版', color: 'from-purple-100 to-pink-100', key: 'douyin' },
  { name: '餐饮菜单', desc: '上传菜品，智能生成菜单', tag: '实用', color: 'from-amber-100 to-orange-100', key: 'restaurant-menu' },
  { name: '节日海报', desc: '端午、中秋等节日海报', tag: '限时', color: 'from-red-100 to-orange-100', key: 'festival-poster' },
  { name: '商品详情', desc: '电商主图和详情页', tag: '新版', color: 'from-emerald-100 to-teal-100', key: 'productpage' },
];

// 特色功能
const FEATURED_TOOLS = [
  { name: 'AI头像表情包', desc: '一键生成精美头像', icon: Wand2, color: 'from-pink-50 to-rose-50', key: 'avatar-emoji' },
  { name: '形象照生成', desc: '专业简历形象照', icon: ScanFace, color: 'from-sky-50 to-blue-50', key: 'resume-photo' },
  { name: '小红书配图', desc: '爆款封面图', icon: FileText, color: 'from-orange-50 to-amber-50', key: 'xiaohongshu' },
  { name: '抖音封面', desc: '视频封面生成', icon: Play, color: 'from-purple-50 to-pink-50', key: 'douyin' },
];

// 基础工具
const BASIC_TOOLS = [
  { name: '餐饮菜单', icon: Coffee, key: 'restaurant-menu' },
  { name: '节日海报', icon: PartyPopper, key: 'festival-poster' },
  { name: '商品详情', icon: Package, key: 'productpage' },
  { name: '更多工具', icon: MoreHorizontal, key: '' },
];

// ==================== Toast通知组件 ====================
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

// ==================== 首页内容 ====================
function HomeContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理发送消息
  const handleSend = () => {
    if (!inputValue.trim() && uploadedImages.length === 0) {
      setToast('请输入设计需求或上传图片');
      return;
    }
    setToast('AI功能开发中，敬请期待！');
  };

  // 处理上传图片
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // 模拟上传，显示预览
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      setToast(`已上传 ${files.length} 张图片`);
    }
  };

  // 删除已上传的图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // AI帮写功能
  const handleAIAutoWrite = () => {
    const suggestions = [
      '生成一个可爱风格的微信头像，粉色背景',
      '设计一张端午节节日海报，包含粽子元素',
      '制作电商主图，白底产品图配促销文案',
      '创作小红书封面，吸引眼球的排版设计',
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setInputValue(randomSuggestion);
    setToast('已为您生成设计建议');
  };

  // 处理工具点击
  const handleToolClick = (key: string) => {
    if (key && TOOL_URLS[key]) {
      window.open(TOOL_URLS[key], '_blank');
    } else {
      setActiveTab('tools');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Toast通知 */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* AI对话引导区 */}
      <div className="py-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-5 text-center">
          和我聊聊，你想要什么设计
        </h1>
        
        {/* 对话输入框 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* 已上传图片预览 */}
            {uploadedImages.length > 0 && (
              <div className="px-5 pt-4 pb-2 flex gap-2 flex-wrap">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={img} 
                      alt={`上传图片 ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 输入框 */}
            <div className="px-5 pt-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入你的设计需求，或者上传图片..."
                className="w-full resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-sm leading-relaxed"
                rows={4}
              />
            </div>
            
            {/* 底部工具栏 */}
            <div className="flex items-center justify-between px-4 pb-4 pt-2">
              <div className="flex items-center gap-2">
                {/* 添加按钮 */}
                <button 
                  onClick={() => setToast('添加素材功能开发中')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs text-slate-600 dark:text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加
                </button>
                
                {/* 上传图片按钮 */}
                <button 
                  onClick={handleUploadClick}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="上传图片"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* AI帮写按钮 */}
                <button 
                  onClick={handleAIAutoWrite}
                  className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  title="AI帮写"
                >
                  <Sparkles className="w-4 h-4 text-orange-500" />
                </button>
              </div>
              
              {/* 发送按钮 */}
              <button 
                onClick={handleSend}
                className="px-5 py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                发送
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 提示文字 */}
          <p className="text-xs text-slate-400 mt-2 text-center">
            输入需求或上传图片，AI 将为您生成设计
          </p>
        </div>
      </div>

      {/* 特色AI功能 */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">特色AI功能</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURED_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => handleToolClick(tool.key)}
                className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all text-left"
              >
                <div className={`h-20 bg-gradient-to-br ${tool.color} relative flex items-center justify-center`}>
                  <div className="w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-700/90 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-800 dark:text-white text-sm">{tool.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 全部工具 */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">全部工具</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {AI_IMAGE_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => handleToolClick(tool.key)}
              className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700 transition-all text-left"
            >
              <div className={`h-16 bg-gradient-to-br ${tool.color} relative flex items-center justify-center`}>
                <span className="text-sm font-bold text-white/60">{tool.name.slice(0, 2)}</span>
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/90 rounded text-xs text-slate-500">
                  {tool.tag}
                </span>
              </div>
              <div className="p-2.5">
                <h3 className="font-medium text-slate-800 dark:text-white text-xs">{tool.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 模板入口 */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">设计模板</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: '头像模板', count: 32, color: 'from-pink-100 to-rose-100' },
            { name: '封面模板', count: 28, color: 'from-orange-100 to-amber-100' },
            { name: '海报模板', count: 35, color: 'from-green-100 to-emerald-100' },
            { name: '简历模板', count: 18, color: 'from-sky-100 to-blue-100' },
          ].map((template, idx) => (
            <button
              key={idx}
              onClick={() => router.push('/templates')}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700 transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-2`}>
                <Sparkles className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-white text-sm">{template.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{template.count}个模板</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 工具页面 ====================
function ToolsContent() {
  const [toast, setToast] = useState<string | null>(null);

  const handleToolClick = (key: string) => {
    if (TOOL_URLS[key]) {
      window.open(TOOL_URLS[key], '_blank');
    } else {
      setToast('功能开发中');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">AI生图工具</h1>
        <p className="text-sm text-slate-500">精选7款高效AI生图工具</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {AI_IMAGE_TOOLS.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => handleToolClick(tool.key)}
            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-left"
          >
            <div className={`h-28 bg-gradient-to-br ${tool.color} relative flex items-center justify-center`}>
              <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-slate-700/90 flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{tool.name.slice(0, 2)}</span>
              </div>
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 dark:bg-slate-700/90 rounded text-xs text-slate-500">
                {tool.tag}
              </span>
              <div className="absolute top-2 left-2 w-6 h-6 bg-white/80 dark:bg-slate-700/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">{tool.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 模板页面 ====================
function TemplatesContent() {
  const templates = [
    { name: '头像模板', count: 120 },
    { name: '小红书封面', count: 85 },
    { name: '抖音封面', count: 72 },
    { name: '节日海报', count: 156 },
    { name: '餐饮菜单', count: 45 },
    { name: '简历模板', count: 38 },
    { name: '形象照', count: 92 },
    { name: '详情页', count: 64 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">设计模板</h1>
        <p className="text-sm text-slate-500">海量设计模板，一键使用</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((t, idx) => (
          <button
            key={idx}
            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-left"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-200 dark:text-slate-600">{t.name.slice(0, 1)}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-slate-800 dark:text-white">{t.name}</h3>
              <p className="text-xs text-slate-400">{t.count}套模板</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 最近打开页面 ====================
function RecentContent() {
  const recentItems = [
    { name: '头像表情包设计', time: '10分钟前' },
    { name: '端午海报制作', time: '1小时前' },
    { name: '小红书封面', time: '昨天' },
  ];

  const handleItemClick = (name: string) => {
    if (name.includes('头像')) window.open('/avatar-emoji', '_blank');
    else if (name.includes('海报')) window.open('/festival-poster', '_blank');
    else if (name.includes('小红书')) window.open('/xiaohongshu', '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">最近打开</h1>
        <p className="text-sm text-slate-500">快速访问最近编辑的项目</p>
      </div>

      <div className="space-y-3">
        {recentItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleItemClick(item.name)}
            className="w-full flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-medium text-slate-800 dark:text-white">{item.name}</h3>
              <p className="text-xs text-slate-400">{item.time}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 项目页面 ====================
function ProjectsContent() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">我的项目</h1>
        <p className="text-sm text-slate-500">管理你创建的所有设计项目</p>
      </div>

      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无项目</h3>
        <p className="text-sm text-slate-400 mt-1">使用工具后会在这里显示</p>
      </div>
    </div>
  );
}

// ==================== 资产库页面 ====================
function AssetsContent() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">资产库</h1>
        <p className="text-sm text-slate-500">管理你的设计素材和模板</p>
      </div>

      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无素材</h3>
        <p className="text-sm text-slate-400 mt-1">上传素材后会在这里显示</p>
      </div>
    </div>
  );
}

// ==================== 更多页面 ====================
function MoreContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const router = useRouter();

  const items = [
    { name: '会员中心', icon: Crown, action: () => router.push('/membership') },
    { name: '系统设置', icon: Settings, action: () => router.push('/admin/settings') },
    { name: '帮助中心', icon: HelpCircle, action: () => {} },
    { name: '意见反馈', icon: StickyNote, action: () => {} },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">更多</h1>
        <p className="text-sm text-slate-500">更多功能和服务</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                <Icon className="w-6 h-6 text-slate-500" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 主页面组件 ====================
export default function MainPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* 左侧固定导航栏 */}
      <aside className="w-56 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0 z-20">
        {/* Logo区域 */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white">OneClaw</span>
          </div>
        </div>

        {/* 主导航 */}
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { key: 'home', label: '首页', icon: Home },
            { key: 'tools', label: '工具', icon: Grid3X3 },
            { key: 'templates', label: '模板', icon: LayoutDashboard },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* 分割线 */}
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-3" />

          {/* 个人导航 */}
          {[
            { key: 'recent', label: '最近打开', icon: Clock },
            { key: 'projects', label: '项目', icon: FolderOpen },
            { key: 'assets', label: '资产库', icon: Database },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 底部导航 */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-0.5">
          {[
            { key: 'more', label: '更多', icon: MoreHorizontal },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* 登录入口 */}
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300 transition-all mt-1"
          >
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 ml-56">
        {/* 页面内容 */}
        <div className="p-6 pb-24">
          {activeTab === 'home' && <HomeContent setActiveTab={setActiveTab} />}
          {activeTab === 'tools' && <ToolsContent />}
          {activeTab === 'templates' && <TemplatesContent />}
          {activeTab === 'recent' && <RecentContent />}
          {activeTab === 'projects' && <ProjectsContent />}
          {activeTab === 'assets' && <AssetsContent />}
          {activeTab === 'more' && <MoreContent setActiveTab={setActiveTab} />}
        </div>

        {/* 右下角悬浮按钮 */}
        <div className="fixed right-6 bottom-6 flex flex-col gap-2 z-20">
          <button className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <StickyNote className="w-5 h-5 text-slate-500" />
          </button>
          <button className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <HelpCircle className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
