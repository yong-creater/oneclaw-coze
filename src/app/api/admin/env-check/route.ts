import { NextResponse } from 'next/server';

export async function GET() {
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
