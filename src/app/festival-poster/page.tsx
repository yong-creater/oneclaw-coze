'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, PartyPopper, RefreshCw, Download, 
  Check, ChevronRight, Sparkles, Share2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const FESTIVALS = [
  { id: 'duanwu', name: '端午节', emoji: '🐉', color: 'from-green-400 to-emerald-500' },
  { id: 'midautumn', name: '中秋节', emoji: '🥮', color: 'from-yellow-400 to-orange-500' },
  { id: 'spring', name: '春节', emoji: '🧧', color: 'from-red-400 to-rose-500' },
  { id: 'national', name: '国庆节', emoji: '🇨🇳', color: 'from-red-500 to-yellow-500' },
  { id: 'newyear', name: '元旦', emoji: '🎆', color: 'from-purple-400 to-pink-500' },
  { id: 'valentine', name: '情人节', emoji: '💕', color: 'from-pink-400 to-rose-500' },
];

const TEMPLATES = [
  { id: 'classic', name: '经典红色', bg: 'bg-gradient-to-br from-red-500 to-orange-500' },
  { id: 'modern', name: '现代简约', bg: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  { id: 'fresh', name: '清新自然', bg: 'bg-gradient-to-br from-green-400 to-teal-500' },
  { id: 'golden', name: '金碧辉煌', bg: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
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

export default function FestivalPosterPage() {
  const [step, setStep] = useState<'festival' | 'template' | 'result'>('festival');
  const [selectedFestival, setSelectedFestival] = useState('duanwu');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [customText, setCustomText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const festival = FESTIVALS.find(f => f.id === selectedFestival);
  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerate = () => {
    setStep('result');
    setToast('海报生成成功！');
  };

  const handleReset = () => {
    setSelectedFestival('duanwu');
    setSelectedTemplate('classic');
    setCustomText('');
    setStep('festival');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">节日海报</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-center gap-4 mb-8">
          {['选择节日', '选择模板', '生成海报'].map((label, idx) => {
            const steps = ['festival', 'template', 'result'];
            const s = steps[idx];
            const isActive = step === s;
            const isDone = steps.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {step === 'festival' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择节日</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {FESTIVALS.map(f => (
                  <button key={f.id} onClick={() => setSelectedFestival(f.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedFestival === f.id ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>{f.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{f.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setStep('template')} className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold">
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择模板风格</h3>
              <div className="grid grid-cols-4 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-full h-16 rounded-lg ${t.bg} mb-2`} />
                    <div className="text-sm font-medium text-slate-800">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">自定义祝福语</h3>
              <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
                placeholder={`例如：${festival?.name}快乐！`}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400" />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">海报预览</h3>
              <div className={`aspect-[3/4] max-w-xs mx-auto ${template?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center`}>
                <div className="text-5xl mb-4">{festival?.emoji}</div>
                <div className="text-white text-2xl font-bold mb-2">{festival?.name}</div>
                <div className="text-white text-lg">{customText || '节日快乐！'}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setStep('festival')} className="px-6 py-3 bg-white border border-slate-200 rounded-xl">上一步</button>
              <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold">
                生成海报
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
              <div className={`aspect-[3/4] max-w-xs mx-auto ${template?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center relative shadow-xl`}>
                <div className="text-5xl mb-4">{festival?.emoji}</div>
                <div className="text-white text-2xl font-bold mb-2">{festival?.name}</div>
                <div className="text-white text-lg">{customText || '节日快乐！'}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新制作
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />下载海报
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
