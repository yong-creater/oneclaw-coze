'use client';

import { useState } from 'react';
import { Wand2, Play } from 'lucide-react';

export default function XiaohongshuTool() {
  const [selectedTemplate, setSelectedTemplate] = useState('fashion');
  const [title, setTitle] = useState('');

  const TEMPLATES = [
    { id: 'fashion', name: '穿搭', emoji: '👗', color: 'from-pink-400 to-rose-500', example: '这件衣服也太好看了吧！' },
    { id: 'food', name: '美食', emoji: '🍜', color: 'from-amber-400 to-orange-500', example: '这家店绝了！' },
    { id: 'travel', name: '旅行', emoji: '✈️', color: 'from-sky-400 to-blue-500', example: '云南7天6夜攻略' },
    { id: 'beauty', name: '美妆', emoji: '💄', color: 'from-purple-400 to-pink-500', example: '敏感肌护肤品分享' },
    { id: 'life', name: '生活', emoji: '🏠', color: 'from-green-400 to-emerald-500', example: '小户型收纳技巧' },
    { id: 'study', name: '干货', emoji: '📚', color: 'from-yellow-400 to-amber-500', example: '高效学习方法' },
  ];

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-red-400 to-orange-500 rounded-xl p-4">
        <p className="text-sm text-white/90">
          <span className="font-semibold">使用提示：</span>
          选择内容类型 → 输入标题 → 一键生成封面
        </p>
      </div>

      {/* 类型选择 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">选择内容类型</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {TEMPLATES.map(t => (
            <button 
              key={t.id} 
              onClick={() => setSelectedTemplate(t.id)}
              className={`p-3 rounded-xl border-2 ${selectedTemplate === t.id ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2 text-xl`}>{t.emoji}</div>
              <div className="text-xs font-medium text-slate-800">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 参考标题 */}
      {template && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600">参考标题：<span className="text-red-600">"{template.example}"</span></p>
        </div>
      )}

      {/* 标题输入 */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <p className="font-medium text-slate-800 mb-3">输入标题</p>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder={template?.example || "输入你的标题"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors" 
        />
      </div>

      {/* 预览 */}
      {title && (
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="font-medium text-slate-800 mb-3">封面预览</p>
          <div className={`aspect-square max-w-xs mx-auto bg-gradient-to-br ${template?.color} rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg`}>
            <div className="text-5xl mb-4">{template?.emoji}</div>
            <div className="text-white text-xl font-bold">{title}</div>
          </div>
        </div>
      )}

      {/* 生成按钮 */}
      <button 
        disabled={!title.trim()}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg ${title.trim() ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}
      >
        <Wand2 className="w-5 h-5" />一键生成封面
      </button>
    </div>
  );
}
