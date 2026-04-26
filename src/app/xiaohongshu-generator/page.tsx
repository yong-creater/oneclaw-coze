'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Sparkles, Copy, Check, Image, Download, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [style, setStyle] = useState('auto');
  const [industry, setIndustry] = useState('auto');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        
        // 根据模板内容填充表单
        if (data.keyword || data.topic) {
          setKeyword(data.keyword || data.topic);
        }
        if (data.style) {
          setStyle(data.style);
        }
        if (data.industry) {
          setIndustry(data.industry);
        }
        if (data.prompt) {
          // 如果模板有预设提示词，可以预填到 keyword
          setKeyword(data.prompt.replace('生成一篇小红书', '').replace('种草文案', '') || keyword);
        }
        
        toast.success('已加载模板参数，可直接点击生成');
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  // 生成文案
  const generateContent = async () => {
    if (!keyword.trim()) {
      toast.error('请输入内容主题');
      return;
    }

    setLoading(true);
    try {
      // 调用LLM生成内容
      const response = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `你是一个拥有10万+爆款经验的小红书创作者。

请围绕「${keyword}」生成一篇可以直接发布的小红书内容。

要求：
1. 标题必须具备强点击欲（情绪/反差/数字），生成3条
2. 开头必须在3秒内吸引用户
3. 内容真实、有共鸣，像真人分享，控制在500字以内
4. 避免AI感，避免套话
5. 结尾必须引导用户点赞或收藏
6. 生成5个相关标签

输出格式（严格按此格式）：
【标题】
标题1
标题2
标题3
【正文】
正文内容
【标签】
标签1,标签2,标签3,标签4,标签5`,
          system: '你是一个专业的小红书内容创作者，擅长生成爆款内容。'
        })
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

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

      setContent({
        titles,
        content: mainContent,
        tags,
        coverImages: []
      });

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
        
        if (imageUrl && content) {
          setContent(prev => prev ? { ...prev, coverImages: [imageUrl] } : null);
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  // 复制内容
  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 复制全部正文
  const copyAllContent = () => {
    if (!content) return;
    const fullContent = `${content.titles[0]}\n\n${content.content}\n\n${content.tags.map(t => '#' + t).join(' ')}`;
    copyToClipboard(fullContent, 'all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Sparkles className="w-4 h-4" />}
        toolName="小红书爆款生成器"
        toolDescription="AI驱动的爆款内容创作"
        gradient="from-pink-500 to-rose-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        {/* 标题区 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            小红书爆款生成器
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            输入一句话，生成爆款内容
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            标题 · 正文 · 标签 · 封面图 一键搞定
          </p>
        </div>

        {/* 输入区 */}
        <Card className="mb-8 border-pink-100 dark:border-pink-900/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 主输入 */}
              <div className="relative">
                <textarea
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="写点你想发的，比如：减肥 / AI赚钱 / 护肤 / 副业"
                  className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-800 rounded-xl focus:outline-none focus:border-pink-500 transition-colors resize-none text-slate-800 dark:text-white placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateContent();
                    }
                  }}
                />
              </div>

              {/* 高级选项 */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-pink-500 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  高级选项
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">风格</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      >
                        <option value="auto">自动匹配</option>
                        <option value="real">真实分享</option>
                        <option value="干货">干货教程</option>
                        <option value="好物">好物推荐</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">行业</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      >
                        <option value="auto">自动判断</option>
                        <option value="beauty">美妆护肤</option>
                        <option value="fitness">健身减肥</option>
                        <option value="food">美食探店</option>
                        <option value="tech">科技数码</option>
                        <option value="finance">理财投资</option>
                        <option value="life">生活家居</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={generateContent}
                disabled={loading || !keyword.trim()}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-pink-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    正在生成爆款内容...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    生成爆款
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 生成结果 */}
        {content && (
          <div className="space-y-6">
            {/* 标题推荐 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-pink-500">🔥</span> 推荐标题
                  </h2>
                  <span className="text-xs text-pink-500 bg-pink-50 dark:bg-pink-900/30 px-2 py-1 rounded">点击选择</span>
                </div>
                <div className="space-y-2">
                  {content.titles.map((title, index) => (
                    <button
                      key={index}
                      onClick={() => copyToClipboard(title, `title-${index}`)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        index === 0
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 dark:text-white">{title}</span>
                        {index === 0 && (
                          <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded">推荐</span>
                        )}
                        {copiedSection === `title-${index}` && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 正文内容 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-pink-500">📝</span> 正文内容
                  </h2>
                  <Button
                    onClick={copyAllContent}
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    {copiedSection === 'all' ? (
                      <><Check className="w-4 h-4 mr-1" /> 已复制</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> 一键复制</>
                    )}
                  </Button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {content.content}
                </div>
                <p className="text-xs text-slate-400 mt-2">可直接复制发布，建议适当调整使其更真实</p>
              </CardContent>
            </Card>

            {/* 标签 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-pink-500">🏷️</span> 推荐标签
                  </h2>
                  <Button
                    onClick={() => copyToClipboard(content.tags.map(t => '#' + t).join(' '), 'tags')}
                    variant="ghost"
                    size="sm"
                  >
                    {copiedSection === 'tags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => copyToClipboard('#' + tag, `tag-${index}`)}
                      className="px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 封面图 */}
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-pink-500">🖼️</span> 封面图
                  </h2>
                  {generatingImage && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> 生成中...
                    </span>
                  )}
                </div>
                
                {content.coverImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {content.coverImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`封面 ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                        {/* 水印提示 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs">水印版 · 付费去水印</span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Button size="sm" variant="secondary" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm">封面图生成中...</p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    💡 <strong>提示：</strong>图片为水印版本，付费9.9元可去除水印并下载高清原图
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 底部 */}
        <div className="mt-12">
          <WechatPromo />
        </div>
      </div>
    </div>
  );
}
