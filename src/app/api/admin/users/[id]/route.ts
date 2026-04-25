import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: '无效的用户ID' },
        { status: 400 }
      );
    }

    // 验证管理员身份
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户信息
    const { data: user, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户统计数据
    const { count: usageCount } = await client
      .from('utility_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id);

    const { count: favoritesCount } = await client
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id);

    const { count: ordersCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user_id);

    // 获取会员信息
    const { data: member } = await client
      .from('members')
      .select('*')
      .eq('user_id', user.user_id)
      .maybeSingle();

    // 获取用户历史记录
    const { data: history } = await client
      .from('user_history')
      .select('*, tools(name)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 获取用户收藏
    const { data: favorites } = await client
      .from('user_favorites')
      .select('*, tools(name, icon, color)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          password_hash: undefined, // 不返回密码
          is_vip: member?.is_active && new Date(member?.expire_at || '') > new Date(),
          vip_expire: member?.expire_at,
          credits: user.credits || 0,
        },
        stats: {
          total_uses: usageCount || 0,
          total_favorites: favoritesCount || 0,
          total_orders: ordersCount || 0,
        },
        recent_history: history || [],
        recent_favorites: favorites || [],
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户详情失败' },
      { status: 500 }
    );
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: '无效的用户ID' },
        { status: 400 }
      );
    }

    // 验证管理员身份
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const client = getSupabaseClient();

    // 构建更新数据
    const updateData: Record<string, any> = {};
    
    if (typeof body.is_active === 'boolean') {
      updateData.is_active = body.is_active;
    }
    if (typeof body.is_banned === 'boolean') {
      updateData.is_banned = body.is_banned;
    }
    if (typeof body.nickname === 'string') {
      updateData.nickname = body.nickname;
    }
    if (typeof body.credits === 'number') {
      updateData.credits = body.credits;
    }
    if (typeof body.avatar_url === 'string') {
      updateData.avatar_url = body.avatar_url;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('更新用户失败:', error);
      return NextResponse.json(
        { success: false, error: '更新用户失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '用户更新成功'
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { success: false, error: '更新用户失败' },
      { status: 500 }
    );
  }
}
