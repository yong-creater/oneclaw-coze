'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Users,
  Star,
  FileText,
  Eye,
  MousePointerClick,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Stats {
  tools: number;
  users: number;
  skills: number;
  tutorials: number;
  pageViews: number;
  clicks: number;
}

interface HealthCheck {
  total: number;
  healthy: number;
  failed: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载统计数据
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/health-check').then(r => r.json()),
    ]).then(([statsData, healthData]) => {
      if (statsData.success) setStats(statsData.data);
      if (healthData.success) setHealth(healthData.data);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const statCards = [
    { label: '工具总数', value: stats?.tools || 0, icon: <Wrench className="w-6 h-6" />, color: 'text-orange-500' },
    { label: '用户总数', value: stats?.users || 0, icon: <Users className="w-6 h-6" />, color: 'text-blue-500' },
    { label: '技能总数', value: stats?.skills || 0, icon: <Star className="w-6 h-6" />, color: 'text-yellow-500' },
    { label: '教程总数', value: stats?.tutorials || 0, icon: <FileText className="w-6 h-6" />, color: 'text-green-500' },
    { label: '总浏览量', value: stats?.pageViews?.toLocaleString() || '0', icon: <Eye className="w-6 h-6" />, color: 'text-purple-500' },
    { label: '总点击量', value: stats?.clicks?.toLocaleString() || '0', icon: <MousePointerClick className="w-6 h-6" />, color: 'text-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-sm text-slate-500">欢迎使用 OneClaw 管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-700 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link
            href="/tools/new"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="text-sm">添加工具</span>
          </Link>
          <Link
            href="/categories"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm">管理分类</span>
          </Link>
          <Link
            href="/ads"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm">广告管理</span>
          </Link>
          <Link
            href="/reviews"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">审核评论</span>
          </Link>
          <Link
            href="/users"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm">用户管理</span>
          </Link>
          <Link
            href="/health-check"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-cyan-500" />
            <span className="text-sm">健康检查</span>
          </Link>
        </div>
      </div>

      {/* 链接健康检查 */}
      {health && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">链接健康检查</h2>
            <Link
              href="/health-check"
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              查看详情 →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-3xl font-bold text-slate-600 dark:text-slate-300">{health.total}</p>
              <p className="text-sm text-slate-500">总链接</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{health.healthy}</p>
              <p className="text-sm text-green-600">正常</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{health.failed}</p>
              <p className="text-sm text-red-600">异常</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
