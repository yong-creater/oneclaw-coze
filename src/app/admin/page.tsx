'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3,
  FolderTree,
  Users,
  TrendingUp,
  ExternalLink,
  Sparkles,
  FileText,
  Crown,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { OUR_TOOLS, formatUsageCount } from '@/config/tools';

interface AdminStats {
  users_count: number;
  vip_count: number;
  today_uses: number;
  total_uses: number;
  templates_count: number;
  favorites_count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    users_count: 0,
    vip_count: 0,
    today_uses: 0,
    total_uses: 0,
    templates_count: 0,
    favorites_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 获取统计数据
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats({
          users_count: data.data?.users_count || 0,
          vip_count: data.data?.vip_count || 0,
          today_uses: data.data?.today_uses || 0,
          total_uses: data.data?.total_uses || OUR_TOOLS.reduce((sum, t) => sum + t.usageCount, 0),
          templates_count: data.data?.templates_count || 0,
          favorites_count: data.data?.favorites_count || 0,
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 使用工具配置的默认数据
      setStats({
        users_count: 0,
        vip_count: 0,
        today_uses: 0,
        total_uses: OUR_TOOLS.reduce((sum, t) => sum + t.usageCount, 0),
        templates_count: 0,
        favorites_count: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // 统计卡片数据
  const statCards = [
    { 
      title: '用户数量', 
      value: stats.users_count, 
      icon: Users, 
      href: '/admin/users',
      color: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'VIP 会员', 
      value: stats.vip_count, 
      icon: Crown, 
      href: null,
      color: 'from-amber-100 to-orange-100',
      iconColor: 'text-amber-600'
    },
    { 
      title: '模板数量', 
      value: stats.templates_count, 
      icon: FileText, 
      href: '/admin/templates',
      color: 'from-purple-100 to-violet-100',
      iconColor: 'text-purple-600'
    },
    { 
      title: '收藏总数', 
      value: stats.favorites_count, 
      icon: Sparkles, 
      href: null,
      color: 'from-pink-100 to-rose-100',
      iconColor: 'text-pink-600'
    },
  ];

  // 使用统计
  const usageCards = [
    { 
      title: '今日使用', 
      value: stats.today_uses, 
      icon: TrendingUp,
      color: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600'
    },
    { 
      title: '总使用量', 
      value: formatUsageCount(stats.total_uses), 
      icon: Grid3X3,
      color: 'from-slate-100 to-gray-100',
      iconColor: 'text-slate-600'
    },
  ];

  // 热门工具（从本地配置获取）
  const topTools = OUR_TOOLS
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="text-sm text-slate-500 mt-1">系统运行状态概览</p>
      </div>

      {/* 用户统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href || '#'}>
              <Card className={`bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer ${!stat.href ? 'pointer-events-none' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 使用统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {usageCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 热门工具 */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              热门工具
            </CardTitle>
            <span className="text-xs text-slate-400">数据来源：本地配置</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {topTools.map((tool, idx) => (
                <div 
                  key={tool.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' :
                    idx === 1 ? 'bg-slate-200 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{tool.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{tool.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{formatUsageCount(tool.usageCount)}</p>
                    <p className="text-xs text-slate-400">次使用</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Grid3X3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">关于工具管理</h3>
              <p className="text-sm text-slate-600">
                OneClaw 的所有 AI 工具均为自主研发，工具配置通过代码管理，无需在后台添加或编辑。
                后台主要用于用户管理、数据统计和模板管理。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
