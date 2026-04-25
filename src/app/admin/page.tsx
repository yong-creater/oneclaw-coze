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
  Loader2,
  Sparkles,
  FileText,
  Crown,
  ArrowUpRight
} from 'lucide-react';

interface Stats {
  tools_count: number;
  categories: number;
  tags: number;
  users_count: number;
  templates_count: number;
  vip_count: number;
  today_uses: number;
  total_uses: number;
}

interface RecentTool {
  id: number;
  name: string;
  usage_count: number;
  category: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    tools_count: 0,
    categories: 0,
    tags: 0,
    users_count: 0,
    templates_count: 0,
    vip_count: 0,
    today_uses: 0,
    total_uses: 0,
  });
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentTools();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats({
          tools_count: data.data?.tools_count || 0,
          categories: data.data?.categories || 0,
          tags: data.data?.tags || 0,
          users_count: data.data?.users_count || 0,
          templates_count: data.data?.templates_count || 0,
          vip_count: data.data?.vip_count || 0,
          today_uses: data.data?.today_uses || 0,
          total_uses: data.data?.total_uses || 0,
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchRecentTools = async () => {
    try {
      const res = await fetch('/api/admin/tools?limit=5&order=usage_count&ascending=false');
      const data = await res.json();
      if (data.success) {
        setRecentTools(data.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('获取工具列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'AI工具', value: stats.tools_count, icon: Grid3X3, href: '/admin/tools' },
    { title: '设计模板', value: stats.templates_count, icon: FileText, href: '/admin/templates' },
    { title: '分类数量', value: stats.categories, icon: FolderTree, href: '/admin/categories' },
    { title: '用户数量', value: stats.users_count, icon: Users, href: '/admin/users' },
  ];

  const vipCards = [
    { title: 'VIP会员', value: stats.vip_count, icon: Crown },
    { title: '今日使用', value: stats.today_uses, icon: TrendingUp },
    { title: '总使用量', value: stats.total_uses, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="text-sm text-slate-500 mt-1">查看系统概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href}>
              <Card className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* VIP 和使用统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vipCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-500" />
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
            <Link href="/admin/tools">
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 cursor-pointer">
                查看全部
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : recentTools.length === 0 ? (
            <p className="text-center text-slate-400 py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {recentTools.map((tool, idx) => (
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{tool.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{tool.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{tool.usage_count.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">次使用</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
