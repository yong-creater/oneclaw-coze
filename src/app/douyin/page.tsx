'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Play, RefreshCw, Download, 
  Check, ChevronRight, Sparkles, Share2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const COVER_STYLES = [
  { id: 'hot', name: '热门爆款', emoji: '🔥', color: 'from-red-100 to-orange-200' },
  { id: 'fashion', name: '时尚潮流', emoji: '💫', color: 'from-purple-100 to-pink-200' },
  { id: 'funny', name: '搞笑有趣', emoji: '🤣', color: 'from-yellow-100 to-amber-200' },
  { id: 'food', name: '美食探店', emoji: '🍜', color: 'from-orange-100 to-red-200' },
  { id: 'beauty', name: '美妆教程', emoji: '💄', color: 'from-pink-100 to-rose-200' },
  { id: 'daily', name: '日常分享', emoji: '📷', color: 'from-sky-100 to-blue-200' },
];

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

export default function DouyinPage() {
  const [step, setStep] = useState<'style' | 'content' | 'result'>('style');
  const [selectedStyle, setSelectedStyle] = useState('hot');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const style = COVER_STYLES.find(s => s.id === selectedStyle);

  const handleGenerate = () => {
    if (!title.trim()) { setToast('请输入视频标题'); return; }
    setStep('result');
    setToast('封面生成成功！');
  };

  const handleReset = () => {
    setSelectedStyle('hot');
    setTitle('');
    setSubtitle('');
    setStep('style');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-center gap-4 mb-8">
          {['选择风格', '输入内容', '生成封面'].map((label, idx) => {
            const steps = ['style', 'content', 'result'];
            const s = steps[idx];
            const isActive = step === s;
            const isDone = steps.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {step === 'style' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择封面风格</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {COVER_STYLES.map(s => (
                  <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedStyle === s.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{s.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center">
              <button onClick={() => setStep('content')} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold">
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">输入封面内容</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">视频标题</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="例如：这个搭配绝了！"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">副标题</label>
                  <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                    placeholder="例如：第100件好物分享"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">封面预览</h3>
              <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl mb-4">{style?.emoji}</div>
                <div className="text-white text-xl font-bold mb-2">{title || '输入标题'}</div>
                {subtitle && <div className="text-white text-sm opacity-80">{subtitle}</div>}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setStep('style')} className="px-6 py-3 bg-white border border-slate-200 rounded-xl">上一步</button>
              <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold">生成封面</button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
              <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative shadow-xl">
                <div className="text-4xl mb-4">{style?.emoji}</div>
                <div className="text-white text-xl font-bold mb-2">{title}</div>
                {subtitle && <div className="text-white text-sm opacity-80">{subtitle}</div>}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新制作
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2">
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
