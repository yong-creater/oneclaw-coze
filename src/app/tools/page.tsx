'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, Clock, FolderOpen, Database, 
  MoreHorizontal, Grid3X3, Settings, LogIn,
  Sparkles, Wand2, ScanFace, FileText, 
  Play, Coffee, PartyPopper, Package,
  ChevronRight, ArrowLeft, Upload, RefreshCw,
  Check, Plus, Trash2, Download, Image,
  Heart, Share2
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// 工具分类
const CATEGORIES = [
  {
    key: 'retouch',
    label: 'AI修图',
    icon: Image,
    tools: [
      { key: 'avatar-emoji', name: 'AI头像表情包', desc: '上传照片，一键生成精美头像', color: 'from-pink-100 to-rose-200', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
      { key: 'resume-photo', name: '形象照生成', desc: 'AI生成专业简历形象照', color: 'from-sky-100 to-blue-200', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
    ]
  },
  {
    key: 'social',
    label: '自媒体图片',
    icon: FileText,
    tools: [
      { key: 'xiaohongshu', name: '小红书配图', desc: '爆款小红书封面图', color: 'from-orange-100 to-amber-200', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
      { key: 'douyin', name: '抖音封面', desc: '视频封面一键生成', color: 'from-purple-100 to-pink-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
      { key: 'festival-poster', name: '节日海报', desc: '节日营销海报一键生成', color: 'from-red-100 to-orange-200', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    ]
  },
  {
    key: 'ecommerce',
    label: '电商图片',
    icon: Package,
    tools: [
      { key: 'productpage', name: '商品详情', desc: '电商主图和详情页', color: 'from-emerald-100 to-teal-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
      { key: 'restaurant-menu', name: '餐饮菜单', desc: '智能生成精美菜单', color: 'from-amber-100 to-orange-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    ]
  },
];

// ===== 工具1: AI头像表情包 =====
function AvatarEmojiTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STYLES = [
    { id: 'cartoon', name: '卡通头像', emoji: '🎨' },
    { id: 'anime', name: '动漫头像', emoji: '✨' },
    { id: 'pixel', name: '像素头像', emoji: '👾' },
    { id: '3d', name: '3D头像', emoji: '🎭' },
    { id: 'oil', name: '油画头像', emoji: '🖼️' },
    { id: 'sketch', name: '素描头像', emoji: '✏️' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setGeneratedAvatars([]);
    }
  };

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#FFDAB9', '#B0E0E6'];
      const emojis = ['🎨', '✨', '👾', '🎭', '🖼️', '✏️'];
      const results = Array.from({ length: 4 }, (_, i) => {
        const color = colors[i % colors.length];
        const emoji = emojis[STYLES.findIndex(s => s.id === selectedStyle) % emojis.length];
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${color}" width="300" height="300" rx="50"/><circle fill="#FFD700" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="80">${emoji}</text></svg>`)}`;
      });
      setGeneratedAvatars(results);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl p-4 border border-orange-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-orange-600">使用提示：</span>
          1. 上传照片 → 2. 选择风格 → 3. 点击生成头像
        </p>
      </div>

      {/* 上传区域 */}
      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadedImage ? 'border-orange-300 bg-orange-50/50' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/30'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">照片已上传</p>
              <p className="text-sm text-slate-500">下方选择风格，点击生成</p>
            </div>
            <Check className="w-8 h-8 text-orange-500" />
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传照片</p>
            <p className="text-sm text-slate-500">点击或拖拽上传</p>
          </>
        )}
      </div>

      {/* 风格选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />选择头像风格
        </p>
        <div className="grid grid-cols-6 gap-3">
          {STYLES.map(style => (
            <button key={style.id} onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedStyle === style.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="text-2xl mb-1">{style.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{style.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <button onClick={handleGenerate} disabled={!uploadedImage || isGenerating}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${!uploadedImage || isGenerating ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-xl'}`}>
        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />生成中...</> : <><Wand2 className="w-5 h-5" />一键生成头像</>}
      </button>

      {/* 结果 */}
      {generatedAvatars.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">生成结果</p>
          <div className="grid grid-cols-4 gap-4">
            {generatedAvatars.map((avatar, idx) => (
              <div key={idx} className="relative group">
                <img src={avatar} alt="" className="w-full aspect-square rounded-xl object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><Download className="w-4 h-4" /></button>
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><Heart className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 工具2: 形象照生成 =====
function ResumePhotoTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('blue');
  const [selectedClothes, setSelectedClothes] = useState('suit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKGROUNDS = [
    { id: 'blue', name: '蓝色', color: '#1E40AF' },
    { id: 'white', name: '白色', color: '#FFFFFF', border: 'border-slate-300' },
    { id: 'gray', name: '灰色', color: '#6B7280' },
    { id: 'gold', name: '金色', color: '#D4AF37' },
  ];

  const CLOTHES = [
    { id: 'suit', name: '西装', emoji: '🤵' },
    { id: 'shirt', name: '衬衫', emoji: '👔' },
    { id: 'casual', name: '休闲', emoji: '👕' },
    { id: 'sweater', name: '毛衣', emoji: '🧥' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => {
      const bg = BACKGROUNDS.find(b => b.id === selectedBg);
      const clothes = CLOTHES.find(c => c.id === selectedClothes);
      setResultImage(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="${bg?.color || '#1E40AF'}" width="400" height="500"/><circle fill="#FFD700" cx="200" cy="180" r="80"/><text x="200" y="180" text-anchor="middle" font-size="60">${clothes?.emoji || '🤵'}</text></svg>`)}`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-sky-600">使用提示：</span>
          1. 上传照片 → 2. 选择风格 → 3. 点击生成头像
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadedImage ? 'border-sky-300 bg-sky-50/50' : 'border-slate-300 hover:border-sky-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">照片已上传</p>
              <p className="text-sm text-slate-500">选择背景和服装，点击生成</p>
            </div>
            <Check className="w-8 h-8 text-sky-500" />
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-sky-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传照片</p>
            <p className="text-sm text-slate-500">点击或拖拽上传</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-500" />选择背景颜色
        </p>
        <div className="grid grid-cols-4 gap-3">
          {BACKGROUNDS.map(bg => (
            <button key={bg.id} onClick={() => setSelectedBg(bg.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedBg === bg.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
              <div className="w-full h-8 rounded-lg mb-2 shadow-inner" style={{ background: bg.color }} />
              <div className="text-sm font-medium text-slate-800">{bg.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择服装风格</p>
        <div className="grid grid-cols-4 gap-3">
          {CLOTHES.map(clothes => (
            <button key={clothes.id} onClick={() => setSelectedClothes(clothes.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedClothes === clothes.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
              <div className="text-2xl mb-1">{clothes.emoji}</div>
              <div className="text-sm font-medium text-slate-800">{clothes.name}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={!uploadedImage || isGenerating}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isGenerating ? 'bg-slate-300' : 'bg-gradient-to-r from-sky-500 to-blue-500'}`}>
        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />生成中...</> : <><ScanFace className="w-5 h-5" />一键生成形象照</>}
      </button>

      {resultImage && (
        <div className="bg-white rounded-xl p-5 border border-slate-100 text-center">
          <img src={resultImage} alt="" className="max-w-xs mx-auto rounded-xl shadow-lg" />
          <button className="mt-4 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto">
            <Download className="w-5 h-5" />下载形象照
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 工具3: 小红书配图 =====
function XiaohongshuTool() {
  const [selectedTemplate, setSelectedTemplate] = useState('fashion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 具象化的内容类型 + 场景示例
  const TEMPLATES = [
    { 
      id: 'fashion', 
      name: '穿搭分享', 
      emoji: '👗', 
      color: 'from-pink-400 to-rose-500',
      example: '今天穿什么出门？',
      tags: ['ootd', '每日穿搭', '穿搭记录']
    },
    { 
      id: 'food', 
      name: '美食探店', 
      emoji: '🍜', 
      color: 'from-amber-400 to-orange-500',
      example: '这家火锅绝了！',
      tags: ['探店', '美食推荐', '网红餐厅']
    },
    { 
      id: 'travel', 
      name: '旅行打卡', 
      emoji: '✈️', 
      color: 'from-sky-400 to-blue-500',
      example: '云南7天6夜攻略',
      tags: ['旅行', '打卡', '攻略']
    },
    { 
      id: 'beauty', 
      name: '美妆护肤', 
      emoji: '💄', 
      color: 'from-purple-400 to-pink-500',
      example: '敏感肌护肤品分享',
      tags: ['护肤', '测评', '好物推荐']
    },
    { 
      id: 'life', 
      name: '家居生活', 
      emoji: '🏠', 
      color: 'from-green-400 to-emerald-500',
      example: '小户型收纳技巧',
      tags: ['家居', '收纳', '生活技巧']
    },
    { 
      id: 'study', 
      name: '学习干货', 
      emoji: '📚', 
      color: 'from-yellow-400 to-amber-500',
      example: '高效学习方法分享',
      tags: ['学习', '干货', '自律']
    },
  ];

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-pink-600">使用提示：</span>
          1. 选择内容类型 → 2. 输入你的主题 → 3. 点击生成封面
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />你的内容是什么类型？
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedTemplate === t.id ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{t.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 选中类型的具体示例 */}
      {template && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{template.emoji}</span>
            <div>
              <p className="font-semibold text-slate-800">{template.name} 这样写更吸引人：</p>
              <p className="text-sm text-pink-600">"{template.example}"</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {template.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-white rounded-full text-xs text-slate-500 border border-slate-200">{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">封面标题（必填）</p>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder={template?.example || "例如：这件衣服也太好看了吧！"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
        <p className="text-xs text-slate-400 mt-2">标题越具体、越有情绪，点赞越高</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">补充说明（选填）</p>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="补充关键词，如：职场、干货、高效"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
        <p className="text-xs text-slate-400 mt-2">多个关键词用逗号分隔</p>
      </div>

      {/* 实时预览 */}
      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />封面预览
          </p>
          <div className={`aspect-square max-w-xs mx-auto bg-gradient-to-br ${template?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
            <div className="text-5xl mb-4">{template?.emoji}</div>
            <div className="text-white text-xl font-bold drop-shadow-lg">{title}</div>
            {description && <div className="text-white/80 text-sm mt-2">{description}</div>}
          </div>
        </div>
      )}

      <button disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-xl' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
        <Check className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}

// ===== 工具4: 抖音封面 =====
function DouyinTool() {
  const [selectedStyle, setSelectedStyle] = useState('hot');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  // 具象化的风格 + 场景示例
  const STYLES = [
    { id: 'hot', name: '热门爆款', emoji: '🔥', color: 'from-red-500 to-orange-500', example: '这个技巧太绝了！', desc: '吸引眼球，引发好奇' },
    { id: 'fashion', name: '时尚潮流', emoji: '💫', color: 'from-purple-500 to-pink-500', example: '2024最火穿搭', desc: '年轻、时尚、有品味' },
    { id: 'funny', name: '搞笑趣味', emoji: '🤣', color: 'from-yellow-500 to-amber-500', example: '笑死我了哈哈哈', desc: '轻松搞笑，引发分享' },
    { id: 'food', name: '美食探店', emoji: '🍜', color: 'from-orange-500 to-red-500', example: '人均50吃到撑！', desc: '美食诱惑，引诱食欲' },
    { id: 'beauty', name: '美妆教程', emoji: '💄', color: 'from-pink-500 to-rose-500', example: '新手化妆教程', desc: '教程类，实用有价值' },
    { id: 'daily', name: 'Vlog日常', emoji: '📷', color: 'from-sky-500 to-blue-500', example: '我的一天', desc: '真实记录，引发共鸣' },
  ];

  const style = STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-purple-600">使用提示：</span>
          1. 选择视频类型 → 2. 写个吸引人的标题 → 3. 点击生成封面
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />你的视频是什么类型？
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedStyle === s.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{s.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 选中类型的具体示例 */}
      {style && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{style.emoji}</span>
            <div>
              <p className="font-semibold text-slate-800">{style.name} 标题这样写：</p>
              <p className="text-sm text-purple-600">"{style.example}"</p>
              <p className="text-xs text-slate-500 mt-1">{style.desc}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">视频标题（必填）</p>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder={style?.example || "例如：这个搭配绝了！"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors" />
        <p className="text-xs text-slate-400 mt-2">用感叹句、疑问句更容易吸引点击</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">补充信息（选填）</p>
        <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
          placeholder="例如：第100件好物分享"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors" />
      </div>

      {/* 封面预览 */}
      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" />封面预览
          </p>
          <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative shadow-lg">
            <div className="text-5xl mb-4">{style?.emoji}</div>
            <div className="text-white text-xl font-bold drop-shadow-lg">{title}</div>
            {subtitle && <div className="text-white/80 text-sm mt-2">{subtitle}</div>}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      <button disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
        <Check className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}

// ===== 工具5: 节日海报 =====
function FestivalPosterTool() {
  const [selectedFestival, setSelectedFestival] = useState('duanwu');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [customText, setCustomText] = useState('');

  // 具象化的节日 + 使用场景
  const FESTIVALS = [
    { id: 'duanwu', name: '端午节', emoji: '🐉', color: 'from-green-500 to-emerald-600', example: '粽香四溢，端午安康', month: '6月' },
    { id: 'midautumn', name: '中秋节', emoji: '🥮', color: 'from-yellow-500 to-orange-500', example: '月圆人团圆', month: '9月' },
    { id: 'spring', name: '春节', emoji: '🧧', color: 'from-red-500 to-rose-600', example: '新年快乐，万事如意', month: '1月' },
    { id: 'national', name: '国庆节', emoji: '🇨🇳', color: 'from-red-600 to-yellow-500', example: '庆祝祖国华诞', month: '10月' },
    { id: 'newyear', name: '元旦', emoji: '🎆', color: 'from-purple-500 to-pink-500', example: '新年新气象', month: '1月' },
    { id: 'valentine', name: '情人节', emoji: '💕', color: 'from-pink-500 to-rose-500', example: '爱你如初', month: '2月' },
  ];

  const TEMPLATES = [
    { id: 'classic', name: '经典红色', bg: 'bg-gradient-to-br from-red-500 to-orange-500', desc: '适合节日营销' },
    { id: 'modern', name: '现代简约', bg: 'bg-gradient-to-br from-slate-700 to-slate-900', desc: '适合年轻品牌' },
    { id: 'fresh', name: '清新自然', bg: 'bg-gradient-to-br from-green-400 to-teal-500', desc: '适合食品/健康' },
    { id: 'golden', name: '金碧辉煌', bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', desc: '适合高端礼品' },
  ];

  const festival = FESTIVALS.find(f => f.id === selectedFestival);
  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-red-600">使用提示：</span>
          1. 选择节日 → 2. 选择风格 → 3. 输入祝福语 → 4. 点击生成
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />选择节日
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FESTIVALS.map(f => (
            <button key={f.id} onClick={() => setSelectedFestival(f.id)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedFestival === f.id ? 'border-red-500 bg-red-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>{f.emoji}</div>
              <div className="text-sm font-medium text-slate-800">{f.name}</div>
              <div className="text-xs text-slate-400">{f.month}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 选中节日的祝福语示例 */}
      {festival && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{festival.emoji}</span>
            <div>
              <p className="font-semibold text-slate-800">{festival.name}祝福语示例：</p>
              <p className="text-sm text-red-600">"{festival.example}"</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择模板风格</p>
        <div className="grid grid-cols-4 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
              <div className={`w-full h-12 rounded-lg ${t.bg} mb-2`} />
              <div className="text-sm font-medium text-slate-800">{t.name}</div>
              <div className="text-xs text-slate-400">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">自定义祝福语</p>
        <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder={festival?.example || "例如：端午节快乐！"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors" />
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-red-500" />海报预览
        </p>
        <div className={`aspect-[3/4] max-w-xs mx-auto ${template?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
          <div className="text-6xl mb-4">{festival?.emoji}</div>
          <div className="text-white text-2xl font-bold drop-shadow-lg">{festival?.name}</div>
          <div className="text-white/90 text-lg">{customText || festival?.example}</div>
        </div>
      </div>

      <button className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
        <Check className="w-5 h-5" />一键生成海报
      </button>
    </div>
  );
}

// ===== 工具6: 商品详情 =====
function ProductPageTool() {
  const [selectedColor, setSelectedColor] = useState('pink');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 具象化的配色 + 场景
  const COLORS = [
    { id: 'pink', name: '粉嫩色', bg: 'bg-gradient-to-br from-pink-100 to-rose-200', accent: 'text-rose-500', desc: '适合美妆/服饰' },
    { id: 'blue', name: '清新蓝', bg: 'bg-gradient-to-br from-sky-100 to-blue-200', accent: 'text-blue-500', desc: '适合科技/数码' },
    { id: 'green', name: '自然绿', bg: 'bg-gradient-to-br from-green-100 to-emerald-200', accent: 'text-emerald-500', desc: '适合食品/健康' },
    { id: 'purple', name: '优雅紫', bg: 'bg-gradient-to-br from-purple-100 to-violet-200', accent: 'text-purple-500', desc: '适合礼品/珠宝' },
    { id: 'orange', name: '活力橙', bg: 'bg-gradient-to-br from-orange-100 to-amber-200', accent: 'text-orange-500', desc: '适合促销/家居' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string].slice(0, 6));
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const color = COLORS.find(c => c.id === selectedColor);

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-pink-600">使用提示：</span>
          1. 上传产品图 → 2. 选择配色 → 3. 填写信息 → 4. 点击生成
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />上传产品图片
        </p>
        <div className="grid grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">x</button>
            </div>
          ))}
          {images.length < 6 && (
            <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-pink-400">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">点击添加更多图片，最多6张，支持拖拽排序</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择配色方案</p>
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map(c => (
            <button key={c.id} onClick={() => setSelectedColor(c.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedColor === c.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200'}`}>
              <div className={`w-full h-8 rounded-lg ${c.bg} mb-2`} />
              <div className="text-xs font-medium text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-400">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">产品信息</p>
        <div className="space-y-4">
          <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
            placeholder="例如：2024新款女士手提包"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
          <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}
            placeholder="描述产品特点，如：头层牛皮、简约设计、多隔层"
            rows={2}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors resize-none" />
        </div>
      </div>

      <button disabled={!productName.trim()} className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${productName.trim() ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
        <Check className="w-5 h-5" />一键生成详情页
      </button>
    </div>
  );
}

// ===== 工具7: 餐饮菜单 =====
function RestaurantMenuTool() {
  const [menuStyle, setMenuStyle] = useState('elegant');
  const [menuItems, setMenuItems] = useState<{ id: number; name: string; price: string }[]>([
    { id: 1, name: '', price: '' }
  ]);

  const STYLES = [
    { id: 'elegant', name: '典雅风格', color: 'from-amber-100 to-orange-200', desc: '适合中餐/酒楼' },
    { id: 'simple', name: '简约风格', color: 'from-slate-100 to-gray-200', desc: '适合咖啡厅/轻食' },
    { id: 'vintage', name: '复古风格', color: 'from-yellow-100 to-amber-200', desc: '适合面馆/小吃' },
    { id: 'fresh', name: '清新风格', color: 'from-green-100 to-emerald-200', desc: '适合火锅/烧烤' },
  ];

  const addMenuItem = () => setMenuItems([...menuItems, { id: Date.now(), name: '', price: '' }]);
  const removeMenuItem = (id: number) => { if (menuItems.length > 1) setMenuItems(menuItems.filter(item => item.id !== id)); };
  const updateMenuItem = (id: number, field: 'name' | 'price', value: string) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const style = STYLES.find(s => s.id === menuStyle);
  const validItems = menuItems.filter(item => item.name.trim());

  return (
    <div className="space-y-6">
      {/* 操作指引 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-amber-600">使用提示：</span>
          1. 选择风格 → 2. 添加菜品 → 3. 点击生成菜单
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />选择菜单风格
        </p>
        <div className="grid grid-cols-4 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setMenuStyle(s.id)}
              className={`p-3 rounded-xl border-2 transition-all ${menuStyle === s.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${s.color} mb-2`} />
              <div className="text-sm font-medium text-slate-800">{s.name}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-slate-800 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-500" />添加菜品
          </p>
          <button onClick={addMenuItem} className="flex items-center gap-1 text-sm text-amber-500 font-medium">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>
        <div className="space-y-3">
          {menuItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm text-amber-600 font-medium">{idx + 1}</span>
              <input type="text" value={item.name} onChange={e => updateMenuItem(item.id, 'name', e.target.value)}
                placeholder="例如：招牌红烧肉" className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
              <input type="text" value={item.price} onChange={e => updateMenuItem(item.id, 'price', e.target.value)}
                placeholder="¥68" className="w-24 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
              <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>

      {validItems.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">菜单预览</p>
          <div className={`max-w-md mx-auto p-8 bg-gradient-to-br ${style?.color} rounded-2xl shadow-inner`}>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">菜单</h2>
            <div className="space-y-3">
              {validItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.price || '¥--'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button disabled={validItems.length === 0} className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${validItems.length > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        <Check className="w-5 h-5" />一键生成
      </button>
    </div>
  );
}

// ===== 主页面组件 =====
export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('retouch');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['retouch', 'social', 'ecommerce']);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const currentCategory = CATEGORIES.find(c => c.key === activeCategory);
  const currentTool = currentCategory?.tools.find(t => t.key === activeTool);

  const renderTool = () => {
    switch (activeTool) {
      case 'avatar-emoji': return <AvatarEmojiTool />;
      case 'resume-photo': return <ResumePhotoTool />;
      case 'xiaohongshu': return <XiaohongshuTool />;
      case 'douyin': return <DouyinTool />;
      case 'festival-poster': return <FestivalPosterTool />;
      case 'productpage': return <ProductPageTool />;
      case 'restaurant-menu': return <RestaurantMenuTool />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左侧导航 */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20">
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <AnimatedLobster size={18} />
            </div>
            <span className="font-bold text-sm text-slate-800">OneClaw</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* 顶部导航 */}
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <Home className="w-5 h-5" />
            <span>首页</span>
          </Link>
          <Link href="/tools" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-slate-100 text-slate-800 font-medium">
            <Grid3X3 className="w-5 h-5" />
            <span>工具</span>
          </Link>
          <Link href="/templates" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <Sparkles className="w-5 h-5" />
            <span>模板</span>
          </Link>

          <div className="h-px bg-slate-100 my-3" />

          {/* 工具分类 */}
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isExpanded = expandedCategories.includes(cat.key);
            return (
              <div key={cat.key}>
                <button
                  onClick={() => { setActiveCategory(cat.key); toggleCategory(cat.key); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeCategory === cat.key ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{cat.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {cat.tools.map(tool => (
                      <button
                        key={tool.key}
                        onClick={() => { setActiveCategory(cat.key); setActiveTool(tool.key); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          activeTool === tool.key ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded ${tool.color} flex items-center justify-center`} />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link href="/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </Link>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 ml-64">
        <div className="p-6 pb-24 max-w-4xl">
          {/* 面包屑 */}
          {activeTool && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button onClick={() => setActiveTool(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                返回{currentCategory?.label}
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-medium">{currentTool?.name}</span>
            </div>
          )}

          {/* 工具内容 */}
          {activeTool ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">{currentTool?.name}</h1>
                <p className="text-sm text-slate-500 mt-1">{currentTool?.desc}</p>
              </div>
              {renderTool()}
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{currentCategory?.label}</h1>
              <p className="text-sm text-slate-500 mb-6">选择下方工具开始使用</p>
              
              {/* 工具卡片网格 */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCategory?.tools.map(tool => (
                  <button
                    key={tool.key}
                    onClick={() => setActiveTool(tool.key)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
                  >
                    <div className={`h-28 bg-gradient-to-br ${tool.color} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-14 h-14 rounded-xl ${tool.iconBg} flex items-center justify-center shadow-lg`}>
                          {tool.key === 'avatar-emoji' && <Wand2 className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'resume-photo' && <ScanFace className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'xiaohongshu' && <FileText className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'douyin' && <Play className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'festival-poster' && <PartyPopper className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'productpage' && <Package className={`w-7 h-7 ${tool.iconColor}`} />}
                          {tool.key === 'restaurant-menu' && <Coffee className={`w-7 h-7 ${tool.iconColor}`} />}
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="w-4 h-4 text-slate-500 rotate-180" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 mb-1">{tool.name}</h3>
                      <p className="text-sm text-slate-500">{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
