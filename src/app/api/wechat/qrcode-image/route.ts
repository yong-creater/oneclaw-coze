import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

// 禁用 ISR 缓存
export const dynamic = 'force-dynamic';

// 文件在对象存储中的 key
const QR_S3KEY = 'wechat/qrcode_ce8e4852.jpg';

let uploadPromise: Promise<string | null> | null = null;

/**
 * 确保当前环境的对象存储中有二维码文件
 * 如果不存在，从本地 public 目录上传一份
 */
async function ensureQrCodeUploaded(): Promise<string | null> {
  if (uploadPromise) return uploadPromise;

  uploadPromise = (async () => {
    try {
      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: '',
        secretKey: '',
        bucketName: process.env.COZE_BUCKET_NAME,
        region: 'cn-beijing',
      });

      // 检查文件是否已存在
      const exists = await storage.fileExists({ fileKey: QR_S3KEY });
      if (exists) return QR_S3KEY;

      // 不存在，从本地 public 目录上传
      const localPath = join(process.cwd(), 'public', 'wechat-qrcode.jpg');
      const fileBuffer = await readFile(localPath);
      const uploadedKey = await storage.uploadFile({
        fileContent: fileBuffer,
        fileName: QR_S3KEY,
        contentType: 'image/jpeg',
      });
      console.log('[qrcode-image] Uploaded to:', uploadedKey);
      return uploadedKey;
    } catch (err) {
      console.error('[qrcode-image] Upload failed:', err);
      return null;
    }
  })();

  return uploadPromise;
}

/**
 * GET /api/wechat/qrcode-image
 * 直接返回微信公众号二维码图片（二进制），前端可作为 <img src> 使用
 * 
 * 工作流程：
 * 1. 确保当前环境的对象存储中有二维码文件（自动上传）
 * 2. 从对象存储读取并返回图片二进制
 * 3. 若失败，302 重定向到静态文件兜底
 */
export async function GET() {
  try {
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 确保文件已上传到当前环境
    const fileKey = await ensureQrCodeUploaded();

    if (fileKey) {
      const imageBuffer = await storage.readFile({ fileKey });
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }
  } catch (err) {
    console.error('[qrcode-image] Read failed:', err);
  }

  // Fallback: 302 重定向到静态文件
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}`
    : 'http://localhost:5000';
  return NextResponse.redirect(new URL('/wechat-qrcode.jpg', baseUrl));
}
