'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Wrench, FileText, Users, Lightbulb, BookOpen,
  MessageSquare, TrendingUp, Clock, AlertCircle, CheckCircle,
  ArrowRight, Star, Eye, MousePointerClick
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalTools: number;
  totalTemplates: number;
  totalUsers: number;
  totalReviews: number;
  totalPrompts: number;
  totalTutorials: number;
  pendingReviews: number;
  totalViews: number;
  totalClicks: number;
}

interface RecentItem {
  id: number;
  name: string;
  created_at: string;
}

interface TopTool {
  id: number;
  name: string;
  logo: string;
  views: number;
  clicks: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTools: 0,
    totalTemplates: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalPrompts: 0,
    totalTutorials: 0,
    pendingReviews: 0,
    totalViews: 0,
    totalClicks: 0,
  });
  const [recentTools, setRecentTools] = useState<RecentItem[]>([]);
  const [topTools, setTopTools] = useState<TopTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 并行获取多个数据
        const [toolsRes, templatesRes, usersRes, promptsRes, tutorialsRes] = await Promise.all([
          fetch('/api/tools?limit=1').then(r => r.json()).catch(() => ({ count: 0 })),
          fetch('/api/admin/templates?limit=1').then(r => r.json()).catch(() => ({ count: 0 })),
          fetch('/api/members').then(r => r.json()).catch(() => ({ count: 0 })),
          fetch('/api/prompts?limit=1').then(r => r.json()).catch(() => ({ count: 0 })),
          fetch('/api/tutorials?limit=1').then(r => r.json()).catch(() => ({ count: 0 })),
        ]);

        // 获取最近工具
        const recentRes = await fetch('/api/tools?limit=5&sort=newest').then(r => r.json()).catch(() => ({ data: [] }));

        // 获取热门工具
        const topRes = await fetch('/api/rankings?type=hot&limit=5').then(r => r.json()).catch(() => ({ data: [] }));

        setStats({
          totalTools: toolsRes.count || 0,
          totalTemplates: templatesRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalPrompts: promptsRes.count || 0,
          totalTutorials: tutorialsRes.count || 0,
          totalReviews: 0,
          pendingReviews: 0,
          totalViews: recentRes.total_views || 0,
          totalClicks: recentRes.total_clicks || 0,
        });

        setRecentTools(recentRes.data?.slice(0, 5) || []);
        setTopTools(topRes.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 统计卡片配置
  const statCards = [
    { label: 'AI应用', value: stats.totalTools, icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: '模板', value: stats.totalTemplates, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: '提示词', value: stats.totalPrompts, icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: '教程', value: stats.totalTutorials, icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950' },
    { label: '用户', value: stats.totalUsers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: '待审核', value: stats.pendingReviews, icon: MessageSquare, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">仪表盘</h1>
          <p className="text-sm text-slate-500 mt-1">概览数据，快速了解系统状态</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {loading ? '-' : stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近添加 - 占2列 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                最近添加
              </CardTitle>
              <Link href="/admin/utility-tools" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                查看全部 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : recentTools.length > 0 ? (
              <div className="space-y-2">
                {recentTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors">
                          {tool.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(tool.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/utility-tools" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
                <Wrench className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">添加工具</p>
                <p className="text-xs text-slate-400">添加新的AI应用</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
            </Link>
            <Link href="/admin/templates" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">管理模板</p>
                <p className="text-xs text-slate-400">编辑现有模板</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
            </Link>
            <Link href="/admin/tutorials" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950">
                <BookOpen className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">教程管理</p>
                <p className="text-xs text-slate-400">创建教程内容</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
            </Link>
            <Link href="/admin/reviews" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
                <MessageSquare className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-white">审核评论</p>
                <p className="text-xs text-slate-400">
                  {stats.pendingReviews > 0 ? (
                    <span className="text-red-500">{stats.pendingReviews} 条待审核</span>
                  ) : '暂无待审核'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 热门工具 */}
      {topTools.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                热门工具 TOP 5
              </CardTitle>
              <Link href="/admin/utility-tools" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                查看全部 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTools.map((tool, index) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-400 dark:bg-slate-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                      {tool.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {tool.views?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {tool.clicks?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 系统状态 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">系统状态</p>
                <p className="text-xs text-green-500">运行正常</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">今日访问</p>
                <p className="text-xs text-slate-500">{stats.totalViews.toLocaleString()} 次</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">总点击量</p>
                <p className="text-xs text-slate-500">{stats.totalClicks.toLocaleString()} 次</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
