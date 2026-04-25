'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3,
  FolderTree,
  Tags,
  Users,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Stats {
  tools_count: number;
  categories: number;
  tags: number;
  users: number;
}

// 7个AI生图工具
const AI_IMAGE_TOOLS = [
  { name: 'AI头像表情包', key: 'avatar-emoji', color: 'bg-pink-100 text-pink-600' },
  { name: '形象照生成', key: 'resume-photo', color: 'bg-sky-100 text-sky-600' },
  { name: '小红书配图', key: 'xiaohongshu', color: 'bg-red-100 text-red-600' },
  { name: '抖音封面生成', key: 'douyin', color: 'bg-purple-100 text-purple-600' },
  { name: '餐饮菜单设计', key: 'restaurant-menu', color: 'bg-amber-100 text-amber-600' },
  { name: '节日营销海报', key: 'festival-poster', color: 'bg-orange-100 text-orange-600' },
  { name: '商品详情页', key: 'productpage', color: 'bg-emerald-100 text-emerald-600' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    tools_count: 0,
    categories: 0,
    tags: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats({
          tools_count: data.data?.tools_count || 0,
          categories: data.data?.categories || 0,
          tags: data.data?.tags || 0,
          users: data.data?.users_count || 0
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'AI生图工具', value: 7, icon: Grid3X3, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: '分类数量', value: stats.categories || 1, icon: FolderTree, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: '标签数量', value: stats.tags || 3, icon: Tags, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: '用户数量', value: stats.users || 0, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">仪表盘</h1>
        <p className="text-sm text-slate-500 mt-1">欢迎回来，查看系统概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                      {loading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI生图工具管理 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-orange-500" />
              AI生图工具
            </CardTitle>
            <Link href="/admin/tools">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
                管理工具
                <ExternalLink className="w-3 h-3 ml-1" />
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {AI_IMAGE_TOOLS.map((tool, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${tool.color} mb-2`}>
                  <span className="text-sm font-bold">{tool.name.slice(0, 2)}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tool.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/tools">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Grid3X3 className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-white">工具管理</h3>
                <p className="text-sm text-slate-500">管理AI生图工具</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-white">分类管理</h3>
                <p className="text-sm text-slate-500">管理工具分类</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 dark:text-white">用户管理</h3>
                <p className="text-sm text-slate-500">管理系统用户</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            快速入口
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/tags" className="block">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <Tags className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">标签管理</p>
              </div>
            </Link>
            <Link href="/admin/settings" className="block">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">系统设置</p>
              </div>
            </Link>
            <Link href="/" target="_blank" className="block">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <ExternalLink className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">访问前台</p>
              </div>
            </Link>
            <Link href="/admin/tools" className="block">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <Grid3X3 className="w-5 h-5 text-green-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">添加工具</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
