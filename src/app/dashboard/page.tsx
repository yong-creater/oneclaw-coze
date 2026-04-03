'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Video, TrendingUp, Users, Star, Eye, MessageSquare, Heart,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import Link from 'next/link';

// 类型定义
interface Stats {
  total_tools: number;
  total_views: number;
  total_clicks: number;
  total_ratings: number;
  total_reviews: number;
  total_favorites: number;
  categories: { name: string; count: number }[];
  top_tools: { name: string; click_count: number }[];
  free_type_distribution: { name: string; count: number }[];
  recent_activity: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_tools: 0,
    total_views: 0,
    total_clicks: 0,
    total_ratings: 0,
    total_reviews: 0,
    total_favorites: 0,
    categories: [],
    top_tools: [],
    free_type_distribution: [],
    recent_activity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">数据看板</p>
              </div>
            </Link>

            <Link href="/">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">工具总数</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats.total_tools}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Video className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">总浏览量</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {(stats.total_views / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">总点击量</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {(stats.total_clicks / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">用户评分</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats.total_ratings}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 分类分布 */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                工具分类分布
              </h3>
              <div className="space-y-3">
                {stats.categories.map((cat, index) => {
                  const percentage = (cat.count / stats.total_tools * 100).toFixed(1);
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{cat.name}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {cat.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 热门工具 */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                热门工具 TOP 5
              </h3>
              <div className="space-y-3">
                {stats.top_tools.map((tool, index) => {
                  const maxClicks = stats.top_tools[0]?.click_count || 1;
                  const percentage = ((tool.click_count || 0) / maxClicks * 100).toFixed(0);
                  return (
                    <div key={tool.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{tool.name}</span>
                          <span className="text-xs text-slate-500">{(tool.click_count || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 行业洞察 */}
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              行业洞察
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">增长趋势</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  AI视频工具市场持续增长，本月新增工具数量较上月增长 23%
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">热门赛道</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  文生视频和数字人是当前最热门的赛道，占比超过 60%
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">用户偏好</h4>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  用户最关注的核心功能：支持中文、4K分辨率、免费额度
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
