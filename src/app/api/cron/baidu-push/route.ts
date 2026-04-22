import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 百度主动推送
async function pushToBaidu(urls: string[]): Promise<{ success: boolean; message: string; data?: any }> {
  const apiUrl = process.env.BAIDU_PUSH_API_URL;
  
  if (!apiUrl) {
    return { success: false, message: '百度推送 API 未配置' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: urls.join('\n'),
    });
    
    const result = await response.json();
    
    if (result.success === 1 || result.success === 0) {
      return {
        success: true,
        message: '推送成功',
        data: {
          success_count: result.success || 0,
          remain: result.remain || 0,
        }
      };
    }
    
    return { success: false, message: result.message || '推送失败' };
  } catch (error) {
    return { success: false, message: '推送请求失败' };
  }
}

// 获取需要推送的 URL 列表
async function getPushUrls(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oneclaw.shop';
  const urls: string[] = [];

  // 静态页面
  const staticPages = [
    '/',
    '/prompts',
    '/tutorials',
    '/sbti',
    '/novel',
  ];

  staticPages.forEach(page => {
    urls.push(`${baseUrl}${page}`);
  });

  // 从数据库获取工具页面
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey && !supabaseKey.includes('your-')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: tools } = await supabase
        .from('tools')
        .select('id')
        .eq('is_active', true)
        .order('id', { ascending: true })
        .limit(50); // 每次最多推送50个

      if (tools) {
        tools.forEach(tool => {
          urls.push(`${baseUrl}/tools/${tool.id}`);
        });
      }
    }
  } catch (error) {
    console.error('获取工具列表失败:', error);
  }

  return urls;
}

// 定时推送 API（供 cron 服务调用）
export async function POST(request: Request) {
  try {
    // 验证请求来源（可选：添加密钥验证）
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // 如果配置了密钥，则验证
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
    }

    console.log('[定时推送] 开始推送任务...');
    
    // 获取要推送的 URL
    const urls = await getPushUrls();
    console.log(`[定时推送] 待推送 URL 数量: ${urls.length}`);
    
    // 推送到百度
    const result = await pushToBaidu(urls);
    
    console.log(`[定时推送] 结果:`, result);
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        total_urls: urls.length,
        ...result.data,
      }
    });

  } catch (error) {
    console.error('[定时推送] 任务失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '定时推送任务失败' 
    }, { status: 500 });
  }
}

// 获取推送状态
export async function GET() {
  return NextResponse.json({
    message: '百度定时推送 API',
    usage: '使用 POST 方法触发推送，可选 Authorization: Bearer <CRON_SECRET>',
    example: 'curl -X POST -H "Authorization: Bearer your-secret" https://yourdomain.com/api/cron/baidu-push'
  });
}
