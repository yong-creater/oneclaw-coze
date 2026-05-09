import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { validateSession } from '@/lib/auth';

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const client = getSupabaseClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 构建查询
    let query = client
      .from('users')
      .select('id, user_id, openid, nickname, avatar_url, phone, email, created_at, updated_at, last_login_at', { count: 'exact' });

    if (search) {
      query = query.or(`nickname.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    // 排序
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data: users, count, error } = await query.range(from, to);

    if (error) {
      console.error('查询用户列表失败:', error);
      return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
    }

    // 获取每个用户的生成次数和收藏数
    let enrichedUsers = users || [];
    if (enrichedUsers.length > 0) {
      const userIds = enrichedUsers.map(u => u.user_id);

      const [generationsResult, favoritesResult] = await Promise.all([
        client.from('user_generations').select('user_id').in('user_id', userIds),
        client.from('user_favorites').select('user_id').in('user_id', userIds),
      ]);

      const genCounts: Record<string, number> = {};
      (generationsResult.data || []).forEach(g => {
        genCounts[g.user_id] = (genCounts[g.user_id] || 0) + 1;
      });

      const favCounts: Record<string, number> = {};
      (favoritesResult.data || []).forEach(f => {
        favCounts[f.user_id] = (favCounts[f.user_id] || 0) + 1;
      });

      enrichedUsers = enrichedUsers.map(u => ({
        ...u,
        generation_count: genCounts[u.user_id] || 0,
        favorite_count: favCounts[u.user_id] || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        users: enrichedUsers,
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }
    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 删除用户关联数据
    await Promise.all([
      client.from('user_favorites').delete().eq('user_id', userId),
      client.from('user_generations').delete().eq('user_id', userId),
      client.from('user_history').delete().eq('user_id', userId),
      client.from('user_ratings').delete().eq('user_id', userId),
      client.from('user_reviews').delete().eq('user_id', userId),
      client.from('user_sessions').delete().eq('user_id', userId),
    ]);

    // 删除用户
    const { error } = await client.from('users').delete().eq('user_id', userId);
    if (error) {
      console.error('删除用户失败:', error);
      return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
