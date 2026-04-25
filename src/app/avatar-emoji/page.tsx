'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Wand2, RefreshCw, Download, 
  Check, Sparkles, Heart, Share2, Copy,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import AnimatedLobster from '@/components/common/AnimatedLobster';
import Footer from '@/components/common/Footer';

// 头像风格
const AVATAR_STYLES = [
  { id: 'cartoon', name: '卡通头像', emoji: '🎨', desc: '可爱卡通风格' },
  { id: 'anime', name: '动漫头像', emoji: '✨', desc: '日漫风格' },
  { id: 'pixel', name: '像素头像', emoji: '👾', desc: '复古像素风' },
  { id: '3d', name: '3D头像', emoji: '🎭', desc: '立体3D风格' },
  { id: 'oil', name: '油画头像', emoji: '🖼️', desc: '艺术油画风' },
  { id: 'sketch', name: '素描头像', emoji: '✏️', desc: '手绘素描风' },
];

// 表情包风格
const EMOJI_STYLES = [
  { id: 'happy', name: '开心', emoji: '😊' },
  { id: 'sad', name: '难过', emoji: '😢' },
  { id: 'angry', name: '生气', emoji: '😠' },
  { id: 'surprised', name: '惊讶', emoji: '😲' },
  { id: 'cool', name: '耍酷', emoji: '😎' },
  { id: 'cute', name: '卖萌', emoji: '🥰' },
];

// Toast
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function AvatarEmojiPage() {
  const [step, setStep] = useState<'upload' | 'style' | 'result'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('cartoon');
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setStep('style');
    }
  };

  // 处理上传区域点击
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setStep('style');
    }
  };

  // 切换表情包选中
  const toggleEmoji = (emojiId: string) => {
    setSelectedEmojis(prev => {
      if (prev.includes(emojiId)) {
        return prev.filter(id => id !== emojiId);
      }
      if (prev.length >= 6) {
        setToast('最多选择6个表情');
        return prev;
      }
      return [...prev, emojiId];
    });
  };

  // 生成头像
  const handleGenerate = () => {
    if (!uploadedImage) return;
    
    setIsGenerating(true);
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
      // 生成示例结果
      const results = [
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${selectedStyle === 'cartoon' ? '#FFB6C1' : '#87CEEB'}" width="300" height="300" rx="50"/><circle fill="#FFD700" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="48">${selectedStyle === 'cartoon' ? '🎨' : '✨'}</text></svg>`)}`,
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${selectedStyle === 'anime' ? '#FF69B4' : '#DDA0DD'}" width="300" height="300" rx="50"/><circle fill="#FFB6C1" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="48">✨</text></svg>`)}`,
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${selectedStyle === 'pixel' ? '#32CD32' : '#9370DB'}" width="300" height="300" rx="50"/><circle fill="#FFD700" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="48">👾</text></svg>`)}`,
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${selectedStyle === '3d' ? '#4169E1' : '#00CED1'}" width="300" height="300" rx="50"/><circle fill="#FFA500" cx="150" cy="120" r="60"/><text x="150" y="250" text-anchor="middle" font-size="48">🎭</text></svg>`)}`,
      ];
      setGeneratedAvatars(results);
      setStep('result');
      setToast('头像生成成功！');
    }, 2000);
  };

  // 重新上传
  const handleReset = () => {
    setUploadedImage(null);
    setSelectedStyle('cartoon');
    setSelectedEmojis([]);
    setGeneratedAvatars([]);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">AI头像表情包</span>
          </div>
          
          <div className="w-20" />
        </div>
      </header>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['上传照片', '选择风格', '生成结果'].map((label, idx) => {
            const stepKey = ['upload', 'style', 'result'][idx];
            const isActive = step === stepKey;
            const isCompleted = 
              (step === 'style' && stepKey === 'upload') ||
              (step === 'result' && (stepKey === 'upload' || stepKey === 'style'));
            
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted 
                    ? 'bg-green-500 text-white'
                    : isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                  {label}
                </span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 上传照片 */}
        {step === 'upload' && (
          <div className="max-w-md mx-auto">
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传照片</h3>
              <p className="text-sm text-slate-500 mb-4">
                点击或拖拽照片到此处上传
              </p>
              <p className="text-xs text-slate-400">
                支持 JPG、PNG 格式，建议正面清晰照片
              </p>
            </div>

            {/* 示例图片 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 mb-3">没有照片？试试示例</p>
              <div className="flex items-center justify-center gap-3">
                {['😀', '😎', '🤗', '🥳'].map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUploadedImage(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle fill="#FFE4E1" cx="100" cy="100" r="100"/><text x="100" y="140" text-anchor="middle" font-size="100">${emoji}</text></svg>`)}`);
                      setStep('style');
                    }}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl hover:border-orange-400 hover:scale-110 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 步骤2: 选择风格 */}
        {step === 'style' && (
          <div className="space-y-6">
            {/* 预览上传的图片 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-6">
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="上传的照片"
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">已上传照片</h3>
                  <p className="text-sm text-slate-500 mb-3">选择喜欢的风格进行生成</p>
                  <button
                    onClick={handleReset}
                    className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    重新上传
                  </button>
                </div>
              </div>
            </div>

            {/* 头像风格选择 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择头像风格</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {AVATAR_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{style.name}</div>
                    <div className="text-xs text-slate-400">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 表情包选择 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">
                选择表情包风格（可选，最多6个）
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {EMOJI_STYLES.map(emoji => (
                  <button
                    key={emoji.id}
                    onClick={() => toggleEmoji(emoji.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedEmojis.includes(emoji.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{emoji.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{emoji.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="text-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    开始生成
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 步骤3: 生成结果 */}
        {step === 'result' && (
          <div className="space-y-6">
            {/* 结果展示 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">生成结果</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedAvatars.map((avatar, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={avatar}
                      alt={`生成的头像 ${idx + 1}`}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100">
                        <Download className="w-5 h-5 text-slate-600" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100">
                        <Share2 className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                重新生成
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />
                下载全部
              </button>
            </div>

            {/* 提示 */}
            <p className="text-center text-sm text-slate-400">
              生成的头像可免费商用，欢迎分享给朋友
            </p>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
