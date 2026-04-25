'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  UserCircle, Download, Loader2, 
  Image as ImageIcon, Briefcase,
  Shirt, User, Crown, Sparkles,
  Copy, Check, RefreshCw, Wand2, Star,
  CheckCircle2, Eye, Camera, Upload,
  Share2, DownloadCloud
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';

// ==================== 类型定义 ====================
interface ProfessionStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  bgColor: string;
  suitColor: string;
  icon: React.ReactNode;
}

interface PhotoResult {
  id: string;
  imageUrl: string;
  style: string;
  type: 'formal' | 'casual' | 'creative';
  timestamp: number;
}

interface GeneratedPhoto {
  id: string;
  url: string;
  style: string;
  prompt: string;
  timestamp: number;
}

// ==================== 常量 ====================
const PROFESSION_STYLES: ProfessionStyle[] = [
  { 
    id: 'business', 
    name: '商务精英', 
    description: '正式商务装，深色西装白衬衫',
    prompt: 'professional business portrait, suit and tie, formal business attire, confident expression, clean corporate background',
    bgColor: 'from-slate-800 to-slate-900',
    suitColor: 'bg-slate-800',
    icon: <Briefcase className="w-4 h-4" />
  },
  { 
    id: 'tech', 
    name: '科技精英', 
    description: '智能眼镜+简约商务休闲',
    prompt: 'tech professional portrait, smart casual with blazer, modern tech aesthetic, innovative expression',
    bgColor: 'from-blue-800 to-indigo-900',
    suitColor: 'bg-blue-800',
    icon: <Camera className="w-4 h-4" />
  },
  { 
    id: 'creative', 
    name: '创意先锋', 
    description: '时尚穿搭，创意造型',
    prompt: 'creative professional portrait, stylish creative attire, artistic expression, contemporary fashion forward',
    bgColor: 'from-purple-800 to-pink-900',
    suitColor: 'bg-purple-800',
    icon: <Sparkles className="w-4 h-4" />
  },
  { 
    id: 'legal', 
    name: '律政精英', 
    description: '律师/金融精英风格',
    prompt: 'legal professional portrait, lawyer attire, sophisticated and authoritative, prestigious law firm background',
    bgColor: 'from-emerald-800 to-teal-900',
    suitColor: 'bg-emerald-800',
    icon: <Star className="w-4 h-4" />
  },
  { 
    id: 'medical', 
    name: '医疗专家', 
    description: '白大褂/医疗专业形象',
    prompt: 'medical professional portrait, white coat, healthcare professional, trustworthy and competent expression',
    bgColor: 'from-cyan-700 to-blue-800',
    suitColor: 'bg-cyan-700',
    icon: <UserCircle className="w-4 h-4" />
  },
  { 
    id: 'finance', 
    name: '金融大咖', 
    description: '银行/投资/证券精英',
    prompt: 'finance professional portrait, investment banker attire, wealth management aesthetic, confident sophisticated look',
    bgColor: 'from-amber-800 to-orange-900',
    suitColor: 'bg-amber-800',
    icon: <Briefcase className="w-4 h-4" />
  },
  { 
    id: 'education', 
    name: '教育学者', 
    description: '教授/学者/培训师',
    prompt: 'education professional portrait, smart casual academic attire, intellectual and approachable expression',
    bgColor: 'from-rose-800 to-red-900',
    suitColor: 'bg-rose-800',
    icon: <User className="w-4 h-4" />
  },
  { 
    id: 'executive', 
    name: '企业高管', 
    description: 'CEO/总裁/高管形象',
    prompt: 'executive portrait, premium business attire, CEO level appearance, leadership and authority',
    bgColor: 'from-gray-800 to-slate-900',
    suitColor: 'bg-gray-800',
    icon: <Crown className="w-4 h-4" />
  },
];

const BACKGROUND_STYLES = [
  { value: 'solid', label: '纯色背景', options: ['蓝色', '灰色', '白色', '渐变'] },
  { value: 'office', label: '办公场景', options: ['现代办公室', '会议室', '书房'] },
  { value: 'outdoor', label: '户外场景', options: ['城市建筑', '自然风景', '地标建筑'] },
];

const PHOTO_SIZES = [
  { value: '1寸', label: '1寸', desc: '25×35mm', pixels: '295×413px' },
  { value: '2寸', label: '2寸', desc: '35×49mm', pixels: '413×579px' },
  { value: '小2寸', label: '小2寸', desc: '33×48mm', pixels: '390×567px' },
  { value: '简历照', label: '简历照', desc: '常用尺寸', pixels: '480×640px' },
  { value: '社交头像', label: '社交头像', desc: '朋友圈/脉脉', pixels: '800×800px' },
];

const QUALITY_OPTIONS = [
  { value: 'standard', label: '标准版', desc: '适合日常使用', points: 5 },
  { value: 'hd', label: '高清版', desc: '适合打印输出', points: 10 },
  { value: 'ultra', label: '超清版', desc: '适合大幅打印', points: 20 },
];

// ==================== 主组件 ====================
export default function ResumePhotoGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('business');
  const [selectedBg, setSelectedBg] = useState<string>('solid');
  const [selectedSize, setSelectedSize] = useState<string>('简历照');
  const [selectedQuality, setSelectedQuality] = useState<string>('hd');
  const [generating, setGenerating] = useState(false);
  const [generatedPhotos, setGeneratedPhotos] = useState<GeneratedPhoto[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<GeneratedPhoto | null>(null);
  
  // 处理图片上传
  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
  }, []);

  // 生成形象照
  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert('请先上传照片');
      return;
    }

    setGenerating(true);
    
    try {
      const style = PROFESSION_STYLES.find(s => s.id === selectedStyle);
      
      // 模拟生成过程（实际项目中会调用AI生成API）
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 生成多张照片
      const newPhotos: GeneratedPhoto[] = PROFESSION_STYLES.slice(0, 4).map((s, index) => ({
        id: `${Date.now()}_${index}`,
        url: `https://picsum.photos/seed/${Date.now() + index}/400/500`,
        style: s.name,
        prompt: s.prompt,
        timestamp: Date.now(),
      }));
      
      setGeneratedPhotos(newPhotos);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 下载照片
  const handleDownload = async (photo: GeneratedPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `形象照_${photo.style}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    if (generatedPhotos.length === 0) return;
    
    try {
      // 简化处理：逐个下载
      for (const photo of generatedPhotos) {
        await handleDownload(photo);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('批量下载失败:', error);
    }
  };

  // 预览大图
  const handlePreview = (photo: GeneratedPhoto) => {
    setPreviewPhoto(photo);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<UserCircle className="w-4 h-4" />}
        toolName="AI形象照生成"
        toolDescription="一键生成专业职业形象照，适用于简历、社交头像"
        gradient="from-blue-500 to-cyan-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：参数设置 */}
          <div className="space-y-6">
            {/* 照片上传 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                上传照片
              </h3>
              <ImageUploader 
                value={uploadedImage || undefined}
                onChange={handleImageUpload}
              />
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>拍摄建议：</strong>请上传正面照片，光线均匀，五官清晰可见效果更佳
                </p>
              </div>
            </div>

            {/* 风格选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-500" />
                选择形象风格
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PROFESSION_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bgColor} flex items-center justify-center text-white mb-3`}>
                      {style.icon}
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{style.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 照片尺寸 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                选择照片尺寸
              </h3>
              <div className="space-y-2">
                {PHOTO_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedSize === size.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{size.label}</p>
                        <p className="text-xs text-slate-500">{size.desc}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {size.pixels}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 画质选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                选择画质
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {QUALITY_OPTIONS.map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => setSelectedQuality(quality.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedQuality === quality.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-slate-700 dark:text-slate-200">{quality.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{quality.desc}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {quality.points} 点
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !uploadedImage}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成，生成4种风格...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  一键生成形象照
                </>
              )}
            </Button>

            {/* 功能说明 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                功能特点
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• AI智能识别，一键生成专业形象照</li>
                <li>• 8种职业风格，满足不同场景需求</li>
                <li>• 多尺寸输出，适配简历/社交媒体</li>
                <li>• 高清画质，可直接打印使用</li>
              </ul>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            {/* 生成预览 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  生成结果
                </h3>
                {generatedPhotos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {generatedPhotos.length} 张可选
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBatchDownload}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <DownloadCloud className="w-4 h-4 mr-1" />
                      批量下载
                    </Button>
                  </div>
                )}
              </div>
              
              {generatedPhotos.length === 0 ? (
                <div className="aspect-[4/5] rounded-xl bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <UserCircle className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">上传照片即可生成</p>
                  <p className="text-sm mt-1">AI将生成4种不同风格的形象照</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {generatedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.style}
                        className="w-full aspect-[4/5] rounded-xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreview(photo)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="预览"
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                        </button>
                        <button
                          onClick={() => handleDownload(photo)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="下载"
                        >
                          <Download className="w-4 h-4 text-slate-700" />
                        </button>
                        <button
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="分享"
                        >
                          <Share2 className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                        {photo.style}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 使用场景 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                适用场景
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: '简历照片', desc: '求职面试', icon: '📄' },
                  { title: 'LinkedIn', desc: '职业社交', icon: '💼' },
                  { title: '名片设计', desc: '商务名片', icon: '💳' },
                  { title: '员工档案', desc: '企业形象', icon: '🏢' },
                ].map((scene) => (
                  <div key={scene.title} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-2xl mb-1">{scene.icon}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{scene.title}</p>
                    <p className="text-xs text-slate-500">{scene.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 会员升级 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white mb-1">会员专享特权</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    升级会员可享受超清画质输出、自定义背景、批量生成等高级功能！
                  </p>
                </div>
              </div>
            </div>

            {/* 登录提示 */}
            <LoginButton />
          </div>
        </div>
      </div>

      {/* 预览弹窗 */}
      {showPreview && previewPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.style}
              className="w-full rounded-xl"
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-white font-medium">{previewPhoto.style}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(previewPhoto)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
