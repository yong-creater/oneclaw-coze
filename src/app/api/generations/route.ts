import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUserToken } from '@/lib/user-auth';

// 禁用缓存，确保数据实时性
export const dynamic = 'force-dynamic';

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// 创建 supabase 客户端
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 获取用户ID的辅助函数（使用 verifyUserToken 验证 JWT）
async function getUserId(request: NextRequest): Promise<string | null> {
  const tokenCookie = request.cookies.get('user_token');
  if (!tokenCookie?.value) return null;
  
  try {
    const user = await verifyUserToken(tokenCookie.value);
    return user?.user_id || null;
  } catch {
    return null;
  }
}

// GET - 获取用户的生成记录
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
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

    return NextResponse.json({
      success: true,
      generations: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 保存生成记录
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }

    const body = await request.json();
    const { tool_id, tool_name, tool_type, input_params, output_content, title, thumbnail, usage_type } = body;

    // 构建 insert 数据，tool_id 可选（允许 NULL）
    const insertData: Record<string, unknown> = {
      user_id: userId,
      tool_name: tool_name || '未命名作品',
      tool_type: tool_type || 'image',
      input_params: input_params ? JSON.stringify(input_params) : null,
      output_content: output_content ? JSON.stringify(output_content) : null,
      title: title || '未命名作品',
      thumbnail: thumbnail || null,
      usage_type: usage_type || 'image',
    };
    
    // 只有 tool_id 是有效数字时才插入
    if (tool_id && !isNaN(Number(tool_id))) {
      insertData.tool_id = Number(tool_id);
    }

    const { data, error } = await supabase
      .from('user_generations')
      .insert(insertData)
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
