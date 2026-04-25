'use client';

import { useState, useCallback } from 'react';
import { 
  Megaphone, Download, Loader2,
  Image as ImageIcon, Wand2, RefreshCw, 
  Check, Star, PartyPopper, Gift, Sparkles
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GeneratedPoster {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

const FESTIVALS = [
  { id: 'spring', name: '春节', emoji: '🧧', color: 'red' },
  { id: 'lantern', name: '元宵节', emoji: '🏮', color: 'orange' },
  { id: 'qixi', name: '七夕节', emoji: '💕', color: 'pink' },
  { id: 'mid_autumn', name: '中秋节', emoji: '🥮', color: 'yellow' },
  { id: 'national', name: '国庆节', emoji: '🎉', color: 'red' },
  { id: 'double11', name: '双十一', emoji: '🛒', color: 'blue' },
  { id: 'christmas', name: '圣诞节', emoji: '🎄', color: 'green' },
  { id: 'new_year', name: '元旦', emoji: '🎊', color: 'blue' },
];

const SCENES = [
  { id: 'opening', name: '开业大吉', emoji: '🎊' },
  { id: 'promotion', name: '促销优惠', emoji: '🎁' },
  { id: 'new_product', name: '新品上市', emoji: '✨' },
  { id: 'member', name: '会员专享', emoji: '👑' },
];

const STYLES = [
  { id: 'modern', name: '现代简约', colors: ['#1a1a2e', '#e94560', '#0f3460'] },
  { id: 'warm', name: '温暖喜庆', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
  { id: 'fresh', name: '清新自然', colors: ['#00b894', '#55efc4', '#81ecec'] },
  { id: 'luxury', name: '轻奢高级', colors: ['#2d3436', '#d63031', '#fdcb6e'] },
];

const SIZES = [
  { value: 'instagram', label: '朋友圈', icon: '📱' },
  { value: 'story', label: '抖音封面', icon: '🎬' },
  { value: 'poster', label: '宣传单', icon: '📄' },
];

export default function FestivalPosterGenerator() {
  const [selectedFestival, setSelectedFestival] = useState('spring');
  const [selectedScene, setSelectedScene] = useState('opening');
  const [title, setTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedSize, setSelectedSize] = useState('instagram');
  const [generating, setGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('请输入活动主题');
      return;
    }

    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPoster: GeneratedPoster = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/800/1200`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedPosters([newPoster, ...generatedPosters]);
    setGenerating(false);
  };

  const handleDownload = useCallback((poster: GeneratedPoster) => {
    const link = document.createElement('a');
    link.href = poster.url;
    link.download = `海报_${poster.style}_${poster.timestamp}.png`;
    link.click();
  }, []);

  const currentFestival = FESTIVALS.find(f => f.id === selectedFestival);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Megaphone className="w-4 h-4" />}
        toolName="节日营销海报生成"
        toolDescription="选择节日/场景，输入主题，一键生成精美营销海报"
        gradient="from-red-500 to-orange-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 节日选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-red-500" />
            选择节日
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {FESTIVALS.map((festival) => (
              <button
                key={festival.id}
                onClick={() => setSelectedFestival(festival.id)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedFestival === festival.id
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <span className="text-2xl mb-1 block">{festival.emoji}</span>
                <p className={`text-xs font-medium ${
                  selectedFestival === festival.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {festival.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 场景选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            选择活动场景
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedScene === scene.id
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <span className="text-2xl mb-1 block">{scene.emoji}</span>
                <p className={`text-sm font-medium ${
                  selectedScene === scene.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {scene.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 输入主题 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-red-500" />
            输入活动主题
          </h3>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：全场8折、会员专享、新品上市"
            className="w-full text-base"
          />
        </div>

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            选择风格
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-sm font-medium ${
                  selectedStyle === style.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            选择导出尺寸
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedSize === size.value
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                }`}
              >
                <span className="text-xl mb-1 block">{size.icon}</span>
                <p className={`text-sm font-medium ${
                  selectedSize === size.value ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {size.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !title.trim()}
          className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl text-base font-medium shadow-lg shadow-red-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成海报
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedPosters.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-500" />
              生成结果
              <Badge variant="secondary" className="ml-2">{generatedPosters.length}</Badge>
            </h3>
            
            <div className="space-y-4">
              {generatedPosters.map((poster) => (
                <div key={poster.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img src={poster.url} alt="生成的海报" className="w-full aspect-[2/3] object-cover max-w-sm mx-auto" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white"
                        onClick={() => handleDownload(poster)}
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
            <Megaphone className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录解锁高清无水印</p>
              <p className="text-xs text-slate-500">批量生成、商用授权</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
