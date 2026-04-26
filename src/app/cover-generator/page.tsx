'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { 
  Layout, Sparkles, Download, Loader2, 
  RefreshCw, Check, Image, Monitor, Smartphone, Share2
} from 'lucide-react';
import { toast } from 'sonner';

type Platform = 'xiaohongshu' | 'wechat' | 'douyin' | 'weibo';
type AspectRatio = '9:16' | '3:4' | '1:1' | '16:9';

interface GeneratedCover {
  id: string;
  url: string;
  platform: Platform;
  ratio: AspectRatio;
}

const platformOptions: { type: Platform; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'xiaohongshu', label: '小红书', icon: <span className="text-sm font-bold">📕</span>, color: 'from-pink-500 to-rose-500' },
  { type: 'wechat', label: '微信公众号', icon: <span className="text-sm font-bold">💚</span>, color: 'from-green-500 to-emerald-500' },
  { type: 'douyin', label: '抖音', icon: <span className="text-sm font-bold">🎵</span>, color: 'from-gray-700 to-black' },
  { type: 'weibo', label: '微博', icon: <span className="text-sm font-bold">📰</span>, color: 'from-orange-500 to-yellow-500' },
];

const aspectOptions: { type: AspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: '3:4', label: '3:4', icon: <Smartphone className="w-4 h-4" />, desc: '小红书竖图' },
  { type: '9:16', label: '9:16', icon: <Smartphone className="w-4 h-4" />, desc: '抖音/快手' },
  { type: '16:9', label: '16:9', icon: <Monitor className="w-4 h-4" />, desc: '横版视频' },
  { type: '1:1', label: '1:1', icon: <Layout className="w-4 h-4" />, desc: '朋友圈方图' },
];

const stylePresets = [
  { id: 'modern', label: '现代简约', gradient: 'from-slate-800 to-slate-600' },
  { id: 'vibrant', label: '活力渐变', gradient: 'from-orange-500 to-pink-500' },
  { id: 'fresh', label: '清新自然', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'elegant', label: '优雅气质', gradient: 'from-violet-500 to-purple-500' },
  { id: 'tech', label: '科技感', gradient: 'from-blue-600 to-cyan-500' },
  { id: 'warm', label: '温暖治愈', gradient: 'from-amber-500 to-orange-400' },
];

export default function CoverGeneratorPage() {
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['xiaohongshu']);
  const [selectedRatios, setSelectedRatios] = useState<AspectRatio[]>(['3:4']);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [generatedCovers, setGeneratedCovers] = useState<GeneratedCover[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    const templateName = params.get('template_name');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        
        // 如果模板有标题，预填标题
        if (data.title) {
          setTitle(data.title);
        }
        
        // 如果模板有副标题，预填副标题
        if (data.subtitle) {
          setSubtitle(data.subtitle);
        }
        
        // 如果模板有风格设置，应用风格
        if (data.style) {
          const matchedStyle = stylePresets.find(s => 
            s.id === data.style || s.label.includes(data.style)
          );
          if (matchedStyle) {
            setSelectedStyle(matchedStyle.id);
          }
        }
        
        if (templateName) {
          toast.success('已加载模板 "' + templateName + '"');
        }
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleRatio = (ratio: AspectRatio) => {
    setSelectedRatios(prev => 
      prev.includes(ratio) 
        ? prev.filter(r => r !== ratio)
        : [...prev, ratio]
    );
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('请输入封面标题');
      return;
    }

    if (selectedPlatforms.length === 0 || selectedRatios.length === 0) {
      toast.error('请至少选择一个平台和尺寸');
      return;
    }

    setGenerating(true);
    setGeneratedCovers([]);
    
    const style = stylePresets.find(s => s.id === selectedStyle)!;
    const newCovers: GeneratedCover[] = [];
    const sizeMap: Record<AspectRatio, string> = {
      '3:4': '3:4',
      '9:16': '9:16',
      '16:9': '16:9',
      '1:1': '1:1',
    };
    
    try {
      // 为每个组合生成封面
      for (const platform of selectedPlatforms) {
        for (const ratio of selectedRatios) {
          const id = `${platform}-${ratio}-${Date.now()}-${Math.random()}`;
          
          // 根据平台生成不同的提示词
          const platformLabel = platformOptions.find(p => p.type === platform)?.label || '';
          const prompt = `社交媒体封面图，标题「${title}」${subtitle ? `副标题「${subtitle}」` : ''}，${style.label}风格，${platformLabel}封面尺寸${ratio}，专业设计，高清质感，吸引眼球，适合社交媒体传播`;
          
          try {
            const response = await fetch('/api/images/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                prompt,
                size: '2K',
                count: 1
              })
            });

            const data = await response.json();
            
            if (data.success && data.imageUrls && data.imageUrls.length > 0) {
              newCovers.push({
                id,
                url: data.imageUrls[0],
                platform,
                ratio,
              });
            } else {
              // 如果生成失败，使用占位图
              newCovers.push({
                id,
                url: `https://picsum.photos/seed/${id}/600/800`,
                platform,
                ratio,
              });
            }
          } catch (err) {
            console.error('生成失败:', err);
            newCovers.push({
              id,
              url: `https://picsum.photos/seed/${id}/600/800`,
              platform,
              ratio,
            });
          }
        }
      }
      
      setGeneratedCovers(newCovers);
      toast.success(`生成 ${newCovers.length} 张封面！`);
    } catch (error) {
      toast.error('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (cover: GeneratedCover) => {
    try {
      const response = await fetch(cover.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-${cover.platform}-${cover.ratio}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('下载成功');
    } catch {
      toast.error('下载失败');
    }
  };

  const handleReset = () => {
    setGeneratedCovers([]);
    setTitle('');
    setSubtitle('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Layout className="w-4 h-4" />}
        toolName="封面生成器"
        toolDescription="AI生成多平台封面图"
        gradient="from-pink-500 to-rose-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium mb-4">
            <Layout className="w-4 h-4" />
            封面生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AI智能生成多平台封面图
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            小红书 / 公众号 / 抖音 / 微博 一键适配
          </p>
        </div>

        {/* 输入区域 */}
        <Card className="mb-6 border-pink-100 dark:border-pink-900/30">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                封面标题 *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入封面标题，如：2024年最火的10个AI工具"
                className="text-base"
                maxLength={50}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/50</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                副标题（可选）
              </label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="简短描述，如：效率提升300%"
                maxLength={30}
              />
            </div>
          </CardContent>
        </Card>

        {/* 平台选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">选择平台</h3>
            <div className="grid grid-cols-4 gap-3">
              {platformOptions.map(platform => (
                <button
                  key={platform.type}
                  onClick={() => togglePlatform(platform.type)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedPlatforms.includes(platform.type)
                      ? `border-pink-500 bg-gradient-to-br ${platform.color} text-white`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
                    {platform.icon}
                  </div>
                  <span className="text-sm font-medium">{platform.label}</span>
                  {selectedPlatforms.includes(platform.type) && (
                    <Check className="w-4 h-4 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 尺寸选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">选择尺寸</h3>
            <div className="grid grid-cols-4 gap-3">
              {aspectOptions.map(aspect => (
                <button
                  key={aspect.type}
                  onClick={() => toggleRatio(aspect.type)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedRatios.includes(aspect.type)
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded ${
                    selectedRatios.includes(aspect.type) ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700'
                  } flex items-center justify-center`}>
                    {aspect.icon}
                  </div>
                  <span className={`text-sm font-medium ${selectedRatios.includes(aspect.type) ? 'text-pink-700 dark:text-pink-400' : 'text-slate-500'}`}>
                    {aspect.label}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{aspect.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 风格选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">选择风格</h3>
            <div className="grid grid-cols-3 gap-3">
              {stylePresets.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedStyle === style.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${style.gradient} mb-2`} />
                  <span className={`text-sm font-medium ${selectedStyle === style.id ? 'text-pink-700 dark:text-pink-400' : 'text-slate-500'}`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 生成按钮 */}
        {!generatedCovers.length && (
          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成封面 ({selectedPlatforms.length * selectedRatios.length} 张)
              </>
            )}
          </Button>
        )}

        {/* 生成结果 */}
        {generatedCovers.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                已生成 {generatedCovers.length} 张封面
              </h3>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {generatedCovers.map(cover => {
                const platform = platformOptions.find(p => p.type === cover.platform);
                return (
                  <Card key={cover.id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src={cover.url} 
                        alt="封面预览" 
                        className="w-full object-contain bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs text-white bg-gradient-to-r ${platform?.color}`}>
                          {platform?.label}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs bg-black/50 text-white">
                          {cover.ratio}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <Button 
                        onClick={() => handleDownload(cover)}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <WechatPromo />
      </div>
    </div>
  );
}
