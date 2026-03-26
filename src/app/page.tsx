'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Video, Search, Film, Wand2, Palette, Music, Info, Clock, ChevronRight, Mail, Sparkles } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  AI视频工具集合
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/about">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">关于我们</span>
                </Button>
              </Link>
              <Badge variant="secondary">
                {aiTools.length} 个工具
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索工具名称、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.name;
                  return (
                    <Button
                      key={category.name}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                      className={isActive ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {category.name}
                      <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* 图标 */}
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {tool.icon}
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {tool.name}
                          </h3>
                          {tool.featured && (
                            <Badge variant="default" className="bg-blue-600 text-xs flex-shrink-0">
                              推荐
                            </Badge>
                          )}
                        </div>
                        
                        <Badge variant="outline" className="text-xs mb-2">
                          {tool.category}
                        </Badge>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {tool.description}
                        </p>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <Button 
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 gap-1 flex-shrink-0"
                            onClick={() => window.open(tool.url, '_blank')}
                          >
                            访问
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">没有找到匹配的工具</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
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
          <div className="hidden lg:block w-72 space-y-4">
            {/* 热门推荐 */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">热门推荐</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hotTools.map((tool) => (
                  <div 
                    key={tool.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center text-sm flex-shrink-0">
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

            {/* 最新更新 */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-sm font-semibold">最新动态</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p>新增 Sora 工具介绍</p>
                    <p className="text-xs text-gray-500">2024-01-15</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p>更新 Runway 功能说明</p>
                    <p className="text-xs text-gray-500">2024-01-10</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p>新增 3 个视频编辑工具</p>
                    <p className="text-xs text-gray-500">2024-01-05</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 联系我们 */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">联系我们</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>business@aivideotools.com</span>
                </div>
                <p className="text-xs text-gray-500">欢迎商务合作与工具推荐</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">AI视频工具集合</span>
            </div>
            <p>© 2024 AI视频工具集合. 精选优质AI视频创作工具</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                关于我们
              </Link>
              <span className="text-gray-300">|</span>
              <a href="mailto:business@aivideotools.com" className="hover:text-blue-600 transition-colors">
                商务合作
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
