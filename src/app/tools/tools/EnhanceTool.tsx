'use client';

import { useState, useRef } from 'react';
import { Image, RefreshCw, Wand2, Check } from 'lucide-react';

export default function EnhanceTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [level, setLevel] = useState('2x');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleProcess = () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          上传模糊图 → 选择倍数 → 一键变清晰
        </p>
      </div>

      {/* 上传区域 */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-purple-300 bg-purple-50/50' : 'border-slate-300 hover:border-purple-400'}`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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

      {/* 清晰度选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">清晰度倍数</p>
        <div className="grid grid-cols-3 gap-3">
          {['2x', '4x', '8x'].map(m => (
            <button 
              key={m} 
              onClick={() => setLevel(m)}
              className={`p-4 rounded-xl border-2 font-medium transition-colors ${level === m ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-500'}`}
            >
              {m} 倍
            </button>
          ))}
        </div>
      </div>

      {/* 处理按钮 */}
      <button 
        onClick={handleProcess} 
        disabled={!uploadedImage || isProcessing}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isProcessing ? 'bg-slate-300' : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'}`}
      >
        {isProcessing ? (
          <><RefreshCw className="w-5 h-5 animate-spin" />AI处理中...</>
        ) : (
          <><Wand2 className="w-5 h-5" />一键变清晰</>
        )}
      </button>
    </div>
  );
}
