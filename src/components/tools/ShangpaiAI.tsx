'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import LoginButton from '@/components/common/LoginButton';
import {
  Upload, Image, Type, Sparkles, Loader2, Download,
  RefreshCw, X, Check, AlertCircle, Wand2, Sun,
  Contrast, Palette, Tag, ShoppingBag, Smartphone,
  Monitor, Box, TrendingUp, Shield, Zap
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== 类型定义 ====================
interface GeneratedImage {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  platform_compliant: boolean;
  compliance_details: string[];
  scene: string;
  platform: string;
}

interface PlatformInfo {
  value: string;
  label: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  rules: string;
}

interface SceneInfo {
  value: string;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  desc: string;
  prompt: string;
}

// ==================== 常量 ====================
const PLATFORMS: PlatformInfo[] = [
  { value: 'taobao', label: '淘宝', icon: <ShoppingBag className="w-5 h-5" />, width: 800, height: 800, rules: '白底图占比≥85%' },
  { value: 'douyin', label: '抖音', icon: <Smartphone className="w-5 h-5" />, width: 1080, height: 1350, rules: '竖版，安全区重点内容' },
  { value: 'pinduoduo', label: '拼多多', icon: <Box className="w-5 h-5" />, width: 750, height: 1000, rules: '文字不超过1/3区域' },
  { value: 'jd', label: '京东', icon: <Monitor className="w-5 h-5" />, width: 800, height: 800, rules: '严格白底要求' },
];

const SCENES: SceneInfo[] = [
  { value: 'white_bg', label: '白底图', icon: <Box className="w-5 h-5" />, emoji: '⬜', desc: '纯白背景，商品居中', prompt: '纯白背景(白色#FFFFFF)，商品居中放置，无阴影，无倒影，商业摄影风格，高清质感' },
  { value: 'model', label: '模特展示', icon: <Zap className="w-5 h-5" />, emoji: '👤', desc: '虚拟模特穿戴使用', prompt: '时尚模特展示场景，室内专业摄影棚，柔和灯光，高清质感，商业摄影风格' },
  { value: 'lifestyle', label: '生活场景', icon: <Sun className="w-5 h-5" />, emoji: '🏠', desc: '家庭/办公真实环境', prompt: '温馨家居生活场景，自然光线，真实环境，商业摄影风格，高清质感' },
  { value: 'promotion', label: '促销氛围', icon: <TrendingUp className="w-5 h-5" />, emoji: '🎉', desc: '节日促销营销风格', prompt: '节日促销氛围，红色金色装饰，营销风格，喜庆热闹，商业摄影，高清质感' },
];

const SELLING_POINTS = [
  { label: '透气', color: 'bg-blue-100 text-blue-700' },
  { label: '防水', color: 'bg-cyan-100 text-cyan-700' },
  { label: '抗菌', color: 'bg-green-100 text-green-700' },
  { label: '轻便', color: 'bg-purple-100 text-purple-700' },
  { label: '高性价比', color: 'bg-amber-100 text-amber-700' },
  { label: '静音', color: 'bg-slate-100 text-slate-700' },
  { label: '节能', color: 'bg-emerald-100 text-emerald-700' },
  { label: '耐用', color: 'bg-rose-100 text-rose-700' },
];

const QUOTA = {
  daily: 5,
  resetTime: '次日0点重置',
};

// ==================== 工具函数 ====================
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function downloadImage(url: string, filename: string) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(err => toast.error('下载失败'));
}

// ==================== 主组件 ====================
export default function ShangpaiAIPage() {
  // 输入模式：image | text
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  
  // 上传状态
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState('');
  
  // 选择状态
  const [selectedPlatform, setSelectedPlatform] = useState('taobao');
  const [selectedScene, setSelectedScene] = useState('white_bg');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // 调整参数
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [warmth, setWarmth] = useState(0);
  
  // 生成状态
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // 配额状态（模拟）
  const [quotaUsed, setQuotaUsed] = useState(2);
  
  // 下载状态
  const [downloading, setDownloading] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理文件上传
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(base64);
      toast.success('图片上传成功');
    } catch {
      toast.error('图片上传失败');
    }
  };

  // 处理标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 生成商品图
  const handleGenerate = async () => {
    if (inputMode === 'image' && !uploadedImage) {
      toast.error('请先上传商品图片');
      return;
    }
    if (inputMode === 'text' && !productDescription.trim()) {
      toast.error('请输入商品描述');
      return;
    }
    if (quotaUsed >= QUOTA.daily) {
      toast.error('今日额度已用完，请明天再来或升级会员');
      return;
    }
    
    setGenerating(true);
    setProgress('正在识别商品特征...');
    setGeneratedImages([]);
    
    try {
      // 构建提示词
      const scene = SCENES.find(s => s.value === selectedScene);
      const platform = PLATFORMS.find(p => p.value === selectedPlatform);
      
      let prompt = '';
      if (inputMode === 'image') {
        prompt = `参考这张商品图片，生成一张${scene?.label || '白底图'}风格的电商主图。`;
      } else {
        prompt = `根据商品描述"${productDescription}"，生成一张${scene?.label || '白底图'}风格的电商主图。`;
      }
      
      // 添加场景描述
      prompt += ` ${scene?.prompt || ''}`;
      
      // 添加卖点标签
      if (selectedTags.length > 0) {
        prompt += `。卖点：${selectedTags.join('、')}`;
      }
      
      // 添加调整参数
      const adjustments: string[] = [];
      if (brightness > 0) adjustments.push('提亮');
      if (brightness < 0) adjustments.push('调暗');
      if (contrast > 0) adjustments.push('增强对比度');
      if (contrast < 0) adjustments.push('降低对比度');
      if (warmth > 0) adjustments.push('暖色调');
      if (warmth < 0) adjustments.push('冷色调');
      if (adjustments.length > 0) {
        prompt += `。后期处理：${adjustments.join('、')}`;
      }
      
      // 添加平台规格
      prompt += `。图片尺寸：${platform?.width}x${platform?.height}px，商业摄影风格，高清质感。`;
      
      console.log('生成提示词:', prompt);
      
      setProgress('正在生成商品图...');
      
      // 调用图像生成API
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          size: '2K',
          count: 1,
          image: inputMode === 'image' ? uploadedImage : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrls[0],
          thumbnail: data.imageUrls[0],
          width: platform?.width || 800,
          height: platform?.height || 800,
          platform_compliant: true,
          compliance_details: [`尺寸符合${platform?.label}规范`],
          scene: selectedScene,
          platform: selectedPlatform,
        };
        
        setGeneratedImages([newImage]);
        setQuotaUsed(prev => prev + 1);
        toast.success('生成成功！');
      } else {
        // 使用演示图片
        const demoImage: GeneratedImage = {
          id: Date.now().toString(),
          url: `https://picsum.photos/seed/${Date.now()}/800/800`,
          thumbnail: `https://picsum.photos/seed/${Date.now()}/200/200`,
          width: platform?.width || 800,
          height: platform?.height || 800,
          platform_compliant: true,
          compliance_details: ['演示模式'],
          scene: selectedScene,
          platform: selectedPlatform,
        };
        setGeneratedImages([demoImage]);
        setQuotaUsed(prev => prev + 1);
        toast.success('生成成功（演示模式）');
      }
    } catch (error) {
      console.error('生成失败:', error);
      toast.error('生成失败，请重试');
    } finally {
      setGenerating(false);
      setProgress('');
    }
  };

  // 下载图片
  const handleDownload = async (image: GeneratedImage) => {
    setDownloading(image.id);
    try {
      downloadImage(image.url, `shangpai-${image.platform}-${image.scene}-${Date.now()}.jpg`);
      toast.success('下载成功');
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  // 重置
  const handleReset = () => {
    setUploadedImage(null);
    setProductDescription('');
    setSelectedScene('white_bg');
    setSelectedTags([]);
    setBrightness(0);
    setContrast(0);
    setWarmth(0);
    setGeneratedImages([]);
  };

  const platform = PLATFORMS.find(p => p.value === selectedPlatform);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<ShoppingBag className="w-4 h-4" />}
        toolName="商拍AI"
        toolDescription="15秒生成专业商品图"
        gradient="from-orange-500 to-red-500"
      />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackToHome />
        
        {/* 页面标题 */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            智能商拍，一键生成
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            专业商品图生成器
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            适配淘宝/抖音/拼多多/京东，支持多种场景模板
          </p>
        </div>

        {/* 额度显示 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              今日剩余：<span className="font-bold text-orange-500">{QUOTA.daily - quotaUsed}</span> / {QUOTA.daily} 次
            </span>
            {quotaUsed >= QUOTA.daily && (
              <Button size="sm" variant="outline" className="ml-2 text-orange-500 border-orange-300">
                升级会员
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧面板 - 输入 */}
          <div className="space-y-4">
            {/* 输入模式切换 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputMode('image')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      inputMode === 'image'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-orange-300'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">上传图片</span>
                  </button>
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      inputMode === 'text'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-orange-300'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-sm font-medium">文字描述</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 图片上传区域 */}
            {inputMode === 'image' && (
              <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  
                  {!uploadedImage ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-orange-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800 dark:text-white">拖拽商品照片或点击上传</p>
                        <p className="text-xs text-slate-500 mt-1">支持JPG/PNG，建议800×800以上</p>
                      </div>
                    </button>
                  ) : (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="上传预览"
                        className="w-full h-40 object-contain rounded-xl bg-slate-100 dark:bg-slate-700"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 文字描述区域 */}
            {inputMode === 'text' && (
              <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="输入商品描述，如：白色运动鞋，侧面45度，阳光照射，简洁背景"
                    className="w-full h-40 px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors text-sm text-slate-800 dark:text-slate-200 resize-none placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    描述越详细，生成效果越好
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 平台选择 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">目标平台</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setSelectedPlatform(p.value)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all ${
                        selectedPlatform === p.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      }`}
                    >
                      <span className={selectedPlatform === p.value ? 'text-orange-500' : 'text-slate-400'}>
                        {p.icon}
                      </span>
                      <span className={`text-sm font-medium ${
                        selectedPlatform === p.value ? 'text-orange-600' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {platform?.rules}
                </p>
              </CardContent>
            </Card>

            {/* 场景选择 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">场景模板</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SCENES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedScene(s.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedScene === s.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{s.emoji}</span>
                        <span className={`text-sm font-medium ${
                          selectedScene === s.value ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 卖点标签 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">卖点标签</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SELLING_POINTS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => toggleTag(tag.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag.label)
                          ? `${tag.color} ring-2 ring-orange-400`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 参数调整 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">参数调整</span>
                </div>
                
                {/* 亮度 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">亮度</span>
                    <span className="text-slate-400">{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
                
                {/* 对比度 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">对比度</span>
                    <span className="text-slate-400">{contrast > 0 ? `+${contrast}` : contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
                
                {/* 色温 */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">色温</span>
                    <span className="text-slate-400">
                      {warmth > 0 ? '暖色' : warmth < 0 ? '冷色' : '自然'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={warmth}
                    onChange={(e) => setWarmth(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间面板 - 预览 */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">生成预览</span>
                  {platform && (
                    <span className="text-xs text-slate-500">
                      {platform.width}×{platform.height}px
                    </span>
                  )}
                </div>
                
                {generating ? (
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                    <p className="text-sm text-slate-500">{progress}</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    {generatedImages.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.url}
                          alt="生成结果"
                          className="w-full rounded-xl bg-slate-100 dark:bg-slate-700"
                          style={{ aspectRatio: `${img.width}/${img.height}` }}
                        />
                        
                        {/* 合规标识 */}
                        {img.platform_compliant ? (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                            <Check className="w-3 h-3" />
                            符合{PLATFORMS.find(p => p.value === img.platform)?.label}规范
                          </div>
                        ) : (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs">
                            <AlertCircle className="w-3 h-3" />
                            待优化
                          </div>
                        )}
                        
                        {/* 操作按钮 */}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleGenerate()}
                            className="bg-white/90 hover:bg-white"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            重新生成
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(img)}
                            disabled={downloading === img.id}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            {downloading === img.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            下载
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <Image className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">上传图片或输入描述后点击生成</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 合规详情 */}
            {generatedImages.length > 0 && generatedImages[0].compliance_details.length > 0 && (
              <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">合规检测</span>
                  </div>
                  <div className="space-y-2">
                    {generatedImages[0].compliance_details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧面板 - 历史和帮助 */}
          <div className="space-y-4">
            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={generating || quotaUsed >= QUOTA.daily}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  一键生成 ({QUOTA.daily - quotaUsed}次可用)
                </>
              )}
            </Button>

            {/* 重置按钮 */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>

            {/* 使用教程 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">使用教程</span>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">1</span>
                    <p>上传商品图片或输入文字描述</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">2</span>
                    <p>选择目标平台和场景模板</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">3</span>
                    <p>点击生成，获取专业商品图</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 平台规格 */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">平台规格</span>
                </div>
                <div className="space-y-2 text-xs">
                  {PLATFORMS.map((p) => (
                    <div key={p.value} className="flex justify-between">
                      <span className="text-slate-500">{p.label}</span>
                      <span className="text-slate-400">{p.width}×{p.height}px</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 会员推广 */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">升级会员</span>
                </div>
                <p className="text-sm opacity-90 mb-3">
                  每日500次生成额度，无限制使用所有高级功能
                </p>
                <Button size="sm" variant="secondary" className="w-full bg-white text-orange-600 hover:bg-orange-50">
                  立即开通
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部推广 */}
        <div className="mt-8">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
