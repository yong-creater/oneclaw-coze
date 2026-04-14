import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// 延迟初始化 Supabase 客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 获取定时任务配置
export async function GET() {
  try {
    // 验证登录状态
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: '认证失败' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('ranking_configs')
      .select('*')
      .eq('config_key', 'scheduler')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('获取配置失败:', error);
      return NextResponse.json({ success: false, error: '获取配置失败' }, { status: 500 });
    }

    const defaultConfig = {
      auto_update_enabled: false,
      update_schedule: 'daily',
      update_time: '02:00',
      last_update: null as string | null,
    };

    if (data?.config_value) {
      return NextResponse.json({
        success: true,
        data: {
          ...defaultConfig,
          ...data.config_value,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: defaultConfig,
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// 保存定时任务配置
export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { auto_update_enabled, update_schedule, update_time } = body;

    if (!['daily', 'weekly', 'monthly'].includes(update_schedule)) {
      return NextResponse.json({ 
        success: false, 
        error: '更新频率必须是 daily、weekly 或 monthly' 
      }, { status: 400 });
    }

    if (!/^\d{2}:\d{2}$/.test(update_time)) {
      return NextResponse.json({ 
        success: false, 
        error: '时间格式错误，应为 HH:mm' 
      }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('ranking_configs')
      .upsert({
        config_key: 'scheduler',
        config_value: { auto_update_enabled: Boolean(auto_update_enabled), update_schedule, update_time },
        description: '榜单定时更新配置',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'config_key',
      });

    if (error) {
      console.error('保存配置失败:', error);
      return NextResponse.json({ success: false, error: '保存配置失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '配置保存成功' });
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
