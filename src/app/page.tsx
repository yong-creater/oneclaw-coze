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
  HelpCircle, StickyNote, Check,
  ShoppingBag, Star
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';

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
  const [showParams, setShowParams] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 图片参数设置
  const [imageParams, setImageParams] = useState({
    aspectRatio: '1:1', // 1:1, 16:9, 9:16, 4:3
    style: 'auto', // auto, realistic, cartoon, art
    count: 1, // 1-4
    quality: 'high', // standard, high, premium
  });

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
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
      setShowParams(true); // 上传后自动显示参数面板
      setToast(`已上传 ${files.length} 张图片`);
    }
  };

  // 删除已上传的图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImageIdx === index) setSelectedImageIdx(null);
  };

  // 选择图片进行参数调整
  const handleSelectImage = (idx: number) => {
    setSelectedImageIdx(idx === selectedImageIdx ? null : idx);
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

  // 参数选项
  const aspectRatios = [
    { value: '1:1', label: '1:1', desc: '正方形' },
    { value: '16:9', label: '16:9', desc: '横版' },
    { value: '9:16', label: '9:16', desc: '竖版' },
    { value: '4:3', label: '4:3', desc: '横版' },
  ];

  const styles = [
    { value: 'auto', label: '自动' },
    { value: 'realistic', label: '写实' },
    { value: 'cartoon', label: '卡通' },
    { value: 'art', label: '艺术' },
  ];

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', display: 'block', width: '100%' }}>
      {/* Toast通知 */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* AI对话引导区 */}
      <section style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#1e293b' }}>
          和我聊聊，你想要什么设计
        </h1>
        
        {/* 输入框区域 */}
        <div style={{ maxWidth: '672px', margin: '0 auto' }}>
          
          {/* 图片预览 - 有图片时显示 */}
          {uploadedImages.length > 0 ? (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                  已上传 {uploadedImages.length} 张图片
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: '0', right: '0', width: '16px', height: '16px', background: '#ef4444', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          {/* 输入框卡片 */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="描述你想要的设计..."
              style={{ width: '100%', resize: 'none', fontSize: '14px', outline: 'none', border: 'none', background: 'transparent', color: '#1e293b' }}
              rows={3}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={handleUploadClick}
                style={{ padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', fontSize: '14px', color: '#475569' }}
              >
                上传图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button 
                onClick={handleSend}
                style={{ padding: '6px 16px', background: '#1e293b', color: 'white', borderRadius: '8px', fontSize: '14px' }}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 特色AI功能 */}
      <section style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '12px' }}>特色AI功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {FEATURED_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => handleToolClick(tool.key)}
                style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9', textAlign: 'left' }}
              >
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(to bottom right, ${tool.color.replace('from-', '').replace(' to-', ', ')})` }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Icon style={{ width: '24px', height: '24px', color: '#475569' }} />
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontWeight: '500', fontSize: '14px', color: '#1e293b' }}>{tool.name}</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 全部工具 */}
      <section style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '12px' }}>全部工具</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {AI_IMAGE_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => handleToolClick(tool.key)}
              style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9', textAlign: 'left' }}
            >
              <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(to bottom right, ${tool.color.replace('from-', '').replace(' to-', ', ')})` }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>{tool.name.slice(0, 2)}</span>
              </div>
              <div style={{ padding: '10px' }}>
                <h3 style={{ fontWeight: '500', fontSize: '12px', color: '#1e293b' }}>{tool.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 模板入口 */}
      <section style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '12px' }}>设计模板</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { name: '头像模板', count: 32, color: 'from-pink-100 to-rose-100' },
            { name: '封面模板', count: 28, color: 'from-orange-100 to-amber-100' },
            { name: '海报模板', count: 35, color: 'from-green-100 to-emerald-100' },
            { name: '简历模板', count: 18, color: 'from-sky-100 to-blue-100' },
          ].map((template, idx) => (
            <button
              key={idx}
              onClick={() => router.push('/templates')}
              style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', textAlign: 'left' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `linear-gradient(to bottom right, ${template.color.replace('from-', '').replace(' to-', ', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#64748b' }} />
              </div>
              <h3 style={{ fontWeight: '500', fontSize: '14px', color: '#1e293b' }}>{template.name}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{template.count}个模板</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ==================== 工具页面 ====================
function ToolsContent() {
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const handleToolClick = (key: string) => {
    if (TOOL_URLS[key]) {
      window.open(TOOL_URLS[key], '_blank');
    } else {
      setToast('功能开发中');
    }
  };

  const categories = [
    {
      title: 'AI修图',
      items: [
        { name: 'AI一键精修', key: 'avatar', icon: 'Wand2', desc: '智能美化，一键出片', color: 'from-pink-100 to-rose-200' },
        { name: 'AI智能消除', key: 'remove', icon: 'Eraser', desc: '无痕消除杂物路人', color: 'from-purple-100 to-violet-200' },
        { name: 'AI抠图换背景', key: 'cutout', icon: 'ScanFace', desc: '发丝级精准抠图', color: 'from-blue-100 to-cyan-200' },
        { name: '老照片修复', key: 'restore', icon: 'ImageIcon', desc: '模糊破损一键复原', color: 'from-amber-100 to-orange-200' },
      ]
    },
    {
      title: 'AI生成',
      items: [
        { name: '文生图', key: 'text2img', icon: 'Sparkles', desc: '文字描述生成图片', color: 'from-emerald-100 to-teal-200' },
        { name: '图生图', key: 'img2img', icon: 'Layers', desc: '风格迁移创意转换', color: 'from-violet-100 to-purple-200' },
      ]
    },
    {
      title: '电商图片',
      items: [
        { name: '商品精修', key: 'product', icon: 'Wand2', desc: '电商主图一键精修', color: 'from-sky-100 to-blue-200' },
        { name: '白底图', key: 'whitebg', icon: 'Package', desc: '平台标准白底图', color: 'from-slate-100 to-zinc-200' },
        { name: '场景合成', key: 'scene', icon: 'Sofa', desc: '商品场景图生成', color: 'from-rose-100 to-pink-200' },
      ]
    },
    {
      title: '自媒体图片',
      items: [
        { name: '小红书封面', key: 'cover', icon: 'FileText', desc: '爆款笔记封面', color: 'from-orange-100 to-amber-200' },
        { name: '公众号配图', key: 'wechat', icon: 'ImageIcon', desc: '专业图文排版', color: 'from-green-100 to-emerald-200' },
        { name: '尺寸适配', key: 'resize', icon: 'Play', desc: '多平台尺寸适配', color: 'from-indigo-100 to-blue-200' },
      ]
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>工具</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>选择AI工具开始创作</p>
      
      {categories.map((cat, idx) => (
        <div key={idx} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '16px' }}>{cat.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {cat.items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleToolClick(item.key)}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid #f1f5f9',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ 
                  height: '100px', 
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  backgroundImage: `linear-gradient(to bottom right, ${item.color.replace('from-', '').replace(' to-', ', ')})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#475569' }}>
                      {item.name.slice(0, 1)}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 模板页面 ====================
function TemplatesContent() {
  const templates = [
    { name: '头像模板', count: 120, color: 'from-pink-100 to-rose-200' },
    { name: '小红书封面', count: 85, color: 'from-orange-100 to-amber-200' },
    { name: '抖音封面', count: 72, color: 'from-purple-100 to-violet-200' },
    { name: '节日海报', count: 156, color: 'from-red-100 to-rose-200' },
    { name: '餐饮菜单', count: 45, color: 'from-green-100 to-emerald-200' },
    { name: '简历模板', count: 38, color: 'from-blue-100 to-cyan-200' },
    { name: '形象照', count: 92, color: 'from-indigo-100 to-blue-200' },
    { name: '详情页', count: 64, color: 'from-teal-100 to-cyan-200' },
  ];

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>设计模板</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>海量设计模板，一键使用</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {templates.map((t, idx) => (
          <button
            key={idx}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              border: '1px solid #f1f5f9',
              textAlign: 'left',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ 
              height: '140px', 
              background: `linear-gradient(to bottom right, ${t.color.replace('from-', '').replace(' to-', ', ')})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'rgba(0,0,0,0.2)' }}>
                {t.name.slice(0, 1)}
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              <h3 style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{t.name}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t.count}套模板</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 最近打开页面 ====================
function RecentContent() {
  const [recentItems, setRecentItems] = useState([
    { id: 1, name: '头像表情包设计', time: '10分钟前', type: 'avatar-emoji', thumbnail: '' },
    { id: 2, name: '端午海报制作', time: '1小时前', type: 'festival-poster', thumbnail: '' },
    { id: 3, name: '小红书封面', time: '昨天', type: 'xiaohongshu', thumbnail: '' },
    { id: 4, name: '抖音封面设计', time: '2天前', type: 'douyin', thumbnail: '' },
    { id: 5, name: '商品详情页', time: '3天前', type: 'productpage', thumbnail: '' },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const handleItemClick = (item: typeof recentItems[0]) => {
    if (TOOL_URLS[item.type]) {
      window.open(TOOL_URLS[item.type], '_blank');
    }
  };

  const handleDelete = (id: number) => {
    setRecentItems(recentItems.filter(item => item.id !== id));
    setToast('已删除');
  };

  const handleClearAll = () => {
    setRecentItems([]);
    setToast('已清空全部历史');
  };

  const typeIcons: Record<string, string> = {
    'avatar-emoji': '👤',
    'festival-poster': '🎉',
    'xiaohongshu': '📕',
    'douyin': '🎵',
    'resume-photo': '📸',
    'restaurant-menu': '🍜',
    'productpage': '📦',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">最近打开</h1>
          <p className="text-sm text-slate-500">快速访问最近编辑的项目</p>
        </div>
        {recentItems.length > 0 && (
          <button onClick={handleClearAll} className="text-sm text-slate-400 hover:text-red-500 transition-colors">
            清空全部
          </button>
        )}
      </div>

      {recentItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无历史记录</h3>
          <p className="text-sm text-slate-400 mt-1">使用工具后会在这里显示</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
            >
              <button
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-4 flex-1"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl">
                  {typeIcons[item.type] || '📄'}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-medium text-slate-800 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors">
                  <Sparkles className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 项目页面 ====================
function ProjectsContent() {
  const [projects, setProjects] = useState([
    { id: 1, name: '端午活动物料', type: 'festival-poster', updated: '今天', count: 3 },
    { id: 2, name: '小红书运营素材', type: 'xiaohongshu', updated: '昨天', count: 8 },
    { id: 3, name: '产品展示图集', type: 'productpage', updated: '3天前', count: 12 },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    setToast('项目已删除');
  };

  const typeColors: Record<string, string> = {
    'festival-poster': 'from-red-100 to-orange-100',
    'xiaohongshu': 'from-pink-100 to-rose-100',
    'productpage': 'from-emerald-100 to-teal-100',
    'douyin': 'from-purple-100 to-pink-100',
    'avatar-emoji': 'from-sky-100 to-blue-100',
    'restaurant-menu': 'from-amber-100 to-orange-100',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">我的项目</h1>
          <p className="text-sm text-slate-500">管理你创建的所有设计项目</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />新建项目
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无项目</h3>
          <p className="text-sm text-slate-400 mt-1">使用工具后会在这里显示</p>
          <button 
            onClick={handleCreateNew}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            创建第一个项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`h-24 bg-gradient-to-br ${typeColors[project.type] || 'from-slate-100 to-slate-200'} flex items-center justify-center`}>
                <span className="text-4xl opacity-50">📁</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white">{project.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{project.count} 个设计 · {project.updated}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 资产库页面 ====================
function AssetsContent() {
  const [assets, setAssets] = useState([
    { id: 1, name: '产品主图-001.jpg', size: '2.3MB', type: 'image', date: '今天' },
    { id: 2, name: '头像素材集', size: '15张', type: 'folder', date: '昨天' },
    { id: 3, name: '端午节元素.png', size: '890KB', type: 'image', date: '3天前' },
    { id: 4, name: '品牌配色方案.ai', size: '1.2MB', type: 'file', date: '上周' },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'templates' | 'others'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAssets = Array.from(files).map((file, idx) => ({
        id: Date.now() + idx,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
        date: '今天',
      }));
      setAssets([...newAssets, ...assets]);
      setToast(`已上传 ${files.length} 个文件`);
    }
  };

  const handleDelete = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
    setToast('已删除');
  };

  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'images') return asset.type === 'image';
    if (activeTab === 'templates') return asset.name.includes('模板');
    if (activeTab === 'others') return asset.type === 'file';
    return true;
  });

  const typeIcons: Record<string, { icon: string; color: string }> = {
    'image': { icon: '🖼️', color: 'from-sky-100 to-blue-100' },
    'folder': { icon: '📁', color: 'from-amber-100 to-orange-100' },
    'file': { icon: '📄', color: 'from-slate-100 to-slate-200' },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">资产库</h1>
          <p className="text-sm text-slate-500">管理你的设计素材和模板</p>
        </div>
        <button 
          onClick={handleUpload}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />上传素材
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.ai,.psd,.svg,.pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 筛选标签 */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'images', 'templates', 'others'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              activeTab === tab 
                ? 'bg-orange-100 text-orange-600 font-medium' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {tab === 'all' ? '全部' : tab === 'images' ? '图片' : tab === 'templates' ? '模板' : '其他'}
          </button>
        ))}
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">暂无素材</h3>
          <p className="text-sm text-slate-400 mt-1">上传素材后会在这里显示</p>
          <button 
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            上传第一个素材
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`aspect-square bg-gradient-to-br ${typeIcons[asset.type]?.color || 'from-slate-100 to-slate-200'} flex items-center justify-center relative`}>
                <span className="text-3xl">{typeIcons[asset.type]?.icon || '📄'}</span>
                <button 
                  onClick={() => handleDelete(asset.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-medium text-slate-800 dark:text-white truncate">{asset.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{asset.size} · {asset.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 更多页面 ====================
function MoreContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const router = useRouter();

  const items = [
    { name: '会员中心', icon: Crown, action: () => router.push('/vip') },
    { name: 'AI修图中心', icon: Wand2, action: () => router.push('/retouch') },
    { name: 'AI生成中心', icon: Sparkles, action: () => router.push('/generate') },
    { name: '电商专区', icon: ShoppingBag, action: () => router.push('/ecommerce') },
    { name: '自媒体专区', icon: Star, action: () => router.push('/social') },
  ];

  const subItems = [
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

      <div className="mb-8">
        <h3 className="text-sm font-medium text-slate-500 mb-3">会员与AI功能</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-3">其他</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subItems.map((item, idx) => {
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
            { key: 'recent', label: '最近打开', icon: Clock },
            { key: 'projects', label: '项目', icon: FolderOpen },
            { key: 'assets', label: '资产库', icon: Database },
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

        {/* 页面底部Footer */}
        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 pb-6">
            <div className="text-sm text-slate-400">
              <p className="mb-1">关于我们 · 快速链接 · 联系我们</p>
              <p>© 2025 OneClaw. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-400">OneClaw</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
