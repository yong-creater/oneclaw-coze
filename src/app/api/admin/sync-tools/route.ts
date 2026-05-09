import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { syncUtilityTools, UTILITY_TOOLS } from '../init-data/route';

// POST - 同步工具到数据库
export async function POST(request: NextRequest) {
  // 验证管理员身份
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    // 获取管理员 Supabase 客户端（简化版本，使用环境变量）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      // 使用 Mock 客户端（开发环境）
      return NextResponse.json({
        success: true,
        message: '开发环境：工具同步已记录',
        data: {
          tools: UTILITY_TOOLS,
        },
        note: '请在部署后调用 /api/admin/init-data 来初始化数据'
      });
    }

    // 导入 supabase-js
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result = await syncUtilityTools(supabase);

    return NextResponse.json({
      success: true,
      message: '工具同步完成',
      data: {
        ...result,
        tools: UTILITY_TOOLS,
      }
    });
  } catch (error: any) {
    console.error('工具同步失败:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '同步失败'
    }, { status: 500 });
  }
}

// GET - 获取工具列表（配置文件中的定义）
export async function GET() {
  return NextResponse.json({
    success: true,
    data: UTILITY_TOOLS,
    total: UTILITY_TOOLS.length,
  });
}
