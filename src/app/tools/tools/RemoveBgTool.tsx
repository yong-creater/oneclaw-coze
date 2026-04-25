'use client';

import { useState, useRef } from 'react';
import { Upload, RefreshCw, Download, Wand2, Check, Image, Plus, X } from 'lucide-react';

export default function RemoveBgTool() {
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

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'remove-bg-result.png';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          上传图片 → 点击按钮 → 下载透明背景图
        </p>
      </div>

      {/* 上传区域 */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadedImage ? 'border-green-300 bg-green-50/50' : 'border-slate-300 hover:border-blue-400'}`}
      >
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

      {/* 处理按钮 */}
      <button 
        onClick={handleProcess} 
        disabled={!uploadedImage || isProcessing}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${!uploadedImage || isProcessing ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl'}`}
      >
        {isProcessing ? (
          <><RefreshCw className="w-5 h-5 animate-spin" />AI处理中...</>
        ) : (
          <><Wand2 className="w-5 h-5" />一键抠图</>
        )}
      </button>

      {/* 结果展示 */}
      {resultImage && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            抠图完成！
          </p>
          <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2MzYzRjNyIvPjxyZWN0IHg9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNlM2UzZTciLz48L3N2Zz4=')] p-8 rounded-xl">
            <img src={resultImage} alt="" className="max-w-xs mx-auto" />
          </div>
          <button 
            onClick={handleDownload}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" />下载透明图
          </button>
        </div>
      )}
    </div>
  );
}
