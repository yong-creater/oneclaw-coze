'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink, ArrowLeftRight, Check, X, Star,
  ChevronLeft, Crown
} from 'lucide-react';
import Link from 'next/link';

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

// 评分统计
interface RatingStats {
  count: number;
  avg_overall: number;
  avg_effect: number;
  avg_usability: number;
  avg_quota: number;
  avg_stability: number;
}

// 评论
interface Review {
  id: number;
  content: string;
  likes: number;
  user_ratings?: {
    effect_score: number;
    usability_score: number;
    quota_score: number;
    stability_score: number;
  };
}

// 11个对比维度
const COMPARE_DIMENSIONS = [
  { key: 'basic', label: '基础信息', icon: '📋' },
  { key: 'free', label: '免费权益', icon: '🎁' },
  { key: 'features', label: '核心功能', icon: '⚡' },
  { key: 'params', label: '核心参数', icon: '🔧' },
  { key: 'category', label: '品类专属能力', icon: '🎯' },
  { key: 'license', label: '商用授权', icon: '📜' },
  { key: 'pricing', label: '付费套餐', icon: '💰' },
  { key: 'rating', label: '用户口碑', icon: '⭐' },
  { key: 'pros', label: '核心优势', icon: '✅' },
  { key: 'cons', label: '局限性', icon: '❌' },
  { key: 'links', label: '直达入口', icon: '🔗' },
];

// 获取分类专属能力字段
function getCategoryFields(categorySlug: string, tool: ToolDetail) {
  switch (categorySlug) {
    case 'video-generation':
    case 'video-editing':
    case 'anime-creation':
      return {
        '生成时长': tool.max_duration || '未说明',
        '分辨率': tool.feature_tags.find(t => t.includes('4K') || t.includes('1080')) || '标准',
      };
    case 'ai-dubbing':
      return {
        '支持语言': tool.feature_tags.find(t => t.includes('多语言')) ? '多语言' : '中文',
        '声音克隆': tool.feature_tags.includes('声音克隆') ? '支持' : '不支持',
      };
    case 'ai-image':
      return {
        '画质': tool.feature_tags.find(t => t.includes('4K')) ? '4K' : '标准',
        '风格': tool.feature_tags.filter(t => ['艺术创作', '多风格'].includes(t)).join('、') || '多种',
      };
    case 'ai-writing':
      return {
        '生成上限': tool.free_quota_desc || '未说明',
        '原创度': tool.feature_tags.includes('原创') ? '高' : '标准',
      };
    case 'ai-coding':
      return {
        '支持语言': tool.feature_tags.includes('多语言') ? '多语言' : '主流语言',
        '调试能力': tool.feature_tags.includes('调试') ? '支持' : '基础',
      };
    case 'ai-chat':
      return {
        '上下文': tool.feature_tags.includes('长上下文') ? '长' : '标准',
        '联网': tool.feature_tags.includes('联网') ? '支持' : '不支持',
      };
    case 'ai-audio':
      return {
        '音频时长': tool.max_duration || '标准',
        '人声': tool.feature_tags.includes('人声') ? '支持' : '不支持',
      };
    case 'ai-office':
      return {
        '模板': tool.feature_tags.includes('模板') ? '丰富' : '基础',
        '协作': tool.feature_tags.includes('协作') ? '支持' : '不支持',
      };
    default:
      return {
        '特色': tool.feature_tags.slice(0, 2).join('、') || '标准',
      };
  }
}

// 评分组件
function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className={`w-4 h-4 ${value > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
      <span className="text-sm font-medium">{value.toFixed(1)}</span>
    </div>
  );
}

// 对比表格行
function CompareRow({ 
  label, 
  values, 
  isHighlight = false 
}: { 
  label: string; 
  values: (string | React.ReactNode)[];
  isHighlight?: boolean;
}) {
  return (
    <tr className={`border-b border-slate-200 dark:border-slate-700 ${isHighlight ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 sticky left-0">
        {label}
      </td>
      {values.map((value, i) => (
        <td key={i} className={`px-4 py-3 text-slate-600 dark:text-slate-400 ${isHighlight ? 'text-green-700 dark:text-green-400' : ''}`}>
          {value}
        </td>
      ))}
    </tr>
  );
}

// 主组件
function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tools, setTools] = useState<ToolDetail[]>([]);
  const [ratings, setRatings] = useState<Record<number, RatingStats>>({});
  const [reviews, setReviews] = useState<Record<number, Review[]>>({});
  const [loading, setLoading] = useState(true);

  const toolIds = searchParams.get('ids')?.split(',').map(Number) || [];

  useEffect(() => {
    if (toolIds.length === 0) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // 获取工具详情
      const toolsData: ToolDetail[] = [];
      const ratingsData: Record<number, RatingStats> = {};
      const reviewsData: Record<number, Review[]> = {};

      for (const id of toolIds) {
        try {
          const res = await fetch(`/api/tools/${id}`);
          const data = await res.json();
          if (data.success) {
            toolsData.push(data.data);

            // 获取评分
            const ratingRes = await fetch(`/api/ratings?tool_id=${id}`);
            const ratingData = await ratingRes.json();
            if (ratingData.success) {
              ratingsData[id] = ratingData.data;
            }

            // 获取评论
            const reviewsRes = await fetch(`/api/reviews?tool_id=${id}&limit=3`);
            const reviewsResData = await reviewsRes.json();
            if (reviewsResData.success) {
              reviewsData[id] = reviewsResData.data;
            }
          }
        } catch (error) {
          console.error('获取工具失败:', error);
        }
      }

      setTools(toolsData);
      setRatings(ratingsData);
      setReviews(reviewsData);
      setLoading(false);
    };

    fetchData();
  }, [toolIds.join(','), router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">未找到对比工具</p>
          <Button onClick={() => router.push('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  const categorySlug = tools[0]?.categories?.slug;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {/* 顶部工具卡片 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-orange-500" />
              工具对比
            </h1>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              重新选择
            </Button>
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
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
        </div>
      </div>

      {/* 对比表格 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
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
                {/* 基础信息 */}
                <CompareRow
                  label="工具名称"
                  values={tools.map(t => t.name)}
                />
                <CompareRow
                  label="出品方"
                  values={tools.map(t => t.producer)}
                />
                <CompareRow
                  label="核心亮点"
                  values={tools.map(t => t.highlight)}
                />

                {/* 免费权益 */}
                <CompareRow
                  label="免费类型"
                  values={tools.map(t => (
                    <Badge className={
                      t.free_type === '完全免费' ? 'bg-green-100 text-green-700' :
                      t.free_type === '免费额度' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {t.free_type}
                    </Badge>
                  ))}
                />
                <CompareRow
                  label="免费额度"
                  values={tools.map(t => t.free_quota_desc || '无')}
                />

                {/* 核心功能 */}
                <CompareRow
                  label="核心功能"
                  values={tools.map(t => (
                    <div className="flex flex-wrap gap-1">
                      {t.feature_tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ))}
                />

                {/* 品类专属能力 */}
                {tools[0] && (
                  <>
                    {Object.entries(getCategoryFields(categorySlug, tools[0])).map(([key, value]) => (
                      <CompareRow
                        key={key}
                        label={key}
                        values={tools.map(t => {
                          const fields = getCategoryFields(t.categories?.slug || '', t) as unknown as Record<string, string | undefined>;
                          return fields[key] || '-';
                        })}
                      />
                    ))}
                  </>
                )}

                {/* 商用授权 */}
                <CompareRow
                  label="商用授权"
                  values={tools.map(t => t.commercial_license)}
                />

                {/* 用户口碑 */}
                <CompareRow
                  label="综合评分"
                  values={tools.map(t => {
                    const r = ratings[t.id];
                    return r?.count > 0 ? (
                      <RatingStars value={r.avg_overall} />
                    ) : (
                      <span className="text-slate-400">暂无评分</span>
                    );
                  })}
                />

                {/* 核心优势 */}
                <CompareRow
                  label="核心优势"
                  values={tools.map(t => (
                    <ul className="space-y-1">
                      {t.advantages.map((a, i) => (
                        <li key={i} className="flex items-start gap-1 text-sm text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  ))}
                  isHighlight
                />

                {/* 局限性 */}
                <CompareRow
                  label="局限性"
                  values={tools.map(t => (
                    <ul className="space-y-1">
                      {t.limitations.length > 0 ? t.limitations.map((l, i) => (
                        <li key={i} className="flex items-start gap-1 text-sm text-red-600 dark:text-red-400">
                          <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {l}
                        </li>
                      )) : <li className="text-slate-400 text-sm">暂无</li>}
                    </ul>
                  ))}
                />

                {/* 直达入口 */}
                <CompareRow
                  label="直达入口"
                  values={tools.map(t => (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      onClick={() => window.open(t.promotion_url || t.official_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      访问官网
                    </Button>
                  ))}
                />
              </tbody>
            </table>
          </div>
        </Card>

        {/* 用户短评精选 */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">用户短评精选</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => {
              const toolReviews = reviews[tool.id] || [];
              return (
                <Card key={tool.id}>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <img src={tool.logo} alt={tool.name} className="w-5 h-5 rounded" />
                      {tool.name}
                    </h3>
                    {toolReviews.length > 0 ? (
                      <ul className="space-y-2">
                        {toolReviews.slice(0, 3).map(r => (
                          <li key={r.id} className="text-sm text-slate-600 dark:text-slate-400 border-l-2 border-orange-300 pl-2">
                            {r.content}
                            <span className="text-xs text-slate-400 ml-2">👍 {r.likes}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">暂无短评</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" onClick={() => router.push('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            重新选择工具
          </Button>
        </div>

        {/* 会员提示 */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-slate-700 dark:text-slate-300 mb-2">
              成为会员，解锁更多对比功能
            </p>
            <Link href="/membership">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                开通会员
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">加载中...</div>}>
      <CompareContent />
    </Suspense>
  );
}
