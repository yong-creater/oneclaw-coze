import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsXss, containsSqlInjection } from '@/lib/validation';

// GET - 获取广告列表
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.ADS_VIEW);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('advertisements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('获取广告列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// POST - 创建广告
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, Permissions.ADS_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { title, description, image_url, link_url, position, priority, starts_at, ends_at, is_highlight, target_category } = body;
    
    // 输入安全检查
    if (title && (containsXss(title) || containsSqlInjection(title))) {
      return NextResponse.json({ success: false, error: '输入包含非法字符' }, { status: 400 });
    }

    if (!title || !link_url || !position || !starts_at || !ends_at) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }
    
    const { data, error } = await client
      .from('advertisements')
      .insert({
        title,
        description: description || '',
        image_url: image_url || '',
        link_url,
        position,
        priority: priority || 0,
        starts_at,
        ends_at,
        is_active: true,
        is_highlight: is_highlight || false,
        target_category: target_category || null,
        clicks: 0,
        impressions: 0,
      })
      .select()
      .single();
    
    if (error) {
      await logFailure(auth.user, 'CREATE', 'AD', error.message, request);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    await logSuccess(auth.user, 'CREATE', 'AD', data.id, title, { position }, request);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建广告失败:', error);
    await logFailure(auth.user, 'CREATE', 'AD', 'Unknown error', request);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
