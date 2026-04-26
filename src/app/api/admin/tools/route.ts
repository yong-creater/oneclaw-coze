import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth, requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';
import { logSuccess, logFailure } from '@/lib/audit';
import { containsSqlInjection, containsXss, sanitizeInput } from '@/lib/validation';

// 获取工具列表
export async function GET(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // 筛选参数
    const category_id = searchParams.get('category_id');
    const free_type = searchParams.get('free_type');
    const is_featured = searchParams.get('is_featured');
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');
    
    // 排序参数
    const orderBy = searchParams.get('order') || 'created_at';
    const ascending = searchParams.get('ascending') === 'true';
    
    // 构建查询
    let query = client
      .from('tools')
      .select('*, categories(name, slug)', { count: 'exact' });
    
    // 应用筛选
    if (category_id) {
      query = query.eq('category_id', parseInt(category_id));
    }
    if (free_type) {
      query = query.eq('free_type', free_type);
    }
    if (is_featured !== null) {
      query = query.eq('is_featured', is_featured === 'true');
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,producer.ilike.%${search}%,highlight.ilike.%${search}%`);
    }
    
    // 应用排序和分页
    query = query
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取失败' 
    }, { status: 500 });
  }
}

// 创建工具
export async function POST(request: NextRequest) {
  // 权限验证 - 需要 tools:create 权限
  const auth = await requirePermission(request, Permissions.TOOLS_CREATE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    // 输入安全检查
    if (body.name && (containsXss(body.name) || containsSqlInjection(body.name))) {
      return NextResponse.json({ 
        success: false, 
        error: '输入包含非法字符' 
      }, { status: 400 });
    }
    
    // 验证必填字段
    const requiredFields = ['name', 'logo', 'producer', 'highlight', 'category_id', 'free_type', 'max_duration', 'official_url', 'commercial_license'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `缺少必填字段: ${field}` 
        }, { status: 400 });
      }
    }
    
    const { data, error } = await client
      .from('tools')
      .insert({
        name: sanitizeInput(body.name),
        logo: body.logo,
        producer: sanitizeInput(body.producer),
        highlight: sanitizeInput(body.highlight),
        short_desc: body.short_desc,
        full_desc: body.full_desc,
        use_guide: body.use_guide,
        category_id: body.category_id,
        sub_category_ids: body.sub_category_ids || [],
        free_type: body.free_type,
        free_quota_desc: body.free_quota_desc,
        feature_tags: body.feature_tags || [],
        max_duration: body.max_duration,
        official_url: body.official_url,
        promotion_url: body.promotion_url,
        is_official: body.is_official || false,
        is_featured: body.is_featured || false,
        is_active: body.is_active !== false,
        advantages: body.advantages || [],
        limitations: body.limitations || [],
        commercial_license: body.commercial_license,
        launch_date: body.launch_date || new Date().toISOString(),
        scenes: body.scenes || [],
        functions: body.functions || [],
        faqs: body.faqs || [],
        customer_email: body.customer_email,
        feedback_link: body.feedback_link,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // 记录操作日志
    await logSuccess(auth.user!, 'CREATE', 'TOOL', data.id, data.name, { category_id: body.category_id }, request);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建工具失败:', error);
    await logFailure(auth.user, 'CREATE', 'TOOL', error instanceof Error ? error.message : '创建失败', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '创建失败' 
    }, { status: 500 });
  }
}

// 更新工具
export async function PUT(request: NextRequest) {
  // 权限验证 - 需要 tools:edit 权限
  const auth = await requirePermission(request, Permissions.TOOLS_EDIT);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少工具ID' 
      }, { status: 400 });
    }
    
    // 输入安全检查
    if (body.name && (containsXss(body.name) || containsSqlInjection(body.name))) {
      return NextResponse.json({ 
        success: false, 
        error: '输入包含非法字符' 
      }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    // 只更新提供的字段
    const updatableFields = [
      'name', 'logo', 'producer', 'highlight', 'short_desc', 'full_desc', 'use_guide',
      'category_id', 'sub_category_ids',
      'free_type', 'free_quota_desc', 'feature_tags', 'max_duration',
      'official_url', 'promotion_url', 'is_official', 'is_featured', 'is_active',
      'advantages', 'limitations', 'commercial_license', 'launch_date',
      'scenes', 'functions', 'faqs', 'customer_email', 'feedback_link'
    ];
    
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // 获取更新前的数据用于日志
    const { data: oldData } = await client
      .from('tools')
      .select('name')
      .eq('id', body.id)
      .single();
    
    const { data, error } = await client
      .from('tools')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // 记录操作日志
    await logSuccess(auth.user!, 'UPDATE', 'TOOL', data.id, oldData?.name || data.name, { changes: Object.keys(updateData) }, request);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新工具失败:', error);
    await logFailure(auth.user, 'UPDATE', 'TOOL', error instanceof Error ? error.message : '更新失败', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '更新失败' 
    }, { status: 500 });
  }
}

// 删除工具
export async function DELETE(request: NextRequest) {
  // 权限验证 - 需要 tools:delete 权限
  const auth = await requirePermission(request, Permissions.TOOLS_DELETE);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }
  
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少工具ID' 
      }, { status: 400 });
    }
    
    // 获取删除前的数据用于日志
    const { data: toolData } = await client
      .from('tools')
      .select('name')
      .eq('id', parseInt(id))
      .single();
    
    const { error } = await client
      .from('tools')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) throw new Error(error.message);
    
    // 记录操作日志
    await logSuccess(auth.user!, 'DELETE', 'TOOL', parseInt(id), toolData?.name || 'Unknown', {}, request);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除工具失败:', error);
    await logFailure(auth.user, 'DELETE', 'TOOL', error instanceof Error ? error.message : '删除失败', request);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '删除失败' 
    }, { status: 500 });
  }
}
