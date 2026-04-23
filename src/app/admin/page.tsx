'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  tools: number;
  skills: number;
  tutorials: number;
  prompts: number;
  cases: number;
  users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    tools: 0,
    skills: 0,
    tutorials: 0,
    prompts: 0,
    cases: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [toolsRes, skillsRes, tutorialsRes, promptsRes, casesRes] = await Promise.all([
        fetch('/api/tools').catch(() => ({ json: () => ({ success: true, data: [] }) })),
        fetch('/api/skills').catch(() => ({ json: () => ({ success: true, data: [] }) })),
        fetch('/api/tutorials').catch(() => ({ json: () => ({ success: true, data: [] }) })),
        fetch('/api/prompts').catch(() => ({ json: () => ({ success: true, data: [] }) })),
        fetch('/api/cases').catch(() => ({ json: () => ({ success: true, data: [] }) })),
      ]);
      
      const [toolsData, skillsData, tutorialsData, promptsData, casesData] = await Promise.all([
        toolsRes.json(),
        skillsRes.json(),
        tutorialsRes.json(),
        promptsRes.json(),
        casesRes.json(),
      ]);

      setStats({
        tools: toolsData.data?.length || 0,
        skills: skillsData.data?.length || 0,
        tutorials: tutorialsData.data?.length || 0,
        prompts: promptsData.data?.length || 0,
        cases: casesData.data?.length || 0,
        users: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'AI应用', value: stats.tools, color: 'border-l-4 border-l-blue-500' },
    { title: '技能', value: stats.skills, color: 'border-l-4 border-l-green-500' },
    { title: '教程', value: stats.tutorials, color: 'border-l-4 border-l-purple-500' },
    { title: '提示词', value: stats.prompts, color: 'border-l-4 border-l-amber-500' },
    { title: '案例', value: stats.cases, color: 'border-l-4 border-l-red-500' },
    { title: '用户', value: stats.users, color: 'border-l-4 border-l-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="text-[var(--muted-foreground)]">欢迎回来</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className={stat.color}>
              <CardContent className="p-4">
                <p className="text-sm text-[var(--muted-foreground)]">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-[var(--muted-foreground)]">
              使用左侧导航管理各项内容
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
