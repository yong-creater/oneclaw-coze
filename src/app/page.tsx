'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Video, Search, Film, Wand2, Palette, Music, Info, Clock, ChevronRight, Mail, Sparkles, Mic, Image as ImageIcon, FileVideo, Zap, Users, TrendingUp, Copy, Check, X, Heart, Target, BookOpen, Rocket, Lightbulb, Code, MessageSquare, BarChart, PenTool, Headphones, GraduationCap, Megaphone } from 'lucide-react';
import { prompts, promptCategories, PromptItem } from '@/data/prompts';
import { aiTools, ToolItem } from '@/data/tools';
import { aiSkills, getSkillCategories, SkillItem } from '@/data/skills';

// 格式化数字显示
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 使用导入的工具数据

// 使用 useMemo 缓存分类数据
const getCategories = () => [
  { name: '全部', icon: Video, count: aiTools.length },
  { name: '视频生成', icon: Wand2, count: aiTools.filter(t => t.category === '视频生成').length },
  { name: '数字人', icon: Users, count: aiTools.filter(t => t.category === '数字人').length },
  { name: '视频编辑', icon: Film, count: aiTools.filter(t => t.category === '视频编辑').length },
  { name: 'AI字幕', icon: FileVideo, count: aiTools.filter(t => t.category === 'AI字幕').length },
  { name: 'AI音乐', icon: Music, count: aiTools.filter(t => t.category === 'AI音乐').length },
  { name: '动画制作', icon: Palette, count: aiTools.filter(t => t.category === '动画制作').length },
];

// 热门工具
const hotTools = aiTools.filter(t => t.featured).slice(0, 6);

// 工具卡片组件 - 使用 memo 优化
const ToolCard = memo(function ToolCard({ 
  tool, 
  onClick 
}: { 
  tool: ToolItem; 
  onClick: () => void;
}) {
  // 根据分类获取渐变色
  const getGradientColors = (category: string) => {
    const gradients: Record<string, string> = {
      '视频生成': 'from-violet-500 to-purple-600',
      '数字人': 'from-pink-500 to-rose-600',
      '视频编辑': 'from-blue-500 to-cyan-600',
      'AI字幕': 'from-emerald-500 to-teal-600',
      'AI配音': 'from-orange-500 to-amber-600',
      'AI音乐': 'from-fuchsia-500 to-pink-600',
      '动画制作': 'from-red-500 to-orange-500',
      '其他': 'from-gray-400 to-slate-500',
    };
    return gradients[category] || gradients['其他'];
  };

  // 获取工具名称首字母
  const getInitial = (name: string) => {
    // 移除常见前缀
    const cleanName = name.replace(/^(AI|智能|腾讯|快手|字节)/, '');
    return cleanName.charAt(0).toUpperCase();
  };

  // 判断是否使用真实logo
  const useRealLogo = tool.logo && tool.logo.startsWith('http');

  return (
    <Card 
      className="hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 图标 - 真实logo或首字母渐变 */}
          <div className={`w-14 h-14 ${useRealLogo ? 'bg-white' : `bg-gradient-to-br ${getGradientColors(tool.category)}`} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-slate-100 dark:border-slate-700`}>
            {useRealLogo ? (
              <img 
                src={tool.logo} 
                alt={tool.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // 加载失败时回退到首字母
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = `w-14 h-14 bg-gradient-to-br ${getGradientColors(tool.category)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`;
                    parent.innerHTML = `<span className="text-white text-xl font-bold">${getInitial(tool.name)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-white text-xl font-bold">{getInitial(tool.name)}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {tool.name}
              </h3>
              {tool.featured && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-xs flex-shrink-0 hover:from-red-600 hover:to-orange-600 px-2">
                  推荐
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mb-2">
              <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600">
                {tool.category}
              </Badge>
              {tool.pricing && tool.pricing.includes('免费') && (
                <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                  免费
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              {tool.description}
            </p>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {tool.tags.slice(0, 2).map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                    +{tool.tags.length - 2}
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-0.5 flex-shrink-0 font-medium">
                详情
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// 技能卡片组件
const SkillCard = memo(function SkillCard({ 
  skill, 
  onClick 
}: { 
  skill: SkillItem; 
  onClick: () => void;
}) {
  return (
    <Card 
      className="hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {skill.icon.length <= 2 ? skill.icon : skill.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {skill.name}
              </h3>
              {skill.featured && (
                <Badge className="bg-blue-500 text-xs flex-shrink-0 px-2">
                  ★ 精选
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-2">
              {skill.identifier}
            </p>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              {skill.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{formatNumber(skill.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{formatNumber(skill.favorites)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{formatNumber(skill.installs)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// 技能详情弹窗组件
const SkillDetailDialog = memo(function SkillDetailDialog({ 
  skill, 
  onClose 
}: { 
  skill: SkillItem | null; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<'agent' | 'human' | null>(null);
  const [activeTab, setActiveTab] = useState<'agent' | 'human'>('agent');

  const handleCopy = async (type: 'agent' | 'human') => {
    if (skill) {
      await navigator.clipboard.writeText(skill.installGuide[type]);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (!skill) return null;

  return (
    <Dialog open={!!skill} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* 头部区域 */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {skill.icon.length <= 2 ? skill.icon : skill.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">{skill.name}</DialogTitle>
                  {skill.featured && (
                    <Badge className="bg-blue-500 text-xs px-2">★ 精选</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {skill.identifier}
                </p>
              </div>
              {/* 收藏和关闭按钮 */}
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Heart className="h-4 w-4 text-slate-400" />
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="px-5 py-4 space-y-4">
            {/* 版本和标签 */}
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                {skill.version}
              </Badge>
              {skill.featured && (
                <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                  ⚡ 加速下载可用
                </Badge>
              )}
            </div>

            {/* 描述 */}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {skill.description}
              </p>
            </div>

            {/* 来源 */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              该技能数据来源于
              {skill.sourceUrl ? (
                <a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                  {skill.source}
                </a>
              ) : (
                <span className="ml-1">{skill.source}</span>
              )}
              ，作者是 <span className="font-medium">{skill.author}</span>
            </div>

            {/* 数据统计 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(skill.downloads)}</p>
                <p className="text-xs text-slate-500">下载量</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(skill.favorites)}</p>
                <p className="text-xs text-slate-500">收藏</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(skill.installs)}</p>
                <p className="text-xs text-slate-500">安装量</p>
              </div>
            </div>

            {/* 安装方式 */}
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">安装方式</h4>
              
              {/* 切换标签 */}
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg mb-3">
                <button
                  onClick={() => setActiveTab('agent')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'agent' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🤖 我是 Agent
                </button>
                <button
                  onClick={() => setActiveTab('human')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'human' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👨 我是 Human
                </button>
              </div>

              {/* 安装指南内容 */}
              {activeTab === 'agent' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    将此提示发送给你的 Agent，以安装 {skill.name}
                  </p>
                  <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg p-3 pr-12">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
                      {skill.installGuide.agent}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy('agent')}
                      className="absolute right-2 top-2 h-7 px-2"
                    >
                      {copied === 'agent' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'human' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    手动安装指南
                  </p>
                  <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg p-3 pr-12">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
                      {skill.installGuide.human}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy('human')}
                      className="absolute right-2 top-2 h-7 px-2"
                    >
                      {copied === 'human' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 标签 */}
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">标签</h4>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 更新时间 */}
            <div className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
              更新时间：{skill.updatedAt}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// 内联广告组件
// 工具详情弹窗组件
const ToolDetailDialog = memo(function ToolDetailDialog({ 
  tool, 
  onClose,
  onVisit 
}: { 
  tool: ToolItem | null; 
  onClose: () => void;
  onVisit: (url: string) => void;
}) {
  if (!tool) return null;

  // 根据分类获取渐变色
  const getGradientColors = (category: string) => {
    const gradients: Record<string, string> = {
      '视频生成': 'from-violet-500 to-purple-600',
      '数字人': 'from-pink-500 to-rose-600',
      '视频编辑': 'from-blue-500 to-cyan-600',
      'AI字幕': 'from-emerald-500 to-teal-600',
      'AI配音': 'from-orange-500 to-amber-600',
      '视频增强': 'from-indigo-500 to-blue-600',
      '3D/VR': 'from-fuchsia-500 to-pink-600',
      '创意工具': 'from-red-500 to-orange-500',
      '素材资源': 'from-teal-500 to-green-600',
      '录制工具': 'from-slate-500 to-gray-600',
      '其他': 'from-gray-400 to-slate-500',
    };
    return gradients[category] || gradients['其他'];
  };

  // 获取工具名称首字母
  const getInitial = (name: string) => {
    const cleanName = name.replace(/^(AI|智能|腾讯|快手|字节)/, '');
    return cleanName.charAt(0).toUpperCase();
  };

  // 判断是否使用真实logo
  const useRealLogo = tool.logo && tool.logo.startsWith('http');
  
  return (
    <Dialog open={!!tool} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 bg-white dark:bg-slate-800 overflow-hidden">
        {/* 滚动内容区域 */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* 头部区域 - 固定内边距 */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-5">
              {/* 弹窗图标 - 真实logo或首字母渐变 */}
              <div className={`w-20 h-20 ${useRealLogo ? 'bg-white' : `bg-gradient-to-br ${getGradientColors(tool.category)}`} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden border border-slate-100 dark:border-slate-700`}>
              {useRealLogo ? (
                <img 
                  src={tool.logo} 
                  alt={tool.name}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className = `w-20 h-20 bg-gradient-to-br ${getGradientColors(tool.category)} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`;
                      parent.innerHTML = `<span className="text-white text-3xl font-bold">${getInitial(tool.name)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-white text-3xl font-bold">{getInitial(tool.name)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">{tool.name}</DialogTitle>
                {tool.featured && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500">推荐</Badge>
                )}
                {tool.pricing && tool.pricing.includes('免费') && (
                  <Badge className="bg-emerald-500">免费</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="border-slate-200 dark:border-slate-600">{tool.category}</Badge>
                {tool.platform && (
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">{tool.platform}</Badge>
                )}
                {tool.pricing && (
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">{tool.pricing}</Badge>
                )}
              </div>
            </div>
            </div>
          </div>
        
        {/* 内容区域 */}
        <div className="px-6 py-5 space-y-5">
          {/* 详细介绍 */}
          {tool.introduction && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-red-500" />
                详细介绍
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {tool.introduction}
              </p>
            </div>
          )}

          {/* 主要功能 */}
          {tool.features && tool.features.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                主要功能
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {tool.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex-shrink-0"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用步骤 */}
          {tool.usage && tool.usage.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-red-500" />
                如何使用
              </h4>
              <div className="space-y-2">
                {tool.usage.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 适用人群 */}
          {tool.audience && tool.audience.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                适用人群
              </h4>
              <div className="flex flex-wrap gap-2">
                {tool.audience.map((item, index) => (
                  <Badge key={index} className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 dark:from-red-900/30 dark:to-orange-900/30 dark:text-red-300 border border-red-100 dark:border-red-800">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          <div>
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">标签</h4>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="pt-4 flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2"
              onClick={() => onVisit(tool.url)}
            >
              访问官网
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              className="border-slate-200 dark:border-slate-700"
              onClick={onClose}
            >
              关闭
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// 热门推荐项组件
const HotToolItem = memo(function HotToolItem({ 
  tool, 
  onClick 
}: { 
  tool: ToolItem; 
  onClick: () => void;
}) {
  // 根据分类获取渐变色
  const getGradientColors = (category: string) => {
    const gradients: Record<string, string> = {
      '视频生成': 'from-violet-500 to-purple-600',
      '数字人': 'from-pink-500 to-rose-600',
      '视频编辑': 'from-blue-500 to-cyan-600',
      'AI字幕': 'from-emerald-500 to-teal-600',
      'AI配音': 'from-orange-500 to-amber-600',
      '视频增强': 'from-indigo-500 to-blue-600',
      '3D/VR': 'from-fuchsia-500 to-pink-600',
      '创意工具': 'from-red-500 to-orange-500',
      '素材资源': 'from-teal-500 to-green-600',
      '录制工具': 'from-slate-500 to-gray-600',
      '其他': 'from-gray-400 to-slate-500',
    };
    return gradients[category] || gradients['其他'];
  };

  const getInitial = (name: string) => {
    const cleanName = name.replace(/^(AI|智能|腾讯|快手|字节)/, '');
    return cleanName.charAt(0).toUpperCase();
  };

  // 判断是否使用真实logo
  const useRealLogo = tool.logo && tool.logo.startsWith('http');

  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-10 h-10 ${useRealLogo ? 'bg-white border border-slate-100 dark:border-slate-700' : `bg-gradient-to-br ${getGradientColors(tool.category)}`} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        {useRealLogo ? (
          <img 
            src={tool.logo} 
            alt={tool.name}
            className="w-7 h-7 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-white text-sm font-bold">{getInitial(tool.name)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{tool.name}</p>
        <p className="text-xs text-slate-500">{tool.category}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </div>
  );
});

// 提示词卡片组件
const PromptCard = memo(function PromptCard({ 
  prompt, 
  onClick 
}: { 
  prompt: PromptItem; 
  onClick: () => void;
}) {
  return (
    <Card 
      className="hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
            {promptCategories.find(c => c.name === prompt.category)?.icon || '📝'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{prompt.title}</h3>
              {prompt.featured && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-[10px] px-1.5">推荐</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{prompt.description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
});

// 提示词详情弹窗
const PromptDetailDialog = memo(function PromptDetailDialog({ 
  prompt, 
  onClose 
}: { 
  prompt: PromptItem | null; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (prompt) {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!prompt) return null;
  
  return (
    <Dialog open={!!prompt} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {promptCategories.find(c => c.name === prompt.category)?.icon || '📝'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">{prompt.title}</DialogTitle>
                {prompt.featured && <Badge className="bg-gradient-to-r from-red-500 to-orange-500">推荐</Badge>}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{prompt.description}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600">{prompt.category}</Badge>
                {prompt.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Button size="sm" variant="secondary" onClick={handleCopy} className="absolute right-2 top-2 z-10 gap-1.5">
              {copied ? <><Check className="h-4 w-4 text-emerald-500"/>已复制</> : <><Copy className="h-4 w-4"/>复制</>}
            </Button>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 pt-12 overflow-x-auto">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCopy} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-1.5">
              {copied ? <><Check className="h-4 w-4"/>已复制</> : <><Copy className="h-4 w-4"/>复制提示词</>}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700">关闭</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// 提示词库弹窗组件
const PromptsDialog = memo(function PromptsDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === '全部' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">AI视频创作提示词库</DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">精选 {prompts.length} 个专业提示词模板</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          {/* 搜索和筛选 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {promptCategories.slice(0, 6).map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={selectedCategory === cat.name ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white h-8 text-xs" : "h-8 text-xs border-slate-200 dark:border-slate-700"}
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 提示词列表 */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} onClick={() => setSelectedPrompt(prompt)} />
              ))}
            </div>
            {filteredPrompts.length === 0 && (
              <div className="text-center py-8 text-slate-500">没有找到匹配的提示词</div>
            )}
          </div>
        </div>

        {/* 提示词详情弹窗 */}
        <PromptDetailDialog prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
      </DialogContent>
    </Dialog>
  );
});

// 关于我们弹窗组件
const AboutDialog = memo(function AboutDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 bg-white dark:bg-slate-800 overflow-hidden">
        {/* 滚动内容区域 */}
        <div className="overflow-y-auto max-h-[85vh]">
          {/* 头部区域 */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-3xl">
                🦞
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">一站式 AI 工具与资源导航平台</p>
              </div>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="px-6 py-5 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                关于我们
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                OneClaw 是一个综合性的 AI 工具与资源导航平台，致力于为用户提供最全面、最实用的 AI 应用资源。我们精心收录了数百款优质 AI 工具，涵盖 AI 视频创作、AI 图像生成、AI 写作助手、AI 编程工具、AI 音频处理等多个热门领域，同时提供丰富的提示词模板和技能资源，帮助用户快速上手并高效使用各类 AI 产品。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                我们的使命
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                让每一位用户都能轻松发现、了解并使用最适合的 AI 工具。无论你是专业创作者、开发者、设计师，还是刚接触 AI 的新手，都能在这里找到适合你的工具、提示词和技能资源，释放创意潜能，提升工作效率。
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                平台特色
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🎬', title: '精选 AI 工具', desc: '视频、图像、写作、编程等多领域' },
                  { icon: '📝', title: '提示词库', desc: '专业提示词模板，即用即走' },
                  { icon: '🤖', title: 'AI 技能', desc: '实用 AI 技能与应用场景' },
                  { icon: '🔍', title: '智能分类', desc: '多维度精细分类筛选' },
                  { icon: '💡', title: '使用指南', desc: '详细功能介绍与使用教程' },
                  { icon: '⭐', title: '推荐精选', desc: '热门工具与优质资源推荐' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-red-500" />
                内容覆盖
              </h3>
              <div className="flex flex-wrap gap-2">
                {['AI 视频生成', 'AI 图像创作', 'AI 写作助手', 'AI 编程工具', 'AI 音频处理', 'AI 数字人', 'AI 翻译', 'AI 办公', '提示词工程', 'AI 技能教程'].map((tag, i) => (
                  <Badge key={i} className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 dark:from-red-900/30 dark:to-orange-900/30 dark:text-red-300 border border-red-100 dark:border-red-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-red-500" />
                <span>联系邮箱：</span>
                <a href="mailto:1017760688@qq.com" className="text-red-600 dark:text-red-400 hover:underline">
                  1017760688@qq.com
                </a>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                © 2024 OneClaw. 欢迎商务合作与工具推荐
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                关闭
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'prompts' | 'skills'>('tools');
  const [showAbout, setShowAbout] = useState(false);

  // 缓存分类数据
  const categories = useMemo(() => getCategories(), []);
  const skillCategories = useMemo(() => getSkillCategories(), []);

  // 缓存过滤后的工具列表
  const filteredTools = useMemo(() => {
    return aiTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // 缓存过滤后的提示词列表
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === '全部' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // 缓存事件处理函数
  const handleToolClick = useCallback((tool: ToolItem) => {
    setSelectedTool(tool);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedTool(null);
  }, []);

  const handleVisit = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('全部');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* 气泡效果 */}
                <div className="absolute inset-0 overflow-visible pointer-events-none">
                  <div className="bubble"></div>
                  <div className="bubble"></div>
                  <div className="bubble"></div>
                </div>
                <span className="text-4xl lobster-animate relative z-10">🦞</span>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">一站式 AI 工具与资源导航</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-slate-600 dark:text-slate-300"
                onClick={() => setShowAbout(true)}
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">关于我们</span>
              </Button>
              <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {activeTab === 'tools' ? `${aiTools.length} 个工具` : activeTab === 'prompts' ? `${prompts.length} 个提示词` : `${aiSkills.length} 个技能`}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'tools' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tools')}
            className={activeTab === 'tools' ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2' : 'border-slate-200 dark:border-slate-700 gap-2'}
          >
            <Video className="h-4 w-4" />
            工具库
          </Button>
          <Button
            variant={activeTab === 'prompts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('prompts')}
            className={activeTab === 'prompts' ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2' : 'border-slate-200 dark:border-slate-700 gap-2'}
          >
            <Sparkles className="h-4 w-4" />
            提示词库
          </Button>
          <Button
            variant={activeTab === 'skills' ? 'default' : 'outline'}
            onClick={() => setActiveTab('skills')}
            className={activeTab === 'skills' ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2' : 'border-slate-200 dark:border-slate-700 gap-2'}
          >
            <Lightbulb className="h-4 w-4" />
            技能库
          </Button>
        </div>

        {/* Tools Tab Content */}
        {activeTab === 'tools' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索工具名称、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.name;
                return (
                  <Button
                    key={category.name}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className={isActive ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white" : "border-slate-200 dark:border-slate-700"}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {category.name}
                <span className="ml-1.5 text-xs opacity-60">({category.count})</span>
              </Button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
              ))}
            </div>

            {/* No Results */}
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">没有找到匹配的工具</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={handleClearFilters}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Sticky定位 */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            {/* 热门推荐 */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">热门推荐</h3>
                </div>
                <div className="space-y-1">
                  {hotTools.map((tool) => (
                    <HotToolItem key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最新更新 */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">最新动态</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p>新增 Kling 可灵、Vidu 等国产工具</p>
                      <p className="text-xs text-slate-400">2024-03-20</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p>新增 AI字幕、AI配音分类</p>
                      <p className="text-xs text-slate-400">2024-03-15</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p>工具数量扩充至66个</p>
                      <p className="text-xs text-slate-400">2024-03-10</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 联系我们 */}
            <Card className="bg-gradient-to-br from-red-600 to-orange-500 dark:from-red-700 dark:to-orange-600 border-0 text-white">
              <CardContent className="pt-4 pb-3">
                <h3 className="font-semibold text-sm mb-2">联系我们</h3>
                <div className="text-sm text-white/90 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">1017760688@qq.com</span>
                  </div>
                  <p className="text-xs text-white/70">欢迎商务合作与工具推荐</p>
                </div>
              </CardContent>
            </Card>

            {/* 广告位 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-amber-100 dark:border-slate-600">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="font-medium text-sm text-slate-800 dark:text-white mb-1">高效视频工作流</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">一站式解决视频创作需求</p>
                <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  立即体验
                </Button>
              </div>
            </div>
            </div>{/* sticky容器结束 */}
          </div>
        </div>
          </>
        )}

        {/* Prompts Tab Content */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            {/* 提示词库介绍 */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-red-100 dark:border-slate-700">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI视频提示词库</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">精选 {prompts.length} 个专业提示词模板，助你高效创作</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              {promptCategories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={selectedCategory === cat.name ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-1" : "border-slate-200 dark:border-slate-700 gap-1"}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span className="text-xs opacity-60">({cat.count})</span>
                </Button>
              ))}
            </div>

            {/* 提示词列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        💬
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{prompt.title}</h3>
                          <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex-shrink-0">
                            {prompt.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{prompt.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skills Tab Content */}
        {activeTab === 'skills' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索技能名称、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {skillCategories.map((category) => {
                const isActive = selectedCategory === category.name;
                return (
                  <Button
                    key={category.name}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className={isActive ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white' : 'border-slate-200 dark:border-slate-700'}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                    <Badge variant="secondary" className="ml-1.5 bg-white/20 text-white border-0">
                      {category.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSkills
                .filter(skill => {
                  const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       skill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchesCategory = selectedCategory === '全部' || skill.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((skill) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    onClick={() => setSelectedSkill(skill)}
                  />
                ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦞</span>
              <span className="font-medium text-slate-900 dark:text-white"><span className="text-red-500">One</span><span className="text-orange-500">Claw</span></span>
            </div>
            <p>© 2024 <span className="text-red-500">One</span><span className="text-orange-500">Claw</span>. 精选{aiTools.length}款优质AI视频创作工具</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('prompts')} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                提示词库
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button onClick={() => setShowAbout(true)} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                关于我们
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a href="mailto:1017760688@qq.com" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                商务合作
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Tool Detail Dialog */}
      <ToolDetailDialog 
        tool={selectedTool} 
        onClose={handleCloseDialog}
        onVisit={handleVisit}
      />

      {/* Skill Detail Dialog */}
      <SkillDetailDialog 
        skill={selectedSkill} 
        onClose={() => setSelectedSkill(null)}
      />

      {/* About Dialog */}
      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />

      {/* Prompt Detail Dialog */}
      <Dialog open={selectedPrompt !== null} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedPrompt && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  {selectedPrompt.title}
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedPrompt.description}</p>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {/* 提示词内容 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">提示词内容</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPrompt.content);
                        // 简单的成功提示
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.textContent;
                        btn.textContent = '✓ 已复制';
                        btn.disabled = true;
                        setTimeout(() => {
                          btn.textContent = originalText;
                          btn.disabled = false;
                        }, 1500);
                      }}
                      className="h-7 text-xs gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      复制提示词
                    </Button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 max-h-[40vh] overflow-y-auto">
                    <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                      {selectedPrompt.content}
                    </pre>
                  </div>
                </div>
                
                {/* 标签 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 底部按钮 */}
              <div className="flex-shrink-0 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPrompt(null)}
                  className="border-slate-200 dark:border-slate-700"
                >
                  关闭
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPrompt.content);
                    setSelectedPrompt(null);
                  }}
                >
                  复制并关闭
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
