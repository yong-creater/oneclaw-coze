'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, PartyPopper, RefreshCw, Download, 
  Check, Sparkles, Wand2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const FESTIVALS = [
  { id: 'duanwu', name: '端午节', emoji: '🐉', color: 'from-green-500 to-emerald-600' },
  { id: 'midautumn', name: '中秋节', emoji: '🥮', color: 'from-yellow-500 to-orange-500' },
  { id: 'spring', name: '春节', emoji: '🧧', color: 'from-red-500 to-rose-600' },
  { id: 'national', name: '国庆节', emoji: '🇨🇳', color: 'from-red-600 to-yellow-500' },
  { id: 'newyear', name: '元旦', emoji: '🎆', color: 'from-purple-500 to-pink-500' },
  { id: 'valentine', name: '情人节', emoji: '💕', color: 'from-pink-500 to-rose-500' },
];

const TEMPLATES = [
  { id: 'classic', name: '经典红色', bg: 'bg-gradient-to-br from-red-500 to-orange-500' },
  { id: 'modern', name: '现代简约', bg: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  { id: 'fresh', name: '清新自然', bg: 'bg-gradient-to-br from-green-400 to-teal-500' },
  { id: 'golden', name: '金碧辉煌', bg: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
];

export default function FestivalPosterPage() {
  const [selectedFestival, setSelectedFestival] = useState('duanwu');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [customText, setCustomText] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const festival = FESTIVALS.find(f => f.id === selectedFestival);
  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  const handleReset = () => {
    setSelectedFestival('duanwu');
    setSelectedTemplate('classic');
    setCustomText('');
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 节日选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            选择节日
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {FESTIVALS.map(f => (
              <button key={f.id} onClick={() => setSelectedFestival(f.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${selectedFestival === f.id ? 'border-red-500 bg-red-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>{f.emoji}</div>
                <div className="text-sm font-medium text-slate-800">{f.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 模板选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">选择模板风格</h3>
          <div className="grid grid-cols-4 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedTemplate === t.id ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-full h-12 rounded-lg ${t.bg} mb-2`} />
                <div className="text-sm font-medium text-slate-800">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义祝福语 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">自定义祝福语</h3>
          <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
            placeholder={`例如：${festival?.name}快乐！`}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors" />
        </div>

        {/* 预览 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-red-500" />
            海报预览
          </h3>
          <div className={`aspect-[3/4] max-w-xs mx-auto ${template?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
            <div className="text-6xl mb-4">{festival?.emoji}</div>
            <div className="text-white text-2xl font-bold mb-2 drop-shadow-lg">{festival?.name}</div>
            <div className="text-white/90 text-lg">{customText || '节日快乐！'}</div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />重新制作
          </button>
          <button onClick={handleGenerate}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <Check className="w-5 h-5" />一键生成
          </button>
        </div>

        {/* 生成成功 */}
        {isGenerated && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-medium">海报已生成！</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 flex items-center gap-2 mx-auto shadow-lg">
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
