'use client';

import { useState, useRef, useEffect } from 'react';
import LowPolyAvatar from './LowPolyAvatar';
import html2canvas from 'html2canvas';

interface Personality {
  id: string;
  name: string;
  english: string;
  tagline: string;
  color: string;
  bgColor: string;
  description: string;
}

interface SharePosterProps {
  personality: Personality;
}

export default function SharePoster({ personality }: SharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // 生成海报图片
  const generatePoster = async () => {
    if (!posterRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // 300DPI
        useCORS: true,
        backgroundColor: '#F8FAFC',
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png', 1.0);
      setPosterUrl(url);
      setIsSaved(true);
    } catch (error) {
      console.error('海报生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 保存图片
  const saveImage = () => {
    if (!posterUrl) return;
    
    const link = document.createElement('a');
    link.download = `SBTI-${personality.name}-人格.png`;
    link.href = posterUrl;
    link.click();
  };
  
  // 分享到微信（复制链接）
  const shareToWechat = () => {
    const shareUrl = `${window.location.origin}/sbti`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('测试链接已复制！打开微信粘贴分享给朋友吧~');
    }).catch(() => {
      alert('链接：' + shareUrl);
    });
  };
  
  // 页面加载时自动生成
  useEffect(() => {
    if (posterRef.current && !posterUrl) {
      generatePoster();
    }
  }, []);
  
  return (
    <div className="space-y-4">
      {/* 海报预览容器 */}
      <div 
        ref={posterRef}
        className="bg-[#F8FAFC] rounded-2xl overflow-hidden shadow-2xl mx-auto"
        style={{ width: '360px' }}
      >
        {/* 海报内容 - 9:16竖版 */}
        <div className="relative" style={{ aspectRatio: '9/16' }}>
          {/* 顶部标题区 */}
          <div className="absolute top-0 left-0 right-0 p-6 text-center">
            <div className="text-3xl font-bold text-slate-800 mb-1">SBTI人格</div>
            <div className="text-xs tracking-[0.3em] text-slate-500">SBTI HIDDEN PERSONALITY</div>
          </div>
          
          {/* 引导语 */}
          <div className="absolute top-24 left-0 right-0 text-center">
            <div className="text-sm text-slate-500">你的人格类型是：</div>
          </div>
          
          {/* 人格类型名 */}
          <div className="absolute top-32 left-0 right-0 text-center">
            <div 
              className="text-6xl font-bold mb-2"
              style={{ color: personality.color }}
            >
              {personality.name}
            </div>
            <div className="text-2xl font-mono text-slate-400 font-bold">
              {personality.english}
            </div>
          </div>
          
          {/* Low Poly头像 */}
          <div className="absolute top-56 left-0 right-0 flex justify-center">
            <LowPolyAvatar type={personality.id} size={180} />
          </div>
          
          {/* 话术 */}
          <div className="absolute top-[85%] left-0 right-0 text-center px-6">
            <div 
              className="inline-block px-4 py-3 rounded-2xl text-base font-medium mb-3"
              style={{ 
                backgroundColor: personality.bgColor,
                color: personality.color
              }}
            >
              💬 {personality.tagline}
            </div>
            <p className="text-sm text-slate-500">{personality.description}</p>
          </div>
          
          {/* 二维码区域 */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-white rounded grid grid-cols-5 grid-rows-5 gap-px p-1">
                {/* 模拟二维码 */}
                {Array.from({ length: 25 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400">扫码测试你的隐藏人格</div>
          </div>
          
          {/* 右下角反馈按钮 */}
          <div className="absolute bottom-6 right-4">
            <button className="text-xs text-slate-400 underline">
              投诉反馈
            </button>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="space-y-3">
        {isGenerating ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>生成海报中...</span>
            </div>
          </div>
        ) : posterUrl ? (
          <>
            <button
              onClick={saveImage}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">📥</span>
              <span>保存图片到本地</span>
            </button>
            
            <button
              onClick={shareToWechat}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">💬</span>
              <span>分享到微信</span>
            </button>
          </>
        ) : (
          <button
            onClick={generatePoster}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            生成海报
          </button>
        )}
      </div>
      
      {/* 提示 */}
      <div className="text-center text-slate-500 text-xs space-y-1">
        <p>💡 保存图片后可分享到朋友圈、小红书</p>
        <p>🎨 海报为 300DPI 高清版本，可直接打印</p>
      </div>
    </div>
  );
}
