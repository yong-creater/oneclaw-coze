'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingBag, RefreshCw, Download, 
  Check, Upload, Plus, Sparkles, Wand2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const COLORS = [
  { id: 'pink', name: '粉嫩色', bg: 'bg-gradient-to-br from-pink-100 to-rose-200', accent: 'text-rose-500' },
  { id: 'blue', name: '清新蓝', bg: 'bg-gradient-to-br from-sky-100 to-blue-200', accent: 'text-blue-500' },
  { id: 'green', name: '自然绿', bg: 'bg-gradient-to-br from-green-100 to-emerald-200', accent: 'text-emerald-500' },
  { id: 'purple', name: '优雅紫', bg: 'bg-gradient-to-br from-purple-100 to-violet-200', accent: 'text-purple-500' },
  { id: 'orange', name: '活力橙', bg: 'bg-gradient-to-br from-orange-100 to-amber-200', accent: 'text-orange-500' },
];

export default function ProductPagePage() {
  const [selectedColor, setSelectedColor] = useState('pink');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!productName.trim()) return;
    setIsGenerated(true);
  };

  const handleReset = () => {
    setSelectedColor('pink');
    setProductName('');
    setProductDesc('');
    setImages([]);
    setIsGenerated(false);
  };

  const color = COLORS.find(c => c.id === selectedColor);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-pink-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 图片上传 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            上传产品图片
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                  <span className="text-xs">x</span>
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <div onClick={() => fileInputRef.current?.click()} 
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-all">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-3">点击添加更多图片，最多6张</p>
        </div>

        {/* 配色方案 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">选择配色方案</h3>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.map(c => (
              <button key={c.id} onClick={() => setSelectedColor(c.id)}
                className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedColor === c.id ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-full h-8 rounded-lg ${c.bg} mb-2`} />
                <div className="text-xs font-medium text-slate-800">{c.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 产品信息 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">产品信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">产品名称</label>
              <input type="text" value={productName} onChange={e => { setProductName(e.target.value); setIsGenerated(false); }}
                placeholder="例如：新款女士手提包"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">产品描述（可选）</label>
              <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}
                placeholder="描述产品的特点、材质、尺寸等信息"
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors resize-none" />
            </div>
          </div>
        </div>

        {/* 预览 */}
        {productName && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-pink-500" />
              详情页预览
            </h3>
            <div className={`max-w-md mx-auto ${color?.bg} rounded-2xl p-6`}>
              {images.length > 0 && (
                <div className="aspect-square bg-white/50 rounded-xl mb-4 overflow-hidden shadow-inner">
                  <img src={images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className={`text-xl font-bold ${color?.accent} mb-2`}>{productName}</h2>
              <p className="text-slate-600 text-sm">{productDesc || '产品描述将显示在这里'}</p>
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.slice(1, 4).map((img, idx) => (
                    <div key={idx} className="aspect-square bg-white/50 rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />重新制作
          </button>
          <button onClick={handleGenerate} disabled={!productName.trim()}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
              productName.trim()
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}>
            <Check className="w-5 h-5" />一键生成
          </button>
        </div>

        {/* 生成成功 */}
        {isGenerated && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-medium">详情页已生成！</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 flex items-center gap-2 mx-auto shadow-lg">
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
