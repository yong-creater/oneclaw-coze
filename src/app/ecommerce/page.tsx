'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingBag, Crown, Upload, Download, 
  Loader2, Check, Wand2, Scissors, Image as ImageIcon,
  Grid3X3, Layers, Palette, Zap, RefreshCw
} from 'lucide-react';
import Footer from '@/components/common/Footer';

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

// 电商功能列表
const ECOMMERCE_FUNCTIONS = [
  { id: 'product-enhance', name: '商品图精修', icon: Wand2, color: 'from-blue-400 to-indigo-500', desc: '一键优化商品质感、去除瑕疵', vip: false },
  { id: 'white-bg', name: '白底图生成', icon: Scissors, color: 'from-emerald-400 to-teal-500', desc: '一键生成平台标准白底图', vip: false },
  { id: 'scene', name: '场景图生成', icon: Layers, color: 'from-purple-400 to-pink-500', desc: '商品场景化实拍效果', vip: true },
  { id: 'color-change', name: '多SKU改色', icon: Palette, color: 'from-orange-400 to-amber-500', desc: '同一款式不同颜色生成', vip: true },
  { id: 'batch', name: '批量处理', icon: Grid3X3, color: 'from-cyan-400 to-blue-500', desc: '批量精修、抠图、尺寸调整', vip: true },
  { id: 'template', name: '主图模板', icon: ImageIcon, color: 'from-rose-400 to-pink-500', desc: '电商平台主图一键生成', vip: false },
];

function FunctionCard({ func, onClick }: { func: typeof ECOMMERCE_FUNCTIONS[0]; onClick: () => void }) {
  const Icon = func.icon;
  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${func.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{func.name}</h3>
          <p className="text-xs text-slate-500">{func.desc}</p>
        </div>
        {func.vip ? (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full flex items-center gap-0.5">
            <Crown className="w-3 h-3" /> VIP
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full">
            免费
          </span>
        )}
      </div>
    </button>
  );
}

// 商品精修功能
function ProductEnhanceFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mode, setMode] = useState('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: 'auto', name: '自动优化' },
    { id: 'detail', name: '细节增强' },
    { id: 'bright', name: '提亮美白' },
    { id: 'clean', name: '净化背景' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!image) { setToast('请先上传商品图片'); return; }
    setProcessing(true);
    setToast('AI精修中...');
    await new Promise(r => setTimeout(r, 2000));
    setResult(image);
    setProcessing(false);
    setToast('精修完成！');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">商品图AI精修</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* 上传区域 */}
          <div
            onClick={() => !image && fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all relative"
          >
            {image ? (
              <img src={result || image} alt="预览" className="w-full h-full object-contain" />
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传商品图</h3>
                <p className="text-sm text-slate-500">自动优化商品质感、去除瑕疵</p>
              </>
            )}
          </div>

          {/* 精修模式 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">精修模式</h3>
            <div className="grid grid-cols-4 gap-3">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl border-2 text-center ${
                    mode === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{m.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-4">
            {image && (
              <button onClick={() => { setImage(null); setResult(null); }} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                重新上传
              </button>
            )}
            <button 
              onClick={handleProcess} 
              disabled={!image || processing}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {processing ? '精修中...' : '开始精修'}
            </button>
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                下载图片
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>AI自动优化商品质感：</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>去除瑕疵、污点</li>
                <li>提亮画面、矫正光影</li>
                <li>净化背景</li>
                <li>商品边缘优化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 白底图生成
function WhiteBgFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!image) { setToast('请先上传商品图片'); return; }
    setProcessing(true);
    setToast('生成白底图中...');
    await new Promise(r => setTimeout(r, 1500));
    setResult(image);
    setProcessing(false);
    setToast('生成完成！');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">白底图一键生成</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div
            onClick={() => !image && fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-all"
          >
            {image ? (
              <div className="w-full h-full bg-white p-8 flex items-center justify-center">
                <img src={result || image} alt="预览" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传商品图</h3>
                <p className="text-sm text-slate-500">自动生成平台标准白底图</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleProcess} 
              disabled={!image || processing}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {processing ? '生成中...' : '生成白底图'}
            </button>
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                下载PNG
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>自动抠出商品主体，一键生成纯白底商品图。</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>符合淘宝、拼多多规范</li>
                <li>支持亚马逊、京东等平台</li>
                <li>无黑边、无锯齿</li>
                <li>自动优化边缘光影</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              <strong>提示：</strong>上传的商品图背景越简单，抠图效果越好。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 批量处理功能
function BatchProcessFunction({ onBack }: { onBack: () => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [operation, setOperation] = useState('enhance');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const operations = [
    { id: 'enhance', name: '批量精修' },
    { id: 'cutout', name: '批量抠图' },
    { id: 'resize', name: '批量改尺寸' },
    { id: 'watermark', name: '批量加水印' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      Array.from(files).slice(0, 20).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newImages.push(ev.target.result as string);
            if (newImages.length === Math.min(files.length, 20)) {
              setImages(prev => [...prev, ...newImages].slice(0, 20));
            }
          }
        };
        reader.readAsDataURL(file);
      });
      setToast(`已选择 ${Math.min(files.length, 20)} 张图片`);
    }
  };

  const handleProcess = async () => {
    if (images.length === 0) { setToast('请先选择图片'); return; }
    setProcessing(true);
    setToast(`正在处理 ${images.length} 张图片...`);
    await new Promise(r => setTimeout(r, 3000));
    setProcessing(false);
    setToast('批量处理完成！');
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">批量图片处理</span>
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-medium rounded-full flex items-center gap-0.5">
            <Crown className="w-3 h-3" /> VIP专属
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* 图片选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">已选图片 ({images.length}/20)</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-lg text-sm hover:bg-cyan-200"
              >
                添加更多
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </div>
            
            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-cyan-400"
              >
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <Upload className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">点击选择图片（最多20张）</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img src={img} alt={`图片 ${idx + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 操作选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">批量操作</h3>
            <div className="grid grid-cols-4 gap-3">
              {operations.map(op => (
                <button
                  key={op.id}
                  onClick={() => setOperation(op.id)}
                  className={`p-3 rounded-xl border-2 text-center ${
                    operation === op.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{op.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button 
              onClick={handleProcess} 
              disabled={images.length === 0 || processing}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {processing ? '处理中...' : `开始处理 ${images.length > 0 ? `(${images.length}张)` : ''}`}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>批量处理大幅提升商家效率：</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>批量精修 - 统一优化商品质感</li>
                <li>批量抠图 - 一次生成多张白底图</li>
                <li>批量改尺寸 - 适配不同平台</li>
                <li>批量加水印 - 保护图片版权</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EcommercePage() {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);

  const renderFunction = () => {
    switch (activeFunction) {
      case 'product-enhance':
        return <ProductEnhanceFunction onBack={() => setActiveFunction(null)} />;
      case 'white-bg':
        return <WhiteBgFunction onBack={() => setActiveFunction(null)} />;
      case 'batch':
        return <BatchProcessFunction onBack={() => setActiveFunction(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">电商专区</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {activeFunction ? (
          renderFunction()
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">电商图片处理中心</h1>
              <p className="text-slate-500">专为电商商家打造的商品图全流程处理解决方案</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ECOMMERCE_FUNCTIONS.map(func => (
                <FunctionCard 
                  key={func.id} 
                  func={func} 
                  onClick={() => {
                    if (['product-enhance', 'white-bg', 'batch'].includes(func.id)) {
                      setActiveFunction(func.id);
                    }
                  }}
                />
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">企业版专属权益</h3>
                  <p className="text-sm opacity-80">无限批量处理、专属精修模型、1TB云存储</p>
                </div>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  了解企业版
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
