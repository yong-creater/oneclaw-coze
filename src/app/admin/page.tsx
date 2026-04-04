'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench, FolderTree, Tags, Eye, MousePointer, TrendingUp, 
  Star, Users, FileText, AlertTriangle, Plus, Download,
  ExternalLink, Settings, Database, RefreshCw
} from 'lucide-react';

interface Stats {
  tools_count: number;
  featured_count: number;
  active_count: number;
  categories: number;
  tags: number;
  total_views: number;
  total_clicks: number;
  ratings_count: number;
  reviews_pending: number;
}

interface RecentTool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  free_type: string;
  is_featured: boolean;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

interface TopTool {
  id: number;
  name: string;
  logo: string;
  click_count: number;
}

interface HealthIssueItem {
  type: string;
  url: string;
  healthy: boolean;
  status?: number;
  error?: string;
}

interface HealthIssue {
  tool_id: number;
  tool_name: string;
  issues: HealthIssueItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    tools_count: 0,
    featured_count: 0,
    active_count: 0,
    categories: 0,
    tags: 0,
    total_views: 0,
    total_clicks: 0,
    ratings_count: 0,
    reviews_pending: 0
  });
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
  const [topTools, setTopTools] = useState<TopTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 并行获取统计数据、最近工具、热门工具
      const [statsRes, toolsRes, topRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/tools?limit=5'),
        fetch('/api/tools?limit=5'),
      ]);
      
      const statsData = await statsRes.json();
      const toolsData = await toolsRes.json();
      const topData = await topRes.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      if (toolsData.success) {
        setRecentTools(toolsData.data || []);
      }

      if (topData.success) {
        setTopTools(topData.data || []);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/admin/health-check');
      const data = await res.json();
      if (data.success) {
        setHealthIssues(data.data.issues || []);
        if (data.data.issues?.length > 0) {
          alert(`发现 ${data.data.issues.length} 个工具链接异常`);
        } else {
          alert('所有工具链接正常');
        }
      }
    } catch (error) {
      console.error('健康检查失败:', error);
    } finally {
      setCheckingHealth(false);
    }
  };

  const statCards = [
    { name: '工具总数', value: stats.tools_count, icon: Wrench, color: 'bg-blue-500', href: '/admin/tools' },
    { name: '分类数量', value: stats.categories, icon: FolderTree, color: 'bg-green-500', href: '/admin/categories' },
    { name: '标签数量', value: stats.tags, icon: Tags, color: 'bg-purple-500', href: '/admin/tags' },
    { name: '首页推荐', value: stats.featured_count, icon: TrendingUp, color: 'bg-orange-500' },
    { name: '总浏览量', value: stats.total_views.toLocaleString(), icon: Eye, color: 'bg-cyan-500' },
    { name: '总点击量', value: stats.total_clicks.toLocaleString(), icon: MousePointer, color: 'bg-pink-500' },
    { name: '用户评分', value: stats.ratings_count, icon: Star, color: 'bg-yellow-500' },
    { name: '待审评论', value: stats.reviews_pending, icon: AlertTriangle, color: 'bg-red-500', href: '/admin/reviews' },
  ];

  const FREE_TYPE_COLORS: Record<string, string> = {
    '完全免费': 'bg-green-100 text-green-700',
    '免费额度': 'bg-blue-100 text-blue-700',
    '限时免费': 'bg-orange-100 text-orange-700',
    '付费工具': 'bg-slate-100 text-slate-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">管理后台</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">OneClaw AI视频工具导航站管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={checkingHealth}>
            {checkingHealth ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            链接检测
          </Button>
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              查看站点
            </Button>
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.href || '#'}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tools/new">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500">
                <Plus className="w-4 h-4 mr-2" />
                添加工具
              </Button>
            </Link>
            <Link href="/admin/tools/import">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                批量导入
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                <FolderTree className="w-4 h-4 mr-2" />
                分类管理
              </Button>
            </Link>
            <Link href="/admin/tags">
              <Button variant="outline" size="sm">
                <Tags className="w-4 h-4 mr-2" />
                标签管理
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                评论审核
                {stats.reviews_pending > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.reviews_pending}</Badge>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近添加 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">最近添加</CardTitle>
              <Link href="/admin/tools" className="text-sm text-orange-500 hover:text-orange-600">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTools.map(tool => (
                <div key={tool.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <img 
                    src={tool.logo} 
                    alt={tool.name} 
                    className="w-10 h-10 rounded-lg object-contain bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</p>
                      {tool.is_featured && (
                        <TrendingUp className="w-3 h-3 text-orange-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{tool.producer}</p>
                  </div>
                  <Badge className={FREE_TYPE_COLORS[tool.free_type] || ''}>
                    {tool.free_type}
                  </Badge>
                </div>
              ))}
              {recentTools.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-4">暂无数据</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 热门工具 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">热门工具 TOP 5</CardTitle>
              <Link href="/rankings" className="text-sm text-orange-500 hover:text-orange-600">
                查看榜单
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTools.map((tool, index) => (
                <div key={tool.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <img 
                    src={tool.logo} 
                    alt={tool.name} 
                    className="w-10 h-10 rounded-lg object-contain bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${tool.name[0]}</text></svg>`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MousePointer className="w-3 h-3" />
                    {tool.click_count}
                  </div>
                </div>
              ))}
              {topTools.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-4">暂无数据</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 健康检查结果 */}
      {healthIssues.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              链接异常 ({healthIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthIssues.slice(0, 5).map((issue, index) => (
                <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                  <p className="font-medium text-red-700 dark:text-red-300">{issue.tool_name}</p>
                  {issue.issues.map((i, idx) => (
                    <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                      {i.type}: {i.error || `状态码 ${i.status}`}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
