'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Wand2, Star, X,
  ChevronLeft, ChevronRight, Eye, ThumbsUp,
  BookOpen, Lightbulb, Copy, Check, ArrowRight,
  Sparkles, Feather, UserCircle, ImageIcon, Mountain,
  FileText, FlaskConical, Globe
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import { SkeletonGrid } from '@/components/LobsterSkeleton';
import SponsorBadge, { isSponsorActive } from '@/components/SponsorBadge';
import AdBanner, { HomeBanner, HomeInlineAd } from '@/components/AdBanner';
import LoginButton from '@/components/LoginButton';
import Link from 'next/link';
import NovelCreator from '@/components/NovelCreator';

// ==================== 类型定义 ====================
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  is_featured: boolean;
  feature_tags: string[];
  official_url: string;
  promotion_url: string | null;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  max_duration: string;
  free_quota_desc: string | null;
  sponsor_type: string | null;
  sponsor_expires_at: string | null;
  categories: { name: string; slug: string };
}

interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  uses: number;
  likes: number;
}

interface Tutorial {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  cover_image: string;
  author: string;
  views: number;
  likes: number;
  created_at: string;
}

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  logo: string | null;
  category_id: number | null;
  official_url: string | null;
  documentation_url: string | null;
  github_url: string | null;
  pricing: string;
  difficulty: string;
  tags: string[];
  feature_list: string[];
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  skill_categories: { id: number; name: string; slug: string; color: string } | null;
}

// ==================== 工具Logo组件 ====================
interface ToolLogoProps {
  src?: string | null;
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

// 工具Logo组件 - 带字母占位符
function ToolLogo({ src, name, url, size = 40, className = '' }: ToolLogoProps) {
  const fallbackSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url || 'https://example.com')}&sz=64`;
  const letter = name.charAt(0).toUpperCase();
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
  const colorIndex = letter.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src || fallbackSrc}
        alt={name}
        className="w-full h-full object-contain bg-slate-100 dark:bg-slate-700"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          } else {
            // 如果Google Favicon也失败，显示字母
            target.style.display = 'none';
          }
        }}
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          // 检查图片是否有效（不是空白图片）
          if (target.naturalWidth === 0) {
            target.style.display = 'none';
          }
        }}
      />
      {/* 备用字母图标 */}
      <div 
        className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm sm:text-base"
        style={{ backgroundColor: bgColor }}
      >
        {letter}
      </div>
    </div>
  );
}

// ==================== 精选工具页面 ====================
function UtilityToolsPage() {
  const [tools, setTools] = useState(UTILITY_TOOLS);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          精选工具
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          AI驱动的精选工具，提升您的工作效率
        </p>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          const getToolUrl = (key: string) => {
            const urls: Record<string, string> = {
              resume: '/resume',
              novel: '/novel',
              testcraft: '/testcraft',
              productpage: '/product-page',
            };
            return urls[key] || '/';
          };
          return (
            <button
              key={tool.key}
              onClick={() => {
                window.open(getToolUrl(tool.key), '_blank');
              }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 text-left overflow-hidden flex flex-col"
            >
              {/* 背景渐变装饰 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              {/* 内容 */}
              <div className="relative flex-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tool.description}
                </p>
              </div>
              
              {/* 底部区域：默认显示开始使用，悬浮时显示标签 */}
              <div className="relative mt-4">
                {/* 默认显示 */}
                <div className="flex items-center gap-2 text-orange-500 text-sm font-medium group-hover:opacity-0 transition-opacity h-6">
                  <span>开始使用</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                {/* Hover显示核心卖点标签 */}
                <div className="absolute inset-0 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity py-1">
                  {tool.tags?.map((tag, idx) => (
                    <span key={idx} className={`px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${tool.color} text-white shadow-sm`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
        
        {/* 敬请期待卡片 */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-2">
            更多工具
          </h3>
          <p className="text-sm text-slate-400">
            敬请期待...
          </p>
        </div>
      </div>

      {/* 使用案例展示模块 */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            热门使用场景
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            点击进入，探索更多可能
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 从简历石沉大海到斩获字节offer */}
          <div className="group relative overflow-hidden rounded-2xl h-[400px]">
            <img 
              src="https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_dae77823-56a4-4399-bfe9-3d7bb5ec0e45.jpeg" 
              alt="简历优化案例"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">从简历石沉大海到斩获字节offer</h3>
                  <p className="text-white/60 text-sm">23届李明 · 简历通过率提升 200%</p>
                </div>
              </div>
              
              {/* 案例详情 */}
              <div className="space-y-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500 rounded text-white text-xs font-medium">校招求职</span>
                    <span className="text-white/80 text-sm">计算机毕业生 · 入职字节跳动</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    通过STAR法则重构项目经历，突出"独立开发""性能优化"等关键词，将平平无奇的学生经历转化为面试官眼中的亮点。
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-500 rounded text-white text-xs font-medium">社招跳槽</span>
                    <span className="text-white/80 text-sm">5年产品经理 · 涨薪 40%</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    王芳量化工作成果为"提升转化率35%"，配合JD精准匹配，成功收获阿里、腾讯、美团等多个大厂offer。
                  </p>
                </div>
              </div>
              
              <Link 
                href="/resume"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
              >
                <span>免费优化我的简历</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 1小时产出10条推文，月入5万+ */}
          <div className="group relative overflow-hidden rounded-2xl h-[400px]">
            <img 
              src="https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_287f1d5f-2bb6-4450-ad9a-80b022285add.jpeg" 
              alt="网文创作案例"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Feather className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">1小时产出10条推文，月入5万+</h3>
                  <p className="text-white/60 text-sm">短剧达人 · 单条佣金最高 2万</p>
                </div>
              </div>
              
              {/* 案例详情 */}
              <div className="space-y-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500 rounded text-white text-xs font-medium">小说改编</span>
                    <span className="text-white/80 text-sm">漫画博主 · 抖音涨粉 3万</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    网文作者"云起"将番茄爆款《都市狂少》深度洗稿后，配合AI生图功能产出50集漫画内容，首月抖音涨粉3万。
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-pink-500 rounded text-white text-xs font-medium">短剧创作</span>
                    <span className="text-white/80 text-sm">推文达人 · 日佣金 5000+</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    利用推文脚本功能，输入小说链接自动生成抓人眼球的推文素材，配合AI配音批量产出，单条视频佣金突破2万。
                  </p>
                </div>
              </div>
              
              <Link 
                href="/novel"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
              >
                <span>开始我的创作之旅</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 10分钟生成200+用例，漏测率降低60% */}
          <div className="group relative overflow-hidden rounded-2xl h-[400px]">
            <img 
              src="https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_b6ac5163-eb12-4f9d-aba2-1d685ba9213e.jpeg" 
              alt="测试用例案例"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">10分钟生成200+用例，漏测率降低60%</h3>
                  <p className="text-white/60 text-sm">大厂QA工程师 · 用例覆盖率 95%</p>
                </div>
              </div>
              
              {/* 案例详情 */}
              <div className="space-y-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-violet-500 rounded text-white text-xs font-medium">功能测试</span>
                    <span className="text-white/80 text-sm">测试工程师张工 · 某大厂</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    输入PRD文档后，AI自动分析业务流程，10分钟生成200+测试用例，覆盖正常、边界、异常场景，漏测率大幅降低。
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-fuchsia-500 rounded text-white text-xs font-medium">接口测试</span>
                    <span className="text-white/80 text-sm">全栈开发小李 · 自测覆盖率 85%</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    使用接口描述自动生成测试用例，开发自测覆盖率从40%提升至85%，上线后bug减少70%，交付周期缩短50%。
                  </p>
                </div>
              </div>
              
              <Link 
                href="/testcraft"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
              >
                <span>告别手动编写用例</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3C配件日出千单，转化率提升180% */}
          <div className="group relative overflow-hidden rounded-2xl h-[400px]">
            <img 
              src="https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_75342009-45e4-4484-8133-81f9413de40b.jpeg" 
              alt="出海详情页案例"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">3C配件日出千单，转化率提升180%</h3>
                  <p className="text-white/60 text-sm">深圳卖家陈总 · 月销量翻 3番</p>
                </div>
              </div>
              
              {/* 案例详情 */}
              <div className="space-y-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 rounded text-white text-xs font-medium">亚马逊Listing</span>
                    <span className="text-white/80 text-sm">3C配件卖家 · 转化率 +180%</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    输入产品关键词后，一键生成符合亚马逊规范的英文详情页，A+内容点击率提升2倍，月销量从千单突破到三千单。
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-500 rounded text-white text-xs font-medium">多平台分发</span>
                    <span className="text-white/80 text-sm">独立站卖家小王 · 效率 +500%</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    一套产品详情自动适配Shopify、WooCommerce、速卖通多平台版本，节省80%翻译和改版时间，专注选品运营。
                  </p>
                </div>
              </div>
              
              <Link 
                href="/productpage"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
              >
                <span>一键生成爆款详情页</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 常量 ====================
const DIFFICULTY_COLORS: Record<string, string> = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};

// 精选工具列表
const UTILITY_TOOLS = [
  { 
    key: 'resume', 
    name: 'STAR简历优化', 
    icon: FileText,
    description: '上传简历+粘贴JD，一键生成STAR法则优化版简历，精准匹配岗位',
    color: 'from-blue-500 to-cyan-500',
    tags: ['PDF上传', 'JD精准匹配', '量化成果'],
    useCases: [
      { title: '校招求职', desc: '应届生简历优化，突出项目经验' },
      { title: '社招跳槽', desc: '量化工作成果，提升面试邀约率' },
      { title: '简历升级', desc: 'STAR法则重构，让经历更有说服力' },
    ]
  },
  { 
    key: 'novel', 
    name: '网文创作工坊', 
    icon: Feather,
    description: '小说→深度洗稿→漫画生图→推文脚本，全流程创作一键导出',
    color: 'from-purple-500 to-pink-500',
    tags: ['深度洗稿', '漫画生图', '推文脚本'],
    useCases: [
      { title: '小说改编', desc: '番茄小说爆款文改编为漫画脚本' },
      { title: 'IP孵化', desc: '原创故事快速生成多形式内容' },
      { title: '短剧创作', desc: '网文改短剧，批量产出推文素材' },
    ]
  },
  { 
    key: 'testcraft', 
    name: 'AI测试用例', 
    icon: FlaskConical,
    description: 'AI智能生成测试用例，支持BDD格式、批量导出',
    color: 'from-violet-500 to-fuchsia-500',
    tags: ['BDD格式', '批量导出', '一键生成'],
    useCases: [
      { title: '功能测试', desc: '快速生成边界条件和异常场景' },
      { title: '接口测试', desc: '自动化生成API测试用例' },
      { title: '回归测试', desc: '历史用例批量复用，效率翻倍' },
    ]
  },
  { 
    key: 'productpage', 
    name: '出海详情页', 
    icon: Globe,
    description: '一键生成符合海外法规、人文风情的商品详情页，适配多平台',
    color: 'from-emerald-500 to-teal-500',
    tags: ['多语言', '海外合规', '批量分发'],
    useCases: [
      { title: '亚马逊Listing', desc: '符合亚马逊规范的多语言详情页' },
      { title: '独立站详情', desc: 'Shopify/WooCommerce适配版本' },
      { title: '多平台分发', desc: '速卖通/eBay/Shopee统一模板' },
    ]
  },
] as const;

type UtilityTool = typeof UTILITY_TOOLS[number]['key'];

const MAIN_TABS = [
  { key: 'utilities', label: '精选工具', icon: Star },
  { key: 'tools', label: 'AI应用', icon: Wand2 },
  { key: 'prompts', label: '提示词', icon: Lightbulb },
  { key: 'skills', label: '技能', icon: Sparkles },
  { key: 'tutorials', label: '教程', icon: BookOpen },
] as const;

type MainTab = typeof MAIN_TABS[number]['key'];

// ==================== 工具函数 ====================
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('oneclaw_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('oneclaw_user_id', userId);
  }
  return userId;
};

// 缓存管理器
const CACHE_DURATION = 5 * 60 * 1000;
const cache = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(`oneclaw_cache_${key}`);
    if (!item) return null;
    try {
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`oneclaw_cache_${key}`);
        return null;
      }
      return data;
    } catch { return null; }
  },
  set: (key: string, data: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`oneclaw_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  },
  clear: (key?: string) => {
    if (typeof window === 'undefined') return;
    if (key) {
      localStorage.removeItem(`oneclaw_cache_${key}`);
    } else {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('oneclaw_cache_'));
      keys.forEach(k => localStorage.removeItem(k));
    }
  },
  cleanup: () => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith('oneclaw_cache_'));
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const { timestamp } = JSON.parse(item);
          if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    });
  }
};

	// ==================== 主组件 ====================
export default function HomePage() {
  // 主Tab状态 - 默认精选工具
  const [mainTab, setMainTab] = useState<MainTab>('utilities');

  // 页面加载时，从 sessionStorage 读取返回的 tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 优先从 URL 查询参数读取 tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && MAIN_TABS.some(t => t.key === tabParam)) {
      setMainTab(tabParam as MainTab);
      // 清除 URL 参数
      window.history.replaceState({}, '', '/');
      return;
    }
    
    // 其次读取 homeTab（从详情页返回时设置）
    const homeTab = sessionStorage.getItem('homeTab');
    if (homeTab) {
      setMainTab(homeTab as MainTab);
      sessionStorage.removeItem('homeTab');
      return;
    }
    
    // 最后读取 backFrom
    const backFrom = sessionStorage.getItem('backFrom');
    if (backFrom) {
      try {
        const state = JSON.parse(backFrom);
        if (state && state.tab) {
          setMainTab(state.tab);
        }
      } catch {}
      // 读取完后清除
      sessionStorage.removeItem('backFrom');
    }
  }, []);

  // ==================== 工具导航状态 ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolsPagination, setToolsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  
  // 筛选状态
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  
  // 用户相关
  const [userId, setUserId] = useState('');

  // ==================== 提示词库状态 ====================
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsPagination, setPromptsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [promptCategory, setPromptCategory] = useState('全部');
  const [promptSearch, setPromptSearch] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  // ==================== 教程库状态 ====================
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [tutorialsPagination, setTutorialsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [tutorialCategory, setTutorialCategory] = useState('全部');
  const [tutorialSearch, setTutorialSearch] = useState('');

  // ==================== Skill 状态 ====================
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsPagination, setSkillsPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [skillCategory, setSkillCategory] = useState<number | 'all'>('all');
  const [skillSearch, setSkillSearch] = useState('');

  // 分类选项
  const PROMPT_CATEGORIES = ['全部', '角色扮演', '场景描述', '风格迁移', '人物生成', '特效制作'];
  const TUTORIAL_CATEGORIES = ['全部', '入门教程', '进阶技巧', '案例分享', 'API对接'];

  // slug到中文名称的映射
  const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
    'video-generation': '视频生成',
    'digital-human': '数字人',
    'video-editing': '视频编辑',
    'ai-dubbing': 'AI配音',
    'anime-creation': '动漫创作',
    'ai-image': 'AI绘画',
    'ai-writing': 'AI写作',
    'ai-coding': 'AI编程',
    'ai-audio': 'AI音频',
    'ai-office': 'AI办公',
    'ai-marketing': 'AI营销',
    'ai-learning': 'AI学习',
    'ai-chat': 'AI聊天',
    'ai-search': 'AI搜索',
  };

  const router = useRouter();

  // ==================== 初始化 ====================
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // 清理过期缓存
    cache.cleanup();
    // 获取分类列表
    fetchCategories();
  }, []);

  // ==================== 工具相关方法 ====================
  const fetchCategories = async () => {
    // 跳过缓存，直接获取最新数据
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchTools = useCallback(async () => {
    const cacheKey = `tools_${activeCategory}_${toolsPagination.page}`;
    const cached = cache.get(cacheKey);
    if (cached && !searchQuery) {
      setTools(cached.data || []);
      setToolsPagination(prev => ({ ...prev, total: cached.total, total_pages: cached.total_pages }));
      setToolsLoading(false);
      return;
    }
    
    setToolsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', toolsPagination.page.toString());
      params.set('limit', '20');
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      
      if (data.success) {
        const toolsData = data.data;
        setTools(toolsData);
        setToolsPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages
        }));
        if (!searchQuery) {
          cache.set(cacheKey, { data: toolsData, total: data.pagination.total, total_pages: data.pagination.total_pages });
        }
      }
    } catch (error) {
      console.error('获取工具失败:', error);
    } finally {
      setToolsLoading(false);
    }
  }, [toolsPagination.page, activeCategory, searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'tools') {
      setToolsPagination(prev => ({ ...prev, page: 1 }));
      fetchTools();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (mainTab === 'tools') {
      const timer = setTimeout(() => {
        setToolsPagination(prev => ({ ...prev, page: 1 }));
        fetchTools();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (mainTab === 'tools') fetchTools();
  }, [toolsPagination.page]);

  // ==================== 清除筛选 ====================
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  // ==================== 提示词相关方法 ====================
  const fetchPrompts = async (page: number) => {
    const cacheKey = `prompts_${promptCategory}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached && !promptSearch) {
      setPrompts(cached.data || []);
      setPromptsPagination(cached.pagination);
      setPromptsLoading(false);
      return;
    }
    
    setPromptsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (promptCategory !== '全部') params.set('category', promptCategory);
      if (promptSearch) params.set('search', promptSearch);

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
        setPromptsPagination(data.pagination);
        if (!promptSearch) {
          cache.set(cacheKey, { data: data.data, pagination: data.pagination });
        }
      }
    } catch (error) {
      console.error('获取Prompt失败:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'prompts') fetchPrompts(1);
  }, [mainTab, promptCategory]);

  // 提示词搜索
  useEffect(() => {
    if (mainTab === 'prompts') {
      const timer = setTimeout(() => fetchPrompts(1), 300);
      return () => clearTimeout(timer);
    }
  }, [promptSearch]);

  const copyPrompt = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.content);
    setCopiedPromptId(prompt.id);
    await fetch('/api/prompts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prompt.id })
    });
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // ==================== 教程相关方法 ====================
  const fetchTutorials = async (page: number) => {
    const cacheKey = `tutorials_${tutorialCategory}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached && !tutorialSearch) {
      setTutorials(cached.data || []);
      setTutorialsPagination(cached.pagination);
      setTutorialsLoading(false);
      return;
    }
    
    setTutorialsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (tutorialCategory !== '全部') params.set('category', tutorialCategory);
      if (tutorialSearch) params.set('search', tutorialSearch);

      const res = await fetch(`/api/tutorials?${params}`);
      const data = await res.json();
      if (data.success) {
        setTutorials(data.data);
        setTutorialsPagination(data.pagination);
        if (!tutorialSearch) {
          cache.set(cacheKey, { data: data.data, pagination: data.pagination });
        }
      }
    } catch (error) {
      console.error('获取教程失败:', error);
    } finally {
      setTutorialsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'tutorials') fetchTutorials(1);
  }, [mainTab, tutorialCategory]);

  // 教程搜索
  useEffect(() => {
    if (mainTab === 'tutorials') {
      const timer = setTimeout(() => fetchTutorials(1), 300);
      return () => clearTimeout(timer);
    }
  }, [tutorialSearch]);

  // ==================== Skill 相关方法 ====================
  const fetchSkillCategories = async () => {
    try {
      const res = await fetch('/api/skills/categories');
      const data = await res.json();
      if (data.success) {
        setSkillCategories(data.data || []);
      }
    } catch (error) {
      console.error('获取技能分类失败:', error);
    }
  };

  const fetchSkills = async (page: number) => {
    setSkillsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '24');
      if (skillCategory !== 'all') params.set('category', skillCategory.toString());
      if (skillSearch) params.set('search', skillSearch);

      const res = await fetch(`/api/skills?${params}`);
      const data = await res.json();
      if (data.success) {
        setSkills(data.data || []);
        setSkillsPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取技能列表失败:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'skills') {
      fetchSkillCategories();
    }
  }, [mainTab]);

  useEffect(() => {
    if (mainTab === 'skills') fetchSkills(1);
  }, [mainTab, skillCategory]);

  // 技能搜索
  useEffect(() => {
    if (mainTab === 'skills') {
      const timer = setTimeout(() => fetchSkills(1), 300);
      return () => clearTimeout(timer);
    }
  }, [skillSearch]);

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo - 防止被压缩 */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <AnimatedLobster size={32} className="sm:size-9" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                OneClaw
              </span>
            </Link>

            {/* 主导航Tab - 移动端隐藏文字 */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = mainTab === tab.key;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMainTab(tab.key)}
                    className={`flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== 工具导航 ==================== */}
        {mainTab === 'tools' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 - 桌面端侧边栏，移动端可折叠 */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm sticky top-24">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="truncate flex-1 text-left">全部</span>
                  </button>
                  {categories.map(cat => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
            
            {/* 移动端分类筛选 - 可折叠 */}
            <div className="md:hidden w-full">
              {/* 移动端分类选择器 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800 dark:text-white">选择分类</h2>
                  <span className="text-sm text-orange-500">
                    {activeCategory === 'all' ? '全部' : categories.find(c => c.slug === activeCategory)?.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    全部
                  </button>
                  {categories.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === cat.slug
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {categories.length > 8 && (
                  <button
                    onClick={() => setShowMoreCategories(!showMoreCategories)}
                    className="mt-2 text-sm text-orange-500 hover:text-orange-600"
                  >
                    {showMoreCategories ? '收起' : `更多分类 (${categories.length - 8})`}
                  </button>
                )}
                {showMoreCategories && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.slice(8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeCategory === cat.slug
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索框 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索AI工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

            {/* 广告位 */}
            <HomeBanner className="mb-6" />

            {/* 工具数量 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                共 <span className="font-semibold text-slate-900 dark:text-white">{toolsPagination.total}</span> 款工具
              </p>
            </div>

            {/* 工具列表 */}
            {toolsLoading ? (
              <SkeletonGrid count={8} />
            ) : tools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map((tool, index) => (
                    <>
                      <div
                        key={tool.id}
                        className="block cursor-pointer"
                        onClick={() => {
                          // 记录来源页面到 sessionStorage
                          if (typeof window !== 'undefined') {
                            const backState = { 
                              path: window.location.pathname + window.location.search || '/',
                              tab: 'tools'
                            };
                            sessionStorage.setItem('backFrom', JSON.stringify(backState));
                          }
                          // 异步记录浏览历史
                          if (userId) {
                            fetch('/api/history', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ user_id: userId, tool_id: tool.id })
                            }).catch(console.error);
                          }
                          // 在新标签页打开
                          window.open(`/tools/${tool.id}`, '_blank');
                        }}
                      >
                        <Card
                          className="h-full bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={tool.logo}
                                alt={tool.name}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</h3>
                                {isSponsorActive(tool.sponsor_type, tool.sponsor_expires_at) && (
                                  <SponsorBadge sponsorType={tool.sponsor_type} size="sm" />
                                )}
                                {tool.is_featured && !tool.sponsor_type && (
                                  <Star className="w-3 h-3 text-orange-500 fill-orange-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{tool.highlight}</p>

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </div>
                      {/* 在第8个位置后插入内嵌广告 */}
                      {index === 7 && (
                        <div key="inline-ad" className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                          <HomeInlineAd className="mt-2" />
                        </div>
                      )}
                    </>
                  ))}
                </div>

                {/* 分页 */}
                {toolsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === 1}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">
                      {toolsPagination.page} / {toolsPagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toolsPagination.page === toolsPagination.total_pages}
                      onClick={() => setToolsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无匹配工具</h3>
                <p className="text-sm text-slate-500 mb-4">尝试调整筛选条件</p>
                <Button variant="outline" onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ==================== 提示词库 ==================== */}
        {mainTab === 'prompts' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  {PROMPT_CATEGORIES.map(cat => {
                    const isActive = promptCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setPromptCategory(cat); setPromptsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索提示词..."
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPrompts(1)}
                    className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

            {/* Prompt列表 */}
            {promptsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : prompts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map(prompt => (
                    <Card 
                      key={prompt.id} 
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => {
                        // 记录来源页面
                        if (typeof window !== 'undefined') {
                          const backState = {
                            page: promptsPagination.page,
                            category: promptCategory,
                            search: promptSearch,
                            path: window.location.pathname + window.location.search,
                            tab: 'prompts'
                          };
                          sessionStorage.setItem('backFrom', JSON.stringify(backState));
                        }
                        window.open(`/prompts/${prompt.id}`, '_blank');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{prompt.title}</h3>
                          <Badge variant="outline" className="text-xs">{prompt.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">{prompt.content}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prompt.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{prompt.uses}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{prompt.likes}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyPrompt(prompt); }}>
                            {copiedPromptId === prompt.id ? <><Check className="w-3 h-3 mr-1" />已复制</> : <><Copy className="w-3 h-3 mr-1" />复制</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {promptsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={promptsPagination.page === 1} onClick={() => fetchPrompts(promptsPagination.page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{promptsPagination.page} / {promptsPagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={promptsPagination.page === promptsPagination.total_pages} onClick={() => fetchPrompts(promptsPagination.page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无提示词</h3>
                <p className="text-sm text-slate-500">提示词模板正在整理中，敬请期待</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ==================== 教程库 ==================== */}
        {mainTab === 'tutorials' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  {TUTORIAL_CATEGORIES.map(cat => {
                    const isActive = tutorialCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setTutorialCategory(cat); setTutorialsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索教程..."
                    value={tutorialSearch}
                    onChange={(e) => setTutorialSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchTutorials(1)}
                    className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

            {/* 教程列表 */}
            {tutorialsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : tutorials.length > 0 ? (
              <>
                <div className="space-y-4">
                  {tutorials.map(tutorial => (
                    <Card 
                      key={tutorial.id} 
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => {
                        // 记录来源页面
                        if (typeof window !== 'undefined') {
                          const backState = {
                            page: tutorialsPagination.page,
                            category: tutorialCategory,
                            search: tutorialSearch,
                            path: window.location.pathname + window.location.search,
                            tab: 'tutorials'
                          };
                          sessionStorage.setItem('backFrom', JSON.stringify(backState));
                        }
                        window.open(`/tutorials/${tutorial.id}`, '_blank');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {tutorial.cover_image ? (
                            <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                              <img src={tutorial.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ) : (
                            <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex-shrink-0 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-orange-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-medium text-slate-800 dark:text-slate-100">{tutorial.title}</h3>
                              <Badge variant="outline" className="text-xs">{tutorial.category}</Badge>
                              <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tutorial.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                                {tutorial.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                              {tutorial.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {tutorial.author && <span>作者: {tutorial.author}</span>}
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tutorial.views}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{tutorial.likes}</span>
                              <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {tutorialsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={tutorialsPagination.page === 1} onClick={() => fetchTutorials(tutorialsPagination.page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{tutorialsPagination.page} / {tutorialsPagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={tutorialsPagination.page === tutorialsPagination.total_pages} onClick={() => fetchTutorials(tutorialsPagination.page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无教程</h3>
                <p className="text-sm text-slate-500">教程内容正在编写中，敬请期待</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ==================== 精选工具 ==================== */}
        {mainTab === 'utilities' && (
          <UtilityToolsPage />
        )}

        {/* ==================== Skill ==================== */}
        {mainTab === 'skills' && (
          <div className="flex gap-6">
            {/* 左侧分类导航 */}
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm sticky top-24">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-800 dark:text-white">分类</h2>
                </div>
                <nav className="p-2 space-y-0.5">
                  <button
                    onClick={() => { setSkillCategory('all'); setSkillsPagination(prev => ({ ...prev, page: 1 })); }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      skillCategory === 'all'
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="truncate flex-1 text-left">全部</span>
                  </button>
                  {skillCategories.map(cat => {
                    const isActive = skillCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSkillCategory(cat.id); setSkillsPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{cat.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              {/* 搜索 */}
              <div className="mb-4">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索技能..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSkills(1)}
                    className="pl-12 pr-4 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

            {/* 技能列表 - SkillHub 风格 */}
            {skillsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : skills.length > 0 ? (
              <>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {skills.map(skill => {
                    // 生成字母标识的颜色
                    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
                    const colorIndex = skill.name.charCodeAt(0) % colors.length;
                    const bgColor = colors[colorIndex];
                    const letter = skill.name.charAt(0).toUpperCase();
                    
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center gap-4 py-4 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            const backState = {
                              page: skillsPagination.page,
                              search: skillSearch,
                              category: skillCategory,
                              path: window.location.pathname + window.location.search,
                              tab: 'skills'
                            };
                            sessionStorage.setItem('backFrom', JSON.stringify(backState));
                          }
                          window.open(`/skills/${skill.slug}`, '_blank');
                        }}
                      >
                        {/* 左侧：字母标识 + 标题 + 描述 */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0"
                            style={{ backgroundColor: bgColor + '20' }}
                          >
                            <span style={{ color: bgColor }}>{letter}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-1 group-hover:text-orange-500 transition-colors">
                              {skill.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                              {skill.description || '暂无描述'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 分页 */}
                {skillsPagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={skillsPagination.page === 1} onClick={() => fetchSkills(skillsPagination.page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{skillsPagination.page} / {skillsPagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={skillsPagination.page === skillsPagination.total_pages} onClick={() => fetchSkills(skillsPagination.page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">暂无技能</h3>
                <p className="text-sm text-slate-500">技能内容正在整理中，敬请期待</p>
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* 公众号推广 - 居中卡片设计 */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 mb-8 border border-orange-100 dark:border-orange-800/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 二维码区域 */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl">
                  <Image 
                    src="/wechat-qrcode.jpg" 
                    alt="微信公众号" 
                    width={120}
                    height={120}
                    className="w-28 h-28 rounded-lg"
                  />
                </div>
                {/* 装饰龙虾 */}
                <div className="absolute -top-4 -right-4">
                  <AnimatedLobster size={32} />
                </div>
              </div>
              
              {/* 文字区域 */}
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  欢迎关注公众号
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-1">
                  获取最新AI工具资讯、技巧与资源
                </p>
                <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  回复「AI」送你一份AI工具使用指南
                </div>
              </div>
              
              {/* 右侧品牌 */}
              <div className="hidden md:flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <AnimatedLobster size={40} />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">OneClaw</span>
              </div>
            </div>
          </div>
          
          {/* 底部导航 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
              <span className="text-xs text-slate-400 ml-2">AI工具导航</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
