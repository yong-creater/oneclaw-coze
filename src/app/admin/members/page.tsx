'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Crown, Search, Calendar, User, Mail, MoreVertical,
  Check, X, Clock, Star
} from 'lucide-react';
import Link from 'next/link';
import AnimatedLobster from '@/components/AnimatedLobster';

// 会员等级配置
const MEMBER_LEVELS = {
  free: { name: '免费会员', color: 'bg-slate-500', price: 0 },
  pro: { name: 'Pro会员', color: 'bg-gradient-to-r from-orange-500 to-red-500', price: 99 },
  enterprise: { name: '企业会员', color: 'bg-gradient-to-r from-purple-500 to-pink-500', price: 299 },
};

interface Member {
  id: number;
  user_id: string;
  level: string;
  expires_at: string | null;
  created_at: string;
  email?: string;
  nickname?: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pro: 0,
    enterprise: 0,
    activeCount: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, [levelFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter !== 'all') {
        params.append('level', levelFilter);
      }
      
      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setMembers(data.data || []);
        
        // 计算统计
        const now = new Date();
        const activeMembers = (data.data || []).filter((m: Member) => {
          if (m.level === 'free') return false;
          if (!m.expires_at) return true; // 终身会员
          return new Date(m.expires_at) > now;
        });
        
        setStats({
          total: data.data?.length || 0,
          pro: data.data?.filter((m: Member) => m.level === 'pro').length || 0,
          enterprise: data.data?.filter((m: Member) => m.level === 'enterprise').length || 0,
          activeCount: activeMembers.length,
        });
      }
    } catch (error) {
      console.error('获取会员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '永久';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const isExpired = (member: Member) => {
    if (!member.expires_at) return false;
    return new Date(member.expires_at) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AnimatedLobster size={40} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  OneClaw Admin
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">会员管理</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">前台首页</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">总会员数</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
                </div>
                <User className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pro会员</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.pro}</p>
                </div>
                <Star className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">企业会员</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.enterprise}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">活跃付费会员</p>
                  <p className="text-2xl font-bold text-green-500">{stats.activeCount}</p>
                </div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户ID..."
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="会员等级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部等级</SelectItem>
              <SelectItem value="free">免费会员</SelectItem>
              <SelectItem value="pro">Pro会员</SelectItem>
              <SelectItem value="enterprise">企业会员</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 会员列表 */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : filteredMembers.length > 0 ? (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">用户ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">会员等级</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">到期时间</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">注册时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{member.user_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${MEMBER_LEVELS[member.level as keyof typeof MEMBER_LEVELS]?.color} text-white`}>
                          {MEMBER_LEVELS[member.level as keyof typeof MEMBER_LEVELS]?.name || member.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(member.expires_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {member.level === 'free' ? (
                          <Badge variant="secondary">免费</Badge>
                        ) : isExpired(member) ? (
                          <Badge variant="destructive">已过期</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">有效</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(member.created_at).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">暂无会员数据</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
