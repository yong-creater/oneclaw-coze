'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Crown, Calendar, MoreHorizontal, Loader2, ChevronRight, Shield, Eye, Ban, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface User {
  id: number;
  nickname: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  is_vip: boolean;
  vip_expire?: string;
  is_active: boolean;
  is_banned: boolean;
  credits: number;
  created_at: string;
  last_login_at?: string;
}

interface UserStats {
  total_uses: number;
  total_favorites: number;
  total_orders: number;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(15);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: search,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data?.users || []);
        setTotal(data.data?.total || 0);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户详情统计
  const fetchUserStats = async (userId: number) => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserStats(data.data?.stats || null);
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 查看用户详情
  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    fetchUserStats(user.id);
  };

  // 切换用户状态
  const handleToggleStatus = async (userId: number, field: 'is_active' | 'is_banned', value: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, [field]: value });
        }
      }
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理注册用户，共 {total} 个用户</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {total} 用户
          </Badge>
        </div>
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索用户昵称或手机号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">暂无用户</h3>
          <p className="text-sm text-slate-400 mt-1">还没有用户注册</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* 头像 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-orange-600">{user.nickname?.slice(0, 1) || 'U'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-800 truncate">{user.nickname || '未设置昵称'}</h3>
                        {user.is_vip && (
                          <Badge className="bg-amber-100 text-amber-600">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                        {user.is_banned && (
                          <Badge className="bg-red-100 text-red-600">
                            <Ban className="w-3 h-3 mr-1" />
                            已封禁
                          </Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="secondary">已禁用</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
                        <span>{user.phone || user.email || '未绑定联系方式'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          注册于 {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right hidden md:block">
                      {user.is_vip ? (
                        <p className="text-xs text-amber-500">
                          VIP 有效期至 {user.vip_expire ? new Date(user.vip_expire).toLocaleDateString() : '永久'}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">普通用户</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">积分: {user.credits || 0}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-slate-500 px-4">
                第 {page} / {totalPages} 页，共 {total} 条
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 用户详情弹窗 */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* 用户基本信息 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-orange-600">{selectedUser.nickname?.slice(0, 1) || 'U'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.nickname || '未设置昵称'}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.phone || selectedUser.email || '未绑定'}</p>
                  {selectedUser.is_vip && (
                    <Badge className="mt-1 bg-amber-100 text-amber-600">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP 会员
                    </Badge>
                  )}
                </div>
              </div>

              {/* 用户统计 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{userStats?.total_uses || 0}</p>
                  <p className="text-xs text-slate-500">使用次数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{userStats?.total_favorites || 0}</p>
                  <p className="text-xs text-slate-500">收藏数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{selectedUser.credits || 0}</p>
                  <p className="text-xs text-slate-500">积分</p>
                </div>
              </div>

              {/* 账户信息 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-600">账户信息</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">注册时间</span>
                    <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : '-'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">最后登录</span>
                    <span>{selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleString() : '-'}</span>
                  </div>
                  {selectedUser.vip_expire && (
                    <div className="flex justify-between p-2 bg-amber-50 rounded-lg col-span-2">
                      <span className="text-slate-500">VIP 到期</span>
                      <span className="text-amber-600">{new Date(selectedUser.vip_expire).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 状态控制 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-600">状态管理</h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">启用账户</span>
                  </div>
                  <Switch 
                    checked={selectedUser.is_active}
                    onCheckedChange={(v) => handleToggleStatus(selectedUser.id, 'is_active', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">封禁用户</span>
                  </div>
                  <Switch 
                    checked={selectedUser.is_banned}
                    onCheckedChange={(v) => handleToggleStatus(selectedUser.id, 'is_banned', v)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
