import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { getAllUsers } from '@/lib/user-auth';

// 获取用户列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.USERS_VIEW);
  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;

    const result = await getAllUsers({ page, pageSize, search });

    return NextResponse.json({
      success: true,
      data: {
        users: result.users.map(user => ({
          ...user,
          password_hash: undefined // 不返回密码哈希
        })),
        total: result.total,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}
