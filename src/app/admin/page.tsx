'use client';

import { useEffect, useState } from 'react';
import { Wrench, FolderTree, Tags, Eye, MousePointer, TrendingUp } from 'lucide-react';

interface Stats {
  tools_count: number;
  categories: number;
  tags: number;
  featured_count: number;
}

interface RecentTool {
  id: number;
  name: string;
  producer: string;
  free_type: string;
  is_featured: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, toolsRes] = await Promise.all([
          fetch('/api/admin/init-data'),
          fetch('/api/admin/tools?limit=5&order=created_at.desc'),
        ]);
        
        const statsData = await statsRes.json();
        const toolsData = await toolsRes.json();
        
        if (statsData.success) {
          setStats({
            tools_count: statsData.data.tools_count,
            categories: statsData.data.categories.length,
            tags: statsData.data.tags.length,
            featured_count: 0,
          });
        }
        
        if (toolsData.success) {
          setRecentTools(toolsData.data || []);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const statCards = [
    { name: '工具总数', value: stats?.tools_count || 0, icon: Wrench, color: 'bg-blue-500' },
    { name: '分类数量', value: stats?.categories || 0, icon: FolderTree, color: 'bg-green-500' },
    { name: '标签数量', value: stats?.tags || 0, icon: Tags, color: 'bg-purple-500' },
    { name: '首页推荐', value: stats?.featured_count || 0, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div 
            key={stat.name}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/admin/tools/new"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <Wrench className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">添加工具</span>
          </a>
          <a 
            href="/admin/tools/import"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <TrendingUp className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">批量导入</span>
          </a>
          <a 
            href="/admin/categories"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FolderTree className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">管理分类</span>
          </a>
          <a 
            href="/admin/tags"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Tags className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">管理标签</span>
          </a>
        </div>
      </div>

      {/* 最近添加的工具 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">最近添加</h2>
        {recentTools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">工具名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">出品方</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">免费类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">推荐</th>
                </tr>
              </thead>
              <tbody>
                {recentTools.map((tool) => (
                  <tr key={tool.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-sm text-slate-800 dark:text-slate-200">{tool.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{tool.producer}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        tool.free_type === '完全免费' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        tool.free_type === '免费额度' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        tool.free_type === '限时免费' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {tool.free_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {tool.is_featured ? (
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          推荐
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            暂无工具数据，请先导入工具
          </div>
        )}
      </div>
    </div>
  );
}
