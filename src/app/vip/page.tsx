'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Crown, Check, Zap, Star, Shield, Download, 
  Infinity, Heart, Users, Sparkles, CreditCard, Gift
} from 'lucide-react';
import Footer from '@/components/common/Footer';

// 会员套餐
const PLANS = [
  {
    id: 'monthly',
    name: 'VIP月卡',
    price: 19,
    period: '月',
    original: 39,
    features: [
      '无限次使用全部AI功能',
      '导出图片无水印',
      '支持原图分辨率导出',
      '50GB云存储空间',
      '批量处理最多20张',
      '全部模板素材可用',
      '优先客服响应',
    ],
    color: 'from-blue-500 to-indigo-500',
    badge: null,
  },
  {
    id: 'quarterly',
    name: 'VIP季卡',
    price: 49,
    period: '季',
    original: 99,
    perMonth: 16.3,
    features: [
      '包含VIP月卡全部权益',
      '折算仅需16.3元/月',
      '比月卡节省27%',
      '全功能无限使用',
      '优先客服响应',
    ],
    color: 'from-purple-500 to-pink-500',
    badge: '推荐',
  },
  {
    id: 'yearly',
    name: 'VIP年卡',
    price: 158,
    period: '年',
    original: 468,
    perMonth: 13.2,
    features: [
      '包含VIP月卡全部权益',
      '折算仅需13.2元/月',
      '比月卡节省66%',
      '性价比最高',
      '专属年卡礼包',
    ],
    color: 'from-amber-500 to-orange-500',
    badge: '超值',
  },
];

// 会员权益
const BENEFITS = [
  { icon: Infinity, title: '无限次使用', desc: '所有AI功能无限次使用' },
  { icon: Download, title: '无水印导出', desc: '下载无平台水印' },
  { icon: Star, title: '原图分辨率', desc: '支持最高清原图导出' },
  { icon: Shield, title: '批量处理', desc: '单次最多处理20张' },
  { icon: Heart, title: 'VIP专属素材', desc: '全部模板滤镜可用' },
  { icon: Users, title: '优先客服', desc: '专属客服快速响应' },
];

// 免费vs VIP对比
const COMPARISON = [
  { feature: 'AI智能修图', free: '3次/日', vip: '无限次' },
  { feature: 'AI智能消除', free: '2次/日', vip: '无限次' },
  { feature: 'AI抠图', free: '5次/日', vip: '无限次' },
  { feature: 'AI扩图', free: '3次/日', vip: '无限次' },
  { feature: '导出分辨率', free: '1080P', vip: '原分辨率' },
  { feature: '水印', free: '带水印', vip: '无水印' },
  { feature: '批量处理', free: '不支持', vip: '20张/次' },
  { feature: '云存储空间', free: '5GB', vip: '50GB' },
  { feature: '模板素材', free: '基础款', vip: '全部可用' },
];

export default function VipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('quarterly');
  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessing(false);
    alert('支付功能开发中，敬请期待！');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white">会员中心</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Hero区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            开通VIP，解锁全部AI能力
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            全站AI功能，一键解锁
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            告别次数限制，享受无限创作。开通VIP即可畅享全部AI修图、生成、处理功能
          </p>
        </div>

        {/* 核心权益展示 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-medium text-slate-800 dark:text-white text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-slate-500">{benefit.desc}</p>
              </div>
            );
          })}
        </div>

        {/* 会员套餐 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">选择适合您的套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => {
              const Icon = Crown;
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-amber-500 shadow-xl' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${plan.color} text-white text-xs font-medium rounded-full`}>
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">¥{plan.price}</span>
                    <span className="text-slate-500">/{plan.period}</span>
                    {plan.perMonth && (
                      <div className="text-sm text-slate-400">折算{plan.perMonth}元/月</div>
                    )}
                    {!plan.perMonth && (
                      <div className="text-sm text-slate-400 line-through">原价¥{plan.original}</div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isSelected ? '选择此套餐' : '查看详情'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 免费vs VIP对比 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">免费版 vs VIP权益对比</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-700">
              <div className="p-4 font-medium text-slate-500">功能</div>
              <div className="p-4 font-medium text-slate-500 text-center">免费版</div>
              <div className="p-4 font-medium text-amber-600 text-center flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" /> VIP
              </div>
            </div>
            {COMPARISON.map((item, idx) => (
              <div key={idx} className={`grid grid-cols-3 ${idx !== COMPARISON.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                <div className="p-4 text-sm text-slate-700 dark:text-slate-300">{item.feature}</div>
                <div className="p-4 text-sm text-slate-500 text-center">{item.free}</div>
                <div className="p-4 text-sm text-emerald-600 dark:text-emerald-400 text-center font-medium">{item.vip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 企业版 */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                企业版
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">需要更大批量处理？</h3>
              <p className="text-slate-400 mb-6">为企业用户打造的高端方案，无限批量处理、专属精修模型、1TB存储空间、专属客服支持。</p>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-white">¥998</div>
                <div className="text-slate-400">/年</div>
                <button className="ml-auto px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
                  了解详情
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">无限批量处理</h4>
                <p className="text-sm text-slate-400">处理数量无上限</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">专属精修模型</h4>
                <p className="text-sm text-slate-400">电商/自媒体定制</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">1TB云存储</h4>
                <p className="text-sm text-slate-400">海量素材存储</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">专属客服</h4>
                <p className="text-sm text-slate-400">1v1技术支持</p>
              </div>
            </div>
          </div>
        </div>

        {/* 购买按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <span className="text-slate-500">已选：</span>
              <span className="font-bold text-slate-800 dark:text-white ml-2">
                {PLANS.find(p => p.id === selectedPlan)?.name}
              </span>
              <span className="font-bold text-amber-600 ml-2">
                ¥{PLANS.find(p => p.id === selectedPlan)?.price}
              </span>
            </div>
            <button
              onClick={handlePurchase}
              disabled={processing}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              {processing ? '处理中...' : '立即开通'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">常见问题</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { q: 'VIP开通后可以退款吗？', a: 'VIP开通后7天内如不满意可申请全额退款，超过7天不支持退款。' },
              { q: '免费次数用完了怎么办？', a: '您可以开通VIP享受无限次使用，或等待次日重置免费次数。' },
              { q: '年卡到期后作品会保留吗？', a: '到期后您仍然可以查看和下载已保存的作品，仅新功能无法使用。' },
              { q: '如何获取发票？', a: '开通VIP后可联系客服申请电子发票，审核通过后发送到您的邮箱。' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">{item.q}</h4>
                <p className="text-sm text-slate-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 底部推荐 */}
        <div className="mt-16 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center">
          <Gift className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">邀请好友，一起享福利</h3>
          <p className="text-slate-500 mb-4">每成功邀请1位好友开通VIP，您可获得1个月VIP时长</p>
          <button className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
            立即邀请
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
