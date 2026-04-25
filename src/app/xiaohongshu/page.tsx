'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, RefreshCw, Download, 
  Check, Sparkles, Wand2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const TEMPLATES = [
  { id: 'fashion', name: '穿搭分享', emoji: '👗', color: 'from-pink-400 to-rose-500' },
  { id: 'food', name: '美食探店', emoji: '🍜', color: 'from-amber-400 to-orange-500' },
  { id: 'travel', name: '旅行打卡', emoji: '✈️', color: 'from-sky-400 to-blue-500' },
  { id: 'beauty', name: '美妆护肤', emoji: '💄', color: 'from-purple-400 to-pink-500' },
  { id: 'life', name: '生活方式', emoji: '🌿', color: 'from-green-400 to-emerald-500' },
  { id: 'study', name: '学习成长', emoji: '📚', color: 'from-yellow-400 to-amber-500' },
];

export default function XiaohongshuPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('fashion');
  const [title, setTitle] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerate = () => {
    if (!title.trim()) return;
    setIsGenerated(true);
  };

  const handleReset = () => {
    setSelectedTemplate('fashion');
    setTitle('');
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-pink-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 模板选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            选择内容类型
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${selectedTemplate === t.id ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{t.emoji}</div>
                <div className="text-sm font-medium text-slate-800">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 内容输入 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">输入封面内容</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
              <input type="text" value={title} onChange={e => { setTitle(e.target.value); setIsGenerated(false); }}
                placeholder="例如：这件衣服也太好看了吧！"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-pink-500" />
            封面预览
          </h3>
          <div className={`aspect-[3/4] max-w-xs mx-auto bg-gradient-to-br ${template?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
            <div className="text-5xl mb-4">{template?.emoji}</div>
            <div className="text-white text-xl font-bold mb-2 drop-shadow-lg">{title || '输入标题'}</div>
            {title && <div className="text-white/80 text-sm">小红书风格</div>}
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
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}>
            <Check className="w-5 h-5" />一键生成
          </button>
        </div>

        {/* 生成成功提示 */}
        {isGenerated && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-medium">封面已生成！</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-orange-600 flex items-center gap-2 mx-auto shadow-lg">
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
