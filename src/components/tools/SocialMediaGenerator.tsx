'use client';

import { useState, useCallback } from 'react';
import { 
  Camera, Download, Loader2, 
  Image as ImageIcon, Sparkles,
  Copy, Check, RefreshCw, Wand2, Star,
  Plus, Type, Trash2, Upload, 
  Heart, MessageCircle, Share2,
  Smartphone, Monitor, Instagram,
  TrendingUp, BookOpen, Lightbulb,
  Palette, Crown, Gift, Megaphone,
  Home, MapPin, Baby
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Track {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

interface StylePreset {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface HotTopic {
  id: string;
  title: string;
  platform: string;
  heat: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  platform: string;
  style: string;
  size: string;
  timestamp: number;
}

// ==================== 常量 ====================
const PLATFORMS: Platform[] = [
  { id: 'xiaohongshu', name: '小红书', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'douyin', name: '抖音', icon: <Smartphone className="w-5 h-5" /> },
];

const TRACKS = [
  { id: 'beauty', name: '美妆护肤', color: 'rose', icon: <Heart className="w-4 h-4" /> },
  { id: 'food', name: '美食探店', color: 'orange', icon: <Camera className="w-4 h-4" /> },
  { id: 'fashion', name: '穿搭时尚', color: 'purple', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'home', name: '家居生活', color: 'green', icon: <Home className="w-4 h-4" /> },
  { id: 'study', name: '知识干货', color: 'blue', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'fitness', name: '健身运动', color: 'cyan', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'travel', name: '旅行打卡', color: 'sky', icon: <MapPin className="w-4 h-4" /> },
  { id: 'parenting', name: '母婴育儿', color: 'pink', icon: <Baby className="w-4 h-4" /> },
];

const STYLE_PRESETS: StylePreset[] = [
  { id: 'ins', name: 'Ins氛围感', description: '高级感配色，精致生活', colors: ['#f5f5f5', '#d4af37', '#333333'] },
  { id: 'warm', name: '温暖治愈', description: '暖色调，温馨亲切', colors: ['#fff5e6', '#ff9a56', '#ff6b6b'] },
  { id: 'fresh', name: '清新自然', description: '绿色系，清爽舒适', colors: ['#e8f5e9', '#81c784', '#2e7d32'] },
  { id: 'vintage', name: '复古文艺', description: '胶片质感，文艺复古', colors: ['#faf3e0', '#8b7355', '#4a4a4a'] },
  { id: 'minimal', name: '简约高级', description: '黑白极简，高级感', colors: ['#ffffff', '#000000', '#666666'] },
  { id: 'playful', name: '活泼可爱', description: '彩色系，趣味性强', colors: ['#ffd1dc', '#87ceeb', '#98fb98'] },
];

const IMAGE_SIZES = [
  { value: 'cover_34', label: '封面图 3:4', platform: '小红书', size: '1242×1656' },
  { value: 'cover_11', label: '封面图 1:1', platform: '通用', size: '1080×1080' },
  { value: 'cover_916', label: '视频封面 9:16', platform: '抖音', size: '1080×1920' },
  { value: 'content_11', label: '内页图 1:1', platform: '通用', size: '1080×1080' },
];

const HOT_TOPICS: HotTopic[] = [
  { id: '1', title: '#春日穿搭灵感#', platform: '小红书', heat: 98520 },
  { id: '2', title: '#美食探店必去#', platform: '小红书', heat: 87650 },
  { id: '3', title: '#变美日记#', platform: '抖音', heat: 76540 },
  { id: '4', title: '#职场干货分享#', platform: '小红书', heat: 65430 },
  { id: '5', title: '#宅家美食教程#', platform: '抖音', heat: 54320 },
];

// ==================== 主组件 ====================
export default function SocialMediaGenerator() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('xiaohongshu');
  const [selectedTrack, setSelectedTrack] = useState<string>('beauty');
  const [selectedStyle, setSelectedStyle] = useState<string>('ins');
  const [selectedSize, setSelectedSize] = useState<string>('cover_34');
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showHotTopics, setShowHotTopics] = useState(false);

  // 添加标签
  const handleAddHashtag = useCallback(() => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag]);
      setNewHashtag('');
    }
  }, [newHashtag, hashtags]);

  // 删除标签
  const handleDeleteHashtag = useCallback((tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  }, [hashtags]);

  // 使用热点话题
  const handleUseHotTopic = useCallback((topic: HotTopic) => {
    if (!hashtags.includes(topic.title)) {
      setHashtags([...hashtags, topic.title]);
    }
    setShowHotTopics(false);
  }, [hashtags]);

  // 生成配图
  const handleGenerate = async () => {
    if (!noteTitle) {
      alert('请输入笔记标题');
      return;
    }

    setGenerating(true);
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newImages: GeneratedImage[] = [];
    const platforms = selectedPlatform === 'all' ? ['xiaohongshu', 'douyin'] : [selectedPlatform];
    
    platforms.forEach(platform => {
      newImages.push({
        id: `${Date.now()}_${platform}`,
        url: `https://picsum.photos/seed/${Date.now()}_${platform}/600/800`,
        platform,
        style: selectedStyle,
        size: selectedSize,
        timestamp: Date.now(),
      });
    });
    
    setGeneratedImages([...newImages, ...generatedImages]);
    setGenerating(false);
  };

  // 导出配图
  const handleDownload = useCallback((image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `配图_${image.platform}_${image.timestamp}.png`;
    link.click();
  }, []);

  const currentStyle = STYLE_PRESETS.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Camera className="w-4 h-4" />}
        toolName="小红书抖音图文配图"
        toolDescription="小红书/抖音爆款图文配图一键生成，助力博主轻松产出高质量内容"
        gradient="from-pink-500 to-purple-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 平台选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-pink-500" />
            选择发布平台
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedPlatform === platform.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <div className={`${selectedPlatform === platform.id ? 'text-pink-500' : 'text-slate-400'}`}>
                  {platform.icon}
                </div>
                <span className={`font-medium ${
                  selectedPlatform === platform.id ? 'text-pink-600' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {platform.name}
                </span>
                {selectedPlatform === platform.id && (
                  <Check className="w-5 h-5 text-pink-500 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 赛道选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            选择内容赛道
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                  selectedTrack === track.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <span className={`text-${track.color}-500`}>
                  {track.icon}
                </span>
                <span className={`text-sm ${
                  selectedTrack === track.id ? 'text-pink-600 font-medium' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {track.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 内容输入 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 text-pink-500" />
            输入笔记内容
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                笔记标题 *
              </label>
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="如：这家奶茶店也太好喝了吧！"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                核心文案（可选）
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="输入笔记的核心文案，AI会自动匹配配图风格"
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-300 focus:outline-none focus:border-pink-500 transition-colors text-sm text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>
            
            {/* 话题标签 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                添加话题标签
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                    {tag}
                    <button onClick={() => handleDeleteHashtag(tag)} className="ml-1 hover:text-pink-800">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                  placeholder="输入话题，如：#美食推荐"
                  className="flex-1"
                />
                <Button onClick={handleAddHashtag} variant="outline" className="border-pink-300 text-pink-500">
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
                <Button onClick={() => setShowHotTopics(!showHotTopics)} variant="outline" className="border-pink-300 text-pink-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  热点
                </Button>
              </div>
              
              {/* 热点话题 */}
              {showHotTopics && (
                <div className="mt-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl">
                  <h4 className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    今日热点话题
                  </h4>
                  <div className="space-y-2">
                    {HOT_TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleUseHotTopic(topic)}
                        className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{topic.title}</span>
                        <Badge variant="outline" className="text-xs">
                          <span className="text-red-500 mr-1">🔥</span>
                          {topic.heat.toLocaleString()}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 风格与尺寸 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 风格选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" />
              选择图文风格
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {style.colors.map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedStyle === style.id ? 'text-pink-600' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {style.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 尺寸选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              选择图片尺寸
            </h3>
            <div className="space-y-3">
              {IMAGE_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedSize === size.value
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-16 rounded-lg flex items-center justify-center ${
                      selectedSize === size.value ? 'bg-pink-100' : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <ImageIcon className={`w-5 h-5 ${
                        selectedSize === size.value ? 'text-pink-500' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${
                        selectedSize === size.value ? 'text-pink-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {size.label}
                      </p>
                      <p className="text-xs text-slate-500">{size.platform} · {size.size}</p>
                    </div>
                  </div>
                  {selectedSize === size.value && (
                    <Check className="w-5 h-5 text-pink-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !noteTitle}
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl text-base font-medium shadow-lg shadow-pink-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在生成爆款配图...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成爆款图文
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              生成的配图
              <Badge variant="secondary" className="ml-2">{generatedImages.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden group">
                  <img
                    src={image.url}
                    alt="生成的配图"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(image)}
                      className="p-2 bg-white rounded-full text-slate-700 hover:bg-pink-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-2 bg-white rounded-full text-slate-700 hover:bg-pink-50 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white text-xs">
                    {PLATFORMS.find(p => p.id === image.platform)?.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            爆款小技巧
          </h4>
          <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            <li>• 封面图使用3:4比例在小红书信息流中展示效果最佳</li>
            <li>• 添加热门话题标签可提升笔记曝光量</li>
            <li>• 保持账号风格统一有助于粉丝识别和留存</li>
            <li>• 干货类内容搭配简洁风格更易获得收藏</li>
          </ul>
        </div>

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录后解锁更多权益</p>
              <p className="text-xs text-slate-500">批量生成、高清无水印、商用授权</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
