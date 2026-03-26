'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Video, Search, Film, Wand2, Palette, Music, Info, Clock, ChevronRight, Mail, Sparkles, X } from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
  tags: string[];
  featured?: boolean;
  features?: string[];
  pricing?: string;
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
    featured: true,
    features: ['Gen-3 Alpha 视频生成', 'Motion Brush 运动画笔', '视频背景移除', '绿幕抠像', '视频放大增强'],
    pricing: '免费试用，付费版 $12/月起'
  },
  {
    id: '2',
    name: 'Pika Labs',
    description: '强大的AI视频生成工具，支持文字生成视频和图片生成视频，生成速度快，效果好。',
    url: 'https://pika.art/',
    category: '视频生成',
    icon: '✨',
    tags: ['文生视频', '图生视频', '创意视频'],
    featured: true,
    features: ['文本生成视频', '图片生成视频', '视频风格转换', '运动控制', 'Lip Sync 口型同步'],
    pricing: '免费试用，付费版 $8/月起'
  },
  {
    id: '3',
    name: 'Sora',
    description: 'OpenAI推出的革命性AI视频生成模型，能够根据文本生成长达60秒的高质量视频。',
    url: 'https://openai.com/sora',
    category: '视频生成',
    icon: '🌟',
    tags: ['文生视频', '长视频', '高质量'],
    featured: true,
    features: ['最长60秒视频生成', '复杂场景理解', '多角色生成', '物理规律模拟', '高清画质输出'],
    pricing: '需订阅 ChatGPT Plus ($20/月)'
  },
  {
    id: '4',
    name: 'Stable Video Diffusion',
    description: 'Stability AI开源的视频生成模型，支持图生视频，社区活跃，可本地部署。',
    url: 'https://stability.ai/',
    category: '视频生成',
    icon: '🎨',
    tags: ['开源', '图生视频', '可部署'],
    features: ['开源免费', '本地部署', '社区支持', '可定制训练', '多种模型版本'],
    pricing: '开源免费'
  },
  {
    id: '5',
    name: 'HeyGen',
    description: 'AI数字人视频生成平台，支持多语言口播视频制作，适合营销、教育等场景。',
    url: 'https://www.heygen.com/',
    category: '数字人',
    icon: '👤',
    tags: ['数字人', '口播视频', '多语言'],
    featured: true,
    features: ['100+数字人模板', '300+语言支持', '语音克隆', '视频翻译', 'Instant Avatar 定制'],
    pricing: '免费试用，付费版 $24/月起'
  },
  {
    id: '6',
    name: 'D-ID',
    description: 'AI驱动的数字人视频生成工具，支持照片转视频、AI头像生成等功能。',
    url: 'https://www.d-id.com/',
    category: '数字人',
    icon: '🎭',
    tags: ['数字人', '照片转视频', 'AI头像'],
    features: ['照片生成视频', 'AI头像生成', '实时数字人', 'API接口', '批量处理'],
    pricing: '免费试用，付费版 $5.9/月起'
  },
  {
    id: '7',
    name: 'Synthesia',
    description: '企业级AI视频生成平台，提供丰富的数字人模板，支持140+语言的视频制作。',
    url: 'https://www.synthesia.io/',
    category: '数字人',
    icon: '🎪',
    tags: ['企业级', '多语言', '模板丰富'],
    features: ['150+数字人', '140+语言', '自定义数字人', 'PPT转视频', '团队协作'],
    pricing: '企业定制，$22/月起'
  },
  {
    id: '8',
    name: '剪映专业版',
    description: '字节跳动推出的专业视频编辑软件，内置AI功能，支持智能字幕、一键成片等。',
    url: 'https://www.capcut.cn/',
    category: '视频编辑',
    icon: '✂️',
    tags: ['智能剪辑', '智能字幕', '一键成片'],
    featured: true,
    features: ['智能字幕生成', '一键成片', 'AI特效', '音频降噪', '多轨编辑'],
    pricing: '免费使用，会员 25元/月'
  },
  {
    id: '9',
    name: 'Descript',
    description: '革命性的AI视频编辑工具，支持文字编辑视频、AI配音、自动转录等功能。',
    url: 'https://www.descript.com/',
    category: '视频编辑',
    icon: '📝',
    tags: ['文字编辑视频', 'AI配音', '自动转录'],
    features: ['文字编辑视频', 'AI语音克隆', '自动转录', '屏幕录制', '团队协作'],
    pricing: '免费试用，付费版 $12/月起'
  },
  {
    id: '10',
    name: 'Vrew',
    description: '韩国团队开发的AI视频编辑工具，支持AI字幕、AI剪辑、智能语音识别等功能。',
    url: 'https://vrew.com/',
    category: '视频编辑',
    icon: '🎯',
    tags: ['AI字幕', '智能剪辑', '语音识别'],
    features: ['AI自动字幕', '语音识别剪辑', '多语言翻译', '模板库', '一键生成'],
    pricing: '免费试用，付费版 9900韩元/月'
  },
  {
    id: '11',
    name: 'Topaz Video AI',
    description: '专业的AI视频增强工具，支持视频放大、降噪、帧插值、稳定等功能。',
    url: 'https://www.topazlabs.com/topaz-video-ai',
    category: '视频增强',
    icon: '💎',
    tags: ['视频放大', '降噪', '帧插值'],
    features: ['4K/8K视频放大', 'AI降噪', '帧插值', '视频稳定', '慢动作生成'],
    pricing: '一次性购买 $299'
  },
  {
    id: '12',
    name: 'CapCut',
    description: '剪映国际版，功能强大的移动端视频编辑工具，内置丰富的AI功能。',
    url: 'https://www.capcut.com/',
    category: '视频编辑',
    icon: '📱',
    tags: ['移动端', 'AI特效', '模板丰富'],
    features: ['移动端编辑', 'AI特效', '模板库', '自动字幕', '音乐同步'],
    pricing: '免费使用，Pro版 $7.99/月'
  },
  {
    id: '13',
    name: 'Pictory',
    description: 'AI驱动的视频内容创作平台，支持文章转视频、长视频转短视频等功能。',
    url: 'https://pictory.ai/',
    category: '视频生成',
    icon: '📄',
    tags: ['文章转视频', '视频剪辑', '内容创作'],
    features: ['文章转视频', '长视频转短视频', '自动字幕', '品牌定制', '批量处理'],
    pricing: '免费试用，付费版 $19/月起'
  },
  {
    id: '14',
    name: 'InVideo',
    description: '在线视频制作平台，提供丰富的模板和AI功能，适合营销视频快速制作。',
    url: 'https://invideo.io/',
    category: '视频生成',
    icon: '🎥',
    tags: ['在线制作', '模板库', '营销视频'],
    features: ['5000+模板', 'AI脚本生成', '文字转视频', '品牌套件', '团队协作'],
    pricing: '免费试用，付费版 $15/月起'
  },
  {
    id: '15',
    name: 'Luma AI',
    description: '专业的AI 3D内容创作工具，支持视频转3D、NeRF渲染等前沿技术。',
    url: 'https://lumalabs.ai/',
    category: '3D视频',
    icon: '🌐',
    tags: ['3D生成', 'NeRF', '视频转3D'],
    features: ['视频转3D', 'NeRF渲染', 'Dream Machine', '3D场景重建', 'AR导出'],
    pricing: '免费试用，付费版按量计费'
  },
  {
    id: '16',
    name: 'Kaiber',
    description: 'AI驱动的创意视频生成平台，支持音乐可视化、风格转换等艺术创作。',
    url: 'https://kaiber.ai/',
    category: '创意视频',
    icon: '🎵',
    tags: ['音乐可视化', '艺术创作', '风格转换'],
    features: ['音乐可视化', '风格转换', '图片动画化', '故事板生成', '创意模板'],
    pricing: '免费试用，付费版 $5/月起'
  },
  {
    id: '17',
    name: 'Opus Clip',
    description: 'AI短视频剪辑工具，自动从长视频中提取精彩片段，适合内容创作者。',
    url: 'https://opus.pro/',
    category: '视频编辑',
    icon: '🎞️',
    tags: ['自动剪辑', '短视频', '内容创作'],
    features: ['自动提取精彩片段', 'AI字幕', '社交媒体适配', '批量处理', '分析报告'],
    pricing: '免费试用，付费版 $9.99/月起'
  },
  {
    id: '18',
    name: 'Fliki',
    description: 'AI文字转视频工具，支持3000+AI语音，适合快速制作营销和培训视频。',
    url: 'https://fliki.ai/',
    category: '视频生成',
    icon: '🔊',
    tags: ['文字转视频', 'AI配音', '营销视频'],
    features: ['文字转视频', '3000+AI语音', '75+语言', '自动字幕', '品牌定制'],
    pricing: '免费试用，付费版 $21/月起'
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
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

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
                  className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedTool(tool)}
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
                            {tool.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tool.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          
                          <span className="text-xs text-blue-600 flex items-center gap-1 flex-shrink-0">
                            查看详情
                            <ChevronRight className="h-3 w-3" />
                          </span>
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
              <CardContent className="pt-4 pb-3">
                <h3 className="font-semibold text-sm mb-3">热门推荐</h3>
                <div className="space-y-2">
                  {hotTools.map((tool) => (
                    <div 
                      key={tool.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedTool(tool)}
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
                </div>
              </CardContent>
            </Card>

            {/* 最新更新 */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-sm">最新动态</h3>
                </div>
                <div className="space-y-2 text-sm">
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
                </div>
              </CardContent>
            </Card>

            {/* 联系我们 */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-4 pb-3">
                <h3 className="font-semibold text-sm mb-2">联系我们</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>business@aivideotools.com</span>
                  </div>
                  <p className="text-xs text-gray-500">欢迎商务合作与工具推荐</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
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

      {/* Tool Detail Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {selectedTool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-xl">{selectedTool.name}</DialogTitle>
                      {selectedTool.featured && (
                        <Badge className="bg-blue-600">推荐</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selectedTool.category}</Badge>
                      {selectedTool.pricing && (
                        <Badge variant="secondary">{selectedTool.pricing}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* 描述 */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">简介</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedTool.description}
                  </p>
                </div>

                {/* 功能特点 */}
                {selectedTool.features && selectedTool.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">主要功能</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 标签 */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 访问按钮 */}
                <div className="pt-4 flex gap-3">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                    onClick={() => window.open(selectedTool.url, '_blank')}
                  >
                    访问官网
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTool(null)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
