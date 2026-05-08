import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用缓存，确保数据实时性
export const revalidate = 0;

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// 创建 supabase 客户端
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 获取用户ID的辅助函数
function getUserId(request: NextRequest): string | null {
  // 优先从Cookie获取
  const tokenCookie = request.cookies.get('user_token');
  if (tokenCookie?.value) {
    try {
      const payload = JSON.parse(Buffer.from(tokenCookie.value.split('.')[1], 'base64').toString());
      return payload.user_id || payload.sub || null;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

// GET - 获取用户的生成记录
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const toolType = searchParams.get('toolType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_generations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (type) {
      query = query.eq('usage_type', type);
    }

    if (toolType) {
      query = query.eq('tool_type', toolType);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: '获取记录失败' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      generations: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 保存生成记录
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }

    const body = await request.json();
    const { tool_id, tool_name, tool_type, input_params, output_content, title, thumbnail, usage_type } = body;

    const { data, error } = await supabase
      .from('user_generations')
      .insert({
        user_id: userId,
        tool_id,
        tool_name,
        tool_type,
        input_params: input_params ? JSON.stringify(input_params) : null,
        output_content: output_content ? JSON.stringify(output_content) : null,
        title,
        thumbnail,
        usage_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, generation: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
