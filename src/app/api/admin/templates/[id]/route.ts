import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 获取 Supabase 客户端（在函数内部创建，避免构建时错误）
function getSupabase() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET - 获取单个模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT - 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('templates')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除模板（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { error } = await supabase
      .from('templates')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', parseInt(id));

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
