'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink, ArrowLeftRight, Check, X, Star,
  ChevronLeft, Crown
} from 'lucide-react';
import Link from 'next/link';

// 预设模板配置
const TEMPLATES: Record<string, {
  title: string;
  description: string;
  category: string;
  toolIds: number[];
}> = {
  'free-text': {
    title: '国产免费AI文本工具对比',
    description: '对比Kimi、豆包、通义千问等国产免费AI文本工具',
    category: 'ai-chat',
    toolIds: [202, 206, 203], // Kimi, 豆包, 通义千问
  },
  'ai-image': {
    title: 'AI图像绘画工具对比',
    description: '对比Midjourney、DALL·E 3、Stable Diffusion等主流AI绘画工具',
    category: 'ai-image',
    toolIds: [], // 需要根据实际数据
  },
  'ai-video': {
    title: 'AI视频生成工具对比',
    description: '对比Sora、Runway、可灵AI等AI视频生成工具',
    category: 'video-generation',
    toolIds: [],
  },
  'ai-code': {
    title: 'AI代码开发工具对比',
    description: '对比GitHub Copilot、Cursor、通义灵码等AI编程工具',
    category: 'ai-coding',
    toolIds: [],
  },
  'office': {
    title: '办公效率AI工具对比',
    description: '对比Gamma、飞书妙记等AI办公工具',
    category: 'ai-office',
    toolIds: [],
  },
  'learning': {
    title: '学习教育AI工具对比',
    description: '对比Duolingo、Speak等AI学习工具',
    category: 'ai-learning',
    toolIds: [],
  },
  'ecommerce': {
    title: '电商运营AI工具对比',
    description: '对比Jasper、Copy.ai等电商营销AI工具',
    category: 'ai-marketing',
    toolIds: [],
  },
  'llm': {
    title: '多模态大模型对比',
    description: '对比ChatGPT、Claude、Gemini等主流大模型',
    category: 'ai-chat',
    toolIds: [],
  },
};

// 工具详情类型
interface ToolDetail {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category_id: number;
  free_type: string;
  free_quota_desc: string | null;
  feature_tags: string[];
  official_url: string;
  promotion_url: string | null;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  max_duration: string;
  categories: { name: string; slug: string };
}

export default function CompareTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateKey = params.template as string;
  const template = TEMPLATES[templateKey];
  
  const [tools, setTools] = useState<ToolDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!template) {
      router.push('/rankings');
      return;
    }

    const fetchTools = async () => {
      setLoading(true);
      
      // 如果有预设ID，使用ID获取
      if (template.toolIds.length > 0) {
        const toolsData: ToolDetail[] = [];
        for (const id of template.toolIds) {
          try {
            const res = await fetch(`/api/tools/${id}`);
            const data = await res.json();
            if (data.success) {
              toolsData.push(data.data);
            }
          } catch (error) {
            console.error('获取工具失败:', error);
          }
        }
        setTools(toolsData);
      } else {
        // 否则按分类获取前3个
        try {
          const res = await fetch(`/api/tools?category=${template.category}&limit=3`);
          const data = await res.json();
          if (data.success) {
            setTools(data.data);
          }
        } catch (error) {
          console.error('获取工具失败:', error);
        }
      }
      
      setLoading(false);
    };

    fetchTools();
  }, [templateKey, template, router]);

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">模板不存在</p>
          <Button onClick={() => router.push('/rankings')}>返回榜单</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {/* 顶部 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                {template.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{template.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/rankings')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回榜单
            </Button>
          </div>
        </div>
      </div>

      {/* 工具卡片 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : tools.length > 0 ? (
          <>
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {tools.map(tool => (
                <Card key={tool.id} className="flex-shrink-0 w-48">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-10 h-10 rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-slate-100">{tool.name}</h3>
                        <p className="text-xs text-slate-500">{tool.producer}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      onClick={() => window.open(tool.promotion_url || tool.official_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      官网直达
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 对比表格 */}
            <Card className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 sticky left-0 w-40">
                        对比维度
                      </th>
                      {tools.map(tool => (
                        <th key={tool.id} className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 min-w-[200px]">
                          {tool.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">免费类型</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3">
                          <Badge className={
                            t.free_type === '完全免费' ? 'bg-green-100 text-green-700' :
                            t.free_type === '免费额度' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {t.free_type}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">免费额度</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {t.free_quota_desc || '无'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">核心功能</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {t.feature_tags.slice(0, 4).map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">商用授权</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {t.commercial_license}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">核心优势</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3">
                          <ul className="space-y-1">
                            {t.advantages.map((a, i) => (
                              <li key={i} className="flex items-start gap-1 text-sm text-green-600 dark:text-green-400">
                                <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">局限性</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3">
                          <ul className="space-y-1">
                            {t.limitations.length > 0 ? t.limitations.map((l, i) => (
                              <li key={i} className="flex items-start gap-1 text-sm text-red-600 dark:text-red-400">
                                <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {l}
                              </li>
                            )) : <li className="text-slate-400 text-sm">暂无</li>}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">直达入口</td>
                      {tools.map(t => (
                        <td key={t.id} className="px-4 py-3">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            onClick={() => window.open(t.promotion_url || t.official_url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            访问官网
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 自定义对比按钮 */}
            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  自定义对比其他工具
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            暂无对比数据
          </div>
        )}
      </div>
    </div>
  );
}
