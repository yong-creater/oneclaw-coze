'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Download, RefreshCw, X, Check, ArrowRight, Zap } from 'lucide-react';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: number;
  url: string;
  label: string;
}

// 示例使用耳机商品图（电商风格）
const EXAMPLE_IMAGES: GeneratedImage[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', label: '主图（提升点击率）' },
  { id: 2, url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop', label: '卖点图（突出优势）' },
  { id: 3, url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop', label: '卖点图（降噪续航）' },
  { id: 4, url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop', label: '使用场景（提升转化）' },
  { id: 5, url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop', label: '主图（高级背景）' },
  { id: 6, url: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop', label: '使用场景（生活方式）' },
  { id: 7, url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600&h=600&fit=crop', label: '主图（白底图）' },
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
    // 随机打乱图片顺序，模拟重新生成
    const shuffled = [...EXAMPLE_IMAGES].sort(() => Math.random() - 0.5);
    setGeneratedImages(shuffled);
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
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            上传商品图，AI一键生成能卖货的商品图片
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            简单几步，告别繁琐设计，让你的商品图更具吸引力
          </p>
        </div>

        {/* 示例展示行 */}
        <div className="bg-gradient-to-r from-slate-50 to-orange-50 dark:from-slate-800 dark:to-orange-900/20 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
            示例：普通商品图 → AI优化后可直接用于电商主图
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <span className="text-slate-400 text-xs">原图<br/>(白底)</span>
              </div>
              <p className="text-xs text-slate-500">上传图片</p>
            </div>
            <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden mb-2 shadow-md">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" alt="主图" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-orange-600 font-medium">主图（提升点击率）</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden mb-2 shadow-md">
                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop" alt="卖点图" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-orange-600 font-medium">卖点图（突出优势）</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden mb-2 shadow-md">
                <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop" alt="场景图" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-orange-600 font-medium">使用场景（提升转化）</p>
            </div>
          </div>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      免费体验3次
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>无需写Prompt</span>
                    <span className="text-slate-300">|</span>
                    <span>适用于淘宝/小红书</span>
                  </div>
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
                        免费生成商品图
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：示例 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-orange-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 text-center">生成效果示例</h2>
              
              <div className="space-y-6">
                {/* 原图 vs 生成图对比 */}
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2 flex items-center justify-center border-2 border-dashed border-slate-300">
                      <span className="text-slate-400 text-xs">原图<br/>(白底)</span>
                    </div>
                    <p className="text-xs text-slate-500">上传图片</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden mb-2 shadow-md ring-2 ring-orange-300">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop" alt="生成图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-orange-600 font-medium">主图</p>
                  </div>
                </div>
                
                {/* 生成的多种图 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden mb-1 shadow-sm">
                      <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop" alt="卖点图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">卖点图</p>
                  </div>
                  <div className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden mb-1 shadow-sm">
                      <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop" alt="场景图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">使用场景</p>
                  </div>
                  <div className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden mb-1 shadow-sm">
                      <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=100&h=100&fit=crop" alt="卖点图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">卖点图</p>
                  </div>
                </div>

                {/* 提示文字 */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-orange-100 dark:border-orange-900">
                  <p>点击上方按钮，立即体验</p>
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
