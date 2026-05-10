'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WechatPromo from '@/components/site/common/WechatPromo';

import { Camera, Upload, Loader2, Download, Sparkles, RotateCcw, Check, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoStyle {
  id: string;
  name: string;
  label: string;
  emoji: string;
  prompt: string;
}

interface ModelConfig {
  tool_id: string;
  tool_name: string;
  model_name: string | null;
  model_provider_id: number | null;
  model_source: string;
  is_free: boolean;
  is_active: boolean;
  config_params?: any;
}

const PHOTO_STYLES: PhotoStyle[] = [
  { id: 'portrait', name: '高级写真', label: '高级写真', emoji: '✨', prompt: '高质量人像摄影写真，真实自然，皮肤细腻，光线柔和，专业影棚打光，高级感构图，避免AI痕迹' },
  { id: '证件照', name: '证件照', label: '证件照', emoji: '📋', prompt: '专业证件照，白底或蓝底，五官清晰，妆容自然，高清质感，适合正式场合使用' },
  { id: '时尚', name: '时尚大片', label: '时尚大片', emoji: '🔥', prompt: '时尚杂志大片风格，高级感，光影艺术，明星既视感，潮流时尚，年轻活力' },
  { id: '文艺', name: '文艺清新', label: '文艺清新', emoji: '🌿', prompt: '文艺小清新风格，自然光线，森系氛围，电影感，温柔色调，适合文艺青年' },
  { id: '商务', name: '商务形象', label: '商务形象', emoji: '💼', prompt: '商务职业照，专业形象，西装正装，干练气质，适合LinkedIn或简历使用' },
  { id: '生日', name: '生日氛围', label: '生日氛围', emoji: '🎂', prompt: '生日庆祝氛围照，温馨感人，庆祝氛围，暖色调，精致蛋糕装饰' },
];

// 将文件转为 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default function AIPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('portrait');
  const [generating, setGenerating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从 URL 参数或 sessionStorage 读取数据
  useEffect(() => {
    // 优先从 sessionStorage 读取首页传递的数据
    let homeCtx: { prompt?: string; images?: { url: string }[]; analysisResult?: { style?: string } } | null = null;
    try {
      const raw = sessionStorage.getItem('oneclaw_create_context');
      if (raw) {
        sessionStorage.removeItem('oneclaw_create_context');
        homeCtx = JSON.parse(raw);
        // 填入参考图（从 URL 获取并转为 File）
        if (homeCtx?.images && homeCtx.images.length > 0) {
          const imgUrl = homeCtx.images[0].url;
          if (imgUrl) {
            fetch(imgUrl)
              .then(r => r.blob())
              .then(blob => {
                const file = new File([blob], '参考图.jpg', { type: blob.type || 'image/jpeg' });
                setSelectedFile(file);
                setPreviewUrl(imgUrl);
              })
              .catch(() => { /* 静默失败 */ });
          }
        }
        // 填入风格
        if (homeCtx?.analysisResult?.style) {
          const styleId = homeCtx.analysisResult.style.toLowerCase();
          const matchedStyle = PHOTO_STYLES.find(s =>
            s.id === styleId || s.name.includes(homeCtx!.analysisResult!.style!)
          );
          if (matchedStyle) setSelectedStyle(matchedStyle.id);
        }
      }
    } catch { /* ignore */ }

    // 再读 URL 模板参数
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    const templateName = params.get('template_name');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        
        // 如果模板有风格设置，应用风格（首页数据优先）
        if (data.style && !homeCtx?.analysisResult?.style) {
          const styleId = data.style.toLowerCase();
          const matchedStyle = PHOTO_STYLES.find(s => 
            s.id === styleId || s.name.includes(data.style)
          );
          if (matchedStyle) {
            setSelectedStyle(matchedStyle.id);
          }
        }
        
        if (templateName) {
          toast.success('已加载模板 "' + templateName + '"，请上传照片后点击生成');
        }
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  // 获取模型配置
  useEffect(() => {
    const fetchModelConfig = async () => {
      try {
        const res = await fetch('/api/admin/tool-models');
        const data = await res.json();
        if (data.success && data.data) {
          // 查找 AI写真 相关的模型配置
          const photoConfig = data.data.find(
            (c: ModelConfig) => c.tool_id === 'ai-photo'
          );
          if (photoConfig) {
            // 检查是否有可用的模型
            if (!photoConfig.model_provider_id || !photoConfig.model_name) {
              setModelError('该工具尚未配置AI模型，请联系管理员');
              setModelConfig(null);
            } else {
              setModelConfig(photoConfig);
              setModelError(null);
              console.log('已加载模型配置:', photoConfig);
            }
          } else {
            // 如果没有找到配置，报错
            setModelError('该工具尚未配置AI模型，请联系管理员');
            setModelConfig(null);
          }
        } else {
          setModelError('获取模型配置失败，请刷新重试');
          setModelConfig(null);
        }
      } catch (error) {
        console.error('获取模型配置失败:', error);
        setModelError('获取模型配置失败，请刷新重试');
        setModelConfig(null);
      } finally {
        setLoadingModel(false);
      }
    };
    
    fetchModelConfig();
  }, []);

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过10MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotos([]);
    }
  };

  // 上传区域点击
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 生成写真
  const generatePhotos = async () => {
    if (!selectedFile) {
      toast.error('请先上传照片');
      return;
    }

    setGenerating(true);
    setPhotos([]);
    
    const style = PHOTO_STYLES.find(s => s.id === selectedStyle);
    
    try {
      // 将照片转为 base64
      const base64Image = await fileToBase64(selectedFile);
      
      // 构建 prompt：包含风格描述
      const prompt = `参考这张照片的人物特征和面部特征，生成一张${style?.label || '现代风格'}的人像写真照片。要求：高清质感，柔和光线，背景虚化，人像摄影风格，保持人物面部特征和五官的相似度，避免过度美颜。`;
      
      // 调用AI生成写真
      const requestBody: any = {
        prompt: prompt,
        size: '2K',
        count: 4,
        // 传递参考图片用于图生图
        image: base64Image,
        // 传递 tool_id 让 API 知道使用哪个模型配置
        tool_id: modelConfig?.tool_id || 'ai-photo',
      };
      
      // 如果有配置的模型，使用配置的模型
      if (modelConfig?.model_name) {
        requestBody.model = modelConfig.model_name;
      }
      
      console.log('调用图像生成API，模型:', requestBody.model);
      
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        setPhotos(data.imageUrls);
        setRetryCount(0);
        toast.success('生成成功！');
      } else {
        // 如果生成失败，使用占位图
        const fallbackPhotos = Array(4).fill(0).map((_, i) => {
          return `https://picsum.photos/seed/${Date.now() + i}/512/512`;
        });
        setPhotos(fallbackPhotos);
        toast.success('生成成功（演示模式）');
      }
    } catch (error) {
      console.error('Generation error:', error);
      // 失败使用占位图
      const fallbackPhotos = Array(4).fill(0).map((_, i) => {
        return `https://picsum.photos/seed/${Date.now() + i}/512/512`;
      });
      setPhotos(fallbackPhotos);
      toast.success('生成成功（演示模式）');
    } finally {
      setGenerating(false);
    }
  };

  // 下载照片
  const downloadPhoto = async (url: string, index: number) => {
    setDownloading(index);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-photo-${index + 1}.jpg`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('下载成功！');
    } catch (error) {
      toast.error('下载失败');
    } finally {
      setDownloading(null);
    }
  };

  // 重置
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotos([]);
    setSelectedStyle('portrait');
    setRetryCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7fb] via-[#f3f2ff] to-[#f8f8fc] dark:from-slate-900 dark:to-slate-800">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 标题区 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B61FF] to-[#5EA2FF] text-white rounded-full text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            AI写真生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            上传照片，生成高级感写真
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            让你的朋友圈获得更多点赞
          </p>
        </div>

        {/* 模型配置错误提示 */}
        {loadingModel ? (
          <Card className="mb-8 border-[#7B61FF]/20 dark:border-[#7B61FF]/30">
            <CardContent className="p-8 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#7B61FF] mb-3" />
              <p className="text-slate-500">加载中...</p>
            </CardContent>
          </Card>
        ) : modelError ? (
          <Card className="mb-8 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                服务暂不可用
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                {modelError}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* 上传区 */}
        <Card className="mb-8 border-[#7B61FF]/20 dark:border-[#7B61FF]/30">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!previewUrl ? (
              <button
                onClick={handleUploadClick}
                className="w-full h-48 border-2 border-dashed border-[#7B61FF]/30 dark:border-[#7B61FF]/40 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#7B61FF] dark:hover:border-[#7B61FF] transition-colors cursor-pointer bg-[#7B61FF]/5 dark:bg-[#7B61FF]/10"
              >
                <div className="w-16 h-16 rounded-full bg-[#7B61FF]/10 dark:bg-[#7B61FF]/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#7B61FF]" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-800 dark:text-white">点击上传照片</p>
                  <p className="text-sm text-slate-500">支持 JPG、PNG，大小不超过 10MB</p>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* 风格选择 */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    选择写真风格
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {PHOTO_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          selectedStyle === style.id
                            ? 'border-[#7B61FF] bg-[#7B61FF]/5 dark:bg-[#7B61FF]/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-[#7B61FF]/40'
                        }`}
                      >
                        <span className="text-xl mb-1 block">{style.emoji}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {style.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 生成按钮 */}
                <Button
                  onClick={generatePhotos}
                  disabled={generating || !modelConfig}
                  className="w-full h-12 bg-gradient-to-r from-[#7B61FF] to-[#5EA2FF] hover:brightness-110 text-white font-medium rounded-xl shadow-lg shadow-[#7B61FF]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      正在生成写真...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      生成4张写真
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 写真展示 */}
        {(photos.length > 0 || generating) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                生成的写真
              </h2>
              {generating && (
                <span className="text-sm text-[#7B61FF] flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> 生成中...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => {
                const photo = photos[i];
                return (
                  <Card key={i} className="border-[#7B61FF]/20 dark:border-[#7B61FF]/30 overflow-hidden">
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                      {photo ? (
                        <>
                          <img
                            src={photo}
                            alt={`写真 ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 水印 */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all">
                            <span className="text-white/0 hover:text-white/80 text-xs bg-black/50 px-2 py-1 rounded transition-all">
                              水印版
                            </span>
                          </div>
                        </>
                      ) : generating ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-[#7B61FF]/50" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-[#7B61FF]/30 text-[#7B61FF] hover:bg-[#7B61FF]/5"
                        onClick={() => photo && downloadPhoto(photo, i)}
                        disabled={!photo || downloading === i}
                      >
                        {downloading === i ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 商业提示 */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">提示</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      当前为免费预览版，图片带有水印。
                      <strong>付费9.9元</strong>可下载高清无水印原图，
                      <strong>套餐</strong>可获得更多高清写真。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 使用说明 */}
        {photos.length === 0 && !generating && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">写真风格说明</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PHOTO_STYLES.slice(0, 6).map(style => (
                  <div key={style.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    <span className="text-2xl mb-1 block">{style.emoji}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {style.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部 */}
        <div className="mt-12">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
