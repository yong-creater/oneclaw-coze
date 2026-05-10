'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Image,
  Heart,
  Clock,
  UserCircle,
} from 'lucide-react';

interface UserItem {
  id: number;
  user_id: string;
  openid: string | null;
  nickname: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  generation_count: number;
  favorite_count: number;
}

interface UsersData {
  users: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const { showAlert } = useModal();
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteDialog.user_id }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setDeleteDialog(null);
        fetchUsers();
      } else {
        showAlert('操作失败', String(json.error || '删除失败'));
      }
    } catch (err) {
      console.error('删除用户失败:', err);
      showAlert('操作失败', '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '从未登录';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}天前`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">用户管理</h2>
        <p className="text-sm text-slate-500 mt-1">查看和管理所有注册登录的用户</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">总用户数</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{data?.total ?? '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">今日新增</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {data?.users?.filter(u => {
                  if (!u.created_at) return false;
                  const today = new Date();
                  const d = new Date(u.created_at);
                  return d.toDateString() === today.toDateString();
                }).length ?? '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Image className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">活跃用户(7天)</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {data?.users?.filter(u => {
                  if (!u.last_login_at) return false;
                  const week = new Date();
                  week.setDate(week.getDate() - 7);
                  return new Date(u.last_login_at) > week;
                }).length ?? '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索昵称、手机号、邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white">
          搜索
        </Button>
      </div>

      {/* 用户表格 */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead className="text-center">生成次数</TableHead>
                <TableHead className="text-center">收藏数</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : !data?.users?.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-slate-400 text-sm">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.nickname || ''}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-slate-800 dark:text-white">
                            {user.nickname || '未设置昵称'}
                          </p>
                          <p className="text-xs text-slate-400">{user.user_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                      {user.phone || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                      {user.email || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {user.generation_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {user.favorite_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      <span title={user.last_login_at ? formatDate(user.last_login_at) : ''}>
                        {getRelativeTime(user.last_login_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteDialog(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            共 {data?.total} 位用户，第 {page}/{totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              删除用户将同时清除该用户的所有收藏、生成记录、评分等数据，此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          {deleteDialog && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                {deleteDialog.avatar_url ? (
                  <img
                    src={deleteDialog.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{deleteDialog.nickname || '未设置昵称'}</p>
                  <p className="text-xs text-slate-400">
                    {deleteDialog.phone || deleteDialog.email || deleteDialog.user_id}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
