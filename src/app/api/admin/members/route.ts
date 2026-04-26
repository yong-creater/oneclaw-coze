import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';

// 获取会员列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.MEMBERS_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = client
      .from('members')
      .select('*', { count: 'exact' });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // 表不存在时返回空数据
      if (error.message.includes('Could not find') || error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          data: [],
          pagination: { page, limit, total: 0, total_pages: 0 }
        });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取会员列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 更新会员等级
export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.MEMBERS_MANAGE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, level, expires_at } = body;

    if (!user_id || !level) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 获取更新前的数据用于日志
    const { data: oldData } = await client
      .from('members')
      .select('level, expires_at')
      .eq('user_id', user_id)
      .single();

    const { data, error } = await client
      .from('members')
      .upsert({
        user_id,
        level,
        expires_at,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      await logFailure(auth.user, 'UPDATE', 'MEMBER', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'UPDATE', 'MEMBER', user_id, `更新会员等级: ${level}`, { old_level: oldData?.level, new_level: level }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新会员失败:', error);
    await logFailure(auth.user, 'UPDATE', 'MEMBER', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 删除会员
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.MEMBERS_MANAGE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 });
    }

    const { error } = await client
      .from('members')
      .delete()
      .eq('user_id', userId);

    if (error) {
      await logFailure(auth.user, 'DELETE', 'MEMBER', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logSuccess(auth.user, 'DELETE', 'MEMBER', userId, '删除会员', {}, request);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除会员失败:', error);
    await logFailure(auth.user, 'DELETE', 'MEMBER', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
