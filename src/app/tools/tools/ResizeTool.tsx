'use client';

import { useState, useRef } from 'react';
import { Image, Maximize2, Wand2, Check } from 'lucide-react';

export default function ResizeTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [preset, setPreset] = useState('square');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESETS = [
    { id: 'square', name: '正方形', size: '1:1', desc: '小红书、微博', emoji: '📐' },
    { id: 'portrait', name: '竖版', size: '3:4', desc: '抖音封面、朋友圈', emoji: '📱' },
    { id: 'landscape', name: '横版', size: '16:9', desc: 'B站封面、视频号', emoji: '🖥️' },
    { id: 'story', name: '故事版', size: '9:16', desc: '抖音故事、朋友圈', emoji: '📲' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          上传图片 → 选择尺寸 → 下载无损图
        </p>
      </div>

      {/* 上传区域 */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${uploadedImage ? 'border-green-300 bg-green-50/50' : 'border-slate-300 hover:border-green-400'}`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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

      {/* 尺寸选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择尺寸</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <button 
              key={p.id} 
              onClick={() => setPreset(p.id)}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${preset === p.id ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
            >
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.size}</div>
              <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 处理按钮 */}
      <button 
        disabled={!uploadedImage}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage ? 'bg-slate-300' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'}`}
      >
        <Wand2 className="w-5 h-5" />无损改尺寸
      </button>
    </div>
  );
}
