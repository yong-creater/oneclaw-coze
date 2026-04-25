'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, Grid3X3, Sparkles, LogIn,
  ChevronRight, ArrowLeft, Upload, RefreshCw,
  Check, Plus, Trash2, Download, Wand2,
  Image, Palette, FileText, Play, Coffee,
  ScanFace, PartyPopper, Package, Crop,
  Eraser, Maximize2, Layers, Languages
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// 简化的AI工具分类（参考美图设计室）
const AI_TOOLS = [
  // ===== AI图片处理 =====
  {
    key: 'remove-bg',
    name: 'AI抠图',
    desc: '一键去除背景，秒变透明图',
    emoji: '✂️',
    color: 'from-blue-100 to-cyan-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    category: '图片处理'
  },
  {
    key: 'enhance',
    name: '变清晰',
    desc: '模糊图片一键修复高清',
    emoji: '🔍',
    color: 'from-purple-100 to-violet-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    category: '图片处理'
  },
  {
    key: 'resize',
    name: '改尺寸',
    desc: '无损放大/缩小图片',
    emoji: '📐',
    color: 'from-green-100 to-emerald-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    category: '图片处理'
  },
  {
    key: 'remove-object',
    name: 'AI消除',
    desc: '去掉图片中的杂物/水印',
    emoji: '🧹',
    color: 'from-orange-100 to-amber-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    category: '图片处理'
  },
  {
    key: 'avatar-emoji',
    name: '头像生成',
    desc: '照片生成卡通/动漫头像',
    emoji: '🎨',
    color: 'from-pink-100 to-rose-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    category: '图片处理'
  },
  {
    key: 'resume-photo',
    name: '证件照',
    desc: '生成各类证件照/形象照',
    emoji: '📸',
    color: 'from-sky-100 to-blue-200',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    category: '图片处理'
  },
  // ===== AI营销图 =====
  {
    key: 'xiaohongshu',
    name: '小红书封面',
    desc: '小红书爆款封面一键生成',
    emoji: '📕',
    color: 'from-red-100 to-orange-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    category: '营销图'
  },
  {
    key: 'douyin',
    name: '视频封面',
    desc: '抖音/视频号封面生成',
    emoji: '🎬',
    color: 'from-violet-100 to-purple-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    category: '营销图'
  },
  {
    key: 'festival-poster',
    name: '节日海报',
    desc: '节日营销海报一键生成',
    emoji: '🎊',
    color: 'from-rose-100 to-pink-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    category: '营销图'
  },
  {
    key: 'productpage',
    name: '商品主图',
    desc: '电商主图/详情页生成',
    emoji: '🛍️',
    color: 'from-teal-100 to-cyan-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    category: '营销图'
  },
  // ===== AI设计 =====
  {
    key: 'restaurant-menu',
    name: '菜单设计',
    desc: '餐厅菜单智能生成',
    emoji: '🍽️',
    color: 'from-amber-100 to-yellow-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    category: 'AI设计'
  },
];

// 分类图标映射
const CATEGORY_ICONS: Record<string, any> = {
  '图片处理': Image,
  '营销图': FileText,
  'AI设计': Sparkles,
};

// ===== 工具1: AI抠图 =====
function RemoveBgTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleProcess = () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setTimeout(() => {
      setResultImage(uploadedImage);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-blue-600">使用提示：</span>
          上传图片 → 点击按钮 → 下载透明背景图
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadedImage ? 'border-blue-300 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">图片已上传</p>
              <p className="text-sm text-slate-500">点击开始AI抠图</p>
            </div>
            <Check className="w-8 h-8 text-blue-500" />
          </div>
        ) : (
          <>
            <Image className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传图片</p>
            <p className="text-sm text-slate-500">支持 JPG、PNG，建议主体清晰</p>
          </>
        )}
      </div>

      <button onClick={handleProcess} disabled={!uploadedImage || isProcessing}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isProcessing ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl'}`}>
        {isProcessing ? <><RefreshCw className="w-5 h-5 animate-spin" />AI处理中...</> : <><Wand2 className="w-5 h-5" />一键抠图</>}
      </button>

      {resultImage && (
        <div className="bg-white rounded-xl p-5 border border-slate-100 text-center">
          <p className="font-medium text-slate-800 mb-3">抠图完成！</p>
          <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2MzYzRjNyIvPjxyZWN0IHg9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNlM2UzZTciLz48L3N2Zz4=')] p-8 rounded-xl">
            <img src={resultImage} alt="" className="max-w-xs mx-auto" />
          </div>
          <button className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto">
            <Download className="w-5 h-5" />下载透明图
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 工具2: 变清晰 =====
function EnhanceTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [level, setLevel] = useState('2x');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-purple-600">使用提示：</span>
          上传模糊图 → 选择倍数 → 一键变清晰
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-purple-300 bg-purple-50/50' : 'border-slate-300 hover:border-purple-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setUploadedImage(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">图片已上传</p>
              <p className="text-sm text-slate-500">选择清晰度，点击处理</p>
            </div>
          </div>
        ) : (
          <>
            <Image className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传模糊图片</p>
            <p className="text-sm text-slate-500">支持 JPG、PNG</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">清晰度倍数</p>
        <div className="grid grid-cols-3 gap-3">
          {['2x', '4x', '8x'].map(m => (
            <button key={m} onClick={() => setLevel(m)}
              className={`p-4 rounded-xl border-2 font-medium ${level === m ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-500'}`}>
              {m} 倍
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleProcess} disabled={!uploadedImage || isProcessing}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isProcessing ? 'bg-slate-300' : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'}`}>
        {isProcessing ? <><RefreshCw className="w-5 h-5 animate-spin" />AI处理中...</> : <><Wand2 className="w-5 h-5" />一键变清晰</>}
      </button>
    </div>
  );
}

// ===== 工具3: 改尺寸 =====
function ResizeTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [preset, setPreset] = useState('square');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESETS = [
    { id: 'square', name: '正方形', size: '1:1', desc: '小红书、微博', emoji: '📐' },
    { id: 'portrait', name: '竖版', size: '3:4', desc: '抖音封面、朋友圈', emoji: '📱' },
    { id: 'landscape', name: '横版', size: '16:9', desc: 'B站封面、视频号', emoji: '🖥️' },
    { id: 'story', name: '故事版', size: '9:16', desc: '抖音故事、朋友圈', emoji: '📲' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-green-600">使用提示：</span>
          上传图片 → 选择尺寸 → 下载无损图
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-green-300 bg-green-50/50' : 'border-slate-300 hover:border-green-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setUploadedImage(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">图片已上传</p>
              <p className="text-sm text-slate-500">选择目标尺寸</p>
            </div>
          </div>
        ) : (
          <>
            <Maximize2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传图片</p>
            <p className="text-sm text-slate-500">AI无损放大/缩小</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择尺寸</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => setPreset(p.id)}
              className={`p-4 rounded-xl border-2 text-left ${preset === p.id ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.size}</div>
              <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button disabled={!uploadedImage}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage ? 'bg-slate-300' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'}`}>
        <Wand2 className="w-5 h-5" />无损改尺寸
      </button>
    </div>
  );
}

// ===== 工具4: AI消除 =====
function RemoveObjectTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState('small');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-orange-600">使用提示：</span>
          上传图片 → 涂抹要去掉的内容 → 一键消除
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-orange-300 bg-orange-50/50' : 'border-slate-300 hover:border-orange-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setUploadedImage(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">图片已上传</p>
              <p className="text-sm text-slate-500">涂抹要去掉的部分</p>
            </div>
          </div>
        ) : (
          <>
            <Eraser className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传图片</p>
            <p className="text-sm text-slate-500">去除水印、杂物、路人</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">涂抹笔大小</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'small', name: '小', desc: '精细消除' },
            { id: 'medium', name: '中', desc: '一般消除' },
            { id: 'large', name: '大', desc: '大面积消除' },
          ].map(b => (
            <button key={b.id} onClick={() => setBrushSize(b.id)}
              className={`p-4 rounded-xl border-2 ${brushSize === b.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
              <div className="font-medium text-slate-800">{b.name}</div>
              <div className="text-xs text-slate-500">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button disabled={!uploadedImage}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage ? 'bg-slate-300' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'}`}>
        <Wand2 className="w-5 h-5" />AI消除
      </button>
    </div>
  );
}

// ===== 工具5: 头像生成 =====
function AvatarEmojiTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STYLES = [
    { id: 'cartoon', name: '卡通', emoji: '🎨' },
    { id: 'anime', name: '动漫', emoji: '✨' },
    { id: '3d', name: '3D', emoji: '🎭' },
    { id: 'pixel', name: '像素', emoji: '👾' },
  ];

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD'];
      const results = Array.from({ length: 4 }, (_, i) => {
        const emoji = STYLES.find(s => s.id === selectedStyle)?.emoji || '🎨';
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${colors[i % colors.length]}" width="300" height="300" rx="50"/><circle fill="#FFD700" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="80">${emoji}</text></svg>`)}`;
      });
      setGeneratedAvatars(results);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-pink-600">使用提示：</span>
          上传照片 → 选择风格 → 一键生成
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-pink-300 bg-pink-50/50' : 'border-slate-300 hover:border-pink-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setUploadedImage(URL.createObjectURL(e.target.files[0])); setGeneratedAvatars([]); } }} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">照片已上传</p>
              <p className="text-sm text-slate-500">选择风格，点击生成</p>
            </div>
          </div>
        ) : (
          <>
            <Palette className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传照片</p>
            <p className="text-sm text-slate-500">生成卡通/动漫头像</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择风格</p>
        <div className="grid grid-cols-4 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setSelectedStyle(s.id)}
              className={`p-4 rounded-xl border-2 ${selectedStyle === s.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200'}`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-sm font-medium text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={!uploadedImage || isGenerating}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isGenerating ? 'bg-slate-300' : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'}`}>
        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />生成中...</> : <><Wand2 className="w-5 h-5" />一键生成</>}
      </button>

      {generatedAvatars.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">生成结果</p>
          <div className="grid grid-cols-4 gap-4">
            {generatedAvatars.map((avatar, idx) => (
              <div key={idx} className="relative group">
                <img src={avatar} alt="" className="w-full aspect-square rounded-xl" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 工具6: 证件照 =====
function ResumePhotoTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('blue');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKGROUNDS = [
    { id: 'blue', name: '蓝色', color: '#1E40AF' },
    { id: 'white', name: '白色', color: '#FFFFFF', border: 'border-slate-300' },
    { id: 'gray', name: '灰色', color: '#6B7280' },
  ];

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-sky-600">使用提示：</span>
          上传照片 → 选择背景色 → 生成证件照
        </p>
      </div>

      <div onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-sky-300 bg-sky-50/50' : 'border-slate-300 hover:border-sky-400'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setUploadedImage(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
        {uploadedImage ? (
          <div className="flex items-center gap-6">
            <img src={uploadedImage} alt="" className="w-20 h-20 rounded-xl object-cover shadow" />
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">照片已上传</p>
              <p className="text-sm text-slate-500">选择背景色，点击生成</p>
            </div>
          </div>
        ) : (
          <>
            <ScanFace className="w-12 h-12 text-sky-400 mx-auto mb-3" />
            <p className="font-medium text-slate-800">上传照片</p>
            <p className="text-sm text-slate-500">生成证件照、形象照</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择背景色</p>
        <div className="grid grid-cols-3 gap-3">
          {BACKGROUNDS.map(bg => (
            <button key={bg.id} onClick={() => setSelectedBg(bg.id)}
              className={`p-4 rounded-xl border-2 ${selectedBg === bg.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
              <div className={`w-full h-10 rounded-lg mb-2 shadow-inner ${bg.border || ''}`} style={{ background: bg.color }} />
              <div className="text-sm font-medium text-slate-800">{bg.name}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={!uploadedImage || isGenerating}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isGenerating ? 'bg-slate-300' : 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'}`}>
        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />处理中...</> : <><Wand2 className="w-5 h-5" />生成证件照</>}
      </button>
    </div>
  );
}

// ===== 工具7: 小红书封面 =====
function XiaohongshuTool() {
  const [selectedTemplate, setSelectedTemplate] = useState('fashion');
  const [title, setTitle] = useState('');

  const TEMPLATES = [
    { id: 'fashion', name: '穿搭', emoji: '👗', color: 'from-pink-400 to-rose-500', example: '这件衣服也太好看了吧！' },
    { id: 'food', name: '美食', emoji: '🍜', color: 'from-amber-400 to-orange-500', example: '这家店绝了！' },
    { id: 'travel', name: '旅行', emoji: '✈️', color: 'from-sky-400 to-blue-500', example: '云南7天6夜攻略' },
    { id: 'beauty', name: '美妆', emoji: '💄', color: 'from-purple-400 to-pink-500', example: '敏感肌护肤品分享' },
    { id: 'life', name: '生活', emoji: '🏠', color: 'from-green-400 to-emerald-500', example: '小户型收纳技巧' },
    { id: 'study', name: '干货', emoji: '📚', color: 'from-yellow-400 to-amber-500', example: '高效学习方法' },
  ];

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-red-600">使用提示：</span>
          选择内容类型 → 输入标题 → 一键生成封面
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择内容类型</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`p-3 rounded-xl border-2 ${selectedTemplate === t.id ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{t.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {template && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考标题：<span className="text-red-600">"{template.example}"</span></p>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入标题</p>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder={template?.example || "输入你的标题"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors" />
      </div>

      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">封面预览</p>
          <div className={`aspect-square max-w-xs mx-auto bg-gradient-to-br ${template?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
            <div className="text-5xl mb-4">{template?.emoji}</div>
            <div className="text-white text-xl font-bold">{title}</div>
          </div>
        </div>
      )}

      <button disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        <Wand2 className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}

// ===== 工具8: 视频封面 =====
function DouyinTool() {
  const [selectedStyle, setSelectedStyle] = useState('hot');
  const [title, setTitle] = useState('');

  const STYLES = [
    { id: 'hot', name: '热门', emoji: '🔥', color: 'from-red-500 to-orange-500', example: '这个技巧太绝了！' },
    { id: 'fashion', name: '时尚', emoji: '💫', color: 'from-purple-500 to-pink-500', example: '2024最火穿搭' },
    { id: 'funny', name: '搞笑', emoji: '🤣', color: 'from-yellow-500 to-amber-500', example: '笑死我了哈哈哈' },
    { id: 'food', name: '美食', emoji: '🍜', color: 'from-orange-500 to-red-500', example: '人均50吃到撑！' },
    { id: 'beauty', name: '美妆', emoji: '💄', color: 'from-pink-500 to-rose-500', example: '新手化妆教程' },
    { id: 'daily', name: '日常', emoji: '📷', color: 'from-sky-500 to-blue-500', example: '我的一天' },
  ];

  const style = STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-violet-600">使用提示：</span>
          选择视频类型 → 输入标题 → 一键生成封面
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择视频类型</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-xl border-2 ${selectedStyle === s.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{s.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {style && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考标题：<span className="text-violet-600">"{style.example}"</span></p>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入视频标题</p>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder={style?.example || "输入视频标题"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors" />
      </div>

      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">封面预览</p>
          <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative shadow-lg">
            <div className="text-5xl mb-4">{style?.emoji}</div>
            <div className="text-white text-xl font-bold">{title}</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      <button disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        <Wand2 className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}

// ===== 工具9: 节日海报 =====
function FestivalPosterTool() {
  const [selectedFestival, setSelectedFestival] = useState('duanwu');
  const [customText, setCustomText] = useState('');

  const FESTIVALS = [
    { id: 'duanwu', name: '端午', emoji: '🐉', color: 'from-green-500 to-emerald-600', example: '端午安康', month: '6月' },
    { id: 'midautumn', name: '中秋', emoji: '🥮', color: 'from-yellow-500 to-orange-500', example: '月圆人团圆', month: '9月' },
    { id: 'spring', name: '春节', emoji: '🧧', color: 'from-red-500 to-rose-600', example: '新年快乐', month: '1月' },
    { id: 'national', name: '国庆', emoji: '🇨🇳', color: 'from-red-600 to-yellow-500', example: '欢度国庆', month: '10月' },
    { id: 'newyear', name: '元旦', emoji: '🎆', color: 'from-purple-500 to-pink-500', example: '新年新气象', month: '1月' },
    { id: 'valentine', name: '情人', emoji: '💕', color: 'from-pink-500 to-rose-500', example: '爱你如初', month: '2月' },
  ];

  const festival = FESTIVALS.find(f => f.id === selectedFestival);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-rose-600">使用提示：</span>
          选择节日 → 输入祝福语 → 一键生成海报
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择节日</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FESTIVALS.map(f => (
            <button key={f.id} onClick={() => setSelectedFestival(f.id)}
              className={`p-3 rounded-xl border-2 ${selectedFestival === f.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>{f.emoji}</div>
              <div className="text-sm font-medium text-slate-800">{f.name}</div>
              <div className="text-xs text-slate-400">{f.month}</div>
            </button>
          ))}
        </div>
      </div>

      {festival && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考祝福：<span className="text-rose-600">"{festival.example}"</span></p>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入祝福语</p>
        <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder={festival?.example || "输入祝福语"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 transition-colors" />
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">海报预览</p>
        <div className={`aspect-[3/4] max-w-xs mx-auto bg-gradient-to-br ${festival?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
          <div className="text-6xl mb-4">{festival?.emoji}</div>
          <div className="text-white text-2xl font-bold">{festival?.name}</div>
          <div className="text-white/90 text-lg mt-2">{customText || festival?.example}</div>
        </div>
      </div>

      <button className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg">
        <Wand2 className="w-5 h-5" />一键生成海报
      </button>
    </div>
  );
}

// ===== 工具10: 商品主图 =====
function ProductPageTool() {
  const [selectedColor, setSelectedColor] = useState('pink');
  const [productName, setProductName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COLORS = [
    { id: 'pink', name: '粉色系', bg: 'from-pink-100 to-rose-200' },
    { id: 'blue', name: '蓝色系', bg: 'from-sky-100 to-blue-200' },
    { id: 'green', name: '绿色系', bg: 'from-green-100 to-emerald-200' },
    { id: 'purple', name: '紫色系', bg: 'from-purple-100 to-violet-200' },
    { id: 'orange', name: '橙色系', bg: 'from-orange-100 to-amber-200' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setImages(prev => [...prev, ev.target!.result as string].slice(0, 6));
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const color = COLORS.find(c => c.id === selectedColor);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-teal-600">使用提示：</span>
          上传产品图 → 选择配色 → 输入信息 → 生成主图
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">上传产品图</p>
        <div className="grid grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">x</button>
            </div>
          ))}
          {images.length < 6 && (
            <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-teal-400">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择配色</p>
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map(c => (
            <button key={c.id} onClick={() => setSelectedColor(c.id)}
              className={`p-3 rounded-xl border-2 ${selectedColor === c.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}>
              <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${c.bg} mb-2`} />
              <div className="text-xs font-medium text-slate-800">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">产品信息</p>
        <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
          placeholder="输入产品名称"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors" />
      </div>

      <button disabled={!productName.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${productName.trim() ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        <Wand2 className="w-5 h-5" />一键生成主图
      </button>
    </div>
  );
}

// ===== 工具11: 菜单设计 =====
function RestaurantMenuTool() {
  const [menuItems, setMenuItems] = useState<{ id: number; name: string; price: string }[]>([
    { id: 1, name: '', price: '' }
  ]);
  const [selectedStyle, setSelectedStyle] = useState('elegant');

  const STYLES = [
    { id: 'elegant', name: '典雅风', color: 'from-amber-100 to-orange-200' },
    { id: 'simple', name: '简约风', color: 'from-slate-100 to-gray-200' },
    { id: 'fresh', name: '清新风', color: 'from-green-100 to-emerald-200' },
  ];

  const addMenuItem = () => setMenuItems([...menuItems, { id: Date.now(), name: '', price: '' }]);
  const removeMenuItem = (id: number) => { if (menuItems.length > 1) setMenuItems(menuItems.filter(item => item.id !== id)); };
  const updateMenuItem = (id: number, field: 'name' | 'price', value: string) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const style = STYLES.find(s => s.id === selectedStyle);
  const validItems = menuItems.filter(item => item.name.trim());

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-amber-600">使用提示：</span>
          添加菜品 → 选择风格 → 一键生成菜单
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择风格</p>
        <div className="grid grid-cols-3 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-xl border-2 ${selectedStyle === s.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${s.color} mb-2`} />
              <div className="text-sm font-medium text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-slate-800">添加菜品</p>
          <button onClick={addMenuItem} className="flex items-center gap-1 text-sm text-amber-500 font-medium">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>
        <div className="space-y-3">
          {menuItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm text-amber-600 font-medium">{idx + 1}</span>
              <input type="text" value={item.name} onChange={e => updateMenuItem(item.id, 'name', e.target.value)}
                placeholder="菜名" className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
              <input type="text" value={item.price} onChange={e => updateMenuItem(item.id, 'price', e.target.value)}
                placeholder="¥68" className="w-24 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
              <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>

      {validItems.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">菜单预览</p>
          <div className={`max-w-md mx-auto p-8 bg-gradient-to-br ${style?.color} rounded-2xl`}>
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

      <button disabled={validItems.length === 0}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${validItems.length > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        <Wand2 className="w-5 h-5" />一键生成菜单
      </button>
    </div>
  );
}

// ===== 主页面组件 =====
export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['图片处理', '营销图', 'AI设计']);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const currentTool = AI_TOOLS.find(t => t.key === activeTool);

  // 按分类分组工具
  const toolsByCategory = AI_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof AI_TOOLS>);

  const renderTool = () => {
    switch (activeTool) {
      case 'remove-bg': return <RemoveBgTool />;
      case 'enhance': return <EnhanceTool />;
      case 'resize': return <ResizeTool />;
      case 'remove-object': return <RemoveObjectTool />;
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
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50">
            <Home className="w-5 h-5" />
            <span>首页</span>
          </Link>
          <Link href="/tools" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-slate-100 text-slate-800 font-medium">
            <Grid3X3 className="w-5 h-5" />
            <span>工具</span>
          </Link>

          <div className="h-px bg-slate-100 my-3" />

          {Object.entries(toolsByCategory).map(([category, tools]) => {
            const Icon = CATEGORY_ICONS[category] || Sparkles;
            const isExpanded = expandedCategories.includes(category);
            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${isExpanded ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{category}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {tools.map(tool => (
                      <button
                        key={tool.key}
                        onClick={() => setActiveTool(tool.key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTool === tool.key ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <span>{tool.emoji}</span>
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <Link href="/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50">
            <LogIn className="w-5 h-5" />
            <span>登录</span>
          </Link>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 ml-64">
        <div className="p-6 pb-24 max-w-4xl">
          {activeTool ? (
            <>
              <div className="mb-6 flex items-center gap-2 text-sm">
                <button onClick={() => setActiveTool(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  返回工具列表
                </button>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{currentTool?.name}</h1>
              <p className="text-sm text-slate-500 mb-6">{currentTool?.desc}</p>
              {renderTool()}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">AI工具箱</h1>
              <p className="text-sm text-slate-500 mb-6">点击下方工具开始使用，AI自动处理，无需设计基础</p>
              
              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {tools.map(tool => (
                      <button
                        key={tool.key}
                        onClick={() => setActiveTool(tool.key)}
                        className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all text-left"
                      >
                        <div className={`h-24 bg-gradient-to-br ${tool.color} relative flex items-center justify-center`}>
                          <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center shadow-lg`}>
                            <span className="text-2xl">{tool.emoji}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-800">{tool.name}</h3>
                          <p className="text-sm text-slate-500">{tool.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
