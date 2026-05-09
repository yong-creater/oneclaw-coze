import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/wechat/config
 * 获取微信公众号公开配置（仅二维码URL，不暴露敏感信息）
 * 
 * 优先级：
 * 1. 数据库中配置的 qr_code_url（必须是有效的图片URL，非微信临时ticket）
 * 2. /wechat-qrcode.jpg 静态文件作为 fallback
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('wechat_config')
      .select('qr_code_url')
      .limit(1)
      .single();

    if (!error && data?.qr_code_url) {
      const url = data.qr_code_url;
      
      // 微信 showqrcode 的 ticket 是临时性的，已过期则不使用
      // 只使用非微信临时ticket的URL（如对象存储的永久图片URL）
      if (url.includes('showqrcode')) {
        // 微信临时ticket已过期，fallback 到静态文件
        return NextResponse.json({
          success: true,
          qrCodeUrl: '/wechat-qrcode.jpg',
        });
      }

      return NextResponse.json({
        success: true,
        qrCodeUrl: url,
      });
    }

    return NextResponse.json({
      success: true,
      qrCodeUrl: '/wechat-qrcode.jpg',
    });
  } catch {
    return NextResponse.json({
      success: true,
      qrCodeUrl: '/wechat-qrcode.jpg',
    });
  }
}
