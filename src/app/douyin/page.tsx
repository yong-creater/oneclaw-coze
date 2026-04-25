'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Play, RefreshCw, Download, 
  Check, Sparkles, Wand2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const COVER_STYLES = [
  { id: 'hot', name: '热门爆款', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { id: 'fashion', name: '时尚潮流', emoji: '💫', color: 'from-purple-500 to-pink-500' },
  { id: 'funny', name: '搞笑有趣', emoji: '🤣', color: 'from-yellow-500 to-amber-500' },
  { id: 'food', name: '美食探店', emoji: '🍜', color: 'from-orange-500 to-red-500' },
  { id: 'beauty', name: '美妆教程', emoji: '💄', color: 'from-pink-500 to-rose-500' },
  { id: 'daily', name: '日常分享', emoji: '📷', color: 'from-sky-500 to-blue-500' },
];

export default function DouyinPage() {
  const [selectedStyle, setSelectedStyle] = useState('hot');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const style = COVER_STYLES.find(s => s.id === selectedStyle);

  const handleGenerate = () => {
    if (!title.trim()) return;
    setIsGenerated(true);
  };

  const handleReset = () => {
    setSelectedStyle('hot');
    setTitle('');
    setSubtitle('');
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">抖音封面</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 风格选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            选择封面风格
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {COVER_STYLES.map(s => (
              <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${selectedStyle === s.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{s.emoji}</div>
                <div className="text-sm font-medium text-slate-800">{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 内容输入 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">输入封面内容</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">视频标题</label>
              <input type="text" value={title} onChange={e => { setTitle(e.target.value); setIsGenerated(false); }}
                placeholder="例如：这个搭配绝了！"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">副标题（可选）</label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                placeholder="例如：第100件好物分享"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" />
            封面预览
          </h3>
          <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative shadow-lg">
            <div className="text-5xl mb-4">{style?.emoji}</div>
            <div className="text-white text-xl font-bold mb-2 drop-shadow-lg">{title || '输入标题'}</div>
            {subtitle && <div className="text-white/80 text-sm">{subtitle}</div>}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />重新制作
          </button>
          <button onClick={handleGenerate} disabled={!title.trim()}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
              title.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}>
            <Check className="w-5 h-5" />一键生成
          </button>
        </div>

        {/* 生成成功 */}
        {isGenerated && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-medium">封面已生成！</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 mx-auto shadow-lg">
                <Download className="w-5 h-5" />下载封面
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
