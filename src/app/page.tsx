'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Video, Sparkles, Zap, Star, Search, Film, Wand2, Palette, Music, Info, TrendingUp, Clock, ChevronRight, Mail, MessageCircle, Globe } from 'lucide-react';
import { BannerAd, InlineAd, SidebarAd, type AdConfig } from '@/components/ads/AdComponents';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
  tags: string[];
  featured?: boolean;
}

// AI视频工具数据
const aiTools: ToolItem[] = [
  {
    id: '1',
    name: 'Runway',
    description: '专业的AI视频生成和编辑平台，支持文生视频、图生视频、视频编辑等多种功能，好莱坞级别的视觉效果。',
    url: 'https://runwayml.com/',
    category: '视频生成',
    icon: '🎬',
    tags: ['文生视频', '图生视频', '视频编辑'],
    featured: true
  },
  {
    id: '2',
    name: 'Pika Labs',
    description: '强大的AI视频生成工具，支持文字生成视频和图片生成视频，生成速度快，效果好。',
    url: 'https://pika.art/',
    category: '视频生成',
    icon: '✨',
    tags: ['文生视频', '图生视频', '创意视频'],
    featured: true
  },
  {
    id: '3',
    name: 'Sora',
    description: 'OpenAI推出的革命性AI视频生成模型，能够根据文本生成长达60秒的高质量视频。',
    url: 'https://openai.com/sora',
    category: '视频生成',
    icon: '🌟',
    tags: ['文生视频', '长视频', '高质量'],
    featured: true
  },
  {
    id: '4',
    name: 'Stable Video Diffusion',
    description: 'Stability AI开源的视频生成模型，支持图生视频，社区活跃，可本地部署。',
    url: 'https://stability.ai/',
    category: '视频生成',
    icon: '🎨',
    tags: ['开源', '图生视频', '可部署']
  },
  {
    id: '5',
    name: 'HeyGen',
    description: 'AI数字人视频生成平台，支持多语言口播视频制作，适合营销、教育等场景。',
    url: 'https://www.heygen.com/',
    category: '数字人',
    icon: '👤',
    tags: ['数字人', '口播视频', '多语言'],
    featured: true
  },
  {
    id: '6',
    name: 'D-ID',
    description: 'AI驱动的数字人视频生成工具，支持照片转视频、AI头像生成等功能。',
    url: 'https://www.d-id.com/',
    category: '数字人',
    icon: '🎭',
    tags: ['数字人', '照片转视频', 'AI头像']
  },
  {
    id: '7',
    name: 'Synthesia',
    description: '企业级AI视频生成平台，提供丰富的数字人模板，支持140+语言的视频制作。',
    url: 'https://www.synthesia.io/',
    category: '数字人',
    icon: '🎪',
    tags: ['企业级', '多语言', '模板丰富']
  },
  {
    id: '8',
    name: '剪映专业版',
    description: '字节跳动推出的专业视频编辑软件，内置AI功能，支持智能字幕、一键成片等。',
    url: 'https://www.capcut.cn/',
    category: '视频编辑',
    icon: '✂️',
    tags: ['智能剪辑', '智能字幕', '一键成片'],
    featured: true
  },
  {
    id: '9',
    name: 'Descript',
    description: '革命性的AI视频编辑工具，支持文字编辑视频、AI配音、自动转录等功能。',
    url: 'https://www.descript.com/',
    category: '视频编辑',
    icon: '📝',
    tags: ['文字编辑视频', 'AI配音', '自动转录']
  },
  {
    id: '10',
    name: 'Vrew',
    description: '韩国团队开发的AI视频编辑工具，支持AI字幕、AI剪辑、智能语音识别等功能。',
    url: 'https://vrew.com/',
    category: '视频编辑',
    icon: '🎯',
    tags: ['AI字幕', '智能剪辑', '语音识别']
  },
  {
    id: '11',
    name: 'Topaz Video AI',
    description: '专业的AI视频增强工具，支持视频放大、降噪、帧插值、稳定等功能。',
    url: 'https://www.topazlabs.com/topaz-video-ai',
    category: '视频增强',
    icon: '💎',
    tags: ['视频放大', '降噪', '帧插值']
  },
  {
    id: '12',
    name: 'CapCut',
    description: '剪映国际版，功能强大的移动端视频编辑工具，内置丰富的AI功能。',
    url: 'https://www.capcut.com/',
    category: '视频编辑',
    icon: '📱',
    tags: ['移动端', 'AI特效', '模板丰富']
  },
  {
    id: '13',
    name: 'Pictory',
    description: 'AI驱动的视频内容创作平台，支持文章转视频、长视频转短视频等功能。',
    url: 'https://pictory.ai/',
    category: '视频生成',
    icon: '📄',
    tags: ['文章转视频', '视频剪辑', '内容创作']
  },
  {
    id: '14',
    name: 'InVideo',
    description: '在线视频制作平台，提供丰富的模板和AI功能，适合营销视频快速制作。',
    url: 'https://invideo.io/',
    category: '视频生成',
    icon: '🎥',
    tags: ['在线制作', '模板库', '营销视频']
  },
  {
    id: '15',
    name: 'Luma AI',
    description: '专业的AI 3D内容创作工具，支持视频转3D、NeRF渲染等前沿技术。',
    url: 'https://lumalabs.ai/',
    category: '3D视频',
    icon: '🌐',
    tags: ['3D生成', 'NeRF', '视频转3D']
  },
  {
    id: '16',
    name: 'Kaiber',
    description: 'AI驱动的创意视频生成平台，支持音乐可视化、风格转换等艺术创作。',
    url: 'https://kaiber.ai/',
    category: '创意视频',
    icon: '🎵',
    tags: ['音乐可视化', '艺术创作', '风格转换']
  },
  {
    id: '17',
    name: 'Opus Clip',
    description: 'AI短视频剪辑工具，自动从长视频中提取精彩片段，适合内容创作者。',
    url: 'https://opus.pro/',
    category: '视频编辑',
    icon: '🎞️',
    tags: ['自动剪辑', '短视频', '内容创作']
  },
  {
    id: '18',
    name: 'Fliki',
    description: 'AI文字转视频工具，支持3000+AI语音，适合快速制作营销和培训视频。',
    url: 'https://fliki.ai/',
    category: '视频生成',
    icon: '🔊',
    tags: ['文字转视频', 'AI配音', '营销视频']
  }
];

const categories = [
  { name: '全部', icon: Video, count: aiTools.length },
  { name: '视频生成', icon: Wand2, count: aiTools.filter(t => t.category === '视频生成').length },
  { name: '视频编辑', icon: Film, count: aiTools.filter(t => t.category === '视频编辑').length },
  { name: '数字人', icon: Video, count: aiTools.filter(t => t.category === '数字人').length },
  { name: '视频增强', icon: Sparkles, count: aiTools.filter(t => t.category === '视频增强').length },
  { name: '3D视频', icon: Palette, count: aiTools.filter(t => t.category === '3D视频').length },
  { name: '创意视频', icon: Music, count: aiTools.filter(t => t.category === '创意视频').length }
];

// 热门工具
const hotTools = aiTools.filter(t => t.featured).slice(0, 4);

// 广告配置
const bannerAd: AdConfig = {
  id: 'ad-banner-1',
  type: 'banner',
  title: 'Runway Gen-3 Alpha震撼发布',
  description: '最新AI视频生成模型，支持超写实视频创作，限时优惠！使用专属优惠码享8折',
  linkUrl: 'https://runwayml.com/',
  ctaText: '立即体验',
  badge: '热门',
  showClose: true,
};

const inlineAds: AdConfig[] = [
  {
    id: 'ad-inline-1',
    type: 'inline',
    title: 'Pika Labs - AI视频生成新标杆',
    description: '注册即送100积分，支持文字/图片转视频，创作无限可能',
    linkUrl: 'https://pika.art/',
    ctaText: '免费试用',
    badge: '限时优惠',
  },
];

const sidebarAds: AdConfig[] = [
  {
    id: 'ad-sidebar-1',
    type: 'sidebar',
    title: '剪映专业版',
    description: '免费视频编辑神器，内置AI功能，支持智能字幕、一键成片',
    linkUrl: 'https://www.capcut.cn/',
    ctaText: '免费下载',
    badge: '推荐',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 在工具列表中间插入一个广告（第9个工具后）
  const toolsWithAds = filteredTools.reduce((acc: (ToolItem | { type: 'ad'; config: AdConfig })[], tool, index) => {
    acc.push(tool);
    if (index === 8 && inlineAds[0]) {
      acc.push({ type: 'ad', config: inlineAds[0] });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI视频工具集合
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">精选优质AI视频创作工具</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/about">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">关于我们</span>
                </Button>
              </Link>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {aiTools.length} 个工具
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Banner Ad */}
        <div className="mb-8">
          <BannerAd config={bannerAd} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Video className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">{aiTools.length}</p>
                      <p className="text-xs md:text-sm opacity-80">AI工具</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">100%</p>
                      <p className="text-xs md:text-sm opacity-80">免费使用</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Star className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
                    <div>
                      <p className="text-2xl md:text-3xl font-bold">精选</p>
                      <p className="text-xs md:text-sm opacity-80">优质推荐</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索工具名称、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                      className="gap-1.5"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.name}
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Tools Grid with Ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {toolsWithAds.map((item, index) => {
                if ('type' in item && item.type === 'ad') {
                  return <InlineAd key={`ad-${index}`} config={item.config} />;
                }
                
                const tool = item as ToolItem;
                return (
                  <Card 
                    key={tool.id} 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base group-hover:text-blue-600 transition-colors truncate">
                              {tool.name}
                            </CardTitle>
                            {tool.featured && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                <Star className="h-3 w-3 mr-1" />
                                精选
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3 line-clamp-2 text-sm">
                        {tool.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        size="sm"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        立即访问
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">没有找到匹配的工具</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('全部');
                  }}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* 热门推荐 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">热门推荐</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotTools.map((tool, index) => (
                  <div 
                    key={tool.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.category}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 侧边栏广告 */}
            {sidebarAds.map((ad) => (
              <SidebarAd key={ad.id} config={ad} />
            ))}

            {/* 最新更新 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-base">最新动态</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">新增 Sora 工具介绍</p>
                    <p className="text-xs text-gray-500">2024-01-15</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">更新 Runway 功能说明</p>
                    <p className="text-xs text-gray-500">2024-01-10</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">新增 3 个视频编辑工具</p>
                    <p className="text-xs text-gray-500">2024-01-05</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速链接 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-base">快速链接</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/about" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                  <ChevronRight className="h-3 w-3" />
                  关于我们
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                  <ChevronRight className="h-3 w-3" />
                  工具提交
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                  <ChevronRight className="h-3 w-3" />
                  合作洽谈
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
                  <ChevronRight className="h-3 w-3" />
                  常见问题
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-12">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 品牌 */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI视频工具集合
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                精选优质AI视频创作工具，助力创意视频制作
              </p>
            </div>

            {/* 快速导航 */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">快速导航</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">首页</Link></li>
                <li><Link href="/about" className="hover:text-blue-600 transition-colors">关于我们</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">工具分类</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">最新更新</Link></li>
              </ul>
            </div>

            {/* 热门分类 */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">热门分类</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">视频生成</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">视频编辑</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">数字人</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">视频增强</Link></li>
              </ul>
            </div>

            {/* 联系我们 */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">联系我们</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contact@aivideotools.com" className="hover:text-blue-600 transition-colors">
                    contact@aivideotools.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>商务合作</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>广告投放</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 AI视频工具集合. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-blue-600 transition-colors">隐私政策</Link>
              <span>|</span>
              <Link href="#" className="hover:text-blue-600 transition-colors">服务条款</Link>
              <span>|</span>
              <Link href="#" className="hover:text-blue-600 transition-colors">网站地图</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
