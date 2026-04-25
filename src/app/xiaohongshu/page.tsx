'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, RefreshCw, Download, 
  Check, ChevronRight, Upload, Sparkles
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const TEMPLATES = [
  { id: 'fashion', name: '穿搭分享', color: 'from-pink-100 to-rose-200', emoji: '👗' },
  { id: 'food', name: '美食探店', color: 'from-amber-100 to-orange-200', emoji: '🍜' },
  { id: 'travel', name: '旅行打卡', color: 'from-sky-100 to-blue-200', emoji: '✈️' },
  { id: 'beauty', name: '美妆护肤', color: 'from-purple-100 to-pink-200', emoji: '💄' },
  { id: 'life', name: '生活方式', color: 'from-green-100 to-emerald-200', emoji: '🌿' },
  { id: 'study', name: '学习成长', color: 'from-yellow-100 to-amber-200', emoji: '📚' },
];

const COLORS = [
  { id: 'pink', bg: 'bg-gradient-to-br from-pink-400 to-rose-500', text: 'text-white' },
  { id: 'orange', bg: 'bg-gradient-to-br from-orange-400 to-amber-500', text: 'text-white' },
  { id: 'blue', bg: 'bg-gradient-to-br from-blue-400 to-indigo-500', text: 'text-white' },
  { id: 'green', bg: 'bg-gradient-to-br from-green-400 to-emerald-500', text: 'text-white' },
  { id: 'purple', bg: 'bg-gradient-to-br from-purple-400 to-pink-500', text: 'text-white' },
  { id: 'black', bg: 'bg-slate-900', text: 'text-white' },
];

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

export default function XiaohongshuPage() {
  const [step, setStep] = useState<'style' | 'content' | 'result'>('style');
  const [selectedTemplate, setSelectedTemplate] = useState('fashion');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const template = TEMPLATES.find(t => t.id === selectedTemplate);
  const color = COLORS.find(c => c.id === selectedColor);

  const handleGenerate = () => {
    if (!title.trim()) {
      setToast('请输入标题');
      return;
    }
    setStep('result');
    setToast('封面生成成功！');
  };

  const handleReset = () => {
    setSelectedTemplate('fashion');
    setSelectedColor('pink');
    setTitle('');
    setContent('');
    setStep('style');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">小红书配图</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* 步骤 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['选择模板', '输入内容', '生成封面'].map((label, idx) => {
            const steps = ['style', 'content', 'result'];
            const s = steps[idx];
            const isActive = step === s;
            const isDone = steps.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 选择模板 */}
        {step === 'style' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择内容类型</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{t.emoji}</div>
                    <div className="text-sm font-medium text-slate-800">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择封面颜色</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {COLORS.map(c => (
                  <button key={c.id} onClick={() => setSelectedColor(c.id)}
                    className={`h-12 rounded-xl ${c.bg} ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-pink-500' : ''} transition-all`} />
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setStep('content')}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-orange-600 transition-all">
                下一步
              </button>
            </div>
          </div>
        )}

        {/* 步骤2: 输入内容 */}
        {step === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">输入封面内容</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="例如：这件衣服也太好看了吧！"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">副标题（可选）</label>
                  <input type="text" value={content} onChange={e => setContent(e.target.value)}
                    placeholder="例如：附穿搭链接"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
                </div>
              </div>
            </div>

            {/* 预览 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">封面预览</h3>
              <div className={`aspect-[3/4] max-w-xs mx-auto ${color?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center`}>
                <div className="text-4xl mb-4">{template?.emoji}</div>
                <div className={`${color?.text} text-xl font-bold mb-2`}>{title || '输入标题'}</div>
                {content && <div className={`${color?.text} text-sm opacity-80`}>{content}</div>}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setStep('style')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                上一步
              </button>
              <button onClick={handleGenerate}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-orange-600">
                生成封面
              </button>
            </div>
          </div>
        )}

        {/* 步骤3: 结果 */}
        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
              <div className={`aspect-[3/4] max-w-xs mx-auto ${color?.bg} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
                <div className="text-4xl mb-4">{template?.emoji}</div>
                <div className={`${color?.text} text-xl font-bold mb-2`}>{title}</div>
                {content && <div className={`${color?.text} text-sm opacity-80`}>{content}</div>}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新制作
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-orange-600 flex items-center gap-2">
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
