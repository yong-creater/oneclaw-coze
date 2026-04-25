'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingBag, RefreshCw, Download, 
  Check, ChevronRight, Upload, Image, Type, Layout
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const LAYOUTS = [
  { id: 'grid', name: '网格布局', icon: Layout },
  { id: 'list', name: '列表布局', icon: Type },
  { id: 'showcase', name: '展示型', icon: Image },
];

const COLORS = [
  { id: 'pink', name: '粉嫩色', bg: 'bg-gradient-to-br from-pink-100 to-rose-200', accent: 'text-rose-500' },
  { id: 'blue', name: '清新蓝', bg: 'bg-gradient-to-br from-sky-100 to-blue-200', accent: 'text-blue-500' },
  { id: 'green', name: '自然绿', bg: 'bg-gradient-to-br from-green-100 to-emerald-200', accent: 'text-emerald-500' },
  { id: 'purple', name: '优雅紫', bg: 'bg-gradient-to-br from-purple-100 to-violet-200', accent: 'text-purple-500' },
  { id: 'orange', name: '活力橙', bg: 'bg-gradient-to-br from-orange-100 to-amber-200', accent: 'text-orange-500' },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function ProductPagePage() {
  const [step, setStep] = useState<'upload' | 'design' | 'result'>('upload');
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string].slice(0, 6));
          }
        };
        reader.readAsDataURL(files[i]);
      }
      setStep('design');
      setToast('产品图片已上传');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!productName.trim()) {
      setToast('请输入产品名称');
      return;
    }
    setStep('result');
    setToast('详情页生成成功！');
  };

  const handleReset = () => {
    setSelectedLayout('grid');
    setSelectedColor('pink');
    setProductName('');
    setProductDesc('');
    setImages([]);
    setStep('upload');
  };

  const color = COLORS.find(c => c.id === selectedColor);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">商品详情页</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-center gap-4 mb-8">
          {['上传图片', '设计详情', '生成页面'].map((label, idx) => {
            const steps = ['upload', 'design', 'result'];
            const s = steps[idx];
            const isActive = step === s;
            const isDone = steps.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {step === 'upload' && (
          <div className="max-w-md mx-auto">
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-all">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传产品图片</h3>
              <p className="text-sm text-slate-500 mb-4">上传产品图片，AI自动生成详情页</p>
              <p className="text-xs text-slate-400">支持 JPG、PNG 格式，最多6张</p>
            </div>
          </div>
        )}

        {step === 'design' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">产品图片</h3>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white">
                      <span className="text-xs">x</span>
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-pink-400">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                    <Plus className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择配色方案</h3>
              <div className="grid grid-cols-5 gap-3">
                {COLORS.map(c => (
                  <button key={c.id} onClick={() => setSelectedColor(c.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedColor === c.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-full h-8 rounded-lg ${c.bg} mb-2`} />
                    <div className="text-xs font-medium text-slate-800">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">产品信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">产品名称</label>
                  <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
                    placeholder="例如：新款女士手提包"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">产品描述</label>
                  <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}
                    placeholder="描述产品的特点、材质、尺寸等信息"
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 resize-none" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold">
                生成详情页
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className={`max-w-md mx-auto ${color?.bg} rounded-2xl p-6`}>
                {images.length > 0 && (
                  <div className="aspect-square bg-white/50 rounded-xl mb-4 overflow-hidden">
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h2 className={`text-xl font-bold ${color?.accent} mb-2`}>{productName || '产品名称'}</h2>
                <p className="text-slate-600 text-sm">{productDesc || '产品描述将显示在这里'}</p>
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {images.slice(1).map((img, idx) => (
                      <div key={idx} className="aspect-square bg-white/50 rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新制作
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />下载详情页
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
