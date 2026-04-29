'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Download, RefreshCw, X, Check } from 'lucide-react';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: number;
  url: string;
  label: string;
}

const EXAMPLE_IMAGES: GeneratedImage[] = [
  { id: 1, url: 'https://picsum.photos/seed/prod1/600/600', label: '主图风格' },
  { id: 2, url: 'https://picsum.photos/seed/prod2/600/600', label: '场景图' },
  { id: 3, url: 'https://picsum.photos/seed/prod3/600/600', label: '卖点图' },
  { id: 4, url: 'https://picsum.photos/seed/prod4/600/600', label: '细节图' },
  { id: 5, url: 'https://picsum.photos/seed/prod5/600/600', label: '对比图' },
  { id: 6, url: 'https://picsum.photos/seed/prod6/600/600', label: '氛围图' },
  { id: 7, url: 'https://picsum.photos/seed/prod7/600/600', label: '模特图' },
];

export default function ProductGeneratorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productBenefit, setProductBenefit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!uploadedImage && !productName) {
      alert('请上传商品图或输入商品名称');
      return;
    }
    
    setIsGenerating(true);
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedImages(EXAMPLE_IMAGES);
    setShowResults(true);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setProductName('');
    setProductBenefit('');
    setShowResults(false);
    setGeneratedImages([]);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedImages(EXAMPLE_IMAGES.map(img => ({
      ...img,
      url: `https://picsum.photos/seed/prod${img.id}_${Date.now()}/600/600`,
    })));
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4 text-white" />}
        toolName="AI商品图生成器"
        toolDescription="一键生成能卖货的商品图片"
        gradient="from-orange-500 to-amber-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            上传商品图，AI一键生成能卖货的商品图片
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            简单几步，告别繁琐设计，让你的商品图更具吸引力
          </p>
        </div>

        {!showResults ? (
          /* 输入表单 */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：输入 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">配置信息</h2>
              
              <div className="space-y-6">
                {/* 上传图片 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    上传商品图
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                  >
                    {uploadedImage ? (
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="上传预览" 
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedImage(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">
                          点击上传或拖拽商品图片
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          支持 JPG、PNG，建议尺寸 800x800
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* 商品名称 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    商品名称
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="例如：2024新款女士手提包"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                {/* 商品卖点 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    商品卖点
                  </label>
                  <textarea
                    value={productBenefit}
                    onChange={(e) => setProductBenefit(e.target.value)}
                    placeholder="例如：头层牛皮、手工缝制、容量大"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      开始生成
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 右侧：示例 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">生成效果预览</h2>
              
              <div className="space-y-4">
                <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-orange-400 opacity-50" />
                  <p>配置左侧信息</p>
                  <p className="text-sm mt-1">点击"开始生成"查看效果</p>
                </div>
                
                {/* 示例展示 */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i}
                      className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-slate-400 text-xs">示例图 {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 生成结果 */
          <div>
            {/* 操作栏 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  已生成 {generatedImages.length} 张商品图
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  点击下载保存，或重新生成更多图片
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-5 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  重新生成
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors shadow-md"
                >
                  生成新图片
                </button>
              </div>
            </div>

            {/* 图片网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {generatedImages.map((img) => (
                <div 
                  key={img.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img 
                    src={img.url} 
                    alt={img.label}
                    className="w-full aspect-square object-cover"
                  />
                  
                  {/* 标签 */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                    {img.label}
                  </div>
                  
                  {/* 悬停操作 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => window.open(img.url, '_blank')}
                      className="px-4 py-2 bg-white text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 提示 */}
            <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-700 dark:text-orange-400">生成提示</p>
                  <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                    当前为 Demo 演示，生成的图片为占位图。接入 AI 模型后可生成真实商品图。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
