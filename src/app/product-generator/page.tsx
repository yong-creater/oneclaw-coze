'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Download, RefreshCw, X, Check, ArrowRight, Zap } from 'lucide-react';
import UtilityHeader from '@/components/common/UtilityHeader';

interface GeneratedImage {
  id: number;
  url: string;
  label: string;
}

// 示例使用耳机商品图（电商风格）
// 统一使用无线耳机，三种风格：白底主图 / 高级感卖点图 / 场景图
const EXAMPLE_IMAGES: GeneratedImage[] = [
  // 1️⃣ 主图（白底电商）- commercial studio photography
  { id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=90', label: '主图（白底）' },
  // 2️⃣ 卖点图（高级感）- premium product shot  
  { id: 2, url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&q=90', label: '卖点图（高级感）' },
  // 3️⃣ 场景图（生活场景）- lifestyle scene
  { id: 3, url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop&q=90', label: '场景图（卖货）' },
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
                  placeholder={"商品卖点（强烈建议填写）\n例如：\n降噪黑科技｜30小时续航｜佩戴舒适不压耳"}
                  rows={3}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-500 outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 resize-none text-sm"
                />
                <button
                  onClick={() => setProductBenefit('高音质沉浸体验｜主动降噪｜超长续航｜轻量舒适')}
                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  帮我生成
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
                  ⚡ 今日免费生成次数还剩 2 次
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
                    正在生成...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    一键生成商品图（免费预览）
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
            {!showResults ? (
              /* 默认示例展示 */
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 text-center">
                  生成效果（电商级）
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* 主图（白底电商） */}
                  <div className="text-center">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 shadow-lg ring-2 ring-orange-200">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=90" alt="主图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-orange-600 font-medium">主图（白底）</p>
                  </div>
                  {/* 卖点图（高级感） */}
                  <div className="text-center">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                      <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop&q=90" alt="卖点图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-orange-600 font-medium">卖点图</p>
                  </div>
                  {/* 场景图（卖货） */}
                  <div className="text-center">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                      <img src="https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop&q=90" alt="场景图" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-orange-600 font-medium">场景图</p>
                  </div>
                </div>
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
    </div>
  );
}
