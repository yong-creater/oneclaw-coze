'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Palette, Upload, Download, Loader2, 
  Image as ImageIcon, BookOpen, Brush,
  Pen, Scissors, Star, Heart, Smile,
  Copy, Check, RefreshCw, Wand2, 
  Baby, Pencil, Flower, Crown, Gift,
  Sun, Moon, Rainbow, Cloud,
  DownloadCloud, Eye, Share2
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface CreationType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TopicTemplate {
  id: string;
  name: string;
  grade: string;
  category: string;
  preview: string;
}

interface GradeLevel {
  id: string;
  name: string;
  range: string;
}

interface GeneratedArt {
  id: string;
  url: string;
  type: string;
  topic: string;
  timestamp: number;
}

// ==================== 常量 ====================
const CREATION_TYPES: CreationType[] = [
  { 
    id: 'handbook', 
    name: '手抄报', 
    description: '适合小学生各类主题手抄报',
    icon: <Pen className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500'
  },
  { 
    id: 'coloring', 
    name: '涂色绘本', 
    description: '儿童涂色线稿，可直接打印',
    icon: <Brush className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'artbook', 
    name: '手账素材', 
    description: '可爱手账贴纸、边框素材',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-500'
  },
  { 
    id: 'drawing', 
    name: '简笔画', 
    description: '简单易学的儿童简笔画教程',
    icon: <Scissors className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  },
];

const GRADE_LEVELS: GradeLevel[] = [
  { id: 'kinder', name: '幼儿园', range: '3-6岁' },
  { id: 'grade1-2', name: '小学1-2年级', range: '6-7岁' },
  { id: 'grade3-4', name: '小学3-4年级', range: '8-9岁' },
  { id: 'grade5-6', name: '小学5-6年级', range: '10-12岁' },
];

const HANDBOOK_TOPICS = [
  '安全教育', '环保主题', '文明礼仪', '感恩父母', '读书分享',
  '数学天地', '英语角', '科学探索', '体育运动', '节日庆典',
  '疫情防控', '消防安全', '交通安全', '国防教育', '传统文化'
];

const COLORING_TOPICS = [
  '动物世界', '植物乐园', '交通工具', '人物造型', '风景建筑',
  '卡通人物', '神话故事', '海底世界', '森林探险', '太空遨游'
];

const ARTBOOK_TOPICS = [
  '可爱小动物', '梦幻城堡', '彩虹星球', '森林仙子', '海洋世界',
  '花仙子', '小公主', '超级英雄', '宠物乐园', '糖果屋'
];

const ART_STYLES = [
  { id: 'cute', name: '可爱萌系', desc: '圆滚滚、卡哇伊', icon: <Smile className="w-4 h-4" /> },
  { id: 'cartoon', name: '卡通动漫', desc: '动漫风格、动感', icon: <Star className="w-4 h-4" /> },
  { id: 'simple', name: '简约线条', desc: '简单易画、清晰', icon: <Pen className="w-4 h-4" /> },
  { id: 'vintage', name: '复古插画', desc: '复古风格、典雅', icon: <Flower className="w-4 h-4" /> },
];

const FESTIVAL_TOPICS = [
  { id: 'spring', name: '春节', icon: <Sun className="w-4 h-4" />, color: 'text-red-500' },
  { id: 'lantern', name: '元宵节', icon: <Moon className="w-4 h-4" />, color: 'text-yellow-500' },
  { id: 'qixi', name: '七夕', icon: <Heart className="w-4 h-4" />, color: 'text-pink-500' },
  { id: 'mid_autumn', name: '中秋', icon: <Moon className="w-4 h-4" />, color: 'text-orange-500' },
  { id: 'national', name: '国庆', icon: <Crown className="w-4 h-4" />, color: 'text-red-500' },
  { id: 'new_year', name: '元旦', icon: <Gift className="w-4 h-4" />, color: 'text-blue-500' },
];

// ==================== 主组件 ====================
export default function KidsCreativeWorkshop() {
  const [activeType, setActiveType] = useState<string>('handbook');
  const [selectedGrade, setSelectedGrade] = useState<string>('grade3-4');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('cute');
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [childName, setChildName] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedArts, setGeneratedArts] = useState<GeneratedArt[]>([]);
  const [previewArt, setPreviewArt] = useState<GeneratedArt | null>(null);
  
  const // 获取当前类型的专题列表
  getTopics = () => {
    switch (activeType) {
      case 'handbook': return HANDBOOK_TOPICS;
      case 'coloring': return COLORING_TOPICS;
      case 'artbook': return ARTBOOK_TOPICS;
      default: return HANDBOOK_TOPICS;
    }
  };

  // 生成作品
  const handleGenerate = async () => {
    const topic = selectedTopic || customTopic || '自定义主题';
    
    if (!topic) {
      alert('请选择或输入主题');
      return;
    }

    setGenerating(true);
    
    try {
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 生成示例作品
      const typeName = CREATION_TYPES.find(t => t.id === activeType)?.name || '创意';
      const newArt: GeneratedArt = {
        id: Date.now().toString(),
        url: `https://picsum.photos/seed/${Date.now()}/600/800`,
        type: typeName,
        topic: topic,
        timestamp: Date.now(),
      };
      
      setGeneratedArts(prev => [newArt, ...prev]);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 下载作品
  const handleDownload = async (art: GeneratedArt) => {
    try {
      const response = await fetch(art.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `儿童创意_${art.topic}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    for (const art of generatedArts) {
      await handleDownload(art);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Palette className="w-4 h-4" />}
        toolName="儿童创意工坊"
        toolDescription="AI一键生成手抄报、涂色绘本、手账素材，亲子必备"
        gradient="from-cyan-500 to-teal-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：参数设置 */}
          <div className="space-y-6">
            {/* 创作类型选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-500" />
                选择创作类型
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CREATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      activeType === type.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                      {type.icon}
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{type.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 年级选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Baby className="w-4 h-4 text-cyan-500" />
                选择年级
              </h3>
              <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGrade(grade.id)}
                    className={`px-4 py-2.5 rounded-xl border-2 transition-all ${
                      selectedGrade === grade.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-medium">{grade.name}</p>
                    <p className="text-xs opacity-70">{grade.range}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 主题选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-cyan-500" />
                选择主题
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {getTopics().map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                      selectedTopic === topic
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="或者输入自定义主题..."
                  className="flex-1 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500"
                />
                {customTopic && (
                  <Button
                    onClick={() => { setSelectedTopic(''); setSelectedTopic(customTopic); }}
                    variant="outline"
                    className="border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                  >
                    使用
                  </Button>
                )}
              </div>
            </div>

            {/* 节日专题 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-cyan-500" />
                节日专题
              </h3>
              <div className="flex flex-wrap gap-2">
                {FESTIVAL_TOPICS.map((festival) => (
                  <button
                    key={festival.id}
                    onClick={() => setSelectedFestival(selectedFestival === festival.id ? '' : festival.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all ${
                      selectedFestival === festival.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                    }`}
                  >
                    <span className={festival.color}>{festival.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{festival.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Brush className="w-4 h-4 text-cyan-500" />
                选择风格
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-500 mb-2">
                      {style.icon}
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{style.name}</p>
                    <p className="text-xs text-slate-500">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 姓名输入 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyan-500" />
                添加姓名（可选）
              </h3>
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="输入孩子的姓名，将自动添加到作品中"
                className="border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                姓名会出现在作品角落，增添专属感
              </p>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成创意作品...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  一键生成
                </>
              )}
            </Button>

            {/* 功能说明 */}
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800">
              <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                功能特点
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>• 高清A4/A3尺寸，可直接打印</li>
                <li>• 线稿清晰，适合涂色练习</li>
                <li>• 多种风格可选，激发创意</li>
                <li>• 支持添加孩子姓名</li>
              </ul>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            {/* 生成预览 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-500" />
                  生成结果
                </h3>
                {generatedArts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                      {generatedArts.length} 张
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBatchDownload}
                      className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                    >
                      <DownloadCloud className="w-4 h-4 mr-1" />
                      批量下载
                    </Button>
                  </div>
                )}
              </div>
              
              {generatedArts.length === 0 ? (
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-slate-400">
                  <Palette className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">创意作品预览</p>
                  <p className="text-sm mt-1">选择主题后点击生成</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedArts.map((art) => (
                    <div key={art.id} className="relative group">
                      <img
                        src={art.url}
                        alt={art.topic}
                        className="w-full rounded-xl"
                      />
                      {childName && (
                        <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-lg font-medium text-slate-700 shadow-lg">
                          {childName}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewArt(art)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                        </button>
                        <button
                          onClick={() => handleDownload(art)}
                          className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4 text-slate-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                          <Share2 className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-cyan-500 text-white">
                        {art.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 打印说明 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                打印说明
              </h3>
              <div className="space-y-3">
                {[
                  { size: 'A4', desc: '普通家用打印机', color: 'bg-blue-100 text-blue-600' },
                  { size: 'A3', desc: '需要A3打印机或打印店', color: 'bg-purple-100 text-purple-600' },
                  { size: '高清原图', desc: '适合大幅打印', color: 'bg-orange-100 text-orange-600' },
                ].map((item) => (
                  <div key={item.size} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>
                        {item.size}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">推荐</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用场景 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-cyan-500" />
                适用场景
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🏫', title: '学校作业', desc: '手抄报、美术课' },
                  { icon: '🏠', title: '家庭活动', desc: '亲子涂色时光' },
                  { icon: '🎁', title: '节日礼物', desc: '手账本装饰' },
                  { icon: '🏆', title: '比赛投稿', desc: '绘画比赛素材' },
                ].map((scene) => (
                  <div key={scene.title} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-2xl mb-1">{scene.icon}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{scene.title}</p>
                    <p className="text-xs text-slate-500">{scene.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 登录提示 */}
            <LoginButton />
          </div>
        </div>
      </div>

      {/* 预览弹窗 */}
      {previewArt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewArt(null)}>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewArt.url}
              alt={previewArt.topic}
              className="w-full rounded-xl"
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-white font-medium">
                {previewArt.type} - {previewArt.topic}
                {childName && <span className="ml-2">by {childName}</span>}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(previewArt)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  onClick={() => setPreviewArt(null)}
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 缺少的图标
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
