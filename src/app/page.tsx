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
import { ExternalLink, Video, Search, Film, Wand2, Palette, Music, Info, Clock, ChevronRight, Mail, Sparkles, Mic, Image as ImageIcon, FileVideo, Zap, Users, TrendingUp } from 'lucide-react';

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
  platform?: string;
}

// AI视频工具数据 - 全面扩充版
const aiTools: ToolItem[] = [
  // ========== 视频生成工具 ==========
  {
    id: '1',
    name: 'Runway',
    description: '专业的AI视频生成和编辑平台，Gen-3 Alpha模型可生成超写实视频，支持文生视频、图生视频、视频编辑等多种功能。',
    url: 'https://runwayml.com/',
    category: '视频生成',
    icon: '🎬',
    tags: ['文生视频', '图生视频', '视频编辑'],
    featured: true,
    features: ['Gen-3 Alpha 视频生成', 'Motion Brush 运动画笔', '视频背景移除', '绿幕抠像', '视频放大增强', '多模态编辑'],
    pricing: '免费试用，付费版 $12/月起',
    platform: 'Web'
  },
  {
    id: '2',
    name: 'Pika Labs',
    description: '强大的AI视频生成工具，支持文字生成视频和图片生成视频，生成速度快，效果出色，新推出Pika 2.0模型。',
    url: 'https://pika.art/',
    category: '视频生成',
    icon: '✨',
    tags: ['文生视频', '图生视频', '创意视频'],
    featured: true,
    features: ['文本生成视频', '图片生成视频', '视频风格转换', '运动控制', 'Lip Sync 口型同步', '特效模板'],
    pricing: '免费试用，付费版 $8/月起',
    platform: 'Web/Discord'
  },
  {
    id: '3',
    name: 'Sora',
    description: 'OpenAI推出的革命性AI视频生成模型，能够根据文本生成长达60秒的高质量视频，物理规律模拟逼真。',
    url: 'https://openai.com/sora',
    category: '视频生成',
    icon: '🌟',
    tags: ['文生视频', '长视频', '高质量'],
    featured: true,
    features: ['最长60秒视频生成', '复杂场景理解', '多角色生成', '物理规律模拟', '高清画质输出', '连续动作生成'],
    pricing: '需订阅 ChatGPT Plus ($20/月)',
    platform: 'Web'
  },
  {
    id: '4',
    name: 'Stable Video Diffusion',
    description: 'Stability AI开源的视频生成模型，支持图生视频，社区活跃，可本地部署，支持自定义训练。',
    url: 'https://stability.ai/',
    category: '视频生成',
    icon: '🎨',
    tags: ['开源', '图生视频', '可部署'],
    features: ['开源免费', '本地部署', '社区支持', '可定制训练', '多种模型版本', 'ComfyUI支持'],
    pricing: '开源免费',
    platform: '本地/Web'
  },
  {
    id: '5',
    name: 'Kling 可灵',
    description: '快手推出的AI视频生成模型，支持文生视频和图生视频，生成效果出色，支持最长2分钟视频。',
    url: 'https://klingai.kuaishou.com/',
    category: '视频生成',
    icon: '🎥',
    tags: ['文生视频', '图生视频', '国产'],
    featured: true,
    features: ['最长2分钟视频', '高清画质', '运动笔刷', '首尾帧控制', '多风格支持', '快速生成'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web/APP'
  },
  {
    id: '6',
    name: 'Vidu',
    description: '生数科技推出的AI视频生成工具，支持文生视频和图生视频，生成速度快，适合短视频创作。',
    url: 'https://www.vidu.studio/',
    category: '视频生成',
    icon: '🎬',
    tags: ['文生视频', '图生视频', '国产'],
    features: ['一键生视频', '图片动起来', '多风格模板', '快速生成', '高清输出'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web'
  },
  {
    id: '7',
    name: 'Haiper AI',
    description: '英国团队开发的AI视频生成工具，支持文生视频和图生视频，效果出色，生成速度快。',
    url: 'https://haiper.ai/',
    category: '视频生成',
    icon: '🎬',
    tags: ['文生视频', '图生视频', '创意'],
    features: ['文本生成视频', '图片生成视频', '多种风格', '运动控制', '快速生成'],
    pricing: '免费试用，付费版 $8/月起',
    platform: 'Web'
  },
  {
    id: '8',
    name: 'Luma Dream Machine',
    description: 'Luma AI推出的视频生成模型，支持文生视频和图生视频，3D理解能力强，适合创意视频制作。',
    url: 'https://lumalabs.ai/dream-machine',
    category: '视频生成',
    icon: '💫',
    tags: ['文生视频', '图生视频', '3D'],
    features: ['文本生成视频', '图片生成视频', '3D场景理解', '物理模拟', '首尾帧控制'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web'
  },
  {
    id: '9',
    name: 'Genmo',
    description: 'AI视频生成平台，支持文生视频和图片动画化，操作简单，适合新手使用。',
    url: 'https://www.genmo.ai/',
    category: '视频生成',
    icon: '🔮',
    tags: ['文生视频', '图片动画', '简单易用'],
    features: ['文本生成视频', '图片动画化', '模板丰富', '一键生成', '社区分享'],
    pricing: '免费试用，付费版 $5/月起',
    platform: 'Web'
  },
  {
    id: '10',
    name: 'Pictory',
    description: 'AI驱动的视频内容创作平台，支持文章转视频、长视频转短视频等功能，适合内容营销。',
    url: 'https://pictory.ai/',
    category: '视频生成',
    icon: '📄',
    tags: ['文章转视频', '视频剪辑', '内容创作'],
    features: ['文章转视频', '长视频转短视频', '自动字幕', '品牌定制', '批量处理', '多语言支持'],
    pricing: '免费试用，付费版 $19/月起',
    platform: 'Web'
  },
  {
    id: '11',
    name: 'InVideo',
    description: '在线视频制作平台，提供丰富的模板和AI功能，适合营销视频快速制作。',
    url: 'https://invideo.io/',
    category: '视频生成',
    icon: '🎥',
    tags: ['在线制作', '模板库', '营销视频'],
    features: ['5000+模板', 'AI脚本生成', '文字转视频', '品牌套件', '团队协作', '素材库'],
    pricing: '免费试用，付费版 $15/月起',
    platform: 'Web'
  },
  {
    id: '12',
    name: 'Fliki',
    description: 'AI文字转视频工具，支持3000+AI语音，适合快速制作营销和培训视频。',
    url: 'https://fliki.ai/',
    category: '视频生成',
    icon: '🔊',
    tags: ['文字转视频', 'AI配音', '营销视频'],
    features: ['文字转视频', '3000+AI语音', '75+语言', '自动字幕', '品牌定制', '模板库'],
    pricing: '免费试用，付费版 $21/月起',
    platform: 'Web'
  },
  {
    id: '13',
    name: 'Synthesys',
    description: 'AI视频生成平台，支持虚拟人物视频制作，适合营销和教育内容。',
    url: 'https://synthesys.io/',
    category: '视频生成',
    icon: '🎬',
    tags: ['数字人', '营销视频', 'AI配音'],
    features: ['虚拟人物生成', '多语言支持', 'AI配音', '模板库', '自定义角色'],
    pricing: '免费试用，付费版 $27/月起',
    platform: 'Web'
  },
  {
    id: '14',
    name: 'Elai.io',
    description: 'AI视频生成平台，支持从文本和PPT快速生成培训视频和教育内容。',
    url: 'https://elai.io/',
    category: '视频生成',
    icon: '📚',
    tags: ['培训视频', '教育内容', 'PPT转视频'],
    features: ['文本转视频', 'PPT转视频', '数字人讲解', '多语言', '测验功能', 'SCORM导出'],
    pricing: '免费试用，付费版 $23/月起',
    platform: 'Web'
  },

  // ========== 数字人/虚拟主播 ==========
  {
    id: '15',
    name: 'HeyGen',
    description: 'AI数字人视频生成平台，支持多语言口播视频制作，适合营销、教育等场景，效果逼真。',
    url: 'https://www.heygen.com/',
    category: '数字人',
    icon: '👤',
    tags: ['数字人', '口播视频', '多语言'],
    featured: true,
    features: ['100+数字人模板', '300+语言支持', '语音克隆', '视频翻译', 'Instant Avatar 定制', '背景替换'],
    pricing: '免费试用，付费版 $24/月起',
    platform: 'Web'
  },
  {
    id: '16',
    name: 'D-ID',
    description: 'AI驱动的数字人视频生成工具，支持照片转视频、AI头像生成等功能，效果自然。',
    url: 'https://www.d-id.com/',
    category: '数字人',
    icon: '🎭',
    tags: ['数字人', '照片转视频', 'AI头像'],
    features: ['照片生成视频', 'AI头像生成', '实时数字人', 'API接口', '批量处理', '自定义形象'],
    pricing: '免费试用，付费版 $5.9/月起',
    platform: 'Web/API'
  },
  {
    id: '17',
    name: 'Synthesia',
    description: '企业级AI视频生成平台，提供丰富的数字人模板，支持140+语言的视频制作。',
    url: 'https://www.synthesia.io/',
    category: '数字人',
    icon: '🎪',
    tags: ['企业级', '多语言', '模板丰富'],
    features: ['150+数字人', '140+语言', '自定义数字人', 'PPT转视频', '团队协作', '企业级安全'],
    pricing: '企业定制，$22/月起',
    platform: 'Web'
  },
  {
    id: '18',
    name: '数字人定制-腾讯智影',
    description: '腾讯推出的AI数字人视频生成平台，支持定制个人数字人，适合口播和直播场景。',
    url: 'https://zenvideo.qq.com/',
    category: '数字人',
    icon: '🎬',
    tags: ['数字人', '国产', '口播视频'],
    features: ['数字人定制', '口播视频生成', '直播数字人', '多语言支持', '模板丰富'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web'
  },
  {
    id: '19',
    name: '硅基智能',
    description: '国产AI数字人平台，支持数字人直播、短视频制作，广泛应用于电商和营销场景。',
    url: 'https://www.guiji.ai/',
    category: '数字人',
    icon: '🤖',
    tags: ['数字人', '直播', '国产'],
    features: ['数字人直播', '短视频生成', '声音克隆', '多场景模板', '实时互动'],
    pricing: '企业定制',
    platform: 'Web'
  },
  {
    id: '20',
    name: 'Vroid Studio',
    description: '免费的3D虚拟形象制作工具，可以创建动漫风格的虚拟形象，支持直播和视频制作。',
    url: 'https://vroid.com/studio',
    category: '数字人',
    icon: '👧',
    tags: ['3D虚拟形象', '动漫风格', '免费'],
    features: ['3D角色创建', '动漫风格', '自定义外观', '动画支持', 'VRM导出'],
    pricing: '免费',
    platform: 'PC'
  },
  {
    id: '21',
    name: 'Live2D',
    description: '专业的2D虚拟形象动画软件，广泛应用于虚拟主播领域，让静态图片动起来。',
    url: 'https://www.live2d.com/',
    category: '数字人',
    icon: '🎭',
    tags: ['2D动画', '虚拟主播', '专业'],
    features: ['2D动画制作', '表情控制', '物理效果', 'SDK支持', '专业工具'],
    pricing: '免费版可用，Pro版收费',
    platform: 'PC'
  },
  {
    id: '22',
    name: 'Colossyan',
    description: '企业级AI数字人视频平台，专注于培训和教育视频制作。',
    url: 'https://www.colossyan.com/',
    category: '数字人',
    icon: '🎓',
    tags: ['培训视频', '企业级', '教育'],
    features: ['AI演员', '多语言', '场景模板', '测验功能', 'SCORM支持', '协作功能'],
    pricing: '免费试用，付费版 $28/月起',
    platform: 'Web'
  },

  // ========== 视频编辑工具 ==========
  {
    id: '23',
    name: '剪映专业版',
    description: '字节跳动推出的专业视频编辑软件，内置强大AI功能，支持智能字幕、一键成片等，国内最流行的剪辑工具。',
    url: 'https://www.capcut.cn/',
    category: '视频编辑',
    icon: '✂️',
    tags: ['智能剪辑', '智能字幕', '一键成片'],
    featured: true,
    features: ['智能字幕生成', '一键成片', 'AI特效', '音频降噪', '多轨编辑', '模板丰富'],
    pricing: '免费使用，会员 25元/月',
    platform: 'PC/Mac/APP'
  },
  {
    id: '24',
    name: 'Descript',
    description: '革命性的AI视频编辑工具，支持文字编辑视频、AI配音、自动转录等功能，重新定义视频编辑流程。',
    url: 'https://www.descript.com/',
    category: '视频编辑',
    icon: '📝',
    tags: ['文字编辑视频', 'AI配音', '自动转录'],
    featured: true,
    features: ['文字编辑视频', 'AI语音克隆', '自动转录', '屏幕录制', '团队协作', '多语言转录'],
    pricing: '免费试用，付费版 $12/月起',
    platform: 'PC/Mac'
  },
  {
    id: '25',
    name: 'Vrew',
    description: '韩国团队开发的AI视频编辑工具，支持AI字幕、AI剪辑、智能语音识别等功能，操作简单。',
    url: 'https://vrew.com/',
    category: '视频编辑',
    icon: '🎯',
    tags: ['AI字幕', '智能剪辑', '语音识别'],
    features: ['AI自动字幕', '语音识别剪辑', '多语言翻译', '模板库', '一键生成', '自动翻译'],
    pricing: '免费试用，付费版 9900韩元/月',
    platform: 'PC/Mac'
  },
  {
    id: '26',
    name: 'CapCut 国际版',
    description: '剪映国际版，功能强大的移动端视频编辑工具，内置丰富的AI功能和模板。',
    url: 'https://www.capcut.com/',
    category: '视频编辑',
    icon: '📱',
    tags: ['移动端', 'AI特效', '模板丰富'],
    features: ['移动端编辑', 'AI特效', '模板库', '自动字幕', '音乐同步', '社交分享'],
    pricing: '免费使用，Pro版 $7.99/月',
    platform: 'APP/Web'
  },
  {
    id: '27',
    name: 'Opus Clip',
    description: 'AI短视频剪辑工具，自动从长视频中提取精彩片段，适合内容创作者快速制作短视频。',
    url: 'https://opus.pro/',
    category: '视频编辑',
    icon: '🎞️',
    tags: ['自动剪辑', '短视频', '内容创作'],
    features: ['自动提取精彩片段', 'AI字幕', '社交媒体适配', '批量处理', '分析报告', 'B-roll建议'],
    pricing: '免费试用，付费版 $9.99/月起',
    platform: 'Web'
  },
  {
    id: '28',
    name: 'Vimeo Create',
    description: 'Vimeo推出的AI视频编辑工具，提供丰富的模板和素材库，适合快速制作营销视频。',
    url: 'https://vimeo.com/create',
    category: '视频编辑',
    icon: '🎬',
    tags: ['模板库', '营销视频', '在线编辑'],
    features: ['模板库', '素材库', 'AI推荐', '品牌定制', '团队协作', '高清导出'],
    pricing: '免费试用，付费版 $7/月起',
    platform: 'Web'
  },
  {
    id: '29',
    name: 'Peech',
    description: 'AI视频编辑平台，专为营销团队设计，支持自动生成多版本视频。',
    url: 'https://www.peech-ai.com/',
    category: '视频编辑',
    icon: '🎬',
    tags: ['营销视频', '自动剪辑', '批量处理'],
    features: ['自动剪辑', '多版本生成', '品牌定制', '字幕生成', '团队协作', '分析工具'],
    pricing: '免费试用，企业定制',
    platform: 'Web'
  },
  {
    id: '30',
    name: 'Wisecut',
    description: 'AI驱动的视频剪辑工具，自动识别静音片段，适合制作教学和演讲视频。',
    url: 'https://www.wisecut.video/',
    category: '视频编辑',
    icon: '✂️',
    tags: ['自动剪辑', '教学视频', '静音检测'],
    features: ['自动剪辑', '静音检测', '自动字幕', '智能变焦', '背景音乐', '多格式导出'],
    pricing: '免费试用，付费版 $10/月起',
    platform: 'Web'
  },
  {
    id: '31',
    name: 'Gling',
    description: '专为YouTuber设计的AI剪辑工具，自动删除沉默和失误片段。',
    url: 'https://www.gling.ai/',
    category: '视频编辑',
    icon: '🎥',
    tags: ['YouTuber', '自动剪辑', '去除静音'],
    features: ['自动去除静音', '去除失误片段', '快速剪辑', '多格式导出', '批量处理'],
    pricing: '免费试用，付费按分钟计费',
    platform: 'Web'
  },
  {
    id: '32',
    name: 'Ebsynth',
    description: 'AI视频风格转换工具，可以将视频转换为各种艺术风格。',
    url: 'https://ebsynth.com/',
    category: '视频编辑',
    icon: '🎨',
    tags: ['风格转换', '艺术效果', '动画'],
    features: ['风格转换', '逐帧处理', '艺术风格', '自定义风格', '高质量输出'],
    pricing: '免费',
    platform: 'PC/Mac'
  },

  // ========== AI字幕/翻译工具 ==========
  {
    id: '33',
    name: '剪映智能字幕',
    description: '剪映内置的AI字幕功能，支持多语言识别和翻译，准确率高。',
    url: 'https://www.capcut.cn/',
    category: 'AI字幕',
    icon: '📝',
    tags: ['自动字幕', '多语言', '高准确率'],
    featured: true,
    features: ['自动语音识别', '多语言支持', '字幕翻译', '样式定制', '批量处理', '时间轴编辑'],
    pricing: '免费使用',
    platform: 'PC/Mac/APP'
  },
  {
    id: '34',
    name: 'Subtitle Edit',
    description: '免费开源的字幕编辑软件，支持多种字幕格式和自动翻译功能。',
    url: 'https://www.nikse.dk/SubtitleEdit',
    category: 'AI字幕',
    icon: '📝',
    tags: ['开源', '字幕编辑', '免费'],
    features: ['多种字幕格式', '自动翻译', '字幕同步', '波形显示', '批量处理', '免费使用'],
    pricing: '免费开源',
    platform: 'PC'
  },
  {
    id: '35',
    name: 'Maestra',
    description: 'AI字幕和配音平台，支持50+语言的自动转录、翻译和配音。',
    url: 'https://maestrasuite.com/',
    category: 'AI字幕',
    icon: '🌍',
    tags: ['字幕翻译', 'AI配音', '多语言'],
    features: ['自动转录', '50+语言', 'AI配音', '字幕翻译', '协作功能', 'API接口'],
    pricing: '免费试用，付费按小时计费',
    platform: 'Web'
  },
  {
    id: '36',
    name: 'Happy Scribe',
    description: '专业的转录和字幕平台，支持多语言自动转录和字幕生成。',
    url: 'https://www.happyscribe.com/',
    category: 'AI字幕',
    icon: '📝',
    tags: ['转录', '字幕', '多语言'],
    features: ['自动转录', '多语言支持', '字幕编辑器', '协作功能', '多格式导出', 'API接口'],
    pricing: '免费试用，付费按分钟计费',
    platform: 'Web'
  },
  {
    id: '37',
    name: 'Rev',
    description: '专业的人工+AI转录服务，提供高准确率的转录和字幕服务。',
    url: 'https://www.rev.com/',
    category: 'AI字幕',
    icon: '📝',
    tags: ['转录', '字幕', '人工审核'],
    features: ['AI转录', '人工校对', '字幕服务', '多语言', '快速交付', '高准确率'],
    pricing: '按分钟计费',
    platform: 'Web'
  },
  {
    id: '38',
    name: '讯飞听见',
    description: '科大讯飞推出的语音转文字服务，中文识别准确率极高。',
    url: 'https://www.iflyrec.com/',
    category: 'AI字幕',
    icon: '🎤',
    tags: ['中文识别', '转录', '国产'],
    features: ['中文高准确率', '多语言支持', '字幕生成', '会议记录', '批量处理'],
    pricing: '免费试用，付费按时长计费',
    platform: 'Web/APP'
  },

  // ========== AI配音/语音工具 ==========
  {
    id: '39',
    name: 'ElevenLabs',
    description: '顶级AI语音合成平台，语音效果逼真自然，支持语音克隆和多语言配音。',
    url: 'https://elevenlabs.io/',
    category: 'AI配音',
    icon: '🎙️',
    tags: ['语音合成', '语音克隆', '多语言'],
    featured: true,
    features: ['超逼真语音', '语音克隆', '多语言', '配音功能', '声音库', 'API接口'],
    pricing: '免费试用，付费版 $5/月起',
    platform: 'Web/API'
  },
  {
    id: '40',
    name: 'Murf AI',
    description: 'AI配音工具，提供120+逼真AI语音，适合制作营销和培训视频。',
    url: 'https://murf.ai/',
    category: 'AI配音',
    icon: '🎙️',
    tags: ['AI配音', '语音合成', '营销视频'],
    features: ['120+AI语音', '多语言', '语音定制', '配音编辑', '团队协作', 'API接口'],
    pricing: '免费试用，付费版 $19/月起',
    platform: 'Web'
  },
  {
    id: '41',
    name: 'Speechify',
    description: '文本转语音工具，支持多语言朗读，适合制作有声内容和视频配音。',
    url: 'https://speechify.com/',
    category: 'AI配音',
    icon: '🔊',
    tags: ['文本转语音', '有声书', '多语言'],
    features: ['文本转语音', '多语言', '自然语音', '有声书制作', 'Chrome插件', '移动APP'],
    pricing: '免费试用，付费版 $11.99/月',
    platform: 'Web/APP'
  },
  {
    id: '42',
    name: 'Play.ht',
    description: 'AI语音生成平台，提供超逼真的AI语音，支持语音克隆。',
    url: 'https://play.ht/',
    category: 'AI配音',
    icon: '🎙️',
    tags: ['语音合成', '语音克隆', '播客'],
    features: ['超逼真语音', '语音克隆', '多语言', '播客制作', 'API接口', '批量处理'],
    pricing: '免费试用，付费版 $14.25/月起',
    platform: 'Web'
  },
  {
    id: '43',
    name: '讯飞配音',
    description: '科大讯飞推出的AI配音工具，中文配音效果出色，支持多种音色。',
    url: 'https://peiyin.xunfei.cn/',
    category: 'AI配音',
    icon: '🎤',
    tags: ['中文配音', '国产', '多音色'],
    features: ['中文配音', '多音色', '情感语音', '批量处理', '定制服务'],
    pricing: '免费试用，付费按字数计费',
    platform: 'Web'
  },
  {
    id: '44',
    name: 'Azure 语音服务',
    description: '微软Azure提供的AI语音服务，支持多语言语音合成和语音克隆。',
    url: 'https://azure.microsoft.com/zh-cn/products/cognitive-services/speech-services',
    category: 'AI配音',
    icon: '☁️',
    tags: ['语音合成', '企业级', 'API'],
    features: ['多语言语音', '语音克隆', '实时语音', 'API接口', '企业级支持', '自定义模型'],
    pricing: '免费试用，按量付费',
    platform: 'API'
  },

  // ========== 视频增强/修复工具 ==========
  {
    id: '45',
    name: 'Topaz Video AI',
    description: '专业的AI视频增强工具，支持视频放大、降噪、帧插值、稳定等功能，效果业界领先。',
    url: 'https://www.topazlabs.com/topaz-video-ai',
    category: '视频增强',
    icon: '💎',
    tags: ['视频放大', '降噪', '帧插值'],
    featured: true,
    features: ['4K/8K视频放大', 'AI降噪', '帧插值', '视频稳定', '慢动作生成', '批量处理'],
    pricing: '一次性购买 $299',
    platform: 'PC/Mac'
  },
  {
    id: '46',
    name: 'AVCLabs Video Enhancer AI',
    description: 'AI视频增强工具，支持视频放大、降噪和人脸增强。',
    url: 'https://www.avclabs.com/video-enhancer-ai.html',
    category: '视频增强',
    icon: '✨',
    tags: ['视频放大', '人脸增强', '降噪'],
    features: ['视频放大', 'AI降噪', '人脸增强', '帧插值', '多格式支持'],
    pricing: '免费试用，付费版 $39.95/月',
    platform: 'PC/Mac'
  },
  {
    id: '47',
    name: 'HitPaw Video Enhancer',
    description: '简单易用的AI视频增强工具，支持视频放大、降噪和修复。',
    url: 'https://www.hitpaw.com/video-enhancer.html',
    category: '视频增强',
    icon: '🔧',
    tags: ['视频修复', '视频放大', '简单易用'],
    features: ['视频放大', 'AI降噪', '模糊修复', '人脸增强', '批量处理'],
    pricing: '免费试用，付费版 $45.99/月',
    platform: 'PC/Mac'
  },
  {
    id: '48',
    name: 'Waifu2x',
    description: '免费开源的图片/视频放大工具，适合动漫风格内容放大。',
    url: 'https://waifu2x.udp.jp/',
    category: '视频增强',
    icon: '🎨',
    tags: ['开源', '动漫', '视频放大'],
    features: ['图片放大', '视频放大', '降噪', '动漫优化', '免费使用'],
    pricing: '免费开源',
    platform: 'Web/PC'
  },
  {
    id: '49',
    name: 'Video2X',
    description: '开源的视频放大工具，支持多种AI模型，可本地运行。',
    url: 'https://github.com/k4yt3x/video2x',
    category: '视频增强',
    icon: '📈',
    tags: ['开源', '视频放大', '本地运行'],
    features: ['视频放大', '多种AI模型', '本地运行', '批量处理', '免费使用'],
    pricing: '免费开源',
    platform: 'PC'
  },

  // ========== 3D视频工具 ==========
  {
    id: '50',
    name: 'Luma AI',
    description: '专业的AI 3D内容创作工具，支持视频转3D、NeRF渲染等前沿技术。',
    url: 'https://lumalabs.ai/',
    category: '3D视频',
    icon: '🌐',
    tags: ['3D生成', 'NeRF', '视频转3D'],
    featured: true,
    features: ['视频转3D', 'NeRF渲染', 'Dream Machine', '3D场景重建', 'AR导出', '高质量输出'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web'
  },
  {
    id: '51',
    name: 'Polycam',
    description: 'AI驱动的3D扫描应用，可以用手机快速创建3D模型。',
    url: 'https://poly.cam/',
    category: '3D视频',
    icon: '📷',
    tags: ['3D扫描', '移动端', '建模'],
    features: ['3D扫描', 'LiDAR支持', '照片建模', 'AR预览', '多格式导出', '社区分享'],
    pricing: '免费使用，Pro版 $7.99/月',
    platform: 'APP/Web'
  },
  {
    id: '52',
    name: 'Blockade Labs',
    description: 'AI 360°天空盒生成工具，可以快速创建沉浸式环境。',
    url: 'https://skybox.blockadelabs.com/',
    category: '3D视频',
    icon: '🌌',
    tags: ['天空盒', '360°', '环境生成'],
    features: ['AI天空盒', '360°环境', '多种风格', '快速生成', 'VR/AR支持'],
    pricing: '免费试用，付费版 $5/月起',
    platform: 'Web'
  },
  {
    id: '53',
    name: 'Spline AI',
    description: 'AI驱动的3D设计工具，支持用文字描述创建3D场景。',
    url: 'https://spline.design/',
    category: '3D视频',
    icon: '🎨',
    tags: ['3D设计', '文字生成3D', '在线工具'],
    features: ['文字生成3D', '3D建模', '动画制作', '交互设计', '团队协作', 'Web导出'],
    pricing: '免费使用，Pro版 $9/月',
    platform: 'Web'
  },

  // ========== 创意视频工具 ==========
  {
    id: '54',
    name: 'Kaiber',
    description: 'AI驱动的创意视频生成平台，支持音乐可视化、风格转换等艺术创作。',
    url: 'https://kaiber.ai/',
    category: '创意视频',
    icon: '🎵',
    tags: ['音乐可视化', '艺术创作', '风格转换'],
    features: ['音乐可视化', '风格转换', '图片动画化', '故事板生成', '创意模板', '视频变换'],
    pricing: '免费试用，付费版 $5/月起',
    platform: 'Web'
  },
  {
    id: '55',
    name: 'Deforum',
    description: '开源的AI视频生成工具，支持Stable Diffusion视频动画。',
    url: 'https://deforum.art/',
    category: '创意视频',
    icon: '🎨',
    tags: ['开源', '动画生成', 'Stable Diffusion'],
    features: ['AI动画生成', '风格转换', '参数控制', '开源免费', '社区活跃', '多模型支持'],
    pricing: '免费开源',
    platform: 'Web/本地'
  },
  {
    id: '56',
    name: 'DomoAI',
    description: 'AI视频风格转换工具，可以将视频转换为动漫、油画等多种风格。',
    url: 'https://domoai.app/',
    category: '创意视频',
    icon: '🎭',
    tags: ['风格转换', '动漫化', 'AI特效'],
    features: ['视频风格转换', '图片动漫化', '多种风格', '批量处理', '高清输出'],
    pricing: '免费试用，付费按量计费',
    platform: 'Web/Discord'
  },
  {
    id: '57',
    name: 'LeiaPix Converter',
    description: 'AI图片深度动画化工具，可以将静态图片转换为3D动画。',
    url: 'https://leiapix.com/',
    category: '创意视频',
    icon: '📸',
    tags: ['图片动画化', '3D效果', '深度图'],
    features: ['图片动画化', '深度图生成', '3D效果', '多种动画模式', '快速生成'],
    pricing: '免费使用',
    platform: 'Web'
  },
  {
    id: '58',
    name: 'D-ID Creative Reality',
    description: 'D-ID推出的创意视频工具，可以让静态照片说话和唱歌。',
    url: 'https://www.d-id.com/creative-reality-studio/',
    category: '创意视频',
    icon: '🎬',
    tags: ['照片动画', '口型同步', '创意'],
    features: ['照片动画化', '口型同步', '音频驱动', '多种模板', 'API接口'],
    pricing: '免费试用，付费版 $5.9/月起',
    platform: 'Web/API'
  },

  // ========== 视频素材/模板 ==========
  {
    id: '59',
    name: 'Envato Elements',
    description: '专业的视频素材和模板库，提供大量AE模板、视频素材和音效。',
    url: 'https://elements.envato.com/',
    category: '视频素材',
    icon: '📦',
    tags: ['素材库', '模板', 'AE模板'],
    features: ['视频素材', 'AE模板', '音效库', '图片素材', '无限下载', '商用授权'],
    pricing: '订阅制 $16.5/月起',
    platform: 'Web'
  },
  {
    id: '60',
    name: 'Motion Array',
    description: '视频创作者的一站式资源平台，提供模板、素材和插件。',
    url: 'https://motionarray.com/',
    category: '视频素材',
    icon: '🎬',
    tags: ['模板库', '视频素材', '插件'],
    features: ['视频模板', '视频素材', '音频素材', '插件', '预设', '协作工具'],
    pricing: '免费试用，付费版 $19.99/月',
    platform: 'Web'
  },
  {
    id: '61',
    name: 'Artgrid',
    description: '高质量视频素材库，提供电影级别的视频素材。',
    url: 'https://artgrid.io/',
    category: '视频素材',
    icon: '🎬',
    tags: ['视频素材', '电影级', '高质量'],
    features: ['高质量视频', '电影级别', '多种主题', '商用授权', '4K/8K'],
    pricing: '订阅制 $47.88/月起',
    platform: 'Web'
  },
  {
    id: '62',
    name: 'Storyblocks',
    description: '视频、音频和图片素材库，适合各种创作需求。',
    url: 'https://www.storyblocks.com/',
    category: '视频素材',
    icon: '📚',
    tags: ['素材库', '视频', '音频'],
    features: ['视频素材', '音频素材', '图片素材', '模板', '无限下载', '商用授权'],
    pricing: '订阅制 $29/月起',
    platform: 'Web'
  },

  // ========== 屏幕录制/演示工具 ==========
  {
    id: '63',
    name: 'Loom',
    description: '流行的视频录制和分享工具，支持屏幕录制和AI转录。',
    url: 'https://www.loom.com/',
    category: '屏幕录制',
    icon: '📹',
    tags: ['屏幕录制', '异步沟通', 'AI转录'],
    featured: true,
    features: ['屏幕录制', '摄像头录制', 'AI转录', '视频编辑', '分享功能', '团队协作'],
    pricing: '免费使用，付费版 $12.5/月起',
    platform: 'Web/APP'
  },
  {
    id: '64',
    name: 'OBS Studio',
    description: '免费开源的直播和录制软件，功能强大，支持多平台。',
    url: 'https://obsproject.com/',
    category: '屏幕录制',
    icon: '🎥',
    tags: ['开源', '直播', '录制'],
    features: ['屏幕录制', '直播推流', '场景切换', '插件支持', '免费开源', '多平台'],
    pricing: '免费开源',
    platform: 'PC/Mac/Linux'
  },
  {
    id: '65',
    name: 'Camtasia',
    description: '专业的屏幕录制和视频编辑软件，适合制作教程和演示视频。',
    url: 'https://www.techsmith.com/video-editor.html',
    category: '屏幕录制',
    icon: '🎬',
    tags: ['屏幕录制', '视频编辑', '教程制作'],
    features: ['屏幕录制', '视频编辑', '特效', '字幕', '动画', '多种导出'],
    pricing: '一次性购买 $299.99',
    platform: 'PC/Mac'
  },
  {
    id: '66',
    name: 'ScreenPal',
    description: '简单易用的屏幕录制工具，支持录制、编辑和分享。',
    url: 'https://screenpal.com/',
    category: '屏幕录制',
    icon: '📹',
    tags: ['屏幕录制', '简单易用', '编辑'],
    features: ['屏幕录制', '视频编辑', '字幕添加', '图片编辑', '分享功能', '云存储'],
    pricing: '免费使用，付费版 $3/月起',
    platform: 'Web/APP'
  },
];

// 使用 useMemo 缓存分类数据
const getCategories = () => [
  { name: '全部', icon: Video, count: aiTools.length },
  { name: '视频生成', icon: Wand2, count: aiTools.filter(t => t.category === '视频生成').length },
  { name: '数字人', icon: Users, count: aiTools.filter(t => t.category === '数字人').length },
  { name: '视频编辑', icon: Film, count: aiTools.filter(t => t.category === '视频编辑').length },
  { name: 'AI字幕', icon: FileVideo, count: aiTools.filter(t => t.category === 'AI字幕').length },
  { name: 'AI配音', icon: Mic, count: aiTools.filter(t => t.category === 'AI配音').length },
  { name: '视频增强', icon: Sparkles, count: aiTools.filter(t => t.category === '视频增强').length },
  { name: '3D视频', icon: Palette, count: aiTools.filter(t => t.category === '3D视频').length },
  { name: '创意视频', icon: Music, count: aiTools.filter(t => t.category === '创意视频').length },
  { name: '视频素材', icon: ImageIcon, count: aiTools.filter(t => t.category === '视频素材').length },
  { name: '屏幕录制', icon: Film, count: aiTools.filter(t => t.category === '屏幕录制').length },
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
  return (
    <Card 
      className="hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            {tool.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                {tool.name}
              </h3>
              {tool.featured && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-xs flex-shrink-0 hover:from-red-600 hover:to-orange-600">
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

// 内联广告组件
const InlineAd = memo(function InlineAd() {
  return (
    <div className="md:col-span-2">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-100 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-800 dark:text-white">AI视频创作课程推荐</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">从零开始掌握AI视频制作技巧</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-red-200 dark:border-slate-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600">
            了解更多
          </Button>
        </div>
      </div>
    </div>
  );
});

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
  
  return (
    <Dialog open={!!tool} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {tool.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl text-slate-900 dark:text-white">{tool.name}</DialogTitle>
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
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">简介</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {tool.features && tool.features.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">主要功能</h4>
              <div className="grid grid-cols-2 gap-2">
                {tool.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="pt-4 flex gap-3">
            <Button 
              className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 gap-2"
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
  return (
    <div 
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-600 rounded flex items-center justify-center text-sm flex-shrink-0">
        {tool.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-slate-900 dark:text-white">{tool.name}</p>
        <p className="text-xs text-slate-500">{tool.category}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </div>
  );
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  // 缓存分类数据
  const categories = useMemo(() => getCategories(), []);

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
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-md">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  钳爪AI视频工具箱
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">精选优质AI视频创作工具</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/about">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">关于我们</span>
                </Button>
              </Link>
              <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {aiTools.length} 个工具
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
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
              {filteredTools.map((tool, index) => (
                <div key={tool.id}>
                  {/* 在第6个工具后插入广告 */}
                  {index === 6 && <InlineAd />}
                  <ToolCard tool={tool} onClick={() => handleToolClick(tool)} />
                </div>
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

          {/* Sidebar */}
          <div className="hidden lg:block w-72 space-y-4">
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
                    <span className="text-xs">contact@oneclaw.shop</span>
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-slate-900 dark:text-white">钳爪AI视频工具箱</span>
            </div>
            <p>© 2024 钳爪AI视频工具箱 (OneClaw). 精选{aiTools.length}款优质AI视频创作工具</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                关于我们
              </Link>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a href="mailto:contact@oneclaw.shop" className="hover:text-blue-600 transition-colors">
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
    </div>
  );
}
