'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';

export default function FestivalPosterTool() {
  const [selectedFestival, setSelectedFestival] = useState('duanwu');
  const [customText, setCustomText] = useState('');

  const FESTIVALS = [
    { id: 'duanwu', name: '端午', emoji: '🐉', color: 'from-green-500 to-emerald-600', example: '端午安康', month: '6月' },
    { id: 'midautumn', name: '中秋', emoji: '🥮', color: 'from-yellow-500 to-orange-500', example: '月圆人团圆', month: '9月' },
    { id: 'spring', name: '春节', emoji: '🧧', color: 'from-red-500 to-rose-600', example: '新年快乐', month: '1月' },
    { id: 'national', name: '国庆', emoji: '🇨🇳', color: 'from-red-600 to-yellow-500', example: '欢度国庆', month: '10月' },
    { id: 'newyear', name: '元旦', emoji: '🎆', color: 'from-purple-500 to-pink-500', example: '新年新气象', month: '1月' },
    { id: 'valentine', name: '情人', emoji: '💕', color: 'from-pink-500 to-rose-500', example: '爱你如初', month: '2月' },
  ];

  const festival = FESTIVALS.find(f => f.id === selectedFestival);

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          选择节日 → 输入祝福语 → 一键生成海报
        </p>
      </div>

      {/* 节日选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择节日</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FESTIVALS.map(f => (
            <button 
              key={f.id} 
              onClick={() => setSelectedFestival(f.id)}
              className={`p-3 rounded-xl border-2 ${selectedFestival === f.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>{f.emoji}</div>
              <div className="text-sm font-medium text-slate-800">{f.name}</div>
              <div className="text-xs text-slate-400">{f.month}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 参考祝福 */}
      {festival && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考祝福：<span className="text-rose-600">"{festival.example}"</span></p>
        </div>
      )}

      {/* 祝福语输入 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入祝福语</p>
        <input 
          type="text" 
          value={customText} 
          onChange={e => setCustomText(e.target.value)}
          placeholder={festival?.example || "输入祝福语"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 transition-colors" 
        />
      </div>

      {/* 预览 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">海报预览</p>
        <div className={`aspect-[3/4] max-w-xs mx-auto bg-gradient-to-br ${festival?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
          <div className="text-6xl mb-4">{festival?.emoji}</div>
          <div className="text-white text-2xl font-bold">{festival?.name}</div>
          <div className="text-white/90 text-lg mt-2">{customText || festival?.example}</div>
        </div>
      </div>

      {/* 生成按钮 */}
      <button className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg">
        <Wand2 className="w-5 h-5" />一键生成海报
      </button>
    </div>
  );
}
