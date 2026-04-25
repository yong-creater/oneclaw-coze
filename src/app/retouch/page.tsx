'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Sparkles, Wand2, Eraser, Maximize2, 
  Scissors, Type, Image as ImageIcon, Palette, 
  Upload, Download, RotateCcw, Check, Loader2,
  Crown, Zap, Eye, EyeOff, Grid3X3, ChevronRight
} from 'lucide-react';
import Footer from '@/components/common/Footer';

// 修图功能列表
const RETOUCH_FUNCTIONS = [
  { id: 'enhance', name: 'AI一键精修', icon: Wand2, color: 'from-violet-400 to-purple-500', desc: '智能美化，保留真实质感', free: true },
  { id: 'remove', name: '智能消除', icon: Eraser, color: 'from-rose-400 to-pink-500', desc: '无痕去除杂物、路人、水印', free: true },
  { id: 'upscale', name: '超清修复', icon: Maximize2, color: 'from-blue-400 to-cyan-500', desc: '模糊图片变高清，无损放大', free: true },
  { id: 'oldphoto', name: '老照片翻新', icon: ImageIcon, color: 'from-amber-400 to-orange-500', desc: '修复破损，黑白照上色', free: false },
  { id: 'cutout', name: '智能抠图', icon: Scissors, color: 'from-emerald-400 to-teal-500', desc: '发丝级精准抠图', free: true },
  { id: 'edittext', name: '无痕改字', icon: Type, color: 'from-slate-400 to-gray-500', desc: '修改图片文字，无修改痕迹', free: false },
  { id: 'expand', name: 'AI扩图', icon: Grid3X3, color: 'from-indigo-400 to-blue-500', desc: '智能延展，适配各类尺寸', free: true },
  { id: 'outfit', name: 'AI换装', icon: Crown, color: 'from-pink-400 to-rose-500', desc: '虚拟试穿，多种穿搭风格', free: false },
  { id: 'beauty', name: '人像美化', icon: Sparkles, color: 'from-peach-400 to-orange-400', desc: '磨皮美白，精致五官', free: true },
  { id: 'filter', name: 'AI滤镜', icon: Palette, color: 'from-purple-400 to-fuchsia-500', desc: '海量风格模板一键套用', free: true },
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

// 功能卡片组件
function FunctionCard({ func, onClick }: { func: typeof RETOUCH_FUNCTIONS[0]; onClick: () => void }) {
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
        {func.free ? (
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full">
            免费
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full flex items-center gap-0.5">
            <Crown className="w-3 h-3" /> VIP
          </span>
        )}
      </div>
    </button>
  );
}

// AI一键精修功能
function EnhanceFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState('natural');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: 'natural', name: '自然模式', desc: '保留真实质感' },
    { id: '网红', name: '网红模式', desc: '精致美颜效果' },
    { id: 'film', name: '胶片模式', desc: '复古胶片风格' },
    { id: 'clear', name: '清透模式', desc: '清新通透风格' },
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
    if (!image) { setToast('请先上传图片'); return; }
    setProcessing(true);
    setToast('AI精修中...');
    await new Promise(r => setTimeout(r, 2000));
    setResult(image); // 模拟结果
    setProcessing(false);
    setToast('精修完成！');
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setShowCompare(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">AI一键精修</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：上传和参数 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 上传区域 */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传图片</h3>
              <p className="text-sm text-slate-500">支持 JPG、PNG、WebP，单张≤20MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              {showCompare && result ? (
                <div className="relative">
                  <img src={image} alt="原图" className="w-full" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <img src={result} alt="结果" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                    滑动查看对比
                  </div>
                </div>
              ) : (
                <img src={result || image} alt="预览" className="w-full" />
              )}
              <button onClick={() => fileInputRef.current?.click()} className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                <Upload className="w-4 h-4 text-slate-600" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          )}

          {/* 精修模式选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">精修模式</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    mode === m.id 
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleReset} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <RotateCcw className="w-5 h-5" />
              重新上传
            </button>
            {result ? (
              <button 
                onClick={() => setShowCompare(!showCompare)}
                className="px-6 py-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center gap-2 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                {showCompare ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                {showCompare ? '查看结果' : '对比原图'}
              </button>
            ) : (
              <button 
                onClick={handleProcess} 
                disabled={!image || processing}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {processing ? '精修中...' : '一键精修'}
              </button>
            )}
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-violet-600 hover:to-purple-600 transition-colors">
                <Download className="w-5 h-5" />
                下载图片
              </button>
            )}
          </div>
        </div>

        {/* 右侧：功能说明和历史 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>AI自动识别图片类型，一键完成智能美化：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>智能磨皮、美白、光影优化</li>
                <li>色彩增强、瑕疵去除</li>
                <li>画质提升，保留真实质感</li>
                <li>无过度美颜的假脸感</li>
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">免费用户</span>
                <span className="text-emerald-500">每日3次</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">VIP用户</span>
                <span className="text-amber-500">无限次</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">今日剩余次数</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: '66%' }} />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-white">2/3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 智能消除功能
function RemoveFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [maskPoints, setMaskPoints] = useState<{x: number; y: number}[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setResult(null);
        setMaskPoints([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    isDrawing.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMaskPoints(prev => [...prev, { x, y }]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !image) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMaskPoints(prev => [...prev, { x, y }]);
    }
  };

  const handleCanvasMouseUp = () => {
    isDrawing.current = false;
  };

  const handleProcess = async () => {
    if (!image || maskPoints.length === 0) { setToast('请先涂抹要消除的区域'); return; }
    setProcessing(true);
    setToast('AI消除中...');
    await new Promise(r => setTimeout(r, 2500));
    setResult(image);
    setProcessing(false);
    setToast('消除完成！');
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setMaskPoints([]);
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
            <Eraser className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">智能消除</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* 上传/画布区域 */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传图片</h3>
              <p className="text-sm text-slate-500">涂抹要消除的区域</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              {image && (
                <img src={result || image} alt="背景" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              )}
              {maskPoints.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M ${maskPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                    fill="rgba(255,0,0,0.3)"
                    stroke="rgba(255,0,0,0.8)"
                    strokeWidth={brushSize}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          )}

          {/* 画笔设置 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">画笔大小</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-800 dark:text-white w-12">{brushSize}px</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setMaskPoints([])}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                清除涂抹
              </button>
              <span className="text-xs text-slate-400">已涂抹 {maskPoints.length} 个点</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleReset} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              重新上传
            </button>
            <button 
              onClick={handleProcess} 
              disabled={!image || maskPoints.length === 0 || processing}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eraser className="w-5 h-5" />}
              {processing ? '消除中...' : '立即消除'}
            </button>
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2">
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
              <p>涂抹图片中需要消除的区域，AI自动识别并智能填充背景内容。</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>去除路人、杂物、水印</li>
                <li>去除电线、瑕疵、痘痘</li>
                <li>去除多余文字</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">今日剩余次数</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: '50%' }} />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-white">1/2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 智能抠图功能
function CutoutFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('transparent');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgOptions = [
    { id: 'transparent', color: '透明背景' },
    { id: 'white', color: '纯白', bg: 'bg-white' },
    { id: 'gradient', color: '渐变', bg: 'bg-gradient-to-br from-pink-400 to-purple-500' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setResult(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image) { setToast('请先上传图片'); return; }
    setProcessing(true);
    setToast('AI抠图中...');
    await new Promise(r => setTimeout(r, 1500));
    setResult(image);
    setProcessing(false);
    setToast('抠图完成！');
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
          <span className="font-semibold text-slate-800 dark:text-white">智能抠图</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-all relative overflow-hidden"
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {image ? (
              <div className="w-full h-full" style={{ 
                background: bgColor === 'white' ? '#ffffff' : bgColor === 'gradient' ? 'linear-gradient(135deg, #f472b6, #a855f7)' : 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 20px 20px'
              }}>
                <img src={result || image} alt="预览" className="w-full h-full object-contain" />
              </div>
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传图片</h3>
                <p className="text-sm text-slate-500">AI自动识别主体，一键完成抠图</p>
              </>
            )}
          </div>

          {/* 背景选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">更换背景</h3>
            <div className="flex gap-3">
              {bgOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setBgColor(opt.id)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    bgColor === opt.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.id === 'transparent' ? (
                    <div className="w-6 h-6 rounded border-2 border-slate-300 bg-white" />
                  ) : (
                    <div className={`w-6 h-6 rounded ${opt.bg}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {!result ? (
              <button 
                onClick={handleProcess} 
                disabled={!image || processing}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                {processing ? '抠图中...' : '开始抠图'}
              </button>
            ) : (
              <>
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  下载PNG
                </button>
                <button onClick={() => { setImage(null); setResult(null); }} className="px-6 py-3 border border-slate-200 rounded-xl">
                  重新上传
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>自动识别图片主体，发丝级精准抠图，透明背景导出。</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>人像、商品、动物、植物</li>
                <li>支持发丝级边缘处理</li>
                <li>一键更换背景</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 超清修复功能
function UpscaleFunction({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState('2x');
  const [mode, setMode] = useState('general');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: 'general', name: '通用修复' },
    { id: 'face', name: '人脸增强' },
    { id: 'text', name: '文字增强' },
    { id: 'old', name: '老照片' },
  ];

  const scales = ['2x', '4x', '8x'];

  const handleProcess = async () => {
    if (!image) { setToast('请先上传图片'); return; }
    setProcessing(true);
    setToast(`${scale}放大处理中...`);
    await new Promise(r => setTimeout(r, 3000));
    setResult(image);
    setProcessing(false);
    setToast('修复完成！');
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">超清修复</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
          >
            {image ? (
              <img src={result || image} alt="预览" className="w-full h-full object-contain" />
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImage(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传模糊图片</h3>
                <p className="text-sm text-slate-500">支持老照片、截图、压缩图修复</p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">修复模式</h3>
                <div className="grid grid-cols-2 gap-2">
                  {modes.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`p-3 rounded-xl border-2 text-sm ${
                        mode === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">放大倍数</h3>
                <div className="flex gap-2">
                  {scales.map(s => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium ${
                        scale === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">VIP可享4x/8x放大</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleProcess} 
              disabled={!image || processing}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Maximize2 className="w-5 h-5" />}
              {processing ? '处理中...' : '开始修复'}
            </button>
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                下载高清图
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">功能说明</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>超分辨率技术，将模糊图片修复为高清。</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>还原真实细节</li>
                <li>去除噪点、马赛克</li>
                <li>支持2x/4x/8x放大</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">今日剩余次数</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '50%' }} />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-white">1/2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RetouchPage() {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);

  const renderFunction = () => {
    switch (activeFunction) {
      case 'enhance':
        return <EnhanceFunction onBack={() => setActiveFunction(null)} />;
      case 'remove':
        return <RemoveFunction onBack={() => setActiveFunction(null)} />;
      case 'cutout':
        return <CutoutFunction onBack={() => setActiveFunction(null)} />;
      case 'upscale':
        return <UpscaleFunction onBack={() => setActiveFunction(null)} />;
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">AI智能修图</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">今日剩余次数：</span>
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-sm font-medium">15次</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {activeFunction ? (
          renderFunction()
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">AI智能修图中心</h1>
              <p className="text-slate-500">一站式图片编辑、精修、优化解决方案，全面对标美图秀秀核心能力</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {RETOUCH_FUNCTIONS.map(func => (
                <FunctionCard 
                  key={func.id} 
                  func={func} 
                  onClick={() => {
                    if (['enhance', 'remove', 'cutout', 'upscale'].includes(func.id)) {
                      setActiveFunction(func.id);
                    } else {
                      // 暂时显示提示
                    }
                  }}
                />
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">开通VIP会员</h3>
                  <p className="text-sm opacity-80">解锁全部修图功能，无限次使用，无水印导出</p>
                </div>
                <button className="px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  立即开通
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
