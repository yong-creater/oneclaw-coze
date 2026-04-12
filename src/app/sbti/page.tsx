'use client';

import { useState, useCallback } from 'react';
import SharePoster from '@/components/sbti/SharePoster';
import LowPolyAvatar from '@/components/sbti/LowPolyAvatar';

// 16种人格类型定义
const PERSONALITY_TYPES = [
  { id: 'caover', name: '草者', english: 'F-U-C-K', tagline: '野火烧不尽，春风吹又生', color: '#22C55E', bgColor: '#DCFCE7', description: '你是那种朋友圈发完就开始后悔的人' },
  { id: 'sunshine', name: '阳光', english: 'HELLO', tagline: '早上好世界，今天也要加油鸭！', color: '#F59E0B', bgColor: '#FEF3C7', description: '永远正能量，永远热泪盈眶' },
  { id: 'cool', name: '高冷', english: 'BYE', tagline: '别来烦我，除非你请我喝奶茶', color: '#6366F1', bgColor: '#EEF2FF', description: '朋友圈三天可见，不是针对你' },
  { id: 'rich', name: '财神', english: 'MONEY', tagline: '不是喜欢钱，是喜欢赚钱的过程', color: '#EAB308', bgColor: '#FEF9C3', description: '搞钱要紧，感情的事以后再说' },
  { id: 'foodie', name: '干饭', english: 'EAT', tagline: '减肥是明天的事，今天先吃完', color: '#EF4444', bgColor: '#FEE2E2', description: '能吃是福，胃口好说明心态好' },
  { id: 'sleepy', name: '睡神', english: 'ZZZ', tagline: '不是我困，是床需要我', color: '#8B5CF6', bgColor: '#EDE9FE', description: '周末能睡到下午三点绝不两点五十九起' },
  { id: 'gaming', name: '上分', english: 'GG', tagline: '不是菜，是队友太坑带不动', color: '#EC4899', bgColor: '#FCE7F3', description: '五杀不重要，重要的是五杀的时候你在看' },
  { id: 'emo', name: 'emo', english: 'T_T', tagline: '网抑云时间到，感性文案请下单', color: '#64748B', bgColor: '#F1F5F9', description: '凌晨三点，网易云音乐见' },
  { id: 'social', name: '社牛', english: 'HI', tagline: '去酒吧一个人，出来认识一个班', color: '#14B8A6', bgColor: '#CCFBF1', description: '没有我搭不上的话，没有我聊不了的天' },
  { id: 'anti', name: '反骨', english: 'NO', tagline: '你让我往东，我偏要往西', color: '#A855F7', bgColor: '#F3E8FF', description: '不是叛逆，是有自己的想法' },
  { id: 'study', name: '卷王', english: 'A+', tagline: '比你聪明的人比你还努力', color: '#0EA5E9', bgColor: '#E0F2FE', description: '图书馆是我家，奖学金是目标' },
  { id: 'fresh', name: 'fresh', english: 'NEW', tagline: '今天也要做一个精致的新新人类', color: '#10B981', bgColor: '#D1FAE5', description: '刚染的头发，刚做的美甲，安排' },
  { id: 'boring', name: '无聊', english: 'WHAT', tagline: '闲得发慌，想找点事做', color: '#78716C', bgColor: '#F5F5F4', description: '刷完抖音刷微博，刷完微博没得刷' },
  { id: 'drama', name: '戏精', english: 'OMG', tagline: '这点小事值得我发三条朋友圈', color: '#F97316', bgColor: '#FFEDD5', description: '生活太无聊，需要自己加戏' },
  { id: 'toxic', name: '摆烂', english: '摆', tagline: '努力不一定成功，但不努力一定很轻松', color: '#71717A', bgColor: '#F4F4F5', description: '能躺着绝不坐着，能摆烂绝不内卷' },
  { id: 'lonely', name: '独行', english: 'ME', tagline: '一个人吃饭，一个人看电影，一个人生活', color: '#475569', bgColor: '#E2E8F0', description: '不是不合群，是找不到合群的人' },
];

// 测试题目
const QUESTIONS = [
  { id: 1, question: '周末你更想？', options: [
    { text: '睡到自然醒，然后点外卖', score: { sleepy: 2, foodie: 1, boring: 1 } },
    { text: '出门社交，认识新朋友', score: { social: 2, sunshine: 1, drama: 1 } },
    { text: '宅家追剧，打游戏', score: { gaming: 2, emo: 1, toxic: 1 } },
    { text: '去图书馆学习，卷死他们', score: { study: 2, rich: 1, anti: 1 } },
  ]},
  { id: 2, question: '朋友找你借钱，你会？', options: [
    { text: '直接转账，兄弟情谊最重要', score: { sunshine: 2, social: 1, rich: 1 } },
    { text: '哭穷，说自己也快吃土了', score: { cool: 2, toxic: 1, emo: 1 } },
    { text: '假装没看到消息', score: { boring: 2, anti: 1, lonely: 1 } },
    { text: '先骂一顿再借', score: { drama: 2, social: 1, toxic: 1 } },
  ]},
  { id: 3, question: '凌晨三点睡不着，你一般？', options: [
    { text: '刷手机到天亮', score: { sleepy: 2, boring: 1, toxic: 1 } },
    { text: '网抑云，思考人生', score: { emo: 2, lonely: 1, study: 1 } },
    { text: '开黑打游戏', score: { gaming: 2, anti: 1, fresh: 1 } },
    { text: '这不废话吗，当然是睡觉', score: { caover: 2, sunshine: 1, toxic: 1 } },
  ]},
  { id: 4, question: '你发朋友圈一般？', options: [
    { text: '精修九图，文案要想半天', score: { drama: 2, social: 1, fresh: 1 } },
    { text: '三天可见，不想让人看', score: { cool: 2, lonely: 1, anti: 1 } },
    { text: '想发就发，不在乎点赞', score: { sunshine: 2, gaming: 1, toxic: 1 } },
    { text: '很少发，太麻烦了', score: { boring: 2, sleepy: 1, lonely: 1 } },
  ]},
  { id: 5, question: '听到别人说你坏话？', options: [
    { text: '当面质问，非要掰扯清楚', score: { drama: 2, anti: 1, social: 1 } },
    { text: '假装不知道，背后整他', score: { cool: 2, toxic: 1, boring: 1 } },
    { text: 'emo一整天，觉得自己有问题', score: { emo: 2, lonely: 1, sleepy: 1 } },
    { text: '关我屁事，爱说说去', score: { toxic: 2, anti: 1, sunshine: 1 } },
  ]},
  { id: 6, question: '你吃饭一般？', options: [
    { text: '必须点很多，吃不完也要点', score: { foodie: 2, drama: 1, rich: 1 } },
    { text: '随便吃点就行，填饱肚子', score: { boring: 2, sleepy: 1, toxic: 1 } },
    { text: '精致摆盘，先让手机吃', score: { drama: 2, fresh: 1, social: 1 } },
    { text: '有肉就行，不挑', score: { caover: 2, gaming: 1, anti: 1 } },
  ]},
  { id: 7, question: '你走路一般是？', options: [
    { text: '大步流星，目视前方', score: { sunshine: 2, social: 1, caover: 1 } },
    { text: '低头看手机，边走边刷', score: { boring: 2, gaming: 1, emo: 1 } },
    { text: '戴着耳机，谁都不理', score: { cool: 2, lonely: 1, anti: 1 } },
    { text: '东张西望，容易迷路', score: { drama: 2, fresh: 1, study: 1 } },
  ]},
  { id: 8, question: '室友/同事夸你？', options: [
    { text: '谢谢，你也很棒！', score: { sunshine: 2, social: 1, foodie: 1 } },
    { text: '那必须的，好看的人都夸我', score: { drama: 2, rich: 1, gaming: 1 } },
    { text: '面无表情接受夸奖', score: { cool: 2, anti: 1, toxic: 1 } },
    { text: '假装没听到，不知道说啥', score: { emo: 2, lonely: 1, boring: 1 } },
  ]},
];

export default function SBTIPage() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<typeof PERSONALITY_TYPES[0] | null>(null);
  const [showPoster, setShowPoster] = useState(false);

  const handleSelect = useCallback((optionIndex: number) => {
    const question = QUESTIONS[currentQuestion];
    const option = question.options[optionIndex];
    
    setAnswers(prev => {
      const newAnswers = { ...prev };
      Object.entries(option.score).forEach(([type, score]) => {
        newAnswers[type] = (newAnswers[type] || 0) + score;
      });
      return newAnswers;
    });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 计算结果
      const sortedTypes = Object.entries(answers)
        .sort(([, a], [, b]) => b - a);
      const topType = sortedTypes[0]?.[0] || 'boring';
      const personality = PERSONALITY_TYPES.find(p => p.id === topType) || PERSONALITY_TYPES[0];
      setResult(personality);
      setCurrentStep('result');
    }
  }, [currentQuestion, answers]);

  const restartTest = () => {
    setCurrentStep('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowPoster(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* 顶部标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            SBTI
          </h1>
          <p className="text-purple-300 text-sm tracking-widest">隐藏人格测试</p>
        </div>

        {/* 封面页 */}
        {currentStep === 'intro' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-6xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                测出你的隐藏人格
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                8道题，测出你的真实人格类型
                <br />
                据说只有10%的人能答完
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {['😴 好奇宝宝型', '😈 反骨型', '🤡 搞笑型', '🥶 高冷型'].map((tag, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep('testing')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              开始测试 →
            </button>
          </div>
        )}

        {/* 测试页 */}
        {currentStep === 'testing' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>问题 {currentQuestion + 1}/{QUESTIONS.length}</span>
                <span>{Math.round((currentQuestion / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 问题 */}
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              {QUESTIONS[currentQuestion].question}
            </h3>

            {/* 选项 */}
            <div className="space-y-3">
              {QUESTIONS[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果页 */}
        {currentStep === 'result' && result && !showPoster && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
              <p className="text-purple-300 text-sm mb-2">你的隐藏人格是</p>
              <h2 className="text-5xl font-bold mb-2" style={{ color: result.color }}>
                {result.name}
              </h2>
              <p className="text-2xl text-slate-300 font-mono mb-4">{result.english}</p>
              
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: result.bgColor }}>
                <p className="text-sm font-medium" style={{ color: result.color }}>💬 {result.tagline}</p>
              </div>

              <p className="text-slate-400 text-sm mb-8">{result.description}</p>

              {/* Low Poly头像预览 */}
              <div className="mb-8">
                <LowPolyAvatar type={result.id} size={160} />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPoster(true)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  📱 生成专属海报
                </button>
                <button
                  onClick={restartTest}
                  className="w-full py-3 bg-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/20 transition-all"
                >
                  重新测试
                </button>
              </div>
            </div>

            {/* 分享提示 */}
            <div className="text-center text-slate-500 text-xs">
              据说分享到朋友圈的人会收获好运 ✨
            </div>
          </div>
        )}

        {/* 海报页 */}
        {currentStep === 'result' && result && showPoster && (
          <div className="space-y-4">
            <SharePoster personality={result} />
            
            <button
              onClick={() => setShowPoster(false)}
              className="w-full py-3 bg-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/20 transition-all"
            >
              ← 返回结果页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
