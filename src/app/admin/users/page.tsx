'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Search, Mail, Calendar, ChevronLeft, ChevronRight,
  RefreshCw, UserCircle, Loader2
} from 'lucide-react';

interface User {
  user_id: string;
  email?: string;
  nickname?: string;
  avatar_url?: string;
  openid?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 获取用户列表
  const fetchUsers = async (pageNum: number = 1, searchQuery: string = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setPage(pageNum);
      } else {
        console.error('获取用户列表失败:', data.error);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索处理（防抖）
  const handleSearch = (value: string) => {
    setSearch(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1, value);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // 刷新
  const handleRefresh = () => {
    fetchUsers(page, search);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取登录类型
  const getLoginType = (user: User) => {
    if (user.email) return '邮箱';
    if (user.openid) return '微信';
    if (user.phone) return '手机';
    return '未知';
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">用户管理</h1>
            <p className="text-sm text-slate-500">共 {total} 位注册用户</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索邮箱或昵称..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-slate-500">
              显示 {users.length} 条，共 {total} 条
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无用户数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>用户信息</TableHead>
                    <TableHead>登录方式</TableHead>
                    <TableHead>注册时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium text-slate-400">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.nickname || 'User'} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-orange-500">
                                {(user.nickname || user.email || 'U')[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {user.nickname || '未设置昵称'}
                            </div>
                            {user.email && (
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.email ? 'default' : user.openid ? 'secondary' : 'outline'}
                          className={user.email ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                        >
                          {getLoginType(user)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-slate-500">
                第 {page} / {totalPages} 页，共 {total} 条
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
