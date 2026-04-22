'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, ChevronRight, Star, TrendingUp, 
  FileText, Feather, Globe, Sparkles, X
} from 'lucide-react';

// ==================== 类型定义 ====================
interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  link: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  stats?: { label: string; value: string }[];
}

// 案例数据配置
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'resume-1',
    title: '从简历石沉大海到斩获字节offer',
    subtitle: '23届李明 · 简历通过率提升 200%',
    badge: '校招求职',
    badgeColor: 'bg-blue-500',
    description: '计算机毕业生，通过STAR法则重构项目经历，突出"独立开发""性能优化"等关键词，将平平无奇的学生经历转化为面试官眼中的亮点，成功入职字节跳动。',
    link: '/cases/resume',
    gradient: 'from-blue-500 to-cyan-500',
    icon: FileText,
    stats: [
      { label: '简历通过率', value: '+200%' },
      { label: '面试邀约率', value: '+150%' },
    ],
  },
  {
    id: 'resume-2',
    title: '5年产品经理涨薪40%',
    subtitle: '王芳 · 成功收获多个大厂offer',
    badge: '社招跳槽',
    badgeColor: 'bg-cyan-500',
    description: '王芳量化工作成果为"提升转化率35%"，配合JD精准匹配，成功收获阿里、腾讯、美团等多个大厂offer。',
    link: '/cases/resume',
    gradient: 'from-cyan-500 to-teal-500',
    icon: TrendingUp,
    stats: [
      { label: '涨薪幅度', value: '40%' },
      { label: 'offer数量', value: '3+' },
    ],
  },
  {
    id: 'novel-1',
    title: '1小时产出10条推文，月入5万+',
    subtitle: '短剧达人 · 单条佣金最高 2万',
    badge: '短剧创作',
    badgeColor: 'bg-purple-500',
    description: '利用推文脚本功能，输入小说链接自动生成抓人眼球的推文素材，配合AI配音批量产出，单条视频佣金突破2万。',
    link: '/cases/novel',
    gradient: 'from-purple-500 to-pink-500',
    icon: Feather,
    stats: [
      { label: '月收入', value: '5万+' },
      { label: '单条最高', value: '2万' },
    ],
  },
  {
    id: 'novel-2',
    title: '番茄爆款文改编漫画，首月抖音涨粉3万',
    subtitle: '小说作者"云起" · 抖音涨粉 3万',
    badge: '小说改编',
    badgeColor: 'bg-pink-500',
    description: '小说作者"云起"将番茄爆款《都市狂少》深度洗稿后，配合AI生图功能产出50集漫画内容，首月抖音涨粉3万。',
    link: '/cases/novel',
    gradient: 'from-pink-500 to-rose-500',
    icon: Sparkles,
    stats: [
      { label: '抖音涨粉', value: '3万' },
      { label: '内容产出', value: '50集' },
    ],
  },
  {
    id: 'ecommerce-1',
    title: '3C配件日出千单，转化率提升180%',
    subtitle: '深圳卖家陈总 · 月销量翻 3番',
    badge: '亚马逊Listing',
    badgeColor: 'bg-emerald-500',
    description: '输入产品关键词后，一键生成符合亚马逊规范的英文详情页，A+内容点击率提升2倍，月销量从千单突破到三千单。',
    link: '/cases/product-page',
    gradient: 'from-emerald-500 to-teal-500',
    icon: Globe,
    stats: [
      { label: '转化率', value: '+180%' },
      { label: '月销量', value: '3倍' },
    ],
  },
  {
    id: 'ecommerce-2',
    title: '多平台分发，效率提升500%',
    subtitle: '独立站卖家小王 · 效率 +500%',
    badge: '多平台分发',
    badgeColor: 'bg-teal-500',
    description: '一套产品详情自动适配Shopify、WooCommerce、速卖通多平台版本，节省80%翻译和改版时间，专注选品运营。',
    link: '/cases/product-page',
    gradient: 'from-teal-500 to-cyan-500',
    icon: Star,
    stats: [
      { label: '效率提升', value: '+500%' },
      { label: '时间节省', value: '80%' },
    ],
  },
];

// 工具类型对应的案例ID映射
const TOOL_CASE_MAPPING: Record<string, string[]> = {
  // 简历相关
  'resume': ['resume', 'resume-2'],
  // 写作/小说相关
  'novel': ['novel-1', 'novel-2'],
  'writing': ['novel-1', 'novel-2'],
  'content': ['novel-1', 'novel-2'],
  // 电商/出海相关
  'ecommerce': ['ecommerce-1', 'ecommerce-2'],
  'product': ['ecommerce-1', 'ecommerce-2'],
  '出海': ['ecommerce-1', 'ecommerce-2'],
};

// 根据工具slug获取相关案例
export function getRelatedCases(toolSlug: string, toolName: string): CaseStudy[] {
  const slugLower = toolSlug.toLowerCase();
  const nameLower = toolName.toLowerCase();
  
  // 尝试通过slug匹配
  for (const [key, caseIds] of Object.entries(TOOL_CASE_MAPPING)) {
    if (slugLower.includes(key) || nameLower.includes(key)) {
      return caseIds.map(id => CASE_STUDIES.find(c => c.id === id)).filter(Boolean) as CaseStudy[];
    }
  }
  
  return [];
}

// 悬浮案例卡片组件
interface CaseStudyFloatCardProps {
  toolSlug?: string;
  toolName?: string;
}

export default function CaseStudyFloatCard({ toolSlug = '', toolName = '' }: CaseStudyFloatCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const relatedCases = getRelatedCases(toolSlug, toolName);

  // 如果没有相关案例，不显示
  if (relatedCases.length === 0) {
    return null;
  }

  return (
    <>
      {/* 展开遮罩层 */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* 悬浮卡片 */}
      <div 
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-12'
        }`}
      >
        {/* 主卡片 */}
        <div className={`
          bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden
          transition-all duration-300
          ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-90 hover:opacity-100'}
        `}>
          {/* 收起时的按钮 */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-12 h-40 flex flex-col items-center justify-center gap-2 text-orange-500 hover:text-orange-600 transition-colors group"
              title="查看使用案例"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium writing-vertical-rl">案例</span>
            </button>
          )}
          
          {/* 展开时的内容 */}
          {isExpanded && (
            <div className="p-4">
              {/* 头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">使用案例</h3>
                    <p className="text-xs text-slate-500">点击进入，探索更多可能</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              </div>
              
              {/* 案例列表 */}
              <div className="space-y-3">
                {relatedCases.map((caseItem) => {
                  const IconComponent = caseItem.icon;
                  return (
                    <div
                      key={caseItem.id}
                      className="group cursor-pointer"
                      onClick={() => router.push(caseItem.link)}
                    >
                      {/* 案例卡片 */}
                      <div className="relative rounded-xl overflow-hidden">
                        {/* 渐变背景 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${caseItem.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        
                        <div className="relative p-3">
                          {/* 标题区 */}
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${caseItem.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`px-1.5 py-0.5 ${caseItem.badgeColor} text-white text-[10px] font-medium rounded`}>
                                  {caseItem.badge}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-800 truncate">
                                {caseItem.title}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">
                                {caseItem.subtitle}
                              </p>
                            </div>
                          </div>
                          
                          {/* 数据统计 */}
                          {caseItem.stats && (
                            <div className="flex gap-3 mb-2">
                              {caseItem.stats.map((stat, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <span className="text-xs font-semibold text-orange-600">
                                    {stat.value}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {stat.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* 描述 */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {caseItem.description}
                          </p>
                          
                          {/* 查看更多 */}
                          <div className="flex items-center gap-1 mt-2 text-orange-500 group-hover:text-orange-600 transition-colors">
                            <span className="text-xs font-medium">查看详情</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 底部提示 */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 text-center">
                  真实案例数据，效果因人而异
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 导出案例数据供其他组件使用
export { CASE_STUDIES, type CaseStudy };
