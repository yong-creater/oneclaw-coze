'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, ScanFace, RefreshCw, Download, 
  Check, ChevronLeft, ChevronRight, Share2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

// 背景风格
const BACKGROUNDS = [
  { id: 'blue', name: '蓝色', color: '#1E40AF', type: 'solid' },
  { id: 'white', name: '白色', color: '#FFFFFF', type: 'solid' },
  { id: 'gray', name: '灰色', color: '#6B7280', type: 'solid' },
  { id: 'gradient-blue', name: '渐变蓝', color: '#3B82F6', type: 'gradient' },
  { id: 'gradient-purple', name: '渐变紫', color: '#8B5CF6', type: 'gradient' },
  { id: 'gradient-gold', name: '渐变金', color: '#F59E0B', type: 'gradient' },
];

// 服装风格
const CLOTHES = [
  { id: 'suit', name: '西装', emoji: '🤵' },
  { id: 'shirt', name: '衬衫', emoji: '👔' },
  { id: 'casual', name: '休闲', emoji: '👕' },
  { id: 'sweater', name: '毛衣', emoji: '🧥' },
];

// Toast
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function ResumePhotoPage() {
  const [step, setStep] = useState<'upload' | 'setting' | 'result'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('blue');
  const [selectedClothes, setSelectedClothes] = useState('suit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setStep('setting');
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      setUploadedImage(URL.createObjectURL(file));
      setStep('setting');
    }
  };

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => {
      const bg = BACKGROUNDS.find(b => b.id === selectedBg);
      setResultImage(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="${bg?.color || '#1E40AF'}" width="400" height="500"/><circle fill="#FFD700" cx="200" cy="180" r="80"/><circle fill="#1E3A5F" cx="200" cy="400" r="30"/><text x="200" y="460" text-anchor="middle" font-size="24" fill="white">OneClaw</text></svg>`)}`);
      setIsGenerating(false);
      setStep('result');
      setToast('形象照生成成功！');
    }, 2500);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSelectedBg('blue');
    setSelectedClothes('suit');
    setResultImage(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['上传照片', '设置风格', '下载结果'].map((label, idx) => {
            const stepKeys = ['upload', 'setting', 'result'];
            const stepKey = stepKeys[idx];
            const isActive = step === stepKey;
            const isCompleted = stepKeys.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 上传 */}
        {step === 'upload' && (
          <div className="max-w-md mx-auto">
            <div onClick={handleUploadClick} onDragOver={handleDragOver} onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传照片</h3>
              <p className="text-sm text-slate-500 mb-4">点击或拖拽照片上传</p>
              <p className="text-xs text-slate-400">建议正面照，效果更佳</p>
            </div>
          </div>
        )}

        {/* 步骤2: 设置 */}
        {step === 'setting' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-6">
                {uploadedImage && <img src={uploadedImage} alt="上传" className="w-32 h-32 rounded-xl object-cover" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">已上传照片</h3>
                  <button onClick={handleReset} className="text-sm text-sky-500 hover:text-sky-600">重新上传</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择背景颜色</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setSelectedBg(bg.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedBg === bg.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="w-full h-8 rounded-lg mb-2" style={{ background: bg.color }} />
                    <div className="text-sm font-medium text-slate-800">{bg.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择服装风格</h3>
              <div className="grid grid-cols-4 gap-3">
                {CLOTHES.map(clothes => (
                  <button key={clothes.id} onClick={() => setSelectedClothes(clothes.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedClothes === clothes.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-2xl mb-1">{clothes.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{clothes.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleGenerate} disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
                {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />生成中...</> : <><ScanFace className="w-5 h-5" />开始生成</>}
              </button>
            </div>
          </div>
        )}

        {/* 步骤3: 结果 */}
        {step === 'result' && resultImage && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
              <img src={resultImage} alt="生成结果" className="max-w-sm mx-auto rounded-xl shadow-lg" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新生成
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-blue-600 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />下载形象照
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
