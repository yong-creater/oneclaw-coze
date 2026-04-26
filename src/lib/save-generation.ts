import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// 获取用户ID的辅助函数
export function getUserId(request: NextRequest): string | null {
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

// 保存生成记录的辅助函数（异步，不影响主流程）
export async function saveGeneration(
  request: NextRequest,
  params: {
    tool_id: number;
    tool_name: string;
    tool_type: string;
    input_params: any;
    output_content: any;
    title?: string;
    thumbnail?: string;
    usage_type?: string;
  }
): Promise<void> {
  const userId = getUserId(request);
  if (!userId || !supabaseUrl || !supabaseKey) {
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase
      .from('user_generations')
      .insert({
        user_id: userId,
        tool_id: params.tool_id,
        tool_name: params.tool_name,
        tool_type: params.tool_type,
        input_params: params.input_params ? JSON.stringify(params.input_params) : null,
        output_content: params.output_content ? JSON.stringify(params.output_content) : null,
        title: params.title,
        thumbnail: params.thumbnail,
        usage_type: params.usage_type,
      });
  } catch (error) {
    console.error('Failed to save generation:', error);
  }
}
