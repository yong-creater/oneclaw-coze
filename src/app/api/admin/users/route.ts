import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户列表（公开接口）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;
    const search = searchParams.get('search') || '';

    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('users')
      .select('id, nickname, email, phone, created_at, last_login_at', { count: 'exact' });

    // 搜索
    if (search) {
      query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // 分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取用户列表失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        users: data || [],
        total: count || 0,
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
