'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Crown, Calendar, MoreHorizontal } from 'lucide-react';

// 模拟用户数据
const MOCK_USERS = [
  { id: 1, nickname: '张三', phone: '138****8888', vip: true, vipExpire: '2025-12-31', createdAt: '2024-01-15' },
  { id: 2, nickname: '李四', phone: '139****6666', vip: false, vipExpire: null, createdAt: '2024-02-20' },
  { id: 3, nickname: '王五', phone: '137****5555', vip: true, vipExpire: '2025-06-30', createdAt: '2024-03-10' },
];

export default function UsersAdminPage() {
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => 
    user.nickname.includes(search) || user.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理注册用户，共 {users.length} 个用户</p>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="搜索用户昵称或手机号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 用户列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* 头像 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">{user.nickname.slice(0, 1)}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-white">{user.nickname}</h3>
                    {user.vip && (
                      <Badge className="bg-amber-100 text-amber-600">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                </div>

                <div className="text-right">
                  {user.vip ? (
                    <p className="text-xs text-amber-500">有效期至 {user.vipExpire}</p>
                  ) : (
                    <p className="text-xs text-slate-400">普通用户</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {user.createdAt}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{users.length}</p>
              <p className="text-xs text-slate-500">总用户数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {users.filter(u => u.vip).length}
              </p>
              <p className="text-xs text-slate-500">VIP用户</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {users.filter(u => !u.vip).length}
              </p>
              <p className="text-xs text-slate-500">普通用户</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 空状态 */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-500">没有找到匹配的用户</h3>
          <p className="text-sm text-slate-400 mt-1">尝试其他关键词</p>
        </div>
      )}
    </div>
  );
}
