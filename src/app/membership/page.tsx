'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown, Check, X, Zap, Star, Shield, MessageSquare,
  Heart, ArrowLeftRight, Bell, Users, Headphones, Sparkles
} from 'lucide-react';
import Link from 'next/link';

// 会员套餐配置
const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: 19,
    originalPrice: 19,
    period: '月',
    discount: null,
    avgPrice: 19,
    features: ['全站无广告', '教程/Prompt无限查看', '收藏上限500个', '3款工具对比', '会员专属榜单'],
    recommended: false,
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: 99,
    originalPrice: 228,
    period: '年',
    discount: '4.3折',
    avgPrice: 8.25,
    features: ['全站无广告', '教程/Prompt无限查看', '收藏上限500个', '3款工具对比', '会员专属榜单', '新工具优先提醒', '会员专属社群'],
    recommended: true,
  },
  {
    id: 'lifetime',
    name: '终身会员',
    price: 299,
    originalPrice: null,
    period: '永久',
    discount: '一次付费',
    avgPrice: null,
    features: ['全站无广告', '教程/Prompt无限查看', '收藏上限500个', '3款工具对比', '会员专属榜单', '新工具优先提醒', '会员专属社群', '一对一选型咨询', '内测资格优先'],
    recommended: false,
  },
];

// 权益对比
const BENEFITS = [
  {
    feature: '工具导航、筛选、搜索',
    free: true,
    paid: true,
  },
  {
    feature: '详情页、榜单访问',
    free: true,
    paid: true,
  },
  {
    feature: '每日查看教程',
    free: '3篇',
    paid: '无限',
  },
  {
    feature: '每日复制Prompt',
    free: '5条',
    paid: '无限',
  },
  {
    feature: '收藏上限',
    free: '50个',
    paid: '500个',
  },
  {
    feature: '工具对比',
    free: '2款',
    paid: '3款',
  },
  {
    feature: '全站无广告',
    free: false,
    paid: true,
  },
  {
    feature: '会员专属身份标识',
    free: false,
    paid: true,
  },
  {
    feature: '会员专属进阶教程',
    free: false,
    paid: true,
  },
  {
    feature: '爆款Prompt合集',
    free: false,
    paid: true,
  },
  {
    feature: '新工具优先提醒',
    free: false,
    paid: true,
  },
  {
    feature: '会员专属社群',
    free: false,
    paid: true,
  },
  {
    feature: '一对一选型咨询',
    free: false,
    paid: '1次/月',
  },
  {
    feature: '内测资格优先',
    free: false,
    paid: true,
  },
];

// 分类权益
const CATEGORY_BENEFITS = [
  { category: '视频生成', icon: '🎬', benefits: '专属视频生成Prompt合集、新工具内测资格' },
  { category: 'AI绘画', icon: '🎨', benefits: '绘画风格Prompt模板、Midjourney进阶教程' },
  { category: 'AI编程', icon: '💻', benefits: '代码生成Prompt模板、Cursor使用技巧' },
  { category: 'AI写作', icon: '✍️', benefits: '营销文案模板、SEO写作技巧' },
  { category: 'AI聊天', icon: '💬', benefits: 'Prompt工程教程、角色扮演模板' },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [userId, setUserId] = useState('');
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // 获取用户ID
    const id = localStorage.getItem('oneclaw_user_id') || '';
    setUserId(id);

    // 检查会员状态
    const checkMember = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/members?user_id=${id}`);
        const data = await res.json();
        if (data.success && data.data?.is_active) {
          setIsMember(true);
        }
      } catch (error) {
        console.error('检查会员状态失败:', error);
      }
    };

    checkMember();
  }, []);

  // 开通会员
  const handleSubscribe = async () => {
    // TODO: 对接微信支付
    alert('支付功能开发中，敬请期待！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* 顶部Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">开通 OneClaw 会员</h1>
          <p className="text-orange-100">解锁全品类AI工具专属权益</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 套餐选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map(plan => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-orange-500 shadow-lg'
                  : 'hover:shadow-md'
              } ${plan.recommended ? 'border-orange-500' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    最受欢迎
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
                  {plan.name}
                </h3>
                {plan.discount && (
                  <p className="text-center text-orange-500 text-sm mt-1">{plan.discount}</p>
                )}
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    ¥{plan.price}
                  </span>
                  <span className="text-slate-500">/{plan.period}</span>
                </div>
                {plan.avgPrice && (
                  <p className="text-center text-sm text-slate-500 mt-1">
                    平均¥{plan.avgPrice}/月
                  </p>
                )}
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-6 ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe();
                  }}
                >
                  {isMember ? '续费' : '立即开通'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 权益对比表 */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
              会员权益对比
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      权益项目
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300 w-32">
                      免费用户
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300 w-32">
                      付费会员
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BENEFITS.map((b, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {b.feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof b.free === 'boolean' ? (
                          b.free ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">{b.free}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof b.paid === 'boolean' ? (
                          b.paid ? (
                            <Check className="w-5 h-5 text-orange-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-orange-500 font-medium">{b.paid}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 分品类权益 */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            分品类会员专属权益
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORY_BENEFITS.map((c, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                    {c.category}
                  </h3>
                  <p className="text-sm text-slate-500">{c.benefits}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 合规说明 */}
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-6">
            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-3">购买须知</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• 会员权益自开通之日起生效，有效期根据所选套餐确定</li>
              <li>• 虚拟产品，7天内未使用权益可全额退款，已使用不予退款</li>
              <li>• 如有疑问，请联系客服：1017760688@qq.com</li>
              <li>• 最终解释权归 OneClaw 所有</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
