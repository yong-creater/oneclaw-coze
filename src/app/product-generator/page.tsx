'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Download, RefreshCw, X, Check, ArrowRight, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UtilityHeader from '@/components/common/UtilityHeader';

interface GeneratedImage {
  id: number;
  url: string;
  label: string;
  type: 'mainImage' | 'benefitImage' | 'sceneImage';
}

// AI生成的电商级耳机商品图（商业摄影标准）
const EXAMPLE_IMAGES: GeneratedImage[] = [
  { id: 1, url: '/product-demo/main.jpg', label: '主图（白底）', type: 'mainImage' },
  { id: 2, url: '/product-demo/benefit.jpg', label: '高级感主图', type: 'benefitImage' },
  { id: 3, url: '/product-demo/scene.jpg', label: '场景图', type: 'sceneImage' },
];

// 加载状态文案
const LOADING_STEPS = [
  '正在分析商品特征...',
  '正在优化商品卖点...',
  '正在生成电商主图...',
  '正在生成卖点图...',
  '正在生成场景图...',
];

// 电商级商品图生成 Prompt（商业摄影标准）
// 统一使用无线耳机作为示例产品
const GENERATION_PROMPTS = {
  // 1️⃣ 主图 Prompt - 白底商业摄影
  // commercial studio photography, white background, e-commerce standard
  mainImage: (product: string) => `professional studio product photography of ${product}, centered composition, pure white background, soft diffused lighting, realistic shadow underneath, ultra realistic, commercial e-commerce style, ultra high detail, sharp focus, 8k, no text, no watermark, no blur, no distortion`,
  
  // 2️⃣ 卖点图 Prompt - 高级感Apple风格
  // premium product shot, minimal luxury background, apple aesthetic
  premiumImage: (product: string) => `premium ${product} product shot, minimal luxury background, soft beige or light gray gradient background, cinematic soft lighting, subtle shadow, elegant composition, high-end commercial photography style, apple style aesthetic, ultra realistic, ultra high detail, sharp focus, 8k, no text, no watermark, no blur, no distortion`,
  
  // 3️⃣ 场景图 Prompt - 生活方式场景
  // lifestyle scene, modern desk, commercial advertising style
  sceneImage: (product: string) => `${product} placed on modern desk setup, warm natural lighting, laptop, coffee cup, cozy lifestyle scene, shallow depth of field, cinematic composition, soft shadows, commercial advertising photography, high-end brand feeling, ultra realistic, ultra high detail, sharp focus, 8k, no text, no watermark, no blur, no distortion`,
};

// 负面 Prompt（所有图片通用限制词）
const NEGATIVE_PROMPT = `text, watermark, logo, blur, distortion, low quality, pixelated, ugly, deformed, amateur, cheap, stock photo, busy background, AI generated, synthetic`;

export default function ProductGeneratorPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productBenefit, setProductBenefit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  
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

  const handleAnalyzeBenefit = async () => {
    if (!uploadedImage && !productName) {
      alert('请上传商品图或输入商品名称');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/product-generator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName || undefined,
          productImage: uploadedImage ? true : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '分析失败');
      }

      if (data.benefits) {
        setProductBenefit(data.benefits);
      }
    } catch (error) {
      console.error('卖点分析失败:', error);
      alert(error instanceof Error ? error.message : '卖点分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage && !productName) {
      alert('请上传商品图或输入商品名称');
      return;
    }
    
    setIsGenerating(true);
    
    // 模拟加载状态切换（实际进度由 AI 生成）
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % LOADING_STEPS.length;
      setGeneratingStep(LOADING_STEPS[stepIndex]);
    }, 1500);

    try {
      const response = await fetch('/api/product-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          productName: productName || undefined,
          productBenefit: productBenefit || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成失败');
      }

      // 转换 API 返回结果为图片列表
      const images: GeneratedImage[] = [];
      let id = 1;

      if (data.images.mainImage) {
        images.push({
          id: id++,
          url: data.images.mainImage,
          label: '电商主图',
          type: 'mainImage'
        });
      }
      if (data.images.benefitImage) {
        images.push({
          id: id++,
          url: data.images.benefitImage,
          label: '卖点图',
          type: 'benefitImage'
        });
      }
      if (data.images.sceneImage) {
        images.push({
          id: id++,
          url: data.images.sceneImage,
          label: '场景图',
          type: 'sceneImage'
        });
      }

      if (images.length === 0) {
        throw new Error('未能生成任何图片');
      }

      setGeneratedImages(images);
      setShowResults(true);
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      clearInterval(stepInterval);
      setGeneratingStep('');
      setIsGenerating(false);
    }
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

    // 模拟加载状态切换
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % LOADING_STEPS.length;
      setGeneratingStep(LOADING_STEPS[stepIndex]);
    }, 1500);

    try {
      const response = await fetch('/api/product-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          productName: productName || undefined,
          productBenefit: productBenefit || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成失败');
      }

      // 转换 API 返回结果为图片列表
      const images: GeneratedImage[] = [];
      let id = 1;

      if (data.images.mainImage) {
        images.push({
          id: id++,
          url: data.images.mainImage,
          label: '电商主图',
          type: 'mainImage'
        });
      }
      if (data.images.benefitImage) {
        images.push({
          id: id++,
          url: data.images.benefitImage,
          label: '卖点图',
          type: 'benefitImage'
        });
      }
      if (data.images.sceneImage) {
        images.push({
          id: id++,
          url: data.images.sceneImage,
          label: '场景图',
          type: 'sceneImage'
        });
      }

      if (images.length === 0) {
        throw new Error('未能生成任何图片');
      }

      // 随机打乱顺序
      const shuffled = images.sort(() => Math.random() - 0.5);
      setGeneratedImages(shuffled);
    } catch (error) {
      console.error('重新生成失败:', error);
      alert(error instanceof Error ? error.message : '重新生成失败，请稍后重试');
    } finally {
      clearInterval(stepInterval);
      setGeneratingStep('');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4 text-white" />}
        toolName="AI商品图生成器"
        toolDescription="一键生成能卖货的商品图片"
        gradient="from-orange-500 to-amber-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
            上传商品图，AI一键生成能卖货的商品图片
          </h1>
        </div>

        {/* 示例说明行 */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
          <span>普通商品图</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
          <span className="text-orange-600 font-medium">主图</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
          <span className="text-orange-600 font-medium">卖点图</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
          <span className="text-orange-600 font-medium">场景图</span>
        </div>

        {/* 左右布局主体区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入表单 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
            {/* 上传区域 - 最突出 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-gradient-to-br from-slate-50 to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 mb-4"
            >
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img 
                    src={uploadedImage} 
                    alt="上传预览" 
                    className="max-h-32 mx-auto rounded-lg object-contain"
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
                  <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    上传你的商品图（支持一键生成电商主图）
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    支持 JPG / PNG，建议 800x800
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

            {/* 商品名称 */}
            <div className="mb-3">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="商品名称（可选，用于优化图片文案）"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* 商品卖点 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <textarea
                  value={productBenefit}
                  onChange={(e) => setProductBenefit(e.target.value)}
                  placeholder="商品卖点（强烈建议填写，用于优化图片文案）"
                  rows={3}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 resize-none text-sm"
                />
                <button
                  onClick={handleAnalyzeBenefit}
                  disabled={isAnalyzing || (!uploadedImage && !productName)}
                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {isAnalyzing ? '分析中...' : '帮我生成'}
                </button>
              </div>
            </div>

            {/* 生成按钮区域 */}
            <div className="space-y-3">
              {/* 卖点标签 */}
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-orange-500" />
                  免费体验
                </span>
                <span className="text-slate-300">|</span>
                <span>无需Prompt</span>
                <span className="text-slate-300">|</span>
                <span>淘宝/小红书</span>
              </div>
              
              {/* 紧迫感提示 */}
              <div className="text-center">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  🔥 今日免费名额仅剩 2 次
                </span>
              </div>
              
              {/* 主按钮 */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-[14px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {generatingStep || '正在生成...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    ✨ 3秒生成商品图（免费体验）
                  </>
                )}
              </button>
              
              {/* 收费预期提示 */}
              <div className="text-center">
                <span className="text-[13px] text-slate-400">
                  高清无水印下载需解锁
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：示例/结果 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            {!showResults ? (
              /* 主视觉展示区 */
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    生成效果（电商级）
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    3秒生成可直接卖货的商品图
                  </p>
                </div>

                {/* 主视觉大图 - 高级感主图 */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg mb-3">
                  <div className="aspect-[4/3]">
                    <img
                      src={EXAMPLE_IMAGES[1].url}
                      alt={EXAMPLE_IMAGES[1].label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg leading-none shadow-sm">
                    🔥 推荐
                  </span>
                  <span className="absolute top-2.5 left-2.5 text-[10px] text-white/70 font-medium bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded leading-none">
                    AI生成效果
                  </span>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent pt-10 pb-2.5 px-3">
                    <span className="text-xs font-bold text-white">
                      高级感主图
                    </span>
                    <span className="block text-[10px] text-white/70 font-semibold mt-0.5">
                      点击率更高的商品主图
                    </span>
                  </div>
                </div>

                {/* 下方两张小图 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                      <img
                        src={EXAMPLE_IMAGES[0].url}
                        alt={EXAMPLE_IMAGES[0].label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center mt-2">
                      主图（白底）
                    </p>
                  </div>
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                      <img
                        src={EXAMPLE_IMAGES[2].url}
                        alt={EXAMPLE_IMAGES[2].label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center mt-2">
                      场景图
                    </p>
                  </div>
                </div>

                {/* 视觉引导 */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-orange-500 font-medium">
                    👉 上传商品图试一下
                  </span>
                  <span className="text-[10px] text-slate-400">
                    高清无水印下载需解锁
                  </span>
                </div>

                {/* 下载高清版本按钮 */}
                <button
                  onClick={() => setShowUnlockDialog(true)}
                  className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                >
                  ✨ 下载高清版本
                </button>
              </div>
            ) : (
              /* 生成结果 */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    已生成 {generatedImages.length} 张（电商级）
                  </h3>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    重新生成
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {generatedImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={img.url} 
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
                        {img.label}
                      </div>
                      <button
                        onClick={() => window.open(img.url, '_blank')}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="px-3 py-1.5 bg-white text-slate-800 text-sm rounded-lg flex items-center gap-1 shadow-lg">
                          <Download className="w-4 h-4" />
                          下载
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleReset}
                  className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  生成新图片
                </button>
                
                {/* Prompt 技术说明 */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">生成标准：</p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-500">商业摄影标准 · 8K高清 · 锐利对焦</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-500">无文字 · 无水印 · 无噪点</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-500">淘宝/京东/天猫可直接使用</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 解锁高清弹窗 */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-sm [&>[data-slot=dialog-close]]:opacity-30 [&>[data-slot=dialog-close]]:w-6 [&>[data-slot=dialog-close]]:h-6 [&>[data-slot=dialog-close]]:hover:opacity-50">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">解锁高清商品图</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">更清晰细节（适合电商主图）</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">可直接用于淘宝/京东</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">无水印下载</span>
              </div>
            </div>
            <div className="text-center py-2">
              <span className="text-sm text-slate-400 line-through mr-2">原价 ¥29</span>
              <span className="text-2xl font-bold text-orange-600">限时 ¥9.9</span>
              <span className="text-sm text-slate-400 ml-1">/ 10次</span>
            </div>
            <button
              onClick={() => setShowUnlockDialog(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              🔥 立即解锁高清图
            </button>
            <p className="text-[10px] text-center text-slate-400">解锁后可下载高清无水印商品图，支持商用</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
