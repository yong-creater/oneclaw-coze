'use client';

import { memo, useState, useCallback } from 'react';

interface AnimatedLobsterProps {
  size?: number;
  className?: string;
}

// 动画龙虾组件 - 更逼真的设计 + 有趣交互
export const AnimatedLobster = memo(function AnimatedLobster({ 
  size = 48, 
  className = '' 
}: AnimatedLobsterProps) {
  const [isExcited, setIsExcited] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showMessage, setShowMessage] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  // 有趣的消息
  const funMessages = [
    '🦞 咔嚓！',
    '🫧 噗噜噗噜~',
    '✨ 我是一只快乐的龙虾！',
    '🦞 钳钳爱你~',
    '💨 游走了又游回来~',
    '🔥 我很辣的！',
    '🦞 咱们去吃火锅吧！',
    '👑 我可是海鲜之王',
    '💪 我的钳子超有力！',
    '🌊 海底世界真美丽~',
  ];

  // 粒子emoji
  const particleEmojis = ['🫧', '✨', '🦞', '💝', '🌊', '⭐', '💫', '🦀'];

  // 点击处理
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // 增加点击次数
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // 触发兴奋状态
    setIsExcited(true);
    setTimeout(() => setIsExcited(false), 600);
    
    // 显示随机消息
    const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
    setShowMessage(randomMessage);
    setTimeout(() => setShowMessage(''), 1500);
    
    // 生成粒子效果
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.width / 2,
      y: rect.height / 2,
      emoji: particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    // 清理粒子
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);

    // 连续点击彩蛋
    if (newCount >= 10) {
      setShowMessage('🎉 你已经点了' + newCount + '次！太爱我了！');
      setTimeout(() => setShowMessage(''), 2000);
    }
  }, [clickCount]);

  return (
    <div 
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      {/* 气泡效果 */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="lobster-bubble" style={{ left: '10%', animationDelay: '0s' }} />
        <div className="lobster-bubble" style={{ left: '30%', animationDelay: '0.8s' }} />
        <div className="lobster-bubble" style={{ left: '60%', animationDelay: '1.6s' }} />
      </div>
      
      {/* 点击粒子效果 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none animate-particle"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: size * 0.3,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      {/* 消息气泡 */}
      {showMessage && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-medium animate-bubble-pop pointer-events-none"
          style={{ fontSize: size * 0.28 }}
        >
          {showMessage}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-r border-b border-slate-200 dark:border-slate-700" />
        </div>
      )}
      
      {/* 龙虾主体 */}
      <svg 
        viewBox="0 0 120 80" 
        className={`w-full h-full transition-transform duration-300 ${isExcited ? 'lobster-excited' : ''}`}
        style={{ 
          filter: isExcited 
            ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6)) drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4))' 
            : 'drop-shadow(0 3px 6px rgba(220, 38, 38, 0.4))',
          transformOrigin: 'center center'
        }}
      >
        <defs>
          {/* 身体主色渐变 */}
          <linearGradient id="bodyMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          
          {/* 身体高光 */}
          <linearGradient id="bodyHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          
          {/* 钳子渐变 */}
          <linearGradient id="clawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          
          {/* 腿部渐变 */}
          <linearGradient id="legGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        
        {/* 整体游泳动画 */}
        <g className="lobster-body">
          {/* ========== 尾部 ========== */}
          <g className="lobster-tail-section">
            {/* 尾扇 - 五片 */}
            <g className="lobster-tail-fin">
              <path d="M8 40 Q2 35, 0 28 Q5 32, 10 36" fill="url(#bodyMain)" className="tail-fin-1" />
              <path d="M8 40 Q1 40, 0 40" fill="url(#bodyMain)" className="tail-fin-2" />
              <path d="M8 40 Q2 45, 0 52 Q5 48, 10 44" fill="url(#bodyMain)" className="tail-fin-3" />
            </g>
            {/* 尾节 */}
            <ellipse cx="15" cy="40" rx="8" ry="7" fill="url(#bodyMain)" />
            <ellipse cx="15" cy="38" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.5" />
          </g>
          
          {/* ========== 腹部（分6节）========== */}
          <g className="lobster-abdomen">
            {/* 腹节1 */}
            <ellipse cx="28" cy="40" rx="9" ry="8" fill="url(#bodyMain)" />
            <ellipse cx="28" cy="37" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <path d="M22 36 Q28 34, 34 36" stroke="#7f1d1d" strokeWidth="0.8" fill="none" opacity="0.6" />
            
            {/* 腹节2 */}
            <ellipse cx="42" cy="40" rx="9" ry="9" fill="url(#bodyMain)" />
            <ellipse cx="42" cy="37" rx="4" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <path d="M36 36 Q42 34, 48 36" stroke="#7f1d1d" strokeWidth="0.8" fill="none" opacity="0.6" />
            
            {/* 腹节3 */}
            <ellipse cx="55" cy="40" rx="8" ry="8" fill="url(#bodyMain)" />
            <ellipse cx="55" cy="37" rx="3.5" ry="2" fill="url(#bodyHighlight)" opacity="0.4" />
            <path d="M49 36 Q55 34, 61 36" stroke="#7f1d1d" strokeWidth="0.8" fill="none" opacity="0.6" />
            
            {/* 腹节4 */}
            <ellipse cx="66" cy="40" rx="7" ry="7" fill="url(#bodyMain)" />
            <ellipse cx="66" cy="37" rx="3" ry="1.5" fill="url(#bodyHighlight)" opacity="0.4" />
            <path d="M61 36 Q66 34, 71 36" stroke="#7f1d1d" strokeWidth="0.8" fill="none" opacity="0.6" />
            
            {/* 腹节5 */}
            <ellipse cx="75" cy="40" rx="6" ry="6" fill="url(#bodyMain)" />
            <ellipse cx="75" cy="37" rx="2.5" ry="1.5" fill="url(#bodyHighlight)" opacity="0.4" />
            
            {/* 腹节6（连接头胸部）*/}
            <ellipse cx="82" cy="40" rx="5" ry="5" fill="url(#bodyMain)" />
          </g>
          
          {/* ========== 头胸部 ========== */}
          <g className="lobster-thorax">
            {/* 头胸甲主体 */}
            <path 
              d="M85 28 Q95 30, 100 35 Q105 40, 100 45 Q95 50, 85 52 Q80 52, 78 48 Q76 40, 78 32 Q80 28, 85 28" 
              fill="url(#bodyMain)" 
            />
            {/* 头胸甲高光 */}
            <path 
              d="M85 30 Q92 32, 96 36 Q98 38, 96 40 Q92 35, 85 33" 
              fill="url(#bodyHighlight)" 
              opacity="0.4" 
            />
            {/* 额角（额剑）*/}
            <path 
              d="M100 40 Q108 38, 115 40 Q108 42, 100 40" 
              fill="url(#bodyMain)" 
              stroke="#991b1b"
              strokeWidth="0.5"
            />
            
            {/* 眼睛 */}
            <g className="lobster-eyes">
              {/* 左眼 */}
              <line x1="92" y1="35" x2="96" y2="28" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="27" r="3" fill="#1f2937" />
              <circle cx="98" cy="26" r="1" fill="#fff" />
              
              {/* 右眼 */}
              <line x1="92" y1="45" x2="96" y2="52" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="97" cy="53" r="3" fill="#1f2937" />
              <circle cx="98" cy="54" r="1" fill="#fff" />
            </g>
            
            {/* 触角 */}
            <g className="lobster-antennae">
              {/* 长触角 */}
              <path d="M98 33 Q105 25, 112 18 Q118 12, 122 8" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-long-1" />
              <path d="M98 47 Q105 55, 112 62 Q118 68, 122 72" stroke="#991b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" className="antenna-long-2" />
              {/* 短触角 */}
              <path d="M96 36 Q100 32, 104 30" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" className="antenna-short-1" />
              <path d="M96 44 Q100 48, 104 50" stroke="#7f1d1d" strokeWidth="1" fill="none" strokeLinecap="round" className="antenna-short-2" />
            </g>
          </g>
          
          {/* ========== 步足（5对）========== */}
          <g className="lobster-legs">
            {/* 第1对步足 */}
            <path d="M75 34 Q70 28, 62 24" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-1" />
            <path d="M75 46 Q70 52, 62 56" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-1" />
            
            {/* 第2对步足 */}
            <path d="M72 33 Q66 26, 58 22" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-2" />
            <path d="M72 47 Q66 54, 58 58" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-2" />
            
            {/* 第3对步足 */}
            <path d="M68 32 Q62 24, 54 20" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-3" />
            <path d="M68 48 Q62 56, 54 60" stroke="url(#legGradient)" strokeWidth="2" fill="none" strokeLinecap="round" className="leg-pair-3" />
            
            {/* 第4对步足 */}
            <path d="M65 31 Q58 22, 50 18" stroke="url(#legGradient)" strokeWidth="1.8" fill="none" strokeLinecap="round" className="leg-pair-4" />
            <path d="M65 49 Q58 58, 50 62" stroke="url(#legGradient)" strokeWidth="1.8" fill="none" strokeLinecap="round" className="leg-pair-4" />
            
            {/* 第5对步足（较小）*/}
            <path d="M62 30 Q56 22, 48 18" stroke="url(#legGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="leg-pair-5" />
            <path d="M62 50 Q56 58, 48 62" stroke="url(#legGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round" className="leg-pair-5" />
          </g>
          
          {/* ========== 大钳子 ========== */}
          <g className="lobster-claws">
            {/* 左钳子（上方）*/}
            <g className={`claw-left ${isExcited ? 'claw-excited' : ''}`}>
              {/* 钳臂 */}
              <path d="M80 30 Q72 22, 62 18 Q54 15, 48 12" stroke="url(#clawGradient)" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* 钳子上半部分 */}
              <path d="M48 12 Q42 8, 36 10 Q32 12, 35 16 Q40 14, 48 12" fill="url(#clawGradient)" className="claw-upper-left" />
              {/* 钳子下半部分 */}
              <path d="M48 12 Q44 16, 38 20 Q34 22, 36 18 Q42 16, 48 12" fill="url(#clawGradient)" className="claw-lower-left" />
              {/* 钳子上的齿 */}
              <circle cx="38" cy="14" r="1.5" fill="#c2410c" />
              <circle cx="40" cy="17" r="1" fill="#c2410c" />
            </g>
            
            {/* 右钳子（下方）*/}
            <g className={`claw-right ${isExcited ? 'claw-excited' : ''}`}>
              {/* 钳臂 */}
              <path d="M80 50 Q72 58, 62 62 Q54 65, 48 68" stroke="url(#clawGradient)" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* 钳子上半部分 */}
              <path d="M48 68 Q42 72, 36 70 Q32 68, 35 64 Q40 66, 48 68" fill="url(#clawGradient)" className="claw-upper-right" />
              {/* 钳子下半部分 */}
              <path d="M48 68 Q44 64, 38 60 Q34 58, 36 62 Q42 64, 48 68" fill="url(#clawGradient)" className="claw-lower-right" />
              {/* 钳子上的齿 */}
              <circle cx="38" cy="66" r="1.5" fill="#c2410c" />
              <circle cx="40" cy="63" r="1" fill="#c2410c" />
            </g>
          </g>
        </g>
      </svg>
      
      {/* 点击计数器（连续点击显示）*/}
      {clickCount >= 5 && clickCount < 10 && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-amber-600 font-bold animate-pulse">
          x{clickCount}
        </div>
      )}
    </div>
  );
});

export default AnimatedLobster;
