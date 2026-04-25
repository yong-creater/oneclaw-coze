import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import crypto from 'crypto';

// 生成 API Key
function generateApiKey(): string {
  return 'sk-' + crypto.randomBytes(24).toString('hex');
}

// 验证 API Key
export async function verifyApiKey(request: NextRequest): Promise<{ valid: boolean; keyId?: number; error?: string }> {
  try {
    const body = await request.clone().json();
    const apiKey = body.api_key;

    if (!apiKey) {
      return { valid: false, error: '缺少 API Key' };
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('api_keys')
      .select('id, is_active, created_at')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: '无效的 API Key' };
    }

    return { valid: true, keyId: data.id };
  } catch (error) {
    console.error('API Key 验证失败:', error);
    return { valid: false, error: '验证失败' };
  }
}

// 记录 API 调用日志
export async function logApiCall(keyId: number, endpoint: string, status: string, recordsImported: number) {
  try {
    const client = getSupabaseClient();
    await client.from('api_call_logs').insert({
      api_key_id: keyId,
      endpoint,
      status,
      records_imported: recordsImported,
      called_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('记录 API 调用日志失败:', error);
  }
}

// 获取工具列表
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '外部导入API服务正常',
    endpoints: [
      { path: '/api/external/tools', method: 'POST', description: 'AI应用导入' },
      { path: '/api/external/prompts', method: 'POST', description: '提示词导入' },
      { path: '/api/external/tutorials', method: 'POST', description: '教程导入' },
      { path: '/api/external/skills', method: 'POST', description: '技能导入' },
    ],
  });
}
