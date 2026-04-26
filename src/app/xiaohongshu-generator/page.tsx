'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Sparkles, Copy, Check, Image, Download, Loader2, RefreshCw, ThumbsUp, Star } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedContent {
  titles: string[];
  content: string;
  tags: string[];
  coverImages: string[];
}

export default function XiaohongshuGeneratorPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [copied, setCopied] = useState(false);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        if (data.keyword || data.topic) {
          setKeyword(data.keyword || data.topic);
        }
        toast.success('已加载模板参数，可直接点击生成');
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  // 生成全部内容
  const generateContent = async () => {
    if (!keyword.trim()) {
      toast.error('请输入内容主题');
      return;
    }

    setLoading(true);
    setContent(null);
    try {
      // 调用LLM生成内容
      const response = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `你是一个拥有10万+爆款经验的小红书创作者。

请围绕「${keyword}」生成一篇可以直接发布的小红书内容。

要求：
1. 标题必须具备强点击欲（情绪/反差/数字），生成3条，每条不超过20字
2. 开头必须在3秒内吸引用户
3. 内容真实、有共鸣，像真人分享，控制在400字以内
4. 避免AI感，避免套话，多用emoji和分段
5. 结尾必须引导用户点赞或收藏
6. 生成5个相关标签，用#开头

输出格式（严格按此格式）：
【标题】
标题1
标题2
标题3
【正文】
正文内容
【标签】
标签1,标签2,标签3,标签4,标签5`,
          system: '你是一个专业的小红书内容创作者，擅长生成爆款内容。输出必须简洁有力。'
        })
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      const result = data.text || '';

      // 解析结果
      const titlesMatch = result.match(/【标题】\s*([\s\S]*?)【正文】/);
      const contentMatch = result.match(/【正文】\s*([\s\S]*?)【标签】/);
      const tagsMatch = result.match(/【标签】\s*([\s\S]*?)$/);

      const titles = titlesMatch?.[1]
        ?.split('\n')
        .map((t: string) => t.trim())
        .filter((t: string) => t && !t.startsWith('【')) || [];
      
      const mainContent = contentMatch?.[1]?.trim() || '';
      const tags = tagsMatch?.[1]
        ?.split(/[,，、]/)
        .map((t: string) => t.trim())
        .filter((t: string) => t) || [];

      const newContent = {
        titles,
        content: mainContent,
        tags,
        coverImages: []
      };
      setContent(newContent);
      setSelectedTitle(0);

      // 自动生成封面图
      if (titles.length > 0) {
        generateCoverImages(titles[0]);
      }

      toast.success('生成成功！');
    } catch (error) {
      console.error('Error:', error);
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成封面图
  const generateCoverImages = async (title: string) => {
    setGeneratingImage(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `小红书爆款封面，超大字体标题「${title}」，高对比配色，视觉冲击强，极简排版，社交媒体点击率高风格，白底或纯色背景`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.image_url;
        
        if (imageUrl) {
          setContent(prev => prev ? { ...prev, coverImages: [imageUrl] } : null);
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  // 一键复制全部内容
  const copyAll = async () => {
    if (!content) return;
    
    const selectedTitleText = content.titles[selectedTitle];
    const fullContent = `${selectedTitleText}\n\n${content.content}\n\n${content.tags.map(t => '#' + t.replace(/^#/, '')).join(' ')}`;
    
    try {
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      toast.success('已复制！去小红书发布吧~');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 复制单个标签
  const copyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText('#' + tag.replace(/^#/, ''));
      toast.success('标签已复制');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 重新生成封面
  const regenerateCover = () => {
    if (content && content.titles[selectedTitle]) {
      generateCoverImages(content.titles[selectedTitle]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4" />}
        toolName="小红书爆款生成器"
        toolDescription="AI驱动的爆款内容创作"
        gradient="from-pink-500 to-rose-500"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="text-center py-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            一键生成小红书爆款
          </h1>
          <p className="text-sm text-slate-500">输入主题，自动生成标题、正文、标签和封面图</p>
        </div>

        {/* 主工作区 - 左右分栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 左侧：输入区 */}
          <div className="space-y-4">
            {/* 输入卡片 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  输入内容主题
                </label>
                <textarea
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="比如：减肥方法 / AI副业 / 护肤心得 / 探店美食"
                  className="w-full h-28 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-800 rounded-xl focus:outline-none focus:border-pink-500 transition-colors resize-none text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && keyword.trim()) {
                      e.preventDefault();
                      generateContent();
                    }
                  }}
                />
                
                <Button
                  onClick={generateContent}
                  disabled={loading || !keyword.trim()}
                  className="w-full mt-3 h-11 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-pink-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      正在生成爆款内容...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      一键生成
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 标题选择 */}
            {content && content.titles.length > 0 && (
              <Card className="border-pink-100 dark:border-pink-900/30">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      选择标题
                    </label>
                    <span className="text-xs text-pink-500">
                      {selectedTitle + 1} / {content.titles.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {content.titles.map((title, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTitle(index)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                          selectedTitle === index
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedTitle === index ? 'border-pink-500 bg-pink-500' : 'border-slate-300'
                          }`}>
                            {selectedTitle === index && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="line-clamp-1">{title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* 重新生成封面按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateCover}
                    disabled={generatingImage}
                    className="w-full mt-3 border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        重新生成封面
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 标签区 */}
            {content && content.tags.length > 0 && (
              <Card className="border-pink-100 dark:border-pink-900/30">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      热门标签
                    </label>
                    <button
                      onClick={() => copyTag(content.tags.join(' #'))}
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      复制全部
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => copyTag(tag)}
                        className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-medium hover:from-pink-200 hover:to-rose-200 transition-colors"
                      >
                        #{tag.replace(/^#/, '')}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：预览区 */}
          <div className="space-y-4">
            {/* 小红书手机预览 */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 lg:sticky lg:top-4">
              <div className="text-center mb-3">
                <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">预览效果</span>
              </div>
              
              {/* 手机模拟框 */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-800 mx-auto max-w-[280px]">
                {/* 状态栏 */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mb-2">
                  <span>9:41</span>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-1.5 bg-slate-800 rounded-sm" />
                    <div className="w-3 h-1.5 bg-slate-800 rounded-sm" />
                    <div className="w-3 h-1.5 bg-slate-800 rounded-sm" />
                  </div>
                </div>
                
                {/* 帖子内容 */}
                <div className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden">
                  {/* 封面图 */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30">
                    {content?.coverImages[0] ? (
                      <img
                        src={content.coverImages[0]}
                        alt="封面"
                        className="w-full h-full object-cover"
                      />
                    ) : generatingImage ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-pink-300">
                        <Image className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs">封面图</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 正文 */}
                  <div className="p-3">
                    {/* 标题 */}
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-2">
                      {content?.titles[selectedTitle] || '点击生成获取标题'}
                    </h3>
                    
                    {/* 正文内容 */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-[8] mb-3 whitespace-pre-wrap">
                      {content?.content || '点击生成获取正文内容，AI将为你创作一篇吸引眼球的小红书爆款文案...'}
                    </p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {content?.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-[10px] text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-1.5 py-0.5 rounded">
                          #{tag.replace(/^#/, '')}
                        </span>
                      ))}
                      {(content?.tags.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{(content?.tags.length || 0) - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* 互动栏 */}
                    <div className="flex items-center gap-4 text-slate-400 text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3" /> 0
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3" /> 0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 生成结果 - 完整内容展示 */}
        {content && (
          <div className="mt-8 space-y-4">
            {/* 正文卡片 - 可复制 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-pink-500">📝</span> 正文内容
                  </h2>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {content.content}
                </div>
              </CardContent>
            </Card>

            {/* 一键复制区域 */}
            <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                    准备发布？
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    标题 + 正文 + 标签，一键复制
                  </p>
                  <Button
                    onClick={copyAll}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        已复制！
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        一键复制全部
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 底部提示 */}
        {!content && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-pink-500" />
              输入主题后点击「一键生成」，AI将自动创作爆款内容
            </div>
          </div>
        )}

        {/* 公众号推广 */}
        <div className="mt-8">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
