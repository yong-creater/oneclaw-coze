import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 模板类型映射
const TEMPLATE_TYPE_MAP: Record<string, { name: string; slug: string }> = {
  'xhs_post': { name: '小红书爆款生成器', slug: '/xhs-generator' },
  'goods_poster': { name: '商品海报生成器', slug: '/product-poster' },
  'portrait': { name: 'AI写真生成器', slug: '/ai-photo' },
  'cover': { name: '封面生成器', slug: '/cover-generator' },
  'goods_image': { name: '商品图精修', slug: '/product-photo' },
  'background_removal': { name: 'AI智能抠图', slug: '/background-removal' },
  'photo': { name: '照片美化', slug: '/photo-editor' },
  'layout': { name: '图文排版', slug: '/layout-design' },
  'resume': { name: '简历优化', slug: '/resume' },
  'novel': { name: '小说创作', slug: '/novel' },
  'script': { name: '推文脚本生成', slug: '/novel' },
};

// GET - 获取单个模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', parseInt(id))
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    // 增加使用次数
    await supabase
      .from('templates')
      .update({ usage_count: (data.usage_count || 0) + 1 })
      .eq('id', parseInt(id));

    // 转换数据
    const template = {
      ...data,
      tool_name: TEMPLATE_TYPE_MAP[data.template_type]?.name || data.template_type,
      tool_url: TEMPLATE_TYPE_MAP[data.template_type]?.slug || '/',
    };

    return NextResponse.json({ success: true, template });
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
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 软删除
    const { error } = await supabase
      .from('templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
