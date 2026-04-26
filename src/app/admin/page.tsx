'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Wrench, FileText, FolderTree, Tags, 
  BookOpen, Lightbulb, Users, MessageSquare, ShoppingCart,
  Settings, Shield, ChevronRight, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalTools: number;
  totalTemplates: number;
  totalUsers: number;
  totalReviews: number;
  totalPrompts: number;
  totalTutorials: number;
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取统计数据
    const fetchStats = async () => {
      try {
        const [tools, templates, users, prompts, tutorials] = await Promise.all([
          fetch('/api/tools?limit=1').then(r => r.json()),
          fetch('/api/admin/templates?limit=1').then(r => r.json()),
          fetch('/api/members').then(r => r.json()),
          fetch('/api/prompts?limit=1').then(r => r.json()),
          fetch('/api/tutorials?limit=1').then(r => r.json()),
        ]);

        setStats({
          totalTools: tools.count || 0,
          totalTemplates: templates.count || 0,
          totalUsers: users.count || 0,
          totalReviews: 0,
          totalPrompts: prompts.count || 0,
          totalTutorials: tutorials.count || 0,
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    { name: '精选工具', href: '/admin/utility-tools', icon: Wrench, color: 'text-orange-500' },
    { name: '模板库', href: '/admin/templates', icon: FileText, color: 'text-blue-500' },
    { name: 'AI应用管理', href: '/admin/tools', icon: FolderTree, color: 'text-green-500' },
    { name: '分类管理', href: '/admin/categories', icon: LayoutDashboard, color: 'text-purple-500' },
    { name: '标签管理', href: '/admin/tags', icon: Tags, color: 'text-pink-500' },
    { name: '提示词库', href: '/admin/prompts', icon: Lightbulb, color: 'text-yellow-500' },
    { name: '教程库', href: '/admin/tutorials', icon: BookOpen, color: 'text-cyan-500' },
    { name: '会员管理', href: '/admin/members', icon: Users, color: 'text-indigo-500' },
    { name: '评论审核', href: '/admin/reviews', icon: MessageSquare, color: 'text-red-500' },
    { name: '订单管理', href: '/admin/orders', icon: ShoppingCart, color: 'text-emerald-500' },
    { name: '广告管理', href: '/admin/ads', icon: Settings, color: 'text-gray-500' },
    { name: 'API Key', href: '/admin/api-keys', icon: Shield, color: 'text-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">管理后台</h1>
          <p className="text-sm text-slate-500 mt-1">欢迎使用 OneClaw 管理后台</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          <LogOut className="w-4 h-4 mr-2" />
          返回前台
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">AI应用</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalTools}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">模板</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalTemplates}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">提示词</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalPrompts}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">教程</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalTutorials}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">会员</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalUsers}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">评论</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {loading ? '-' : stats.totalReviews}
          </p>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors group"
          >
            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors">
                {item.name}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
