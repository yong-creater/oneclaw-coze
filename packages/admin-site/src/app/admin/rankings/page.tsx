'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, Download, RefreshCw, 
  ChevronLeft, ChevronRight, Search,
  Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle
} from 'lucide-react';

interface RankingItem {
  id: number;
  rank: number;
  rank_change: number;
  tool_name: string;
  tool_url: string;
  tool_logo: string;
  monthly_visits: string;
  growth: string;
  growth_rate: string;
  category: string;
  stats_month: string;
  data_status: string;
  update_time: string;
}

interface UpdateLog {
  id: number;
  update_month: string;
  update_type: string;
  status: string;
  total_count: number;
  error_count: number;
  created_at: string;
}

export default function RankingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentMonth) params.set('month', currentMonth);
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/rankings/monthly?${params}`);
      const data = await res.json();

      if (data.success) {
        setRankings(data.data);
        setPagination(data.pagination);
        setAvailableMonths(data.meta?.available_months || []);
        if (!currentMonth && data.meta?.current_month) {
          setCurrentMonth(data.meta.current_month);
        }
      }
    } catch (error) {
      console.error('获取榜单失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, pagination.page, searchQuery]);

  const fetchUpdateLogs = async () => {
    try {
      const res = await fetch('/api/admin/rankings/logs');
      const data = await res.json();
      if (data.success) {
        setUpdateLogs(data.data);
      }
    } catch (error) {
      console.error('获取更新日志失败:', error);
    }
  };

  useEffect(() => {
    fetchRankings();
    fetchUpdateLogs();
  }, [fetchRankings]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return `${year}年${m}月`;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">月度榜单管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            管理AI工具月度排名数据，支持数据导入和更新
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/rankings/import">
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              导入数据
            </Button>
          </Link>
        </div>
      </div>

      {/* 工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 月份选择 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <select
                  value={currentMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">全部月份</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{formatMonth(month)}</option>
                  ))}
                </select>
              </div>

              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索工具名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>共 {pagination.total} 条记录</span>
              <Button variant="outline" size="sm" onClick={fetchRankings}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 榜单列表 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{currentMonth ? formatMonth(currentMonth) : '全部月份'} 榜单数据</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : rankings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                        <th className="px-4 py-3 font-medium">排行</th>
                        <th className="px-4 py-3 font-medium">工具</th>
                        <th className="px-4 py-3 font-medium">月访问量</th>
                        <th className="px-4 py-3 font-medium">增长率</th>
                        <th className="px-4 py-3 font-medium">分类</th>
                        <th className="px-4 py-3 font-medium">状态</th>
                        <th className="px-4 py-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {rankings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                item.rank === 1 ? 'bg-yellow-400 text-white' :
                                item.rank === 2 ? 'bg-slate-300 text-white' :
                                item.rank === 3 ? 'bg-orange-300 text-white' :
                                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                                {item.rank}
                              </span>
                              {item.rank_change !== 0 && (
                                item.rank_change > 0 ? 
                                  <TrendingUp className="w-3 h-3 text-green-500" /> :
                                  <TrendingDown className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.tool_logo}
                                alt={item.tool_name}
                                className="w-8 h-8 rounded object-contain bg-slate-100 dark:bg-slate-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f97316" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${item.tool_name[0]}</text></svg>`;
                                }}
                              />
                              <span className="font-medium text-slate-800 dark:text-slate-100">
                                {item.tool_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-medium">{item.monthly_visits || '-'}</span>
                            {item.growth && (
                              <span className={`ml-2 text-xs ${item.growth.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                                {item.growth}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.growth_rate ? (
                              <span className={item.growth_rate.includes('-') ? 'text-red-500' : 'text-green-500'}>
                                {item.growth_rate}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {item.category || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              item.data_status === 'valid' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : item.data_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {item.data_status === 'valid' && <CheckCircle className="w-3 h-3" />}
                              {item.data_status === 'pending' && <AlertCircle className="w-3 h-3" />}
                              {item.data_status === 'invalid' && <AlertCircle className="w-3 h-3" />}
                              {item.data_status === 'valid' ? '有效' : item.data_status === 'pending' ? '待校验' : '失效'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <a
                                href={item.tool_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-500"
                              >
                                访问
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">暂无数据</p>
                  <Link href="/admin/rankings/import">
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      导入数据
                    </Button>
                  </Link>
                </div>
              )}

              {/* 分页 */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500">
                    第 {pagination.page} 页，共 {pagination.total_pages} 页
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 更新日志 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">更新日志</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {updateLogs.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {updateLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {formatMonth(log.update_month)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status === 'success' ? '成功' : log.status === 'partial' ? '部分' : '失败'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        导入 {log.total_count} 条 {log.error_count > 0 && `，失败 ${log.error_count} 条`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  暂无更新记录
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/rankings/import" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Upload className="w-4 h-4" />
                  批量导入数据
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="w-4 h-4" />
                导出当前数据
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
