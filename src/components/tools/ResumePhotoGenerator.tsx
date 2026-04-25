'use client';

import { useState, useCallback } from 'react';
import { 
  UserCircle, Download, Loader2, Upload,
  Image as ImageIcon, Wand2, RefreshCw, 
  Check, Camera, Palette, Briefcase
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

const STYLES = [
  { id: 'business', name: '商务正装', colors: ['#1a365d', '#ffffff', '#c0c0c0'] },
  { id: 'casual', name: '休闲商务', colors: ['#2d3748', '#f7fafc', '#718096'] },
  { id: 'creative', name: '创意个性', colors: ['#553c9a', '#faf089', '#9f7aea'] },
  { id: 'tech', name: '科技感', colors: ['#0c4a6e', '#06b6d4', '#164e63'] },
  { id: 'warm', name: '温暖自然', colors: ['#744210', '#fbd38d', '#975a16'] },
  { id: 'minimal', name: '极简白底', colors: ['#ffffff', '#000000', '#e2e8f0'] },
];

export default function ResumePhotoGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('business');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert('请先上传照片');
      return;
    }

    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/600/800`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedImages([newImage, ...generatedImages]);
    setGenerating(false);
  };

  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `形象照_${image.style}_${image.timestamp}.png`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<UserCircle className="w-4 h-4" />}
        toolName="形象照生成"
        toolDescription="上传照片，一键生成专业简历形象照/职业照"
        gradient="from-blue-500 to-cyan-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 上传图片 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-500" />
            上传照片
          </h3>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedImage ? (
              <div className="relative">
                <img src={uploadedImage} alt="上传的照片" className="w-40 h-40 mx-auto rounded-2xl object-cover shadow-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-1">点击上传照片</p>
                <p className="text-xs text-slate-400">建议上传正面清晰照片</p>
              </div>
            )}
          </div>
        </div>

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            选择职业风格
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-sm font-medium ${
                  selectedStyle === style.id ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !uploadedImage}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-base font-medium shadow-lg shadow-blue-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成形象照
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              生成结果
              <Badge variant="secondary" className="ml-2">{generatedImages.length}</Badge>
            </h3>
            
            <div className="space-y-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img src={image.url} alt="生成的形象照" className="w-full aspect-[3/4] object-cover max-w-sm mx-auto" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white"
                        onClick={handleGenerate}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重新生成
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录解锁高清无水印</p>
              <p className="text-xs text-slate-500">多尺寸导出、商用授权</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
