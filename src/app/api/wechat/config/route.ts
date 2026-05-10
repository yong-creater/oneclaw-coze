import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// 禁用 ISR 缓存，确保每次请求都获取最新配置
export const dynamic = 'force-dynamic';

/**
 * GET /api/wechat/config
 * 获取微信公众号公开配置（仅二维码URL，不暴露敏感信息）
 * 
 * qr_code_url 支持三种格式：
 * 1. s3key:xxx → 对象存储 key，动态生成签名 URL（推荐，永不过期）
 * 2. https://... → 直接使用的外部 URL（非 showqrcode 临时 ticket）
 * 3. 其他 → fallback 到静态文件 /wechat-qrcode.jpg
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

      // 对象存储 key：动态生成签名 URL
      if (url.startsWith('s3key:')) {
        const fileKey = url.slice(6);
        try {
          const storage = new S3Storage({
            endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
            accessKey: '',
            secretKey: '',
            bucketName: process.env.COZE_BUCKET_NAME,
            region: 'cn-beijing',
          });
          const signedUrl = await storage.generatePresignedUrl({
            key: fileKey,
            expireTime: 86400, // 1 天有效期，前端会缓存
          });
          return NextResponse.json({
            success: true,
            qrCodeUrl: signedUrl,
          });
        } catch {
          // 签名失败，fallback 到静态文件
          return NextResponse.json({
            success: true,
            qrCodeUrl: '/wechat-qrcode.jpg',
          });
        }
      }

      // 微信 showqrcode 的 ticket 是临时性的，已过期则不使用
      if (url.includes('showqrcode')) {
        return NextResponse.json({
          success: true,
          qrCodeUrl: '/wechat-qrcode.jpg',
        });
      }

      // 其他有效 URL 直接使用
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
