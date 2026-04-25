'use client';

import { useState } from 'react';
import { Wand2, Play } from 'lucide-react';

export default function DouyinTool() {
  const [selectedStyle, setSelectedStyle] = useState('hot');
  const [title, setTitle] = useState('');

  const STYLES = [
    { id: 'hot', name: '热门', emoji: '🔥', color: 'from-red-500 to-orange-500', example: '这个技巧太绝了！' },
    { id: 'fashion', name: '时尚', emoji: '💫', color: 'from-purple-500 to-pink-500', example: '2024最火穿搭' },
    { id: 'funny', name: '搞笑', emoji: '🤣', color: 'from-yellow-500 to-amber-500', example: '笑死我了哈哈哈' },
    { id: 'food', name: '美食', emoji: '🍜', color: 'from-orange-500 to-red-500', example: '人均50吃到撑！' },
    { id: 'beauty', name: '美妆', emoji: '💄', color: 'from-pink-500 to-rose-500', example: '新手化妆教程' },
    { id: 'daily', name: '日常', emoji: '📷', color: 'from-sky-500 to-blue-500', example: '我的一天' },
  ];

  const style = STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-violet-400 to-purple-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          选择视频类型 → 输入标题 → 一键生成封面
        </p>
      </div>

      {/* 类型选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择视频类型</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {STYLES.map(s => (
            <button 
              key={s.id} 
              onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-xl border-2 ${selectedStyle === s.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{s.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 参考标题 */}
      {style && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考标题：<span className="text-violet-600">"{style.example}"</span></p>
        </div>
      )}

      {/* 标题输入 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入视频标题</p>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder={style?.example || "输入视频标题"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors" 
        />
      </div>

      {/* 预览 */}
      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">封面预览</p>
          <div className="aspect-[9/16] max-w-xs mx-auto bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative shadow-lg">
            <div className="text-5xl mb-4">{style?.emoji}</div>
            <div className="text-white text-xl font-bold">{title}</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 生成按钮 */}
      <button 
        disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' : 'bg-slate-300 text-slate-500'}`}
      >
        <Wand2 className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}
