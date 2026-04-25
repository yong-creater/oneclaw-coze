'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Sparkles, Upload, Download, Loader2, 
  Image as ImageIcon, Palette, Smile,
  Copy, Check, X, ChevronDown, Plus, 
  Heart, Eye, RefreshCw, Wand2, Zap,
  User, Shirt, Star, Sun, Moon, Sparkle,
  Camera, Type, SmilePlus, HeartHandshake,
  AlertCircle, CheckCircle2, Copy as CopyIcon
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploader } from './ImageUploader';

// ==================== 类型定义 ====================
interface AvatarStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
}

interface EmojiResult {
  id: string;
  imageUrl: string;
  style: string;
  text: string;
  type: 'avatar' | 'emoji';
}

interface GeneratedImage {
  id: string;
  url: string;
  style: string;
  prompt: string;
  timestamp: number;
}

// ==================== 常量 ====================
const AVATAR_STYLES: AvatarStyle[] = [
  { id: 'anime', name: '动漫风', description: '二次元动漫风格，可爱生动', prompt: 'anime style, cute, vibrant colors, high quality illustration', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'cartoon', name: '卡通风', description: '扁平卡通风格，简约时尚', prompt: 'cartoon style, flat design, modern illustration', icon: <Palette className="w-4 h-4" /> },
  { id: 'oil-painting', name: '油画风', description: '古典油画质感，艺术气息', prompt: 'oil painting style, classical, artistic, detailed brushstrokes', icon: <Palette className="w-4 h-4" /> },
  { id: 'watercolor', name: '水彩风', description: '清新水彩风格，柔和自然', prompt: 'watercolor style, soft, delicate, pastel colors', icon: <Palette className="w-4 h-4" /> },
  { id: 'sketch', name: '素描风', description: '手绘素描风格，真实细腻', prompt: 'pencil sketch style, detailed, realistic shading', icon: <Palette className="w-4 h-4" /> },
  { id: 'pixel', name: '像素风', description: '复古像素风格，游戏感强', prompt: 'pixel art style, 8-bit, retro game aesthetic', icon: <Palette className="w-4 h-4" /> },
  { id: 'cyberpunk', name: '赛博朋克', description: '未来科技感，炫酷潮流', prompt: 'cyberpunk style, neon lights, futuristic, glowing effects', icon: <Sparkle className="w-4 h-4" /> },
  { id: 'ink-wash', name: '水墨风', description: '东方水墨意境，诗意雅致', prompt: 'Chinese ink wash painting style, traditional, elegant', icon: <Palette className="w-4 h-4" /> },
];

const EMOJI_TEXTS = [
  '太棒了', '哈哈哈', '爱你哟', '加油', '666',
  '笑死', '点赞', '震惊', '大哭', '爱你',
  '么么哒', '委屈', '得意', '害羞', '酷',
  '赞赞赞', '发财', '好运', '冲鸭', '奥利给'
];

const AVATAR_ASPECTS = [
  { value: '1:1', label: '1:1 方形', desc: '适合头像、朋友圈', size: '1024×1024' },
  { value: '4:5', label: '4:5 竖版', desc: '适合小红书、Instagram', size: '1024×1280' },
  { value: '9:16', label: '9:16 全屏', desc: '适合手机壁纸', size: '1024×1820' },
];

const EMOTIONS = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'cool', label: '酷', emoji: '😎' },
  { value: 'cute', label: '可爱', emoji: '🥰' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'angry', label: '生气', emoji: '😤' },
  { value: 'surprised', label: '惊讶', emoji: '😲' },
  { value: 'confused', label: '疑惑', emoji: '😕' },
  { value: 'love', label: '爱心', emoji: '🥰' },
];

// ==================== 主组件 ====================
export default function AvatarEmojiGenerator() {
  const [activeTab, setActiveTab] = useState<'avatar' | 'emoji'>('avatar');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('anime');
  const [selectedAspect, setSelectedAspect] = useState<string>('1:1');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('happy');
  const [customText, setCustomText] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [historyImages, setHistoryImages] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 处理图片上传
  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
  }, []);

  // 生成头像/表情包
  const handleGenerate = async () => {
    if (activeTab === 'avatar' && !uploadedImage) {
      alert('请先上传图片');
      return;
    }
    if (activeTab === 'emoji' && !customText && selectedEmotion === 'happy') {
      alert('请输入表情文字或选择表情');
      return;
    }

    setGenerating(true);
    
    try {
      const style = AVATAR_STYLES.find(s => s.id === selectedStyle);
      const aspect = AVATAR_ASPECTS.find(a => a.value === selectedAspect);
      
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成示例图片（实际项目中会调用AI生成API）
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: uploadedImage || `https://picsum.photos/seed/${Date.now()}/400/400`,
        style: style?.name || '默认',
        prompt: style?.prompt || '',
        timestamp: Date.now(),
      };
      
      setGeneratedImages(prev => [newImage, ...prev]);
      setHistoryImages(prev => [newImage, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 下载图片
  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar_${image.style}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 复制到剪贴板
  const handleCopy = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopiedId(image.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请尝试右键保存');
    }
  };

  // 重新生成
  const handleRegenerate = async (image: GeneratedImage) => {
    setGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/seed/${Date.now() + Math.random()}/400/400`,
        style: image.style,
        prompt: image.prompt,
        timestamp: Date.now(),
      };
      setGeneratedImages(prev => prev.map(img => img.id === image.id ? newImage : img));
    } catch (error) {
      console.error('重新生成失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4" />}
        toolName="头像表情包生成"
        toolDescription="AI一键生成个性化头像和表情包"
        gradient="from-yellow-500 to-orange-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 功能Tab */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'avatar'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            头像生成
          </button>
          <button
            onClick={() => setActiveTab('emoji')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'emoji'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Smile className="w-4 h-4" />
            表情包生成
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：参数设置 */}
          <div className="space-y-6">
            {/* 图片上传 */}
            {activeTab === 'avatar' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-yellow-500" />
                  上传参考图片
                </h3>
                <ImageUploader 
                  value={uploadedImage || undefined}
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-slate-500 mt-2">
                  上传正面照片效果更佳，支持 JPG、PNG 格式
                </p>
              </div>
            )}

            {/* 表情包文字输入 */}
            {activeTab === 'emoji' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4 text-yellow-500" />
                  输入表情文字
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="输入你想要的表情文字，如：太棒了"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-center text-lg font-medium"
                  />
                  <div>
                    <p className="text-sm text-slate-500 mb-2">快捷选择</p>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_TEXTS.map((text) => (
                        <button
                          key={text}
                          onClick={() => setCustomText(text)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            customText === text
                              ? 'bg-yellow-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                          }`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">选择心情</p>
                    <div className="flex flex-wrap gap-2">
                      {EMOTIONS.map((emotion) => (
                        <button
                          key={emotion.value}
                          onClick={() => setSelectedEmotion(emotion.value)}
                          className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                            selectedEmotion === emotion.value
                              ? 'bg-yellow-500 ring-2 ring-yellow-300'
                              : 'bg-slate-100 dark:bg-slate-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                          }`}
                          title={emotion.label}
                        >
                          {emotion.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 风格选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-yellow-500" />
                选择风格
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedStyle === style.id
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white">
                      {style.icon}
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸选择 */}
            {activeTab === 'avatar' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-yellow-500" />
                  选择尺寸
                </h3>
                <div className="space-y-2">
                  {AVATAR_ASPECTS.map((aspect) => (
                    <button
                      key={aspect.value}
                      onClick={() => setSelectedAspect(aspect.value)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        selectedAspect === aspect.value
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{aspect.label}</p>
                          <p className="text-xs text-slate-500">{aspect.desc}</p>
                        </div>
                        <p className="text-xs text-slate-400">{aspect.size}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium shadow-lg shadow-yellow-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  一键生成
                </>
              )}
            </Button>

            {/* 功能说明 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                使用提示
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• 上传清晰正面照片，头像效果更佳</li>
                <li>• 多种风格可选，一键切换</li>
                <li>• 表情包支持自定义文字</li>
                <li>• 生成结果可下载或复制</li>
              </ul>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            {/* 生成预览 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-yellow-500" />
                  生成结果
                </h3>
                {generatedImages.length > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {generatedImages.length} 张
                  </Badge>
                )}
              </div>
              
              {generatedImages.length === 0 ? (
                <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-3" />
                  <p>生成结果将在此处显示</p>
                  <p className="text-xs mt-1">上传图片并选择风格后点击生成</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.style}
                        className="w-full aspect-square rounded-xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(image)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="下载"
                        >
                          <Download className="w-4 h-4 text-slate-700" />
                        </button>
                        <button
                          onClick={() => handleCopy(image)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="复制"
                        >
                          {copiedId === image.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <CopyIcon className="w-4 h-4 text-slate-700" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerate(image)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                          title="重新生成"
                        >
                          <RefreshCw className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-black/50 text-white text-xs">
                        {image.style}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 历史记录 */}
            {historyImages.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  最近生成
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {historyImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setGeneratedImages(prev => [image, ...prev.filter(i => i.id !== image.id)])}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all"
                    >
                      <img
                        src={image.url}
                        alt={image.style}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 批量生成提示 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Sparkle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white mb-1">批量生成</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    升级为会员可享受批量生成功能，一次性生成多张不同风格的头像，省时省力！
                  </p>
                </div>
              </div>
            </div>

            {/* 登录提示 */}
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
