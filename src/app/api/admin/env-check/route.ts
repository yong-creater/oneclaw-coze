import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // 验证管理员身份
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  // 检查4sAPI密钥是否存在（不暴露实际值）
  const keys = [
    'FOURS_API_KEY',
    'OPENAI_API_KEY', 
    'API4S_KEY',
    'API4S_TOKEN',
    'FOUR_S_API_KEY'
  ];
  
  const configured = keys.filter(key => !!process.env[key]);
  
  return NextResponse.json({
    fourSapiConfigured: configured.length > 0,
    configuredKeys: configured,
    env: process.env.NODE_ENV,
  });
}
