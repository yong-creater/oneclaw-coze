'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, ScanFace, RefreshCw, Download, 
  Check, Sparkles
} from 'lucide-react';
import Footer from '@/components/common/Footer';

// 背景风格
const BACKGROUNDS = [
  { id: 'blue', name: '蓝色', color: '#1E40AF' },
  { id: 'white', name: '白色', color: '#FFFFFF', border: 'border-slate-300' },
  { id: 'gray', name: '灰色', color: '#6B7280' },
  { id: 'gold', name: '金色', color: '#D4AF37' },
  { id: 'red', name: '红色', color: '#DC2626' },
  { id: 'green', name: '绿色', color: '#059669' },
];

// 服装风格
const CLOTHES = [
  { id: 'suit', name: '西装', emoji: '🤵' },
  { id: 'shirt', name: '衬衫', emoji: '👔' },
  { id: 'casual', name: '休闲', emoji: '👕' },
  { id: 'sweater', name: '毛衣', emoji: '🧥' },
];

export default function ResumePhotoPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('blue');
  const [selectedClothes, setSelectedClothes] = useState('suit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
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
      setResultImage(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="${bg?.color || '#1E40AF'}" width="400" height="500"/><circle fill="#FFD700" cx="200" cy="180" r="80"/><text x="200" y="180" text-anchor="middle" font-size="60">${clothes?.emoji || '🤵'}</text><text x="200" y="450" text-anchor="middle" font-size="24" fill="white" font-family="system-ui">${bg?.name}背景</text></svg>`)}`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setSelectedBg('blue');
  };

  // 示例头像
  const useExample = () => {
    const url = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><circle fill="#FFE4C4" cx="150" cy="150" r="150"/><circle fill="#333" cx="110" cy="120" r="15"/><circle fill="#333" cx="190" cy="120" r="15"/><path d="M120 180 Q150 210 180 180" stroke="#333" stroke-width="5" fill="none"/></svg>`)}`;
    setUploadedImage(url);
    setResultImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <ScanFace className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">形象照生成</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 上传区域 */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-6
            ${uploadedImage 
              ? 'border-sky-300 bg-sky-50/50' 
              : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/30'
            }
          `}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          
          {uploadedImage ? (
            <div className="flex items-center gap-6">
              <img src={uploadedImage} alt="上传的照片" className="w-24 h-24 rounded-xl object-cover shadow-md" />
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-slate-800 mb-1">照片已上传</h3>
                <p className="text-sm text-slate-500 mb-3">选择背景和服装，点击生成</p>
                <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="text-sm text-sky-500 hover:text-sky-600 font-medium">
                  重新上传
                </button>
              </div>
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传照片</h3>
              <p className="text-sm text-slate-500 mb-4">点击或拖拽照片上传</p>
              <p className="text-xs text-slate-400 mb-4">建议正面照，效果更佳</p>
              <button onClick={(e) => { e.stopPropagation(); useExample(); }} className="text-sm text-sky-500 hover:text-sky-600 font-medium">
                没有照片？使用示例 →
              </button>
            </>
          )}
        </div>

        {/* 背景选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            选择背景颜色
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {BACKGROUNDS.map(bg => (
              <button key={bg.id} onClick={() => setSelectedBg(bg.id)}
                className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedBg === bg.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-200 hover:border-slate-300'} ${bg.border || ''}`}>
                <div className="w-full h-8 rounded-lg mb-2 shadow-inner" style={{ background: bg.color }} />
                <div className="text-sm font-medium text-slate-800">{bg.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 服装选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">选择服装风格</h3>
          <div className="grid grid-cols-4 gap-3">
            {CLOTHES.map(clothes => (
              <button key={clothes.id} onClick={() => setSelectedClothes(clothes.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${selectedClothes === clothes.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="text-2xl mb-1">{clothes.emoji}</div>
                <div className="text-sm font-medium text-slate-800">{clothes.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button onClick={handleGenerate} disabled={!uploadedImage || isGenerating}
          className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
            ${!uploadedImage || isGenerating
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02]'
            }
          `}>
          {isGenerating ? (
            <><RefreshCw className="w-5 h-5 animate-spin" />生成中，请稍候...</>
          ) : (
            <><ScanFace className="w-5 h-5" />一键生成形象照</>
          )}
        </button>

        {/* 生成结果 */}
        {resultImage && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-slate-800 inline-flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  形象照生成成功
                </h3>
              </div>
              <img src={resultImage} alt="生成结果" className="max-w-xs mx-auto rounded-xl shadow-lg" />
              <div className="mt-6 flex items-center justify-center gap-4">
                <button onClick={() => setResultImage(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />换一个
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-blue-600 transition-all flex items-center gap-2 shadow-lg">
                  <Download className="w-5 h-5" />下载形象照
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">
              生成的形象照可免费商用
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
