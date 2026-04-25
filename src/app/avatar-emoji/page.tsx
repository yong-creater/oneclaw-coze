'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Wand2, RefreshCw, Download, 
  Check, Heart, Share2
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// 头像风格
const AVATAR_STYLES = [
  { id: 'cartoon', name: '卡通头像', emoji: '🎨', color: 'bg-pink-100 text-pink-600', border: 'border-pink-200' },
  { id: 'anime', name: '动漫头像', emoji: '✨', color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
  { id: 'pixel', name: '像素头像', emoji: '👾', color: 'bg-green-100 text-green-600', border: 'border-green-200' },
  { id: '3d', name: '3D头像', emoji: '🎭', color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  { id: 'oil', name: '油画头像', emoji: '🖼️', color: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
  { id: 'sketch', name: '素描头像', emoji: '✏️', color: 'bg-slate-100 text-slate-600', border: 'border-slate-200' },
];

export default function AvatarEmojiPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setGeneratedAvatars([]);
    }
  };

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setGeneratedAvatars([]);
    }
  };

  // 生成头像
  const handleGenerate = () => {
    if (!uploadedImage) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#FFDAB9', '#B0E0E6'];
      const emojis = ['🎨', '✨', '👾', '🎭', '🖼️', '✏️'];
      const results = Array.from({ length: 4 }, (_, i) => {
        const color = colors[i % colors.length];
        const emoji = emojis[AVATAR_STYLES.findIndex(s => s.id === selectedStyle) % emojis.length];
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${color}" width="300" height="300" rx="50"/><circle fill="#FFD700" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="80">${emoji}</text></svg>`)}`;
      });
      setGeneratedAvatars(results);
    }, 1500);
  };

  // 重新上传
  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedAvatars([]);
  };

  // 示例头像
  const useExample = (emoji: string) => {
    const url = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><circle fill="#FFE4E1" width="300" height="300" r="150"/><text x="150" y="200" text-anchor="middle" font-size="150">${emoji}</text></svg>`)}`;
    setUploadedImage(url);
    setGeneratedAvatars([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50/30">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">AI头像表情包</span>
          </div>
          
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容 - 单页面操作 */}
      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 上传区域 */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200 mb-6 overflow-hidden
            ${uploadedImage 
              ? 'border-orange-300 bg-orange-50/50' 
              : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/30'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {uploadedImage ? (
            <div className="flex items-center gap-6">
              <img
                src={uploadedImage}
                alt="上传的照片"
                className="w-24 h-24 rounded-xl object-cover shadow-md"
              />
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-slate-800 mb-1">照片已上传</h3>
                <p className="text-sm text-slate-500 mb-3">下方选择风格，点击生成按钮即可</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  重新上传
                </button>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传照片</h3>
              <p className="text-sm text-slate-500 mb-4">
                点击或拖拽照片到此处上传
              </p>
              <p className="text-xs text-slate-400">
                支持 JPG、PNG 格式，建议正面清晰照片
              </p>
            </>
          )}
        </div>

        {/* 示例快捷选项 */}
        {!uploadedImage && (
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 mb-3">没有照片？直接使用示例</p>
            <div className="flex items-center justify-center gap-3">
              {['😀', '😎', '🤗', '🥳', '😍', '😜'].map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => useExample(emoji)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl hover:border-orange-400 hover:scale-110 hover:shadow-md transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 风格选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-orange-500" />
            选择头像风格
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {AVATAR_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all hover:scale-105
                  ${selectedStyle === style.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <div className="text-2xl mb-1">{style.emoji}</div>
                <div className="text-sm font-medium text-slate-800">{style.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || isGenerating}
          className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all duration-200
            flex items-center justify-center gap-2 shadow-lg
            ${!uploadedImage || isGenerating
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 hover:shadow-xl hover:scale-[1.02]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              生成中，请稍候...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              一键生成头像
            </>
          )}
        </button>

        {/* 生成结果 */}
        {generatedAvatars.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">生成结果</h3>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  下载全部
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedAvatars.map((avatar, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={avatar}
                      alt={`生成的头像 ${idx + 1}`}
                      className="w-full aspect-square rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                        <Heart className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 继续操作 */}
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-400 mb-3">
                生成的头像可免费商用，欢迎分享给朋友
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                换一个风格
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}

// Sparkles 图标组件
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L12 7M12 17L12 21M3 12L7 12M17 12L21 12M5.5 5.5L8.5 8.5M15.5 15.5L18.5 18.5M18.5 5.5L15.5 8.5M8.5 15.5L5.5 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  );
}
