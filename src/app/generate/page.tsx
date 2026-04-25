'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Image as ImageIcon, Wand2, Upload, Download, 
  Loader2, Check, Sparkles, RefreshCw, Grid3X3, 
  Crown, Copy, ThumbsUp, Clock, ChevronRight
} from 'lucide-react';
import Footer from '@/components/common/Footer';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

// 文生图功能
function TextToImage({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [count, setCount] = useState(1);
  const [style, setStyle] = useState('auto');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const sizes = [
    { id: '1024x1024', name: '1:1', desc: '正方形' },
    { id: '1024x1792', name: '9:16', desc: '竖版' },
    { id: '1792x1024', name: '16:9', desc: '横版' },
    { id: '1536x1024', name: '3:2', desc: '横版' },
  ];

  const styles = [
    { id: 'auto', name: '自动' },
    { id: 'realistic', name: '写实' },
    { id: 'anime', name: '动漫' },
    { id: 'oil', name: '油画' },
    { id: 'watercolor', name: '水彩' },
    { id: 'digital', name: '数字艺术' },
  ];

  const presets = [
    '一个穿汉服的美女，精致五官，古典园林背景，柔和光线',
    '未来城市天际线，赛博朋克风格，霓虹灯光，科幻建筑',
    '可爱的小狗在草地上奔跑，阳光明媚，春天气息',
    '一杯精致的拿铁咖啡，旁边放着马卡龙，温馨咖啡馆',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) { setToast('请输入图片描述'); return; }
    setGenerating(true);
    setToast('AI创作中...');
    await new Promise(r => setTimeout(r, 3000));
    // 模拟生成结果
    const mockResults = Array(count).fill('https://picsum.photos/1024/1024?' + Date.now());
    setResults(mockResults);
    setGenerating(false);
    setToast('生成成功！');
  };

  const handleUsePreset = (preset: string) => {
    setPrompt(preset);
    setToast('已应用提示词');
  };

  const handleReset = () => {
    setPrompt('');
    setNegativePrompt('');
    setResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">文生图创作</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：参数设置 */}
        <div className="space-y-4">
          {/* 提示词输入 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">图片描述</h3>
              <button 
                onClick={() => setPrompt('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                清空
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的图片..."
              className="w-full h-32 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-400 resize-none text-sm"
            />
            
            {/* 提示词模板 */}
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-2">快速模板：</p>
              <div className="flex flex-wrap gap-2">
                {presets.slice(0, 2).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUsePreset(preset)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {preset.slice(0, 15)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 反向提示词 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">反向提示词 <span className="text-xs text-slate-400 font-normal">(可选)</span></h3>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="描述不想出现在图片中的内容..."
              className="w-full h-20 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-400 resize-none text-sm"
            />
          </div>

          {/* 尺寸和数量 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">图片尺寸</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.id)}
                      className={`p-3 rounded-xl border-2 text-center ${
                        size === s.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">生成数量</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium ${
                        count === n ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">免费用户最多2张</p>
              </div>
            </div>
          </div>

          {/* 风格选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">生成风格</h3>
            <div className="flex flex-wrap gap-2">
              {styles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    style === s.id ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleReset} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              重新创作
            </button>
            <button 
              onClick={handleGenerate} 
              disabled={generating || !prompt.trim()}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? '创作中...' : '开始生成'}
            </button>
          </div>
        </div>

        {/* 右侧：生成结果 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">生成结果</h3>
              {results.length > 0 && (
                <span className="text-sm text-slate-500">{results.length} 张图片</span>
              )}
            </div>
            
            {results.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-pink-400" />
                </div>
                <p className="text-slate-500">输入描述后点击生成</p>
                <p className="text-xs text-slate-400 mt-1">AI将为您创作独特的图片</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden">
                    <img src={img} alt={`生成图片 ${idx + 1}`} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">今日剩余次数</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: '66%' }} />
                </div>
                <span className="font-medium">2/3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 图生图功能
function ImageToImage({ onBack }: { onBack: () => void }) {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('anime');
  const [strength, setStrength] = useState(50);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'anime', name: '照片转动漫', color: 'from-pink-400 to-rose-400' },
    { id: 'oil', name: '转油画', color: 'from-amber-400 to-orange-400' },
    { id: 'sketch', name: '转素描', color: 'from-slate-400 to-gray-400' },
    { id: 'watercolor', name: '转水彩', color: 'from-sky-400 to-blue-400' },
    { id: '3d', name: '3D渲染', color: 'from-violet-400 to-purple-400' },
    { id: 'cyberpunk', name: '赛博朋克', color: 'from-cyan-400 to-blue-400' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourceImage(ev.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) { setToast('请先上传参考图片'); return; }
    setGenerating(true);
    setToast('风格转换中...');
    await new Promise(r => setTimeout(r, 2500));
    setResult(sourceImage);
    setGenerating(false);
    setToast('转换完成！');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">图生图风格转换</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：上传和参数 */}
        <div className="space-y-4">
          {/* 原图上传 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 transition-all relative overflow-hidden bg-slate-50 dark:bg-slate-800"
          >
            {sourceImage ? (
              <>
                <img src={sourceImage} alt="原图" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="px-4 py-2 bg-white rounded-xl text-sm">点击更换图片</span>
                </div>
              </>
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">上传参考图片</h3>
                <p className="text-sm text-slate-500">保持主体，转换风格</p>
              </>
            )}
          </div>

          {/* 风格选择 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">转换风格</h3>
            <div className="grid grid-cols-3 gap-3">
              {styles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    style === s.id ? 'border-violet-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} mx-auto mb-2`} />
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 强度调节 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">转换强度</h3>
              <span className="text-sm text-violet-500 font-medium">{strength}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>保留原图更多</span>
              <span>风格变化更大</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleGenerate} 
              disabled={!sourceImage || generating}
              className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? '转换中...' : '开始转换'}
            </button>
            {result && (
              <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                下载结果
              </button>
            )}
          </div>
        </div>

        {/* 右侧：结果预览 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 h-full">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">转换结果</h3>
            {result ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={result} alt="结果" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <Grid3X3 className="w-10 h-10 text-violet-400" />
                </div>
                <p className="text-slate-500">上传图片后开始转换</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">今日剩余次数</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: '50%' }} />
                </div>
                <span className="font-medium">1/2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState<'text2img' | 'img2img'>('text2img');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">AI创意生成</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">今日剩余次数：</span>
            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium">8次</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* 功能切换 */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('text2img')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'text2img' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              文生图
            </div>
          </button>
          <button
            onClick={() => setActiveTab('img2img')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'img2img' 
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              图生图
            </div>
          </button>
        </div>

        {/* 功能内容 */}
        {activeTab === 'text2img' ? (
          <TextToImage onBack={() => {}} />
        ) : (
          <ImageToImage onBack={() => {}} />
        )}

        {/* VIP推广 */}
        <div className="mt-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">开通VIP会员</h3>
              <p className="text-sm opacity-80">无限次生成，更多高清尺寸，高级风格模板</p>
            </div>
            <button className="px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors flex items-center gap-2">
              <Crown className="w-5 h-5" />
              立即开通
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
