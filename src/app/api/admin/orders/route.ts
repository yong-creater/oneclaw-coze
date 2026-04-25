import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 获取订单列表
export async function GET(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = client
      .from('orders')
      .select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
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
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { user_id, product_type, amount } = body;

    if (!user_id || !product_type || !amount) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 生成订单号
    const orderNo = `OC${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await client
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id,
        product_type,
        amount,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 更新订单状态
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { order_no, status, payment_method } = body;

    if (!order_no || !status) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
      updateData.payment_method = payment_method || 'unknown';
    }

    const { data, error } = await client
      .from('orders')
      .update(updateData)
      .eq('order_no', order_no)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
